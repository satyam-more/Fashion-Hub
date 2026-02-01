# 🔒 Security & Production Readiness TODO List

## Status Legend
- ⏳ Pending
- 🔄 In Progress
- ✅ Completed
- ❌ Blocked

---

## 🔴 CRITICAL (Must Fix Before Deployment)

### Task 1: Fix Hardcoded API URLs in Frontend 🔄
**Priority:** CRITICAL
**Impact:** App will break in production
**Files Affected:** 30+ React components

**Steps:**
1. ✅ Create frontend config file for API URL
2. ✅ Create .env and .env.example files
3. ⏳ Replace all `http://localhost:5000` with environment variable (See UPDATE_API_URLS.md)
4. ⏳ Update all component files
5. ⏳ Test locally
6. ⏳ Update deployment guide

**Estimated Time:** 2-3 hours
**Status:** Config created, manual updates needed (see UPDATE_API_URLS.md)

---

### Task 2: Remove Weak Fallback Secrets ✅
**Priority:** CRITICAL
**Impact:** Security vulnerability if .env fails

**Files Fixed:**
- ✅ `backend/middleware/auth.js` - Removed JWT_SECRET fallback
- ✅ `backend/server.js` - Removed DB credentials fallbacks
- ✅ `backend/routes/auth.js` - Removed JWT_SECRET fallbacks (3 locations)
- ✅ `backend/routes/otp.js` - Removed JWT_SECRET fallback
- ✅ `backend/routes/admin.js` - Removed DB_PASSWORD fallback
- ✅ `backend/routes/custom.js` - Removed DB_PASSWORD fallback
- ✅ `backend/routes/memberships.js` - Removed DB_PASSWORD fallback
- ✅ `backend/services/emailService.js` - Removed EMAIL credentials fallback
- ✅ `backend/migrations/rollback-razorpay-changes.js` - Removed DB fallbacks

**Steps:**
1. ✅ Remove all fallback values from auth middleware
2. ✅ Remove fallbacks from server.js
3. ✅ Remove fallbacks from all route files
4. ✅ Remove fallbacks from email service
5. ✅ Remove fallbacks from migration files

**Estimated Time:** 1 hour
**Status:** COMPLETED ✅

---

### Task 3: Add Environment Variable Validation ✅
**Priority:** CRITICAL
**Impact:** Prevents app from running with missing config

**Steps:**
1. ✅ Create `backend/config/validateEnv.js`
2. ✅ Check all required environment variables on startup
3. ✅ Provide clear error messages
4. ✅ Add to server.js startup

**Estimated Time:** 30 minutes
**Status:** COMPLETED

---

## 🟡 HIGH PRIORITY (Fix Before Public Launch)

### Task 4: Add Input Validation Middleware ✅
**Priority:** HIGH
**Impact:** Prevents SQL injection, XSS attacks

**Steps:**
1. ✅ Install express-validator
2. ✅ Create comprehensive validation middleware
3. ✅ Add validation to auth routes (register, login)
4. ✅ Add validation to OTP routes
5. ✅ Sanitize user inputs
6. ✅ Add error handling

**Validations Added:**
- User Registration (username, email, password, phone)
- User Login (email, password)
- OTP Operations (email, OTP code)
- Product Management (name, price, quantity, discount)
- Order Creation (items, address, payment method)
- Reviews (rating, review text)
- Profile Updates (username, phone, city, state, address)
- Appointments (name, email, phone, date, services)
- UPI Payments (transaction ID, UPI app)
- Search Queries
- ID Parameters

**Estimated Time:** 2 hours
**Status:** COMPLETED ✅

---

### Task 5: Add Rate Limiting ✅
**Priority:** HIGH
**Impact:** Prevents brute force attacks

**Steps:**
1. ✅ Install express-rate-limit
2. ✅ Create rate limiting middleware with different limits
3. ✅ Add rate limiting to auth routes (5 attempts/15min)
4. ✅ Add rate limiting to OTP routes (3 attempts/5min)
5. ✅ Add rate limiting to payment routes (10 attempts/hour)
6. ✅ Add rate limiting to upload routes (20 uploads/hour)
7. ✅ Add general API rate limiting (100 requests/15min)
8. ✅ Configure appropriate limits
9. ✅ Test rate limiting

