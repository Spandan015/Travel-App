require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const TARGET_EMAIL = 'spndngg@gmail.com';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: TARGET_EMAIL });
  if (!user) { console.log('Not found'); mongoose.disconnect(); return; }

  const bcrypt = require('bcryptjs');
  user.password            = await bcrypt.hash('TempPass123', 12);
  user.mustChangePassword  = true;
  user.role                = 'guide';
  user.status              = 'active';
  if (!user.guideProfile) user.guideProfile = {};
  user.guideProfile.isApproved   = true;
  user.guideProfile.availability = true;
  user.markModified('guideProfile');
  await user.save();

  console.log('Done. Login with TempPass123');
  mongoose.disconnect();
});