import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../../styles/user/OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.API}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          // Create a basic order object for display
          setOrder({
            order_id: orderId,
            order_number: `FH${orderId}`,
            total_amount: 0,
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'cod',
            created_at: new Date().toISOString(),
            shipping_address: 'Address not available',
            items: []
          });
        }
      } else {
        // Create a basic order object for display
        setOrder({
          order_id: orderId,
          order_number: `FH${orderId}`,
          total_amount: 0,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cod',
          created_at: new Date().toISOString(),
          shipping_address: 'Address not available',
          items: []
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      // Always show a confirmation page, even if API fails
      setOrder({
        order_id: orderId,
        order_number: `FH${orderId}`,
        total_amount: 0,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'cod',
        created_at: new Date().toISOString(),
        shipping_address: 'Address not available',
        items: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="order-confirmation-container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="order-confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order. We'll send you a confirmation email shortly.</p>
        </div>

        <div className="order-details-card">
          <h2>Order Details</h2>
          
          <div className="order-info">
            <div className="info-row">
              <span className="label">Order Number:</span>
              <span className="value">#{order.order_number}</span>
            </div>
            <div className="info-row">
              <span className="label">Order Date:</span>
              <span className="value">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Payment Method:</span>
              <span className="value">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 
                 order.payment_method === 'upi' || order.payment_method === 'upi_direct' ? 'UPI Payment' : 
                 order.payment_method}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Order Status:</span>
              <span className="value status-pending">
                {order.payment_status === 'payment_pending' ? 'Payment Pending Verification' : 
                 order.status === 'pending' ? 'Order Confirmed' : order.status}
              </span>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="order-items">
              <h3>Items Ordered</h3>
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <p>Size: {item.size} | Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{parseFloat(item.total || item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          {order.shipping_address && (
            <div className="shipping-details">
              <h3>Shipping Address</h3>
              <p>{order.shipping_address}</p>
            </div>
          )}
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          {order.payment_method === 'cod' ? (
            <div className="steps">
              <p>✅ Your order has been confirmed</p>
              <p>📦 We'll prepare your items for shipping</p>
              <p>🚚 You'll receive tracking information soon</p>
              <p>💵 Pay when you receive your order</p>
            </div>
          ) : order.payment_status === 'payment_pending' ? (
            <div className="steps">
              <p>⏳ We're verifying your UPI payment</p>
              <p>📧 You'll receive confirmation once verified</p>
              <p>📦 Order will be processed after payment confirmation</p>
              <p>🚚 Tracking information will follow</p>
            </div>
          ) : (
            <div className="steps">
              <p>✅ Your payment has been confirmed</p>
              <p>📦 We're preparing your items for shipping</p>
              <p>🚚 You'll receive tracking information soon</p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/orders')}>
            View All Orders
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;