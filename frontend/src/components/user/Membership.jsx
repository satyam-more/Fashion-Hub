import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../Footer';
import '../../styles/user/Membership.css';

const Membership = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [membership, setMembership] = useState(null);
  const [benefits, setBenefits] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      const [membershipRes, benefitsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/memberships/my-membership`, {
          headers: getAuthHeaders()
        }),
        axios.get(`${API_BASE_URL}/memberships/benefits`)
      ]);

      if (membershipRes.data.success) {
        setMembership(membershipRes.data.data);
      }

      if (benefitsRes.data.success) {
        setBenefits(benefitsRes.data.data);
      }
    } catch (err) {
      console.error('Fetch membership error:', err);
      setError('Failed to load membership information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (transactionId) => {
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/memberships/upgrade-premium`,
        {
          payment_method: 'upi_direct',
          transaction_id: transactionId
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess('Successfully upgraded to Premium Membership!');
        setShowPaymentModal(false);
        setTimeout(() => {
          fetchMembershipData();
        }, 1500);
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.response?.data?.error || 'Failed to upgrade membership');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = membership?.plan_type === 'premium' && membership?.status === 'active';

  if (loading && !membership) {
    return (
      <>
        <Navbar />
        <div className="membership-container">
          <div className="loading-spinner">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="membership-container">
        <div className="membership-header">
          <h1>💎 Membership Plans</h1>
          <p>Choose the plan that's right for you</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {isPremium && (
          <div className="current-membership-banner">
            <h2>🌟 You're a Premium Member!</h2>
            <p>Enjoy all the exclusive benefits</p>
            {membership.end_date && (
              <p className="expiry-info">
                Valid until: {new Date(membership.end_date).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        )}

        <div className="plans-container">
          {/* Free Plan */}
          <div className={`plan-card ${!isPremium ? 'current-plan' : ''}`}>
            <div className="plan-header">
              <h2>Free Plan</h2>
              <div className="plan-price">
                <span className="price">₹0</span>
                <span className="period">Forever</span>
              </div>
            </div>

            {!isPremium && (
              <div className="current-badge">Current Plan</div>
            )}

            <div className="plan-features">
              <h3>Features:</h3>
              <ul>
                {benefits?.free?.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {!isPremium && (
              <button className="plan-btn current" disabled>
                Current Plan
              </button>
            )}
          </div>

          {/* Premium Plan */}
          <div className={`plan-card premium ${isPremium ? 'current-plan' : ''}`}>
            <div className="popular-badge">Most Popular</div>
            
            <div className="plan-header">
              <h2>Premium Membership</h2>
              <div className="plan-price">
                <span className="price">₹1,000</span>
                <span className="period">Per Year</span>
              </div>
            </div>

            {isPremium && (
              <div className="current-badge premium-badge">Active</div>
            )}

            <div className="plan-features">
              <h3>Everything in Free, plus:</h3>
              <ul>
                {benefits?.premium?.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-icon premium">⭐</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {!isPremium ? (
              <button 
                className="plan-btn premium" 
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade Now'}
              </button>
            ) : (
              <button className="plan-btn current" disabled>
                Active Plan
              </button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="comparison-section">
          <h2>📊 Detailed Comparison</h2>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free Plan</th>
                  <th>Premium Plan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Custom Tailoring Appointments</td>
                  <td>✓</td>
                  <td>✓ Priority</td>
                </tr>
                <tr>
                  <td>Custom Product Delivery</td>
                  <td>15-20 days</td>
                  <td>10 days</td>
                </tr>
                <tr>
                  <td>Ready-Made Delivery</td>
                  <td>Standard</td>
                  <td>2 days Express</td>
                </tr>
                <tr>
                  <td>Free Alterations Period</td>
                  <td>3 days</td>
                  <td>10 days</td>
                </tr>
                <tr>
                  <td>Product Replacement</td>
                  <td>7 days</td>
                  <td>7 days</td>
                </tr>
                <tr>
                  <td>Customer Support</td>
                  <td>Basic</td>
                  <td>Dedicated</td>
                </tr>
                <tr>
                  <td>Free Design Consultation</td>
                  <td>✗</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Premium Badge</td>
                  <td>✗</td>
                  <td>✓ Crown on Profile</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>❓ Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>How does the Premium membership work?</h3>
            <p>Pay ₹1,000 once and enjoy all premium benefits for one full year. Your membership automatically expires after 1 year.</p>
          </div>

          <div className="faq-item">
            <h3>Can I cancel my Premium membership?</h3>
            <p>Premium memberships are non-refundable but you can choose not to renew after the year ends.</p>
          </div>

          <div className="faq-item">
            <h3>What happens after my Premium membership expires?</h3>
            <p>You'll automatically be moved to the Free plan. You can upgrade again anytime.</p>
          </div>

          <div className="faq-item">
            <h3>Do I get faster delivery with Premium?</h3>
            <p>Yes! Custom products are delivered in 10 days (vs 15-20 days) and ready-made products in just 2 days.</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to upgrade?</h2>
          <p>Join thousands of satisfied premium members</p>
          {!isPremium && (
            <button 
              className="cta-btn" 
              onClick={handleUpgrade}
              disabled={loading}
            >
              Upgrade to Premium - ₹1,000/year
            </button>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
              
              <h2>💳 Complete Payment</h2>
              <p className="payment-amount">Amount: ₹1,000</p>
              
              <div className="payment-options">
                <h3>Choose Payment Method:</h3>
                
                <div className="payment-method">
                  <h4>UPI Payment</h4>
                  <p>Scan QR code or use UPI ID</p>
                  <div className="upi-details">
                    <p><strong>UPI ID:</strong> fashionhub@upi</p>
                    <p><strong>Amount:</strong> ₹1,000</p>
                  </div>
                </div>

                <div className="payment-method">
                  <h4>Bank Transfer</h4>
                  <p>Transfer to our account</p>
                  <div className="bank-details">
                    <p><strong>Account Name:</strong> Fashion Hub</p>
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>IFSC Code:</strong> SBIN0001234</p>
                  </div>
                </div>
              </div>

              <div className="transaction-input">
                <label>Enter Transaction ID / Reference Number:</label>
                <input
                  type="text"
                  id="transactionId"
                  placeholder="e.g., TXN123456789"
                  className="transaction-input-field"
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="confirm-payment-btn"
                  onClick={() => {
                    const txnId = document.getElementById('transactionId').value;
                    if (txnId) {
                      handlePaymentComplete(txnId);
                    } else {
                      setError('Please enter transaction ID');
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              <p className="payment-note">
                Note: Your membership will be activated after payment verification
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Membership;
