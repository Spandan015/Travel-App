const User = require('../models/User');
const GuideBooking = require('../models/GuideBooking');

// Get all approved guides
exports.getAllGuides = async (req, res) => {
  try {
    const { specialty, language, minRating, maxPrice, availability } = req.query;
    
    const filter = {
      role: 'guide',
      'guideProfile.isApproved': true,
      isActive: true
    };
    
    if (specialty) {
      filter['guideProfile.specialties'] = specialty;
    }
    
    if (language) {
      filter['guideProfile.languages'] = language;
    }
    
    if (minRating) {
      filter['guideProfile.rating'] = { $gte: parseFloat(minRating) };
    }
    
    if (availability === 'true') {
      filter['guideProfile.availability'] = true;
    }
    
    let guides = await User.find(filter).select('-password');
    
    // Filter by max price if specified
    if (maxPrice) {
      guides = guides.filter(g => 
        g.guideProfile.hourlyRate <= parseFloat(maxPrice) || 
        g.guideProfile.dailyRate <= parseFloat(maxPrice)
      );
    }
    
    res.json({
      success: true,
      count: guides.length,
      guides
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single guide details
exports.getGuideById = async (req, res) => {
  try {
    const guide = await User.findById(req.params.id).select('-password');
    
    if (!guide || guide.role !== 'guide') {
      return res.status(404).json({ message: "Guide not found" });
    }
    
    if (!guide.guideProfile?.isApproved) {
      return res.status(404).json({ message: "Guide not found" });
    }
    
    // Get guide's reviews from completed bookings
    const reviews = await GuideBooking.find({
      guide: req.params.id,
      status: 'completed',
      'review.rating': { $exists: true }
    })
      .populate('user', 'username profileImage')
      .select('review createdAt')
      .sort({ 'review.reviewedAt': -1 })
      .limit(10);
    
    res.json({
      success: true,
      guide,
      reviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search guides
exports.searchGuides = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }
    
    const guides = await User.find({
      role: 'guide',
      'guideProfile.isApproved': true,
      isActive: true,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { 'guideProfile.bio': { $regex: query, $options: 'i' } },
        { 'guideProfile.specialties': { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    
    res.json({
      success: true,
      count: guides.length,
      guides
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};