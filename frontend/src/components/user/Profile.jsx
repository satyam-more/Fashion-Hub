import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import '../../styles/user/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    dateOfBirth: '',
    gender: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchMembership();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          if (data.user.profile) {
            setProfile({
              firstName: data.user.profile.first_name || '',
              lastName: data.user.profile.last_name || '',
              phone: data.user.profile.phone || '',
              address: data.user.profile.address || '',
              city: data.user.profile.city || '',
              state: data.user.profile.state || '',
              postalCode: data.user.profile.postal_code || '',
              country: data.user.profile.country || 'India',
              dateOfBirth: data.user.profile.date_of_birth || '',
              gender: data.user.profile.gender || ''
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsEditing(false);
          fetchProfile();
          alert('Profile updated successfully!');
        }
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const fetchMembership = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/memberships/my-membership', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Membership data:', result);
        if (result.success && result.data) {
          setMembership(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    }
  };

  const getMembershipIcon = (planType) => {
    switch(planType?.toLowerCase()) {
      case 'premium': return '👑';
      case 'free': return '⭐';
      default: return '⭐';
    }
  };

  const getMembershipColor = (planType) => {
    switch(planType?.toLowerCase()) {
      case 'premium': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 'free': return 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
      default: return 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
    }
  };

  const getMembershipBenefits = (planType) => {
    if (planType?.toLowerCase() === 'premium') {
      return [
        'Priority appointment booking',
        'Fast delivery: 10 days',
        'Express delivery: 2 days for ready-made',
        'Free alterations: 10 days',
        'Extended replacement: 7 days',
        'Dedicated support'
      ];
    }
    return [
      'Custom tailoring appointments',
      'Standard delivery: 15-20 days',
      'Free alterations: 3 days',
      'Ready-made replacement: 7 days',
      'Basic customer support'
    ];
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile & Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>
        
        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-large">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-details">
                <h2>{user?.username || 'User'}</h2>
                <p>{user?.email || 'user@example.com'}</p>
                <span className="user-badge">{user?.role || 'user'}</span>
                <p className="join-date">
                  Member since {new Date(user?.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>

            {/* Membership Plan Card */}
            <div className="membership-card">
              <div className="membership-header">
                <h3>Current Plan</h3>
              </div>
              {membership ? (
                <div className="membership-content">
                  <div 
                    className="membership-badge"
                    style={{ background: getMembershipColor(membership.plan_type) }}
                  >
                    <span className="membership-icon">{getMembershipIcon(membership.plan_type)}</span>
                    <span className="membership-tier">{membership.plan_type}</span>
                  </div>
                  <div className="membership-details">
                    <div className="membership-info">
                      <span className="info-label">💰 Price:</span>
                      <span className="info-value">
                        {membership.plan_type === 'premium' ? '₹1,000/year' : 'Free'}
                      </span>
                    </div>
                    {membership.plan_type === 'premium' && membership.end_date && (
                      <div className="membership-info">
                        <span className="info-label">📅 Valid Until:</span>
                        <span className="info-value">
                          {new Date(membership.end_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    <div className="membership-info">
                      <span className="info-label">📅 Member Since:</span>
                      <span className="info-value">
                        {new Date(membership.start_date || membership.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="membership-info">
                      <span className="info-label">📊 Status:</span>
                      <span className={`status-pill ${membership.status}`}>
                        {membership.status === 'active' ? '✓ Active' : membership.status}
                      </span>
                    </div>
                  </div>
                  <div className="membership-benefits">
                    <h4>Benefits:</h4>
                    <ul>
                      {getMembershipBenefits(membership.plan_type).map((benefit, index) => (
                        <li key={index}>✨ {benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {membership.plan_type === 'free' && (
                    <div className="upgrade-section">
                      <button 
                        className="upgrade-premium-btn"
                        onClick={() => window.location.href = '/membership'}
                      >
                        <span className="upgrade-icon">👑</span>
                        <span>Upgrade to Premium</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-membership">
                  <div className="no-membership-icon">💳</div>
                  <p>No active membership</p>
                  <button 
                    className="upgrade-btn"
                    onClick={() => window.location.href = '/membership'}
                  >
                    Explore Plans
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-form-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your full address"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your state"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={profile.postalCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter postal code"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={profile.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;