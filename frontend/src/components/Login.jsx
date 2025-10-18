import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth/Login.css';

const Login = () => {
  // Common states
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Password login states
  const [password, setPassword] = useState("");
  
  // OTP login states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  // Handle password-based login
  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || "Login successful");
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        
        // Store user data if provided
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }
        
        // Navigate to home page for all users (including admin)
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

  // Handle sending OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("OTP sent successfully! Check your email.");
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

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    
    if (!otp) {
      setMessage("Please enter the OTP");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage(data.message || "Login successful");
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        
        // Store user data if provided
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }
        
        // Navigate to home page
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
        
      } else {
        setMessage(data.error || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMessage("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setOtp("");
    await handleSendOtp();
  };

  // Switch login method
  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setMessage("");
    setPassword("");
    setOtp("");
    setOtpSent(false);
    setOtpTimer(0);
    setCanResend(false);
  };

  return (
    <div className="login-container">
      {/* Decorative Pattern */}
      <div className="decorative-pattern"></div>
      
      {/* Left Side - Login Form */}
      <div className="login-left">
        <div className="login-form-wrapper">
          <h2 className="login-title">Welcome Back</h2>
          
          {/* Login Method Tabs */}
          <div className="login-tabs">
            <button
              className={`tab-button ${loginMethod === "password" ? "active" : ""}`}
              onClick={() => switchLoginMethod("password")}
              disabled={isLoading}
            >
              🔑 Password
            </button>
            <button
              className={`tab-button ${loginMethod === "otp" ? "active" : ""}`}
              onClick={() => switchLoginMethod("otp")}
              disabled={isLoading}
            >
              📱 OTP
            </button>
          </div>

          {/* Password Login Form */}
          {loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="login-form">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
              />
              
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
              />
              
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {loginMethod === "otp" && (
            <div className="otp-login-section">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="login-form">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                    disabled={isLoading}
                  />
                  
                  <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                  
                  <p className="otp-info">
                    📧 We'll send a 6-digit code to your email
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="login-form">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    className="form-input"
                    disabled
                  />
                  
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input otp-input"
                    required
                    disabled={isLoading}
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                  
                  <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                  
                  <div className="otp-actions">
                    {otpTimer > 0 ? (
                      <p className="otp-timer">
                        ⏱️ Resend OTP in {otpTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        className="resend-otp-button"
                        onClick={handleResendOtp}
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
                </form>
              )}
            </div>
          )}
          
          {message && (
            <p className={`message ${message.includes("successful") || message.includes("sent") ? "success" : "error"}`}>
              {message}
            </p>
          )}
          
          <div className="login-footer">
            <p>
              <Link to="/forgot-password" className="register-link" style={{ marginRight: '1rem' }}>
                Forgot Password?
              </Link>
            </p>
            <p>Don't have an account? <Link to="/register" className="register-link">Create Account</Link></p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Brand Content */}
      <div className="login-right">
        <div className="brand-content">
          <h1 className="brand-title">Fashion Hub</h1>
          <p className="brand-subtitle">Elegance Redefined</p>
          
          <p className="brand-description">
            Step into a world of timeless sophistication and contemporary style. 
            Fashion Hub curates the finest collections from renowned designers, 
            bringing you exclusive pieces that define luxury and elegance.
          </p>
          
          <ul className="brand-features">
            <li>Exclusive Designer Collections</li>
            <li>Premium Quality Assurance</li>
            <li>Personalized Styling Services</li>
            <li>Worldwide Express Delivery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;