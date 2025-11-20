// src/Pages/FeedbackPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar } from "react-icons/fa";
import "../Styles/Feedback.css";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  // Memoized user data
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || "",
    email: user?.email || "",
    rating: 0,
    comments: "",
    _id: null // used to detect update mode
  });

  // ===================== FETCH EVENT =====================
  useEffect(() => {
    if (!user) {
      setLoading(false);
      toast.warn("Please log in to continue", { position: "top-center" });
      navigate("/login");
      return;
    }

    if (!eventId || !/^[0-9a-fA-F]{24}$/.test(eventId)) {
      setLoading(false);
      toast.error("Invalid event ID.", { position: "top-center" });
      navigate("/student/registrations");
      return;
    }

    const controller = new AbortController();

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch event");

        const data = await res.json();
        setEvent(data.event || data);
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Event not found or server error", { position: "top-center" });
        }
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    return () => controller.abort();
  }, [eventId, navigate, user]);

  // ===================== CHECK EXISTING FEEDBACK =====================
  useEffect(() => {
    const checkFeedback = async () => {
      if (!user?.email || !eventId) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/feedback/${eventId}/${user.email}`
        );
        const data = await res.json();

        if (res.ok && data.feedback) {
          setFormData({
            name: data.feedback.name,
            email: data.feedback.email,
            rating: data.feedback.rating,
            comments: data.feedback.comments,
            _id: data.feedback._id,
          });
        }
      } catch (err) {
        console.error("Check feedback error:", err);
      }
    };

    checkFeedback();
  }, [user?.email, eventId]);

  // ===================== FORM CHANGE =====================
  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleStarClick = (value) => {
    setFormData((p) => ({ ...p, rating: value }));
  };

  // ===================== SUBMIT / UPDATE FEEDBACK =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rating || formData.comments.trim().length === 0) {
      toast.error("Please provide a rating and comments", { position: "top-center" });
      return;
    }

    const payload = {
      eventId,
      name: formData.name,
      email: formData.email,
      rating: formData.rating,
      comments: formData.comments,
    };

    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST", // same route updates automatically
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          formData._id ? "✏️ Feedback Updated!" : "🎉 Feedback Submitted!",
          { position: "top-center", autoClose: 1500 }
        );
        setTimeout(() => navigate("/student/registrations"), 1400);
      } else throw new Error(data.message);

    } catch (err) {
      toast.error(err.message || "Network error – try again later", { position: "top-center" });
    }
  };

  // ===================== RENDER =====================
  if (loading) {
    return (
      <div className="feedback-wrapper" style={{ minHeight: "60vh" }}>
        <div style={{ textAlign: "center", width: "100%" }}>
          <h3>Loading event details...</h3>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="feedback-wrapper" style={{ minHeight: "60vh" }}>
        <div style={{ textAlign: "center", width: "100%" }}>
          <h3>Event not found</h3>
          <button className="back-btn" onClick={() => navigate("/student/registrations")}>
            Back to My Events
          </button>
        </div>
      </div>
    );
  }

  // ===================== UI =====================
  return (
    <div className="feedback-wrapper">
      <ToastContainer />
      <div className="feedback-card-container">

        {/* LEFT: EVENT PREVIEW */}
        <div className="feedback-left">
          <img
            src={event.image || "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"}
            alt={event.title || "Event"}
          />
          <h2>{event.title || "Untitled Event"}</h2>
          {event.collegeName && <p className="college">{event.collegeName}</p>}
          {event.description && <p className="desc">{event.description}</p>}

          <div className="meta">
            <span>📅 {event.date ? new Date(event.date).toLocaleDateString() : "TBD"}</span>
            <span>🕒 {event.time || "TBD"}</span>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <form className="feedback-right" onSubmit={handleSubmit}>
          <h3>{formData._id ? "Edit Feedback" : "Submit Feedback"}</h3>

          <label>Name</label>
          <input type="text" name="name" value={formData.name} readOnly />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} readOnly />

          <label>Rating</label>
          <div className="star-row" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                onClick={() => handleStarClick(s)}
                style={{ cursor: "pointer" }}
                color={s <= formData.rating ? "#f59e0b" : "#e5e7eb"}
                size={22}
              />
            ))}
          </div>

          <label>Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            placeholder="Share your thoughts about this event..."
            rows={5}
            required
          />

          <button className="submit-btn" type="submit">
            {formData._id ? "Update Feedback" : "Submit Feedback"}
          </button>

          <button className="back-btn" type="button" onClick={() => navigate("/student/registrations")}>
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