**Rate Limits Applied:**
- Auth (login/register): 5 attempts per 15 minutes
- OTP requests: 3 attempts per 5 minutes
- Payment operations: 10 attempts per hour
- File uploads: 20 uploads per hour
- General API: 100 requests per 15 minutes

**Estimated Time:** 1 hour
**Status:** COMPLETED ✅

---

### Task 6: Improve CORS Configuration ✅
**Priority:** HIGH
**Impact:** Security and production deployment

**Steps:**
1. ✅ Update CORS to support multiple origins
2. ✅ Add production URL to allowed origins
3. ✅ Remove localhost fallback for production
4. ✅ Add dynamic origin validation
5. ✅ Configure preflight caching
6. ✅ Add CORS logging

**Features Added:**
- Dynamic origin validation based on environment
- Multiple allowed origins support
- Development mode allows localhost variants
- Production mode only allows configured FRONTEND_URL
- Preflight request caching (24 hours)
- CORS configuration logging on startup
- Exposed headers for client access
- Proper credentials support

**Estimated Time:** 30 minutes
**Status:** COMPLETED ✅

---

### Task 7: Add File Upload Validation ✅
**Priority:** HIGH
**Impact:** Prevents malicious file uploads

**Steps:**
1. ✅ Add file type validation (images only)
2. ✅ Add file size validation (5MB max)
3. ✅ Sanitize file names (prevent directory traversal)
4. ✅ Add magic number validation (file signature check)
5. ✅ Prevent double extensions
6. ✅ Add secure random filename generation
7. ✅ Validate file content matches MIME type
8. ✅ Clean up files on validation errors

**Security Features Added:**
- MIME type whitelist validation
- File extension whitelist validation
- Magic number (file signature) verification
- Filename sanitization (prevent path traversal)
- Secure random filename generation with crypto
- Double extension prevention
- Empty file detection
- Automatic cleanup on validation failure
- Enhanced error handling with detailed messages
- Field size and count limits

**Allowed File Types:**
- JPEG/JPG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)
- SVG (image/svg+xml)

**Limits:**
- Max file size: 5MB per file
- Max files: 10 per upload
- Max filename length: 255 characters
- Max field size: 1MB for text fields

**Estimated Time:** 1 hour
**Status:** COMPLETED ✅

---

## 🟢 MEDIUM PRIORITY (Improve Security)

### Task 8: Add Request Logging ✅
**Priority:** MEDIUM
**Impact:** Better debugging and security monitoring

**Steps:**
1. ✅ Install morgan
2. ✅ Create logger configuration
3. ✅ Log all API requests
4. ✅ Log authentication attempts
5. ✅ Log errors with stack traces
6. ✅ Configure log rotation
7. ✅ Separate access and error logs

**Logging Features:**
- Request logging with morgan
- Separate log files (access.log, error.log, app.log)
- Custom tokens (user-id, response-time)
- Development vs Production logging
- Application event logging
- Error tracking with stack traces

**Log Files Created:**
- `backend/logs/access.log` - All HTTP requests
- `backend/logs/error.log` - Only errors (4xx, 5xx)
- `backend/logs/app.log` - Application events

**Estimated Time:** 1 hour
**Status:** COMPLETED ✅

---

### Task 9: Add Security Headers ✅
**Priority:** MEDIUM
**Impact:** Prevents common web vulnerabilities

**Steps:**
1. ✅ Install helmet.js
2. ✅ Configure security headers
3. ✅ Add CSP (Content Security Policy)
4. ✅ Configure cross-origin policies
5. ✅ Test headers in production

**Security Headers Added:**
- Content-Security-Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Cross-Origin-Resource-Policy
- Cross-Origin-Embedder-Policy

**Estimated Time:** 30 minutes
**Status:** COMPLETED ✅

---

### Task 10: Implement Password Policy ✅
**Priority:** MEDIUM
**Impact:** Stronger user account security

**Steps:**
1. ✅ Add password strength validation (min 8 chars)
2. ✅ Require mix of letters, numbers, symbols
3. ✅ Add password strength indicator logic
4. ✅ Block common weak passwords
5. ✅ Update registration validation
6. ✅ Create password strength checker utility
7. ✅ Add password policy endpoint

**Password Requirements:**
- Minimum 8 characters (up to 128)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be common passwords
- Cannot be all repeating characters
- New password must differ from current

