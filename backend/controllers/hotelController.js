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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hotelData = { ...req.body };
    hotelData.addedBy = req.user.id;

    // ── FIX: ensure every new room type has availableRooms = totalRooms ──────
    if (Array.isArray(hotelData.roomTypes)) {
      hotelData.roomTypes = hotelData.roomTypes.map(rt => ({
        ...rt,
        totalRooms:     Number(rt.totalRooms)     || 0,
        // If availableRooms wasn't sent (new room type), initialise it to totalRooms
        availableRooms: rt.availableRooms != null
          ? Number(rt.availableRooms)
          : Number(rt.totalRooms) || 0,
      }));
    }
    // ─────────────────────────────────────────────────────────────────────────

    const hotel = await Hotel.create(hotelData);

    console.log('Hotel created successfully:', hotel._id);
    console.log('Room types:', JSON.stringify(hotel.roomTypes, null, 2));

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
    const existingHotel = await Hotel.findById(req.params.id);
    if (!existingHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const updateData = { ...req.body };

    // ── FIX: safely merge roomTypes so availableRooms is never lost ──────────
    if (Array.isArray(updateData.roomTypes)) {
      updateData.roomTypes = updateData.roomTypes.map(incomingRt => {
        // Try to find the matching existing room type by name (type field)
        const existingRt = existingHotel.roomTypes.find(
          rt => rt.type && incomingRt.type &&
                rt.type.toLowerCase() === incomingRt.type.toLowerCase()
        );

        const totalRooms = Number(incomingRt.totalRooms) || 0;

        if (existingRt) {
          // Existing room type: preserve availableRooms (don't reset it)
          // But cap it at the new totalRooms in case admin reduced total
          const currentAvailable = existingRt.availableRooms != null
            ? existingRt.availableRooms
            : existingRt.totalRooms || 0;

          return {
            ...incomingRt,
            totalRooms,
            availableRooms: Math.min(currentAvailable, totalRooms),
          };
        } else {
          // Brand-new room type being added during edit: init availableRooms = totalRooms
          return {
            ...incomingRt,
            totalRooms,
            availableRooms: incomingRt.availableRooms != null
              ? Number(incomingRt.availableRooms)
              : totalRooms,
          };
        }
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Hotel updated:', hotel._id);
    console.log('Room types after update:', JSON.stringify(hotel.roomTypes, null, 2));

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