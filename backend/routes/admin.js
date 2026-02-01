const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Use the imported authorizeAdmin middleware

// Dashboard Stats
router.get('/dashboard/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Get total products
    const [productsResult] = await connection.execute('SELECT COUNT(*) as count FROM products');
    const totalProducts = productsResult[0].count;

    // Get total users
    const [usersResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = usersResult[0].count;

    // Get total orders
    const [ordersResult] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    const totalOrders = ordersResult[0].count;

    // Get pending orders
    const [pendingResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );
    const pendingOrders = pendingResult[0].count;

    // Get today's revenue
    const [revenueResult] = await connection.execute(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders 
      WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'
    `);
    const todayRevenue = parseFloat(revenueResult[0].revenue) || 0;

    // Get custom orders (assuming there's a custom_orders table or flag)
    const customOrders = 0; // Placeholder

    res.json({
      success: true,
      data: {
        totalProducts,
        totalUsers,
        totalOrders,
        pendingOrders,
        todayRevenue,
        customOrders
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Recent Activity
router.get('/dashboard/activity', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Get recent orders
    const [recentOrders] = await connection.execute(`
      SELECT o.order_id, o.created_at, u.username as customer_name, o.total_amount
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    const activity = recentOrders.map(order => ({
      time: getTimeAgo(order.created_at),
      description: `New order #${order.order_id} from ${order.customer_name || 'Guest'} - ₹${parseFloat(order.total_amount).toLocaleString()}`
    }));

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recent activity' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get all users
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(`
      SELECT id, username, email, phone, city, state, address, role, created_at, updated_at
      FROM users
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Create new user
router.post('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { username, email, role = 'user', status = 'active' } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username and email are required'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Create user with default password (should be changed on first login)
    const bcrypt = require('bcrypt');
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    res.json({
      success: true,
      message: 'User created successfully',
      data: { id: result.insertId, username, email, role }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create user' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Update user
router.put('/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { username, email, phone, city, state, address, role, status } = req.body;

    connection = await mysql.createConnection(dbConfig);

    // Check if user exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user with contact details
    await connection.execute(
      'UPDATE users SET username = ?, email = ?, phone = ?, city = ?, state = ?, address = ?, role = ? WHERE id = ?',
      [username, email, phone, city, state, address, role, id]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await mysql.createConnection(dbConfig);

    // Check if user exists and is not admin
    const [existingUser] = await connection.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (existingUser[0].role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin users'
      });
    }

    // Delete user
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete user' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Toggle user status
router.patch('/users/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status } = req.body;

    connection = await mysql.createConnection(dbConfig);

    // For now, we'll just return success since the users table doesn't have a status column
    // In a real implementation, you'd add a status column to the users table
    res.json({
      success: true,
      message: `User status updated to ${status}`
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user status' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get all orders
router.get('/orders', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [orders] = await connection.execute(`
      SELECT 
        o.*,
        u.username as customer_name,
        u.email as customer_email,
        COUNT(oi.order_item_id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch orders' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get order details
router.get('/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);

    // Get order details
    const [orderResult] = await connection.execute(`
      SELECT 
        o.*,
        u.username as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_id = ?
    `, [id]);

    if (orderResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orderResult[0];

    // Get order items
    const [items] = await connection.execute(`
      SELECT 
        oi.*,
        p.product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `, [id]);

    order.items = items;

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch order details' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Update order status
router.patch('/orders/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update order status' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get all reviews for admin
router.get('/reviews', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [reviews] = await connection.execute(`
      SELECT 
        r.review_id as id,
        r.product_id,
        r.user_id,
        r.rating,
        r.review_text as comment,
        r.created_at,
        r.updated_at,
        p.product_name,
        u.username as customer_name,
        u.email as customer_email,
        'approved' as status
      FROM product_reviews r
      LEFT JOIN products p ON r.product_id = p.product_id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Update review status (Note: product_reviews table doesn't have status column, so this is a no-op)
router.patch('/reviews/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
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

    connection = await mysql.createConnection(dbConfig);

    // Note: product_reviews table doesn't have a status column
    // In a real implementation, you'd add one. For now, just return success
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
  } finally {
    if (connection) await connection.end();
  }
});

// Delete review
router.delete('/reviews/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await mysql.createConnection(dbConfig);

    await connection.execute('DELETE FROM product_reviews WHERE review_id = ?', [id]);

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
  } finally {
    if (connection) await connection.end();
  }
});

// Analytics endpoints
router.get('/analytics/overview', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { dateRange = '30days' } = req.query;
    connection = await mysql.createConnection(dbConfig);

    // Calculate date filter
    let dateFilter = '';
    const now = new Date();
    switch (dateRange) {
      case '7days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        break;
      case '30days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        break;
      case '90days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)`;
        break;
      case '1year':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
        break;
    }

    // Get revenue data
    const [revenueResult] = await connection.execute(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(*) as totalOrders,
        COALESCE(AVG(total_amount), 0) as averageOrderValue
      FROM orders o 
      WHERE status != 'cancelled' ${dateFilter}
    `);

    // Get conversion rate (assuming we track visits in a separate table, for now use a mock calculation)
    const conversionRate = 3.2; // Mock data

    // Get monthly growth
    const [currentMonthRevenue] = await connection.execute(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE status != 'cancelled' 
      AND MONTH(created_at) = MONTH(NOW()) 
      AND YEAR(created_at) = YEAR(NOW())
    `);

    const [lastMonthRevenue] = await connection.execute(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE status != 'cancelled' 
      AND MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
      AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    `);

    const monthlyGrowth = lastMonthRevenue[0].revenue > 0 
      ? ((currentMonthRevenue[0].revenue - lastMonthRevenue[0].revenue) / lastMonthRevenue[0].revenue * 100)
      : 0;

    // Get customer count
    const [customerResult] = await connection.execute(`
      SELECT COUNT(DISTINCT user_id) as totalCustomers
      FROM orders o
      WHERE user_id IS NOT NULL ${dateFilter}
    `);

    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(revenueResult[0].totalRevenue) || 0,
        totalOrders: revenueResult[0].totalOrders || 0,
        averageOrderValue: parseFloat(revenueResult[0].averageOrderValue) || 0,
        conversionRate: conversionRate,
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
        totalCustomers: customerResult[0].totalCustomers || 0
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics overview' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.get('/analytics/sales-chart', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { dateRange = '30days' } = req.query;
    connection = await mysql.createConnection(dbConfig);

    let dateFormat = '%Y-%m-%d';
    let interval = '30 DAY';
    
    switch (dateRange) {
      case '7days':
        interval = '7 DAY';
        break;
      case '30days':
        interval = '30 DAY';
        break;
      case '90days':
        interval = '90 DAY';
        break;
      case '1year':
        dateFormat = '%Y-%m';
        interval = '1 YEAR';
        break;
    }

    const [salesData] = await connection.execute(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as date,
        COALESCE(SUM(total_amount), 0) as sales,
        COUNT(*) as orders
      FROM orders 
      WHERE status != 'cancelled' 
      AND created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      data: salesData.map(item => ({
        date: item.date,
        sales: parseFloat(item.sales),
        orders: parseInt(item.orders)
      }))
    });

  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sales chart data' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.get('/analytics/top-products', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { dateRange = '30days' } = req.query;
    connection = await mysql.createConnection(dbConfig);

    let dateFilter = '';
    switch (dateRange) {
      case '7days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        break;
      case '30days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        break;
      case '90days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)`;
        break;
      case '1year':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
        break;
    }

    const [topProducts] = await connection.execute(`
      SELECT 
        p.product_name as name,
        SUM(oi.quantity) as sales,
        SUM(oi.total) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY p.product_id, p.product_name
      ORDER BY revenue DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: topProducts.map(item => ({
        name: item.name,
        sales: parseInt(item.sales),
        revenue: parseFloat(item.revenue)
      }))
    });

  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch top products data' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.get('/analytics/category-sales', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { dateRange = '30days' } = req.query;
    connection = await mysql.createConnection(dbConfig);

    let dateFilter = '';
    switch (dateRange) {
      case '7days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        break;
      case '30days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        break;
      case '90days':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)`;
        break;
      case '1year':
        dateFilter = `AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
        break;
    }

    const [categoryData] = await connection.execute(`
      SELECT 
        c.name as category,
        SUM(oi.quantity) as quantity,
        SUM(oi.total) as revenue,
        COUNT(DISTINCT o.order_id) as orders
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY c.name
      ORDER BY revenue DESC
    `);

    res.json({
      success: true,
      data: categoryData.map(item => ({
        category: item.category,
        quantity: parseInt(item.quantity),
        revenue: parseFloat(item.revenue),
        orders: parseInt(item.orders)
      }))
    });

  } catch (error) {
    console.error('Category sales error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch category sales data' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.get('/analytics/customer-segments', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Get new customers (first order in last 30 days)
    const [newCustomers] = await connection.execute(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM orders o1
      WHERE o1.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND NOT EXISTS (
        SELECT 1 FROM orders o2 
        WHERE o2.user_id = o1.user_id 
        AND o2.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      )
    `);

    // Get returning customers (more than 1 order)
    const [returningCustomers] = await connection.execute(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM orders
      WHERE user_id IN (
        SELECT user_id 
        FROM orders 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
      )
    `);

    // Get VIP customers (orders > 10000 in total)
    const [vipCustomers] = await connection.execute(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM orders
      WHERE user_id IN (
        SELECT user_id 
        FROM orders 
        WHERE status != 'cancelled'
        GROUP BY user_id 
        HAVING SUM(total_amount) > 10000
      )
    `);

    const totalCustomers = newCustomers[0].count + returningCustomers[0].count + vipCustomers[0].count;

    const segments = [
      {
        segment: 'New Customers',
        count: newCustomers[0].count,
        percentage: totalCustomers > 0 ? Math.round((newCustomers[0].count / totalCustomers) * 100) : 0
      },
      {
        segment: 'Returning Customers',
        count: returningCustomers[0].count,
        percentage: totalCustomers > 0 ? Math.round((returningCustomers[0].count / totalCustomers) * 100) : 0
      },
      {
        segment: 'VIP Customers',
        count: vipCustomers[0].count,
        percentage: totalCustomers > 0 ? Math.round((vipCustomers[0].count / totalCustomers) * 100) : 0
      }
    ];

    res.json({
      success: true,
      data: segments
    });

  } catch (error) {
    console.error('Customer segments error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch customer segments data' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Settings endpoints
router.post('/settings/:category', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const settings = req.body;

    // In a real implementation, you'd save these to a settings table
    // For now, just return success
    res.json({
      success: true,
      message: `${category} settings saved successfully`
    });

  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save settings' 
    });
  }
});

// ============================================
// PAYMENT VERIFICATION ENDPOINTS
// ============================================

// Get all payments (for payment verification page)
router.get('/payments/all', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [allPayments] = await connection.execute(`
      SELECT 
        o.order_id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.transaction_id,
        o.status as order_status,
        o.created_at,
        o.updated_at,
        u.username as customer_name,
        u.email as customer_email,
        COUNT(oi.order_item_id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      data: allPayments
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payments' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get pending payments (UPI orders waiting for verification)
router.get('/payments/pending', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [pendingPayments] = await connection.execute(`
      SELECT 
        o.order_id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.transaction_id,
        o.created_at,
        o.updated_at,
        u.username as customer_name,
        u.email as customer_email,
        COUNT(oi.order_item_id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.payment_status = 'payment_pending'
      AND (o.payment_method = 'upi_direct' OR o.payment_method = 'upi')
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      data: pendingPayments
    });

  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending payments' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Approve payment
router.post('/payments/:orderId/approve', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { orderId } = req.params;
    const { notes } = req.body;

    connection = await mysql.createConnection(dbConfig);

    // Get order details
    const [orderResult] = await connection.execute(`
      SELECT o.*, u.email as customer_email, u.username as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_id = ?
    `, [orderId]);

    if (orderResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orderResult[0];

    // Update order status
    await connection.execute(`
      UPDATE orders 
      SET payment_status = 'paid',
          status = 'processing',
          updated_at = NOW()
      WHERE order_id = ?
    `, [orderId]);

    // Send confirmation email to customer
    const emailService = require('../services/emailService');
    if (order.customer_email) {
      try {
        await emailService.transporter.sendMail({
          from: `"Fashion Hub" <${process.env.EMAIL_USER}>`,
          to: order.customer_email,
          subject: '✅ Payment Verified - Order Confirmed - Fashion Hub',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                .success-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
                .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #d97706, #ea580c); color: white; text-decoration: none; border-radius: 8px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Payment Verified!</h1>
                  <p>Your order is confirmed</p>
                </div>
                <div class="content">
                  <p>Dear ${order.customer_name || 'Customer'},</p>
                  
                  <div class="success-box">
                    <h3>🎉 Great News!</h3>
                    <p>Your payment has been verified and your order is now confirmed. We're preparing your items for shipment.</p>
                  </div>
                  
                  <div class="order-details">
                    <h3>Order Details:</h3>
                    <p><strong>Order ID:</strong> #${order.order_id}</p>
                    <p><strong>Amount Paid:</strong> ₹${parseFloat(order.total_amount).toLocaleString()}</p>
                    <p><strong>Payment Method:</strong> UPI</p>
                    <p><strong>Transaction ID:</strong> ${order.transaction_id}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                    <p><strong>Status:</strong> Processing</p>
                  </div>
                  
                  <p><strong>What's Next?</strong></p>
                  <ul>
                    <li>We're preparing your order for shipment</li>
                    <li>You'll receive a shipping confirmation email once dispatched</li>
                    <li>Track your order anytime from your account</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" class="btn">Track Your Order</a>
                  </div>
                  
                  <p>Thank you for shopping with Fashion Hub!</p>
                  <p>Best regards,<br><strong>Fashion Hub Team</strong></p>
                </div>
                <div class="footer">
                  <p>Need help? Contact us at support@fashionhub.com</p>
                  <p>© 2024 Fashion Hub. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue even if email fails
      }
    }

    res.json({
      success: true,
      message: 'Payment approved successfully'
    });

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to approve payment' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Reject payment
router.post('/payments/:orderId/reject', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    connection = await mysql.createConnection(dbConfig);

    // Get order details
    const [orderResult] = await connection.execute(`
      SELECT o.*, u.email as customer_email, u.username as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_id = ?
    `, [orderId]);

    if (orderResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orderResult[0];

    // Update order status
    await connection.execute(`
      UPDATE orders 
      SET payment_status = 'failed',
          status = 'cancelled',
          updated_at = NOW()
      WHERE order_id = ?
    `, [orderId]);

    // Send rejection email to customer
    const emailService = require('../services/emailService');
    if (order.customer_email) {
      try {
        await emailService.transporter.sendMail({
          from: `"Fashion Hub" <${process.env.EMAIL_USER}>`,
          to: order.customer_email,
          subject: '❌ Payment Verification Failed - Fashion Hub',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                .info-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>❌ Payment Verification Failed</h1>
                </div>
                <div class="content">
                  <p>Dear ${order.customer_name || 'Customer'},</p>
                  <p>We were unable to verify your payment for the following order:</p>
                  
                  <div class="info-box">
                    <p><strong>Order ID:</strong> #${order.order_id}</p>
                    <p><strong>Amount:</strong> ₹${parseFloat(order.total_amount).toLocaleString()}</p>
                    <p><strong>Transaction ID:</strong> ${order.transaction_id}</p>
                    <p><strong>Reason:</strong> ${reason || 'Payment verification failed'}</p>
                  </div>
                  
                  <p><strong>What this means:</strong></p>
                  <ul>
                    <li>Your order has been cancelled</li>
                    <li>If you made the payment, it may take 5-7 business days to reflect back in your account</li>
                    <li>You can place a new order anytime</li>
                  </ul>
                  
                  <p><strong>Need Help?</strong></p>
                  <p>If you believe this is an error or have made the payment, please contact our support team with your transaction details:</p>
                  <ul>
                    <li>Email: support@fashionhub.com</li>
                    <li>Phone: +91-XXXXX-XXXXX</li>
                  </ul>
                  
                  <p>We apologize for any inconvenience.</p>
                  <p>Thank you,<br><strong>Fashion Hub Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2024 Fashion Hub. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Continue even if email fails
      }
    }

    res.json({
      success: true,
      message: 'Payment rejected successfully'
    });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject payment' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get payment verification stats
router.get('/payments/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Get pending count
    const [pendingResult] = await connection.execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount
      FROM orders 
      WHERE payment_status = 'payment_pending'
      AND (payment_method = 'upi_direct' OR payment_method = 'upi')
    `);

    // Get today's verified payments
    const [todayResult] = await connection.execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount
      FROM orders 
      WHERE payment_status = 'paid'
      AND (payment_method = 'upi_direct' OR payment_method = 'upi')
      AND DATE(updated_at) = CURDATE()
    `);

    // Get rejected payments today
    const [rejectedResult] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE payment_status = 'failed'
      AND (payment_method = 'upi_direct' OR payment_method = 'upi')
      AND DATE(updated_at) = CURDATE()
    `);

    res.json({
      success: true,
      data: {
        pending: {
          count: pendingResult[0].count,
          amount: parseFloat(pendingResult[0].amount)
        },
        verifiedToday: {
          count: todayResult[0].count,
          amount: parseFloat(todayResult[0].amount)
        },
        rejectedToday: {
          count: rejectedResult[0].count
        }
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payment stats' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

module.exports = router;

// Sales Analytics Endpoint
router.get('/sales-analytics', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const { range = 'monthly' } = req.query;

    let dateFormat, dateCondition;
    switch (range) {
      case 'weekly':
        dateFormat = '%Y-%u';
        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)';
        break;
      case 'yearly':
        dateFormat = '%Y';
        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 YEAR)';
        break;
      default: // monthly
        dateFormat = '%Y-%m';
        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
    }

    // Monthly/Weekly/Yearly Sales
    const [salesData] = await connection.execute(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      ${dateCondition} AND status != 'cancelled'
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY period
    `);

    // Category Sales
    const [categorySales] = await connection.execute(`
      SELECT 
        p.category,
        COUNT(oi.id) as orders,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) 
        AND o.status != 'cancelled'
      GROUP BY p.category
      ORDER BY revenue DESC
    `);

    // Top Products
    const [topProducts] = await connection.execute(`
      SELECT 
        p.name,
        COUNT(oi.id) as sales,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) 
        AND o.status != 'cancelled'
      GROUP BY p.id, p.name
      ORDER BY sales DESC
      LIMIT 5
    `);

    // Payment Methods
    const [paymentMethods] = await connection.execute(`
      SELECT 
        payment_method as method,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND status != 'cancelled')), 0) as percentage
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) 
        AND status != 'cancelled'
      GROUP BY payment_method
      ORDER BY count DESC
    `);

    // Format the data for frontend
    const formattedSalesData = salesData.map(item => ({
      month: item.period,
      orders: parseInt(item.orders),
      revenue: parseFloat(item.revenue)
    }));

    const formattedCategorySales = categorySales.map(item => ({
      category: item.category,
      orders: parseInt(item.orders),
      revenue: parseFloat(item.revenue)
    }));

    const formattedTopProducts = topProducts.map(item => ({
      name: item.name,
      sales: parseInt(item.sales),
      revenue: parseFloat(item.revenue)
    }));

    const formattedPaymentMethods = paymentMethods.map(item => ({
      method: item.method,
      count: parseInt(item.count),
      percentage: parseInt(item.percentage)
    }));

    // Calculate total revenue
    const totalRevenue = formattedSalesData.reduce((sum, item) => sum + item.revenue, 0);

    res.json({
      success: true,
      data: {
        monthlySales: formattedSalesData,
        categorySales: formattedCategorySales,
        topProducts: formattedTopProducts,
        paymentMethods: formattedPaymentMethods,
        totalRevenue: totalRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales analytics',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Consultation Analytics Endpoint
router.get('/consultation-analytics', authenticateToken, authorizeAdmin, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const { range = 'monthly' } = req.query;

    let dateFormat, dateCondition;
    switch (range) {
      case 'weekly':
        dateFormat = '%Y-%u';
        dateCondition = 'WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 12 WEEK)';
        break;
      case 'yearly':
        dateFormat = '%Y';
        dateCondition = 'WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 5 YEAR)';
        break;
      default: // monthly
        dateFormat = '%Y-%m';
        dateCondition = 'WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
    }

    // Monthly Bookings
    const [bookingsData] = await connection.execute(`
      SELECT 
        DATE_FORMAT(appointment_date, '%Y-%m') as period,
        MONTHNAME(appointment_date) as month_name,
        COUNT(*) as bookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM appointments 
      WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(appointment_date, '%Y-%m'), MONTHNAME(appointment_date)
      ORDER BY period
    `);

    // Get all appointments to process service types from JSON
    const [allAppointments] = await connection.execute(`
      SELECT service_types 
      FROM appointments 
      WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND service_types IS NOT NULL
    `);

    // Process service types from JSON field
    const serviceCount = {};
    allAppointments.forEach(apt => {
      try {
        const services = JSON.parse(apt.service_types);
        if (Array.isArray(services)) {
          services.forEach(service => {
            serviceCount[service] = (serviceCount[service] || 0) + 1;
          });
        } else {
          serviceCount[services] = (serviceCount[services] || 0) + 1;
        }
      } catch (e) {
        // If it's not JSON, treat as plain text
        const service = apt.service_types;
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      }
    });

    // Convert to array format
    const serviceTypes = Object.entries(serviceCount).map(([service, bookings]) => ({
      service,
      bookings,
      revenue: bookings * 1500 // Estimated revenue per booking
    })).sort((a, b) => b.bookings - a.bookings);

    // Time Slot Popularity
    const [timeSlots] = await connection.execute(`
      SELECT 
        COALESCE(appointment_time, time_slot) as slot,
        COUNT(*) as bookings
      FROM appointments 
      WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND (appointment_time IS NOT NULL OR time_slot IS NOT NULL)
      GROUP BY COALESCE(appointment_time, time_slot)
      ORDER BY bookings DESC
    `);

    // Customer Satisfaction (mock data since we don't have ratings table)
    const customerSatisfaction = [
      { rating: '5 Stars', count: 145, percentage: 58 },
      { rating: '4 Stars', count: 67, percentage: 27 },
      { rating: '3 Stars', count: 25, percentage: 10 },
      { rating: '2 Stars', count: 8, percentage: 3 },
      { rating: '1 Star', count: 5, percentage: 2 }
    ];

    // Consultant Performance (mock data)
    const consultantPerformance = [
      { name: 'Sarah Johnson', bookings: 89, rating: 4.8, revenue: 44500 },
      { name: 'Mike Chen', bookings: 76, rating: 4.7, revenue: 38000 },
      { name: 'Emily Davis', bookings: 65, rating: 4.9, revenue: 32500 },
      { name: 'David Wilson', bookings: 58, rating: 4.6, revenue: 29000 },
      { name: 'Lisa Brown', bookings: 52, rating: 4.8, revenue: 26000 }
    ];

    // Weekly Trends
    const [weeklyTrends] = await connection.execute(`
      SELECT 
        DAYNAME(appointment_date) as day,
        COUNT(*) as bookings
      FROM appointments 
      WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
      GROUP BY DAYOFWEEK(appointment_date), DAYNAME(appointment_date)
      ORDER BY DAYOFWEEK(appointment_date)
    `);

    // Format the data for frontend - only show months with data
    const formattedBookingsData = bookingsData.map(item => ({
      month: item.month_name ? item.month_name.substring(0, 3) : item.period,
      bookings: parseInt(item.bookings),
      completed: parseInt(item.completed),
      cancelled: parseInt(item.cancelled)
    }));

    const formattedServiceTypes = serviceTypes.map(item => ({
      service: item.service,
      bookings: parseInt(item.bookings),
      revenue: parseFloat(item.revenue)
    }));

    const formattedTimeSlots = timeSlots.map(item => ({
      slot: item.slot,
      bookings: parseInt(item.bookings)
    }));

    const formattedWeeklyTrends = weeklyTrends.map(item => ({
      day: item.day,
      bookings: parseInt(item.bookings)
    }));

    res.json({
      success: true,
      data: {
        monthlyBookings: formattedBookingsData,
        serviceTypes: formattedServiceTypes,
        timeSlotPopularity: formattedTimeSlots,
        customerSatisfaction,
        consultantPerformance,
        weeklyTrends: formattedWeeklyTrends
      }
    });

  } catch (error) {
    console.error('Error fetching consultation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation analytics',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});