const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (con) => {
  // Get user's wishlist
  router.get('/', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const [wishlistItems] = await con.execute(`
        SELECT 
          w.wishlist_id,
          w.added_at,
          p.product_id,
          p.product_name,
          p.price,
          p.images,
          p.colour,
          p.discount,
          cat.name as category_name,
          sub.name as subcategory_name
        FROM wishlist w
        JOIN products p ON w.product_id = p.product_id
        JOIN categories cat ON p.category_id = cat.category_id
        JOIN subcategories sub ON p.subcategory_id = sub.subcategory_id
        WHERE w.user_id = ?
        ORDER BY w.added_at DESC
      `, [userId]);

      // Parse images for each item
      const formattedItems = wishlistItems.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        discounted_price: item.discount ? 
          (parseFloat(item.price) * (1 - parseFloat(item.discount) / 100)).toFixed(2) : 
          item.price
      }));

      res.json({
        success: true,
        items: formattedItems,
        count: formattedItems.length
      });
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Add item to wishlist
  router.post('/add', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }

      // Check if product exists
      const [product] = await con.execute(
        'SELECT product_id FROM products WHERE product_id = ?',
        [productId]
      );

      if (product.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Check if item already exists in wishlist
      const [existingItem] = await con.execute(
        'SELECT wishlist_id FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existingItem.length > 0) {
        return res.status(400).json({ success: false, message: 'Item already in wishlist' });
      }

      // Add to wishlist
      await con.execute(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );

      res.json({ success: true, message: 'Item added to wishlist' });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Remove item from wishlist
  router.delete('/remove/:wishlistId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { wishlistId } = req.params;

      // Verify wishlist item belongs to user
      const [wishlistItem] = await con.execute(
        'SELECT wishlist_id FROM wishlist WHERE wishlist_id = ? AND user_id = ?',
        [wishlistId, userId]
      );

      if (wishlistItem.length === 0) {
        return res.status(404).json({ success: false, message: 'Wishlist item not found' });
      }

      await con.execute('DELETE FROM wishlist WHERE wishlist_id = ?', [wishlistId]);

      res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Remove by product ID (alternative endpoint)
  router.delete('/remove-product/:productId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.params;

      const result = await con.execute(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (result[0].affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
      }

      res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Check if product is in wishlist
  router.get('/check/:productId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.params;

      const [wishlistItem] = await con.execute(
        'SELECT wishlist_id FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      res.json({
        success: true,
        inWishlist: wishlistItem.length > 0
      });
    } catch (error) {
      console.error('Check wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Clear entire wishlist
  router.delete('/clear', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      await con.execute('DELETE FROM wishlist WHERE user_id = ?', [userId]);

      res.json({ success: true, message: 'Wishlist cleared' });
    } catch (error) {
      console.error('Clear wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  return router;
};