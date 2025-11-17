import React, { useState, useEffect } from 'react';
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
  const [appointmentId, setAppointmentId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [formData, setFormData] = useState({
    fullAddress: '',
    landmark: '',
    city: '',
    pincode: '',
    buildingFloor: 'Basement',
    serviceTypes: [],
    appointmentDate: '',
    timeSlot: '',
    numberOfItems: 1,
    message: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const serviceOptions = [
    'Kurti', 'Suit Pant', 'Salwar Suit',
    'Palazzo Suit', 'Sharara Suit', 'Gharara Suit',
    'Anarkali Dress', 'Custom Petticoat', 'Custom Petticoat With Fabric',
    'Pico', 'Fall Pico', 'Fall Pico - Premium',
    'Saree Ready to Wear', 'Saree Ready to Wear With Petticoat', 'Formal Trouser',
    'Simple Blouse', 'Lining Blouse', 'Padded Blouse',
    'Lehenga', 'Lehenga Choli', 'Blazer',
    'Two Piece Suit', 'Three Piece Suit', 'Western Dress',
    'Maxi Dress', 'Skirt', 'Crop-Top',
    'JumpSuit', 'Shirt', 'Other Garments'
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

  const deliveryOptions = [
    { value: '7-12', label: '7 - 12 Days - No Extra Charges' },
    { value: '5-7', label: '5 - 7 Days - ₹100 Extra' },
    { value: '3-5', label: '3 - 5 Days - ₹200 Extra' }
  ];

  useEffect(() => {
    fetchMembership();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceTypeChange = (service) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.fullAddress || !formData.city || !formData.pincode) {
      setError('Please fill in all required address fields');
      return;
    }

    if (formData.serviceTypes.length === 0) {
      setError('Please select at least one service type');
      return;
    }

    if (!formData.appointmentDate || !formData.timeSlot) {
      setError('Please select appointment date and time slot');
      return;
    }

    // Just show payment modal - don't create appointment yet
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    // Validate transaction ID for online payments
    if ((selectedPaymentMethod === 'upi' || selectedPaymentMethod === 'bank') && !transactionId) {
      setError('Please enter transaction ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create appointment with payment details
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
        setAppointmentId(newAppointmentId);
        
        // Fetch the complete appointment data
        const appointmentResponse = await axios.get(
          `${API_BASE_URL}/custom/appointments/${newAppointmentId}`,
          { headers: getAuthHeaders() }
        );

        setShowPaymentModal(false);
        setLoading(false);

        // Navigate based on payment method
        if (selectedPaymentMethod === 'cash') {
          // COD - go to confirmation page
          navigate(`/appointment-confirmation/${newAppointmentId}`, {
            state: {
              fromBooking: true,
              paymentMethod: 'cash',
              appointmentData: appointmentResponse.data.data
            }
          });
        } else {
          // Online payment - go to pending verification page
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
      <Navbar />
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

        <form onSubmit={handleSubmit} className="booking-form">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Address Section */}
          <div className="form-section">
            <h2>📍 Address Details</h2>
            
            <div className="form-group full-width">
              <label>Full Address *</label>
              <textarea
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Land Mark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Near landmark"
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pin Code *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pin Code"
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <div className="form-group">
                <label>Building Floor *</label>
                <select
                  name="buildingFloor"
                  value={formData.buildingFloor}
                  onChange={handleInputChange}
                  required
                >
                  {buildingFloors.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Service Type Section */}
          <div className="form-section">
            <h2>👗 Service Type *</h2>
            <div className="service-grid">
              {serviceOptions.map(service => (
                <label key={service} className="service-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.serviceTypes.includes(service)}
                    onChange={() => handleServiceTypeChange(service)}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
            <p className="service-note">
              Selected: {formData.serviceTypes.length} item(s)
            </p>
          </div>

          {/* Appointment Section */}
          <div className="form-section">
            <h2>📅 Select An Appointment *</h2>
            <div className="form-group">
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Time Slot Section */}
          <div className="form-section">
            <h2>⏰ Select Appointment Time *</h2>
            <div className="time-slot-grid">
              {timeSlots.map(slot => (
                <label key={slot} className="time-slot-radio">
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot}
                    checked={formData.timeSlot === slot}
                    onChange={handleInputChange}
                    required
                  />
                  <span>{slot}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Number of Items */}
          <div className="form-section">
            <h2>🔢 How many items do you have to stitch? *</h2>
            <div className="form-group">
              <select
                name="numberOfItems"
                value={formData.numberOfItems}
                onChange={handleInputChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>
                    {num} Garment{num > 1 ? 's' : ''} + Delivery Charges (Min. Order = ₹199)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message Section */}
          <div className="form-section">
            <h2>💬 Message (Optional)</h2>
            <div className="form-group full-width">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Any special instructions or requirements..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="book-btn" disabled={loading}>
              {loading ? 'Booking...' : 'BOOK NOW - ₹250'}
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
              <p className="appointment-id">Appointment ID: #{appointmentId}</p>
              
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
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=fashionhub@upi&pn=Fashion%20Hub&am=250&cu=INR&tn=Appointment%20${appointmentId}`}
                          alt="UPI QR Code"
                          className="qr-code"
                        />
                        <p className="qr-instruction">Scan with any UPI app</p>
                      </div>
                    )}
                    <div className="upi-details">
                      <p><strong>UPI ID:</strong> fashionhub@upi</p>
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

              {/* Transaction ID for online payments */}
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
