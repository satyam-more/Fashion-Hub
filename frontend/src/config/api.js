// API Configuration
// This file centralizes all API endpoint configurations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Base URL
  BASE: API_BASE_URL,
  API: `${API_BASE_URL}/api`,
  
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify-token`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  
  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/api/profile`,
    STATS: `${API_BASE_URL}/api/profile/stats`,
  },
  
  // Product endpoints
  PRODUCTS: {
    BASE: `${API_BASE_URL}/api/products`,
    CATEGORIES: `${API_BASE_URL}/api/products/categories`,
    SUBCATEGORIES: (categoryId) => `${API_BASE_URL}/api/products/subcategories/${categoryId}`,
    DETAIL: (id) => `${API_BASE_URL}/api/products/${id}`,
    SEARCH: `${API_BASE_URL}/api/products/search`,
  },
  
  // Cart endpoints
  CART: {
    BASE: `${API_BASE_URL}/api/cart`,
    ADD: `${API_BASE_URL}/api/cart/add`,
    UPDATE: (cartId) => `${API_BASE_URL}/api/cart/update/${cartId}`,
    REMOVE: (cartId) => `${API_BASE_URL}/api/cart/remove/${cartId}`,
  },
  
  // Wishlist endpoints
  WISHLIST: {
    BASE: `${API_BASE_URL}/api/wishlist`,
    ADD: `${API_BASE_URL}/api/wishlist/add`,
    REMOVE: (wishlistId) => `${API_BASE_URL}/api/wishlist/${wishlistId}`,
  },
  
  // Order endpoints
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    DETAIL: (orderId) => `${API_BASE_URL}/api/orders/${orderId}`,
    CANCEL: (orderId) => `${API_BASE_URL}/api/orders/cancel/${orderId}`,
    CREATE: `${API_BASE_URL}/api/orders/create`,
  },
  
  // Review endpoints
  REVIEWS: {
    PRODUCT: (productId) => `${API_BASE_URL}/api/reviews/product/${productId}`,
  },
  
  // Membership endpoints
  MEMBERSHIPS: {
    MY_MEMBERSHIP: `${API_BASE_URL}/api/memberships/my-membership`,
    CHECK_STATUS: `${API_BASE_URL}/api/memberships/check-status`,
    PURCHASE: `${API_BASE_URL}/api/memberships/purchase`,
  },
  
  // Custom tailoring endpoints
  CUSTOM: {
    APPOINTMENTS: `${API_BASE_URL}/api/custom/appointments`,
    APPOINTMENT_DETAIL: (appointmentId) => `${API_BASE_URL}/api/custom/appointments/${appointmentId}`,
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    PRODUCTS: `${API_BASE_URL}/api/admin/products`,
    ORDERS: `${API_BASE_URL}/api/admin/orders`,
    REVIEWS: `${API_BASE_URL}/api/admin/reviews`,
    APPOINTMENTS: `${API_BASE_URL}/api/admin/appointments`,
    PAYMENTS: `${API_BASE_URL}/api/admin/payments`,
    ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
    SALES_ANALYTICS: `${API_BASE_URL}/api/admin/sales-analytics`,
    CONSULTATION_ANALYTICS: `${API_BASE_URL}/api/admin/consultation-analytics`,
    SETTINGS: `${API_BASE_URL}/api/admin/settings`,
  },
  
  // Upload endpoints
  UPLOADS: {
    BASE: `${API_BASE_URL}/uploads`,
    IMAGE: (filename) => `${API_BASE_URL}/uploads/${filename}`,
  },
};

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export default API_ENDPOINTS;
