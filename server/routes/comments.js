const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', async (req, res) => {
  try {
    const comments = await Comment.find({ product: req.params.productId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { productId, content } = req.body;
    if (!productId || !content) {
      return res.status(400).json({ message: 'Please provide product and content' });
    }
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ message: 'Product not found' });
    }
    const comment = await Comment.create({
      product: productId,
      user: req.user._id,
      content
    });
    await comment.populate('user', 'name profileImage');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;