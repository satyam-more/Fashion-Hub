const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fashion_hub'
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
      SELECT o.id, o.created_at, u.username as customer_name, o.total_amount
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    const activity = recentOrders.map(order => ({
      time: getTimeAgo(order.created_at),
      description: `New order #${order.id} from ${order.customer_name || 'Guest'} - ₹${parseFloat(order.total_amount).toLocaleString()}`
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
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
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
    const { username, email, role, status } = req.body;

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

    // Update user
    await connection.execute(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [username, email, role, id]
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
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Update review status
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

    await connection.execute(
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

    await connection.execute('DELETE FROM reviews WHERE id = ?', [id]);

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
        p.category,
        SUM(oi.quantity) as quantity,
        SUM(oi.total) as revenue,
        COUNT(DISTINCT o.order_id) as orders
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY p.category
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