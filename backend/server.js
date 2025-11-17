const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fashion_hub"
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
    
    // Import routes and pass the connection
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
    
    app.use("/api/auth", authRouter);
    app.use("/api/otp", otpRouter);
    app.use("/api/products", productRouter);
    app.use("/api/upload", uploadRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/orders", ordersRouter);
    app.use("/api/wishlist", wishlistRouter);
    app.use("/api/profile", profileRouter);
    app.use("/api/reviews", reviewsRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/email", emailTestRouter);
    app.use("/api/upi", upiRouter);
    app.use("/api/custom", customRouter);
    app.use("/api/memberships", membershipsRouter);

    
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