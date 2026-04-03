const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test JWT functionality
console.log('🔍 Testing JWT configuration...');
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
console.log(`JWT Secret configured: ${jwtSecret !== 'fallback-secret' ? '✅' : '⚠️ Using fallback'}`);

try {
  const testToken = jwt.sign({ test: 'data', id: '507f1f77bcf86cd799439011' }, jwtSecret, { expiresIn: '1h' });
  console.log('✅ JWT token generation: Working');

  const decoded = jwt.verify(testToken, jwtSecret);
  console.log('✅ JWT token verification: Working');
  console.log('✅ JWT system: Fully functional');
} catch (error) {
  console.log('❌ JWT system error:', error.message);
}

// Connect to MongoDB and test user lookup
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://raispandan444_db_user:****@cluster0.sam5twk.mongodb.net/TravelApp';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ MongoDB connection: Working');

    const User = require('./models/User');

    // Get email from command line
    const email = process.argv[2];
    if (!email) {
      console.log('❌ No email provided. Usage: node test-login.js <email>');
      mongoose.connection.close();
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      mongoose.connection.close();
      return;
    }

    console.log(`✅ User found: ${user.username} (${user.email})`);
    console.log(`Role: ${user.role}`);
    console.log(`Email Verified: ${user.isEmailVerified}`);
    console.log(`Account Active: ${user.isActive}`);
    console.log(`Has Password: ${!!user.password}`);

    // Test OTP generation
    const otp = user.generateLoginOTP();
    console.log(`✅ OTP generation: ${otp} (check console logs)`);

    // Test OTP verification
    const isValid = user.verifyLoginOTP(otp);
    console.log(`✅ OTP verification: ${isValid ? 'Working' : 'Failed'}`);

    mongoose.connection.close();
  })
  .catch(err => {
    console.log('❌ MongoDB connection failed:', err.message);
  });







