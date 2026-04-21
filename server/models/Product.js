const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true,
    enum: ['Electronics', 'Mobiles', 'Vehicles', 'Furniture', 'Fashion', 'Books', 'Home & Garden', 'Sports', 'Other'] 
  },
  images: [{ type: String }],
  imageUrl: { type: String },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'sold', 'removed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);