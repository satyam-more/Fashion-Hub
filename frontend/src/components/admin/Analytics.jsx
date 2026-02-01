import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/Analytics.css';
import '../../styles/admin/ExportButton.css';
import { exportAnalyticsReport } from '../../utils/pdfExport';

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
  const [activeChart, setActiveChart] = useState('sales');

  

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
      
      // Fetch all analytics data from backend
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
      
      // Fallback to empty data
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

  const renderSalesChart = () => {
    if (!analyticsData.salesData || analyticsData.salesData.length === 0) {
      return (
        <div className="chart-container">
          <h3>Sales Overview</h3>
          <div className="no-data">No sales data available for the selected period</div>
        </div>
      );
    }

    const maxSales = Math.max(...analyticsData.salesData.map(d => d.sales));
    const maxOrders = Math.max(...analyticsData.salesData.map(d => d.orders));

    return (
      <div className="chart-container">
        <h3>Sales Overview - Clustered Bar Chart</h3>
        <div className="chart-placeholder">
          <div className="clustered-chart">
            {analyticsData.salesData.map((data, index) => (
              <div key={index} className="chart-group">
                <div className="bar-cluster">
                  <div 
                    className="bar sales-bar" 
                    style={{ height: `${(data.sales / maxSales) * 200}px` }}
                    title={`Sales: ₹${data.sales.toLocaleString()}`}
                  ></div>
                  <div 
                    className="bar orders-bar" 
                    style={{ height: `${(data.orders / maxOrders) * 200}px` }}
                    title={`Orders: ${data.orders}`}
                  ></div>
                </div>
                <span className="bar-label">
                  {dateRange === '1year' ? data.date : new Date(data.date).getDate()}
                </span>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color sales-color"></div>
              <span>Sales (₹)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color orders-color"></div>
              <span>Orders</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopProducts = () => {
    if (!analyticsData.topProducts || analyticsData.topProducts.length === 0) {
      return (
        <div className="top-products">
          <h3>Top Selling Products</h3>
          <div className="no-data">No product data available</div>
        </div>
      );
    }

    const maxRevenue = Math.max(...analyticsData.topProducts.map(p => p.revenue));

    return (
      <div className="top-products">
        <h3>Top Selling Products - Horizontal Bar Chart</h3>
        <div className="horizontal-bars">
          {analyticsData.topProducts.slice(0, 8).map((product, index) => (
            <div key={index} className="horizontal-bar-item">
              <div className="product-label">
                <span className="rank">#{index + 1}</span>
                <span className="name">{product.name}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="horizontal-bar"
                  style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                  title={`Revenue: ₹${product.revenue.toLocaleString()}`}
                ></div>
                <span className="bar-value">₹{product.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomerSegments = () => {
    if (!analyticsData.customerData || analyticsData.customerData.length === 0) {
      return (
        <div className="customer-segments">
          <h3>Customer Segments</h3>
          <div className="no-data">No customer data available</div>
        </div>
      );
    }

    const colors = ['#667eea', '#764ba2', '#f093fb'];
    const totalCustomers = analyticsData.customerData.reduce((sum, seg) => sum + seg.count, 0);

    return (
      <div className="customer-segments">
        <h3>Customer Segments - Pie Chart</h3>
        <div className="pie-chart-container">
          <div className="pie-chart">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {analyticsData.customerData.map((segment, index) => {
                const percentage = totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
                const angle = (percentage / 100) * 360;
                const startAngle = analyticsData.customerData.slice(0, index).reduce((sum, seg) => {
                  const segPercentage = totalCustomers > 0 ? (seg.count / totalCustomers) * 100 : 0;
                  return sum + (segPercentage / 100) * 360;
                }, 0);
                
                const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 100 + 80 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
                const y2 = 100 + 80 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                    title={`${segment.segment}: ${segment.count} (${percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </svg>
          </div>
          <div className="pie-legend">
            {analyticsData.customerData.map((segment, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span>{segment.segment}: {segment.count} ({segment.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCategorySales = () => {
    if (!analyticsData.categoryData || analyticsData.categoryData.length === 0) {
      return (
        <div className="category-sales">
          <h3>Category Sales</h3>
          <div className="no-data">No category data available</div>
        </div>
      );
    }

    const maxRevenue = Math.max(...analyticsData.categoryData.map(c => c.revenue));

    return (
      <div className="category-sales">
        <h3>Category Sales - Vertical Bar Chart</h3>
        <div className="category-bars">
          {analyticsData.categoryData.map((category, index) => (
            <div key={index} className="category-bar-item">
              <div 
                className="category-bar"
                style={{ height: `${(category.revenue / maxRevenue) * 200}px` }}
                title={`${category.category}: ₹${category.revenue.toLocaleString()}`}
              ></div>
              <div className="category-info">
                <span className="category-name">{category.category}</span>
                <span className="category-value">₹{category.revenue.toLocaleString()}</span>
                <small>{category.quantity} items</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKPICards = () => (
    <div className="kpi-cards">
      <div className="kpi-card">
        <div className="kpi-icon">💰</div>
        <div className="kpi-info">
          <h3>₹{(analyticsData.overview.totalRevenue || 0).toLocaleString()}</h3>
          <p>Total Revenue</p>
          <span className={`kpi-growth ${analyticsData.overview.monthlyGrowth >= 0 ? 'positive' : 'negative'}`}>
            {analyticsData.overview.monthlyGrowth >= 0 ? '+' : ''}{analyticsData.overview.monthlyGrowth || 0}%
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
          <span className="kpi-growth positive">Customers</span>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="kpi-icon">🛒</div>
        <div className="kpi-info">
          <h3>{analyticsData.overview.totalOrders || 0}</h3>
          <p>Total Orders</p>
          <span className="kpi-growth positive">Orders</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <AdminLayout>
      <div className="analytics-management fade-in">
        {/* Error Messages */}
        {error && (
          <div className="error">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Header */}
        <div className="analytics-header">
          <h2>Analytics & Reports</h2>
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
            
            <button 
              className="export-btn"
              onClick={() => exportAnalyticsReport(analyticsData, dateRange)}
            >
              <span className="icon">📄</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {renderKPICards()}

        {/* Chart Tabs */}
        <div className="chart-tabs">
          <button 
            className={`tab ${activeChart === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveChart('sales')}
          >
            📈 Sales Trend
          </button>
          <button 
            className={`tab ${activeChart === 'products' ? 'active' : ''}`}
            onClick={() => setActiveChart('products')}
          >
            🏆 Top Products
          </button>
          <button 
            className={`tab ${activeChart === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveChart('categories')}
          >
            📊 Categories
          </button>
          <button 
            className={`tab ${activeChart === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveChart('customers')}
          >
            👥 Customers
          </button>
        </div>

        {/* Chart Content */}
        <div className="chart-content">
          {activeChart === 'sales' && renderSalesChart()}
          {activeChart === 'products' && renderTopProducts()}
          {activeChart === 'categories' && renderCategorySales()}
          {activeChart === 'customers' && renderCustomerSegments()}
        </div>

        {/* Additional Insights */}
        <div className="insights-section">
          <h3>Key Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>🚀 Sales Growth</h4>
              <p>
                {analyticsData.overview.monthlyGrowth >= 0 
                  ? `Sales have increased by ${analyticsData.overview.monthlyGrowth}% compared to last month.`
                  : `Sales have decreased by ${Math.abs(analyticsData.overview.monthlyGrowth)}% compared to last month.`
                }
                {analyticsData.categoryData.length > 0 && 
                  ` The highest performing category is ${analyticsData.categoryData[0]?.category}.`
                }
              </p>
            </div>
            
            <div className="insight-card">
              <h4>👑 Top Customer Segment</h4>
              <p>
                {analyticsData.customerData.length > 0 
                  ? `${analyticsData.customerData.find(seg => seg.count === Math.max(...analyticsData.customerData.map(s => s.count)))?.segment || 'Customers'} make up the largest segment of your customer base.`
                  : 'Customer segment data is being analyzed.'
                }
              </p>
            </div>
            
            <div className="insight-card">
              <h4>📊 Revenue Performance</h4>
              <p>
                Average order value is ₹{(analyticsData.overview.averageOrderValue || 0).toLocaleString()}.
                {analyticsData.overview.totalOrders > 0 && 
                  ` Total of ${analyticsData.overview.totalOrders} orders processed.`
                }
              </p>
            </div>
            
            <div className="insight-card">
              <h4>🎯 Business Metrics</h4>
              <p>
                Conversion rate is {analyticsData.overview.conversionRate || 0}%.
                {analyticsData.topProducts.length > 0 && 
                  ` Best selling product: ${analyticsData.topProducts[0]?.name}.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;