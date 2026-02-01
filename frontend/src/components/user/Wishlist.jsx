import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import '../../styles/user/Wishlist.css';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.WISHLIST.BASE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Wishlist response:', data);

      if (response.ok) {
        if (data.success) {
          setWishlistItems(data.data);
        } else {
          setError(data.message || 'Failed to load wishlist');
        }
      } else {
        setError(data.message || data.error || 'Failed to load wishlist');
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      setError('An error occurred while loading wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (wishlistId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_ENDPOINTS.API}/wishlist/${wishlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlistItems(wishlistItems.filter(item => item.wishlistId !== wishlistId));
      } else {
        alert('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      alert('An error occurred while removing item');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_ENDPOINTS.API}/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          size: 'M'
        })
      });

      if (response.ok) {
        alert('Product added to cart!');
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('An error occurred');
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    return (price * (1 - discount / 100)).toFixed(2);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="wishlist-loading">
          <div className="loading-spinner"></div>
          <p>Loading wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">💝</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love for later</p>
            <Link to="/products/all" className="shop-now-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item.wishlistId} className="wishlist-card">
                <Link to={`/product/${item.productId}`} className="wishlist-image-link">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="wishlist-image"
                    />
                  ) : (
                    <div className="wishlist-no-image">
                      <span>📷</span>
                    </div>
                  )}
                  {item.discount > 0 && (
                    <div className="wishlist-discount-badge">
                      -{item.discount}%
                    </div>
                  )}
                  {!item.inStock && (
                    <div className="out-of-stock-overlay">
                      Out of Stock
                    </div>
                  )}
                </Link>

                <div className="wishlist-info">
                  <Link to={`/product/${item.productId}`} className="wishlist-name">
                    {item.name}
                  </Link>
                  
                  <div className="wishlist-category">
                    {item.category} • {item.subcategory}
                  </div>

                  <div className="wishlist-price">
                    {item.discount > 0 ? (
                      <>
                        <span className="discounted-price">
                          ₹{calculateDiscountedPrice(item.price, item.discount)}
                        </span>
                        <span className="original-price">₹{item.price}</span>
                      </>
                    ) : (
                      <span className="current-price">₹{item.price}</span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(item.productId)}
                      disabled={!item.inStock}
                    >
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.wishlistId)}
                      title="Remove from wishlist"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