**Features Added:**
- Password strength checker with scoring (0-10)
- Real-time feedback on password quality
- API endpoint: `POST /api/auth/check-password-strength`
- API endpoint: `GET /api/auth/password-policy`
- Enhanced validation in registration and password change

**Estimated Time:** 1 hour
**Status:** COMPLETED ✅

---

### Task 11: Add HTTPS Redirect ✅
**Priority:** MEDIUM
**Impact:** Secure data transmission

**Steps:**
1. ✅ Add HTTPS redirect middleware
2. ✅ Configure for production only
3. ✅ Add HSTS (HTTP Strict Transport Security) header
4. ✅ Exclude health check endpoints from redirect
5. ✅ Add configuration logging
6. ✅ Update deployment guide

**Features Added:**
- Automatic HTTP to HTTPS redirect in production (301 permanent)
- HSTS header with 1-year max-age
- includeSubDomains and preload directives
- Health check endpoints exempted (for load balancers)
- Environment-aware (disabled in development)
- Checks both req.secure and x-forwarded-proto header
- Comprehensive logging on startup

**Security Benefits:**
- Forces encrypted connections in production
- Prevents man-in-the-middle attacks
- HSTS prevents SSL stripping attacks
- Browser remembers to use HTTPS for 1 year
- Preload eligible for browser HSTS lists

**Estimated Time:** 30 minutes
**Status:** COMPLETED ✅

---

### Task 12: Sanitize Database Queries ⏳
**Priority:** MEDIUM
**Impact:** Prevents SQL injection

**Steps:**
1. Review all raw SQL queries
2. Use parameterized queries everywhere
3. Add query sanitization
4. Test with SQL injection attempts

**Estimated Time:** 2 hours

---

## 🔵 LOW PRIORITY (Nice to Have)

### Task 13: Add API Documentation ⏳
**Priority:** LOW
**Impact:** Better developer experience

**Steps:**
1. Install Swagger/OpenAPI
2. Document all API endpoints
3. Add request/response examples
4. Host documentation

**Estimated Time:** 3 hours

---

### Task 14: Add Health Check Endpoint ✅
**Priority:** LOW
**Impact:** Better monitoring

**Steps:**
1. ✅ Create /health endpoint
2. ✅ Check database connection
3. ✅ Check email service
4. ✅ Return status JSON
5. ✅ Add detailed health check
6. ✅ Add Kubernetes-ready endpoints (/ready, /live)

**Endpoints Created:**
- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed system status with DB, memory, services
- `GET /health/ready` - Readiness probe (for Kubernetes)
- `GET /health/live` - Liveness probe (for Kubernetes)

**Estimated Time:** 30 minutes
**Status:** COMPLETED ✅

---

### Task 15: Add Automated Backups ⏳
**Priority:** LOW
**Impact:** Data protection

**Steps:**
1. Create backup script
2. Schedule daily backups
3. Store backups securely
4. Test restore process

**Estimated Time:** 2 hours

---

## 📊 Progress Summary

**Total Tasks:** 15
**Completed:** 11
**In Progress:** 0
**Pending:** 4

**Critical Tasks:** 2/3 completed, 1 in progress
**High Priority:** 4/4 completed ✅
**Medium Priority:** 4/5 completed
**Low Priority:** 1/3 completed

---

## 🎯 Recommended Order

1. ✅ Task 1: Fix Hardcoded API URLs (CRITICAL)
2. ✅ Task 2: Remove Weak Fallback Secrets (CRITICAL)
3. ✅ Task 3: Add Environment Variable Validation (CRITICAL)
4. Task 5: Add Rate Limiting (HIGH)
5. Task 4: Add Input Validation (HIGH)
6. Task 6: Improve CORS (HIGH)
7. Task 7: File Upload Validation (HIGH)
8. Task 9: Security Headers (MEDIUM)
9. Task 10: Password Policy (MEDIUM)
10. Task 8: Request Logging (MEDIUM)
11. Task 11: HTTPS Redirect (MEDIUM)
12. Task 12: Sanitize Queries (MEDIUM)
13. Task 14: Health Check (LOW)
14. Task 13: API Documentation (LOW)
15. Task 15: Automated Backups (LOW)

---

**Last Updated:** 2025-02-01
**Next Review:** After completing critical tasks
