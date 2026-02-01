import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/PaymentVerification.css';
import '../../styles/admin/ExportButton.css';
import { exportPaymentsReport } from '../../utils/pdfExport';

const PaymentVerification = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  

  useEffect(() => {
    fetchPendingPayments();
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingPayments();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/payments/all`,
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        setPendingPayments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/payments/stats`,
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const approvePayment = async (orderId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/payments/${orderId}/approve`,
        {},
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        alert('Payment approved successfully!');
        fetchPendingPayments();
        fetchStats();
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectPayment = async (orderId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this payment?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/payments/${orderId}/reject`,
        { reason: rejectReason },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        alert('Payment rejected successfully!');
        fetchPendingPayments();
        fetchStats();
        setSelectedPayment(null);
        setRejectReason('');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <AdminLayout>
      <div className="payment-verification-container">
        <div className="page-header">
          <div>
            <h1>💳 Payment Verification</h1>
            <p>Review and verify UPI payments</p>
          </div>
          <button 
            className="export-pdf-btn"
            onClick={() => {
              const exportStats = {
                total: pendingPayments.length,
                pending: stats?.pending?.count || 0,
                verified: stats?.verifiedToday?.count || 0,
                totalAmount: stats?.pending?.amount || 0
              };
              exportPaymentsReport(pendingPayments, exportStats);
            }}
          >
            <span className="icon">📄</span>
            Export PDF
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pending.count}</h3>
                <p>Pending Verification</p>
                <span className="stat-amount">₹{stats.pending.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card verified">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.verifiedToday.count}</h3>
                <p>Verified Today</p>
                <span className="stat-amount">₹{stats.verifiedToday.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <h3>{stats.rejectedToday.count}</h3>
                <p>Rejected Today</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Payments List */}
        <div className="payments-section">
          <div className="section-header">
            <h2>Pending Payments ({pendingPayments.length})</h2>
            <button 
              className="refresh-btn"
              onClick={() => {
                fetchPendingPayments();
                fetchStats();
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading payments...</div>
          ) : pendingPayments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>All Caught Up!</h3>
              <p>No pending payments to verify</p>
            </div>
          ) : (
            <div className="payments-list">
              {pendingPayments.map((payment) => (
                <div key={payment.order_id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-id">
                      <span className="label">Order ID:</span>
                      <span className="value">#{payment.order_id}</span>
                    </div>
                    <div className="payment-time">
                      {getTimeAgo(payment.created_at)}
                    </div>
                  </div>

                  <div className="payment-body">
                    <div className="payment-info-grid">
                      <div className="info-item">
                        <span className="label">Customer:</span>
                        <span className="value">{payment.customer_name}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Email:</span>
                        <span className="value">{payment.customer_email}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Amount:</span>
                        <span className="value amount">₹{parseFloat(payment.total_amount).toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Items:</span>
                        <span className="value">{payment.items_count}</span>
                      </div>
                      <div className="info-item full-width">
                        <span className="label">Transaction ID:</span>
                        <span className="value transaction-id">{payment.transaction_id}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Date:</span>
                        <span className="value">{formatDate(payment.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="payment-actions">
                    <button
                      className="btn-view"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      👁️ View Details
                    </button>
                    <button
                      className="btn-approve"
                      onClick={() => approvePayment(payment.order_id)}
                      disabled={actionLoading}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => setSelectedPayment(payment)}
                      disabled={actionLoading}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Payment Details</h2>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedPayment(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Order ID:</span>
                      <span className="value">#{selectedPayment.order_id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Amount:</span>
                      <span className="value">₹{parseFloat(selectedPayment.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Items:</span>
                      <span className="value">{selectedPayment.items_count}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(selectedPayment.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedPayment.customer_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedPayment.customer_email}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Payment Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Method:</span>
                      <span className="value">UPI Direct</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Transaction ID:</span>
                      <span className="value transaction-id">{selectedPayment.transaction_id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className="value status-pending">Payment Pending</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Verification Instructions</h3>
                  <ol className="instructions-list">
                    <li>Open your PhonePe/UPI app</li>
                    <li>Check transaction history for UPI ID: <strong>88053091@ybl</strong></li>
                    <li>Verify transaction ID: <strong>{selectedPayment.transaction_id}</strong></li>
                    <li>Confirm amount: <strong>₹{parseFloat(selectedPayment.total_amount).toLocaleString()}</strong></li>
                    <li>If verified, click "Approve Payment" below</li>
                  </ol>
                </div>

                <div className="detail-section reject-section">
                  <h3>Reject Payment</h3>
                  <textarea
                    className="reject-reason"
                    placeholder="Enter reason for rejection (e.g., Transaction ID not found, Amount mismatch, etc.)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => {
                    setSelectedPayment(null);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-modal-reject"
                  onClick={() => rejectPayment(selectedPayment.order_id)}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? 'Processing...' : '❌ Reject Payment'}
                </button>
                <button
                  className="btn-modal-approve"
                  onClick={() => approvePayment(selectedPayment.order_id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : '✅ Approve Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentVerification;
