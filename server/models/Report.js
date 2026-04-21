const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  reason: { 
    type: String, 
    required: true,
    enum: ['fake_product', 'scam_attempt', 'other'] 
  },
  details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);