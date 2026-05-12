const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees (pass ?activeOnly=true to filter active only)
router.get('/', async (req, res) => {
  try {
    const where = req.query.activeOnly === 'true' ? { isActive: true } : {};
    const employees = await Employee.findAll({ where, order: [['name', 'ASC']] });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Add a new employee (Admin only)
router.post('/', async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) return res.status(400).json({ message: 'ID and Name are required' });

    const existing = await Employee.findByPk(id);
    if (existing) return res.status(409).json({ message: 'Employee ID already exists' });

    const employee = await Employee.create({ id, name, isActive: true });
    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding employee' });
  }
});

// Toggle Active / Inactive status (Admin only)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    employee.isActive = !employee.isActive;
    await employee.save();
    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating employee status' });
  }
});

// Delete an employee (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await employee.destroy();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

module.exports = router;
