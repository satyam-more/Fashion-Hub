const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

module.exports = (con) => {
  // Get user profile
  router.get('/', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Get user basic info
      const [users] = await con.execute(`
        SELECT id, username, email, created_at FROM users WHERE id = ?
      `, [userId]);

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = users[0];

      // Get user profile details
      const [profiles] = await con.execute(`
        SELECT * FROM user_profiles WHERE user_id = ?
      `, [userId]);

      const profile = profiles.length > 0 ? profiles[0] : null;

      res.json({
        success: true,
        user: {
          ...user,
          profile: profile
        },
        profile: profile // Also include profile at root level for checkout form
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Update user profile
  router.put('/', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        dateOfBirth,
        gender
      } = req.body;

      // Check if profile exists
      const [existingProfile] = await con.execute(
        'SELECT profile_id FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (existingProfile.length > 0) {
        // Update existing profile
        await con.execute(`
          UPDATE user_profiles SET
            first_name = ?,
            last_name = ?,
            phone = ?,
            address = ?,
            city = ?,
            state = ?,
            postal_code = ?,
            country = ?,
            date_of_birth = ?,
            gender = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `, [
          firstName, lastName, phone, address, city, state,
          postalCode, country, dateOfBirth, gender, userId
        ]);
      } else {
        // Create new profile
        await con.execute(`
          INSERT INTO user_profiles (
            user_id, first_name, last_name, phone, address,
            city, state, postal_code, country, date_of_birth, gender
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId, firstName, lastName, phone, address, city,
          state, postalCode, country, dateOfBirth, gender
        ]);
      }

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Update user avatar
  router.put('/avatar', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { avatar } = req.body;

      if (!avatar) {
        return res.status(400).json({ success: false, message: 'Avatar URL is required' });
      }

      // Check if profile exists
      const [existingProfile] = await con.execute(
        'SELECT profile_id FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (existingProfile.length > 0) {
        // Update existing profile
        await con.execute(
          'UPDATE user_profiles SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
          [avatar, userId]
        );
      } else {
        // Create new profile with avatar
        await con.execute(
          'INSERT INTO user_profiles (user_id, avatar) VALUES (?, ?)',
          [userId, avatar]
        );
      }

      res.json({ success: true, message: 'Avatar updated successfully' });
    } catch (error) {
      console.error('Update avatar error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Change password
  router.put('/password', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password must be at least 6 characters long' 
        });
      }

      // Get current password hash
      const [users] = await con.execute(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);

      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await con.execute(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, userId]
      );

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Get user statistics
  router.get('/stats', auth.authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      // Get order count
      const [orderCount] = await con.execute(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
        [userId]
      );

      // Get wishlist count
      const [wishlistCount] = await con.execute(
        'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?',
        [userId]
      );

      // Get cart count
      const [cartCount] = await con.execute(
        'SELECT COUNT(*) as count FROM cart WHERE user_id = ?',
        [userId]
      );

      // Get total spent
      const [totalSpent] = await con.execute(
        'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ? AND status != "cancelled"',
        [userId]
      );

      res.json({
        success: true,
        stats: {
          orders: orderCount[0].count,
          wishlist: wishlistCount[0].count,
          cart: cartCount[0].count,
          totalSpent: parseFloat(totalSpent[0].total).toFixed(2)
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  return router;
};