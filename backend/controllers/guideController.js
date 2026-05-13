const mongoose = require('mongoose');
const Guide = require('../models/Guide');
const User = require('../models/User');
const path = require('path');
const multer = require('multer');

// ── Local disk storage for guide profile images ──────────────────
const guideImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/guide-profiles'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `guide-${req.user._id}-${Date.now()}${ext}`);
  },
});
const guideImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};
exports.uploadGuideImage = multer({
  storage: guideImageStorage,
  fileFilter: guideImageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const POPULATE_FIELDS = '-password -emailVerificationOTP -loginOTP -emailVerificationOTPExpires -loginOTPExpires -otpAttempts -otpBlockedUntil';

exports.getAllGuides = async (req, res) => {
  try {
    console.log('\n[guideController] getAllGuides called');

    const rawGuideDocs = await Guide.find({ applicationStatus: 'approved' })
      .populate('user', POPULATE_FIELDS)
      .lean();

    console.log(`[guideController] Guide.find approved: ${rawGuideDocs.length} docs`);

    const fromGuideModel = rawGuideDocs
      .filter(g => {
        const userObj = g.user;
        const isObj = userObj && typeof userObj === 'object' && userObj.status;
        return isObj && userObj.status === 'active';
      })
      .map(g => ({
        _id:               g._id,
        firstName:         g.user.firstName,
        lastName:          g.user.lastName,
        email:             g.user.email,
        phone:             g.user.phone,
        profileImage:      g.user.profileImage,
        bio:               g.bio,
        yearsExperience:   g.yearsExperience,
        specializations:   g.specializations || [],
        languages:         g.languages || [],
        licenseNumber:     g.licenseNumber,
        applicationStatus: g.applicationStatus,
        availability:      g.availability !== false,
        rating:            g.rating || 0,
        hourlyRate:        g.hourlyRate,
        dailyRate:         g.dailyRate,
        createdAt:         g.createdAt,
        userId:            g.user._id,
      }));

    const userGuides = await User.find({
      role: 'guide',
      status: 'active',
      'guideProfile.isApproved': true,
    }).select('-password -emailVerificationOTP -loginOTP').lean();

    const coveredUserIds = new Set(fromGuideModel.map(g => g.userId?.toString()).filter(Boolean));

    const fromUserModel = userGuides
      .filter(u => !coveredUserIds.has(u._id.toString()))
      .map(u => ({
        _id:               u._id,
        firstName:         u.firstName,
        lastName:          u.lastName,
        email:             u.email,
        phone:             u.phone,
        profileImage:      u.profileImage || u.guideProfile?.profileImage,
        bio:               u.guideProfile?.bio,
        yearsExperience:   u.guideProfile?.experience,
        specializations:   u.guideProfile?.specialties || [],
        languages:         u.guideProfile?.languages || [],
        licenseNumber:     null,
        applicationStatus: 'approved',
        availability:      u.guideProfile?.availability !== false,
        rating:            u.guideProfile?.rating || 0,
        hourlyRate:        u.guideProfile?.hourlyRate,
        dailyRate:         u.guideProfile?.dailyRate,
        createdAt:         u.createdAt,
        userId:            u._id,
      }));

    const allGuides = [...fromGuideModel, ...fromUserModel];
    res.json({ success: true, count: allGuides.length, guides: allGuides });
  } catch (err) {
    console.error('[guideController] getAllGuides ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    const guideDoc = await Guide.findById(id)
      .populate('user', POPULATE_FIELDS)
      .lean();

    let guideData = null;

    if (guideDoc && guideDoc.applicationStatus === 'approved') {
      const u = guideDoc.user;
      if (u && typeof u === 'object' && u.status === 'active') {
        guideData = {
          _id:               guideDoc._id,
          firstName:         u.firstName,
          lastName:          u.lastName,
          email:             u.email,
          phone:             u.phone,
          profileImage:      u.profileImage,
          bio:               guideDoc.bio,
          yearsExperience:   guideDoc.yearsExperience,
          specializations:   guideDoc.specializations || [],
          languages:         guideDoc.languages || [],
          licenseNumber:     guideDoc.licenseNumber,
          applicationStatus: guideDoc.applicationStatus,
          availability:      guideDoc.availability !== false,
          rating:            guideDoc.rating || 0,
          hourlyRate:        guideDoc.hourlyRate,
          dailyRate:         guideDoc.dailyRate,
          userId:            u._id,
        };
      }
    }

    if (!guideData) {
      const userDoc = await User.findOne({
        _id: id,
        role: 'guide',
        status: 'active',
        'guideProfile.isApproved': true,
      }).select('-password').lean();

      if (userDoc) {
        guideData = {
          _id:               userDoc._id,
          firstName:         userDoc.firstName,
          lastName:          userDoc.lastName,
          email:             userDoc.email,
          phone:             userDoc.phone,
          profileImage:      userDoc.profileImage || userDoc.guideProfile?.profileImage,
          bio:               userDoc.guideProfile?.bio,
          yearsExperience:   userDoc.guideProfile?.experience,
          specializations:   userDoc.guideProfile?.specialties || [],
          languages:         userDoc.guideProfile?.languages || [],
          licenseNumber:     null,
          applicationStatus: 'approved',
          availability:      userDoc.guideProfile?.availability !== false,
          rating:            userDoc.guideProfile?.rating || 0,
          hourlyRate:        userDoc.guideProfile?.hourlyRate,
          dailyRate:         userDoc.guideProfile?.dailyRate,
          userId:            userDoc._id,
        };
      }
    }

    if (!guideData) return res.status(404).json({ message: 'Guide not found' });

    res.json({ success: true, guide: guideData, reviews: [] });
  } catch (err) {
    console.error('[guideController] getGuideById ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.searchGuides = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Search query required' });

    const guideDocs = await Guide.find({
      applicationStatus: 'approved',
      $or: [
        { bio: { $regex: query, $options: 'i' } },
        { specializations: { $regex: query, $options: 'i' } },
        { languages: { $regex: query, $options: 'i' } },
      ],
    }).populate('user', POPULATE_FIELDS).lean();

    const results = guideDocs
      .filter(g => g.user && typeof g.user === 'object' && g.user.status === 'active')
      .map(g => ({
        _id: g._id,
        firstName: g.user.firstName,
        lastName: g.user.lastName,
        bio: g.bio,
        specializations: g.specializations || [],
        languages: g.languages || [],
        yearsExperience: g.yearsExperience,
        rating: g.rating || 0,
        hourlyRate: g.hourlyRate,
        dailyRate: g.dailyRate,
        availability: g.availability !== false,
        userId: g.user._id,
      }));

    res.json({ success: true, count: results.length, guides: results });
  } catch (err) {
    console.error('[guideController] searchGuides ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// NEW: Update logged-in guide's own profile
// Route: PUT /api/guides/me   (protected, guide only)
// Handles both JSON body (URL image) and multipart (file upload)
// ─────────────────────────────────────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  console.log('[updateMyProfile] req.file:', req.file);
  console.log('[updateMyProfile] profileImageUrl will be:', req.file ? `/uploads/guide-profiles/${req.file.filename}` : req.body.profileImage);
  try {
    const userId = req.user._id || req.user.id;

    // Parse arrays that may come as JSON strings (multipart form)
    let languages   = req.body.languages;
    let specialties = req.body.specialties;
    if (typeof languages   === 'string') { try { languages   = JSON.parse(languages);   } catch { languages   = []; } }
    if (typeof specialties === 'string') { try { specialties = JSON.parse(specialties); } catch { specialties = []; } }

    const { firstName, lastName, phone, bio, hourlyRate, dailyRate } = req.body;

    // Validation
    if (firstName !== undefined && !String(firstName).trim()) {
      return res.status(400).json({ message: 'First name cannot be empty.' });
    }
    if (bio !== undefined && String(bio).length < 50) {
      return res.status(400).json({ message: 'Bio must be at least 50 characters.' });
    }

    // Handle profile image
    let profileImageUrl = req.body.profileImage; // URL mode

    if (req.file) {
      // Device upload → local storage
      profileImageUrl = `/uploads/guide-profiles/${req.file.filename}`;
    }

    // Build update objects
    const userUpdate  = {};
    const guideUpdate = {};

    if (firstName !== undefined)    userUpdate.firstName    = String(firstName).trim();
    if (lastName  !== undefined)    userUpdate.lastName     = String(lastName).trim();
    if (phone     !== undefined)    userUpdate.phone        = String(phone).trim();
    if (profileImageUrl !== undefined) {
      userUpdate.profileImage               = profileImageUrl;
      guideUpdate['guideProfile.profileImage'] = profileImageUrl;
    }

    if (bio         !== undefined) guideUpdate['guideProfile.bio']        = bio;
    if (hourlyRate  !== undefined) guideUpdate['guideProfile.hourlyRate'] = Number(hourlyRate) || 0;
    if (dailyRate   !== undefined) guideUpdate['guideProfile.dailyRate']  = Number(dailyRate)  || 0;
    if (languages)                 guideUpdate['guideProfile.languages']  = languages;
    if (specialties)               guideUpdate['guideProfile.specialties']= specialties;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { ...userUpdate, ...guideUpdate } },
      { new: true, runValidators: false }
    ).select('-password -emailVerificationOTP -loginOTP -emailVerificationOTPExpires -loginOTPExpires -otpAttempts -otpBlockedUntil');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Also update Guide model fields if guide doc exists
    const guideDoc = await Guide.findOne({ user: userId });
    if (guideDoc) {
      if (bio        !== undefined) guideDoc.bio      = bio;
      if (hourlyRate !== undefined) guideDoc.hourlyRate = Number(hourlyRate) || 0;
      if (dailyRate  !== undefined) guideDoc.dailyRate  = Number(dailyRate)  || 0;
      if (languages)               guideDoc.languages   = languages;
      if (specialties)             guideDoc.specializations = specialties;
      await guideDoc.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    console.error('[guideController] updateMyProfile ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};