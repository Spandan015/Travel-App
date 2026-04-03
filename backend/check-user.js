const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://raispandan444_db_user:****@cluster0.sam5twk.mongodb.net/TravelApp';

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./models/User');

async function checkUser(email) {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('📊 User Status for:', email);
    console.log('='.repeat(50));
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`isActive: ${user.isActive}`);
    console.log(`isEmailVerified: ${user.isEmailVerified}`);
    console.log(`Has Password: ${!!user.password}`);
    console.log(`Login OTP: ${user.loginOTP || 'None'}`);
    console.log(`Login OTP Expires: ${user.loginOTPExpires || 'None'}`);
    console.log(`OTP Attempts: ${user.otpAttempts || 0}`);
    console.log(`OTP Blocked Until: ${user.otpBlockedUntil || 'Not blocked'}`);
    console.log('='.repeat(50));

    if (user.loginOTP) {
      const now = new Date();
      const expired = user.loginOTPExpires < now;
      console.log(`OTP Status: ${expired ? '❌ EXPIRED' : '✅ VALID'}`);
      if (!expired) {
        console.log(`Time remaining: ${Math.round((user.loginOTPExpires - now) / 1000 / 60)} minutes`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node check-user.js <email>');
  process.exit(1);
}

checkUser(email);







