import React, { useState, useEffect } from "react";
import "../Styles/Events.css";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    category: "",
    venue: "",
  });

  // ✅ Fetch Events
  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/events");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add Event
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newEvent = await res.json();
      setEvents([...events, newEvent]);
      setFormData({ title: "", date: "", category: "", venue: "" });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // ✅ Edit Event (prefill form)
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date.split("T")[0], // convert to yyyy-mm-dd
      category: event.category,
      venue: event.venue,
    });
  };

  // ✅ Update Event
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/events/${editingEvent._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const updatedEvent = await res.json();

      // Update in UI
      setEvents(
        events.map((event) =>
          event._id === editingEvent._id ? updatedEvent : event
        )
      );
      setEditingEvent(null);
      setFormData({ title: "", date: "", category: "", venue: "" });
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // ✅ Delete Event
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await fetch(`http://localhost:5000/api/admin/events/${id}`, {
        method: "DELETE",
      });
      setEvents(events.filter((event) => event._id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // ✅ Filter and Sort
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Manage Events</h2>
        <div className="events-controls">
          <input
            type="text"
            placeholder="Search by title, category, or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            Sort by Date ({sortOrder === "asc" ? "Oldest" : "Newest"})
          </button>
        </div>
      </div>

      {/* 📝 Add / Edit Form */}
      <form
        onSubmit={editingEvent ? handleUpdate : handleAdd}
        className="event-form"
      >
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="venue"
          placeholder="Venue"
          value={formData.venue}
          onChange={handleChange}
          required
        />
        <button type="submit" className="add-btn">
          {editingEvent ? "Update Event" : "Add Event"}
        </button>
        {editingEvent && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditingEvent(null);
              setFormData({ title: "", date: "", category: "", venue: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* 🎴 Event Cards */}
      <div className="events-grid">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-card-header">
                <h3>{event.title}</h3>
                <p className="event-date">
                  📅 {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
              <div className="event-card-body">
                <p><strong>Category:</strong> {event.category}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
              </div>
              <div className="event-card-actions">
                <button className="edit-btn" onClick={() => handleEdit(event)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(event._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events">No events found</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
