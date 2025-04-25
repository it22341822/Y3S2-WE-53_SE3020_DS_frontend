import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import './Home.css';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const restaurantId = 'restaurantId1'; // Change dynamically

  const fetchReviews = async () => {
    try {
      const result = await axios.get(`/api/reviews/${restaurantId}`);
      setReviews(result.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSave = () => {
    fetchReviews();
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleEdit = async (reviewId: string, updatedReview: any): Promise<boolean> => {
    try {
      await axios.put(`/api/reviews/${reviewId}`, updatedReview);
      fetchReviews();
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Add Your Foodie Review</h1>
        <p className="home-subtitle">Share your experiences</p>
      </div>
      <div>
        <ReviewForm restaurantId={restaurantId} onSave={handleSave} />
        <ReviewList reviews={reviews} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Home;
