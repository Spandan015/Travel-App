const TravelPackage = require('../models/TravelPackage');

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
    
    if (duration) {
      filter.duration = parseInt(duration);
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const packages = await TravelPackage.find(filter)
      .populate('destinations', 'name location')
      .populate('hotel', 'name location pricePerNight')
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: packages.length,
      packages
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single package
exports.getPackageById = async (req, res) => {
  try {
    const package = await TravelPackage.findById(req.params.id)
      .populate('destinations', 'name location description imageUrl')
      .populate('hotel', 'name location pricePerNight starRating')
      .populate('addedBy', 'username email');
    
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    
    res.json({
      success: true,
      package
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create package (Admin only)
exports.createPackage = async (req, res) => {
  try {
    const packageData = req.body;
    packageData.addedBy = req.user.id;
    
    const package = await TravelPackage.create(packageData);
    
    const populatedPackage = await TravelPackage.findById(package._id)
      .populate('destinations', 'name location')
      .populate('hotel', 'name location');
    
    res.status(201).json({
      success: true,
      message: "Package created successfully",
      package: populatedPackage
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update package (Admin only)
exports.updatePackage = async (req, res) => {
  try {
    const package = await TravelPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('destinations', 'name location')
      .populate('hotel', 'name location');
    
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    
    res.json({
      success: true,
      message: "Package updated successfully",
      package
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete package (Admin only)
exports.deletePackage = async (req, res) => {
  try {
    const package = await TravelPackage.findByIdAndDelete(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    
    res.json({
      success: true,
      message: "Package deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle package status (Admin only)
exports.togglePackageStatus = async (req, res) => {
  try {
    const package = await TravelPackage.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    
    package.isActive = !package.isActive;
    await package.save();
    
    res.json({
      success: true,
      message: `Package ${package.isActive ? 'activated' : 'deactivated'} successfully`,
      package
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};