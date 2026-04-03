import api from './api';

const imageService = {
  // Upload single image
  uploadSingleImage: async (imageFile, folder = 'nepal-travel/general') => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('folder', folder);

      const response = await api.post('/images/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading single image:', error);
      throw error.response?.data || error;
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (imageFiles, folder = 'nepal-travel/general') => {
    try {
      const formData = new FormData();

      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });

      formData.append('folder', folder);

      const response = await api.post('/images/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error.response?.data || error;
    }
  },

  // Delete single image
  deleteImage: async (publicId) => {
    try {
      const response = await api.delete(`/images/delete/${publicId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error.response?.data || error;
    }
  },

  // Delete multiple images
  deleteMultipleImages: async (publicIds) => {
    try {
      const response = await api.post('/images/delete/multiple', { publicIds });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      throw error.response?.data || error;
    }
  },

  // Get optimized image URL
  getOptimizedImageUrl: async (publicId, options = {}) => {
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/images/optimized/${publicId}?${params}`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting optimized image URL:', error);
      throw error.response?.data || error;
    }
  },

  // Get thumbnail URL
  getThumbnailUrl: async (publicId, size = 300) => {
    try {
      const response = await api.get(`/images/thumbnail/${publicId}?size=${size}`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting thumbnail URL:', error);
      throw error.response?.data || error;
    }
  },

  // Validate image file
  validateImageFile: (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    return true;
  },

  // Validate multiple image files
  validateImageFiles: function(files, maxFiles = 10) {
    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} images allowed`);
    }

    // Store reference to validateImageFile method
    const validateSingleFile = this.validateImageFile.bind(this);

    files.forEach(file => {
      validateSingleFile(file);
    });

    return true;
  },

  // Convert file to base64 for preview (client-side only)
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Create image preview URLs (client-side only)
  createImagePreviews: (files) => {
    return Promise.all(
      Array.from(files).map(async (file) => ({
        file,
        preview: await this.fileToBase64(file),
        name: file.name,
        size: file.size
      }))
    );
  },

  // Utility function to get image dimensions
  getImageDimensions: (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }
};

export default imageService;




