import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import '../../styles/user/OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get order data from navigation state first
    if (location.state?.orderData) {
      setOrder(location.state.orderData);
      setLoading(false);
    } else {
      // Fallback: fetch order data from API
      fetchOrderDetails();
    }
  }, [orderId, location.state]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          navigate('/orders');
        }
      } else {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'upi': return 'UPI Payment';
      case 'card': return 'Credit/Debit Card';
      default: return method;
    }
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.created_at);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 7); // 7 days from order
    
    return deliveryDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <Navbar />
        <div className="confirmation-container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-page">
        <Navbar />
        <div className="confirmation-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h3>Order not found</h3>
            <p>We couldn't find the order you're looking for</p>
            <button className="primary-btn" onClick={() => navigate('/orders')}>
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <Navbar />
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your order. We'll send you a confirmation email shortly.</p>
        </div>

        {/* Order Details */}
        <div className="confirmation-content">
          <div className="order-info-section">
            <div className="order-summary-card">
              <h2>Order Summary</h2>
              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Order Number:</span>
                  <span className="value">{order.order_number}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Order Date:</span>
                  <span className="value">{formatDate(order.created_at)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">{getPaymentMethodDisplay(order.payment_method)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Order Status:</span>
                  <span className="value status-badge">{order.status}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Estimated Delivery:</span>
                  <span className="value">{getEstimatedDelivery()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="shipping-card">
              <h3>Shipping Address</h3>
              <div className="address-display">
                {order.shipping_address.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <div className="items-card">
              <h3>Order Items</h3>
              <div className="items-list">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="confirmation-item">
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
                        📷
                      </div>
                    </div>
                    <div className="item-details">
                      <h4>{item.product_name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      {item.size && <p>Size: {item.size}</p>}
                      <p>Price: ₹{item.price}</p>
                    </div>
                    <div className="item-total">
                      ₹{item.total}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="order-total-section">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal || (order.total_amount - (order.tax || 0) - (order.shipping_cost || 0)).toFixed(2)}</span>
                </div>
                {order.tax && (
                  <div className="total-row">
                    <span>Tax (GST):</span>
                    <span>₹{order.tax.toFixed(2)}</span>
                  </div>
                )}
                {order.shipping_cost !== undefined && (
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>{order.shipping_cost === 0 ? 'Free' : `₹${order.shipping_cost}`}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total:</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </button>
          <button 
            className="secondary-btn"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
          <button 
            className="secondary-btn"
            onClick={() => window.print()}
          >
            Print Order
          </button>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What happens next?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-icon">📧</div>
              <h4>Confirmation Email</h4>
              <p>You'll receive an order confirmation email within a few minutes</p>
            </div>
            <div className="step">
              <div className="step-icon">📦</div>
              <h4>Order Processing</h4>
              <p>We'll prepare your order and notify you when it's ready to ship</p>
            </div>
            <div className="step">
              <div className="step-icon">🚚</div>
              <h4>Shipping Updates</h4>
              <p>Track your order status and get delivery updates via SMS/email</p>
            </div>
            <div className="step">
              <div className="step-icon">🎉</div>
              <h4>Delivery</h4>
              <p>Your order will be delivered within 5-7 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;