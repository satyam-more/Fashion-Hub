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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    
    fetchUserStats();
    fetchCategories();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // User not logged in, skip stats fetch
        return;
      }
      
      const response = await fetch(`${API_ENDPOINTS.API}/profile/stats', {
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API}/products/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

      const response = await fetch(`${API_ENDPOINTS.API}/cart/add', {
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

      const response = await fetch(`${API_ENDPOINTS.API}/wishlist/add', {
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
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-25px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        
        /* Hero Section Hover Effects */
        button:hover {
          transform: translateY(-3px) !important;
        }
        
        input:focus {
          transform: scale(1.01);
          transition: transform 0.3s ease;
        }
        
        /* Custom Tailoring Section Animations */
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes rotateGlow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes buttonPulse {
          0%, 100% {
            box-shadow: 0 8px 25px rgba(217, 119, 6, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 12px 35px rgba(217, 119, 6, 0.5);
            transform: scale(1.02);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            filter: blur(140px) brightness(1);
            opacity: 0.6;
          }
          50% {
            filter: blur(160px) brightness(1.3);
            opacity: 0.9;
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes scaleBreath {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes textGlow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(217, 119, 6, 0.3), 0 0 40px rgba(217, 119, 6, 0.2);
          }
          50% {
            text-shadow: 0 0 30px rgba(217, 119, 6, 0.5), 0 0 60px rgba(217, 119, 6, 0.3);
          }
        }
        
        @keyframes borderGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(217, 119, 6, 0.3), 0 15px 50px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(217, 119, 6, 0.6), 0 20px 60px rgba(0, 0, 0, 0.4);
          }
        }
        
        @keyframes badgeGlow {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 6px 25px rgba(255, 255, 255, 0.4), 0 0 30px rgba(217, 119, 6, 0.3);
          }
        }
        
        /* Category Card Hover Effects */
        .category-card-link {
          cursor: pointer;
        }
        
        .category-card-link:hover {
          transform: translateY(-12px) scale(1.02) !important;
          box-shadow: 0 25px 60px rgba(217, 119, 6, 0.35) !important;
          border-color: rgba(217, 119, 6, 0.5) !important;
        }
        
        .category-card-link:hover .category-image {
          transform: scale(1.15) rotate(1deg);
        }
        
        .category-card-link:hover .category-overlay {
          background: linear-gradient(180deg, rgba(217, 119, 6, 0.6) 0%, rgba(180, 83, 9, 0.85) 100%) !important;
        }
        
        .category-card-link:hover .category-name {
          transform: scale(1.05);
          text-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }
        
        .category-card-link:hover .category-button {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 25px rgba(217, 119, 6, 0.5) !important;
        }
        
        @keyframes categoryPulse {
          0%, 100% {
            box-shadow: 0 8px 25px rgba(217, 119, 6, 0.12);
          }
          50% {
            box-shadow: 0 12px 35px rgba(217, 119, 6, 0.2);
          }
        }
      `}</style>
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main style={dashboardStyles.main}>
        {/* Hero Section */}
        <section style={dashboardStyles.hero}>
          {/* Animated Background Elements */}
          <div style={dashboardStyles.bgCircle1}></div>
          <div style={dashboardStyles.bgCircle2}></div>
          <div style={dashboardStyles.bgCircle3}></div>
          
          <div style={dashboardStyles.heroContainer}>
            <div style={dashboardStyles.heroContent}>
              <div style={dashboardStyles.heroLeft}>
                <div style={dashboardStyles.badge}>✨ Premium Fashion Collection</div>
                <h1 style={dashboardStyles.heroTitle}>
                  Discover Your <span style={dashboardStyles.highlightText}>Style</span> with Confidence
                </h1>
                <p style={dashboardStyles.heroSubtitle}>
                  Fashion Hub is your destination for premium fashion. Explore trending styles, manage your wardrobe, and express your unique personality.
                </p>
                <div style={dashboardStyles.featuresRow}>
                  <div style={{...dashboardStyles.featureItem, animation: 'fadeInUp 1s ease-out 0.5s both'}}>
                    <span style={dashboardStyles.featureIcon}>✓</span>
                    <span style={dashboardStyles.featureText}>Free Shipping</span>
                  </div>
                  <div style={{...dashboardStyles.featureItem, animation: 'fadeInUp 1s ease-out 0.6s both'}}>
                    <span style={dashboardStyles.featureIcon}>✓</span>
                    <span style={dashboardStyles.featureText}>30-Day Returns</span>
                  </div>
                  <div style={{...dashboardStyles.featureItem, animation: 'fadeInUp 1s ease-out 0.7s both'}}>
                    <span style={dashboardStyles.featureIcon}>✓</span>
                    <span style={dashboardStyles.featureText}>Premium Quality</span>
                  </div>
                </div>
                <div style={dashboardStyles.searchContainer}>
                  <input 
                    type="text" 
                    placeholder="Search for products, styles, or categories..."
                    style={dashboardStyles.searchInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/search?q=${e.target.value}`);
                      }
                    }}
                  />
                  <button 
                    style={dashboardStyles.searchButton}
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      if (input.value) navigate(`/search?q=${input.value}`);
                    }}
                  >
                    🔍 Search
                  </button>
                </div>
                <div style={dashboardStyles.ctaButtons}>
                  <button style={dashboardStyles.primaryCta} onClick={() => navigate('/products/all')}>
                    Shop Now →
                  </button>
                  <button style={dashboardStyles.secondaryCta} onClick={() => navigate('/about')}>
                    Learn More
                  </button>
                </div>
              </div>
              <div style={dashboardStyles.heroRight}>
                <div style={dashboardStyles.imageGlow}></div>
                <img 
                  src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80" 
                  alt="Fashion Collection"
                  style={dashboardStyles.heroImage}
                  onError={(e) => {
                    // Previous image: /hero-model.png
                    // Fallback to clothing store
                    e.target.src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section style={dashboardStyles.productsSection}>
          <div style={dashboardStyles.sectionHeader}>
            <h2 style={dashboardStyles.sectionTitle}>✨ Shop by Category</h2>
            <p style={dashboardStyles.sectionSubtitle}>Explore our curated fashion collections</p>
          </div>
          
          {loading ? (
            <div style={dashboardStyles.loadingContainer}>
              <div style={dashboardStyles.loadingSpinner}>Loading categories...</div>
            </div>
          ) : categories.length > 0 ? (
            <div style={dashboardStyles.categoriesGrid}>
              {categories.map((category) => (
                <Link key={category.id} to={`/products/${category.name.toLowerCase()}`} style={dashboardStyles.categoryCard}>
                  <div style={dashboardStyles.categoryImageContainer}>
                    <img 
                      src={
                        category.name.toLowerCase().includes('men') && !category.name.toLowerCase().includes('women') ? 
                          'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800&q=80' :
                        category.name.toLowerCase().includes('women') ? 
                          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80' :
                        category.name.toLowerCase().includes('kid') ? 
                          'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80' :
                        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80'
                      }
                      alt={category.name}
                      style={dashboardStyles.categoryImage}
                    />
                    <div style={dashboardStyles.categoryOverlay}></div>
                  </div>
                  <div style={dashboardStyles.categoryContent}>
                    <h3 style={dashboardStyles.categoryName}>{category.name}</h3>
                    <p style={dashboardStyles.categoryDescription}>Explore {category.name} Collection</p>
                    <div style={dashboardStyles.categoryButton}>
                      Shop Now →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={dashboardStyles.emptyProducts}>
              <div style={dashboardStyles.emptyIcon}>📦</div>
              <h3 style={dashboardStyles.emptyTitle}>No Categories Available</h3>
              <p style={dashboardStyles.emptyText}>Check back later</p>
            </div>
          )}
        </section>

        {/* Custom Tailoring Hero Section */}
        <section style={dashboardStyles.customTailoringHero}>
          <div style={dashboardStyles.customHeroContainer}>
            <div style={dashboardStyles.customHeroContent}>
              <div style={dashboardStyles.customBadge}>
                <span style={dashboardStyles.badgeIcon}>✨</span>
                <span>Custom Tailoring</span>
              </div>
              <h2 style={dashboardStyles.customHeroTitle}>
                Create Your <span style={dashboardStyles.customHighlight}>Perfect Fit</span>
              </h2>
              <p style={dashboardStyles.customHeroDescription}>
                Experience the luxury of custom-made clothing. Our expert craftsmen will create garments tailored precisely to your measurements, style preferences, and personality.
              </p>
              
              <div style={dashboardStyles.customFeatures}>
                <div style={dashboardStyles.customFeature}>
                  <span style={dashboardStyles.featureCheckIcon}>✓</span>
                  <span>Expert Measurements</span>
                </div>
                <div style={dashboardStyles.customFeature}>
                  <span style={dashboardStyles.featureCheckIcon}>✓</span>
                  <span>Premium Fabrics</span>
                </div>
                <div style={dashboardStyles.customFeature}>
                  <span style={dashboardStyles.featureCheckIcon}>✓</span>
                  <span>Perfect Fit Guarantee</span>
                </div>
              </div>
            </div>

            <div style={dashboardStyles.customHeroRight}>
              <div style={dashboardStyles.customHeroImage}>
                <div style={dashboardStyles.imageGlowEffect}></div>
                <div style={dashboardStyles.tailoringImagePlaceholder}>
                  <span style={dashboardStyles.tailoringIcon}>✂️</span>
                  <p style={dashboardStyles.tailoringText}>Custom Tailoring</p>
                </div>
              </div>
              
              <button 
                style={dashboardStyles.bookNowBtn}
                onClick={() => navigate('/custom-tailoring')}
              >
                <span style={dashboardStyles.btnIcon}>📅</span>
                Book Appointment
              </button>
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
    overflowX: 'hidden',
    position: 'relative',
  },
  main: {
    paddingTop: '0',
  },
  hero: {
    background: 'linear-gradient(135deg, #faf8f5 0%, #f5f1eb 50%, #ede7dd 100%)',
    padding: '280px 0 120px',
    color: '#2d1810',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '950px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: 'none',
  },
  bgCircle1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, rgba(217, 119, 6, 0.04) 50%, transparent 70%)',
    top: '-100px',
    right: '10%',
    filter: 'blur(80px)',
    animation: 'float 20s ease-in-out infinite, pulse 8s ease-in-out infinite',
  },
  bgCircle2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 115, 85, 0.06) 0%, rgba(107, 84, 68, 0.04) 50%, transparent 70%)',
    bottom: '10%',
    left: '5%',
    filter: 'blur(70px)',
    animation: 'float 25s ease-in-out infinite 3s, pulse 10s ease-in-out infinite 2s',
  },
  bgCircle3: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.05) 0%, transparent 70%)',
    top: '40%',
    right: '30%',
    filter: 'blur(60px)',
    animation: 'float 30s ease-in-out infinite 6s, pulse 12s ease-in-out infinite 4s',
  },
  heroContainer: {
    maxWidth: '100%',
    margin: '0',
    width: '100%',
    padding: '0 120px',
  },
  heroContent: {
    display: 'grid',
    gridTemplateColumns: '45% 55%',
    gap: '80px',
    alignItems: 'center',
    maxWidth: '100%',
    margin: '0',
    width: '100%',
  },
  heroLeft: {
    zIndex: 2,
    animation: 'slideInLeft 1s ease-out',
    maxWidth: '650px',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(217, 119, 6, 0.08)',
    backdropFilter: 'none',
    padding: '10px 20px',
    borderRadius: '30px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#d97706',
    marginBottom: '24px',
    border: '1px solid rgba(217, 119, 6, 0.2)',
    animation: 'fadeInUp 1s ease-out 0.2s both',
    letterSpacing: '1px',
    boxShadow: 'none',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: '4.8rem',
    fontWeight: '700',
    marginBottom: '30px',
    lineHeight: '1.1',
    letterSpacing: '-1.5px',
    color: '#2d1810',
    textShadow: 'none',
    animation: 'fadeInUp 1s ease-out 0.3s both',
  },
  highlightText: {
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'none',
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '35px',
    lineHeight: '1.8',
    fontWeight: '400',
    color: '#6b5444',
    maxWidth: '600px',
    textShadow: 'none',
    animation: 'fadeInUp 1s ease-out 0.4s both',
  },
  featuresRow: {
    display: 'flex',
    gap: '30px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
    transition: 'transform 0.3s ease',
  },
  featureIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#d97706',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    boxShadow: 'none',
  },
  featureText: {
    fontSize: '0.9rem',
    fontWeight: '400',
    textShadow: 'none',
    color: '#6b5444',
  },
  searchContainer: {
    display: 'flex',
    gap: '0',
    maxWidth: '600px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    overflow: 'hidden',
    animation: 'fadeInUp 1s ease-out 0.6s both',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease',
    border: '1px solid rgba(217, 119, 6, 0.15)',
    background: '#ffffff',
    marginBottom: '40px',
    transform: 'translateY(0)',
  },
  searchInput: {
    flex: 1,
    padding: '18px 24px',
    fontSize: '1rem',
    border: 'none',
    outline: 'none',
    background: '#ffffff',
    color: '#2d1810',
    transition: 'all 0.3s ease',
    fontWeight: '400',
  },
  searchButton: {
    background: '#d97706',
    color: 'white',
    border: 'none',
    padding: '18px 40px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace: 'nowrap',
    letterSpacing: '0.3px',
    transform: 'scale(1)',
  },
  ctaButtons: {
    display: 'flex',
    gap: '20px',
    marginTop: '45px',
    animation: 'fadeInUp 1s ease-out 0.7s both',
  },
  primaryCta: {
    background: '#2d1810',
    color: '#ffffff',
    border: 'none',
    padding: '16px 40px',
    fontSize: '0.95rem',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(45, 24, 16, 0.2)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    transform: 'translateY(0)',
  },
  secondaryCta: {
    background: 'transparent',
    color: '#4a3c2f',
    border: '1px solid #4a3c2f',
    padding: '16px 40px',
    fontSize: '0.95rem',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'none',
    letterSpacing: '0.5px',
    boxShadow: 'none',
    textTransform: 'uppercase',
    transform: 'translateY(0)',
  },
  heroRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    position: 'relative',
    animation: 'slideInRight 1s ease-out 0.3s both',
    padding: '0',
    overflow: 'hidden',
    height: '100%',
    marginRight: '-120px',
  },
  imageGlow: {
    display: 'none',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    minHeight: '850px',
    maxWidth: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: '0',
    filter: 'none',
    animation: 'fadeIn 1.2s ease-out',
    position: 'relative',
    zIndex: 2,
    transition: 'transform 0.6s ease, opacity 0.6s ease',
    border: 'none',
    boxShadow: 'none',
    opacity: '0.95',
    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)',
    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)',
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
    background: 'linear-gradient(135deg, #fef9f3 0%, #fef3e2 100%)',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
    padding: '32px',
    borderRadius: '16px',
    border: '2px solid rgba(217, 119, 6, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(217, 119, 6, 0.1)',
    ':hover': {
      boxShadow: '0 10px 30px rgba(217, 119, 6, 0.2)',
      transform: 'translateY(-4px)',
      borderColor: 'rgba(217, 119, 6, 0.3)',
    }
  },
  statIcon: {
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 2px 4px rgba(217, 119, 6, 0.3))',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    fontSize: '0.875rem',
    margin: 0,
    color: '#8B7355',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  productsSection: {
    padding: '80px 0',
    background: '#ffffff',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '64px',
    maxWidth: '600px',
    margin: '0 auto 64px',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  sectionSubtitle: {
    fontSize: '1.125rem',
    color: '#8B7355',
    lineHeight: '1.6',
    fontWeight: '500',
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
  categoriesGrid: {
    width: '100%',
    padding: '0 80px',
    margin: '0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '50px',
  },
  categoryCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '2px solid rgba(217, 119, 6, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 25px rgba(217, 119, 6, 0.12)',
    textDecoration: 'none',
    display: 'block',
    position: 'relative',
    animation: 'categoryPulse 3s ease-in-out infinite',
  },
  categoryImageContainer: {
    height: '350px',
    position: 'relative',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.7) 100%)',
    transition: 'background 0.5s ease',
    willChange: 'background',
  },
  categoryContent: {
    padding: '32px',
    textAlign: 'center',
  },
  categoryName: {
    fontSize: '1.8rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
    transition: 'all 0.3s ease',
    willChange: 'transform',
  },
  categoryDescription: {
    fontSize: '1rem',
    color: '#8B7355',
    marginBottom: '24px',
    fontWeight: '500',
  },
  categoryButton: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '25px',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 6px 20px rgba(217, 119, 6, 0.3)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.5px',
    willChange: 'transform',
    position: 'relative',
    overflow: 'hidden',
  },
  categoryLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  productCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid rgba(217, 119, 6, 0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    boxShadow: '0 4px 15px rgba(217, 119, 6, 0.08)',
    ':hover': {
      boxShadow: '0 12px 35px rgba(217, 119, 6, 0.2)',
      transform: 'translateY(-6px)',
      borderColor: 'rgba(217, 119, 6, 0.25)',
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
  // Custom Tailoring Hero Section Styles
  customTailoringHero: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #fef3e2 0%, #fde8c8 50%, #fef3e2 100%)',
    position: 'relative',
    overflow: 'hidden',
    borderTop: '1px solid rgba(217, 119, 6, 0.1)',
    borderBottom: '1px solid rgba(217, 119, 6, 0.1)',
  },
  customHeroContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '60px',
    alignItems: 'center',
  },
  customHeroContent: {
    zIndex: 2,
    animation: 'slideInLeft 0.8s ease-out',
  },
  customBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(180, 83, 9, 0.15) 100%)',
    border: '2px solid rgba(217, 119, 6, 0.4)',
    padding: '10px 24px',
    borderRadius: '30px',
    fontSize: '0.9rem',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#b45309',
    animation: 'scaleIn 0.6s ease-out 0.2s backwards',
    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
  },
  badgeIcon: {
    fontSize: '1.2rem',
  },
  customHeroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '24px',
    lineHeight: '1.2',
    color: '#2d1810',
    textShadow: '0 2px 4px rgba(217, 119, 6, 0.1)',
  },
  customHighlight: {
    background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    position: 'relative',
    filter: 'drop-shadow(0 2px 4px rgba(217, 119, 6, 0.2))',
  },
  customHeroDescription: {
    fontSize: '1.15rem',
    lineHeight: '1.8',
    marginBottom: '32px',
    color: '#6b5444',
    maxWidth: '600px',
    fontWeight: '500',
  },
  customFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '0',
  },
  customFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#4a3c2f',
  },
  featureCheckIcon: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    flexShrink: 0,
    color: 'white',
    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
  },
  customHeroRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    animation: 'slideInRight 0.8s ease-out',
  },
  customHeroImage: {
    position: 'relative',
    height: '400px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGlowEffect: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, rgba(234, 88, 12, 0.1) 50%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 3s ease-in-out infinite, rotateGlow 20s linear infinite',
  },
  tailoringImagePlaceholder: {
    width: '350px',
    height: '350px',
    background: 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid rgba(217, 119, 6, 0.3)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 25px 70px rgba(217, 119, 6, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    animation: 'gentleFloat 4s ease-in-out infinite',
    transition: 'all 0.3s ease',
  },
  tailoringIcon: {
    fontSize: '7rem',
    marginBottom: '20px',
    filter: 'drop-shadow(0 6px 16px rgba(217, 119, 6, 0.5))',
    animation: 'scaleIn 0.8s ease-out 0.4s backwards',
    transition: 'transform 0.3s ease',
  },
  tailoringText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  bookNowBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    color: 'white',
    border: 'none',
    padding: '20px 44px',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(217, 119, 6, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    width: '100%',
    maxWidth: '350px',
    animation: 'buttonPulse 2s ease-in-out infinite',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  btnIcon: {
    fontSize: '1.3rem',
  },
};

export default UserDashboard;