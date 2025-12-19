import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/Orders.css';
import '../../styles/admin/ExportButton.css';
import { exportOrdersReport } from '../../utils/pdfExport';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to fetch orders');
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

  const updateOrderStatus = async (orderId, newStatus) => {
    console.log('🔄 Updating order status:', { orderId, newStatus });
    
    try {
      setError(null);
      setSuccess(null);
      
      console.log('📡 Sending request to:', `${API_BASE_URL}/admin/orders/${orderId}/status`);
      
      const response = await axios.patch(
        `${API_BASE_URL}/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      console.log('✅ Response received:', response.data);

      if (response.data.success) {
        setSuccess(`Order #${orderId} status updated to ${newStatus}`);
        
        // Update the order in the local state immediately for instant feedback
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.order_id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        console.log('✅ Local state updated');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('❌ Update status error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to update order status');
      setTimeout(() => setError(null), 5000);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/orders/${orderId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Fetch order details error:', err);
      setError('Failed to fetch order details');
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = filters.search === '' || 
        order.order_id.toString().includes(filters.search) ||
        order.customer_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === '' || order.status === filters.status;
      
      let matchesDate = true;
      if (filters.dateRange) {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            matchesDate = orderDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const calculateOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      revenue: orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
    };
    return stats;
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  const filteredOrders = getFilteredOrders();
  const stats = calculateOrderStats();

  return (
    <AdminLayout>
      <div className="orders-management fade-in">
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
      <div className="orders-header">
        <h2>Manage Orders</h2>
        <div className="header-actions">
          <button 
            className="export-btn"
            onClick={() => exportOrdersReport(filteredOrders, stats)}
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
            <label>Search Orders</label>
            <input
              type="text"
              name="search"
              placeholder="Search by order ID, customer name or email..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Date Range</label>
            <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="orders-stats">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.processing}</h3>
          <p>Processing</p>
        </div>
        <div className="stat-card">
          <h3>₹{stats.revenue.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders found. {orders.length === 0 ? 'No orders placed yet.' : 'Try adjusting your filters.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.order_id} className="slide-in">
                  <td>
                    <div className="order-info">
                      <h4>#{order.order_id}</h4>
                      <p>Order Number: {order.order_number || order.order_id}</p>
                      <small>Payment: {order.payment_method || 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <h4>{order.customer_name || 'N/A'}</h4>
                      <p>{order.customer_email || 'N/A'}</p>
                      <small>{order.customer_phone || 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    <div className="items-info">
                      <span className="items-count">{order.items_count || 0} items</span>
                      <small>View details for full list</small>
                    </div>
                  </td>
                  <td>
                    <div className="amount-info">
                      <h4>₹{parseFloat(order.total_amount || 0).toLocaleString()}</h4>
                      {order.discount_amount > 0 && (
                        <small>Discount: ₹{parseFloat(order.discount_amount).toLocaleString()}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      className={`status-select ${getStatusColor(order.status)}`}
                      value={order.status}
                      onChange={(e) => {
                        console.log('🎯 Dropdown changed!', e.target.value);
                        updateOrderStatus(order.order_id, e.target.value);
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="date-info">
                      <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                      <small>{new Date(order.created_at).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</small>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => viewOrderDetails(order.order_id)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn print"
                        onClick={() => window.print()}
                        title="Print Invoice"
                      >
                        🖨️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.order_id}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="order-details">
              <div className="details-section">
                <h4>Customer Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedOrder.customer_name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedOrder.customer_email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedOrder.customer_phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Address:</label>
                    <span>{selectedOrder.shipping_address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Order Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Order Date:</label>
                    <span>{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Payment Method:</label>
                    <span>{selectedOrder.payment_method || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Payment Status:</label>
                    <span>{selectedOrder.payment_status || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Order Items</h4>
                <div className="items-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-card">
                        <div className="item-info">
                          <h5>{item.product_name}</h5>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ₹{parseFloat(item.price).toLocaleString()}</p>
                        </div>
                        <div className="item-total">
                          ₹{(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No items found</p>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h4>Order Summary</h4>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(selectedOrder.subtotal || selectedOrder.total_amount || 0).toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="summary-row">
                      <span>Discount:</span>
                      <span>-₹{parseFloat(selectedOrder.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>₹{parseFloat(selectedOrder.shipping_cost || 0).toLocaleString()}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{parseFloat(selectedOrder.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default Orders;