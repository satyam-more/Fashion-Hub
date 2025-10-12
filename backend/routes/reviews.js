const express = require('express');
const ReviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

module.exports = (connection) => {
  const router = express.Router();

  // Middleware to attach database connection to request
  router.use((req, res, next) => {
    req.dbConnection = connection;
    next();
  });

  // Public Routes

  // GET /api/reviews/product/:productId - Get all reviews for a product
  router.get('/product/:productId', ReviewController.getProductReviews);

  // Protected Routes (Authentication required)

  // POST /api/reviews/product/:productId - Add a review for a product
  router.post('/product/:productId', authenticateToken, ReviewController.addReview);

  // PUT /api/reviews/:reviewId - Update a review
  router.put('/:reviewId', authenticateToken, ReviewController.updateReview);

  // DELETE /api/reviews/:reviewId - Delete a review
  router.delete('/:reviewId', authenticateToken, ReviewController.deleteReview);

  // GET /api/reviews/user - Get all reviews by the authenticated user
  router.get('/user', authenticateToken, ReviewController.getUserReviews);

  // Admin route to get all reviews
  router.get('/admin', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
      const [reviews] = await con.execute(`
        SELECT 
          r.*,
          p.product_name,
          u.username as customer_name,
          u.email as customer_email
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.product_id
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);

      res.json({
        success: true,
        data: reviews
      });

    } catch (error) {
      console.error('Get admin reviews error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch reviews' 
      });
    }
  });

  // Admin route to update review status
  router.patch('/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
      }

      await con.execute(
        'UPDATE reviews SET status = ? WHERE id = ?',
        [status, id]
      );

      res.json({
        success: true,
        message: 'Review status updated successfully'
      });

    } catch (error) {
      console.error('Update review status error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update review status' 
      });
    }
  });

  // Admin route to delete review
  router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      await con.execute('DELETE FROM reviews WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete review' 
      });
    }
  });

  return router;
};