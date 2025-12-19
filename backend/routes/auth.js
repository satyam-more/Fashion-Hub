const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (con) => {
  const router = express.Router();

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate password strength
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  // Register route
  router.post("/register", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ 
          error: "All fields are required",
          required: ["username", "email", "password"]
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      // Validate password strength
      if (!isValidPassword(password)) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // Validate username length
      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ error: "Username must be between 3 and 50 characters" });
      }

      // Validate role (default to 'user' if not provided)
      const userRole = role && ['user', 'admin'].includes(role.toLowerCase()) ? role.toLowerCase() : 'user';

      // Check if user already exists
      const [existingUsers] = await con.execute(
        "SELECT id, email, username FROM users WHERE email = ? OR username = ?",
        [email, username]
      );

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.email === email) {
          return res.status(400).json({ error: "Email is already registered" });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ error: "Username is already taken" });
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user with role
      const [result] = await con.execute(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username.trim(), email.trim().toLowerCase(), hashedPassword, userRole]
      );

      // Send welcome email
      if (process.env.EMAIL_ENABLED === 'true') {
        try {
          const emailService = require('../services/emailService');
          await emailService.sendWelcomeEmail(email.trim().toLowerCase(), username.trim());
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError.message);
          // Don't fail registration if email fails
        }
      }

      // Generate JWT token for the new user
      const token = jwt.sign(
        { 
          userId: result.insertId, 
          email: email.trim().toLowerCase(),
          username: username.trim(),
          role: userRole
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "7d" }
      );

      res.status(201).json({ 
        message: "User registered successfully",
        user: {
          id: result.insertId,
          username: username.trim(),
          email: email.trim().toLowerCase(),
          role: userRole
        },
        token
      });

    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle MySQL duplicate entry errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "User with this email or username already exists" });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login route
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email and password are required" 
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      // Find user by email (now includes role)
      const [users] = await con.execute(
        "SELECT id, username, email, password, role FROM users WHERE email = ?",
        [email.trim().toLowerCase()]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const user = users[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate JWT token with role
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "7d" }
      );

      // Update last login time (optional)
      await con.execute(
        "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [user.id]
      );

      // Role-based welcome message
      const welcomeMessage = user.role === 'admin' 
        ? `Welcome back, Administrator ${user.username}! You have full system access.`
        : `Welcome back, ${user.username}! You are logged in as a user.`;

      res.json({
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
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user profile (protected route)
  router.get("/profile", authenticateToken, async (req, res) => {
    try {
      const [users] = await con.execute(
        "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
        [req.user.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = users[0];
      const roleMessage = user.role === 'admin' 
        ? "You have administrator privileges"
        : "You have standard user privileges";

      res.json({
        user: user,
        roleInfo: {
          role: user.role,
          message: roleMessage,
          permissions: user.role === 'admin' 
            ? ['read', 'write', 'delete', 'manage_users'] 
            : ['read', 'write']
        }
      });

    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Verify token route
  router.get("/verify", authenticateToken, (req, res) => {
    const roleStatus = req.user.role === 'admin' 
      ? "Administrator access verified"
      : "User access verified";

    res.json({
      message: "Token is valid",
      roleStatus: roleStatus,
      user: {
        userId: req.user.userId,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role
      }
    });
  });

  // Admin-only route example
  router.get("/admin/users", authenticateToken, authorizeAdmin, async (req, res) => {
    try {
      const [users] = await con.execute(
        "SELECT id, username, email, phone, city, state, address, role, created_at FROM users ORDER BY created_at DESC"
      );

      res.json({
        message: "Admin access: All users retrieved successfully",
        users: users,
        totalUsers: users.length
      });

    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout route (optional - mainly for frontend to clear token)
  router.post("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Middleware to authenticate JWT token
  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key", (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = user;
      next();
    });
  }

  // Middleware to authorize admin role
  function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: "Access denied. Administrator privileges required.",
        userRole: req.user.role,
        requiredRole: "admin"
      });
    }
    next();
  }

  return router;
};