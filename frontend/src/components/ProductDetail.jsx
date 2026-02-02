import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import StarRating from './StarRating';
import Footer from './Footer';
import '../styles/components/ProductDetail.css';
import '../styles/components/StarRating.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.API}/products/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
          if (data.data.sizes && data.data.sizes.length > 0) {
            setSelectedSize(data.data.sizes[0]);
          }
        } else {
          setError(data.message || 'Product not found');
        }
      } else {
        setError('Failed to load product');
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      setError('An error occurred while loading the product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API}/reviews/product/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedReviews = data.data.reviews.map(review => ({
            id: review.id,
            user: review.username,
            rating: review.rating,
            comment: review.comment,
            date: new Date(review.createdAt).toLocaleDateString()
          }));
          setReviews(formattedReviews);
        }
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      // Fallback to empty reviews array
      setReviews([]);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.API}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          size: selectedSize
        })
      });

      if (response.ok) {
        alert('Product added to cart successfully!');
      } else {
        alert('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('An error occurred while adding to cart');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.API}/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id
        })
      });

      if (response.ok) {
        alert('Product added to wishlist successfully!');
      } else {
        alert('Failed to add product to wishlist');
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      alert('An error occurred while adding to wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.API}/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new review to the beginning of the reviews array
        const newReviewData = {
          id: data.data.id,
          user: data.data.username,
          rating: data.data.rating,
          comment: data.data.comment,
          date: new Date(data.data.createdAt).toLocaleDateString()
        };
        
        setReviews([newReviewData, ...reviews]);
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        alert('Review submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      alert('An error occurred while submitting the review');
    }
  };



  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="product-loading">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="product-error">
          <h2>Product Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount > 0 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  return (
    <div>
      <Navbar />
      <div className="product-detail-container">
        <div className="product-detail-content">
          {/* Left Side - Images */}
          <div className="product-images-section">
            <div className="main-image-container" onClick={() => setShowFullImage(true)}>
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="main-product-image"
                  />
                  <div className="zoom-hint">🔍 Click to view full image</div>
                </>
              ) : (
                <div className="no-image-placeholder">
                  <span>📷</span>
                  <p>No Image Available</p>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Full Screen Image Modal */}
          {showFullImage && (
            <div className="fullscreen-modal" onClick={() => setShowFullImage(false)}>
              <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setShowFullImage(false)}>✕</button>
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="fullscreen-image"
                />
                {product.images && product.images.length > 1 && (
                  <>
                    <button 
                      className="nav-btn prev-btn" 
                      onClick={() => setSelectedImage((prev) => prev === 0 ? product.images.length - 1 : prev - 1)}
                    >
                      ‹
                    </button>
                    <button 
                      className="nav-btn next-btn" 
                      onClick={() => setSelectedImage((prev) => prev === product.images.length - 1 ? 0 : prev + 1)}
                    >
                      ›
                    </button>
                    <div className="image-counter">
                      {selectedImage + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Right Side - Product Info & Description */}
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <StarRating 
                rating={Math.round(calculateAverageRating())} 
                showRating={true}
              />
              <span className="rating-text">
                ({reviews.length} reviews)
              </span>
            </div>

            <div className="product-pricing">
              <div className="price-container">
                <span className="current-price">₹{discountedPrice.toFixed(2)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="original-price">₹{product.price.toFixed(2)}</span>
                    <span className="discount-badge">{product.discount}% OFF</span>
                  </>
                )}
              </div>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>

            <div className="product-details">
              <div className="detail-item">
                <strong>Category:</strong> {product.category}
              </div>
              {product.subcategory && (
                <div className="detail-item">
                  <strong>Subcategory:</strong> {product.subcategory}
                </div>
              )}
              {product.material && (
                <div className="detail-item">
                  <strong>Material:</strong> {product.material}
                </div>
              )}
              {product.color && (
                <div className="detail-item">
                  <strong>Color:</strong> {product.color}
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="size-selection">
                <h3>Select Size</h3>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
              <p className="stock-info">
                {product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                onClick={handleAddToCart}
                className="add-to-cart-btn"
                disabled={product.quantity === 0}
              >
                Add to Cart
              </button>
              <button 
                onClick={handleAddToWishlist}
                className="add-to-wishlist-btn"
              >
                ❤️ Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section - Moved to Bottom */}
        <div className="reviews-section-bottom">
          <div className="reviews-container">
            <div className="reviews-header">
              <h2>Customer Reviews</h2>
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="write-review-btn"
              >
                Write a Review
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="rating-input">
                  <label>Rating:</label>
                  <select 
                    value={newReview.rating}
                    onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="comment-input">
                  <label>Comment:</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-review-btn">Submit Review</button>
                  <button 
                    type="button" 
                    onClick={() => setShowReviewForm(false)}
                    className="cancel-review-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <strong>{review.user}</strong>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <div className="review-rating">
                        <StarRating rating={review.rating} size="1rem" />
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review this product!</p>
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

export default ProductDetail;