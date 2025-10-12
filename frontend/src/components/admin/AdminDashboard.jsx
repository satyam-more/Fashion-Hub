import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/AdminDashboard.css';

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

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/dashboard/stats`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/admin/dashboard/activity`, { headers: getAuthHeaders() })
      ]);

      if (statsRes.data.success) {
        setDashboardStats(statsRes.data.data);
      }

      if (activityRes.data.success) {
        setRecentActivity(activityRes.data.data || []);
      }
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
    }
  };

  const renderDashboardContent = () => {
    return (
      <div className="content-section">
        <h2>Dashboard Overview</h2>
        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <span>📦</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalProducts.toLocaleString()}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span>👥</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalUsers.toLocaleString()}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span>🛒</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalOrders.toLocaleString()}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span>💰</span>
                </div>
                <div className="stat-info">
                  <h3>₹{dashboardStats.todayRevenue.toLocaleString()}</h3>
                  <p>Today's Revenue</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span>⏳</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.pendingOrders.toLocaleString()}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span>✂️</span>
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.customOrders.toLocaleString()}</h3>
                  <p>Custom Orders</p>
                </div>
              </div>
            </div>
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="activity-time">{activity.time}</span>
                      <span className="activity-text">{activity.description}</span>
                    </div>
                  ))
                ) : (
                  <div className="activity-item">
                    <span className="activity-text">No recent activity</span>
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