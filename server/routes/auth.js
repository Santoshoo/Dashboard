const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const Admin = require('../models/Admin');
const DutyAssignment = require('../models/DutyAssignment');
const Employee = require('../models/Employee');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Login Route
router.post('/login', async (req, res) => {
  const { mode, identifier, password } = req.body;

  try {
    if (mode === 'admin') {
      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Employee ID and password are required' });
      }

      // Find admin by empId (case-insensitive search)
      const admin = await Admin.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('empId')),
          identifier.toLowerCase().trim()
        )
      });

      if (!admin) {
        // Check if employee is assigned as Duty Person for TODAY
        const todayStr = new Date().toISOString().slice(0, 10);
        const employee = await Employee.findOne({ where: { id: identifier.trim() } });

        if (employee) {
          const dutyAssignment = await DutyAssignment.findOne({
            where: { employeeId: identifier.trim(), dutyDate: todayStr, isActive: true }
          });

          if (dutyAssignment) {
            // If dutyAssignment has a password set, verify it
            if (dutyAssignment.password) {
              const isPasswordValid = bcrypt.compareSync(password, dutyAssignment.password);
              if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
              }
            }

            const now = new Date();
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            const secondsUntilMidnight = Math.max(Math.floor((endOfDay - now) / 1000), 3600);

            const token = jwt.sign(
              {
                id: employee.id,
                username: employee.name,
                empId: employee.id,
                employeeId: employee.id,
                role: 'DUTY_ADMIN',
                isDutyAdmin: true,
                dutyDate: todayStr,
                department: employee.department,
                location: dutyAssignment.location
              },
              process.env.JWT_SECRET,
              { expiresIn: `${secondsUntilMidnight}s` }
            );

            return res.json({
              success: true,
              token,
              user: {
                username: employee.name,
                empId: employee.id,
                employeeId: employee.id,
                role: 'DUTY_ADMIN',
                isDutyAdmin: true,
                dutyDate: todayStr,
                department: employee.department,
                location: dutyAssignment.location
              }
            });
          }
        }

        return res.status(401).json({ success: false, message: 'Invalid credentials or no active duty assignment for today' });
      }

      // Check password for registered Admin
      if (!bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          id: admin.id,
          username: `${admin.firstName} ${admin.lastName}`,
          empId: admin.empId,
          role: admin.role,
          location: admin.location || 'IT DATA CENTER'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        user: {
          username: `${admin.firstName} ${admin.lastName}`,
          empId: admin.empId,
          role: admin.role,
          location: admin.location || 'IT DATA CENTER'
        }
      });
    } else {
      // Employee login — check by Employee ID from the Employees table
      if (!identifier) {
        return res.status(400).json({ success: false, message: 'Employee ID is required' });
      }

      // Find employee in Employees table
      const employee = await Employee.findOne({ where: { id: identifier.trim() } });
      if (!employee) {
        return res.status(401).json({ success: false, message: 'Employee ID not found' });
      }

      // Check if this employee has a duty assignment for TODAY in their department
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const dutyAssignment = await DutyAssignment.findOne({
        where: { employeeId: identifier.trim(), dutyDate: todayStr, isActive: true, location: employee.department }
      });

      let role = 'employee';
      let tokenExpiry = '24h';
      let tokenPayload = {};

      if (dutyAssignment) {
        // Issue a DUTY_ADMIN token expiring at end of today (midnight)
        role = 'DUTY_ADMIN';
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const secondsUntilMidnight = Math.floor((endOfDay - now) / 1000);
        tokenExpiry = `${secondsUntilMidnight}s`;
        tokenPayload = {
          username: employee.name,
          employeeId: employee.id,
          role: 'DUTY_ADMIN',
          isDutyAdmin: true,
          dutyDate: todayStr,
          department: employee.department,
          location: dutyAssignment.location
        };
      } else {
        tokenPayload = {
          username: employee.name,
          employeeId: employee.id,
          role: 'employee',
          department: employee.department
        };
      }

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
      return res.json({
        success: true,
        token,
        user: {
          username: employee.name,
          employeeId: employee.id,
          role,
          isDutyAdmin: !!dutyAssignment,
          dutyDate: dutyAssignment ? todayStr : null,
          department: employee.department,
          location: dutyAssignment ? dutyAssignment.location : null
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset Password Route (Accessible pre-login or post-login)
router.post('/reset-password', async (req, res) => {
  const { empId, password, confirmPassword } = req.body;

  try {
    if (!empId || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Find admin (case-insensitive)
    const admin = await Admin.findOne({
      where: sequelize.where(
        sequelize.fn('lower', sequelize.col('empId')),
        empId.toLowerCase().trim()
      )
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account with this Employee ID not found' });
    }

    // Update password
    const hashedPassword = bcrypt.hashSync(password, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Management Routes (Only Super Admin can access)

// Get all admins (Super Admin only)
router.get('/admins', authenticate, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/create-admin', authenticate, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
  const { firstName, lastName, empId, password, confirmPassword, location } = req.body;

  try {
    if (!firstName || !lastName || !empId || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check if empId already exists (case-insensitive check)
    const existingAdmin = await Admin.findOne({
      where: sequelize.where(
        sequelize.fn('lower', sequelize.col('empId')),
        empId.toLowerCase().trim()
      )
    });

    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'Employee ID is already registered as an admin' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newAdmin = await Admin.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      empId: empId.trim(),
      password: hashedPassword,
      location: location || 'IT DATA CENTER',
      role: 'ADMIN' // Always normal admin when created through this route
    });

    // Don't return password
    const adminResponse = newAdmin.toJSON();
    delete adminResponse.password;

    res.status(201).json({ success: true, admin: adminResponse, message: 'Admin account created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update normal admin (Super Admin only)
router.put('/admins/:id', authenticate, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
  const { firstName, lastName, empId, location } = req.body;
  const { id } = req.params;

  try {
    if (!firstName || !lastName || !empId) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    // Check unique empId (excluding current admin)
    const existingAdmin = await Admin.findOne({
      where: sequelize.where(
        sequelize.fn('lower', sequelize.col('empId')),
        empId.toLowerCase().trim()
      )
    });

    if (existingAdmin && existingAdmin.id !== parseInt(id)) {
      return res.status(409).json({ success: false, message: 'Employee ID is already registered' });
    }

    admin.firstName = firstName.trim();
    admin.lastName = lastName.trim();
    admin.empId = empId.trim();
    if (location) {
      admin.location = location;
    }
    await admin.save();

    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.json({ success: true, admin: adminResponse, message: 'Admin account updated successfully' });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete normal admin (Super Admin only)
router.delete('/admins/:id', authenticate, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    // Prevent Super Admin from deleting themselves
    if (admin.empId.toLowerCase() === req.user.empId.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await admin.destroy();
    res.json({ success: true, message: 'Admin account deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

// ─── Duty Assignment Routes ───────────────────────────────────────────────────

// GET /api/auth/duty-today — Public: check active duty assignments for today (both locations)
router.get('/duty-today', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const duties = await DutyAssignment.findAll({
      where: { dutyDate: todayStr, isActive: true }
    });
    const result = {};
    duties.forEach(d => { result[d.location] = d.employeeName; });
    return res.json({
      success: true,
      hasDuty: duties.length > 0,
      duties: result // e.g. { 'IT DATA CENTER': 'Santosh', 'IT COMMAND CENTER': 'Rajesh' }
    });
  } catch (error) {
    console.error('Duty today check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/duty-assignments — Admin: list all duty assignments
router.get('/duty-assignments', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const assignments = await DutyAssignment.findAll({
      order: [['dutyDate', 'DESC']]
    });
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Fetch duty assignments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/duty-assignments — Admin: create a new duty assignment
router.post('/duty-assignments', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const { employeeId, employeeName, dutyDate, location, password } = req.body;
  try {
    if (!employeeId || !employeeName || !dutyDate || !location || !password) {
      return res.status(400).json({ success: false, message: 'Employee ID, name, duty date, location, and duty password are required' });
    }

    const validLocations = ['IT DATA CENTER', 'IT COMMAND CENTER'];
    if (!validLocations.includes(location)) {
      return res.status(400).json({ success: false, message: 'Invalid location. Must be IT DATA CENTER or IT COMMAND CENTER' });
    }

    // Prevent assigning past dates
    const today = new Date().toISOString().slice(0, 10);
    if (dutyDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot assign duty for a past date' });
    }

    // Enforce one duty person per location per day
    const existing = await DutyAssignment.findOne({ where: { dutyDate, location, isActive: true } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `${existing.employeeName} is already assigned as duty person for ${location} on ${dutyDate}. Please cancel that assignment first.`
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const assignedBy = req.user.username || req.user.empId || 'Admin';
    const assignment = await DutyAssignment.create({
      employeeId,
      employeeName,
      location,
      dutyDate,
      assignedBy,
      password: hashedPassword,
      isActive: true
    });

    res.status(201).json({ success: true, assignment, message: `${employeeName} assigned as holiday duty person for ${location} on ${dutyDate}` });
  } catch (error) {
    console.error('Create duty assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/auth/duty-assignments/:id — Admin: cancel a duty assignment
router.delete('/duty-assignments/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await DutyAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Duty assignment not found' });
    }

    // Prevent cancelling past/today assignments that have already been used
    const today = new Date().toISOString().slice(0, 10);
    if (assignment.dutyDate <= today) {
      return res.status(400).json({ success: false, message: 'Cannot cancel a duty assignment for today or a past date' });
    }

    await assignment.destroy();
    res.json({ success: true, message: `Duty assignment for ${assignment.employeeName} on ${assignment.dutyDate} has been cancelled` });
  } catch (error) {
    console.error('Delete duty assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
