const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://raispandan444_db_user:****@cluster0.sam5twk.mongodb.net/TravelApp';

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fixUserAccount() {
  try {
    console.log('🔍 Enter the email of the account you want to fix:');
    process.stdout.write('Email: ');

    process.stdin.on('data', async (data) => {
      const email = data.toString().trim();

      console.log(`\n🔧 Fixing account for: ${email}`);

      // Find the user
      const user = await User.findOne({ email });

      if (!user) {
        console.log('❌ User not found!');
        process.exit(1);
      }

      console.log('📊 Current user status:');
      console.log(`  - Username: ${user.username}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - isActive: ${user.isActive}`);
      console.log(`  - isEmailVerified: ${user.isEmailVerified}`);
      console.log(`  - Has Password: ${!!user.password}`);

      // Fix the account
      user.isEmailVerified = true;
      user.isActive = true;

      // Set a default password if none exists
      if (!user.password) {
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        user.password = hashedPassword;
        console.log(`🔑 Set default password: ${defaultPassword}`);
      }

      await user.save();

      console.log('✅ Account fixed successfully!');
      console.log('📧 Email verification: ✅ Enabled');
      console.log('🔓 Account active: ✅ Enabled');
      console.log('🔑 Password: ✅ Set');

      console.log('\n🚀 You can now login with:');
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${user.password ? 'password123 (default)' : 'your existing password'}`);
      console.log(`  OTP: Will work for any login method`);

      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error fixing account:', error);
    process.exit(1);
  }
}

fixUserAccount();







