/**
 * Logging Configuration
 * Configures request logging and error logging
 */

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create write streams for different log files
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '0';
  }
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(3);
});

// Custom token for user ID (if authenticated)
morgan.token('user-id', (req) => {
  return req.user ? req.user.userId : 'anonymous';
});

// Custom format for detailed logging
const detailedFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms';

// Development format (colorful console output)
const developmentLogger = morgan('dev');

// Production format (detailed file logging)
const productionLogger = morgan(detailedFormat, {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode < 400 // Only log errors in production
});

// Combined logger (logs everything to file)
const combinedLogger = morgan(detailedFormat, {
  stream: accessLogStream
});

// Error logger (only logs errors)
const errorLogger = morgan(detailedFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

// Export loggers based on environment
const getLogger = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return [combinedLogger, errorLogger];
  } else {
    return [developmentLogger, combinedLogger];
  }
};

// Log application events
const logEvent = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  if (level === 'error') {
    fs.appendFileSync(path.join(logsDir, 'error.log'), logLine);
  } else {
    fs.appendFileSync(path.join(logsDir, 'app.log'), logLine);
  }
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level.toUpperCase()}] ${message}`, meta);
  }
};

module.exports = {
  getLogger,
  logEvent,
  accessLogStream,
  errorLogStream
};
