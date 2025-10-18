# 🔐 Forgot Password Feature

## ✅ Implementation Complete

A secure password reset feature has been added to Fashion Hub with OTP verification via email.

---

## 🎯 Features

- ✅ **3-Step Process**: Email → OTP → New Password
- ✅ **OTP Verification**: 6-digit code sent via email
- ✅ **10-Minute Expiry**: Codes expire after 10 minutes
- ✅ **5 Attempt Limit**: Maximum 5 verification attempts
- ✅ **Resend Option**: Can request new code after 60 seconds
- ✅ **Same Design**: Matches login page styling
- ✅ **In-Memory Storage**: No database changes needed

---

## 📁 Files Added/Modified

### Backend
- 📝 `backend/routes/otp.js` - Added forgot password endpoints
- ✨ `backend/templates/emails/password-reset.html` - Email template
- 📝 `backend/services/emailService.js` - Added sendPasswordResetOTP()

### Frontend
- ✨ `frontend/src/components/ForgotPassword.jsx` - New component
- 📝 `frontend/src/components/Login.jsx` - Added "Forgot Password?" link
- 📝 `frontend/src/App.jsx` - Added /forgot-password route

---

## 🔗 API Endpoints

### 1. Request Password Reset
```
POST /api/otp/forgot-password
Body: { "email": "user@example.com" }
```

### 2. Reset Password with OTP
```
POST /api/otp/reset-password
Body: {
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpass123"
}
```

---

## 🎨 User Flow

### Step 1: Enter Email
```
┌─────────────────────────────────┐
│  Reset Password                 │
├─────────────────────────────────┤
│  Email: [________________]      │
│  [   Send Reset Code   ]        │
└─────────────────────────────────┘
```

### Step 2: Enter OTP
```
┌─────────────────────────────────┐
│  Reset Password                 │
├─────────────────────────────────┤
│  Email: user@example.com        │
│  Code: [  1  2  3  4  5  6  ]   │
│  [     Verify Code     ]        │
│  ⏱️ Resend in 45s               │
│  [🔄 Resend] [✏️ Change Email]  │
└─────────────────────────────────┘
```

### Step 3: New Password
```
┌─────────────────────────────────┐
│  Reset Password                 │
├─────────────────────────────────┤
│  New Password: [___________]    │
│  Confirm: [________________]    │
│  [    Reset Password    ]       │
└─────────────────────────────────┘
```

---

## 🚀 How to Use

### For Users:
1. Go to `/login`
2. Click **"Forgot Password?"**
3. Enter your email
4. Check email for 6-digit code
5. Enter code
6. Create new password
7. Login with new password

### For Developers:
```bash
# Start backend
cd Fashion-Hub/backend
npm start

# Start frontend
cd Fashion-Hub/frontend
npm run dev

# Navigate to
http://localhost:5173/forgot-password
```

---

## 🔒 Security Features

- ✅ OTP stored server-side only (in-memory)
- ✅ 10-minute expiry
- ✅ 5 attempt limit
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email validation
- ✅ Password strength check (min 6 chars)
- ✅ Separate OTP namespace (`reset:email`)

---

## 📧 Email Template

**Subject:** 🔐 Password Reset Code - Fashion Hub

**Content:**
- Large OTP display
- Expiry notification
- Security warnings
- Support contact info

---

## 🧪 Testing

### Test Flow:
1. Navigate to `/forgot-password`
2. Enter registered email
3. Check email for OTP (or console in dev mode)
4. Enter OTP
5. Create new password
6. Verify login with new password

### Dev Mode:
- OTP shown in server console
- OTP included in API response as `devOTP`

---

## 💾 Storage

OTPs stored in-memory with prefix:
```javascript
otpStore.set(`reset:${email}`, {
  otp: "123456",
  expiresAt: timestamp,
  userId: 5,
  attempts: 0,
  type: 'password-reset'
});
```

---

## ✅ Success!

The forgot password feature is now fully functional and ready to use!

**Access:** http://localhost:5173/forgot-password
