import React, { useState, useEffect } from "react";
import "../Styles/Events.css";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

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

  // ✅ Filter events by search
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>All Events</h2>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search by title, category, or venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {/* 🔽 Sort Button */}
        <button
          className="sort-btn"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          Sort by Date ({sortOrder === "asc" ? "Oldest" : "Newest"})
        </button>
      </div>

      {/* 🧾 Events Table */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Category</th>
            <th>Venue</th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <tr key={event._id}>
                <td data-label="Title">{event.title}</td>
                <td data-label="Date">
                  {new Date(event.date).toLocaleDateString()}
                </td>
                <td data-label="Category">{event.category}</td>
                <td data-label="Venue">{event.venue}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No events found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventsPage;
