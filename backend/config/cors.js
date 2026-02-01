/**
 * CORS Configuration
 * Configures Cross-Origin Resource Sharing for security
 */

// Allowed origins based on environment
const getAllowedOrigins = () => {
  const origins = [];
  
  // Always allow the configured frontend URL
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // In development, allow localhost variants
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173');
    origins.push('http://localhost:3000');
    origins.push('http://127.0.0.1:5173');
    origins.push('http://127.0.0.1:3000');
  }
  
  return origins;
};

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  
  // Exposed headers (headers that browser can access)
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Request-Id'
  ],
  
  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
  
  // Success status for preflight
  optionsSuccessStatus: 204
};

// Log CORS configuration on startup
const logCorsConfig = () => {
  const allowedOrigins = getAllowedOrigins();
  console.log('\n🌐 CORS Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Allowed Origins:`);
  allowedOrigins.forEach(origin => {
    console.log(`   - ${origin}`);
  });
  console.log(`   Credentials: ${corsOptions.credentials}`);
  console.log(`   Methods: ${corsOptions.methods.join(', ')}`);
  console.log('');
};

module.exports = {
  corsOptions,
  getAllowedOrigins,
  logCorsConfig
};
