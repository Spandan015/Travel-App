const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  upload,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getOptimizedImageUrl,
  getThumbnailUrl
} = require('../utils/imageUpload');

// Upload single image (general purpose)
router.post('/upload/single', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const folder = req.body.folder || 'nepal-travel/general';

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Use Cloudinary if configured
      const result = await uploadToCloudinary(req.file.buffer, folder);
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        image: result
      });
    } else {
      // Local file storage fallback
      const fs = require('fs');
      const path = require('path');

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads', folder.replace('/', '-'));
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(req.file.originalname)}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file to disk
      fs.writeFileSync(filepath, req.file.buffer);

      // Create accessible URL
      const relativePath = path.relative(path.join(__dirname, '..'), filepath).replace(/\\/g, '/');
      const url = `${req.protocol}://${req.get('host')}/${relativePath}`;

      res.json({
        success: true,
        message: 'Image uploaded successfully (local storage)',
        image: {
          url: url,
          public_id: filename,
          secure_url: url,
          width: 800, // Default dimensions
          height: 600,
          format: path.extname(req.file.originalname).slice(1),
          bytes: req.file.size
        }
      });
    }
  } catch (error) {
    console.error('Error uploading single image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/upload/multiple', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const folder = req.body.folder || 'nepal-travel/general';

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Use Cloudinary if configured
      const results = await uploadMultipleToCloudinary(req.files, folder);
      res.json({
        success: true,
        message: `${results.length} images uploaded successfully`,
        images: results
      });
    } else {
      // Local file storage fallback
      const fs = require('fs');
      const path = require('path');
      const results = [];

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads', folder.replace('/', '-'));
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        // Generate unique filename
        const filename = `image_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file to disk
        fs.writeFileSync(filepath, file.buffer);

        // Create accessible URL
        const relativePath = path.relative(path.join(__dirname, '..'), filepath).replace(/\\/g, '/');
        const url = `${req.protocol}://${req.get('host')}/${relativePath}`;

        results.push({
          url: url,
          public_id: filename,
          secure_url: url,
          width: 800, // Default dimensions
          height: 600,
          format: path.extname(file.originalname).slice(1),
          bytes: file.size
        });
      }

      res.json({
        success: true,
        message: `${results.length} images uploaded successfully (local storage)`,
        images: results
      });
    }
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Delete single image
router.delete('/delete/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    await deleteFromCloudinary(publicId);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// Delete multiple images
router.post('/delete/multiple', protect, async (req, res) => {
  try {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds)) {
      return res.status(400).json({ message: 'Please provide an array of public IDs' });
    }

    await deleteMultipleFromCloudinary(publicIds);

    res.json({
      success: true,
      message: `${publicIds.length} images deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ message: 'Failed to delete images' });
  }
});

// Get optimized image URL
router.get('/optimized/:publicId', (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop } = req.query;

    const options = {};
    if (width) options.width = parseInt(width);
    if (height) options.height = parseInt(height);
    if (crop) options.crop = crop;

    const url = getOptimizedImageUrl(publicId, options);

    res.json({
      success: true,
      url: url
    });
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    res.status(500).json({ message: 'Failed to generate optimized URL' });
  }
});

// Get thumbnail URL
router.get('/thumbnail/:publicId', (req, res) => {
  try {
    const { publicId } = req.params;
    const { size } = req.query;

    const url = getThumbnailUrl(publicId, size ? parseInt(size) : 300);

    res.json({
      success: true,
      url: url
    });
  } catch (error) {
    console.error('Error generating thumbnail URL:', error);
    res.status(500).json({ message: 'Failed to generate thumbnail URL' });
  }
});

module.exports = router;




