import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Fashion Hub',
    siteDescription: 'Where Tradition Meets Modern Fashion',
    contactEmail: 'support@fashionhub.com',
    contactPhone: '+91-XXXXX-XXXXX',
    address: 'Mumbai, Maharashtra, India',
    currency: 'INR',
    taxRate: 0,
    shippingCost: 0,
    freeShippingThreshold: 0,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false
  });
  
  const [emailSettings, setEmailSettings] = useState({
    emailHost: 'smtp.gmail.com',
    emailPort: 587,
    emailUser: '',
    emailPassword: '',
    emailFrom: '',
    emailFromName: 'Fashion Hub'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch settings from the backend
      // For now, we'll use default values
      setLoading(false);
    } catch (err) {
      console.error('Fetch settings error:', err);
      setError('Failed to fetch settings');
      setLoading(false);
    }
  };

  const handleSettingChange = (category, field, value) => {
    if (category === 'general') {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (category === 'email') {
      setEmailSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const saveSettings = async (category) => {
    try {
      setLoading(true);
      setError(null);

      const dataToSave = category === 'general' ? settings : emailSettings;
      
      // In a real app, you'd send this to the backend
      const response = await axios.post(
        `${API_BASE_URL}/admin/settings/${category}`,
        dataToSave,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess(`${category} settings saved successfully!`);
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setError(`Failed to save ${category} settings`);
    } finally {
      setLoading(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/email-test/test`,
        {
          testEmail: emailSettings.emailUser,
          testType: 'basic'
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess('Test email sent successfully!');
      }
    } catch (err) {
      console.error('Test email error:', err);
      setError('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      // Simulate cache clearing
      setTimeout(() => {
        setSuccess('Cache cleared successfully!');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to clear cache');
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      // Simulate data export
      setTimeout(() => {
        setSuccess('Data export initiated! You will receive an email when ready.');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to export data');
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Settings</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Site Description</label>
          <input
            type="text"
            value={settings.siteDescription}
            onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Contact Phone</label>
          <input
            type="text"
            value={settings.contactPhone}
            onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Address</label>
        <textarea
          value={settings.address}
          onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={settings.taxRate}
            onChange={(e) => handleSettingChange('general', 'taxRate', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Shipping Cost (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={settings.shippingCost}
            onChange={(e) => handleSettingChange('general', 'shippingCost', parseFloat(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label>Free Shipping Threshold (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={settings.freeShippingThreshold}
            onChange={(e) => handleSettingChange('general', 'freeShippingThreshold', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('general', 'emailNotifications', e.target.checked)}
            />
            Enable Email Notifications
          </label>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange('general', 'smsNotifications', e.target.checked)}
            />
            Enable SMS Notifications
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
          />
          Maintenance Mode (Site will be temporarily unavailable)
        </label>
      </div>

      <button 
        className="save-btn"
        onClick={() => saveSettings('general')}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save General Settings'}
      </button>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="settings-section">
      <h3>Email Settings</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>SMTP Host</label>
          <input
            type="text"
            value={emailSettings.emailHost}
            onChange={(e) => handleSettingChange('email', 'emailHost', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>SMTP Port</label>
          <input
            type="number"
            value={emailSettings.emailPort}
            onChange={(e) => handleSettingChange('email', 'emailPort', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email Username</label>
          <input
            type="email"
            value={emailSettings.emailUser}
            onChange={(e) => handleSettingChange('email', 'emailUser', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Email Password</label>
          <input
            type="password"
            value={emailSettings.emailPassword}
            onChange={(e) => handleSettingChange('email', 'emailPassword', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>From Email</label>
          <input
            type="email"
            value={emailSettings.emailFrom}
            onChange={(e) => handleSettingChange('email', 'emailFrom', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>From Name</label>
          <input
            type="text"
            value={emailSettings.emailFromName}
            onChange={(e) => handleSettingChange('email', 'emailFromName', e.target.value)}
          />
        </div>
      </div>

      <div className="button-group">
        <button 
          className="test-btn"
          onClick={testEmailSettings}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Email Settings'}
        </button>
        
        <button 
          className="save-btn"
          onClick={() => saveSettings('email')}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Email Settings'}
        </button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-section">
      <h3>System Settings</h3>
      
      <div className="system-actions">
        <div className="action-card">
          <h4>Cache Management</h4>
          <p>Clear application cache to improve performance</p>
          <button 
            className="action-btn"
            onClick={clearCache}
            disabled={loading}
          >
            {loading ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>

        <div className="action-card">
          <h4>Data Export</h4>
          <p>Export all system data for backup purposes</p>
          <button 
            className="action-btn"
            onClick={exportData}
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        <div className="action-card">
          <h4>System Information</h4>
          <div className="system-info">
            <div className="info-item">
              <label>Version:</label>
              <span>1.0.0</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div className="info-item">
              <label>Environment:</label>
              <span>Development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="settings-management fade-in">
        {/* Success/Error Messages */}
        {success && (
          <div className="success-message">
            {success}
            <button onClick={() => setSuccess(null)}>✕</button>
          </div>
        )}
        
        {error && (
          <div className="error">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Header */}
        <div className="settings-header">
          <h2>System Settings</h2>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ General
          </button>
          <button 
            className={`tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            📧 Email
          </button>
          <button 
            className={`tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            🖥️ System
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'system' && renderSystemSettings()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;