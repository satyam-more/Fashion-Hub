import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import '../../styles/admin/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    search: '',
    type: ''
  });

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: 0,
    quantity: '',
    category: '',
    subcategory: '',
    type: 'upperwear',
    fabric: '',
    colour: '',
    sizes: [],
    tags: [],
    images: []
  });

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const typeOptions = ['upperwear', 'bottomwear', 'accessories'];
  const fabricOptions = ['Cotton', 'Silk', 'Polyester', 'Cotton Blend', 'Linen', 'Wool', 'Georgette', 'Chiffon', 'Denim'];

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // API headers with auth
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    }
  }, [formData.category]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products, categories in parallel
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/products/categories`)
      ]);

      if (productsRes.data.success) {
        setProducts(productsRes.data.data || []);
      }
      
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data || []);
      }

    } catch (err) {
      console.error('Fetch data error:', err);
      setError('Failed to fetch data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryName) => {
    try {
      const category = categories.find(cat => cat.name === categoryName);
      if (!category) return;

      const response = await axios.get(`${API_BASE_URL}/products/subcategories/${category.id}`);
      if (response.data.success) {
        setSubcategories(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch subcategories error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'sizes') {
        setFormData(prev => ({
          ...prev,
          sizes: checked 
            ? [...prev.sizes, value]
            : prev.sizes.filter(size => size !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagsChange = (e) => {
    // Split by comma, then trim each tag and filter out empty ones
    const tags = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please select only image files (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file sizes (5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Each image must be smaller than 5MB');
      return;
    }

    // Limit to 10 files
    if (files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setSelectedFiles(files);
    setError(null);
  };

  // Upload images to server
  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/upload/products`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        const imageUrls = response.data.data.images.map(img => 
          `${API_BASE_URL.replace('/api', '')}${img.url}`
        );
        setUploadedImages(imageUrls);
        return imageUrls;
      }
      return [];
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload images. Please try again.');
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  // Remove uploaded image
  const removeUploadedImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    // Also update form data
    setFormData(prev => ({
      ...prev,
      images: newImages
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
      name: '',
      price: '',
      discount: 0,
      quantity: '',
      category: '',
      subcategory: '',
      type: 'upperwear',
      fabric: '',
      colour: '',
      sizes: [],
      tags: [],
      images: []
    });
    setEditingProduct(null);
    setSubcategories([]);
    setSelectedFiles([]);
    setUploadedImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please login as admin to manage products');
        return;
      }

      // Upload new images if any are selected
      let finalImages = [...uploadedImages];
      if (selectedFiles.length > 0) {
        const newImageUrls = await uploadImages();
        finalImages = [...finalImages, ...newImageUrls];
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        quantity: parseInt(formData.quantity),
        images: finalImages
      };

      let response;
      if (editingProduct) {
        // Update existing product
        response = await axios.put(
          `${API_BASE_URL}/products/${editingProduct.id}`,
          productData,
          { headers: getAuthHeaders() }
        );
      } else {
        // Create new product
        response = await axios.post(
          `${API_BASE_URL}/products`,
          productData,
          { headers: getAuthHeaders() }
        );
      }

      if (response.data.success) {
        setSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowModal(false);
        resetForm();
        fetchData(); // Refresh the products list
      }

    } catch (err) {
      console.error('Submit error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save product. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discount: product.discount || 0,
      quantity: product.quantity.toString(),
      category: product.category,
      subcategory: product.subcategory,
      type: product.type || 'upperwear',
      fabric: product.material || '',
      colour: product.color || '',
      sizes: product.sizes || [],
      tags: product.tags || [],
      images: product.images || []
    });
    
    // Set existing images as uploaded images
    setUploadedImages(product.images || []);
    setSelectedFiles([]);
    
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please login as admin to delete products');
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/products/${productId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess('Product deleted successfully!');
        fetchData(); // Refresh the products list
      }

    } catch (err) {
      console.error('Delete error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      return (
        (filters.category === '' || product.category === filters.category) &&
        (filters.subcategory === '' || product.subcategory === filters.subcategory) &&
        (filters.type === '' || product.type === filters.type) &&
        (filters.search === '' || 
         product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
         (product.material && product.material.toLowerCase().includes(filters.search.toLowerCase())))
      );
    });
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount / 100);
  };

  const getFilteredSubcategories = () => {
    if (!filters.category) return [];
    const category = categories.find(cat => cat.name === filters.category);
    if (!category) return [];
    return subcategories.filter(sub => sub.category_id === category.id);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  const filteredProducts = getFilteredProducts();

  return (
    <AdminLayout>
      <div className="products-management fade-in">
      {/* Success/Error Messages */}
      {success && (
        <div className="success-message">
          {success}
          <button 
            onClick={() => setSuccess(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}
      
      {error && (
        <div className="error">
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="products-header">
        <h2>Manage Products</h2>
        <button 
          className="add-product-btn"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <span className="icon">➕</span>
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Search Products</label>
            <input
              type="text"
              name="search"
              placeholder="Search by name or material..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              {typeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="products-stats">
        <div className="stat-card">
          <h3>{products.length}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>{products.filter(p => p.status === 'active').length}</h3>
          <p>Active Products</p>
        </div>
        <div className="stat-card">
          <h3>{products.filter(p => p.quantity < 10).length}</h3>
          <p>Low Stock</p>
        </div>
        <div className="stat-card">
          <h3>₹{products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}</h3>
          <p>Total Inventory Value</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category & Type</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Material</th>
              <th>Images</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No products found. {products.length === 0 ? 'Add your first product!' : 'Try adjusting your filters.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="slide-in">
                  <td>
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p>{product.description?.substring(0, 50)}...</p>
                      <small>ID: #{product.id}</small>
                    </div>
                  </td>
                  <td>
                    <div className="category-info">
                      <span className="category">{product.category}</span>
                      <span className="subcategory">{product.subcategory}</span>
                      <small style={{ marginTop: '0.25rem', display: 'block' }}>
                        {product.type}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="price-info">
                      <div className="original-price">₹{product.price?.toLocaleString()}</div>
                      {product.discount > 0 && (
                        <>
                          <div className="discount">{product.discount}% off</div>
                          <div className="final-price">
                            ₹{calculateDiscountedPrice(product.price, product.discount).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="stock-info">
                      <span className={`stock-count ${product.quantity < 10 ? 'low-stock' : ''}`}>
                        {product.quantity} pcs
                      </span>
                      {product.quantity < 10 && (
                        <div className="low-stock-warning">Low Stock!</div>
                      )}
                    </div>
                  </td>
                  <td>{product.material || 'N/A'}</td>
                  <td>
                    <div className="product-images">
                      {product.images && product.images.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {product.images.slice(0, 2).map((image, index) => (
                            <div 
                              key={index}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '2px solid var(--maratha-gold)'
                              }}
                              title={`Image ${index + 1}`}
                            >
                              <img 
                                src={image} 
                                alt={`Product ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:var(--maratha-gold);display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;">📷</div>';
                                }}
                              />
                            </div>
                          ))}
                          {product.images.length > 2 && (
                            <div 
                              style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--imperial-stone)',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.6rem',
                                fontWeight: '600'
                              }}
                              title={`${product.images.length - 2} more images`}
                            >
                              +{product.images.length - 2}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--imperial-stone)', fontSize: '0.8rem' }}>No images</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-toggle ${product.status}`}>
                      {product.status === 'active' ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(product)}
                        title="Edit Product"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(product.id)}
                        title="Delete Product"
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

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
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

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subcategory *</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.category}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Fabric/Material</label>
                  <select
                    name="fabric"
                    value={formData.fabric}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Fabric</option>
                    {fabricOptions.map(fabric => (
                      <option key={fabric} value={fabric}>{fabric}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="colour"
                    value={formData.colour}
                    onChange={handleInputChange}
                    placeholder="e.g., Royal Blue, Red, etc."
                  />
                </div>
                
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    placeholder="e.g., designer, formal, premium"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Available Sizes</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {sizeOptions.map(size => (
                    <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        name="sizes"
                        value={size}
                        checked={formData.sizes.includes(size)}
                        onChange={handleInputChange}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Product Images</label>
                
                {/* File Upload Input */}
                <div className="image-upload-section">
                  <input
                    type="file"
                    id="imageUpload"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="imageUpload" 
                    className="upload-btn"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      background: 'var(--gradient-maratha)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginBottom: '1rem'
                    }}
                  >
                    📷 Select Images
                  </label>
                  
                  <small style={{ color: 'var(--imperial-stone)', fontSize: '0.85rem', display: 'block', marginBottom: '1rem' }}>
                    Select up to 10 images (JPEG, PNG, GIF, WebP). Max 5MB each.
                  </small>

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="selected-files" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--maratha-saffron)' }}>
                        Selected Files ({selectedFiles.length}):
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                        {selectedFiles.map((file, index) => (
                          <div 
                            key={index}
                            style={{
                              position: 'relative',
                              border: '2px solid var(--maratha-gold)',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              background: 'var(--imperial-ivory)'
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>
                              {file.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--imperial-stone)' }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'var(--vijayanagara-vermillion)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '0.7rem'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing/Uploaded Images */}
                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--maratha-royal-green)' }}>
                        Current Images ({uploadedImages.length}):
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                        {uploadedImages.map((imageUrl, index) => (
                          <div 
                            key={index}
                            style={{
                              position: 'relative',
                              border: '2px solid var(--maratha-royal-green)',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              background: 'var(--imperial-ivory)'
                            }}
                          >
                            <img 
                              src={imageUrl} 
                              alt={`Product ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                marginBottom: '0.25rem'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div style={{ display: 'none', fontSize: '0.75rem', textAlign: 'center', color: 'var(--imperial-stone)' }}>
                              Image not found
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUploadedImage(index)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'var(--vijayanagara-vermillion)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '0.7rem'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div style={{ 
                      padding: '1rem', 
                      background: 'rgba(255, 140, 0, 0.1)', 
                      border: '2px solid var(--maratha-saffron)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      color: 'var(--maratha-saffron)',
                      fontWeight: '600'
                    }}>
                      Uploading images... Please wait.
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
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
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default Products;