const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (con) => {
  const router = express.Router();

  // In-memory OTP storage (in production, use Redis or database)
  const otpStore = new Map();

  // Helper function to generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Send OTP for login (alias)
  router.post('/send-login-otp', async (req, res) => {
    return sendOTPHandler(req, res);
  });

  // Verify OTP for login (alias)
  router.post('/verify-login-otp', async (req, res) => {
    return verifyOTPHandler(req, res);
  });

  // Send OTP to email
  router.post('/send-otp', async (req, res) => {
    return sendOTPHandler(req, res);
  });

  // Verify OTP
  router.post('/verify-otp', async (req, res) => {
    return verifyOTPHandler(req, res);
  });

  // Main OTP send handler
  const sendOTPHandler = async (req, res) => {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email is required' 
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          success: false,
          error: 'Please enter a valid email address' 
        });
      }

      // Check if user exists
      const [users] = await con.execute(
        'SELECT id, username, email, role FROM users WHERE email = ?',
        [email.trim().toLowerCase()]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'No account found with this email address' 
        });
      }

      const user = users[0];

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      // Store OTP with expiry
      otpStore.set(email.trim().toLowerCase(), {
        otp,
        expiresAt,
        userId: user.id,
        attempts: 0
      });

      // Send OTP via email
      if (process.env.EMAIL_ENABLED === 'true') {
        try {
          const emailService = require('../services/emailService');
          await emailService.sendOTPEmail(email.trim().toLowerCase(), user.username, otp);
          
          console.log(`✅ OTP sent to ${email}: ${otp}`); // For development only
          
          res.json({
            success: true,
            message: 'OTP sent successfully to your email',
            expiresIn: 600 // 10 minutes in seconds
          });
        } catch (emailError) {
          console.error('Failed to send OTP email:', emailError.message);
          
          // For development: still return success with OTP in console
          console.log(`⚠️ Email failed, but OTP is: ${otp}`);
          
          res.json({
            success: true,
            message: 'OTP generated (check server console in development)',
            expiresIn: 600,
            // Remove this in production!
            devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
          });
        }
      } else {
        // Email disabled - return OTP for development
        console.log(`📧 Email disabled. OTP for ${email}: ${otp}`);
        
        res.json({
          success: true,
          message: 'OTP generated successfully',
          expiresIn: 600,
          // Remove this in production!
          devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      }

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to send OTP. Please try again.' 
      });
    }
  };

  // Main OTP verify handler
  const verifyOTPHandler = async (req, res) => {
    try {
      const { email, otp } = req.body;

      // Validate input
      if (!email || !otp) {
        return res.status(400).json({ 
          success: false,
          error: 'Email and OTP are required' 
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          success: false,
          error: 'Please enter a valid email address' 
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const otpData = otpStore.get(normalizedEmail);

      // Check if OTP exists
      if (!otpData) {
        return res.status(400).json({ 
          success: false,
          error: 'OTP not found or expired. Please request a new OTP.' 
        });
      }

      // Check if OTP is expired
      if (Date.now() > otpData.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ 
          success: false,
          error: 'OTP has expired. Please request a new OTP.' 
        });
      }

      // Check attempts limit
      if (otpData.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return res.status(429).json({ 
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.' 
        });
      }

      // Verify OTP
      if (otpData.otp !== otp.trim()) {
        otpData.attempts += 1;
        otpStore.set(normalizedEmail, otpData);
        
        return res.status(400).json({ 
          success: false,
          error: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` 
        });
      }

      // OTP is valid - get user details
      const [users] = await con.execute(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [otpData.userId]
      );

      if (users.length === 0) {
        otpStore.delete(normalizedEmail);
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      const user = users[0];

      // Clear OTP from store
      otpStore.delete(normalizedEmail);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Update last login time
      await con.execute(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Role-based welcome message
      const welcomeMessage = user.role === 'admin' 
        ? `Welcome back, Administrator ${user.username}!`
        : `Welcome back, ${user.username}!`;

      res.json({
        success: true,
        message: welcomeMessage,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to verify OTP. Please try again.' 
      });
    }
  };

  // Resend OTP
  router.post('/resend-otp', async (req, res) => {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email is required' 
        });
      }

      // Clear existing OTP
      const normalizedEmail = email.trim().toLowerCase();
      otpStore.delete(normalizedEmail);

      // Use the send-otp endpoint logic
      return router.handle({ ...req, url: '/send-otp', method: 'POST' }, res);

    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to resend OTP. Please try again.' 
      });
    }
  });

  // Forgot Password - Send Reset OTP
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email is required' 
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          success: false,
          error: 'Please enter a valid email address' 
        });
      }

      const [users] = await con.execute(
        'SELECT id, username, email FROM users WHERE email = ?',
        [email.trim().toLowerCase()]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'No account found with this email address' 
        });
      }

      const user = users[0];
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      otpStore.set(`reset:${email.trim().toLowerCase()}`, {
        otp,
        expiresAt,
        userId: user.id,
        attempts: 0,
        type: 'password-reset'
      });

      if (process.env.EMAIL_ENABLED === 'true') {
        try {
          const emailService = require('../services/emailService');
          await emailService.sendPasswordResetOTP(email.trim().toLowerCase(), user.username, otp);
          
          console.log(`✅ Password reset OTP sent to ${email}: ${otp}`);
          
          res.json({
            success: true,
            message: 'Password reset OTP sent to your email',
            expiresIn: 600
          });
        } catch (emailError) {
          console.error('Failed to send reset OTP email:', emailError.message);
          console.log(`⚠️ Email failed, but OTP is: ${otp}`);
          
          res.json({
            success: true,
            message: 'OTP generated (check server console in development)',
            expiresIn: 600,
            devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
          });
        }
      } else {
        console.log(`📧 Email disabled. Reset OTP for ${email}: ${otp}`);
        
        res.json({
          success: true,
          message: 'Password reset OTP generated',
          expiresIn: 600,
          devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to process request. Please try again.' 
      });
    }
  });

  // Reset Password with OTP
  router.post('/reset-password', async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ 
          success: false,
          error: 'Email, OTP, and new password are required' 
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          success: false,
          error: 'Please enter a valid email address' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false,
          error: 'Password must be at least 6 characters long' 
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const otpData = otpStore.get(`reset:${normalizedEmail}`);

      if (!otpData) {
        return res.status(400).json({ 
          success: false,
          error: 'OTP not found or expired. Please request a new one.' 
        });
      }

      if (Date.now() > otpData.expiresAt) {
        otpStore.delete(`reset:${normalizedEmail}`);
        return res.status(400).json({ 
          success: false,
          error: 'OTP has expired. Please request a new one.' 
        });
      }

      if (otpData.attempts >= 5) {
        otpStore.delete(`reset:${normalizedEmail}`);
        return res.status(429).json({ 
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.' 
        });
      }

      if (otpData.otp !== otp.trim()) {
        otpData.attempts += 1;
        otpStore.set(`reset:${normalizedEmail}`, otpData);
        
        return res.status(400).json({ 
          success: false,
          error: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` 
        });
      }

      // OTP is valid - update password
      const bcrypt = require('bcrypt');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await con.execute(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, otpData.userId]
      );

      otpStore.delete(`reset:${normalizedEmail}`);

      res.json({
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to reset password. Please try again.' 
      });
    }
  });

  // Debug endpoint - View all stored OTPs (REMOVE IN PRODUCTION!)
  router.get('/debug/stored-otps', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }

    const otps = [];
    const now = Date.now();

    otpStore.forEach((value, key) => {
      const isExpired = now > value.expiresAt;
      const timeLeft = Math.max(0, Math.floor((value.expiresAt - now) / 1000));

      otps.push({
        email: key,
        otp: value.otp,
        userId: value.userId,
        attempts: value.attempts,
        type: value.type || 'login',
        expiresAt: new Date(value.expiresAt).toISOString(),
        timeLeftSeconds: timeLeft,
        isExpired: isExpired
      });
    });

    res.json({
      success: true,
      totalOTPs: otps.length,
      otps: otps,
      storageType: 'In-Memory Map',
      note: 'This endpoint is only available in development mode'
    });
  });

  return router;
};
