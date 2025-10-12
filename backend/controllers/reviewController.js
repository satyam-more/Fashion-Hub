// Review Controller - handles all review-related business logic
class ReviewController {
  
  // Get reviews for a specific product
  static async getProductReviews(req, res) {
    try {
      const connection = req.dbConnection;
      const { productId } = req.params;
      
      const query = `
        SELECT 
          r.review_id,
          r.product_id,
          r.user_id,
          r.rating,
          r.review_text,
          r.created_at,
          r.updated_at,
          u.username,
          u.email
        FROM product_reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
      `;
      
      const [reviews] = await connection.execute(query, [productId]);
      
      // Calculate average rating
      let averageRating = 0;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = (totalRating / reviews.length).toFixed(1);
      }
      
      res.json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: {
          reviews: reviews.map(review => ({
            id: review.review_id,
            productId: review.product_id,
            userId: review.user_id,
            username: review.username,
            rating: review.rating,
            comment: review.review_text,
            createdAt: review.created_at,
            updatedAt: review.updated_at
          })),
          averageRating: parseFloat(averageRating),
          totalReviews: reviews.length
        }
      });
      
    } catch (error) {
      console.error('Get product reviews error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve reviews',
        message: error.message
      });
    }
  }

  // Add a new review
  static async addReview(req, res) {
    try {
      const connection = req.dbConnection;
      const { productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.userId;

      // Validate required fields
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Comment is required'
        });
      }

      // Check if product exists
      const [products] = await connection.execute(
        'SELECT product_id FROM products WHERE product_id = ?',
        [productId]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Check if user has already reviewed this product
      const [existingReviews] = await connection.execute(
        'SELECT review_id FROM product_reviews WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existingReviews.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this product'
        });
      }

      // Insert new review
      const insertQuery = `
        INSERT INTO product_reviews (product_id, user_id, rating, review_text)
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await connection.execute(insertQuery, [
        productId,
        userId,
        rating,
        comment.trim()
      ]);

      // Get the newly created review with user info
      const [newReview] = await connection.execute(`
        SELECT 
          r.review_id,
          r.product_id,
          r.user_id,
          r.rating,
          r.review_text,
          r.created_at,
          u.username
        FROM product_reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.review_id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: {
          id: newReview[0].review_id,
          productId: newReview[0].product_id,
          userId: newReview[0].user_id,
          username: newReview[0].username,
          rating: newReview[0].rating,
          comment: newReview[0].review_text,
          createdAt: newReview[0].created_at
        }
      });

    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add review',
        message: error.message
      });
    }
  }

  // Update an existing review
  static async updateReview(req, res) {
    try {
      const connection = req.dbConnection;
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.userId;

      // Validate required fields
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Comment is required'
        });
      }

      // Check if review exists and belongs to the user
      const [existingReviews] = await connection.execute(
        'SELECT review_id, user_id FROM product_reviews WHERE review_id = ?',
        [reviewId]
      );

      if (existingReviews.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Review not found'
        });
      }

      if (existingReviews[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own reviews'
        });
      }

      // Update review
      const updateQuery = `
        UPDATE product_reviews 
        SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
        WHERE review_id = ?
      `;

      await connection.execute(updateQuery, [rating, comment.trim(), reviewId]);

      // Get updated review with user info
      const [updatedReview] = await connection.execute(`
        SELECT 
          r.review_id,
          r.product_id,
          r.user_id,
          r.rating,
          r.review_text,
          r.created_at,
          r.updated_at,
          u.username
        FROM product_reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.review_id = ?
      `, [reviewId]);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: {
          id: updatedReview[0].review_id,
          productId: updatedReview[0].product_id,
          userId: updatedReview[0].user_id,
          username: updatedReview[0].username,
          rating: updatedReview[0].rating,
          comment: updatedReview[0].review_text,
          createdAt: updatedReview[0].created_at,
          updatedAt: updatedReview[0].updated_at
        }
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update review',
        message: error.message
      });
    }
  }

  // Delete a review
  static async deleteReview(req, res) {
    try {
      const connection = req.dbConnection;
      const { reviewId } = req.params;
      const userId = req.user.userId;

      // Check if review exists and belongs to the user
      const [existingReviews] = await connection.execute(
        'SELECT review_id, user_id FROM product_reviews WHERE review_id = ?',
        [reviewId]
      );

      if (existingReviews.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Review not found'
        });
      }

      if (existingReviews[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own reviews'
        });
      }

      // Delete review
      await connection.execute('DELETE FROM product_reviews WHERE review_id = ?', [reviewId]);

      res.json({
        success: true,
        message: 'Review deleted successfully',
        data: { id: reviewId }
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete review',
        message: error.message
      });
    }
  }

  // Get all reviews by a user
  static async getUserReviews(req, res) {
    try {
      const connection = req.dbConnection;
      const userId = req.user.userId;
      
      const query = `
        SELECT 
          r.review_id,
          r.product_id,
          r.rating,
          r.review_text,
          r.created_at,
          r.updated_at,
          p.product_name,
          p.images
        FROM product_reviews r
        LEFT JOIN products p ON r.product_id = p.product_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `;
      
      const [reviews] = await connection.execute(query, [userId]);
      
      res.json({
        success: true,
        message: 'User reviews retrieved successfully',
        data: reviews.map(review => ({
          id: review.review_id,
          productId: review.product_id,
          productName: review.product_name,
          productImage: review.images ? JSON.parse(review.images)[0] : null,
          rating: review.rating,
          comment: review.review_text,
          createdAt: review.created_at,
          updatedAt: review.updated_at
        }))
      });
      
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user reviews',
        message: error.message
      });
    }
  }
}

module.exports = ReviewController;