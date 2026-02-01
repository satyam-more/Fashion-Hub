import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/auth/Login.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  // Start countdown timer for OTP resend
  const startOtpTimer = (seconds = 60) => {
    setOtpTimer(seconds);
    setCanResend(false);
    
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_ENDPOINTS.API}/otp/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("Reset code sent to your email! 📧");
        setStep(2);
        startOtpTimer(60);
        
        // For development: show OTP in console
        if (data.devOTP) {
          console.log("🔐 Development Reset OTP:", data.devOTP);
          setMessage(`Reset code sent! (Dev mode: ${data.devOTP})`);
        }
      } else {
        setMessage(data.error || "Failed to send reset code");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setMessage("Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit code");
      return;
    }
    
    setMessage("Code verified! ✓");
    setStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in all fields");
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_ENDPOINTS.API}/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("Password reset successfully! 🎉 Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.error || "Failed to reset password");
        if (data.error && data.error.includes("Invalid OTP")) {
          setStep(2); // Go back to OTP step
        }
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setMessage("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp("");
    await handleSendOTP({ preventDefault: () => {} });
  };

  return (
    <div className="auth-container">
      {/* Left Side - Fashion Image */}
      <motion.div 
        className="auth-image-side"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-overlay">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="auth-brand-title">Fashion Hub</h1>
            <p className="auth-brand-tagline">Secure Account Recovery</p>
            <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
              <p>✓ Secure OTP Verification</p>
              <p>✓ Email-Based Authentication</p>
              <p>✓ 10-Minute Code Expiry</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        className="auth-form-side"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-form-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && "Enter the code sent to your email"}
              {step === 3 && "Create a new password"}
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-circle">1</div>
              <span className="step-label">Email</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-circle">2</div>
              <span className="step-label">Verify</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span className="step-label">Reset</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <motion.form 
                key="step1"
                onSubmit={handleSendOTP} 
                className="auth-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                {message && (
                  <motion.div 
                    className={`auth-message ${message.includes('sent') || message.includes('📧') ? 'success' : 'error'}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? "Sending Code..." : "Send Reset Code"}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: Enter OTP */}
            {step === 2 && (
              <motion.form 
                key="step2"
                onSubmit={handleVerifyOTP} 
                className="auth-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="email-display" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email-display"
                    value={email}
                    className="form-input"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="otp" className="form-label">Reset Code</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input otp-input"
                    placeholder="Enter 6-digit code"
                    required
                    disabled={isLoading}
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                  <div className="otp-actions">
                    {otpTimer > 0 ? (
                      <p className="otp-timer">⏱️ Resend code in {otpTimer}s</p>
                    ) : (
                      <button
                        type="button"
                        className="resend-otp-button"
                        onClick={handleResendOTP}
                        disabled={isLoading || !canResend}
                      >
                        🔄 Resend Code
                      </button>
                    )}
                    <button
                      type="button"
                      className="change-email-button"
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setOtpTimer(0);
                      }}
                      disabled={isLoading}
                    >
                      ✏️ Change Email
                    </button>
                  </div>
                </div>

                {message && (
                  <motion.div 
                    className={`auth-message ${message.includes('verified') || message.includes('✓') ? 'success' : 'error'}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading || !otp || otp.length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </motion.button>
              </motion.form>
            )}

            {/* Step 3: Enter New Password */}
            {step === 3 && (
              <motion.form 
                key="step3"
                onSubmit={handleResetPassword} 
                className="auth-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <div className="password-input-wrapper">
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-input"
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input"
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading}
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {confirmPassword && (
                    <motion.p 
                      className={`password-match ${newPassword === confirmPassword ? 'match' : 'no-match'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </motion.p>
                  )}
                </div>

                {message && (
                  <motion.div 
                    className={`auth-message ${message.includes('successfully') || message.includes('🎉') ? 'success' : 'error'}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="auth-footer-text">
              Remember your password? <Link to="/login" className="auth-link">Back to Login</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
