const mongoose = require('mongoose');
require('dotenv').config();

async function debug() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travel-app');
  
  const Guide = require('./models/Guide');
  const User = require('./models/User');

  const allGuides = await Guide.find({}).lean();
  console.log('\n=== ALL GUIDE DOCS ===');
  console.log(JSON.stringify(allGuides, null, 2));

  const allGuideUsers = await User.find({ role: 'guide' }).lean();
  console.log('\n=== ALL USERS WITH role:guide ===');
  console.log(JSON.stringify(allGuideUsers.map(u => ({
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    status: u.status,
    isActive: u.isActive,
    guideProfile: u.guideProfile,
  })), null, 2));

  await mongoose.disconnect();
}
debug().catch(console.error);