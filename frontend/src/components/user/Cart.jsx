import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../../styles/user/Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState('0.00');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
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
          setTotal(data.total);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/cart/update/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (response.ok) {
        fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (cartId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/cart/remove/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <div className="loading">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>Review your selected items</p>
        </div>
        
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some items to your cart to get started</p>
              <button className="primary-btn" onClick={() => navigate('/')}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-container">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.cart_id} className="cart-item">
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
                      <h3 className="item-name">{item.product_name}</h3>
                      <p className="item-category">{item.category_name} • {item.subcategory_name}</p>
                      <p className="item-meta">Color: <strong>{item.colour}</strong></p>
                      {item.size && <p className="item-meta">Size: <strong>{item.size}</strong></p>}
                      <div className="item-quantity">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-price">
                      ₹{item.total}
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.cart_id)}
                      aria-label={`Remove ${item.product_name} from cart`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="summary-card">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span className="label">Subtotal ({cartItems.length} items)</span>
                    <span className="value">₹{total}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Shipping</span>
                    <span className="value">FREE</span>
                  </div>
                  <div className="summary-row total">
                    <span className="label">Total</span>
                    <span className="value">₹{total}</span>
                  </div>
                  <button className="checkout-btn" onClick={proceedToCheckout}>
                    Proceed to Checkout
                  </button>
                  <p className="shipping-info">
                    🎉 Free shipping on all orders!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;