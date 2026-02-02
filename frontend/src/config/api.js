// API Configuration
// This file centralizes all API endpoints for the Fashion Hub application

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fashion-hub-backend-o7bo.onrender.com';

export const API_ENDPOINTS = {
  // Base API URL
  API: API_BASE_URL + '/api',
  
  // Authentication endpoints
  AUTH: {
    LOGIN: API_BASE_URL + '/api/auth/login',
    REGISTER: API_BASE_URL + '/api/auth/register',
    LOGOUT: API_BASE_URL + '/api/auth/logout',
    VERIFY: API_BASE_URL + '/api/auth/verify',
    FORGOT_PASSWORD: API_BASE_URL + '/api/auth/forgot-password',
    RESET_PASSWORD: API_BASE_URL + '/api/auth/reset-password',
    OTP_LOGIN: API_BASE_URL + '/api/auth/otp-login',
    VERIFY_OTP: API_BASE_URL + '/api/auth/verify-otp'
  },
  
  // Product endpoints
  PRODUCTS: {
    BASE: API_BASE_URL + '/api/products',
    BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
    SEARCH: API_BASE_URL + '/api/products/search',
    CATEGORIES: API_BASE_URL + '/api/products/categories',
    SUBCATEGORIES: (categoryId) => `${API_BASE_URL}/api/products/subcategories/${categoryId}`
  },
  
  // Cart endpoints
  CART: {
    BASE: API_BASE_URL + '/api/cart',
    ADD: API_BASE_URL + '/api/cart/add',
    UPDATE: (itemId) => `${API_BASE_URL}/api/cart/update/${itemId}`,
    REMOVE: (itemId) => `${API_BASE_URL}/api/cart/remove/${itemId}`,
    CLEAR: API_BASE_URL + '/api/cart/clear'
  },
  
  // Wishlist endpoints
  WISHLIST: {
    BASE: API_BASE_URL + '/api/wishlist',
    ADD: API_BASE_URL + '/api/wishlist/add',
    REMOVE: (productId) => `${API_BASE_URL}/api/wishlist/remove/${productId}`
  },
  
  // Order endpoints
  ORDERS: {
    BASE: API_BASE_URL + '/api/orders',
    CREATE: API_BASE_URL + '/api/orders/create',
    BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
    USER_ORDERS: API_BASE_URL + '/api/orders/user'
  },
  
  // User profile endpoints
  USER: {
    PROFILE: API_BASE_URL + '/api/user/profile',
    UPDATE: API_BASE_URL + '/api/user/update',
    CHANGE_PASSWORD: API_BASE_URL + '/api/user/change-password'
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: API_BASE_URL + '/api/admin/dashboard',
    USERS: API_BASE_URL + '/api/admin/users',
    PRODUCTS: API_BASE_URL + '/api/admin/products',
    ORDERS: API_BASE_URL + '/api/admin/orders',
    ANALYTICS: API_BASE_URL + '/api/admin/analytics'
  },
  
  // Review endpoints
  REVIEWS: {
    BY_PRODUCT: (productId) => `${API_BASE_URL}/api/reviews/product/${productId}`,
    CREATE: API_BASE_URL + '/api/reviews',
    UPDATE: (reviewId) => `${API_BASE_URL}/api/reviews/${reviewId}`,
    DELETE: (reviewId) => `${API_BASE_URL}/api/reviews/${reviewId}`
  },
  
  // Appointment endpoints
  APPOINTMENTS: {
    BASE: API_BASE_URL + '/api/appointments',
    CREATE: API_BASE_URL + '/api/appointments/create',
    USER_APPOINTMENTS: API_BASE_URL + '/api/appointments/user',
    AVAILABLE_SLOTS: API_BASE_URL + '/api/appointments/available-slots'
  },
  
  // Custom tailoring endpoints
  CUSTOM_TAILORING: {
    BASE: API_BASE_URL + '/api/custom-tailoring',
    CREATE: API_BASE_URL + '/api/custom-tailoring/create',
    USER_ORDERS: API_BASE_URL + '/api/custom-tailoring/user'
  },
  
  // Membership endpoints
  MEMBERSHIPS: {
    BASE: API_BASE_URL + '/api/memberships',
    SUBSCRIBE: API_BASE_URL + '/api/memberships/subscribe',
    CHECK_STATUS: API_BASE_URL + '/api/memberships/check-status'
  },
  
  // Upload endpoints
  UPLOAD: {
    IMAGE: API_BASE_URL + '/api/upload/image',
    PAYMENT_PROOF: API_BASE_URL + '/api/upload/payment-proof'
  }
};

export default API_ENDPOINTS;
