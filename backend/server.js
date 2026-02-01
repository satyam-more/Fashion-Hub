const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mysql = require("mysql2/promise");
const path = require("path");
require('dotenv').config();

// Validate environment variables before starting
const { validateEnvironment } = require('./config/validateEnv');
validateEnvironment();

const app = express();

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection with promise support
const createConnection = async () => {
  try {
    const con = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log("✅ Connected to MySQL database");
    return con;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
};

// Initialize connection and start server
const startServer = async () => {
  try {
    const con = await createConnection();
    
    // Import rate limiters
    const { 
      apiLimiter, 
      authLimiter, 
      otpLimiter, 
      paymentLimiter, 
      uploadLimiter 
    } = require('./middleware/rateLimiter');
    
    // Import routes and pass the connection
    const healthRouter = require("./routes/health")(con);
    const authRouter = require("./routes/auth")(con);
    const otpRouter = require("./routes/otp")(con);
    const productRouter = require("./routes/products")(con);
    const uploadRouter = require("./routes/upload")();
    const cartRouter = require("./routes/cart")(con);
    const ordersRouter = require("./routes/orders")(con);
    const wishlistRouter = require("./routes/wishlist")(con);
    const profileRouter = require("./routes/profile")(con);
    const reviewsRouter = require("./routes/reviews")(con);
    const adminRouter = require("./routes/admin");
    const emailTestRouter = require("./routes/email-test")();
    const upiRouter = require("./routes/upi")(con);
    const customRouter = require("./routes/custom");
    const membershipsRouter = require("./routes/memberships");
    
    // Health check endpoint (no rate limiting for monitoring)
    app.use("/health", healthRouter);
    app.use("/api/health", healthRouter);
    
    // Apply rate limiting to routes
    app.use("/api/auth", authLimiter, authRouter);
    app.use("/api/otp", otpLimiter, otpRouter);
    app.use("/api/products", apiLimiter, productRouter);
    app.use("/api/upload", uploadLimiter, uploadRouter);
    app.use("/api/cart", apiLimiter, cartRouter);
    app.use("/api/orders", paymentLimiter, ordersRouter);
    app.use("/api/wishlist", apiLimiter, wishlistRouter);
    app.use("/api/profile", apiLimiter, profileRouter);
    app.use("/api/reviews", apiLimiter, reviewsRouter);
    app.use("/api/admin", apiLimiter, adminRouter);
    app.use("/api/email", apiLimiter, emailTestRouter);
    app.use("/api/upi", paymentLimiter, upiRouter);
    app.use("/api/custom", apiLimiter, customRouter);
    app.use("/api/memberships", apiLimiter, membershipsRouter);

    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();