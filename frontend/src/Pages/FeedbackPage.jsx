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

  // parse user once and memoize so identity is stable across renders
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
  });

  useEffect(() => {
    console.log("FeedbackPage useEffect -> user:", !!user, "eventId:", eventId);

    // if not logged in -> stop loading and redirect
    if (!user) {
      setLoading(false); // ensure loader doesn't hang
      toast.warn("Please log in to continue", { position: "top-center" });
      navigate("/login");
      return;
    }

    // validate eventId early to avoid unnecessary requests
    if (!eventId || !/^[0-9a-fA-F]{24}$/.test(eventId)) {
      setLoading(false);
      toast.error("Invalid event ID.", { position: "top-center" });
      navigate("/student/registrations");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        console.log("Fetching event:", eventId);
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`, { signal });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error("Event fetch failed:", res.status, errBody);
          throw new Error(errBody.message || `Failed to fetch event (status ${res.status})`);
        }

        const data = await res.json().catch(() => ({}));
        console.log("Event fetch response:", data);
        setEvent(data.event || data);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }
        console.error("Error fetching event:", err);
        toast.error(err.message || "Event not found or server error", { position: "top-center" });
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    return () => controller.abort();
    // NOTE: user is memoized so it's safe not to include here
  }, [eventId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleStarClick = (value) => {
    setFormData((p) => ({ ...p, rating: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating || formData.comments.trim().length === 0) {
      toast.error("Please provide a rating and comments", { position: "top-center" });
      return;
    }

    try {
      const payload = {
        eventId,
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        comments: formData.comments,
      };

      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.created || data.message === "Feedback submitted")) {
        toast.success("🎉 Feedback submitted!", { position: "top-center", autoClose: 1500 });
        setTimeout(() => navigate("/student/registrations"), 1400);
      } else {
        throw new Error(data.message || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Submit feedback error:", err);
      toast.error(err.message || "Network error – try again later", { position: "top-center" });
    }
  };

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
          <button className="back-btn" onClick={() => navigate("/student/registrations")}>Back to My Events</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-wrapper">
      <ToastContainer />
      <div className="feedback-card-container">
        {/* LEFT: event preview */}
        <div className="feedback-left">
          <img
            src={event.image || "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"}
            alt={event.title || "Event"}
          />
          <h2>{event.title || "Untitled Event"}</h2>
          {event.collegeName && <p className="college">{event.collegeName}</p>}
          {event.description && <p className="desc">{event.description}</p>}

          <div className="meta">
            <span>📅 {event.date ? (new Date(event.date)).toLocaleDateString() : "TBD"}</span>
            <span>🕒 {event.time || "TBD"}</span>
          </div>
        </div>

        {/* RIGHT: feedback form */}
        <form className="feedback-right" onSubmit={handleSubmit}>
          <h3>Submit Feedback</h3>

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
                aria-checked={s === formData.rating}
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

          <button className="submit-btn" type="submit">Submit Feedback</button>
          <button className="back-btn" type="button" onClick={() => navigate("/student/registrations")}>Back</button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
