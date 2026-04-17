import React, { useState } from "react";
import "./FeedbackModal.css";

export default function FeedbackModal({ booking, onClose }) {
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      alert("⚠️ Please provide both a rating and a comment before submitting.");
      return;
    }

    try {
      // Prepare feedback data
      const feedbackData = {
        hotelId: booking?.hotelDetails?.[0]?._id || booking?.hotelId,
        hotelName: booking?.hotelDetails?.[0]?.name || "Unknown Hotel",
        userId: JSON.parse(localStorage.getItem("user"))?._id,
        bookingId: booking?._id,
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      // Send feedback to backend
      const res = await fetch("http://127.0.0.1:5050/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`🌟 Thank you for sharing your feedback on ${feedbackData.hotelName}!`);
        setRating("");
        setComment("");
        onClose();
      } else {
        alert("❌ Failed to save feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Server error while saving feedback.");
    }
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        
       <button className="feedback-close-btn" onClick={onClose}>&times;</button>

        <h3>Leave Your Feedback</h3>
        <p className="hotel-name">
          <strong>Hotel:</strong> {booking.hotelDetails?.[0]?.name || "Hotel"}
        </p>

        <label>
          Rating (1–5):
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </label>

        <label>
          Comment:
          <textarea
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your stay..."
          ></textarea>
        </label>

        <div className="modal-buttons">
          <button onClick={handleSubmit} className="submit-btn">
            Submit
          </button>


   
</div>
        </div>
      </div>
 
  );
}
