import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import UserDashboard from "./components/user/UserDashboard";
import Profile from "./components/user/Profile";
import Orders from "./components/user/Orders";
import Cart from "./components/user/Cart";
import Checkout from "./components/user/Checkout";
import OrderConfirmation from "./components/user/OrderConfirmation";
import CustomTailoring from "./components/user/CustomTailoring";
import Membership from "./components/user/Membership";
import AppointmentConfirmation from "./components/user/AppointmentConfirmation";
import SearchResults from "./components/SearchResults";
import ProductDetail from "./components/ProductDetail";
import AboutUs from "./components/AboutUs";
import CategoryPage from "./components/CategoryPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import Products from "./components/admin/Products";
import Users from "./components/admin/Users";
import AdminOrders from "./components/admin/Orders";
import Reviews from "./components/admin/Reviews";
import Settings from "./components/admin/Settings";
import Analytics from "./components/admin/AnalyticsEnhanced";
import PaymentVerification from "./components/admin/PaymentVerification";
import Appointments from "./components/admin/Appointments";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* User Dashboard Route - Entry Point (Public) */}
          <Route path="/" element={<UserDashboard />} />
          
          {/* Login Route */}
          <Route path="/login" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <Login />
            </div>
          } />
          
          {/* Registration Route */}
          <Route path="/register" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <Register />
            </div>
          } />
          
          {/* Forgot Password Route */}
          <Route path="/forgot-password" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <ForgotPassword />
            </div>
          } />
          
          {/* Alternative Dashboard Route */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          {/* User Profile Route */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* User Orders Route */}
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Orders />
            </ProtectedRoute>
          } />
          
          {/* User Cart Route */}
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Cart />
            </ProtectedRoute>
          } />
          
          {/* Custom Tailoring Route */}
          <Route path="/custom-tailoring" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <CustomTailoring />
            </ProtectedRoute>
          } />
          
          {/* Membership Route */}
          <Route path="/membership" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Membership />
            </ProtectedRoute>
          } />
          
          {/* Appointment Confirmation Route */}
          <Route path="/appointment-confirmation/:appointmentId" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <AppointmentConfirmation />
            </ProtectedRoute>
          } />
          
          {/* Search Results Route */}
          <Route path="/search" element={<SearchResults />} />
          
          {/* Product Detail Route */}
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* About Us Route */}
          <Route path="/about" element={<AboutUs />} />
          
          {/* Category Routes */}
          <Route path="/products/:category" element={<CategoryPage />} />
          <Route path="/products/:category/:subcategory" element={<CategoryPage />} />
          
          {/* Checkout Route */}
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Checkout />
            </ProtectedRoute>
          } />
          
          {/* Order Confirmation Route */}
          <Route path="/order-confirmation/:orderId" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <OrderConfirmation />
            </ProtectedRoute>
          } />
          
          {/* Admin Dashboard Route */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Products Management Route */}
          <Route path="/admin/products" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Products />
            </ProtectedRoute>
          } />
          
          {/* Admin Users Management Route */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />
          
          {/* Admin Orders Management Route */}
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          
          {/* Admin Reviews Management Route */}
          <Route path="/admin/reviews" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reviews />
            </ProtectedRoute>
          } />
          
          {/* Admin Settings Route */}
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Admin Analytics Route */}
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          
          {/* Admin Payment Verification Route */}
          <Route path="/admin/payments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PaymentVerification />
            </ProtectedRoute>
          } />
          
          {/* Admin Appointments Management Route */}
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Appointments />
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;