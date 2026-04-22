const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get reviews for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update a review
router.post('/', protect, async (req, res) => {
  try {
    const { sellerId, rating, feedback } = req.body;
    
    if (sellerId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const review = await Review.findOneAndUpdate(
      { seller: sellerId, reviewer: req.user._id },
      { rating, feedback },
      { upsert: true, new: true }
    );

    // Update seller trust score (simplified logic)
    // In a real app, this would be more complex
    const allReviews = await Review.find({ seller: sellerId });
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    // Calculate trust score: start at 50, +5 for each star above 3, -10 for each star below 3
    // Capped at 0-100
    let trustScore = 50 + (avgRating - 3) * 10;
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));

    await User.findByIdAndUpdate(sellerId, { trustScore });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
