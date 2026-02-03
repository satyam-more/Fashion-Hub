/**
 * Keep Alive Utility
 * Prevents Render free tier from spinning down by self-pinging
 * Note: This is a workaround and may be against Render's ToS for free tier
 */

const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'https://fashion-hub-backend-o7bo.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

let pingInterval = null;

/**
 * Ping the health endpoint to keep the server awake
 */
const pingServer = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const url = `${BACKEND_URL}/health`;
  
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log(`✅ Keep-alive ping successful at ${new Date().toISOString()}`);
    } else {
      console.warn(`⚠️  Keep-alive ping returned status ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('❌ Keep-alive ping failed:', err.message);
  });
};

/**
 * Start the keep-alive service
 */
const startKeepAlive = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️  Keep-alive disabled in development mode');
    return;
  }

  if (process.env.ENABLE_KEEP_ALIVE !== 'true') {
    console.log('ℹ️  Keep-alive disabled (set ENABLE_KEEP_ALIVE=true to enable)');
    return;
  }

  console.log(`🔄 Keep-alive service started (pinging every ${PING_INTERVAL / 60000} minutes)`);
  
  // Ping immediately on startup
  setTimeout(pingServer, 30000); // Wait 30 seconds after startup
  
  // Then ping every 10 minutes
  pingInterval = setInterval(pingServer, PING_INTERVAL);
};

/**
 * Stop the keep-alive service
 */
const stopKeepAlive = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('🛑 Keep-alive service stopped');
  }
};

module.exports = {
  startKeepAlive,
  stopKeepAlive
};
