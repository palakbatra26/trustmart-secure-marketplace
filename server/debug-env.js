const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load .env
const result = dotenv.config();
if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
}

const uri = process.env.MONGODB_URI;
console.log('--- Environment Check ---');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', uri ? (uri.substring(0, 20) + '...') : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'PRESENT' : 'MISSING');
console.log('-------------------------');

if (!uri) {
  console.error('❌ MONGODB_URI is missing from .env!');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('🚀 SUCCESS: Connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILURE: Could not connect to MongoDB');
    console.error('Error Details:', err.message);
    process.exit(1);
  });
