const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (con) => {
  // Get user's wishlist
  router.get('/', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      const [items] = await con.execute(`
        SELECT 
          w.wishlist_id,
          w.added_at,
          p.product_id,
          p.product_name,
          p.price,
          p.discount,
          p.images,
          p.quantity,
          c.name as category_name,
          s.name as subcategory_name
        FROM wishlist w
        JOIN products p ON w.product_id = p.product_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN subcategories s ON p.subcategory_id = s.subcategory_id
        WHERE w.user_id = ?
        ORDER BY w.added_at DESC
      `, [userId]);

      const processedItems = items.map(item => ({
        wishlistId: item.wishlist_id,
        productId: item.product_id,
        name: item.product_name,
        price: parseFloat(item.price),
        discount: parseFloat(item.discount) || 0,
        images: item.images ? JSON.parse(item.images) : [],
        inStock: item.quantity > 0,
        category: item.category_name,
        subcategory: item.subcategory_name,
        addedAt: item.added_at
      }));

      res.json({
        success: true,
        data: processedItems,
        total: processedItems.length
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
      const { product_id } = req.body;

      if (!product_id) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      // Check if product exists
      const [products] = await con.execute('SELECT product_id FROM products WHERE product_id = ?', [product_id]);
      if (products.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      // Check if already in wishlist
      const [existing] = await con.execute(
        'SELECT wishlist_id FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      );

      if (existing.length > 0) {
        return res.json({ success: true, message: 'Product already in wishlist', alreadyExists: true });
      }

      // Add to wishlist
      const [result] = await con.execute(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [userId, product_id]
      );

      res.status(201).json({
        success: true,
        message: 'Product added to wishlist',
        data: { wishlistId: result.insertId, productId: product_id }
      });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Remove item from wishlist
  router.delete('/:wishlistId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { wishlistId } = req.params;

      // Verify ownership
      const [items] = await con.execute(
        'SELECT wishlist_id FROM wishlist WHERE wishlist_id = ? AND user_id = ?',
        [wishlistId, userId]
      );

      if (items.length === 0) {
        return res.status(404).json({ success: false, error: 'Wishlist item not found' });
      }

      await con.execute('DELETE FROM wishlist WHERE wishlist_id = ?', [wishlistId]);
      res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Remove by product ID
  router.delete('/product/:productId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.params;

      await con.execute('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
      res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  return router;
};
