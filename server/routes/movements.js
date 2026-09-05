const express = require('express');
const router = express.Router();
const Movement = require('../models/Movement');
const { Op } = require('sequelize');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { performAutoReturn } = require('../services/autoReturnService');

// Create a new movement
router.post('/', async (req, res) => {
  try {
    const { id, employeeName, employeeId, outTime, informTo, visitLocation, purpose, date, employeeDepartment } = req.body;

    // Check if employee already has an active movement
    const activeMovement = await Movement.findOne({
      where: {
        employeeName,
        returnTime: null
      }
    });

    if (activeMovement) {
      return res.status(400).json({ message: 'Employee is already out. Please return first or add a new location to the current trip.' });
    }

    // Use client-provided timeline (multi-select) or build a single-entry one
    const timeline = req.body.timeline && Array.isArray(req.body.timeline) && req.body.timeline.length > 0
      ? req.body.timeline
      : [{ location: visitLocation, purpose: purpose, timestamp: outTime }];

    const initialTimeline = timeline;

    const movement = await Movement.create({
      id,
      employeeName,
      employeeId,
      outTime,
      informTo,
      visitLocation,
      purpose,
      date,
      employeeDepartment,
      timeline: initialTimeline
    });
    res.status(201).json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating movement' });
  }
});

// Helper function to ensure timeline is always a valid parsed array
const normalizeTimeline = (record) => {
  let timeline = record.timeline;
  if (typeof timeline === 'string') {
    try {
      timeline = JSON.parse(timeline);
    } catch (e) {
      timeline = null;
    }
  }

  if (Array.isArray(timeline) && timeline.length > 0) {
    return timeline;
  }

  // Fallback: Reconstruct timeline from concatenated fields if timeline is missing
  if (record.visitLocation) {
    const locations = record.visitLocation.split('->').map(s => s.trim());
    const purposes = record.purpose ? record.purpose.split('|').map(s => s.trim()) : [];
    return locations.map((loc, idx) => ({
      location: loc,
      purpose: purposes[idx] || record.purpose || '',
      timestamp: record.outTime
    }));
  }

  return [];
};

// Get all records (History)
router.get('/', async (req, res) => {
  try {
    const { role, username } = req.query;
    let filter = {};

    if (role === 'employee') {
      filter.employeeName = username;
    }

    const records = await Movement.findAll({
      where: filter,
      order: [['outTime', 'DESC']]
    });

    const formattedRecords = records.map(record => {
      const data = record.toJSON();
      return {
        ...data,
        timeline: normalizeTimeline(data)
      };
    });

    res.json(formattedRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// Mark return
router.put('/:id/return', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'DUTY_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { returnTime } = req.body;

    const movement = await Movement.findByPk(id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    movement.returnTime = returnTime;
    movement.returnedBy = req.user.role; // 'ADMIN', 'SUPER_ADMIN', or 'DUTY_ADMIN'
    await movement.save();

    res.json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating return time' });
  }
});

// Trigger manual auto-return sweep (Admins & Duty Admins)
router.post('/trigger-auto-return', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'DUTY_ADMIN'), async (req, res) => {
  try {
    const result = await performAutoReturn();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error running auto-return process' });
  }
});

// Add new location to existing movement (public — any user can add to their active trip)
router.put('/:id/add-location', async (req, res) => {
  try {
    const { id } = req.params;
    const { newLocation, newPurpose } = req.body;

    const movement = await Movement.findByPk(id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    if (movement.returnTime) {
      return res.status(400).json({ message: 'Cannot add location to a returned movement' });
    }

    const currentLocationsCount = movement.visitLocation ? movement.visitLocation.split('->').length : 1;
    if (currentLocationsCount >= 5) {
      return res.status(400).json({ message: 'Cannot add more than 5 locations.' });
    }

    // Safely parse timeline if it's a string from the database
    let parsedTimeline = movement.timeline;
    if (typeof parsedTimeline === 'string') {
      try {
        parsedTimeline = JSON.parse(parsedTimeline);
      } catch (e) {
        parsedTimeline = null;
      }
    }

    // Ensure it's an array, otherwise fall back to creating a new one
    const currentTimeline = Array.isArray(parsedTimeline) ? parsedTimeline : [{
      location: movement.visitLocation,
      purpose: movement.purpose,
      timestamp: movement.outTime
    }];

    const newTimeline = [...currentTimeline, {
      location: newLocation,
      purpose: newPurpose,
      timestamp: new Date().toISOString()
    }];

    movement.timeline = newTimeline;
    movement.changed('timeline', true);
    movement.visitLocation = movement.visitLocation ? `${movement.visitLocation} -> ${newLocation}` : newLocation;
    movement.purpose = movement.purpose ? `${movement.purpose} | ${newPurpose}` : newPurpose;

    await movement.save();

    res.json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding new location' });
  }
});

// Edit an existing movement record (Super Admin & Admin)
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, informTo, visitLocation, purpose, timeline } = req.body;

    const movement = await Movement.findByPk(id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    if (employeeName) movement.employeeName = employeeName;
    if (informTo) movement.informTo = informTo;

    if (timeline && Array.isArray(timeline) && timeline.length > 0) {
      movement.timeline = timeline;
      movement.changed('timeline', true);
      movement.visitLocation = timeline.map(t => t.location).filter(Boolean).join(' -> ');
      movement.purpose = timeline.map(t => t.purpose).filter(Boolean).join(' | ');
    } else {
      if (visitLocation !== undefined) movement.visitLocation = visitLocation;
      if (purpose !== undefined) movement.purpose = purpose;
    }

    await movement.save();

    const formattedData = {
      ...movement.toJSON(),
      timeline: normalizeTimeline(movement.toJSON())
    };

    res.json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating movement' });
  }
});

