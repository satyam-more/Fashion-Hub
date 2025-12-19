import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch admin user info
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setAdminName(user.username || 'Admin');
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin-dashboard' },
    { id: 'appointments', label: 'Appointments', icon: '✂️', path: '/admin/appointments' },
    { id: 'payments', label: 'Payment Verification', icon: '💳', path: '/admin/payments' },
    { id: 'products', label: 'Manage Products', icon: '📦', path: '/admin/products' },
    { id: 'users', label: 'Manage Users', icon: '👥', path: '/admin/users' },
    { id: 'orders', label: 'Manage Orders', icon: '🛒', path: '/admin/orders' },
    { id: 'reviews', label: 'Customer Reviews', icon: '💬', path: '/admin/reviews' },
    { id: 'analytics', label: 'Analytics & Reports', icon: '📈', path: '/admin/analytics' },
    { id: 'sales-analytics', label: 'Sales Analytics', icon: '💰', path: '/admin/sales-analytics' },
    { id: 'consultation-analytics', label: 'Consultation Analytics', icon: '✂️', path: '/admin/consultation-analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand">
            <h2>Fashion Hub</h2>
            <span>Admin Panel</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          
          <div className="header-right">
            <Link to="/" className="view-site-btn" title="View User Home Page">
              🏠 View Site
            </Link>
            <div className="admin-profile">
              <span>{adminName}</span>
              <div className="profile-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;