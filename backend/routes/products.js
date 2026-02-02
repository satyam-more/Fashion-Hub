const express = require('express');
const ProductController = require('../controllers/productController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

module.exports = (connection) => {
  const router = express.Router();

  // Middleware to attach database connection to request
  router.use((req, res, next) => {
    req.dbConnection = connection;
    next();
  });

  // Test route to verify products router is working
  router.get('/test', (req, res) => {
    res.json({ message: 'Products router is working!' });
  });

  // Public Product Routes (No authentication required)

  // GET /api/products - Get all products with optional filters
  router.get('/', ProductController.getFilteredProducts);

  // GET /api/products/categories - Get all categories
  router.get('/categories', ProductController.getCategories);

  // GET /api/products/subcategories/:categoryId - Get subcategories by category
  router.get('/subcategories/:categoryId', ProductController.getSubcategories);

  // GET /api/products/search - Search products (with rate limiting)
  router.get('/search', searchLimiter, ProductController.searchProducts);

  // GET /api/products/:id - Get single product by ID
  router.get('/:id', ProductController.getProductById);

  // Protected Admin Routes (Authentication + Admin role required)

  // POST /api/products - Create new product (Admin only)
  router.post('/', authenticateToken, authorizeAdmin, ProductController.createProduct);

  // PUT /api/products/:id - Update existing product (Admin only)
  router.put('/:id', authenticateToken, authorizeAdmin, ProductController.updateProduct);

  // DELETE /api/products/:id - Delete product (Admin only)
  router.delete('/:id', authenticateToken, authorizeAdmin, ProductController.deleteProduct);

  return router;
};