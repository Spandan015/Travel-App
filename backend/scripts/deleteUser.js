require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const TARGET_EMAIL = 'spandann4@gmail.com';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await User.deleteOne({ email: TARGET_EMAIL });
  if (result.deletedCount === 0) {
    console.log('User not found');
  } else {
    console.log('Deleted:', TARGET_EMAIL);
  }
  mongoose.disconnect();
});