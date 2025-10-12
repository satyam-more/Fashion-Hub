import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth/Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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

  return (
    <div className="login-container">
      {/* Decorative Pattern */}
      <div className="decorative-pattern"></div>
      
      {/* Left Side - Login Form */}
      <div className="login-left">
        <div className="login-form-wrapper">
          <h2 className="login-title">Welcome Back</h2>
          
          <form onSubmit={handleSubmit}>
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
          
          {message && (
            <p className={`message ${message.includes("successful") ? "success" : "error"}`}>
              {message}
            </p>
          )}
          
          <div className="login-footer">
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