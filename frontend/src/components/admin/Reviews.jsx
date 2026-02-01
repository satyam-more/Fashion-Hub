import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/Reviews.css';
import '../../styles/admin/ExportButton.css';
import { exportReviewsReport } from '../../utils/pdfExport';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    status: ''
  });

  

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reviews/admin`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setReviews(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/reviews/${reviewId}/status`,
        { status },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess(`Review ${status} successfully`);
        fetchReviews();
      }
    } catch (err) {
      console.error('Update review status error:', err);
      setError('Failed to update review status');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/reviews/${reviewId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess('Review deleted successfully');
        fetchReviews();
      }
    } catch (err) {
      console.error('Delete review error:', err);
      setError('Failed to delete review');
    }
  };

  const getFilteredReviews = () => {
    return reviews.filter(review => {
      const matchesSearch = filters.search === '' || 
        review.product_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        review.customer_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        review.comment?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesRating = filters.rating === '' || review.rating.toString() === filters.rating;
      const matchesStatus = filters.status === '' || review.status === filters.status;
      
      return matchesSearch && matchesRating && matchesStatus;
    });
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  const filteredReviews = getFilteredReviews();

  return (
    <AdminLayout>
      <div className="reviews-management fade-in">
        {/* Success/Error Messages */}
        {success && (
          <div className="success-message">
            {success}
            <button onClick={() => setSuccess(null)}>✕</button>
          </div>
        )}
        
        {error && (
          <div className="error">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Header */}
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          <div className="header-actions">
            <button 
              className="export-btn"
              onClick={() => {
                const stats = {
                  totalReviews: reviews.length,
                  pending: reviews.filter(r => r.status === 'pending').length,
                  approved: reviews.filter(r => r.status === 'approved').length,
                  avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0
                };
                exportReviewsReport(filteredReviews, stats);
              }}
            >
              <span className="icon">📄</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Search Reviews</label>
              <input
                type="text"
                name="search"
                placeholder="Search by product, customer, or comment..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label>Rating</label>
              <select name="rating" value={filters.rating} onChange={handleFilterChange}>
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="reviews-stats">
          <div className="stat-card">
            <h3>{reviews.length}</h3>
            <p>Total Reviews</p>
          </div>
          <div className="stat-card">
            <h3>{reviews.filter(r => r.status === 'pending').length}</h3>
            <p>Pending Reviews</p>
          </div>
          <div className="stat-card">
            <h3>{reviews.filter(r => r.status === 'approved').length}</h3>
            <p>Approved Reviews</p>
          </div>
          <div className="stat-card">
            <h3>{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0'}</h3>
            <p>Average Rating</p>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="reviews-table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Product & Customer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No reviews found. {reviews.length === 0 ? 'No reviews submitted yet.' : 'Try adjusting your filters.'}
                  </td>
                </tr>
              ) : (
                filteredReviews.map(review => (
                  <tr key={review.id} className="slide-in">
                    <td>
                      <div className="review-info">
                        <h4>{review.product_name || 'Unknown Product'}</h4>
                        <p>By: {review.customer_name || 'Anonymous'}</p>
                        <small>{review.customer_email || 'No email'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="rating-display">
                        <span className="stars">{renderStars(review.rating)}</span>
                        <span className="rating-number">({review.rating}/5)</span>
                      </div>
                    </td>
                    <td>
                      <div className="review-content">
                        <p>{review.comment || 'No comment provided'}</p>
                        {review.images && review.images.length > 0 && (
                          <small>📷 {review.images.length} image(s)</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <span>{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                        <small>{new Date(review.created_at).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</small>
                      </div>
                    </td>
                    <td>
                      <select
                        className={`status-select ${getStatusColor(review.status)}`}
                        value={review.status || 'pending'}
                        onChange={(e) => updateReviewStatus(review.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn approve"
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          title="Approve Review"
                          disabled={review.status === 'approved'}
                        >
                          ✓
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          title="Reject Review"
                          disabled={review.status === 'rejected'}
                        >
                          ✕
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => deleteReview(review.id)}
                          title="Delete Review"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reviews;