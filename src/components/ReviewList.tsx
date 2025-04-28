import React, { useState } from 'react';
import './ReviewList.css';

interface Review {
  _id: string;
  customerName: string;
  reviewText: string;
  rating: number;
}

interface ReviewListProps {
  reviews: Review[];
  onEdit: (reviewId: string, updatedReview: Partial<Review>) => Promise<boolean>;
  onDelete: (reviewId: string) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onEdit, onDelete }) => {
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedText, setEditedText] = useState('');
  const [editedRating, setEditedRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const renderStars = (rating: number, editable = false) => (
    <div className="stars-display">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : 'empty'} ${editable ? 'editable' : ''}`}
          onClick={() => editable && setEditedRating(star)}> ★ </span>
      ))}
    </div>
  );

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setEditedName(review.customerName);
    setEditedText(review.reviewText);
    setEditedRating(review.rating);
    setError('');
  };

  const handleCloseModal = () => {
    setEditingReview(null);
    setError('');
  };

  const handleDelete = async (reviewId: string) => {
    try {
      onDelete(reviewId);
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

 // Update the handleSubmit function in ReviewList
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingReview) return;

  if (!editedName.trim() || !editedText.trim()) {
    setError('Please fill in all fields');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const success = await onEdit(editingReview._id, {
      customerName: editedName,
      reviewText: editedText,
      rating: editedRating
    });
    
    if (success) {
      handleCloseModal();
      setShowUpdateSuccess(true);
      setTimeout(() => setShowUpdateSuccess(false), 3000);
    } else {
      setError('Failed to update review. Please try again.');
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'An error occurred while updating the review.');
    console.error('Error updating review:', err);
  } finally {
    setIsLoading(false);
  }
};

  if (reviews.length === 0) {
    return <div className="no-reviews">No reviews yet. Be the first to leave a review!</div>;
  }

  return (
    <div className="review-list">
      {showDeleteSuccess && (
        <div className="delete-success-overlay">
          <div className="delete-success-message">
            <span className="close-alert" onClick={() => setShowDeleteSuccess(false)}>
              &times;
            </span>
            Your review was deleted successfully!
          </div>
        </div>
      )}
      {showUpdateSuccess && (
        <div className="update-success-overlay">
          <div className="update-success-message">
            <span className="close-alert" onClick={() => setShowUpdateSuccess(false)}>
              &times;
            </span>
            Your Review updated successfully!
          </div>
        </div>
      )}
      <h3 className="review-list-title">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id} className="review-card">
          <div className="review-header">
            <h4 className="reviewer-name">{review.customerName}</h4>
            {renderStars(review.rating)}
          </div>
          <p className="review-text">{review.reviewText}</p>
          <div className="review-actions">
            <button className="edit-button" onClick={() => handleEditClick(review)}>
              Edit
            </button>
            <button className="delete-button" onClick={() => handleDelete(review._id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {editingReview && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>
              &times;
            </button>
            <h3>Edit Review</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name:</label>
                <input
                  id="name"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rating:</label>
                {renderStars(editedRating, true)}
              </div>

              <div className="form-group">
                <label htmlFor="review">Your Review:</label>
                <textarea
                  id="review"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;