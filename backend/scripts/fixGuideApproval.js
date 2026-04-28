// backend/scripts/fixGuideApproval.js
// Run once with: node backend/scripts/fixGuideApproval.js
// This sets isApproved: true on all existing guide accounts
// that have role: 'guide' but missing guideProfile.isApproved

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Find all users with role guide
  const guides = await User.find({ role: 'guide' });
  console.log(`Found ${guides.length} guide(s)`);

  let fixed = 0;
  for (const g of guides) {
    let changed = false;

    if (!g.guideProfile) {
      g.guideProfile = {};
      changed = true;
    }
    if (g.guideProfile.isApproved !== true) {
      g.guideProfile.isApproved = true;
      changed = true;
    }
    if (g.guideProfile.availability === undefined) {
      g.guideProfile.availability = true;
      changed = true;
    }
    if (g.status !== 'active') {
      g.status = 'active';
      changed = true;
    }

    if (changed) {
      g.markModified('guideProfile');
      await g.save();
      fixed++;
      console.log(`✅ Fixed: ${g.email} (${g._id})`);
    } else {
      console.log(`⏭  OK:    ${g.email} (${g._id})`);
    }
  }

  console.log(`\nDone. Fixed ${fixed}/${guides.length} guide(s).`);
  await mongoose.disconnect();
}

fix().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
