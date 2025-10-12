import React from 'react';

const StarRating = ({ rating, maxStars = 5, size = '1.25rem', showRating = false }) => {
  const renderStars = () => {
    return Array.from({ length: maxStars }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < rating ? 'filled' : 'empty'}`}
        style={{ fontSize: size }}
      >
        {index < rating ? '★' : '☆'}
      </span>
    ));
  };

  return (
    <div className="star-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <div className="stars" style={{ display: 'flex', gap: '0.25rem' }}>
        {renderStars()}
      </div>
      {showRating && (
        <span className="rating-value" style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating;