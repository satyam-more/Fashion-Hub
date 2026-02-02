import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/Appointments.css';
import '../../styles/admin/ExportButton.css';
import { exportAppointmentsReport } from '../../utils/pdfExport';
import { API_ENDPOINTS } from '../../config/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('Fetching appointments from:', `${API_ENDPOINTS.API}/custom/admin/appointments`);
      const response = await axios.get(`${API_ENDPOINTS.API}/custom/admin/appointments`, {
        headers: getAuthHeaders()
      });
      console.log('Appointments response:', response.data);
      if (response.data.success) {
        setAppointments(response.data.data);
        console.log('Appointments loaded:', response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to load appointments: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      const response = await axios.patch(
        `${API_ENDPOINTS.API}/custom/appointments/${appointmentId}/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        alert('Appointment approved and confirmation email sent!');
        fetchAppointments();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;
    
    try {
      console.log('Rejecting appointment:', appointmentId);
      const response = await axios.patch(
        `${API_ENDPOINTS.API}/custom/appointments/${appointmentId}/cancel`,
        {},
        { headers: getAuthHeaders() }
      );
      console.log('Reject response:', response.data);
      if (response.data.success) {
        alert('Appointment rejected and email sent to customer');
        fetchAppointments();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to reject appointment: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      confirmed: { class: 'status-confirmed', text: 'Confirmed' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const getPaymentBadge = (method) => {
    const badges = {
      upi: { icon: '💳', text: 'UPI' },
      bank: { icon: '🏦', text: 'Bank Transfer' },
      cash: { icon: '💵', text: 'Cash on Visit' }
    };
    return badges[method] || { icon: '💰', text: method };
  };

  return (
    <AdminLayout>
      <div className="appointments-container">
        <div className="appointments-header">
          <div>
            <h1>✂️ Custom Tailoring Appointments</h1>
            <p>Manage and verify customer appointments</p>
          </div>
          <button 
            className="export-pdf-btn"
            onClick={() => {
              const stats = {
                total: appointments.length,
                pending: appointments.filter(a => a.status === 'pending').length,
                confirmed: appointments.filter(a => a.status === 'confirmed').length,
                completed: appointments.filter(a => a.status === 'completed').length
              };
              exportAppointmentsReport(filteredAppointments, stats);
            }}
          >
            <span className="icon">📄</span>
            Export PDF
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({appointments.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({appointments.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={filter === 'confirmed' ? 'active' : ''}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({appointments.filter(a => a.status === 'completed').length})
          </button>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="loading">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="no-data">No appointments found</div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map(appointment => {
              const statusBadge = getStatusBadge(appointment.status);
              const paymentBadge = getPaymentBadge(appointment.payment_method);
              
              return (
                <div key={appointment.appointment_id} className="appointment-card">
                  <div className="card-header">
                    <div>
                      <h3>#{appointment.appointment_id}</h3>
                      <p className="customer-name">{appointment.customer_name}</p>
                    </div>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">📅 Date:</span>
                      <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">⏰ Time:</span>
                      <span>{appointment.time_slot}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📍 City:</span>
                      <span>{appointment.city}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">💰 Payment:</span>
                      <span>{paymentBadge.icon} {paymentBadge.text}</span>
                    </div>
                    {appointment.transaction_id && (
                      <div className="info-row">
                        <span className="label">🔖 Transaction ID:</span>
                        <span className="transaction-id">{appointment.transaction_id}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="label">👗 Items:</span>
                      <span>{appointment.number_of_items}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn-view"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModal(true);
                      }}
                    >
                      View Details
                    </button>
                    {appointment.status === 'pending' && (
                      <>
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(appointment.appointment_id)}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(appointment.appointment_id)}
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedAppointment && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              
              <h2>Appointment Details</h2>
              
              <div className="modal-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedAppointment.customer_name}</p>
                <p><strong>Email:</strong> {selectedAppointment.customer_email}</p>
              </div>

              <div className="modal-section">
                <h3>Appointment Details</h3>
                <p><strong>ID:</strong> #{selectedAppointment.appointment_id}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-IN', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}</p>
                <p><strong>Time:</strong> {selectedAppointment.time_slot}</p>
                <p><strong>Status:</strong> {selectedAppointment.status}</p>
              </div>

              <div className="modal-section">
                <h3>Services Requested</h3>
                <div className="services-tags">
                  {selectedAppointment.service_types.map((service, idx) => (
                    <span key={idx} className="service-tag">{service}</span>
                  ))}
                </div>
                <p><strong>Number of Items:</strong> {selectedAppointment.number_of_items}</p>
              </div>

              <div className="modal-section">
                <h3>Visit Address</h3>
                <p>{selectedAppointment.full_address}</p>
                {selectedAppointment.landmark && <p><strong>Landmark:</strong> {selectedAppointment.landmark}</p>}
                <p>{selectedAppointment.city}, {selectedAppointment.pincode}</p>
                <p><strong>Floor:</strong> {selectedAppointment.building_floor}</p>
              </div>

              <div className="modal-section">
                <h3>Payment Information</h3>
                <p><strong>Method:</strong> {getPaymentBadge(selectedAppointment.payment_method).text}</p>
                <p><strong>Consultation Fee:</strong> ₹{selectedAppointment.consultation_fee}</p>
                {selectedAppointment.transaction_id && (
                  <p><strong>Transaction ID:</strong> {selectedAppointment.transaction_id}</p>
                )}
                <p><strong>Payment Status:</strong> {selectedAppointment.payment_status}</p>
              </div>

              {selectedAppointment.message && (
                <div className="modal-section">
                  <h3>Customer Message</h3>
                  <p>{selectedAppointment.message}</p>
                </div>
              )}

              {selectedAppointment.status === 'pending' && (
                <div className="modal-actions">
                  <button 
                    className="btn-approve-large"
                    onClick={() => handleApprove(selectedAppointment.appointment_id)}
                  >
                    ✓ Approve & Send Confirmation
                  </button>
                  <button 
                    className="btn-reject-large"
                    onClick={() => handleReject(selectedAppointment.appointment_id)}
                  >
                    ✗ Reject Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Appointments;
