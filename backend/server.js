const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mysql = require("mysql2/promise");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Validate environment variables before starting
const { validateEnvironment } = require('./config/validateEnv');
validateEnvironment();

// Import logger
const { getLogger, logEvent } = require('./config/logger');

// Import HTTPS redirect middleware
const { httpsRedirect, hsts, logHttpsConfig } = require('./middleware/httpsRedirect');

// Import database security
const { logSecurityStatus } = require('./config/dbSecurity');

const app = express();

// Trust proxy - Required for Render and other reverse proxies
app.set('trust proxy', 1);

// HTTPS redirect (must be before other middleware)
app.use(httpsRedirect);
app.use(hsts);
logHttpsConfig();

// Request logging
const loggers = getLogger();
loggers.forEach(logger => app.use(logger));

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
const { corsOptions, logCorsConfig } = require('./config/cors');
app.use(cors(corsOptions));
logCorsConfig();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection pool with promise support
const createConnectionPool = async () => {
  try {
    const poolConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 20000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };

    // Add SSL for Aiven cloud database
    if (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')) {
      poolConfig.ssl = {
        rejectUnauthorized: false
      };
      console.log('🔒 SSL enabled for Aiven connection');
    }

    const pool = mysql.createPool(poolConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    console.log(`📍 Database: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    connection.release();
    
    logSecurityStatus(); // Log database security status
    return pool;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
};

// Initialize connection pool and start server
const startServer = async () => {
  try {
    const pool = await createConnectionPool();
    
    // Import rate limiters
    const { 
      apiLimiter, 
      authLimiter, 
      otpLimiter, 
      paymentLimiter, 
      uploadLimiter,
      adminDashboardLimiter
    } = require('./middleware/rateLimiter');
    
    // Import routes and pass the connection pool
    const healthRouter = require("./routes/health")(pool);
    const authRouter = require("./routes/auth")(pool);
    const otpRouter = require("./routes/otp")(pool);
    const productRouter = require("./routes/products")(pool);
    const uploadRouter = require("./routes/upload")();
    const cartRouter = require("./routes/cart")(pool);
    const ordersRouter = require("./routes/orders")(pool);
    const wishlistRouter = require("./routes/wishlist")(pool);
    const profileRouter = require("./routes/profile")(pool);
    const reviewsRouter = require("./routes/reviews")(pool);
    const adminRouter = require("./routes/admin");
    const emailTestRouter = require("./routes/email-test")();
    const upiRouter = require("./routes/upi")(pool);
    const customRouter = require("./routes/custom");
    const membershipsRouter = require("./routes/memberships");
    
    // Health check endpoint (no rate limiting for monitoring)
    app.use("/health", healthRouter);
    app.use("/api/health", healthRouter);
    
    // API Documentation (Swagger)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Fashion Hub API Documentation'
    }));
    
    // Swagger JSON endpoint
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    console.log(`📚 API Documentation available at: http://localhost:${process.env.PORT || 5000}/api-docs`);
    
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
    app.use("/api/admin", adminDashboardLimiter, adminRouter);
    app.use("/api/email", apiLimiter, emailTestRouter);
    app.use("/api/upi", paymentLimiter, upiRouter);
    app.use("/api/custom", apiLimiter, customRouter);
    app.use("/api/memberships", apiLimiter, membershipsRouter);

    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      logEvent('info', 'Server started successfully', { 
        port: PORT, 
        environment: process.env.NODE_ENV || 'development' 
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    logEvent('error', 'Failed to start server', { 
      error: error.message, 
      stack: error.stack 
    });
    process.exit(1);
  }
};

startServer();