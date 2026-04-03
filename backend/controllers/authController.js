const User = require('../models/User');
const Guide = require('../models/Guide');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Support both export styles: { sendEmail } or { sendOTPEmail }
const emailUtils = require('../utils/emailService');
const sendMail = emailUtils.sendOTPEmail || emailUtils.sendEmail || emailUtils.default;

// ─── helpers ─────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.emailVerificationOTP;
  delete obj.emailVerificationOTPExpires;
  delete obj.loginOTP;
  delete obj.loginOTPExpires;
  delete obj.otpAttempts;
  delete obj.otpBlockedUntil;
  return obj;
}

async function sendOTP(email, otp, type) {
  if (typeof sendMail === 'function') {
    try {
      await sendMail(email, otp, type);
    } catch (e) {
      console.error('Email send error (non-fatal):', e.message);
      // In development, just log the OTP so you can still test
    }
  }
  // Always log OTP in dev so you can test even if email fails
  if (process.env.NODE_ENV !== 'production') {
    console.log('='.repeat(50));
    console.log(`OTP for ${email}: ${otp}  [${type}]`);
    console.log('='.repeat(50));
  }
}

// ─── USER REGISTRATION ────────────────────────────────────────────────────────

exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName?.trim() || !lastName?.trim())
      return res.status(400).json({ message: 'First and last name are required' });
    if (!email?.trim())
      return res.status(400).json({ message: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing?.isEmailVerified)
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });

    let user = existing;
    if (!user) {
      user = new User({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.toLowerCase().trim(),
        phone:     phone?.trim() || '',
        role:      'user',
        status:    'active',
        isActive:  true,
      });
    } else {
      user.firstName = firstName.trim();
      user.lastName  = lastName.trim();
      if (phone) user.phone = phone.trim();
    }

    if (user.isOTPBlocked()) {
      const mins = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${mins} minutes.` });
    }

    const otp = user.generateEmailVerificationOTP();
    await user.save();
    await sendOTP(email, otp, 'registration');

    return res.json({ success: true, message: 'OTP sent to your email. Please check your inbox.' });
  } catch (err) {
    console.error('sendRegistrationOTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password)
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ message: 'No registration found for this email.', error: 'USER_NOT_FOUND' });
    if (user.isEmailVerified)
      return res.status(400).json({ message: 'Account already verified. Please sign in.' });
    if (!user.emailVerificationOTP)
      return res.status(400).json({ message: 'No OTP requested. Please send OTP first.', error: 'NO_OTP_REQUESTED' });
    if (user.isOTPBlocked()) {
      const mins = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${mins} minutes.` });
    }

    const valid = user.verifyEmailOTP(otp);
    if (!valid) {
      await user.save();
      if (user.emailVerificationOTPExpires < new Date())
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const token = signToken(user);
    return res.status(201).json({ success: true, message: 'Account created successfully!', token, user: safeUser(user) });
  } catch (err) {
    console.error('verifyRegistrationOTP error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN REGISTRATION ───────────────────────────────────────────────────────

exports.sendAdminRegistrationOTP = async (req, res) => {
  try {
    const { firstName, lastName, email, adminSecretKey } = req.body;

    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY)
      return res.status(403).json({ message: 'Invalid admin secret key' });
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim())
      return res.status(400).json({ message: 'First name, last name, and email are required' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing?.isEmailVerified)
      return res.status(400).json({ message: 'An account with this email already exists.' });

    let admin = existing;
    if (!admin) {
      admin = new User({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.toLowerCase().trim(),
        role:      'admin',
        status:    'active',
        isActive:  true,
      });
    } else {
      admin.firstName = firstName.trim();
      admin.lastName  = lastName.trim();
      admin.role      = 'admin';
    }

    if (admin.isOTPBlocked()) {
      const mins = Math.ceil((admin.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${mins} minutes.` });
    }

    const otp = admin.generateEmailVerificationOTP();
    await admin.save();
    await sendOTP(email, otp, 'registration');

    return res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('sendAdminRegistrationOTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

exports.verifyAdminRegistrationOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password)
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const admin = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' });
    if (!admin)
      return res.status(404).json({ message: 'Admin registration not found.' });
    if (admin.isOTPBlocked())
      return res.status(429).json({ message: 'Account temporarily blocked.' });

    const valid = admin.verifyEmailOTP(otp);
    if (!valid) {
      await admin.save();
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    admin.password = await bcrypt.hash(password, 10);
    await admin.save();

    const token = signToken(admin);
    return res.status(201).json({ success: true, message: 'Admin account created!', token, user: safeUser(admin) });
  } catch (err) {
    console.error('verifyAdminRegistrationOTP error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GUIDE REGISTRATION ───────────────────────────────────────────────────────

exports.sendGuideRegistrationOTP = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim())
      return res.status(400).json({ message: 'First name, last name, email, and phone are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing?.isEmailVerified)
      return res.status(400).json({ message: 'An account with this email already exists.' });

    let user = existing;
    if (!user) {
      user = new User({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.toLowerCase().trim(),
        phone:     phone.trim(),
        role:      'guide',
        status:    'pending',
        isActive:  false,
      });
    } else {
      user.firstName = firstName.trim();
      user.lastName  = lastName.trim();
      user.phone     = phone.trim();
      user.role      = 'guide';
      user.status    = 'pending';
    }

    if (user.isOTPBlocked()) {
      const mins = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${mins} minutes.` });
    }

    const otp = user.generateEmailVerificationOTP();
    await user.save();
    await sendOTP(email, otp, 'registration');

    return res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('sendGuideRegistrationOTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

exports.verifyGuideRegistrationOTP = async (req, res) => {
  try {
    const { email, otp, password, yearsExperience, specializations, languages, bio, guideLicense } = req.body;

    if (!email || !otp || !password)
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'guide' });
    if (!user)
      return res.status(404).json({ message: 'No guide registration found.', error: 'USER_NOT_FOUND' });
    if (!user.emailVerificationOTP)
      return res.status(400).json({ message: 'No OTP requested. Please send OTP first.', error: 'NO_OTP_REQUESTED' });
    if (user.isOTPBlocked()) {
      const mins = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${mins} minutes.` });
    }

    const valid = user.verifyEmailOTP(otp);
    if (!valid) {
      await user.save();
      if (user.emailVerificationOTPExpires < new Date())
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    await Guide.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        yearsExperience:   yearsExperience || 0,
        specializations:   specializations || [],
        languages:         languages || [],
        bio:               bio || '',
        licenseNumber:     guideLicense?.trim() || '',
        applicationStatus: 'pending',
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Guide application submitted! You will hear back within 2-3 business days.',
      user: { id: user._id, email: user.email, role: user.role, status: user.status }
    });
  } catch (err) {
    console.error('verifyGuideRegistrationOTP error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── UNIFIED LOGIN ────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !user.password)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const status = user.status || (user.isActive ? 'active' : 'suspended');
    if (status === 'pending')
      return res.status(403).json({ success: false, message: 'Your account is pending approval.' });
    if (status === 'suspended')
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });

    const token = signToken(user);
    return res.json({ success: true, message: 'Login successful', token, user: safeUser(user) });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -emailVerificationOTP -emailVerificationOTPExpires -loginOTP -loginOTPExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, profileImage } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    if (phone)     user.phone     = phone;
    if (profileImage) user.profileImage = profileImage;
    await user.save();
    res.json({ success: true, message: 'Profile updated', user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });

    const user = await User.findById(req.user.id).select('+password');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};