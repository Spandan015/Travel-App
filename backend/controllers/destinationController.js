const Destination   = require('../models/destination');
const Hotel         = require('../models/Hotel');
const TravelPackage = require('../models/TravelPackage');

// Get all destinations with filtering and pagination
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, category, province,
      isActive, isPopular, featured, search
    } = req.query;

    const filter = {};
    if (category)                filter.category  = category;
    if (province)                filter.province  = province;
    if (isActive !== undefined)  filter.isActive  = isActive  === 'true';
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true';
    if (featured !== undefined)  filter.featured  = featured  === 'true';
    if (search)                  filter.$text     = { $search: search };

    const options = {
      page:  parseInt(page),
      limit: parseInt(limit),
      sort:  { isPopular: -1, createdAt: -1 },
    };

    const destinations = await Destination.find(filter)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Destination.countDocuments(filter);

    res.json({
      success: true,
      destinations,
      pagination: {
        page: options.page, limit: options.limit,
        total, pages: Math.ceil(total / options.limit),
      },
    });
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).json({ message: 'Error fetching destinations' });
  }
};

// Get destination by ID
exports.getById = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    res.json({ success: true, destination: dest });
  } catch (err) {
    console.error('Error fetching destination:', err);
    res.status(500).json({ message: 'Error fetching destination' });
  }
};

// ✅ NEW: Get related hotels and packages for a destination
exports.getRelated = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });

    // Build location keywords to match against hotel.location string
    // e.g. destination.name = "Pokhara", destination.location = "Pokhara Valley"
    const keywords = [
      dest.name,
      dest.location,
      dest.district,
    ].filter(Boolean).map((k) => k.toLowerCase());

    // Match hotels whose location string contains any of the keywords
    const allHotels = await Hotel.find({ isActive: true })
      .select('name location mainImage images pricePerNight starRating rating totalReviews amenities')
      .lean();

    const hotels = allHotels.filter((h) => {
      const loc = (h.location || '').toLowerCase();
      return keywords.some((k) => loc.includes(k) || k.includes(loc));
    }).slice(0, 6);

    // Match packages that reference this destination's _id
    const packages = await TravelPackage.find({
      isActive:     true,
      destinations: dest._id,
    })
      .select('name description mainImage images price duration difficulty rating totalReviews destinations')
      .populate('destinations', 'name')
      .limit(6)
      .lean();

    res.json({
      success:  true,
      hotels,
      packages,
      hotelCount:   hotels.length,
      packageCount: packages.length,
    });
  } catch (err) {
    console.error('Error fetching related content:', err);
    res.status(500).json({ message: 'Error fetching related content' });
  }
};

// Create new destination (Admin only)
exports.create = async (req, res) => {
  try {
    const dest = await Destination.create({ ...req.body, addedBy: req.user.id });
    res.status(201).json({ success: true, message: 'Destination created successfully', destination: dest });
  } catch (err) {
    console.error('Error creating destination:', err);
    res.status(500).json({ message: 'Error creating destination' });
  }
};

// Update destination (Admin only)
exports.update = async (req, res) => {
  try {
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    res.json({ success: true, message: 'Destination updated successfully', destination: dest });
  } catch (err) {
    console.error('Error updating destination:', err);
    res.status(500).json({ message: 'Error updating destination' });
  }
};

// Delete destination (Admin only)
exports.delete = async (req, res) => {
  try {
    const dest = await Destination.findByIdAndDelete(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    res.json({ success: true, message: 'Destination deleted successfully' });
  } catch (err) {
    console.error('Error deleting destination:', err);
    res.status(500).json({ message: 'Error deleting destination' });
  }
};

// Toggle destination status (Admin only)
exports.toggleStatus = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    dest.isActive = !dest.isActive;
    await dest.save();
    res.json({ success: true, message: `Destination ${dest.isActive ? 'activated' : 'deactivated'}`, destination: dest });
  } catch (err) {
    res.status(500).json({ message: 'Error updating destination status' });
  }
};

// Toggle popular status (Admin only)
exports.togglePopular = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    dest.isPopular = !dest.isPopular;
    await dest.save();
    res.json({ success: true, message: `Destination ${dest.isPopular ? 'marked as popular' : 'unmarked'}`, destination: dest });
  } catch (err) {
    res.status(500).json({ message: 'Error updating popular status' });
  }
};

// Toggle featured status (Admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    dest.featured = !dest.featured;
    await dest.save();
    res.json({ success: true, message: `Destination ${dest.featured ? 'featured' : 'unfeatured'}`, destination: dest });
  } catch (err) {
    res.status(500).json({ message: 'Error updating featured status' });
  }
};

// Get destinations by category
exports.getByCategory = async (req, res) => {
  try {
    const destinations = await Destination.find({ category: req.params.category, isActive: true })
      .sort({ isPopular: -1, rating: -1 });
    res.json({ success: true, destinations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching destinations' });
  }
};

// Get popular destinations
exports.getPopular = async (req, res) => {
  try {
    const destinations = await Destination.find({ isPopular: true, isActive: true })
      .sort({ rating: -1 }).limit(10);
    res.json({ success: true, destinations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular destinations' });
  }
};

// Get featured destinations
exports.getFeatured = async (req, res) => {
  try {
    const destinations = await Destination.find({ featured: true, isActive: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, destinations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching featured destinations' });
  }
};

// Search destinations
exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query is required' });

    const destinations = await Destination.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20);

    res.json({ success: true, destinations });
  } catch (err) {
    res.status(500).json({ message: 'Error searching destinations' });
  }
};