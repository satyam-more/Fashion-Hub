import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/admin/AdminDashboard.css';
import '../../styles/admin/ExportButton.css';
import { exportDashboardReport } from '../../utils/pdfExport';

const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    customOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const navigate = useNavigate();
  

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 60 seconds (reduced from 30 to avoid rate limiting)
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.API}/admin/dashboard/stats`, { headers: getAuthHeaders() }),
        axios.get(`${API_ENDPOINTS.API}/admin/dashboard/activity`, { headers: getAuthHeaders() })
      ]);

      if (statsRes.data.success) {
        setDashboardStats(statsRes.data.data);
      }

      if (activityRes.data.success) {
        setRecentActivity(activityRes.data.data || []);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      // Set default values if API fails
      setDashboardStats({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        customOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleCardClick = (route) => {
    navigate(route);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  const renderDashboardContent = () => {
    return (
      <div className="content-section">
        <div className="dashboard-header-row">
          <div>
            <h2>Dashboard Overview</h2>
            {lastUpdated && (
              <p className="last-updated">
                Last updated: {formatLastUpdated()}
                {refreshing && <span className="refreshing-indicator"> • Refreshing...</span>}
              </p>
            )}
          </div>
          <div className="dashboard-actions">
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              title="Refresh dashboard"
            >
              <span className={`icon ${refreshing ? 'spinning' : ''}`}>🔄</span>
              Refresh
            </button>
            <button 
              className="export-pdf-btn"
              onClick={() => exportDashboardReport(dashboardStats)}
              disabled={loading}
            >
              <span className="icon">📄</span>
              Export PDF
            </button>
          </div>
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div 
                className="stat-card clickable" 
                onClick={() => handleCardClick('/admin-dashboard/products')}
                title="Click to manage products"
              >
                <div className="stat-icon products">
                  <span>📦</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalProducts.toLocaleString()}</h3>
                  <p>Total Products</p>
                </div>
                <div className="stat-arrow">→</div>
              </div>
              
              <div 
                className="stat-card clickable" 
                onClick={() => handleCardClick('/admin-dashboard/users')}
                title="Click to manage users"
              >
                <div className="stat-icon users">
                  <span>👥</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalUsers.toLocaleString()}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat-arrow">→</div>
              </div>
              
              <div 
                className="stat-card clickable" 
                onClick={() => handleCardClick('/admin-dashboard/orders')}
                title="Click to manage orders"
              >
                <div className="stat-icon orders">
                  <span>🛒</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalOrders.toLocaleString()}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="stat-arrow">→</div>
              </div>
              
              <div className="stat-card revenue">
                <div className="stat-icon">
                  <span>💰</span>
                </div>
                <div className="stat-info">
                  <h3>₹{dashboardStats.todayRevenue.toLocaleString()}</h3>
                  <p>Today's Revenue</p>
                </div>
              </div>
              
              <div 
                className="stat-card clickable pending" 
                onClick={() => handleCardClick('/admin-dashboard/orders')}
                title="Click to view pending orders"
              >
                <div className="stat-icon">
                  <span>⏳</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.pendingOrders.toLocaleString()}</h3>
                  <p>Pending Orders</p>
                </div>
                {dashboardStats.pendingOrders > 0 && (
                  <div className="stat-badge">Action Required</div>
                )}
                <div className="stat-arrow">→</div>
              </div>
              
              <div 
                className="stat-card clickable" 
                onClick={() => handleCardClick('/admin-dashboard/appointments')}
                title="Click to view custom orders"
              >
                <div className="stat-icon custom">
                  <span>✂️</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.customOrders.toLocaleString()}</h3>
                  <p>Custom Orders</p>
                </div>
                <div className="stat-arrow">→</div>
              </div>
            </div>
            
            <div className="recent-activity">
              <div className="activity-header">
                <h3>Recent Activity</h3>
                <button 
                  className="view-all-btn"
                  onClick={() => handleCardClick('/admin-dashboard/orders')}
                >
                  View All →
                </button>
              </div>
              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">🔔</div>
                      <div className="activity-content">
                        <span className="activity-text">{activity.description}</span>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-item empty">
                    <div className="activity-icon">📭</div>
                    <div className="activity-content">
                      <span className="activity-text">No recent activity</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      {renderDashboardContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;