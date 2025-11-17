import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/user/UPIPayment.css';

const UPIPayment = ({ orderId, amount, onSuccess, onCancel }) => {
  const [upiDetails, setUpiDetails] = useState(null);
  const [paymentUrls, setPaymentUrls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Payment options, 2: Confirmation
  const [transactionId, setTransactionId] = useState('');
  const [confirming, setConfirming] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUPIDetails();
    generatePaymentUrls();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchUPIDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/upi/details`);
      if (response.data.success) {
        setUpiDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching UPI details:', error);
    }
  };

  const generatePaymentUrls = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/upi/generate-payment-url`,
        {
          amount: parseFloat(amount),
          orderId: orderId,
          customerName: 'Customer'
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setPaymentUrls(response.data.data);
      }
    } catch (error) {
      console.error('Error generating payment URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('UPI ID copied to clipboard!');
  };

  const openUPIApp = (url, appName) => {
    // Try to open the UPI app
    window.location.href = url;
    
    // Show confirmation step after a delay
    setTimeout(() => {
      setStep(2);
    }, 2000);
  };

  const confirmPayment = async () => {
    if (!transactionId.trim()) {
      alert('Please enter the transaction ID');
      return;
    }

    setConfirming(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upi/confirm-payment`,
        {
          orderId: orderId,
          transactionId: transactionId.trim(),
          amount: parseFloat(amount)
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        onSuccess({
          orderId,
          transactionId,
          status: 'payment_pending'
        });
      } else {
        alert('Failed to confirm payment. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return <div className="upi-loading">Loading payment options...</div>;
  }

  return (
    <div className="upi-payment-container">
      {step === 1 && (
        <div className="upi-payment-step">
          <h2>Pay with UPI</h2>
          <p className="upi-instruction">Choose your preferred UPI app to complete the payment</p>

          <div className="upi-info-card">
            <div className="upi-info-row">
              <span className="upi-label">UPI ID:</span>
              <div className="upi-value-group">
                <span className="upi-value">{upiDetails?.upiId}</span>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(upiDetails?.upiId)}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            <div className="upi-info-row">
              <span className="upi-label">Merchant:</span>
              <span className="upi-value">{upiDetails?.merchantName}</span>
            </div>

            <div className="upi-info-row">
              <span className="upi-label">Amount:</span>
              <span className="upi-value amount">₹{amount}</span>
            </div>
          </div>

          <div className="upi-apps-section">
            <h3>Pay with UPI App</h3>
            <div className="upi-apps-grid">
              <button 
                className="upi-app-btn google-pay"
                onClick={() => openUPIApp(paymentUrls?.paymentUrls?.googlePay, 'Google Pay')}
              >
                <span className="app-icon">🟢</span>
                <span>Google Pay</span>
              </button>

              <button 
                className="upi-app-btn phonepe"
                onClick={() => openUPIApp(paymentUrls?.paymentUrls?.phonePe, 'PhonePe')}
              >
                <span className="app-icon">🟣</span>
                <span>PhonePe</span>
              </button>

              <button 
                className="upi-app-btn paytm"
                onClick={() => openUPIApp(paymentUrls?.paymentUrls?.paytm, 'Paytm')}
              >
                <span className="app-icon">🔵</span>
                <span>Paytm</span>
              </button>

              <button 
                className="upi-app-btn bhim"
                onClick={() => openUPIApp(paymentUrls?.paymentUrls?.bhim, 'BHIM')}
              >
                <span className="app-icon">🟠</span>
                <span>BHIM</span>
              </button>

              <button 
                className="upi-app-btn any-upi"
                onClick={() => openUPIApp(paymentUrls?.paymentUrls?.upiIntent, 'Any UPI App')}
              >
                <span className="app-icon">💳</span>
                <span>Any UPI App</span>
              </button>
            </div>
          </div>

          <div className="upi-qr-section">
            <h3>Or Scan QR Code</h3>
            <div className="qr-code-placeholder">
              {paymentUrls?.qrCodeData ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentUrls.qrCodeData)}`}
                  alt="UPI QR Code"
                  className="qr-code-image"
                />
              ) : (
                <div className="qr-code-box">
                  <p>QR Code</p>
                  <small>Scan with any UPI app</small>
                </div>
              )}
            </div>
          </div>

          <div className="upi-manual-section">
            <h3>Manual Payment</h3>
            <p>Open any UPI app and pay to:</p>
            <div className="manual-payment-details">
              <div className="detail-row">
                <strong>UPI ID:</strong> {upiDetails?.upiId}
              </div>
              <div className="detail-row">
                <strong>Amount:</strong> ₹{amount}
              </div>
              <div className="detail-row">
                <strong>Note:</strong> Order #{orderId}
              </div>
            </div>
            <button 
              className="manual-pay-btn"
              onClick={() => setStep(2)}
            >
              I have completed the payment
            </button>
          </div>

          <div className="upi-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="upi-confirmation-step">
          <h2>Confirm Your Payment</h2>
          <p className="confirmation-instruction">
            Please enter the transaction ID from your UPI app to confirm the payment
          </p>

          <div className="payment-summary">
            <div className="summary-row">
              <span>Amount Paid:</span>
              <span>₹{amount}</span>
            </div>
            <div className="summary-row">
              <span>UPI ID:</span>
              <span>{upiDetails?.upiId}</span>
            </div>
            <div className="summary-row">
              <span>Order ID:</span>
              <span>#{orderId}</span>
            </div>
          </div>

          <div className="transaction-input">
            <label>Transaction ID *</label>
            <input
              type="text"
              placeholder="Enter 12-digit transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              maxLength="12"
            />
            <small>You can find this in your UPI app's transaction history</small>
          </div>

          <div className="confirmation-actions">
            <button 
              className="back-btn" 
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button 
              className="confirm-btn"
              onClick={confirmPayment}
              disabled={confirming || !transactionId.trim()}
            >
              {confirming ? 'Confirming...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UPIPayment;