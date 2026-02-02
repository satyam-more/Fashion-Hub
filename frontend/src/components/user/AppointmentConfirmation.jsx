import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/user/AppointmentConfirmation.css';

const AppointmentConfirmation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    // Check if appointment data was passed via navigation state
    if (location.state?.appointmentData) {
      console.log('Using passed appointment data');
      setAppointment(location.state.appointmentData);
      setLoading(false);
      setError(null);
    } else if (appointmentId) {
      console.log('Fetching appointment data from API');
      fetchAppointmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, location.state]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchAppointmentDetails = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('Fetching appointment:', appointmentId);
      
      const response = await axios.get(
        `${API_ENDPOINTS.API}/custom/appointments/${appointmentId}`,
        { headers: getAuthHeaders() }
      );

      console.log('Appointment response:', response.data);

      if (response.data.success) {
        setAppointment(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Fetch appointment error:', err);
      
      // Retry up to 3 times with delay
      if (retryCount < 3) {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchAppointmentDetails(retryCount + 1);
        }, 1000);
      } else {
        setError(err.response?.data?.error || 'Failed to load appointment details');
        setLoading(false);
      }
    } finally {
      if (retryCount >= 3) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="confirmation-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !appointment) {
    return (
      <>
        <Navbar />
        <div className="confirmation-container">
          <div className="error-message">
            <h2>❌ Error</h2>
            <p>{error || 'Appointment not found'}</p>
            <button onClick={() => navigate('/custom-tailoring')} className="btn-primary">
              Book New Appointment
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="confirmation-container">
        <div className="confirmation-card">
          {/* Success Header */}
          <div className={`success-header ${location.state?.pendingVerification ? 'pending-header' : ''}`}>
            <div className="success-icon">{location.state?.pendingVerification ? '⏳' : '✓'}</div>
            <h1>{location.state?.pendingVerification ? 'Payment Verification Pending' : 'Appointment Confirmed!'}</h1>
            <p>
              {location.state?.pendingVerification 
                ? 'Your appointment request has been received. We will verify your payment and confirm shortly.'
                : 'Your custom tailoring consultation has been booked successfully'}
            </p>
          </div>

          {/* Appointment Details */}
          <div className="appointment-details">
            <div className="detail-section">
              <h2>📋 Appointment Information</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Appointment ID:</span>
                  <span className="value">#{appointment.appointment_id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date(appointment.appointment_date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Time Slot:</span>
                  <span className="value">{appointment.time_slot}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${appointment.status}`}>
                    {appointment.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="detail-section">
              <h2>👗 Services Selected</h2>
              <div className="services-list">
                {appointment.service_types.map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
                ))}
              </div>
              <p className="items-count">Total Items: {appointment.number_of_items}</p>
            </div>

            {/* Address Details */}
            <div className="detail-section">
              <h2>📍 Visit Address</h2>
              <div className="address-box">
                <p>{appointment.full_address}</p>
                {appointment.landmark && <p>Landmark: {appointment.landmark}</p>}
                <p>{appointment.city}, {appointment.pincode}</p>
                <p>Floor: {appointment.building_floor}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="detail-section">
              <h2>💰 Payment Information</h2>
              <div className="payment-box">
                <div className="payment-row">
                  <span>Consultation Fee:</span>
                  <span className="amount">₹{appointment.consultation_fee}</span>
                </div>
                {appointment.payment_method && (
                  <div className="payment-row">
                    <span>Payment Method:</span>
                    <span className="payment-method-badge">
                      {appointment.payment_method === 'upi' && '💳 UPI Payment'}
                      {appointment.payment_method === 'bank' && '🏦 Bank Transfer'}
                      {appointment.payment_method === 'cash' && '💵 Cash on Appointment'}
                    </span>
                  </div>
                )}
                <div className="payment-row">
                  <span>Payment Status:</span>
                  <span className={`payment-status ${appointment.payment_status}`}>
                    {appointment.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            {appointment.message && (
              <div className="detail-section">
                <h2>💬 Your Message</h2>
                <div className="message-box">
                  <p>{appointment.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="next-steps">
            <h2>📌 What Happens Next?</h2>
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Confirmation Email</h3>
                <p>Check your email for appointment confirmation and details</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Representative Visit</h3>
                <p>Our expert will visit you at the scheduled time for measurements</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Design Discussion</h3>
                <p>Discuss your requirements, fabric, and design preferences</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Order Placement</h3>
                <p>Finalize your order and we'll start crafting your custom garments</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link to="/orders" className="btn-primary">
              View My Appointments
            </Link>
            <Link to="/custom-tailoring" className="btn-secondary">
              Book Another Appointment
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <p>Need to make changes? Contact us:</p>
            <p>📞 Phone: +91 1234567890</p>
            <p>📧 Email: support@fashionhub.com</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AppointmentConfirmation;
