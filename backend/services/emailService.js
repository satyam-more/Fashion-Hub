const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Register Handlebars helpers
handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.log('❌ Email service connection failed:', error.message);
        } else {
          console.log('✅ Email service ready');
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
    }
  }

  // Load and compile email template
  loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      console.error(`❌ Failed to load email template ${templateName}:`, error.message);
      return this.getDefaultTemplate(templateName, data);
    }
  }

  // Fallback default template
  getDefaultTemplate(type, data) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fashion Hub</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #d97706, #ea580c); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #d97706, #ea580c); color: white; text-decoration: none; border-radius: 8px; margin: 10px 0; }
          .order-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👗 Fashion Hub</h1>
            <p>Where Tradition Meets Modern Fashion</p>
          </div>
          <div class="content">
            {{content}}
          </div>
          <div class="footer">
            <p>© 2024 Fashion Hub. All rights reserved.</p>
            <p>Contact us: support@fashionhub.com | +91-XXXXX-XXXXX</p>
          </div>
        </div>
      </body>
      </html>
    `;

    let content = '';
    switch (type) {
      case 'welcome':
        content = `
          <h2>Welcome to Fashion Hub, ${data.username}! 🎉</h2>
          <p>Thank you for joining our fashion community. We're excited to help you discover the latest trends and timeless classics.</p>
          <p>Explore our collection of premium fashion items and start your style journey today.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Start Shopping</a>
        `;
        break;
      case 'order-confirmation':
        content = `
          <h2>Order Confirmation - #${data.orderId} ✅</h2>
          <p>Hi ${data.customerName},</p>
          <p>Thank you for your order! We've received your order and will start processing it soon.</p>
          <div class="order-item">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          </div>
          <p>We'll keep you updated on your order progress.</p>
        `;
        break;
      default:
        content = `<h2>Notification from Fashion Hub</h2><p>Thank you for being a valued customer!</p>`;
    }

    return baseTemplate.replace('{{content}}', content);
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, username) {
    try {
      const emailData = {
        username: username,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
        shopUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`
      };

      const htmlContent = this.loadTemplate('welcome', emailData);

      const mailOptions = {
        from: `"Fashion Hub" <${process.env.EMAIL_USER || 'noreply@fashionhub.com'}>`,
        to: userEmail,
        subject: '👗 Welcome to Fashion Hub - Your Fashion Journey Begins!',
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(orderData) {
    try {
      const emailData = {
        customerName: orderData.customerName,
        orderId: orderData.orderId,
        totalAmount: orderData.totalAmount.toLocaleString(),
        paymentMethod: orderData.paymentMethod.toUpperCase(),
        estimatedDelivery: orderData.estimatedDelivery,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`
      };

      const htmlContent = this.loadTemplate('order-confirmation', emailData);

      const mailOptions = {
        from: `"Fashion Hub Orders" <${process.env.EMAIL_USER || 'orders@fashionhub.com'}>`,
        to: orderData.customerEmail,
        subject: `🎉 Order Confirmation #${orderData.orderId} - Fashion Hub`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send order status update email
  async sendOrderStatusUpdateEmail(orderData) {
    try {
      const statusMessages = {
        processing: 'Your order is now being processed and prepared for shipment.',
        shipped: 'Great news! Your order has been shipped and is on its way.',
        delivered: 'Your order has been delivered successfully. Enjoy your new fashion items!',
        cancelled: 'Your order has been cancelled as requested.'
      };

      const emailData = {
        customerName: orderData.customerName,
        orderId: orderData.orderId,
        status: orderData.status,
        statusMessage: statusMessages[orderData.status] || 'Your order status has been updated.',
        trackingNumber: orderData.trackingNumber,
        orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`
      };

      const htmlContent = this.loadTemplate('order-status-update', emailData);

      const mailOptions = {
        from: `"Fashion Hub Updates" <${process.env.EMAIL_USER || 'updates@fashionhub.com'}>`,
        to: orderData.customerEmail,
        subject: `📦 Order Update #${orderData.orderId} - ${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order status update email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send order status update email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, resetToken, username) {
    try {
      const emailData = {
        username: username,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`,
        expiryTime: '1 hour'
      };

      const htmlContent = this.loadTemplate('password-reset', emailData);

      const mailOptions = {
        from: `"Fashion Hub Security" <${process.env.EMAIL_USER || 'security@fashionhub.com'}>`,
        to: userEmail,
        subject: '🔒 Password Reset Request - Fashion Hub',
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send OTP email
  async sendOTPEmail(userEmail, username, otp) {
    try {
      const emailData = {
        username: username,
        otp: otp,
        expiryMinutes: 10
      };

      const htmlContent = this.loadTemplate('otp-login', emailData);

      const mailOptions = {
        from: `"Fashion Hub Security" <${process.env.EMAIL_USER || 'security@fashionhub.com'}>`,
        to: userEmail,
        subject: '🔐 Your OTP for Fashion Hub Login',
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send Password Reset OTP email
  async sendPasswordResetOTP(userEmail, username, otp) {
    try {
      const emailData = {
        username: username,
        otp: otp,
        expiryMinutes: 10
      };

      const htmlContent = this.loadTemplate('password-reset', emailData);

      const mailOptions = {
        from: `"Fashion Hub Security" <${process.env.EMAIL_USER || 'security@fashionhub.com'}>`,
        to: userEmail,
        subject: '🔐 Password Reset Code - Fashion Hub',
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test email service
  async testEmailService(testEmail) {
    try {
      const mailOptions = {
        from: `"Fashion Hub Test" <${process.env.EMAIL_USER}>`,
        to: testEmail,
        subject: '🧪 Email Service Test - Fashion Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d97706;">👗 Fashion Hub Email Service Test</h2>
            <p>This is a test email to verify that the email service is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p>If you received this email, the service is configured properly! ✅</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;