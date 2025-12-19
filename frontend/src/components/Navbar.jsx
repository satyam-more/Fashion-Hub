import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const navigate = useNavigate();
  const location = window.location;

  useEffect(() => {
    // Check authentication status
    checkAuthStatus();
    // Fetch cart and wishlist counts
    fetchCounts();
    // Fetch categories and subcategories
    fetchCategories();
    // Check membership status
    checkMembership();
    // Check if on home page
    setIsHomePage(location.pathname === '/' || location.pathname === '/dashboard');
  }, [location.pathname]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      setUser(null);
    }
  };

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Fetch cart count
      const cartResponse = await fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (cartData.success) {
          setCartCount(cartData.items?.length || 0);
        }
      }

      // Fetch wishlist count
      const wishlistResponse = await fetch('http://localhost:5000/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        if (wishlistData.success) {
          setWishlistCount(wishlistData.items?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    navigate('/');
    // Force page refresh to ensure complete logout
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMouseEnter = (dropdown) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const checkMembership = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/memberships/check-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.is_premium) {
          setIsPremium(true);
        }
      }
    } catch (error) {
      console.error('Check membership error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);

          // Fetch subcategories for each category
          const subcategoriesData = {};
          for (const category of data.data) {
            try {
              const subResponse = await fetch(`http://localhost:5000/api/products/subcategories/${category.id}`);
              if (subResponse.ok) {
                const subData = await subResponse.json();
                if (subData.success) {
                  subcategoriesData[category.id] = subData.data;
                }
              }
            } catch (error) {
              console.error(`Error fetching subcategories for ${category.name}:`, error);
            }
          }
          setSubcategories(subcategoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <nav className={`navbar ${isHomePage ? 'navbar-home' : ''}`}>
      {/* Top Row */}
      <div className="navbar-top-row">
        <div className="navbar-container">
          {/* Left: Logo */}
          <div className="navbar-brand">
            <Link to="/" className="navbar-brand-link">
              <span className="navbar-logo-text">Fashion Hub</span>
            </Link>
          </div>

          {/* Right: Search, Cart, Wishlist, Profile */}
          <div className="navbar-right-actions">
            {/* Search Bar - Hidden on Home Page */}
            {!isHomePage && (
              <form onSubmit={handleSearch} className="navbar-search-form">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar-search-input"
                />
                <button type="submit" className="navbar-search-btn">
                  🔍
                </button>
              </form>
            )}

            {/* Cart */}
            <div className="navbar-icon-container">
              <Link to="/cart" className="navbar-icon-link">
                <span className="navbar-icon">🛒</span>
                {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
              </Link>
            </div>

            {/* Wishlist */}
            <div className="navbar-icon-container">
              <Link to="/wishlist" className="navbar-icon-link">
                <span className="navbar-icon">❤️</span>
                {wishlistCount > 0 && <span className="navbar-badge">{wishlistCount}</span>}
              </Link>
            </div>

            {/* Profile or Auth */}
            {user ? (
              <div
                className="navbar-profile-container"
                onMouseEnter={() => handleMouseEnter('profile')}
                onMouseLeave={handleMouseLeave}
              >
                <button className="navbar-profile-icon">
                  <div className={`navbar-avatar ${isPremium ? 'premium-avatar' : ''}`}>
                    {user.username?.charAt(0).toUpperCase()}
                    {isPremium && <span className="premium-crown">👑</span>}
                  </div>
                </button>

                {activeDropdown === 'profile' && (
                  <div className="navbar-profile-dropdown">
                    <div className="navbar-profile-header">
                      <strong>{user.username}</strong>
                      <small style={{ color: '#666', display: 'block' }}>{user.email}</small>
                    </div>
                    <div className="navbar-dropdown-divider"></div>
                    <Link to="/profile" className="navbar-dropdown-item">
                      👤 My Profile
                    </Link>
                    <Link to="/orders" className="navbar-dropdown-item">
                      📦 My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <>
                        <div className="navbar-dropdown-divider"></div>
                        <Link to="/admin-dashboard" className="navbar-dropdown-item admin-item">
                          ⚙️ Administration
                        </Link>
                      </>
                    )}
                    <div className="navbar-dropdown-divider"></div>
                    <button onClick={handleLogout} className="navbar-logout-btn">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar-auth-buttons">
                <Link to="/login" className="navbar-login-btn">Login</Link>
                <Link to="/register" className="navbar-register-btn">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Links */}
      <div className="navbar-bottom-row">
        <div className="navbar-container">
          <div className="navbar-nav-links">
            {categories.map((category) => (
              <div
                key={category.id}
                className="navbar-nav-item"
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link to={`/products/${category.name.toLowerCase()}`} className="navbar-nav-link">
                  {category.name}
                </Link>

                {activeDropdown === category.id && subcategories[category.id] && (
                  <div className="navbar-category-dropdown">
                    <div className="navbar-category-grid">
                      {subcategories[category.id].map((subcategory) => (
                        <div key={subcategory.id}>
                          <Link
                            to={`/products/${category.name.toLowerCase()}/${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="navbar-category-item"
                          >
                            {subcategory.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Custom Tailoring Link */}
            <div className="navbar-nav-item">
              <Link to="/custom-tailoring" className="navbar-nav-link custom-tailoring-link">
                ✂️ Custom Tailoring
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};



export default Navbar;