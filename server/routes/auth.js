const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Login Route
router.post('/login', async (req, res) => {
  const { mode, identifier, password } = req.body;

  try {
    if (mode === 'admin') {
      if (identifier.toLowerCase() === 'admin' && password === 'admin123') {
        const token = jwt.sign(
          { username: 'Admin', role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({ success: true, token, user: { username: 'Admin', role: 'admin' } });
      }
    } else {
      // Public Access - No ID check required
      const token = jwt.sign(
        { username: 'Public User', role: 'public' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ success: true, token, user: { username: 'Public User', role: 'public' } });
    }

    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
