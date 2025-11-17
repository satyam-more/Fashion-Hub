const express = require('express');
const { authenticateToken } = require('../middleware/auth');

module.exports = (connection) => {
  const router = express.Router();

  // Get UPI payment details
  router.get('/details', (req, res) => {
    try {
      const upiDetails = {
        upiId: '88053091@ybl',
        merchantName: 'Fashion Hub',
        qrCodeUrl: null // Will be generated dynamically
      };

      res.json({
        success: true,
        data: upiDetails
      });
    } catch (error) {
      console.error('Get UPI details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch UPI details'
      });
    }
  });

  // Generate UPI payment URL
  router.post('/generate-payment-url', authenticateToken, (req, res) => {
    try {
      const { amount, orderId, customerName } = req.body;

      if (!amount || !orderId) {
        return res.status(400).json({
          success: false,
          error: 'Amount and Order ID are required'
        });
      }

      const upiId = '88053091@ybl';
      const merchantName = 'Fashion Hub';
      const transactionNote = `Payment for Order #${orderId}`;

      // Generate UPI Intent URL
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

      // Generate different app-specific URLs
      const paymentUrls = {
        upiIntent: upiUrl,
        googlePay: `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
        phonePe: `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
        paytm: `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
        bhim: `bhim://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
      };

      res.json({
        success: true,
        data: {
          upiId,
          merchantName,
          amount,
          orderId,
          paymentUrls,
          qrCodeData: upiUrl
        }
      });

    } catch (error) {
      console.error('Generate UPI URL error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate payment URL'
      });
    }
  });

  // Confirm payment (customer confirms they've paid)
  router.post('/confirm-payment', authenticateToken, async (req, res) => {
    try {
      const { orderId, transactionId, amount } = req.body;
      const userId = req.user.userId || req.user.id;

      if (!orderId || !transactionId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Order ID, Transaction ID, and Amount are required'
        });
      }

      // Validate transaction ID format (12 digits)
      if (!/^\d{12}$/.test(transactionId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction ID format. Must be 12 digits.'
        });
      }

      // Check if transaction ID already used
      const [existingTxn] = await connection.execute(
        'SELECT order_id FROM orders WHERE transaction_id = ? AND order_id != ?',
        [transactionId, orderId]
      );

      if (existingTxn.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'This transaction ID has already been used for another order.'
        });
      }

      // Update order status to payment_pending (waiting for admin verification)
      const updateQuery = `
        UPDATE orders 
        SET payment_status = 'payment_pending',
            payment_method = 'upi_direct',
            transaction_id = ?,
            updated_at = NOW()
        WHERE order_id = ? AND user_id = ?
      `;

      await connection.execute(updateQuery, [transactionId, orderId, userId]);

      res.json({
        success: true,
        message: 'Payment confirmation received. Your order will be processed once payment is verified by our team (usually within 1-2 hours).',
        data: {
          orderId,
          status: 'payment_pending'
        }
      });

    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm payment'
      });
    }
  });

  // Admin: Get pending payments for verification
  router.get('/admin/pending-payments', authenticateToken, async (req, res) => {
    try {
      // Check if user is admin (you should add proper admin middleware)
      const userRole = req.user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin only.'
        });
      }

      const query = `
        SELECT 
          o.order_id,
          o.user_id,
          o.total_amount,
          o.transaction_id,
          o.payment_status,
          o.created_at,
          u.username,
          u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.payment_status = 'payment_pending'
          AND o.payment_method = 'upi_direct'
        ORDER BY o.created_at DESC
      `;

      const [pendingPayments] = await connection.execute(query);

      res.json({
        success: true,
        data: pendingPayments,
        count: pendingPayments.length
      });

    } catch (error) {
      console.error('Get pending payments error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending payments'
      });
    }
  });

  // Admin: Verify payment
  router.post('/admin/verify-payment', authenticateToken, async (req, res) => {
    try {
      const { orderId, verified, adminNotes } = req.body;
      
      // Check if user is admin
      const userRole = req.user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin only.'
        });
      }

      if (!orderId || verified === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Order ID and verification status are required'
        });
      }

      const newStatus = verified ? 'paid' : 'payment_failed';
      const orderStatus = verified ? 'confirmed' : 'cancelled';

      const updateQuery = `
        UPDATE orders 
        SET payment_status = ?,
            status = ?,
            admin_notes = ?,
            updated_at = NOW()
        WHERE order_id = ?
      `;

      await connection.execute(updateQuery, [newStatus, orderStatus, adminNotes || null, orderId]);

      res.json({
        success: true,
        message: verified ? 'Payment verified successfully' : 'Payment marked as failed',
        data: {
          orderId,
          paymentStatus: newStatus,
          orderStatus
        }
      });

    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify payment'
      });
    }
  });

  return router;
};