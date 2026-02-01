import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import RevenueChart from './charts/RevenueChart';
import TopProductsChart from './charts/TopProductsChart';
import CategoryChart from './charts/CategoryChart';
import '../../styles/admin/Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    salesData: [],
    topProducts: [],
    customerData: [],
    categoryData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');

  

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewRes, salesRes, productsRes, customersRes, categoryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/analytics/overview?dateRange=${dateRange}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/admin/analytics/sales-chart?dateRange=${dateRange}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/admin/analytics/top-products?dateRange=${dateRange}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/admin/analytics/customer-segments`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/admin/analytics/category-sales?dateRange=${dateRange}`, { headers: getAuthHeaders() })
      ]);

      setAnalyticsData({
        overview: overviewRes.data.success ? overviewRes.data.data : {},
        salesData: salesRes.data.success ? salesRes.data.data : [],
        topProducts: productsRes.data.success ? productsRes.data.data : [],
        customerData: customersRes.data.success ? customersRes.data.data : [],
        categoryData: categoryRes.data.success ? categoryRes.data.data : []
      });

    } catch (err) {
      console.error('Fetch analytics error:', err);
      setError('Failed to fetch analytics data. Please check if the server is running.');
      
      setAnalyticsData({
        overview: {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          conversionRate: 0,
          monthlyGrowth: 0,
          totalCustomers: 0
        },
        salesData: [],
        topProducts: [],
        customerData: [],
        categoryData: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Loading analytics...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="analytics-management fade-in">
        {error && (
          <div className="error">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="analytics-header">
          <h2>📊 Analytics & Reports</h2>
          <div className="header-controls">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="date-range-select"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            
            <button className="export-btn">
              <span className="icon">📊</span>
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-cards">
          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-info">
              <h3>₹{(analyticsData.overview.totalRevenue || 0).toLocaleString()}</h3>
              <p>Total Revenue</p>
              <span className={`kpi-growth ${analyticsData.overview.monthlyGrowth >= 0 ? 'positive' : 'negative'}`}>
                {analyticsData.overview.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.overview.monthlyGrowth || 0).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-icon">📊</div>
            <div className="kpi-info">
              <h3>₹{(analyticsData.overview.averageOrderValue || 0).toLocaleString()}</h3>
              <p>Average Order Value</p>
              <span className="kpi-growth positive">AOV</span>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-info">
              <h3>{analyticsData.overview.conversionRate || 0}%</h3>
              <p>Conversion Rate</p>
              <span className="kpi-growth positive">CVR</span>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-icon">👥</div>
            <div className="kpi-info">
              <h3>{analyticsData.overview.totalCustomers || 0}</h3>
              <p>Total Customers</p>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-icon">🛒</div>
            <div className="kpi-info">
              <h3>{analyticsData.overview.totalOrders || 0}</h3>
              <p>Total Orders</p>
            </div>
          </div>
        </div>

        {/* Charts with Recharts */}
        <div className="charts-grid">
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>📈 Revenue Trend</h3>
              <p>Daily sales performance over selected period</p>
            </div>
            <div className="chart-body">
              <RevenueChart data={analyticsData.salesData} loading={false} />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>🏆 Top Selling Products</h3>
              <p>Best performers by revenue and units sold</p>
            </div>
            <div className="chart-body">
              <TopProductsChart data={analyticsData.topProducts} loading={false} />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>🎯 Sales by Category</h3>
              <p>Revenue distribution across categories</p>
            </div>
            <div className="chart-body">
              <CategoryChart data={analyticsData.categoryData} loading={false} />
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="insights-section">
          <h3>💡 Key Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <span className="insight-icon">🔥</span>
              <div className="insight-content">
                <h4>Best Selling Category</h4>
                <p>{analyticsData.categoryData.length > 0 ? analyticsData.categoryData[0].category : 'N/A'}</p>
              </div>
            </div>
            
            <div className="insight-card">
              <span className="insight-icon">⭐</span>
              <div className="insight-content">
                <h4>Top Product</h4>
                <p>{analyticsData.topProducts.length > 0 ? analyticsData.topProducts[0].name : 'N/A'}</p>
              </div>
            </div>
            
            <div className="insight-card">
              <span className="insight-icon">💵</span>
              <div className="insight-content">
                <h4>Revenue per Customer</h4>
                <p>₹{analyticsData.overview.totalCustomers > 0 
                  ? (analyticsData.overview.totalRevenue / analyticsData.overview.totalCustomers).toLocaleString(undefined, {maximumFractionDigits: 0})
                  : 0
                }</p>
              </div>
            </div>
            
            <div className="insight-card">
              <span className="insight-icon">📊</span>
              <div className="insight-content">
                <h4>Orders per Customer</h4>
                <p>{analyticsData.overview.totalCustomers > 0 
                  ? (analyticsData.overview.totalOrders / analyticsData.overview.totalCustomers).toFixed(1)
                  : 0
                }</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
