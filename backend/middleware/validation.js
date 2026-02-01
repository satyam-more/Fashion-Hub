/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs to prevent SQL injection and XSS attacks
 */

const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User Registration Validation
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-\[\]{}|\\:;"'<>,.\/~`])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .not().matches(/^(.)\1+$/)
    .withMessage('Password cannot be all the same character')
    .custom((value) => {
      // Check for common weak passwords
      const weakPasswords = ['password', 'Password1!', '12345678', 'Qwerty123!', 'Admin123!'];
      if (weakPasswords.some(weak => value.toLowerCase().includes(weak.toLowerCase()))) {
        throw new Error('Password is too common. Please choose a stronger password');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  
  handleValidationErrors
];

// User Login Validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// OTP Validation
const validateOTP = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('otp')
    .optional()
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  
  handleValidationErrors
];

// Product Creation/Update Validation
const validateProduct = [
  body('product_name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters')
    .escape(),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters')
    .escape(),
  
  handleValidationErrors
];

// Order Creation Validation
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('shipping_address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Shipping address must be between 10 and 500 characters')
    .escape(),
  
  body('payment_method')
    .isIn(['cod', 'upi', 'upi_direct', 'card'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// Review Validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review_text')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10 and 1000 characters')
    .escape(),
  
  handleValidationErrors
];

// Profile Update Validation
const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and spaces'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .escape(),
  
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters')
    .escape(),
  
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters')
    .escape(),
  
  handleValidationErrors
];

// Appointment Validation
const validateAppointment = [
  body('customer_name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('customer_email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('customer_phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  
  body('appointment_date')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  
  body('service_types')
    .isArray({ min: 1 })
    .withMessage('Please select at least one service type'),
  
  handleValidationErrors
];

// ID Parameter Validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID parameter'),
  
  handleValidationErrors
];

// Search Query Validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(),
  
  handleValidationErrors
];

// Password Change Validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-\[\]{}|\\:;"'<>,.\/~`])/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .not().matches(/^(.)\1+$/)
    .withMessage('Password cannot be all the same character')
    .custom((value, { req }) => {
      // Check if new password is same as current
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      // Check for common weak passwords
      const weakPasswords = ['password', 'Password1!', '12345678', 'Qwerty123!', 'Admin123!'];
      if (weakPasswords.some(weak => value.toLowerCase().includes(weak.toLowerCase()))) {
        throw new Error('Password is too common. Please choose a stronger password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// UPI Payment Validation
const validateUPIPayment = [
  body('transaction_id')
    .trim()
    .isLength({ min: 10, max: 50 })
    .withMessage('Transaction ID must be between 10 and 50 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Transaction ID can only contain letters and numbers'),
  
  body('upi_app')
    .optional()
    .isIn(['gpay', 'phonepe', 'paytm', 'other'])
    .withMessage('Invalid UPI app'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateOTP,
  validateProduct,
  validateOrder,
  validateReview,
  validateProfileUpdate,
  validateAppointment,
  validateId,
  validateSearch,
  validatePasswordChange,
  validateUPIPayment,
  handleValidationErrors
};
