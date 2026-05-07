
import React, { useState, useContext } from "react";
import "./RatingModal.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const RatingModal = ({ booking, onClose, onRatingSuccess }) => {
    const { url, token, user } = useContext(AuthContext);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const isStudent = user.role === 'student';
    const hasBothRated = booking.ratingToTeacher && booking.ratingToStudent;
    
    // Check if the current user has already rated this booking
    const userAlreadyRated = isStudent ? booking.hasRatedTeacher : booking.hasRatedStudent;

    const handleSubmit = async () => {
        if (rating === 0) return alert("Please select a rating");
        
        setLoading(true);
        try {
            const endpoint = isStudent 
                ? `${url}/api/booking/${booking._id}/rate-teacher` 
                : `${url}/api/booking/${booking._id}/rate-student`;
            
            const { data } = await axios.put(endpoint, { rating, comment }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                alert("Thank you for your rating!");
                onRatingSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Rating submission error:", error);
            alert("Failed to submit rating");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rating-overlay">
            <div className="rating-card">
                <div className="rating-close" onClick={onClose}>✕</div>
                
                <div className="rating-header">
                    <h2>{hasBothRated ? "Mutual Ratings" : "Rate the Session"}</h2>
                    <p>Session on {booking.timeSlot}</p>
                </div>

                {hasBothRated ? (
                    <div className="mutual-rating-display">
                        <div className="rating-info-box">
                            <div className="rating-row">
                                <span><strong>Tutor:</strong> {booking.teacherId?.name}</span>
                                <span className="rating-stars">⭐ {booking.ratingToTeacher}</span>
                            </div>
                            <p>"{booking.commentToTeacher || "No comment provided"}"</p>
                        </div>
                        <div className="rating-info-box">
                            <div className="rating-row">
                                <span><strong>Student:</strong> {booking.studentId?.name}</span>
                                <span className="rating-stars">⭐ {booking.ratingToStudent}</span>
                            </div>
                            <p>"{booking.commentToStudent || "No comment provided"}"</p>
                        </div>
                    </div>
                ) : userAlreadyRated ? (
                    <div className="waiting-section" style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
                        <h4>Waiting for mutual rating</h4>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
                            You have submitted your rating. Ratings will be visible to both parties once {isStudent ? "the tutor" : "the student"} also submits their rating.
                        </p>
                    </div>
                ) : (
                    <div className="rating-form">
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${rating >= star ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        
                        <textarea
                            className="rating-comment"
                            placeholder={`Write a comment for the ${isStudent ? 'tutor' : 'student'}...`}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button 
                            className="rating-submit" 
                            onClick={handleSubmit}
                            disabled={loading || rating === 0}
                        >
                            {loading ? "Submitting..." : "Submit Rating"}
                        </button>
                        
                        <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '15px' }}>
                            Note: Your rating will only be visible once both parties have rated each other.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingModal;