// Delete a record (Super Admin only)
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await Movement.findByPk(id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    await movement.destroy();
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting record' });
  }
});

// Get TAT (Total Time Employee Outside) Statistics
router.get('/stats/tat', async (req, res) => {
  try {
    const { employeeName, startDate, endDate } = req.query;
    let filter = {};

    if (employeeName) {
      filter.employeeName = { [Op.like]: `%${employeeName}%` };
    }

    if (startDate && endDate) {
      filter.outTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const movements = await Movement.findAll({
      where: filter,
      order: [['outTime', 'DESC']]
    });

    // Group by employee and calculate stats
    const employeeStats = {};

    movements.forEach(movement => {
      if (!employeeStats[movement.employeeName]) {
        employeeStats[movement.employeeName] = {
          employeeName: movement.employeeName,
          employeeId: movement.employeeId,
          totalTrips: 0,
          totalMinutes: 0,
          records: []
        };
      }

      if (movement.returnTime) {
        const duration = new Date(movement.returnTime) - new Date(movement.outTime);
        const minutes = Math.floor(duration / 60000);
        employeeStats[movement.employeeName].totalMinutes += minutes;
        employeeStats[movement.employeeName].totalTrips += 1;
        employeeStats[movement.employeeName].records.push({
          ...movement.dataValues,
          durationMinutes: minutes
        });
      }
    });

    // Format stats and calculate averages
    const stats = Object.values(employeeStats).map(emp => {
      const hours = Math.floor(emp.totalMinutes / 60);
      const minutes = emp.totalMinutes % 60;
      const avgMinutes = emp.totalTrips > 0 ? Math.floor(emp.totalMinutes / emp.totalTrips) : 0;
      const avgHours = Math.floor(avgMinutes / 60);
      const avgMins = avgMinutes % 60;

      return {
        employeeName: emp.employeeName,
        employeeId: emp.employeeId,
        totalTrips: emp.totalTrips,
        totalTime: `${hours}h ${minutes}m`,
        totalMinutes: emp.totalMinutes,
        averageTime: `${avgHours}h ${avgMins}m`,
        averageMinutes: avgMinutes,
        records: emp.records
      };
    });

    // Calculate overall stats
    const totalEmployees = stats.length;
    const totalTrips = stats.reduce((sum, emp) => sum + emp.totalTrips, 0);
    const totalMinutes = stats.reduce((sum, emp) => sum + emp.totalMinutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;
    const avgMinutesPerEmployee = totalEmployees > 0 ? Math.floor(totalMinutes / totalEmployees) : 0;
    const avgHours = Math.floor(avgMinutesPerEmployee / 60);
    const avgMins = avgMinutesPerEmployee % 60;

    res.json({
      summary: {
        totalEmployees,
        totalTrips,
        totalTime: `${totalHours}h ${totalMins}m`,
        averageTimePerEmployee: `${avgHours}h ${avgMins}m`
      },
      data: stats.sort((a, b) => b.totalMinutes - a.totalMinutes)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching TAT statistics' });
  }
});

module.exports = router;
