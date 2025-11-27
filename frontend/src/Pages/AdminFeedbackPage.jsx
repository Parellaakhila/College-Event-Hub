import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar, FaRegStar, FaTrash, FaTimes } from "react-icons/fa";
import AdminLayout from "../Pages/AdminLayout";
import "../Styles/AdminFeedback.css";

const AdminFeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/feedback");
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        toast.error(data.message || "Failed to fetch feedbacks");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setFeedbacks(feedbacks.filter((f) => f._id !== deleteTarget._id));
      } else {
        toast.error(data.message || "Failed to delete feedback");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while deleting feedback");
    } finally {
      setShowModal(false);
      setDeleteTarget(null);
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) =>
      i < rating ? <FaStar key={i} color="#f59e0b" /> : <FaRegStar key={i} color="#f59e0b" />
    );

  // Filter feedbacks by search term
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.name?.toLowerCase().includes(term) ||
      f.email?.toLowerCase().includes(term) ||
      f.eventId?.title?.toLowerCase().includes(term) ||
      f.comments?.toLowerCase().includes(term)
    );
  });

  const handleNavigation = (path) => navigate(path);

  if (loading) {
    return (
      <AdminLayout currentPath={location.pathname} onNavigate={handleNavigation}>
        <div className="feedback-loading">
          <h2>Loading feedbacks...</h2>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
  currentPath={location.pathname}
  onNavigate={(p) => navigate(p)}
>

      <div className="admin-feedback-container">
        <ToastContainer />
        <div className="feedback-header">
          <h2>All Feedbacks</h2>
          <p className="feedback-subtitle">
            Manage and review all student feedbacks ({filteredFeedbacks.length} total)
          </p>
        </div>

        {/* Search Bar */}
        <div className="feedback-search-container">
          <input
            type="text"
            placeholder="Search by name, email, event, or comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="feedback-search-input"
          />
        </div>

        {/* Feedbacks Table */}
        {filteredFeedbacks.length === 0 ? (
          <div className="feedback-empty">
            <p>{searchTerm ? "No feedbacks match your search." : "No feedbacks available."}</p>
          </div>
        ) : (
          <div className="feedback-table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((f) => (
                  <tr key={f._id}>
                    <td className="feedback-name">{f.name}</td>
                    <td className="feedback-email">{f.email}</td>
                    <td className="feedback-event">{f.eventId?.title || "Unknown Event"}</td>
                    <td className="feedback-rating">{renderStars(f.rating)}</td>
                    <td className="feedback-comments">{f.comments}</td>
                    <td className="feedback-date">
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="feedback-actions">
                      <button
                        onClick={() => {
                          setDeleteTarget(f);
                          setShowModal(true);
                        }}
                        className="feedback-delete-btn"
                        title="Delete Feedback"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showModal && deleteTarget && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="feedback-delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <FaTimes />
              </button>
              <h3>Delete Feedback</h3>
              <p>
                Are you sure you want to delete feedback from{" "}
                <strong>{deleteTarget.name}</strong>?
              </p>
              <p className="modal-warning">This action cannot be undone.</p>
              <div className="modal-actions">
                <button onClick={handleDelete} className="modal-delete-btn">
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeedbackPage;
