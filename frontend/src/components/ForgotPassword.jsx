import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
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
      const res = await fetch("http://localhost:5000/api/otp/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("Reset code sent to your email!");
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
    
    if (!otp) {
      setMessage("Please enter the reset code");
      return;
    }
    
    setMessage("Verifying code...");
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
      const res = await fetch("http://localhost:5000/api/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage("Password reset successfully! Redirecting to login...");
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
    <div className="login-container">
      {/* Decorative Pattern */}
      <div className="decorative-pattern"></div>
      
      {/* Left Side - Form */}
      <div className="login-left">
        <div className="login-form-wrapper">
          <h2 className="login-title">Reset Password</h2>
          
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="login-form">
              <p className="otp-info" style={{ marginBottom: '1.5rem' }}>
                Enter your email address and we'll send you a code to reset your password.
              </p>
              
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
                {isLoading ? "Sending Code..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="login-form">
              <p className="otp-info" style={{ marginBottom: '1.5rem' }}>
                Enter the 6-digit code sent to {email}
              </p>
              
              <input
                type="email"
                placeholder="Email address"
                value={email}
                className="form-input"
                disabled
              />
              
              <input
                type="text"
                placeholder="Enter 6-digit code"
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
                disabled={isLoading || !otp || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
              
              <div className="otp-actions">
                {otpTimer > 0 ? (
                  <p className="otp-timer">
                    ⏱️ Resend code in {otpTimer}s
                  </p>
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
            </form>
          )}

          {/* Step 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="login-form">
              <p className="otp-info" style={{ marginBottom: '1.5rem' }}>
                Create a new password for your account
              </p>
              
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
                minLength="6"
              />
              
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
                minLength="6"
              />
              
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          )}
          
          {message && (
            <p className={`message ${message.includes("successfully") || message.includes("sent") ? "success" : "error"}`}>
              {message}
            </p>
          )}
          
          <div className="login-footer">
            <p>Remember your password? <Link to="/login" className="register-link">Back to Login</Link></p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Brand Content */}
      <div className="login-right">
        <div className="brand-content">
          <h1 className="brand-title">Fashion Hub</h1>
          <p className="brand-subtitle">Secure Account Recovery</p>
          
          <p className="brand-description">
            Your account security is our top priority. We use industry-standard 
            encryption and verification methods to ensure your password reset 
            process is safe and secure.
          </p>
          
          <ul className="brand-features">
            <li>Secure OTP Verification</li>
            <li>Email-Based Authentication</li>
            <li>10-Minute Code Expiry</li>
            <li>Encrypted Password Storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
