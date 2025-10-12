import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

const UserDashboardSimple = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.data.slice(0, 8));
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart/add', {
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

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Product added to cart successfully!');
      } else {
        alert(`Failed to add product to cart: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            {user ? `Welcome back, ${user.username}! 👋` : 'Welcome to Fashion Hub! 👗'}
          </h1>
          <p style={{
            fontSize: '1.3rem',
            marginBottom: '40px',
            opacity: 0.9
          }}>
            Discover the latest fashion trends and exclusive collections
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <button style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(255,107,107,0.3)'
                }}>
                  ✨ Explore New Arrivals
                </button>
                <button style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  padding: '15px 30px',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  👗 View Collections
                </button>
              </>
            ) : (
              <>
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(255,107,107,0.3)'
                  }}
                  onClick={() => navigate('/register')}
                >
                  🚀 Join Fashion Hub
                </button>
                <button 
                  style={{
                    background: 'transparent',
                    color: 'white',
                    border: '2px solid white',
                    padding: '15px 30px',
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/login')}
                >
                  👤 Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px'
          }}>
            ✨ Featured Products
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#666'
          }}>
            Discover our latest and most popular fashion items
          </p>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '1.2rem', color: '#667eea' }}>Loading products...</div>
          </div>
        ) : products.length > 0 ? (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {products.map((product) => (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  height: '250px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '4rem'
                }}>
                  {product.category === 'mens' ? '👔' : 
                   product.category === 'womens' ? '👗' : '👕'}
                </div>
                <div style={{ padding: '25px' }}>
                  <div style={{
                    color: '#667eea',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    {product.category}
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '15px'
                  }}>
                    {product.name}
                  </h3>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '20px'
                  }}>
                    ₹{product.price}
                  </div>
                  <button 
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => addToCart(product.id)}
                    disabled={product.quantity === 0}
                  >
                    {product.quantity === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
            <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>No Products Available</h3>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Check back later for new arrivals</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboardSimple;