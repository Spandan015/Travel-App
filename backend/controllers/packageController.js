const TravelPackage = require('../models/TravelPackage');
const User          = require('../models/User');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const { minPrice, maxPrice, duration, difficulty, isActive } = req.query;
    const filter = {};
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (duration)             filter.duration   = parseInt(duration);
    if (difficulty)           filter.difficulty = difficulty;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const packages = await TravelPackage.find(filter)
      .populate('destinations', 'name location')
      .populate('hotel', 'name location pricePerNight')
      .populate('addedBy', 'username')
      .populate('availableGuides', 'username firstName lastName email guideProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: packages.length, packages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single package
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await TravelPackage.findById(req.params.id)
      .populate('destinations', 'name location description imageUrl')
      .populate('hotel', 'name location pricePerNight starRating')
      .populate('addedBy', 'username email')
      .populate('availableGuides', 'username firstName lastName email guideProfile');

    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create package (Admin only)
exports.createPackage = async (req, res) => {
  try {
    const packageData  = req.body;
    packageData.addedBy = req.user.id;
    const pkg = await TravelPackage.create(packageData);
    const populated = await TravelPackage.findById(pkg._id)
      .populate('destinations', 'name location')
      .populate('hotel', 'name location')
      .populate('availableGuides', 'username firstName lastName email guideProfile');
    res.status(201).json({ success: true, message: 'Package created successfully', package: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update package (Admin only)
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await TravelPackage.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
      .populate('destinations', 'name location')
      .populate('hotel', 'name location')
      .populate('availableGuides', 'username firstName lastName email guideProfile');
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ success: true, message: 'Package updated successfully', package: pkg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete package (Admin only)
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await TravelPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle package status (Admin only)
exports.togglePackageStatus = async (req, res) => {
  try {
    const pkg = await TravelPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    pkg.isActive = !pkg.isActive;
    await pkg.save();
    res.json({ success: true, message: `Package ${pkg.isActive ? 'activated' : 'deactivated'}`, package: pkg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════
// PUT /api/packages/:id/guides  (admin)
// Body: { guideIds: ['userId1', 'userId2', ...] }
// Sets which guides are available for this package
// ════════════════════════════════════════════════════════
exports.managePackageGuides = async (req, res) => {
  try {
    const { guideIds } = req.body;
    if (!Array.isArray(guideIds)) {
      return res.status(400).json({ message: 'guideIds must be an array' });
    }

    // Validate all IDs are real guide users
    const guides = await User.find({
      _id: { $in: guideIds },
      role: 'guide',
    }).select('_id username firstName lastName guideProfile');

    const validIds = guides.map(g => g._id);

    const pkg = await TravelPackage.findByIdAndUpdate(
      req.params.id,
      { availableGuides: validIds },
      { new: true }
    ).populate('availableGuides', 'username firstName lastName email guideProfile');

    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    res.json({
      success: true,
      message: `${validIds.length} guide(s) linked to this package`,
      availableGuides: pkg.availableGuides,
    });
  } catch (err) {
    console.error('managePackageGuides error:', err);
    res.status(500).json({ message: err.message });
  }
};