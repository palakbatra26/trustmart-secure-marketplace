const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String }
}, { timestamps: true });

reviewSchema.index({ seller: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);