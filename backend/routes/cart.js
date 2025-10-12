const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (con) => {
  // Get user's cart items
  router.get('/', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const [cartItems] = await con.execute(`
        SELECT 
          c.cart_id,
          c.quantity,
          c.size,
          c.added_at,
          p.product_id,
          p.product_name,
          p.price,
          p.images,
          p.colour,
          cat.name as category_name,
          sub.name as subcategory_name
        FROM cart c
        JOIN products p ON c.product_id = p.product_id
        JOIN categories cat ON p.category_id = cat.category_id
        JOIN subcategories sub ON p.subcategory_id = sub.subcategory_id
        WHERE c.user_id = ?
        ORDER BY c.added_at DESC
      `, [userId]);

      // Parse images for each item
      const formattedItems = cartItems.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        total: (parseFloat(item.price) * item.quantity).toFixed(2)
      }));

      const cartTotal = formattedItems.reduce((sum, item) => sum + parseFloat(item.total), 0);

      res.json({
        success: true,
        items: formattedItems,
        total: cartTotal.toFixed(2),
        count: formattedItems.length
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Add item to cart
  router.post('/add', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { product_id, productId, quantity = 1, size } = req.body;
      const actualProductId = product_id || productId;

      if (!actualProductId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }

      // Check if product exists
      const [product] = await con.execute(
        'SELECT product_id, product_name, price, quantity as stock FROM products WHERE product_id = ?',
        [actualProductId]
      );

      if (product.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (product[0].stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }

      // Check if item already exists in cart
      const [existingItem] = await con.execute(
        'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
        [userId, actualProductId, size || null]
      );

      if (existingItem.length > 0) {
        // Update quantity
        const newQuantity = existingItem[0].quantity + quantity;
        await con.execute(
          'UPDATE cart SET quantity = ? WHERE cart_id = ?',
          [newQuantity, existingItem[0].cart_id]
        );
      } else {
        // Add new item
        await con.execute(
          'INSERT INTO cart (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
          [userId, actualProductId, quantity, size || null]
        );
      }

      res.json({ success: true, message: 'Item added to cart' });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Update cart item quantity
  router.put('/update/:cartId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { cartId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Invalid quantity' });
      }

      // Verify cart item belongs to user
      const [cartItem] = await con.execute(
        'SELECT cart_id FROM cart WHERE cart_id = ? AND user_id = ?',
        [cartId, userId]
      );

      if (cartItem.length === 0) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      await con.execute(
        'UPDATE cart SET quantity = ? WHERE cart_id = ?',
        [quantity, cartId]
      );

      res.json({ success: true, message: 'Cart updated' });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Remove item from cart
  router.delete('/remove/:cartId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { cartId } = req.params;

      // Verify cart item belongs to user
      const [cartItem] = await con.execute(
        'SELECT cart_id FROM cart WHERE cart_id = ? AND user_id = ?',
        [cartId, userId]
      );

      if (cartItem.length === 0) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      await con.execute('DELETE FROM cart WHERE cart_id = ?', [cartId]);

      res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Clear entire cart
  router.delete('/clear', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      await con.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

      res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  return router;
};