const express = require('express');
const router = express.Router();
const Movement = require('../models/Movement');
const { Op } = require('sequelize');

// Create a new movement
router.post('/', async (req, res) => {
  try {
    const { id, employeeName, employeeId, outTime, informTo, visitLocation, purpose, date } = req.body;
    const movement = await Movement.create({
      id,
      employeeName,
      employeeId,
      outTime,
      informTo,
      visitLocation,
      purpose,
      date
    });
    res.status(201).json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating movement' });
  }
});

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
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// Mark return
router.put('/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { returnTime } = req.body;
    
    const movement = await Movement.findByPk(id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });

    movement.returnTime = returnTime;
    await movement.save();
    
    res.json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating return time' });
  }
});

// Delete a record (Admin only)
router.delete('/:id', async (req, res) => {
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

module.exports = router;
