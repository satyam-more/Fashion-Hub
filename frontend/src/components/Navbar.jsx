import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';
import { API_ENDPOINTS } from '../config/api';
import { debounce } from '../utils/debounce';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const navigate = useNavigate();
  const location = window.location;
  const searchRef = useRef(null);

  // Debounced search function - waits 500ms after user stops typing
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSearchSuggestions(data.data.slice(0, 5)); // Show top 5 suggestions
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 500), // 500ms delay
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

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
      const cartResponse = await fetch(API_ENDPOINTS.CART.BASE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (cartData.success) {
          setCartCount(cartData.items?.length || 0);
        }
      }

      // Fetch wishlist count
      const wishlistResponse = await fetch(API_ENDPOINTS.WISHLIST.BASE, {
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
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      const response = await fetch(`${API_ENDPOINTS.API}/memberships/check-status`, {
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
      const response = await fetch(`${API_ENDPOINTS.API}/products/categories`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);

          // Fetch subcategories for each category
          const subcategoriesData = {};
          for (const category of data.data) {
            try {
              const subResponse = await fetch(`${API_ENDPOINTS.API}/products/subcategories/${category.id}`);
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
              <div className="navbar-search-container" ref={searchRef}>
                <form onSubmit={handleSearch} className="navbar-search-form">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="navbar-search-input"
                  />
                  <button type="submit" className="navbar-search-btn">
                    🔍
                  </button>
                </form>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="search-suggestions">
                    {searchSuggestions.map((product) => (
                      <div
                        key={product.id}
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(product.id)}
                      >
                        <span className="suggestion-name">{product.name}</span>
                        <span className="suggestion-price">₹{product.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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