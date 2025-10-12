import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cart: 0,
    totalSpent: '0.00'
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    
    fetchUserStats();
    fetchFeaturedProducts();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // User not logged in, skip stats fetch
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/profile/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched:', data); // Debug log
        if (data.success) {
          // Get first 8 products for featured display
          const products = data.data.slice(0, 8);
          console.log('First product images:', products[0]?.images); // Debug log
          setProducts(products);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, size = 'M') => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Adding to cart:', { productId, size }); // Debug log

      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          size: size
        })
      });

      const data = await response.json();
      console.log('Cart response:', data); // Debug log

      if (response.ok && data.success) {
        alert('Product added to cart successfully!');
        // Refresh user stats to update cart count
        fetchUserStats();
      } else {
        console.error('Cart error:', data);
        alert(`Failed to add product to cart: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Product added to wishlist!');
          // Refresh user stats to update wishlist count
          fetchUserStats();
        }
      } else {
        alert('Failed to add product to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Error adding product to wishlist');
    }
  };

  return (
    <div style={dashboardStyles.container}>
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main style={dashboardStyles.main}>
        {/* Hero Section */}
        <section style={dashboardStyles.hero}>
          <div style={dashboardStyles.heroContainer}>
            <div style={dashboardStyles.heroContent}>
              <h1 style={dashboardStyles.heroTitle}>
                {user ? `Welcome back, ${user.username}! 👋` : 'Welcome to Fashion Hub! 👋'}
              </h1>
              <p style={dashboardStyles.heroSubtitle}>
                Discover the latest fashion trends and exclusive collections where tradition meets modern elegance
              </p>
              <div style={dashboardStyles.heroActions}>
                {user ? (
                  <>
                    <button style={dashboardStyles.primaryBtn}>
                      ✨ Explore New Arrivals
                    </button>
                    <button style={dashboardStyles.secondaryBtn}>
                      👗 View Collections
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      style={dashboardStyles.primaryBtn}
                      onClick={() => navigate('/register')}
                    >
                      🚀 Join Fashion Hub
                    </button>
                    <button 
                      style={dashboardStyles.secondaryBtn}
                      onClick={() => navigate('/login')}
                    >
                      👤 Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section style={dashboardStyles.statsSection}>
          <div style={dashboardStyles.statsContainer}>
            {user ? (
              <>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>📦</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>{stats.orders}</h3>
                    <p style={dashboardStyles.statLabel}>Orders</p>
                  </div>
                </div>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>❤️</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>{stats.wishlist}</h3>
                    <p style={dashboardStyles.statLabel}>Wishlist Items</p>
                  </div>
                </div>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>💰</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>₹{stats.totalSpent}</h3>
                    <p style={dashboardStyles.statLabel}>Total Spent</p>
                  </div>
                </div>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>🛒</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>{stats.cart}</h3>
                    <p style={dashboardStyles.statLabel}>Cart Items</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>👗</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>1000+</h3>
                    <p style={dashboardStyles.statLabel}>Products</p>
                  </div>
                </div>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>⭐</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>4.8</h3>
                    <p style={dashboardStyles.statLabel}>Rating</p>
                  </div>
                </div>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>🚚</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>Free</h3>
                    <p style={dashboardStyles.statLabel}>Shipping</p>
                  </div>
                </div>
                <div style={dashboardStyles.statCard}>
                  <div style={dashboardStyles.statIcon}>🔄</div>
                  <div style={dashboardStyles.statInfo}>
                    <h3 style={dashboardStyles.statNumber}>30 Days</h3>
                    <p style={dashboardStyles.statLabel}>Returns</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section style={dashboardStyles.productsSection}>
          <div style={dashboardStyles.sectionHeader}>
            <h2 style={dashboardStyles.sectionTitle}>✨ Featured Products</h2>
            <p style={dashboardStyles.sectionSubtitle}>Discover our latest and most popular fashion items</p>
          </div>
          
          {loading ? (
            <div style={dashboardStyles.loadingContainer}>
              <div style={dashboardStyles.loadingSpinner}>Loading products...</div>
            </div>
          ) : products.length > 0 ? (
            <div style={dashboardStyles.productsGrid}>
              {products.map((product) => (
                <div key={product.id} style={dashboardStyles.productCard}>
                  <Link to={`/product/${product.id}`} style={dashboardStyles.productLink}>
                    <div style={dashboardStyles.productImage}>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000/uploads/${product.images[0]}`} 
                          alt={product.name}
                          style={dashboardStyles.productImg}
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', e.target.src);
                          }}
                        />
                      ) : null}
                      <div 
                        style={{
                          ...dashboardStyles.productPlaceholder,
                          display: (product.images && product.images.length > 0) ? 'none' : 'flex'
                        }}
                      >
                        <div style={dashboardStyles.placeholderIcon}>
                          {product.category === 'mens' ? '👔' : 
                           product.category === 'womens' ? '👗' : 
                           product.type === 'upperwear' ? '👕' : 
                           product.type === 'bottomwear' ? '👖' : '👕'}
                        </div>
                      </div>
                      {product.discount > 0 && (
                        <div style={dashboardStyles.discountBadge}>
                          -{product.discount}%
                        </div>
                      )}
                      <div style={dashboardStyles.productActions} onClick={(e) => e.preventDefault()}>
                        <button 
                          style={dashboardStyles.wishlistBtn}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToWishlist(product.id);
                          }}
                          title="Add to Wishlist"
                        >
                          ❤️
                        </button>
                      </div>
                    </div>
                    <div style={dashboardStyles.productContent}>
                      <div style={dashboardStyles.productCategory}>{product.category}</div>
                      <h3 style={dashboardStyles.productName}>{product.name}</h3>
                      <div style={dashboardStyles.productDetails}>
                        {product.material && (
                          <span style={dashboardStyles.productMaterial}>{product.material}</span>
                        )}
                        {product.color && (
                          <span style={dashboardStyles.productColor}>{product.color}</span>
                        )}
                      </div>
                      <div style={dashboardStyles.productPrice}>
                        {product.discount > 0 ? (
                          <>
                            <span style={dashboardStyles.discountedPrice}>
                              ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </span>
                            <span style={dashboardStyles.originalPrice}>₹{product.price}</span>
                          </>
                        ) : (
                          <span style={dashboardStyles.currentPrice}>₹{product.price}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div style={dashboardStyles.productButtons}>
                    <button 
                      style={product.quantity === 0 ? dashboardStyles.outOfStockBtn : dashboardStyles.addToCartBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      disabled={product.quantity === 0}
                    >
                      {product.quantity === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={dashboardStyles.emptyProducts}>
              <div style={dashboardStyles.emptyIcon}>📦</div>
              <h3 style={dashboardStyles.emptyTitle}>No Products Available</h3>
              <p style={dashboardStyles.emptyText}>Check back later for new arrivals</p>
            </div>
          )}
        </section>

        {/* Services Section */}
        <section style={dashboardStyles.servicesSection}>
          <div style={dashboardStyles.sectionHeader}>
            <h2 style={dashboardStyles.sectionTitle}>🌟 Our Premium Services</h2>
            <p style={dashboardStyles.sectionSubtitle}>Experience luxury fashion with our exclusive services</p>
          </div>
          
          <div style={dashboardStyles.servicesGrid}>
            <div style={dashboardStyles.serviceCard}>
              <div style={dashboardStyles.serviceIcon}>✂️</div>
              <h3 style={dashboardStyles.serviceTitle}>Bespoke Tailoring</h3>
              <p style={dashboardStyles.serviceDescription}>Custom-made clothing tailored to your exact measurements and preferences</p>
              <button style={dashboardStyles.serviceBtn}>Learn More</button>
            </div>
            
            <div style={dashboardStyles.serviceCard}>
              <div style={dashboardStyles.serviceIcon}>🚚</div>
              <h3 style={dashboardStyles.serviceTitle}>Express Delivery</h3>
              <p style={dashboardStyles.serviceDescription}>Fast and secure delivery to your doorstep within 24-48 hours</p>
              <button style={dashboardStyles.serviceBtn}>Learn More</button>
            </div>
            
            <div style={dashboardStyles.serviceCard}>
              <div style={dashboardStyles.serviceIcon}>💎</div>
              <h3 style={dashboardStyles.serviceTitle}>Personal Styling</h3>
              <p style={dashboardStyles.serviceDescription}>Expert fashion consultants to help you create the perfect look</p>
              <button style={dashboardStyles.serviceBtn}>Learn More</button>
            </div>
            
            <div style={dashboardStyles.serviceCard}>
              <div style={dashboardStyles.serviceIcon}>🔄</div>
              <h3 style={dashboardStyles.serviceTitle}>Easy Returns</h3>
              <p style={dashboardStyles.serviceDescription}>Hassle-free returns and exchanges within 30 days of purchase</p>
              <button style={dashboardStyles.serviceBtn}>Learn More</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

// Dashboard Styles
const dashboardStyles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
  },
  main: {
    paddingTop: '0',
  },
  hero: {
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    padding: '120px 20px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
  },
  heroContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  heroContent: {
    zIndex: 2,
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '300',
    marginBottom: '24px',
    lineHeight: '1.1',
    letterSpacing: '-1px',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    marginBottom: '48px',
    opacity: 0.9,
    lineHeight: '1.6',
    fontWeight: '300',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    background: '#d97706',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      background: '#b45309',
    }
  },
  secondaryBtn: {
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '14px 30px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      background: 'white',
      color: '#1f2937',
    }
  },
  heroImage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImageContent: {
    width: '400px',
    height: '400px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
  },
  fashionIcons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  fashionIcon: {
    fontSize: '4rem',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
    animation: 'float 3s ease-in-out infinite',
  },
  statsSection: {
    padding: '80px 20px',
    background: '#f9fafb',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  statCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    ':hover': {
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    }
  },
  statIcon: {
    fontSize: '2.5rem',
    color: '#d97706',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: '0.875rem',
    margin: 0,
    color: '#6b7280',
    fontWeight: '500',
  },
  productsSection: {
    padding: '80px 20px',
    background: 'white',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '64px',
    maxWidth: '600px',
    margin: '0 auto 64px',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: '300',
    color: '#1f2937',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  sectionSubtitle: {
    fontSize: '1.125rem',
    color: '#6b7280',
    lineHeight: '1.6',
    fontWeight: '400',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  loadingSpinner: {
    fontSize: '1.2rem',
    color: '#667eea',
  },
  productsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },
  productCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    position: 'relative',
    ':hover': {
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      transform: 'translateY(-4px)',
    }
  },
  productLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  productImage: {
    position: 'relative',
    height: '250px',
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  placeholderIcon: {
    fontSize: '4rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  discountBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: '#ff4757',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  productActions: {
    position: 'absolute',
    top: '15px',
    right: '15px',
  },
  wishlistBtn: {
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'all 0.3s ease',
    ':hover': {
      background: '#ff4757',
      transform: 'scale(1.1)',
    }
  },
  productContent: {
    padding: '25px',
  },
  productCategory: {
    color: '#d97706',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  productName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    lineHeight: '1.3',
  },
  productDetails: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
  },
  productMaterial: {
    background: '#f8f9fa',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: '#666',
  },
  productColor: {
    background: '#f8f9fa',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: '#666',
  },
  productPrice: {
    marginBottom: '20px',
  },
  discountedPrice: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#ff4757',
    marginRight: '10px',
  },
  originalPrice: {
    fontSize: '1rem',
    color: '#999',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#333',
  },
  productButtons: {
    display: 'flex',
    gap: '10px',
    padding: '0 25px 25px',
  },
  addToCartBtn: {
    flex: 1,
    background: '#d97706',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      background: '#b45309',
    }
  },
  outOfStockBtn: {
    flex: 1,
    background: '#ccc',
    color: '#666',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
  emptyProducts: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '10px',
  },
  emptyText: {
    color: '#666',
    fontSize: '1.1rem',
  },
  servicesSection: {
    padding: '80px 20px',
    background: '#f9fafb',
  },
  servicesGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  serviceCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    ':hover': {
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    }
  },
  serviceIcon: {
    fontSize: '2.5rem',
    marginBottom: '16px',
    color: '#d97706',
  },
  serviceTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1f2937',
  },
  serviceDescription: {
    fontSize: '0.875rem',
    lineHeight: '1.6',
    marginBottom: '20px',
    color: '#6b7280',
  },
  serviceBtn: {
    background: '#d97706',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      background: '#b45309',
    }
  },
};

export default UserDashboard;