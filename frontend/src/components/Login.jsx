import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/auth/Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
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
            <p className="auth-brand-tagline">Discover your style, define your essence</p>
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

          <motion.form 
            onSubmit={handleLogin} 
            className="auth-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
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
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {message && (
              <motion.div 
                className={`auth-message ${message.includes('successful') ? 'success' : 'error'}`}
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
              {isLoading ? "Logging in..." : "Login"}
            </motion.button>
          </motion.form>

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
