const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const { protect, admin, generateToken } = require('../middleware/auth');

router.post('/make-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@trustmarket.com' });
    
    if (existingAdmin) {
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

    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@trustmarket.com',
      password: 'admin123',
      isAdmin: true,
      trustScore: 100,
      reportCount: 0
    });

    const token = generateToken(adminUser._id);

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

// GET all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all products
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all reports
router.get('/reports', protect, admin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name')
      .populate('reportedUserId', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE user
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ message: 'Cannot delete admin' });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User permanently expunged' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;