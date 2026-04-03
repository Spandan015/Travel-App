const Hotel = require('../models/Hotel');

// Get all hotels
exports.getAllHotels = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, starRating, isActive } = req.query;
    
    const filter = {};
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = parseFloat(maxPrice);
    }
    
    if (starRating) {
      filter.starRating = parseInt(starRating);
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const hotels = await Hotel.find(filter)
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 });

    console.log(`Found ${hotels.length} hotels`);
    if (hotels.length > 0) {
      const firstHotel = hotels[0];
      console.log('First hotel images info:', {
        name: firstHotel.name,
        imagesCount: firstHotel.images?.length || 0,
        mainImageLength: firstHotel.mainImage?.length || 0,
        hasImages: !!(firstHotel.mainImage || (firstHotel.images && firstHotel.images.length > 0))
      });
    }

    res.json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single hotel
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('addedBy', 'username email');
    
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    res.json({
      success: true,
      hotel
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create hotel (Admin only)
exports.createHotel = async (req, res) => {
  try {
    console.log('Creating hotel with data keys:', Object.keys(req.body));
    console.log('Images array length:', req.body.images ? req.body.images.length : 0);
    console.log('Main image exists:', !!req.body.mainImage);
    console.log('User from auth:', req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hotelData = req.body;
    hotelData.addedBy = req.user.id;

    console.log('Hotel data summary:');
    console.log('- Name:', hotelData.name);
    console.log('- Images count:', hotelData.images?.length || 0);
    console.log('- Main image length:', hotelData.mainImage?.length || 0);
    console.log('- Main image preview:', hotelData.mainImage ? hotelData.mainImage.substring(0, 50) + '...' : 'none');

    const hotel = await Hotel.create(hotelData);

    console.log('Hotel created successfully:', hotel._id);

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      hotel
    });
  } catch (err) {
    console.error('Error creating hotel:', err);
    res.status(500).json({
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update hotel (Admin only)
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    res.json({
      success: true,
      message: "Hotel updated successfully",
      hotel
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete hotel (Admin only)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    res.json({
      success: true,
      message: "Hotel deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle hotel active status (Admin only)
exports.toggleHotelStatus = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    hotel.isActive = !hotel.isActive;
    await hotel.save();
    
    res.json({
      success: true,
      message: `Hotel ${hotel.isActive ? 'activated' : 'deactivated'} successfully`,
      hotel
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};