const path = require('path');
const fs = require('fs');

class UploadController {
  
  // Upload product images
  static async uploadProductImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
      }

      // Process uploaded files
      const uploadedImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/products/${file.filename}` // URL path for frontend
      }));

      res.json({
        success: true,
        message: `${uploadedImages.length} image(s) uploaded successfully`,
        data: {
          images: uploadedImages,
          count: uploadedImages.length
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload images',
        message: error.message
      });
    }
  }

  // Delete uploaded image
  static async deleteProductImage(req, res) {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          error: 'Filename is required'
        });
      }

      const filePath = path.join(__dirname, '../uploads/products', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // Delete the file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Image deleted successfully',
        data: { filename }
      });

    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image',
        message: error.message
      });
    }
  }

  // Get image info
  static async getImageInfo(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads/products', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      const stats = fs.statSync(filePath);
      
      res.json({
        success: true,
        data: {
          filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/products/${filename}`
        }
      });

    } catch (error) {
      console.error('Get image info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get image info',
        message: error.message
      });
    }
  }
}

module.exports = UploadController;