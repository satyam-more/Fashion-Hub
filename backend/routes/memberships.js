const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { authenticateToken } = require('../middleware/auth');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// ============================================
// MEMBERSHIP ROUTES
// ============================================

// Get user's current membership
router.get('/my-membership', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    connection = await mysql.createConnection(dbConfig);

    const [memberships] = await connection.execute(
      `SELECT * FROM memberships 
       WHERE user_id = ? AND status = 'active'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (memberships.length === 0) {
      // Create default free membership
      const [result] = await connection.execute(
        `INSERT INTO memberships (user_id, plan_type, status, payment_status)
         VALUES (?, 'free', 'active', 'paid')`,
        [userId]
      );

      const [newMembership] = await connection.execute(
        `SELECT * FROM memberships WHERE membership_id = ?`,
        [result.insertId]
      );

      return res.json({
        success: true,
        data: newMembership[0]
      });
    }

    res.json({
      success: true,
      data: memberships[0]
    });

  } catch (error) {
    console.error('Get membership error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch membership'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Upgrade to premium membership
router.post('/upgrade-premium', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { payment_method, transaction_id } = req.body;

    connection = await mysql.createConnection(dbConfig);

    // Check if user already has active premium membership
    const [existing] = await connection.execute(
      `SELECT * FROM memberships 
       WHERE user_id = ? AND plan_type = 'premium' AND status = 'active'`,
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active premium membership'
      });
    }

    // Expire any existing memberships
    await connection.execute(
      `UPDATE memberships 
       SET status = 'expired' 
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    // Create premium membership (1 year)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const [result] = await connection.execute(
      `INSERT INTO memberships 
       (user_id, plan_type, status, payment_status, payment_amount, 
        transaction_id, end_date)
       VALUES (?, 'premium', 'active', 'paid', 1000.00, ?, ?)`,
      [userId, transaction_id || null, endDate]
    );

    const [newMembership] = await connection.execute(
      `SELECT * FROM memberships WHERE membership_id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      message: 'Successfully upgraded to premium membership',
      data: newMembership[0]
    });

  } catch (error) {
    console.error('Upgrade membership error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade membership'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get membership benefits
router.get('/benefits', async (req, res) => {
  try {
    const benefits = {
      free: {
        plan_name: 'Free Plan',
        price: 0,
        features: [
          'Custom tailoring appointments',
          'Standard delivery: 15-20 days',
          'Free alterations: 3 days after delivery',
          'Ready-made product replacement: 7 days',
          'Basic customer support'
        ]
      },
      premium: {
        plan_name: 'Premium Membership',
        price: 1000,
        duration: '1 year',
        features: [
          'Priority appointment booking',
          'Fast delivery: 10 days for custom products',
          'Express delivery: 2 days for ready-made products',
          'Free alterations: 10 days after delivery',
          'Extended replacement: 7 days for all products',
          'Dedicated customer support',
          'Free consultation for complex designs',
          'Premium badge on profile'
        ]
      }
    };

    res.json({
      success: true,
      data: benefits
    });

  } catch (error) {
    console.error('Get benefits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch benefits'
    });
  }
});

// Check membership status
router.get('/check-status', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    connection = await mysql.createConnection(dbConfig);

    const [memberships] = await connection.execute(
      `SELECT * FROM memberships 
       WHERE user_id = ? AND status = 'active'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (memberships.length === 0) {
      return res.json({
        success: true,
        data: {
          has_membership: false,
          plan_type: 'none',
          is_premium: false
        }
      });
    }

    const membership = memberships[0];
    const isPremium = membership.plan_type === 'premium';

    // Check if premium membership is expired
    if (isPremium && membership.end_date) {
      const now = new Date();
      const endDate = new Date(membership.end_date);
      
      if (now > endDate) {
        // Expire the membership
        await connection.execute(
          `UPDATE memberships 
           SET status = 'expired' 
           WHERE membership_id = ?`,
          [membership.membership_id]
        );

        return res.json({
          success: true,
          data: {
            has_membership: true,
            plan_type: 'expired',
            is_premium: false,
            expired_on: membership.end_date
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        has_membership: true,
        plan_type: membership.plan_type,
        is_premium: isPremium,
        start_date: membership.start_date,
        end_date: membership.end_date,
        days_remaining: isPremium && membership.end_date 
          ? Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24))
          : null
      }
    });

  } catch (error) {
    console.error('Check membership status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check membership status'
    });
  } finally {
    if (connection) await connection.end();
  }
});

module.exports = router;
