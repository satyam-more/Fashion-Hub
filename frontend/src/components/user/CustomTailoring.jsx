import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../Footer';
import '../../styles/user/CustomTailoring.css';

const CustomTailoring = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [membership, setMembership] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [hideNavbar, setHideNavbar] = useState(false);
  const lastScrollY = useRef(0);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    fullAddress: '',
    landmark: '',
    city: '',
    pincode: '',
    buildingFloor: 'Ground Floor',
    serviceTypes: [],
    appointmentDate: '',
    timeSlot: '',
    numberOfItems: 1,
    message: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const serviceOptions = [
    'Kurti', 'Salwar Suit', 'Palazzo Suit',
    'Anarkali Dress', 'Saree Blouse', 'Lehenga Choli',
    'Western Dress', 'Formal Trouser', 'Blazer',
    'Maxi Dress', 'Skirt', 'JumpSuit'
  ];

  const timeSlots = [
    '11:00 AM To 1:00 PM',
    '1:00 PM To 3:00 PM',
    '3:00 PM To 5:00 PM',
    '5:00 PM To 7:00 PM',
    'Full-Day available'
  ];

  const buildingFloors = [
    'Basement', 'Ground Floor', '1st Floor', '2nd Floor',
    '3rd Floor', '4th Floor', '5th Floor', 'Above 5th Floor'
  ];

  useEffect(() => {
    fetchMembership();
    // Pre-fill user data if available
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setFormData(prev => ({
          ...prev,
          fullName: user.username || '',
          email: user.email || ''
        }));
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
  }, []);

  // Hide navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        setHideNavbar(true);
      } else {
        setHideNavbar(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchMembership = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/memberships/my-membership`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setMembership(response.data.data);
      }
    } catch (err) {
      console.error('Fetch membership error:', err);
    }
  };

  // Validation functions
  const validateFullName = (name) => {
    if (!name || name.trim().length < 3) {
      return 'Full name must be at least 3 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Full name should only contain letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) {
      return 'Phone number is required';
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid 10-digit Indian mobile number';
    }
    return '';
  };

  const validatePincode = (pincode) => {
    if (!pincode) {
      return 'Pincode is required';
    }
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      return 'Please enter a valid 6-digit pincode';
    }
    return '';
  };

  const validateCity = (city) => {
    if (!city || city.trim().length < 2) {
      return 'City name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(city)) {
      return 'City name should only contain letters';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address || address.trim().length < 10) {
      return 'Please enter a complete address (at least 10 characters)';
    }
    return '';
  };

  const validateAppointmentDate = (date) => {
    if (!date) {
      return 'Please select an appointment date';
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return 'Appointment date cannot be in the past';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for pincode - only allow numbers and max 6 digits
    if (name === 'pincode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    }
    // Special handling for phone - only allow numbers and max 10 digits
    else if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'pincode':
        error = validatePincode(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'fullAddress':
        error = validateAddress(value);
        break;
      case 'appointmentDate':
        error = validateAppointmentDate(value);
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleServiceTypeChange = (service) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
    
    if (validationErrors.serviceTypes) {
      setValidationErrors(prev => ({ ...prev, serviceTypes: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    errors.fullName = validateFullName(formData.fullName);
    errors.email = validateEmail(formData.email);
    errors.phone = validatePhone(formData.phone);
    errors.fullAddress = validateAddress(formData.fullAddress);
    errors.city = validateCity(formData.city);
    errors.pincode = validatePincode(formData.pincode);
    errors.appointmentDate = validateAppointmentDate(formData.appointmentDate);

    if (formData.serviceTypes.length === 0) {
      errors.serviceTypes = 'Please select at least one service type';
    }

    if (!formData.timeSlot) {
      errors.timeSlot = 'Please select a time slot';
    }

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== '')
    );

    setValidationErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      // Scroll to first error
      const firstError = document.querySelector('.validation-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if ((selectedPaymentMethod === 'upi' || selectedPaymentMethod === 'bank') && !transactionId) {
      setError('Please enter transaction ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/custom/appointments`,
        {
          ...formData,
          paymentMethod: selectedPaymentMethod,
          transactionId: transactionId || null
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const newAppointmentId = response.data.data.appointment_id;
        
        const appointmentResponse = await axios.get(
          `${API_BASE_URL}/custom/appointments/${newAppointmentId}`,
          { headers: getAuthHeaders() }
        );

        setShowPaymentModal(false);
        setLoading(false);

        if (selectedPaymentMethod === 'cash') {
          navigate(`/appointment-confirmation/${newAppointmentId}`, {
            state: {
              fromBooking: true,
              paymentMethod: 'cash',
              appointmentData: appointmentResponse.data.data
            }
          });
        } else {
          navigate(`/appointment-confirmation/${newAppointmentId}`, {
            state: {
              fromBooking: true,
              paymentMethod: selectedPaymentMethod,
              pendingVerification: true,
              appointmentData: appointmentResponse.data.data
            }
          });
        }
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.error || 'Failed to book appointment');
      setLoading(false);
    }
  };

  const isPremiumMember = membership?.plan_type === 'premium' && membership?.status === 'active';

  return (
    <>
      <div className={`navbar-wrapper ${hideNavbar ? 'navbar-hidden' : ''}`}>
        <Navbar />
      </div>
      <div className="custom-tailoring-container">
        <div className="custom-tailoring-header">
          <h1>✂️ Custom Tailoring Service</h1>
          <p>Book your personalized tailoring consultation</p>
          
          {isPremiumMember && (
            <div className="premium-badge">
              ⭐ Premium Member - Enjoy exclusive benefits!
            </div>
          )}
        </div>

        <div className="benefits-section">
          <div className="benefit-card">
            <span className="benefit-icon">📅</span>
            <h3>Consultation Fee</h3>
            <p>₹250</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">⏱️</span>
            <h3>Appointment Duration</h3>
            <p>30 mins (up to 2 items)</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🚚</span>
            <h3>Delivery Time</h3>
            <p>{isPremiumMember ? '10 days' : '15 days'}</p>
          </div>
        </div>

        {!isPremiumMember && (
          <div className="upgrade-banner">
            <h3>🌟 Upgrade to Premium Membership</h3>
            <p>Get faster delivery, free alterations for 10 days, and more benefits for just ₹1000/year</p>
            <button onClick={() => navigate('/membership')} className="upgrade-btn">
              Upgrade Now
            </button>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Notebook Style Form */}
        <form onSubmit={handleSubmit} className="notebook-form">
          <div className="notebook-pages">
            {/* Left Page - Personal & Address Details */}
            <div className="notebook-page left-page">
              <div className="page-header">
                <h2>📋 Personal & Address Details</h2>
              </div>
              
              {/* Personal Information */}
              <div className="form-section">
                <h3>👤 Personal Information</h3>
                
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                    className={validationErrors.fullName ? 'error' : ''}
                  />
                  {validationErrors.fullName && (
                    <span className="validation-error">{validationErrors.fullName}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="your@email.com"
                      className={validationErrors.email ? 'error' : ''}
                    />
                    {validationErrors.email && (
                      <span className="validation-error">{validationErrors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      className={validationErrors.phone ? 'error' : ''}
                    />
                    {validationErrors.phone && (
                      <span className="validation-error">{validationErrors.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="form-section">
                <h3>📍 Address Details</h3>
                
                <div className="form-group">
                  <label>Full Address *</label>
                  <textarea
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="House/Flat No., Street, Area, Colony..."
                    rows="2"
                    className={validationErrors.fullAddress ? 'error' : ''}
                  />
                  {validationErrors.fullAddress && (
                    <span className="validation-error">{validationErrors.fullAddress}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="Near landmark (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="City name"
                      className={validationErrors.city ? 'error' : ''}
                    />
                    {validationErrors.city && (
                      <span className="validation-error">{validationErrors.city}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode * (6 digits)</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      className={validationErrors.pincode ? 'error' : ''}
                    />
                    {validationErrors.pincode && (
                      <span className="validation-error">{validationErrors.pincode}</span>
                    )}
                    <span className="input-hint">{formData.pincode.length}/6 digits</span>
                  </div>

                  <div className="form-group">
                    <label>Building Floor *</label>
                    <select
                      name="buildingFloor"
                      value={formData.buildingFloor}
                      onChange={handleInputChange}
                    >
                      {buildingFloors.map(floor => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Page - Service & Appointment Details */}
            <div className="notebook-page right-page">
              <div className="page-header">
                <h2>📅 Service & Appointment</h2>
              </div>

              {/* Service Type Section */}
              <div className="form-section">
                <h3>👗 Select Service Type *</h3>
                <div className="service-grid">
                  {serviceOptions.map(service => (
                    <label key={service} className={`service-checkbox ${formData.serviceTypes.includes(service) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.serviceTypes.includes(service)}
                        onChange={() => handleServiceTypeChange(service)}
                      />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.serviceTypes && (
                  <span className="validation-error">{validationErrors.serviceTypes}</span>
                )}
                <p className="service-note">
                  ✓ Selected: {formData.serviceTypes.length} item(s)
                </p>
              </div>

              {/* Appointment Section */}
              <div className="form-section">
                <h3>📆 Select Appointment Date *</h3>
                <div className="form-group">
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    min={new Date().toISOString().split('T')[0]}
                    className={validationErrors.appointmentDate ? 'error' : ''}
                  />
                  {validationErrors.appointmentDate && (
                    <span className="validation-error">{validationErrors.appointmentDate}</span>
                  )}
                </div>
              </div>

              {/* Time Slot Section */}
              <div className="form-section">
                <h3>⏰ Select Time Slot *</h3>
                <div className="time-slot-grid">
                  {timeSlots.map(slot => (
                    <label key={slot} className={`time-slot-radio ${formData.timeSlot === slot ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="timeSlot"
                        value={slot}
                        checked={formData.timeSlot === slot}
                        onChange={handleInputChange}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.timeSlot && (
                  <span className="validation-error">{validationErrors.timeSlot}</span>
                )}
              </div>

              {/* Number of Items */}
              <div className="form-section">
                <h3>🔢 Number of Items *</h3>
                <div className="form-group">
                  <select
                    name="numberOfItems"
                    value={formData.numberOfItems}
                    onChange={handleInputChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num} Garment{num > 1 ? 's' : ''} (Min. Order = ₹199)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message Section */}
              <div className="form-section">
                <h3>💬 Special Instructions (Optional)</h3>
                <div className="form-group">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Any special requirements or instructions..."
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="book-btn" disabled={loading}>
              {loading ? 'Booking...' : '📝 BOOK NOW - ₹250'}
            </button>
          </div>
        </form>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
              
              <h2>💳 Complete Consultation Payment</h2>
              <p className="payment-amount">Consultation Fee: ₹250</p>
              
              <div className="payment-options">
                <h3>Choose Payment Method:</h3>
                
                <label className={`payment-method ${selectedPaymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={selectedPaymentMethod === 'upi'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <div className="payment-content">
                    <h4>💳 UPI Payment</h4>
                    <p>Scan QR code or use UPI ID</p>
                    {selectedPaymentMethod === 'upi' && (
                      <div className="qr-code-container">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=9021679551@nyes&pn=Fashion%20Hub&am=250&cu=INR&tn=Consultation`)}`}
                          alt="UPI QR Code"
                          className="qr-code"
                        />
                        <p className="qr-instruction">Scan with any UPI app</p>
                      </div>
                    )}
                    <div className="upi-details">
                      <p><strong>UPI ID:</strong> 9021679551@nyes</p>
                      <p><strong>Amount:</strong> ₹250</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-method ${selectedPaymentMethod === 'bank' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={selectedPaymentMethod === 'bank'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <div className="payment-content">
                    <h4>🏦 Bank Transfer</h4>
                    <p>Transfer to our account</p>
                    <div className="bank-details">
                      <p><strong>Account Name:</strong> Fashion Hub</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>IFSC Code:</strong> SBIN0001234</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-method ${selectedPaymentMethod === 'cash' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={selectedPaymentMethod === 'cash'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <div className="payment-content">
                    <h4>💵 Cash on Appointment</h4>
                    <p>Pay ₹250 when our representative visits</p>
                  </div>
                </label>
              </div>
              
              {error && <div className="payment-error">{error}</div>}

              {(selectedPaymentMethod === 'upi' || selectedPaymentMethod === 'bank') && (
                <div className="transaction-id-section">
                  <label htmlFor="transactionId">
                    <strong>Enter Transaction ID *</strong>
                  </label>
                  <input
                    type="text"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your transaction/reference ID"
                    className="transaction-input"
                  />
                  <p className="transaction-note">
                    After making payment, enter the transaction ID here for verification
                  </p>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="confirm-payment-btn"
                  onClick={handlePaymentComplete}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPaymentMethod('');
                    setTransactionId('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              {selectedPaymentMethod === 'cash' && (
                <p className="payment-note">
                  Note: You can pay the consultation fee (₹250) when our representative visits
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CustomTailoring;