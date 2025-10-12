const express = require('express');
const emailService = require('../services/emailService');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

module.exports = () => {
  const router = express.Router();

  // Test email service (Admin only)
  router.post('/test', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
      const { testEmail, testType = 'basic' } = req.body;

      if (!testEmail) {
        return res.status(400).json({
          success: false,
          error: 'Test email address is required'
        });
      }

      let result;

      switch (testType) {
        case 'welcome':
          result = await emailService.sendWelcomeEmail(testEmail, 'Test User');
          break;
        case 'order-confirmation':
          result = await emailService.sendOrderConfirmationEmail({
            customerName: 'Test User',
            customerEmail: testEmail,
            orderId: 'FH-001',
            totalAmount: 2500,
            paymentMethod: 'COD',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            shippingAddress: 'Test Address\n123 Main Street\nMumbai, Maharashtra - 400001',
            items: [
              {
                product_name: 'Traditional Silk Saree',
                quantity: 1,
                price: '2,500',
                size: 'Free Size',
                color: 'Royal Blue',
                image: 'https://via.placeholder.com/300x300/d97706/ffffff?text=Silk+Saree'
              },
              {
                product_name: 'Designer Kurti',
                quantity: 2,
                price: '1,800',
                size: 'M',
                color: 'Pink',
                image: 'https://via.placeholder.com/300x300/d97706/ffffff?text=Designer+Kurti'
              }
            ]
          });
          break;
        case 'order-status':
          result = await emailService.sendOrderStatusUpdateEmail({
            customerName: 'Test User',
            customerEmail: testEmail,
            orderId: 'FH-001',
            status: 'shipped',
            trackingNumber: 'FH123456789',
            updatedDate: new Date().toLocaleDateString()
          });
          break;
        default:
          result = await emailService.testEmailService(testEmail);
      }

      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: result
      });

    } catch (error) {
      console.error('Email test error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        message: error.message
      });
    }
  });

  // Get email service status
  router.get('/status', authenticateToken, authorizeAdmin, (req, res) => {
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    const emailUser = process.env.EMAIL_USER;
    
    res.json({
      success: true,
      data: {
        enabled: emailEnabled,
        configured: !!(emailUser && emailUser !== 'your-email@gmail.com'),
        emailUser: emailUser ? emailUser.replace(/(.{2}).*(@.*)/, '$1***$2') : null
      }
    });
  });

  return router;
};