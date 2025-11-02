import React, { useState } from "react";
import "../Styles/CreateEvent.css";
import { useNavigate } from "react-router-dom";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    category: "",
    venue: "",
  });

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Event created successfully!");
      navigate("/admin-dashboard"); // or your dashboard route
    } else {
      alert("❌ Failed to create event!");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("⚠️ Something went wrong!");
  }
};


  return (
    <div className="create-event-container">
      <h1>Create New Event</h1>
      <form className="create-event-form" onSubmit={handleSubmit}>
        <label>Event Title</label>
        <input
          type="text"
          name="title"
          placeholder="Enter event title"
          value={eventData.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Enter event description"
          rows="4"
          value={eventData.description}
          onChange={handleChange}
          required
        ></textarea>

        <div className="form-row">
          <div>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={eventData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={eventData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label>Category</label>
        <select
          name="category"
          value={eventData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Technical">Technical</option>
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Workshop">Workshop</option>
        </select>

        <label>Venue</label>
        <input
          type="text"
          name="venue"
          placeholder="Enter event venue"
          value={eventData.venue}
          onChange={handleChange}
          required
        />

        <div className="button-group">
          <button type="submit" className="create-btn">
            Create Event
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
