const mongoose = require('mongoose');
const Guide = require('../models/Guide');
const User = require('../models/User');

const POPULATE_FIELDS = '-password -emailVerificationOTP -loginOTP -emailVerificationOTPExpires -loginOTPExpires -otpAttempts -otpBlockedUntil';

exports.getAllGuides = async (req, res) => {
  try {
    console.log('\n[guideController] getAllGuides called');

    // ── Source 1: Guide model ──────────────────────────────────────────────
    const rawGuideDocs = await Guide.find({ applicationStatus: 'approved' })
      .populate('user', POPULATE_FIELDS)
      .lean();

    console.log(`[guideController] Guide.find approved: ${rawGuideDocs.length} docs`);
    rawGuideDocs.forEach((g, i) => {
      console.log(`  [${i}] _id=${g._id} user=${JSON.stringify(g.user?._id || g.user)} status=${g.user?.status}`);
    });

    const fromGuideModel = rawGuideDocs
      .filter(g => {
        // populate gives us a full object; if it failed it stays as ObjectId
        const userObj = g.user;
        const isObj = userObj && typeof userObj === 'object' && userObj.status;
        const passes = isObj && userObj.status === 'active';
        if (!passes) console.log(`  → filtered out: user=${JSON.stringify(userObj)}`);
        return passes;
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
        availability:      g.availability !== false,   // default true
        rating:            g.rating || 0,
        hourlyRate:        g.hourlyRate,
        dailyRate:         g.dailyRate,
        createdAt:         g.createdAt,
        userId:            g.user._id,
      }));

    console.log(`[guideController] fromGuideModel after filter: ${fromGuideModel.length}`);

    // ── Source 2: User model with embedded guideProfile ───────────────────
    const userGuides = await User.find({
      role: 'guide',
      status: 'active',
      'guideProfile.isApproved': true,
    }).select('-password -emailVerificationOTP -loginOTP').lean();

    console.log(`[guideController] User.guideProfile.isApproved guides: ${userGuides.length}`);

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
    console.log(`[guideController] TOTAL guides returned: ${allGuides.length}\n`);

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

    // Try Guide model first
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

    // Fallback: User model
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