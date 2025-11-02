import React, { useState } from "react";
import "../Styles/StudentDashboard.css";
import { FaBars, FaTimes, FaBell, FaUserCircle, FaSearch, FaHome, FaCalendarAlt, FaSignOutAlt } from "react-icons/fa";
import { useEffect } from "react";

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const stats = [
    { title: "Events Registered", value: 12 },
    { title: "Upcoming Events", value: 3 },
    { title: "Events Attended", value: 8 },
    { title: "Pending Approvals", value: 1 },
  ];

  const registrations = [
    {
      title: "TechFest Hackathon 2025",
      college: "IIT Bombay",
      date: "March 15, 2025",
      time: "9:00 AM - 5:00 PM",
      img: "https://img.freepik.com/free-vector/hackathon-illustration_23-2148883451.jpg",
    },
    {
      title: "TechFleet Hackathon 2025",
      college: "IIT Delhi",
      date: "March 18, 2025",
      time: "9:00 AM - 5:00 PM",
      img: "https://img.freepik.com/free-vector/music-concert-stage_52683-44612.jpg",
    },
  ];

  const upcomingEvents = new Array(6).fill({
    title: "TechFest Hackathon 2025",
    college: "IIT Bombay",
    date: "March 15, 2025",
    time: "9:00 AM - 5:00 PM",
    deadline: "March 12",
  });
useEffect(() => {
  fetch("http://localhost:5000/api/events/all")
    .then((res) => res.json())
    .then((data) => setEvents(data))
    .catch((err) => console.error(err));
}, []);

  return (
    <div className="dashboard-container">
      {/* ===== Sidebar ===== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>🎓 StudentHub</h2>
          <FaTimes className="close-btn" onClick={toggleSidebar} />
        </div>
        <nav className="sidebar-menu">
          <a href="#"><FaHome /> Dashboard</a>
          <a href="#"><FaCalendarAlt /> My Events</a>
          <a href="#"><FaUserCircle /> Profile</a>
          <a href="#"><FaSignOutAlt /> Logout</a>
        </nav>
      </aside>

      {/* ===== Main Section ===== */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        {/* ===== Navbar ===== */}
        <nav className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={toggleSidebar} />
            <h1 className="logo">Browse Events</h1>
          </div>

          <div className="nav-center">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search events..." />
            </div>
          </div>

          <div className="nav-right">
            <FaBell className="icon" />
            <div className="profile">
              <FaUserCircle className="profile-icon" />
              <div className="profile-info">
                <p className="name">Rita Roy</p>
                <p className="college">IIT Delhi</p>
              </div>
            </div>
          </div>
        </nav>

        {/* ===== Header Section ===== */}
        <div className="dashboard-header">
          <h1>Welcome back, Rita! 👋</h1>
          <p>Your inter-college event journey continues</p>

          <div className="stats-grid">
            {stats.map((s, i) => (
              <div className="stat-card" key={i}>
                <h2>{s.value}</h2>
                <p>{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== My Registrations ===== */}
        <section className="registrations-section">
          <h2>My Registrations</h2>
          <div className="registrations-grid">
            {registrations.map((event, i) => (
              <div className="event-card" key={i}>
                <img src={event.img} alt={event.title} />
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="college">{event.college}</p>
                  <p>📅 {event.date}</p>
                  <p>🕒 {event.time}</p>
                  <button className="btn">Register Now</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Upcoming Events ===== */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button className="view-all">View All</button>
          </div>

          <div className="category-buttons">
            {["All", "This Week", "Sports", "Hackathon", "Cultural", "Technical", "Workshops"].map(
              (cat, i) => (
                <button key={i} className={`category-btn ${i === 0 ? "active" : ""}`}>
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="upcoming-grid">
            {upcomingEvents.map((event, i) => (
              <div className="upcoming-card" key={i}>
                <div className="img-placeholder"></div>
                <h3>{event.title}</h3>
                <p className="college">{event.college}</p>
                <p>📅 {event.date}</p>
                <p>🕒 {event.time}</p>
                <p className="deadline">Deadline: {event.deadline}</p>
                <button className="btn">Register Now</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
