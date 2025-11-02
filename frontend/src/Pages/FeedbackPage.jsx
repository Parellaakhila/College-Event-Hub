import React, { useEffect, useState } from "react";
import "../Styles/Feedback.css";

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const res = await fetch("http://localhost:5000/api/admin/feedbacks");
      const data = await res.json();
      setFeedbacks(data);
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="feedback-container">
      <h2>Event Feedback</h2>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Student</th>
            <th>Rating</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.length > 0 ? (
            feedbacks.map((fb) => (
              <tr key={fb._id}>
                <td>{fb.eventId?.title}</td>
                <td>{fb.studentName}</td>
                <td>{fb.rating}</td>
                <td>{fb.comments}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No feedback available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackPage;
