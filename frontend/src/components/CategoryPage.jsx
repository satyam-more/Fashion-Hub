import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/components/CategoryPage.css';

const CategoryPage = () => {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    selectedSubcategories: [],
    selectedSizes: [],
    selectedColors: [],
    inStock: false
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState('newest');
  
  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 10000 }
  });

  useEffect(() => {
    // Scroll to top when component mounts or category changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCategoryData();
    fetchProducts();
  }, [category, subcategory]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, sortBy]);

  const fetchCategoryData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('http://localhost:5000/api/products/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          setCategories(categoriesData.data);
          
          // Find current category and fetch its subcategories
          const currentCategory = categoriesData.data.find(cat => 
            cat.name.toLowerCase() === category?.toLowerCase()
          );
          
          if (currentCategory) {
            const subcategoriesResponse = await fetch(
              `http://localhost:5000/api/products/subcategories/${currentCategory.id}`
            );
            if (subcategoriesResponse.ok) {
              const subcategoriesData = await subcategoriesResponse.json();
              if (subcategoriesData.success) {
                setSubcategories(subcategoriesData.data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/products';
      const params = new URLSearchParams();
      
      // Only add category filter if it's not "all"
      if (category && category.toLowerCase() !== 'all') {
        // Send category as lowercase to match database
        params.append('category', category.toLowerCase());
      }
      if (subcategory) {
        // Convert hyphenated subcategory to proper format (e.g., "formal-wear" -> "Formal Wear")
        const formattedSubcategory = subcategory
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        params.append('subcategory', formattedSubcategory);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
          extractFilterOptions(data.data);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (productsData) => {
    const sizes = new Set();
    const colors = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    productsData.forEach(product => {
      // Extract sizes
      if (product.sizes && Array.isArray(product.sizes)) {
        product.sizes.forEach(size => sizes.add(size));
      }
      
      // Extract colors
      if (product.color) {
        colors.add(product.color);
      }
      
      // Extract price range
      const price = parseFloat(product.price);
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    });

    setFilterOptions({
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      priceRange: { 
        min: minPrice === Infinity ? 0 : Math.floor(minPrice), 
        max: Math.ceil(maxPrice) 
      }
    });

    // Update filter state with new price range
    setFilters(prev => ({
      ...prev,
      priceRange: { 
        min: minPrice === Infinity ? 0 : Math.floor(minPrice), 
        max: Math.ceil(maxPrice) 
      }
    }));
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Apply filters
    filtered = filtered.filter(product => {
      // Price filter
      const price = parseFloat(product.price);
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      // Subcategory filter
      if (filters.selectedSubcategories.length > 0) {
        if (!filters.selectedSubcategories.includes(product.subcategory)) {
          return false;
        }
      }

      // Size filter
      if (filters.selectedSizes.length > 0) {
        if (!product.sizes || !product.sizes.some(size => filters.selectedSizes.includes(size))) {
          return false;
        }
      }

      // Color filter
      if (filters.selectedColors.length > 0) {
        if (!filters.selectedColors.includes(product.color)) {
          return false;
        }
      }

      // Stock filter
      if (filters.inStock && product.quantity <= 0) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (filterType, value, checked) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (filterType) {
        case 'subcategory':
          if (checked) {
            newFilters.selectedSubcategories = [...prev.selectedSubcategories, value];
          } else {
            newFilters.selectedSubcategories = prev.selectedSubcategories.filter(item => item !== value);
          }
          break;
        case 'size':
          if (checked) {
            newFilters.selectedSizes = [...prev.selectedSizes, value];
          } else {
            newFilters.selectedSizes = prev.selectedSizes.filter(item => item !== value);
          }
          break;
        case 'color':
          if (checked) {
            newFilters.selectedColors = [...prev.selectedColors, value];
          } else {
            newFilters.selectedColors = prev.selectedColors.filter(item => item !== value);
          }
          break;
        case 'inStock':
          newFilters.inStock = checked;
          break;
        default:
          break;
      }
      
      return newFilters;
    });
  };

  const handlePriceRangeChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min: parseInt(min), max: parseInt(max) }
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: filterOptions.priceRange,
      selectedSubcategories: [],
      selectedSizes: [],
      selectedColors: [],
      inStock: false
    });
  };

  const getCategoryDisplayName = (categoryName) => {
    if (!categoryName) return 'All Products';
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  };

  const getSubcategoryDisplayName = (subcategoryName) => {
    if (!subcategoryName) return '';
    return subcategoryName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="category-loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="category-page">
        <div className="category-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">›</span>
            {category && (
              <>
                <Link to={`/products/${category}`}>{getCategoryDisplayName(category)}</Link>
                {subcategory && (
                  <>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-current">{getSubcategoryDisplayName(subcategory)}</span>
                  </>
                )}
              </>
            )}
          </div>

          <div className="category-content">
            {/* Left Sidebar - Filters */}
            <div className="filters-sidebar">
              <div className="filters-header">
                <h3>Filters</h3>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All
                </button>
              </div>

              {/* Subcategories Filter */}
              {subcategories.length > 0 && !subcategory && (
                <div className="filter-section">
                  <h4>Categories</h4>
                  <div className="filter-options">
                    {subcategories.map((sub) => (
                      <label key={sub.id} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.selectedSubcategories.includes(sub.name)}
                          onChange={(e) => handleFilterChange('subcategory', sub.name, e.target.checked)}
                        />
                        <span>{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="filter-section">
                <h4>Price Range</h4>
                <div className="price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceRangeChange(e.target.value, filters.priceRange.max)}
                      className="price-input"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceRangeChange(filters.priceRange.min, e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              {filterOptions.sizes.length > 0 && (
                <div className="filter-section">
                  <h4>Size</h4>
                  <div className="filter-options">
                    {filterOptions.sizes.map((size) => (
                      <label key={size} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.selectedSizes.includes(size)}
                          onChange={(e) => handleFilterChange('size', size, e.target.checked)}
                        />
                        <span>{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {filterOptions.colors.length > 0 && (
                <div className="filter-section">
                  <h4>Color</h4>
                  <div className="filter-options">
                    {filterOptions.colors.map((color) => (
                      <label key={color} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.selectedColors.includes(color)}
                          onChange={(e) => handleFilterChange('color', color, e.target.checked)}
                        />
                        <span>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Filter */}
              <div className="filter-section">
                <h4>Availability</h4>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', null, e.target.checked)}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Right Content - Products */}
            <div className="products-content">
              {/* Header with sort */}
              <div className="products-header">
                <div className="products-info">
                  <h1>
                    {subcategory 
                      ? getSubcategoryDisplayName(subcategory)
                      : getCategoryDisplayName(category)
                    }
                  </h1>
                  <p>{filteredProducts.length} products found</p>
                </div>
                <div className="sort-options">
                  <label>Sort by:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {error ? (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-card">
                      <Link to={`/product/${product.id}`} className="product-link">
                        <div className="product-image">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="product-img"
                            />
                          ) : (
                            <div className="product-placeholder">
                              <span>📷</span>
                            </div>
                          )}
                          {product.discount > 0 && (
                            <div className="discount-badge">
                              -{product.discount}%
                            </div>
                          )}
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <div className="product-price">
                            {product.discount > 0 ? (
                              <>
                                <span className="discounted-price">
                                  ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                </span>
                                <span className="original-price">₹{product.price}</span>
                              </>
                            ) : (
                              <span className="current-price">₹{product.price}</span>
                            )}
                          </div>
                          <div className="product-meta">
                            {product.color && (
                              <span className="product-color">{product.color}</span>
                            )}
                            {product.sizes && product.sizes.length > 0 && (
                              <span className="product-sizes">
                                {product.sizes.slice(0, 3).join(', ')}
                                {product.sizes.length > 3 && '...'}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <div className="no-products-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  <button onClick={clearFilters} className="clear-filters-btn">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;