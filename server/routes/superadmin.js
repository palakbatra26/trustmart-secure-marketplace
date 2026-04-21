const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

router.post('/make-admin', async (req, res) => {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@trustmarket.com' });
    
    if (existingAdmin) {
      // Just make sure isAdmin is true
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        existingAdmin.trustScore = 100;
        existingAdmin.reportCount = 0;
        await existingAdmin.save();
      }
      return res.json({ 
        message: 'Admin already exists',
        email: 'admin@trustmarket.com',
        password: 'admin123'
      });
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@trustmarket.com',
      password: 'admin123',
      isAdmin: true,
      trustScore: 100,
      reportCount: 0
    });

    const token = generateToken(admin._id);

    res.json({ 
      message: 'Admin created successfully',
      token,
      email: 'admin@trustmarket.com',
      password: 'admin123'
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;