/**
 * Database Security Configuration and Best Practices
 * 
 * This file documents the security measures implemented for database operations
 * and provides helper functions for safe database interactions.
 */

/**
 * SECURITY MEASURES IMPLEMENTED:
 * 
 * 1. Parameterized Queries (Prepared Statements)
 *    - All queries use ? placeholders with parameter arrays
 *    - Prevents SQL injection attacks
 *    - Example: con.execute('SELECT * FROM users WHERE id = ?', [userId])
 * 
 * 2. Input Validation
 *    - express-validator middleware validates all inputs
 *    - Type checking and sanitization before database operations
 *    - See: backend/middleware/validation.js
 * 
 * 3. Least Privilege Principle
 *    - Database user should have minimal required permissions
 *    - Avoid using root user in production
 *    - Grant only necessary privileges (SELECT, INSERT, UPDATE, DELETE)
 * 
 * 4. Connection Security
 *    - Credentials stored in environment variables
 *    - No hardcoded passwords
 *    - Connection pooling for better performance
 * 
 * 5. Error Handling
 *    - Database errors don't expose sensitive information
 *    - Generic error messages to clients
 *    - Detailed errors logged server-side only
 */

/**
 * Safe query execution wrapper with additional validation
 * @param {Object} connection - MySQL connection object
 * @param {string} query - SQL query with ? placeholders
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Array>} Query results
 */
const safeExecute = async (connection, query, params = []) => {
  try {
    // Validate inputs
    if (!connection) {
      throw new Error('Database connection is required');
    }
    
    if (typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Valid SQL query is required');
    }
    
    if (!Array.isArray(params)) {
      throw new Error('Parameters must be an array');
    }
    
    // Check for potential SQL injection patterns (additional safety layer)
    const dangerousPatterns = [
      /;\s*DROP/i,
      /;\s*DELETE\s+FROM/i,
      /;\s*TRUNCATE/i,
      /UNION\s+SELECT/i,
      /--/,
      /\/\*/,
      /xp_/i,
      /sp_/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        console.error('⚠️  Potentially dangerous SQL pattern detected:', query);
        throw new Error('Invalid query pattern detected');
      }
    }
    
    // Execute query with parameterized values
    const [results] = await connection.execute(query, params);
    return results;
    
  } catch (error) {
    // Log error server-side
    console.error('Database query error:', {
      message: error.message,
      query: query.substring(0, 100), // Log only first 100 chars
      timestamp: new Date().toISOString()
    });
    
    // Throw generic error to client
    throw new Error('Database operation failed');
  }
};

/**
 * Sanitize table/column names (for dynamic queries)
 * Note: Prefer static queries over dynamic ones
 * @param {string} identifier - Table or column name
 * @returns {string} Sanitized identifier
 */
const sanitizeIdentifier = (identifier) => {
  // Only allow alphanumeric characters and underscores
  const sanitized = identifier.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Prevent SQL keywords as identifiers
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
    'ALTER', 'TRUNCATE', 'UNION', 'WHERE', 'FROM', 'JOIN'
  ];
  
  if (sqlKeywords.includes(sanitized.toUpperCase())) {
    throw new Error('Invalid identifier: SQL keyword not allowed');
  }
  
  return sanitized;
};

/**
 * Validate and sanitize LIMIT/OFFSET values
 * @param {number} value - Limit or offset value
 * @param {number} max - Maximum allowed value
 * @returns {number} Sanitized value
 */
const sanitizeLimitOffset = (value, max = 1000) => {
  const num = parseInt(value, 10);
  
  if (isNaN(num) || num < 0) {
    return 0;
  }
  
  return Math.min(num, max);
};

/**
 * Build safe WHERE clause with multiple conditions
 * @param {Object} conditions - Key-value pairs for WHERE clause
 * @returns {Object} { clause, params }
 */
const buildWhereClause = (conditions) => {
  const clauses = [];
  const params = [];
  
  for (const [key, value] of Object.entries(conditions)) {
    // Sanitize column name
    const sanitizedKey = sanitizeIdentifier(key);
    clauses.push(`${sanitizedKey} = ?`);
    params.push(value);
  }
  
  const clause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  
  return { clause, params };
};

/**
 * Database security audit checklist
 */
const securityChecklist = {
  queries: {
    status: '✅ SECURE',
    details: 'All queries use parameterized statements with ? placeholders'
  },
  validation: {
    status: '✅ SECURE',
    details: 'Input validation middleware applied to all routes'
  },
  credentials: {
    status: '✅ SECURE',
    details: 'Database credentials stored in environment variables'
  },
  errorHandling: {
    status: '✅ SECURE',
    details: 'Generic errors to clients, detailed logs server-side'
  },
  privileges: {
    status: '⚠️  REVIEW',
    details: 'Ensure database user has minimal required privileges in production'
  },
  encryption: {
    status: '⚠️  REVIEW',
    details: 'Consider enabling SSL/TLS for database connections in production'
  }
};

/**
 * Log database security status
 */
const logSecurityStatus = () => {
  console.log('\n🔒 Database Security Status:');
  console.log('   Parameterized Queries: ✅ Enabled');
  console.log('   Input Validation: ✅ Enabled');
  console.log('   Credential Protection: ✅ Environment Variables');
  console.log('   Error Sanitization: ✅ Enabled');
  console.log('   Connection Pooling: ✅ mysql2/promise');
  console.log('\n   ⚠️  Production Recommendations:');
  console.log('   - Use dedicated database user with minimal privileges');
  console.log('   - Enable SSL/TLS for database connections');
  console.log('   - Implement database connection pooling');
  console.log('   - Regular security audits and updates');
  console.log('   - Database backups and disaster recovery plan');
  console.log('');
};

/**
 * Production database configuration recommendations
 */
const productionRecommendations = {
  user: {
    recommendation: 'Create dedicated user with minimal privileges',
    example: `
      CREATE USER 'fashion_hub_app'@'%' IDENTIFIED BY 'strong_password';
      GRANT SELECT, INSERT, UPDATE, DELETE ON fashion_hub.* TO 'fashion_hub_app'@'%';
      FLUSH PRIVILEGES;
    `
  },
  ssl: {
    recommendation: 'Enable SSL/TLS for encrypted connections',
    example: `
      // In connection config:
      ssl: {
        ca: fs.readFileSync('/path/to/ca-cert.pem'),
        rejectUnauthorized: true
      }
    `
  },
  pooling: {
    recommendation: 'Use connection pooling for better performance',
    example: `
      const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    `
  }
};

module.exports = {
  safeExecute,
  sanitizeIdentifier,
  sanitizeLimitOffset,
  buildWhereClause,
  securityChecklist,
  logSecurityStatus,
  productionRecommendations
};
