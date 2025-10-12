const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: "Access token required" 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: "Invalid or expired token" 
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to authorize admin role
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: "Access denied. Administrator privileges required.",
      userRole: req.user.role,
      requiredRole: "admin"
    });
  }
  next();
};

// Middleware to authorize user or admin role
const authorizeUser = (req, res, next) => {
  if (!['user', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      error: "Access denied. User privileges required.",
      userRole: req.user.role,
      requiredRole: "user or admin"
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeUser
};