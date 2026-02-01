/**
 * HTTPS Redirect Middleware
 * Forces HTTPS in production environment
 */

/**
 * Middleware to redirect HTTP to HTTPS in production
 * Only active when NODE_ENV is 'production'
 */
const httpsRedirect = (req, res, next) => {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is already secure
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }

  // Allow health check endpoints without HTTPS (for load balancers)
  if (req.path.startsWith('/health') || req.path.startsWith('/api/health')) {
    return next();
  }

  // Redirect to HTTPS
  const httpsUrl = `https://${req.headers.host}${req.url}`;
  
  console.log(`🔒 Redirecting HTTP to HTTPS: ${req.url}`);
  
  return res.redirect(301, httpsUrl);
};

/**
 * Middleware to set Strict-Transport-Security header
 * Tells browsers to always use HTTPS for this domain
 */
const hsts = (req, res, next) => {
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    // max-age: 1 year (31536000 seconds)
    // includeSubDomains: Apply to all subdomains
    // preload: Allow inclusion in browser HSTS preload lists
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  next();
};

/**
 * Log HTTPS configuration on startup
 */
const logHttpsConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('\n🔒 HTTPS Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   HTTPS Redirect: ${isProduction ? 'ENABLED' : 'DISABLED (dev mode)'}`);
  console.log(`   HSTS Header: ${isProduction ? 'ENABLED' : 'DISABLED (dev mode)'}`);
  
  if (isProduction) {
    console.log(`   ⚠️  Ensure your server has a valid SSL certificate`);
    console.log(`   ⚠️  All HTTP traffic will be redirected to HTTPS`);
  } else {
    console.log(`   ℹ️  HTTPS enforcement is disabled in development`);
  }
  console.log('');
};

module.exports = {
  httpsRedirect,
  hsts,
  logHttpsConfig
};
