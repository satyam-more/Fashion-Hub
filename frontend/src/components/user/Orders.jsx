import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../../styles/user/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/orders/cancel/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh orders
        alert('Order cancelled successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'processing': return '#2196f3';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <Navbar />
        <div className="orders-container">
          <div className="loading">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Navbar />
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your order history</p>
        </div>
        
        <div className="orders-content">
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here</p>
              <button className="primary-btn" onClick={() => navigate('/')}>
                Browse Collections
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.order_id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.order_number}</h3>
                      <p>Placed on {formatDate(order.created_at)}</p>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          {item.images && item.images.length > 0 ? (
                            <img 
                              src={item.images[0].startsWith('http') ? item.images[0] : `http://localhost:5000/uploads/${item.images[0]}`} 
                              alt={item.product_name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="placeholder-image" 
                            style={{
                              display: (item.images && item.images.length > 0) ? 'none' : 'flex'
                            }}
                          >
                            <span className="placeholder-icon">📷</span>
                            <span className="placeholder-text">No Image</span>
                          </div>
                        </div>
                        <div className="item-details">
                          <h4>{item.product_name}</h4>
                          <p>Color: {item.colour}</p>
                          {item.size && <p>Size: {item.size}</p>}
                          <p>Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          ₹{item.total}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <div className="order-total">
                      <strong>Total: ₹{order.total_amount}</strong>
                    </div>
                    <div className="order-actions">
                      {order.status === 'pending' && (
                        <button 
                          className="cancel-btn"
                          onClick={() => cancelOrder(order.order_id)}
                        >
                          Cancel Order
                        </button>
                      )}
                      <button className="track-btn">
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;