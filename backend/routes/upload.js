const express = require('express');
const UploadController = require('../controllers/uploadController');
const { uploadProductImages, handleUploadError, validateUploadedFiles } = require('../middleware/upload');
const auth = require('../middleware/auth');

module.exports = () => {
  const router = express.Router();

  // Upload product images (Admin only)
  router.post('/products', 
    auth.authenticateToken, 
    auth.authorizeAdmin, 
    (req, res, next) => {
      uploadProductImages(req, res, (err) => {
        if (err) {
          return handleUploadError(err, req, res, next);
        }
        next();
      });
    },
    validateUploadedFiles, // Validate file content after upload
    UploadController.uploadProductImages
  );

  // Delete product image (Admin only)
  router.delete('/products/:filename', 
    auth.authenticateToken, 
    auth.authorizeAdmin, 
    UploadController.deleteProductImage
  );

  // Get image info
  router.get('/products/:filename', 
    UploadController.getImageInfo
  );

  return router;
};