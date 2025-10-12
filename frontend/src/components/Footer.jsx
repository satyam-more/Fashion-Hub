import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">Fashion Hub</h3>
            <p className="footer-tagline">
              Where tradition meets modern elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <div className="footer-column">
              <h4>Shop</h4>
              <Link to="/products/mens">Men's</Link>
              <Link to="/products/womens">Women's</Link>
              <Link to="/products/kids">Kid's</Link>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <Link to="/contact">Contact</Link>
              <Link to="/help">Help</Link>
              <Link to="/returns">Returns</Link>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/blog">Blog</Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="footer-contact">
            <div className="contact-info">
              <p>📞 +91 98765 43210</p>
              <p>✉️ support@fashionhub.com</p>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Twitter">🐦</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {currentYear} Fashion Hub. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;