import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import UPIPayment from './UPIPayment';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/user/Checkout.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [total, setTotal] = useState('0.00');
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  

  useEffect(() => {
    fetchCartItems();
    loadUserProfile();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.API}/cart`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setCartItems(response.data.items);
        const subtotal = parseFloat(response.data.total);
        const calculatedTax = 0; // No GST - prices are final MRP after discount
        const calculatedShipping = 0; // Free shipping for all orders
        
        setTax(calculatedTax);
        setShippingCost(calculatedShipping);
        setTotal(subtotal.toFixed(2)); // Total = Subtotal (no tax, no shipping)
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.API}/profile`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success && response.data.data) {
        const profile = response.data.data;
        setShippingAddress(prev => ({
          ...prev,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          postalCode: profile.postal_code || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingAddress.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone is required';
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrder = async (paymentStatus = 'pending') => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        })),
        shipping_address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}, ${shippingAddress.country}`,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        total_amount: parseFloat(total),
        subtotal: parseFloat(total),
        tax: 0,
        shipping_cost: 0
      };

      const response = await axios.post(
        `${API_ENDPOINTS.API}/orders`,
        orderData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // For UPI payment, show UPI payment modal
        if (paymentMethod === 'upi') {
          setPendingOrderId(response.data.data.order_id);
          setShowUPIPayment(true);
          setProcessing(false);
          return;
        }

        // For COD, clear cart and navigate
        await axios.delete(`${API_ENDPOINTS.API}/cart/clear`, {
          headers: getAuthHeaders()
        });

        navigate(`/order-confirmation/${response.data.data.order_id}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      alert('Failed to create order. Please contact support.');
      setProcessing(false);
    }
  };

  const handleUPIPaymentSuccess = async (paymentData) => {
    try {
      // Clear cart
      await axios.delete(`${API_ENDPOINTS.API}/cart/clear`, {
        headers: getAuthHeaders()
      });

      // Navigate to order confirmation
      navigate(`/order-confirmation/${pendingOrderId}`);
    } catch (error) {
      console.error('Error after UPI payment:', error);
      navigate(`/order-confirmation/${pendingOrderId}`);
    }
  };

  const handleUPIPaymentCancel = () => {
    setShowUPIPayment(false);
    setPendingOrderId(null);
    setProcessing(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setProcessing(true);

    try {
      if (paymentMethod === 'upi') {
        await createOrder('payment_pending');
      } else {
        await createOrder('pending');
      }
    } catch (error) {
      console.error('Place order error:', error);
      alert('Failed to place order. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Loading checkout...</div>
      </div>
    );
  }

  // Show UPI Payment modal if needed
  if (showUPIPayment && pendingOrderId) {
    return (
      <div>
        <Navbar />
        <div className="checkout-container">
          <UPIPayment
            orderId={pendingOrderId}
            amount={total}
            onSuccess={handleUPIPaymentSuccess}
            onCancel={handleUPIPaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          {/* Shipping Address Form */}
          <div className="checkout-form">
            <h2>Shipping Address</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingAddress.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingAddress.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
                
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className={errors.state ? 'error' : ''}
                  />
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className={errors.postalCode ? 'error' : ''}
                  />
                  {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
                </div>
                
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="payment-method-section">
                <h2>Payment Method</h2>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">📱</span>
                      <div>
                        <strong>UPI Payment</strong>
                        <p>Pay instantly with Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">💵</span>
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={processing}
              >
                {processing ? 'Processing...' : `Place Order - ₹${total}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cartItems.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <p>Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{total}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
            </div>

            {shippingCost === 0 && (
              <div className="free-shipping-badge">
                🎉 You got FREE shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
