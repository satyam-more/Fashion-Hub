const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (con) => {
  // Get user's orders
  router.get('/', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const [orders] = await con.execute(`
        SELECT 
          o.order_id,
          o.order_number,
          o.total_amount,
          o.status,
          o.payment_status,
          o.created_at,
          o.updated_at
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `, [userId]);

      // Get order items for each order
      for (let order of orders) {
        const [items] = await con.execute(`
          SELECT 
            oi.quantity,
            oi.size,
            oi.price,
            oi.total,
            p.product_name,
            p.images,
            p.colour
          FROM order_items oi
          JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = ?
        `, [order.order_id]);

        order.items = items.map(item => ({
          ...item,
          images: item.images ? JSON.parse(item.images) : []
        }));
      }

      res.json({
        success: true,
        orders: orders
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Get single order details
  router.get('/:orderId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { orderId } = req.params;

      const [orders] = await con.execute(`
        SELECT 
          o.*
        FROM orders o
        WHERE o.order_id = ? AND o.user_id = ?
      `, [orderId, userId]);

      if (orders.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const order = orders[0];

      // Get order items
      const [items] = await con.execute(`
        SELECT 
          oi.*,
          p.product_name,
          p.images,
          p.colour
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `, [orderId]);

      order.items = items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : []
      }));

      res.json({
        success: true,
        order: order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Create new order from cart
  router.post('/create', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { 
        shipping_address, 
        payment_method, 
        subtotal, 
        tax, 
        shipping_cost, 
        total_amount,
        items 
      } = req.body;

      if (!shipping_address) {
        return res.status(400).json({ success: false, message: 'Shipping address is required' });
      }

      let cartItems;
      let calculatedTotal;

      if (items && items.length > 0) {
        // Use provided items (from checkout form)
        cartItems = items;
        calculatedTotal = parseFloat(total_amount) || parseFloat(subtotal) || 0;
      } else {
        // Get cart items from database
        const [dbCartItems] = await con.execute(`
          SELECT 
            c.cart_id,
            c.product_id,
            c.quantity,
            c.size,
            p.price,
            p.product_name,
            p.quantity as stock,
            p.images
          FROM cart c
          JOIN products p ON c.product_id = p.product_id
          WHERE c.user_id = ?
        `, [userId]);

        if (dbCartItems.length === 0) {
          return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        cartItems = dbCartItems;
        calculatedTotal = cartItems.reduce((sum, item) => {
          return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
      }

      // Check stock availability
      for (let item of cartItems) {
        const [stockCheck] = await con.execute(
          'SELECT quantity as stock, product_name FROM products WHERE product_id = ?',
          [item.product_id]
        );
        
        if (stockCheck.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: `Product not found: ${item.product_name || 'Unknown'}` 
          });
        }
        
        if (stockCheck[0].stock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${stockCheck[0].product_name}` 
          });
        }
      }

      // Generate order number
      const orderNumber = 'FH' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

      // Start transaction
      await con.beginTransaction();

      try {
        // Create order - try with new columns first, fallback to basic if they don't exist
        let orderResult;
        try {
          [orderResult] = await con.execute(`
            INSERT INTO orders (
              user_id, 
              order_number, 
              total_amount, 
              shipping_address, 
              payment_method,
              subtotal,
              tax,
              shipping_cost,
              status,
              payment_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
          `, [
            userId, 
            orderNumber, 
            calculatedTotal, 
            shipping_address, 
            payment_method || 'cod',
            parseFloat(subtotal) || calculatedTotal,
            parseFloat(tax) || 0,
            parseFloat(shipping_cost) || 0
          ]);
        } catch (columnError) {
          // Fallback to basic order creation if new columns don't exist
          console.log('Using fallback order creation (missing columns):', columnError.message);
          [orderResult] = await con.execute(`
            INSERT INTO orders (
              user_id, 
              order_number, 
              total_amount, 
              shipping_address, 
              payment_method,
              status,
              payment_status
            )
            VALUES (?, ?, ?, ?, ?, 'pending', 'pending')
          `, [
            userId, 
            orderNumber, 
            calculatedTotal, 
            shipping_address, 
            payment_method || 'cod'
          ]);
        }

        const orderId = orderResult.insertId;

        // Create order items and update product quantities
        for (let item of cartItems) {
          const itemTotal = parseFloat(item.price) * item.quantity;
          
          // Insert order item
          await con.execute(`
            INSERT INTO order_items (order_id, product_id, quantity, size, price, total)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [orderId, item.product_id, item.quantity, item.size || null, item.price, itemTotal]);

          // Update product quantity
          await con.execute(`
            UPDATE products SET quantity = quantity - ? WHERE product_id = ?
          `, [item.quantity, item.product_id]);
        }

        // Clear cart
        await con.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

        // Get the complete order data to return
        const [orderData] = await con.execute(`
          SELECT * FROM orders WHERE order_id = ?
        `, [orderId]);

        // Get order items with product details
        const [orderItems] = await con.execute(`
          SELECT 
            oi.*,
            p.product_name,
            p.images,
            p.colour
          FROM order_items oi
          JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = ?
        `, [orderId]);

        const order = orderData[0];
        order.items = orderItems.map(item => ({
          ...item,
          images: item.images ? JSON.parse(item.images) : []
        }));

        // Send order confirmation email
        if (process.env.EMAIL_ENABLED === 'true') {
          try {
            // Get user details for email
            const [userDetails] = await con.execute(
              'SELECT username, email FROM users WHERE id = ?',
              [userId]
            );

            if (userDetails.length > 0) {
              const user = userDetails[0];
              const emailService = require('../services/emailService');
              
              await emailService.sendOrderConfirmationEmail({
                customerName: user.username,
                customerEmail: user.email,
                orderId: orderNumber,
                totalAmount: calculatedTotal,
                paymentMethod: payment_method || 'COD',
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                shippingAddress: shipping_address,
                items: orderItems.map(item => {
                  let imageUrl = null;
                  // For now, let's use a placeholder image to test the email template
                  // You can replace this with actual product images later
                  imageUrl = 'https://via.placeholder.com/300x300/d97706/ffffff?text=' + encodeURIComponent(item.product_name.substring(0, 10));
                  return {
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.total.toLocaleString(),
                    size: item.size,
                    color: item.colour,
                    image: imageUrl
                  };
                })
              });
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError.message);
            // Don't fail order creation if email fails
          }
        }

        await con.commit();

        res.json({
          success: true,
          message: 'Order created successfully',
          order: {
            order_id: orderId,
            order_number: orderNumber,
            ...order
          }
        });
      } catch (error) {
        await con.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Cancel order (only if status is pending)
  router.put('/cancel/:orderId', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { orderId } = req.params;

      // Check if order exists and belongs to user
      const [orders] = await con.execute(`
        SELECT order_id, status FROM orders 
        WHERE order_id = ? AND user_id = ?
      `, [orderId, userId]);

      if (orders.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (orders[0].status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: 'Order cannot be cancelled' 
        });
      }

      // Start transaction
      await con.beginTransaction();

      try {
        // Get order items to restore product quantities
        const [orderItems] = await con.execute(`
          SELECT product_id, quantity FROM order_items WHERE order_id = ?
        `, [orderId]);

        // Restore product quantities
        for (let item of orderItems) {
          await con.execute(`
            UPDATE products SET quantity = quantity + ? WHERE product_id = ?
          `, [item.quantity, item.product_id]);
        }

        // Update order status
        await con.execute(`
          UPDATE orders SET status = 'cancelled' WHERE order_id = ?
        `, [orderId]);

        await con.commit();

        res.json({ success: true, message: 'Order cancelled successfully' });
      } catch (error) {
        await con.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  return router;
};