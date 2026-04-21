const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      trustScore: user.trustScore,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Auto-create admin if using default credentials
    if (email === 'admin@trustmarket.com' && password === 'admin123') {
      let admin = await User.findOne({ email: 'admin@trustmarket.com' });
      if (!admin) {
        admin = await User.create({
          name: 'Admin',
          email: 'admin@trustmarket.com',
          password: 'admin123',
          isAdmin: true,
          trustScore: 100,
          reportCount: 0
        });
      } else if (!admin.isAdmin) {
        admin.isAdmin = true;
        admin.trustScore = 100;
        admin.reportCount = 0;
        await admin.save();
      }
      const token = generateToken(admin._id);
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        trustScore: admin.trustScore,
        isAdmin: admin.isAdmin,
        token
      });
    }
    
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        trustScore: user.trustScore,
        isAdmin: user.isAdmin,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;