const Destination = require('../models/destination');

// Get all destinations with filtering and pagination
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      province,
      isActive,
      isPopular,
      featured,
      search
    } = req.query;

    const filter = {};

    // Apply filters
    if (category) filter.category = category;
    if (province) filter.province = province;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true';
    if (featured !== undefined) filter.featured = featured === 'true';

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { isPopular: -1, createdAt: -1 }
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
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
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
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ success: true, destination: dest });
  } catch (err) {
    console.error('Error fetching destination:', err);
    res.status(500).json({ message: 'Error fetching destination' });
  }
};

// Create new destination (Admin only)
exports.create = async (req, res) => {
  try {
    const data = {
      ...req.body,
      addedBy: req.user.id
    };

    const dest = await Destination.create(data);
    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      destination: dest
    });
  } catch (err) {
    console.error('Error creating destination:', err);
    res.status(500).json({ message: 'Error creating destination' });
  }
};

// Update destination (Admin only)
exports.update = async (req, res) => {
  try {
    const dest = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json({
      success: true,
      message: 'Destination updated successfully',
      destination: dest
    });
  } catch (err) {
    console.error('Error updating destination:', err);
    res.status(500).json({ message: 'Error updating destination' });
  }
};

// Delete destination (Admin only)
exports.delete = async (req, res) => {
  try {
    const dest = await Destination.findByIdAndDelete(req.params.id);

    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting destination:', err);
    res.status(500).json({ message: 'Error deleting destination' });
  }
};

// Toggle destination status (Admin only)
exports.toggleStatus = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);

    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    dest.isActive = !dest.isActive;
    await dest.save();

    res.json({
      success: true,
      message: `Destination ${dest.isActive ? 'activated' : 'deactivated'} successfully`,
      destination: dest
    });
  } catch (err) {
    console.error('Error toggling destination status:', err);
    res.status(500).json({ message: 'Error updating destination status' });
  }
};

// Toggle popular status (Admin only)
exports.togglePopular = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);

    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    dest.isPopular = !dest.isPopular;
    await dest.save();

    res.json({
      success: true,
      message: `Destination ${dest.isPopular ? 'marked as popular' : 'unmarked as popular'}`,
      destination: dest
    });
  } catch (err) {
    console.error('Error toggling popular status:', err);
    res.status(500).json({ message: 'Error updating popular status' });
  }
};

// Toggle featured status (Admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);

    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    dest.featured = !dest.featured;
    await dest.save();

    res.json({
      success: true,
      message: `Destination ${dest.featured ? 'featured' : 'unfeatured'}`,
      destination: dest
    });
  } catch (err) {
    console.error('Error toggling featured status:', err);
    res.status(500).json({ message: 'Error updating featured status' });
  }
};

// Get destinations by category
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const destinations = await Destination.find({
      category,
      isActive: true
    }).sort({ isPopular: -1, rating: -1 });

    res.json({
      success: true,
      destinations
    });
  } catch (err) {
    console.error('Error fetching destinations by category:', err);
    res.status(500).json({ message: 'Error fetching destinations' });
  }
};

// Get popular destinations
exports.getPopular = async (req, res) => {
  try {
    const destinations = await Destination.find({
      isPopular: true,
      isActive: true
    }).sort({ rating: -1 }).limit(10);

    res.json({
      success: true,
      destinations
    });
  } catch (err) {
    console.error('Error fetching popular destinations:', err);
    res.status(500).json({ message: 'Error fetching popular destinations' });
  }
};

// Get featured destinations
exports.getFeatured = async (req, res) => {
  try {
    const destinations = await Destination.find({
      featured: true,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      destinations
    });
  } catch (err) {
    console.error('Error fetching featured destinations:', err);
    res.status(500).json({ message: 'Error fetching featured destinations' });
  }
};

// Search destinations
exports.search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const destinations = await Destination.find({
      $text: { $search: q },
      isActive: true
    }, {
      score: { $meta: 'textScore' }
    }).sort({ score: { $meta: 'textScore' } }).limit(20);

    res.json({
      success: true,
      destinations
    });
  } catch (err) {
    console.error('Error searching destinations:', err);
    res.status(500).json({ message: 'Error searching destinations' });
  }
};