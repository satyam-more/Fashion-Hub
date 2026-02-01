import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config/api';
import '../styles/auth/Login.css';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
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

  // Handle password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || "Login successful! 🎉");
        
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
        
      } else {
        setMessage(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP to email
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_ENDPOINTS.API}/otp/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("OTP sent to your email! 📧");
        setOtpSent(true);
        startOtpTimer(60);
        
        // For development: show OTP in console
        if (data.devOTP) {
          console.log("🔐 Development OTP:", data.devOTP);
          setMessage(`OTP sent! (Dev mode: ${data.devOTP})`);
        }
      } else {
        setMessage(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setMessage("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and login
  const handleOTPLogin = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_ENDPOINTS.API}/otp/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("Login successful! 🎉");
        
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } else {
        setMessage(data.error || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP login error:", err);
      setMessage("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp("");
    await handleSendOTP();
  };

  // Switch login method
  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setMessage("");
    setOtpSent(false);
    setOtp("");
    setPassword("");
    setOtpTimer(0);
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
            <p className="auth-brand-tagline">Where trends meet personality</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
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
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Login to your account</p>
          </motion.div>

          {/* Login Method Tabs */}
          <motion.div 
            className="login-tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <button
              type="button"
              className={`tab-button ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => switchLoginMethod('password')}
              disabled={isLoading}
            >
              🔒 Password
            </button>
            <button
              type="button"
              className={`tab-button ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => switchLoginMethod('otp')}
              disabled={isLoading}
            >
              📱 OTP
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Password Login Form */}
            {loginMethod === 'password' && (
              <motion.form 
                key="password-form"
                onSubmit={handlePasswordLogin} 
                className="auth-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
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

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="password-input-wrapper">
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
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

                {message && (
                  <motion.div 
                    className={`auth-message ${message.includes('successful') || message.includes('🎉') ? 'success' : 'error'}`}
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
                  {isLoading ? "Logging in..." : "Login with Password"}
                </motion.button>
              </motion.form>
            )}

            {/* OTP Login Form */}
            {loginMethod === 'otp' && (
              <motion.form 
                key="otp-form"
                onSubmit={otpSent ? handleOTPLogin : handleSendOTP} 
                className="auth-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="email-otp" className="form-label">Email</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="email"
                    id="email-otp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading || otpSent}
                  />
                </div>

                {otpSent && (
                  <motion.div 
                    className="form-group"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label htmlFor="otp" className="form-label">Enter OTP</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="form-input otp-input"
                      placeholder="Enter 6-digit OTP"
                      required
                      disabled={isLoading}
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                    <div className="otp-actions">
                      {otpTimer > 0 ? (
                        <p className="otp-timer">⏱️ Resend OTP in {otpTimer}s</p>
                      ) : (
                        <button
                          type="button"
                          className="resend-otp-button"
                          onClick={handleResendOTP}
                          disabled={isLoading || !canResend}
                        >
                          🔄 Resend OTP
                        </button>
                      )}
                      <button
                        type="button"
                        className="change-email-button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          setOtpTimer(0);
                        }}
                        disabled={isLoading}
                      >
                        ✏️ Change Email
                      </button>
                    </div>
                  </motion.div>
                )}

                {message && (
                  <motion.div 
                    className={`auth-message ${message.includes('successful') || message.includes('sent') || message.includes('🎉') || message.includes('📧') ? 'success' : 'error'}`}
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
                  disabled={isLoading || (otpSent && (!otp || otp.length !== 6))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (otpSent ? "Verifying..." : "Sending OTP...") : (otpSent ? "Verify & Login" : "Send OTP")}
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
            <Link to="/forgot-password" className="auth-link-secondary">
              Forgot password?
            </Link>
            <p className="auth-footer-text">
              Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
