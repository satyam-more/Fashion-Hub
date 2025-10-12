import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
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

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCartItems();
    loadUserProfile();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCartItems(data.items);
          const subtotal = parseFloat(data.total);
          const calculatedTax = subtotal * 0.18; // 18% GST
          const calculatedShipping = subtotal > 1000 ? 0 : 99; // Free shipping above ₹1000
          
          setTotal(data.total);
          setTax(calculatedTax);
          setShippingCost(calculatedShipping);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          const profile = data.profile;
          setShippingAddress(prev => ({
            ...prev,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            postalCode: profile.postal_code || '',
            country: profile.country || 'India'
          }));
        }
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
    
    // Clear error when user starts typing
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
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingAddress.email && !emailRegex.test(shippingAddress.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (shippingAddress.phone && !phoneRegex.test(shippingAddress.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Postal code validation
    const postalRegex = /^\d{6}$/;
    if (shippingAddress.postalCode && !postalRegex.test(shippingAddress.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFinalTotal = () => {
    const subtotal = parseFloat(total);
    return (subtotal + tax + shippingCost).toFixed(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    setProcessing(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        })),
        shipping_address: `${shippingAddress.firstName} ${shippingAddress.lastName}\n${shippingAddress.address}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}\n${shippingAddress.country}\nPhone: ${shippingAddress.phone}\nEmail: ${shippingAddress.email}`,
        payment_method: paymentMethod,
        subtotal: parseFloat(total),
        tax: tax,
        shipping_cost: shippingCost,
        total_amount: parseFloat(calculateFinalTotal())
      };
      
      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Clear cart after successful order
        await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Redirect to order confirmation
        navigate(`/order-confirmation/${data.order.order_id}`, {
          state: { orderData: data.order }
        });
      } else {
        alert(data.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-container">
          <div className="loading">Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-container">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some items to your cart before checkout</p>
            <button className="primary-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>
        
        <form onSubmit={handlePlaceOrder} className="checkout-form">
          <div className="checkout-content">
            {/* Shipping Address */}
            <div className="checkout-section">
              <h2>Shipping Address</h2>
              <div className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="10-digit mobile number"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                    rows="3"
                    placeholder="House number, street name, area"
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="error-message">{errors.state}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      className={errors.postalCode ? 'error' : ''}
                      placeholder="6-digit PIN code"
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="cod">
                    <div className="payment-info">
                      <span className="payment-icon">💰</span>
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>
                </div>
                
                <div className="payment-option">
                  <input
                    type="radio"
                    id="upi"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="upi">
                    <div className="payment-info">
                      <span className="payment-icon">📱</span>
                      <div>
                        <strong>UPI Payment</strong>
                        <p>Pay instantly using UPI apps</p>
                      </div>
                    </div>
                  </label>
                </div>
                
                <div className="payment-option">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="card">
                    <div className="payment-info">
                      <span className="payment-icon">💳</span>
                      <div>
                        <strong>Credit/Debit Card</strong>
                        <p>Secure payment with your card</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.cart_id} className="summary-item">
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
                    <div className="item-info">
                      <h4>{item.product_name}</h4>
                      <p>Qty: {item.quantity} {item.size && `• Size: ${item.size}`}</p>
                    </div>
                    <div className="item-price">₹{item.total}</div>
                  </div>
                ))}
              </div>
              
              <div className="summary-calculations">
                <div className="summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{total}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{calculateFinalTotal()}</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="place-order-btn"
                disabled={processing}
              >
                {processing ? 'Processing...' : `Place Order • ₹${calculateFinalTotal()}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;