import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      let response;
      if (editingUser) {
        response = await axios.put(
          `${API_BASE_URL}/admin/users/${editingUser.id}`,
          formData,
          { headers: getAuthHeaders() }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/admin/users`,
          formData,
          { headers: getAuthHeaders() }
        );
      }

      if (response.data.success) {
        setSuccess(editingUser ? 'User updated successfully!' : 'User created successfully!');
        setShowModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/users/${userId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess('User deleted successfully!');
        fetchUsers();
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      setError('Failed to update user status');
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      return (
        (filters.search === '' || 
         user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
         user.email.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.role === '' || user.role === filters.role) &&
        (filters.status === '' || (user.status || 'active') === filters.status)
      );
    });
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  const filteredUsers = getFilteredUsers();

  return (
    <AdminLayout>
      <div className="users-management fade-in">
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
      <div className="users-header">
        <h2>Manage Users</h2>
        <button 
          className="add-user-btn"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <span className="icon">👤</span>
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Search Users</label>
            <input
              type="text"
              name="search"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Role</label>
            <select name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.role === 'admin').length}</h3>
          <p>Admins</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.role === 'user').length}</h3>
          <p>Customers</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => (u.status || 'active') === 'active').length}</h3>
          <p>Active Users</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No users found. {users.length === 0 ? 'No users registered yet.' : 'Try adjusting your filters.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="slide-in">
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{user.username}</h4>
                        <p>{user.email}</p>
                        <small>ID: #{user.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${user.status || 'active'}`}
                      onClick={() => toggleUserStatus(user.id, user.status || 'active')}
                    >
                      {(user.status || 'active') === 'active' ? '✓ Active' : '✕ Inactive'}
                    </button>
                  </td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    {user.last_login ? 
                      new Date(user.last_login).toLocaleDateString('en-IN') : 
                      'Never'
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(user)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                        disabled={user.role === 'admin'}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit User */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter username"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default Users;