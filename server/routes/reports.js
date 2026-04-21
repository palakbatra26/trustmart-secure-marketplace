const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { reportedUser, reportedProduct, reason, details } = req.body;
    if (!reason || (!reportedUser && !reportedProduct)) {
      return res.status(400).json({ message: 'Please provide reason and user/product' });
    }
    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      reportedProduct,
      reason,
      details
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, admin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name')
      .populate('reportedUser', 'name email')
      .populate('reportedProduct', 'title')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    if (status === 'approved' && report.reportedUser) {
      const user = await User.findById(report.reportedUser);
      if (user) {
        user.trustScore = Math.max(0, user.trustScore - 15);
        user.reportCount += 1;
        await user.save();
      }
      if (report.reportedProduct) {
        await Product.findByIdAndUpdate(report.reportedProduct, { status: 'removed' });
      }
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;