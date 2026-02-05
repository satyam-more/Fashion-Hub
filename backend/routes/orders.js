const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (con) => {
  // Get user's orders
  router.get('/', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      
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
      const userId = req.user.userId || req.user.id;
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

  // Create new order (direct POST to /orders)
  router.post('/', auth.authenticateToken, async (req, res) => {
    let connection;
    try {
      const userId = req.user.userId || req.user.id;
      const { 
        shipping_address, 
        payment_method, 
        payment_status,
        subtotal, 
        tax, 
        shipping_cost, 
        total_amount,
        items 
      } = req.body;

      if (!shipping_address) {
        return res.status(400).json({ success: false, message: 'Shipping address is required' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order items are required' });
      }

      // Check stock availability
      for (let item of items) {
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

      // Get connection from pool for transaction
      connection = await con.getConnection();
      await connection.beginTransaction();

      try {
        // Create order
        const [orderResult] = await connection.execute(`
          INSERT INTO orders (
            user_id, 
            order_number, 
            total_amount, 
            shipping_address, 
            payment_method,
            payment_status,
            subtotal,
            tax,
            shipping_cost,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
          userId,
          orderNumber,
          parseFloat(total_amount),
          shipping_address,
          payment_method || 'cod',
          payment_status || 'pending',
          parseFloat(subtotal) || 0,
          parseFloat(tax) || 0,
          parseFloat(shipping_cost) || 0
        ]);

        const orderId = orderResult.insertId;

        // Create order items
        for (let item of items) {
          const itemTotal = parseFloat(item.price) * item.quantity;
          
          await connection.execute(`
            INSERT INTO order_items (
              order_id, 
              product_id, 
              quantity, 
              size, 
              price, 
              total
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            orderId,
            item.product_id,
            item.quantity,
            item.size || 'M',
            parseFloat(item.price),
            itemTotal
          ]);

          // Update product stock
          await connection.execute(
            'UPDATE products SET quantity = quantity - ? WHERE product_id = ?',
            [item.quantity, item.product_id]
          );
        }

        // Send order confirmation email (non-blocking)
        if (process.env.EMAIL_ENABLED === 'true') {
          // Send email asynchronously without blocking the response
          setImmediate(async () => {
            try {
              // Get user details for email
              const [userDetails] = await con.execute(
                'SELECT username, email FROM users WHERE id = ?',
                [userId]
              );

              if (userDetails.length > 0) {
                const user = userDetails[0];
                const emailService = require('../services/emailService');
                
                // Get product names for items
                const itemsWithNames = [];
                for (let item of items) {
                  const [productDetails] = await con.execute(
                    'SELECT product_name FROM products WHERE product_id = ?',
                    [item.product_id]
                  );
                  
                  itemsWithNames.push({
                    product_name: productDetails[0]?.product_name || 'Product',
                    quantity: item.quantity,
                    price: parseFloat(item.price).toLocaleString(),
                    size: item.size || 'M',
                    color: 'N/A',
                    image: 'https://via.placeholder.com/300x300/d97706/ffffff?text=' + encodeURIComponent((productDetails[0]?.product_name || 'Product').substring(0, 10))
                  });
                }
                
                await emailService.sendOrderConfirmationEmail({
                  customerName: user.username,
                  customerEmail: user.email,
                  orderId: orderNumber,
                  totalAmount: parseFloat(total_amount),
                  paymentMethod: payment_method === 'cod' ? 'Cash on Delivery' : 
                                payment_method === 'upi' || payment_method === 'upi_direct' ? 'UPI Payment' : 
                                payment_method || 'COD',
                  estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                  shippingAddress: shipping_address,
                  items: itemsWithNames
                });
                
                console.log(`✅ Order confirmation email sent to ${user.email}`);
              }
            } catch (emailError) {
              console.error('Failed to send order confirmation email:', emailError.message);
              // Email failure doesn't affect order creation
            }
          });
        }

        await connection.commit();

        res.json({
          success: true,
          message: 'Order created successfully',
          data: {
            order_id: orderId,
            order_number: orderNumber
          }
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        if (connection) connection.release();
      }
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, message: 'Failed to create order' });
    }
  });

  // Create new order from cart
  router.post('/create', auth.authenticateToken, async (req, res) => {
    let connection;
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

      // Get connection from pool for transaction
      connection = await con.getConnection();
      await connection.beginTransaction();

      try {
        // Create order - try with new columns first, fallback to basic if they don't exist
        let orderResult;
        try {
          [orderResult] = await connection.execute(`
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
          [orderResult] = await connection.execute(`
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
          await connection.execute(`
            INSERT INTO order_items (order_id, product_id, quantity, size, price, total)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [orderId, item.product_id, item.quantity, item.size || null, item.price, itemTotal]);

          // Update product quantity
          await connection.execute(`
            UPDATE products SET quantity = quantity - ? WHERE product_id = ?
          `, [item.quantity, item.product_id]);
        }

        // Clear cart
        await connection.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

        // Get the complete order data to return
        const [orderData] = await connection.execute(`
          SELECT * FROM orders WHERE order_id = ?
        `, [orderId]);

        // Get order items with product details
        const [orderItems] = await connection.execute(`
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

        // Send order confirmation email (non-blocking)
        if (process.env.EMAIL_ENABLED === 'true') {
          // Send email asynchronously without blocking the response
          setImmediate(async () => {
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
                
                console.log(`✅ Order confirmation email sent to ${user.email}`);
              }
            } catch (emailError) {
              console.error('Failed to send order confirmation email:', emailError.message);
              // Email failure doesn't affect order creation
            }
          });
        }

        await connection.commit();

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
        await connection.rollback();
        throw error;
      } finally {
        if (connection) connection.release();
      }
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Cancel order (only if status is pending)
  router.put('/cancel/:orderId', auth.authenticateToken, async (req, res) => {
    let connection;
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

      // Get connection from pool for transaction
      connection = await con.getConnection();
      await connection.beginTransaction();

      try {
        // Get order items to restore product quantities
        const [orderItems] = await connection.execute(`
          SELECT product_id, quantity FROM order_items WHERE order_id = ?
        `, [orderId]);

        // Restore product quantities
        for (let item of orderItems) {
          await connection.execute(`
            UPDATE products SET quantity = quantity + ? WHERE product_id = ?
          `, [item.quantity, item.product_id]);
        }

        // Update order status
        await connection.execute(`
          UPDATE orders SET status = 'cancelled' WHERE order_id = ?
        `, [orderId]);

        await connection.commit();

        res.json({ success: true, message: 'Order cancelled successfully' });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        if (connection) connection.release();
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  return router;
};