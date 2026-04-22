const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://palakbatra79_db_user:TrustMarket@cluster0.47t6fhh.mongodb.net/trustmarket';

async function reset() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    const email = 'admin@trustmarket.com';
    const password = 'admin123';
    const name = 'TrustMarket Admin';

    // We don't need to manually hash here if the User model has a pre-save hook, 
    // but the User model's pre-save hook only runs on .save(). 
    // findOneAndUpdate might bypass it depending on how it's set up.
    // However, User.js line 17 has a pre('save') hook.
    
    // To be safe and consistent with the other project, I'll just use a find and save.
    let admin = await User.findOne({ email });
    if (!admin) {
      admin = new User({
        email,
        name,
        password,
        isAdmin: true,
        trustScore: 100
      });
    } else {
      admin.name = name;
      admin.password = password;
      admin.isAdmin = true;
      admin.trustScore = 100;
    }

    await admin.save();

    console.log('-----------------------------------------');
    console.log('Admin Reset Successful!');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
    console.log('-----------------------------------------');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reset();
