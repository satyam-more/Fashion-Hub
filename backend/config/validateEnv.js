/**
 * Environment Variable Validation
 * This module validates that all required environment variables are set
 * Fails loudly on startup if any required variable is missing
 */

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'PORT',
  'FRONTEND_URL',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
];

const optionalEnvVars = [
  'NODE_ENV',
  'EMAIL_ENABLED',
  'UPLOAD_PATH',
  'MAX_FILE_SIZE',
];

function validateEnvironment() {
  console.log('\n🔍 Validating environment variables...\n');
  
  const missing = [];
  const warnings = [];
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
      console.log(`⚠️  ${varName}: Not set (optional)`);
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.log('\n⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
  }
  
  // Validate DB_PASSWORD is not empty
  if (process.env.DB_PASSWORD === '') {
    console.log('\n⚠️  WARNING: DB_PASSWORD is empty. This may cause connection issues.');
  }
  
  // Check if running in production
  if (process.env.NODE_ENV === 'production') {
    console.log('\n🚀 Running in PRODUCTION mode');
    
    // Additional production checks
    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.includes('localhost')) {
      console.log('⚠️  WARNING: FRONTEND_URL contains localhost in production!');
    }
  } else {
    console.log('\n🔧 Running in DEVELOPMENT mode');
  }
  
  // If any required variables are missing, fail
  if (missing.length > 0) {
    console.error('\n❌ ERROR: Missing required environment variables:\n');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    console.error('   See .env.example for reference.\n');
    process.exit(1);
  }
  
  console.log('\n✅ All required environment variables are set!\n');
  return true;
}

module.exports = { validateEnvironment };
