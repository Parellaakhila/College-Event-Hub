// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import "../Styles/StudentDashboard.css";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSearch,
  FaHome,
  FaCalendarAlt,
  FaSignOutAlt,
  FaCog,
  FaClock,
  FaCheckCircle,
  FaMoon,
  FaSun,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [student, setStudent] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Notification states
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unseenApprovedIds, setUnseenApprovedIds] = useState([]);

  // Pagination states
  const [regPage, setRegPage] = useState(1);
  const [upPage, setUpPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Load student from localStorage safely
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.email) return navigate("/login");
      setStudent(parsedUser);
    } catch (err) {
      console.error("Invalid user data in localStorage", err);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Sidebar persistence
  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved === "true") setSidebarOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
  }, [sidebarOpen]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events/all");
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  // Fetch student registrations
  useEffect(() => {
    if (!student?.email) return;
    const fetchRegs = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/registrations/student/${student.email}`
        );
        const data = await res.json();
        const regs = data.registrations || data || [];
        regs.sort((a, b) => {
          const da = new Date(a.createdAt || a.registeredAt || 0).getTime();
          const db = new Date(b.createdAt || b.registeredAt || 0).getTime();
          return db - da;
        });
        setRegistrations(regs);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setRegistrations([]);
      }
    };
    fetchRegs();
  }, [student?.email]);

  // Notification logic
  const getApprovedIds = (regs = registrations) =>
    regs
      .filter((r) => r.status === "Approved" && (r._id || r.eventId?._id))
      .map((r) => r._id || r.eventId?._id);

  const seenKey = (email) => `seenApproved_${email}`;

  useEffect(() => {
    if (!student?.email) return;
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    const unseen = approved.filter((id) => !seen.includes(id));
    setUnseenApprovedIds(unseen);
  }, [registrations, student?.email]);

  const handleBellClick = () => {
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    const newSeen = Array.from(new Set([...seen, ...approved]));
    localStorage.setItem(seenKey(student.email), JSON.stringify(newSeen));
    setUnseenApprovedIds([]);
    setShowNotifDropdown((prev) => !prev);
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  // Check registration
  const isRegistered = (eventId) =>
    registrations.some((r) => {
      const rid = typeof r.eventId === "object" ? r.eventId._id : r.eventId;
      return String(rid) === String(eventId);
    });

  // Registration handler
  const handleRegister = (event) => {
    if (isRegistered(event._id)) {
      alert("Already registered!");
      return;
    }
    navigate("/event-registration", { state: { event } });
  };

  // Notification redirect
  const goToRegistration = (regId) => {
    setShowNotifDropdown(false);
    navigate(`/student/registrations#${regId}`);
  };

  // --- Pagination for Registrations ---
  const regStart = (regPage - 1) * ITEMS_PER_PAGE;
  const regPaginated = registrations.slice(regStart, regStart + ITEMS_PER_PAGE);
  const regTotalPages = Math.max(1, Math.ceil(registrations.length / ITEMS_PER_PAGE));

  // --- Option A: Only upcoming registered events ---
  const registeredEventIds = new Set(
    registrations
      .map((r) => (typeof r.eventId === "object" ? r.eventId._id : r.eventId))
      .filter(Boolean)
  );

  const upcomingRegisteredEvents = events
    .filter(
      (ev) =>
        registeredEventIds.has(String(ev._id)) &&
        ev.date &&
        new Date(ev.date) > new Date()
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upStart = (upPage - 1) * ITEMS_PER_PAGE;
  const upPaginated = upcomingRegisteredEvents.slice(
    upStart,
    upStart + ITEMS_PER_PAGE
  );
  const upTotalPages = Math.max(
    1,
    Math.ceil(upcomingRegisteredEvents.length / ITEMS_PER_PAGE)
  );

  if (!student)
    return (
      <div className="loading-screen">
        <h2>Loading Student Dashboard...</h2>
      </div>
    );

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>🎓 EventHub</h2>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/student-dashboard"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={() => setSidebarOpen(true)}
          >
            <FaHome /> Dashboard
          </NavLink>

          <NavLink
            to="/student/events"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={() => setSidebarOpen(true)}
          >
            <FaClipboardList /> Explore Events
          </NavLink>

          <NavLink
            to="/student/registrations"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={() => setSidebarOpen(true)}
          >
            <FaCalendarAlt /> My Registrations
          </NavLink>

          <NavLink
            to="/student/profile"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={() => setSidebarOpen(true)}
          >
            <FaUserCircle /> Profile
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <nav className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <h1 className="logo">Student Dashboard</h1>
          </div>

          <div className="nav-center">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="nav-right" ref={profileRef}>
            <div style={{ position: "relative" }}>
              <button
                className="bell-btn"
                onClick={handleBellClick}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <FaBell />
                {unseenApprovedIds.length > 0 && (
                  <span className="badge">{unseenApprovedIds.length}</span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown">
                  <div className="notif-header">Recent Approvals</div>

                  {registrations.filter((r) => r.status === "Approved").length ===
                  0 ? (
                    <div className="notif-empty">No approvals yet</div>
                  ) : (
                    <ul className="notif-list">
                      {registrations
                        .filter((r) => r.status === "Approved")
                        .map((r) => (
                          <li key={r._id} onClick={() => goToRegistration(r._id)}>
                            <div className="notif-thumb">
                              <img
                                src={
                                  r.eventId?.image ||
                                  "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
                                }
                                alt=""
                              />
                            </div>
                            <div>
                              <strong>{r.eventId?.title}</strong>
                              <span>
                                {new Date(r.eventId?.date).toLocaleDateString()}
                              </span>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <FaUserCircle className="profile-icon" />
              <div className="profile-info">
                <p className="name">{student.name}</p>
              </div>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <p onClick={() => navigate("/student/profile")}>
                  <FaUserCircle /> View Profile
                </p>
                <p
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowSettings(true);
                  }}
                >
                  <FaCog /> Settings
                </p>
                <p onClick={() => setShowLogoutModal(true)}>
                  <FaSignOutAlt /> Logout
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Dashboard Header */}
        <div className="dashboard-header hero">
          <div className="hero-content">
            <div className="welcome-text">
              <h2>
                {getGreeting()}, <span>{student.name}</span> 👋
              </h2>
              <p>Welcome back — here’s a quick summary of your events.</p>
            </div>

            <div className="stats-grid center-stats">
              <div className="stat-card">
                <h2>{registrations.length}</h2>
                <p>Events Registered</p>
              </div>
              <div className="stat-card">
                <h2>{upcomingRegisteredEvents.length}</h2>
                <p>Upcoming Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Registrations */}
        <section className="registrations-section">
          <div className="section-header">
            <h2>My Registrations</h2>
            <button
              className="view-all"
              onClick={() => navigate("/student/registrations")}
            >
              View All
            </button>
          </div>

          <div className="registrations-grid">
            {registrations.length ? (
              regPaginated.map((r) => (
                <div key={r._id} className="event-card">
                  <img
                    src={
                      r.eventId?.image ||
                      "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
                    }
                    alt=""
                  />
                  <div className="event-info">
                    <h3>{r.eventId?.title}</h3>
                    <p>📅 {new Date(r.eventId?.date).toLocaleDateString()}</p>
                    <p>🕒 {r.eventId?.time || "TBD"}</p>
                    <p>
                      {r.status === "Approved" ? (
                        <span className="approved">
                          <FaCheckCircle /> Approved
                        </span>
                      ) : (
                        <span className="pending">
                          <FaClock /> Pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No registrations yet.</p>
            )}
          </div>

          {registrations.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              <button
                disabled={regPage === 1}
                onClick={() => setRegPage((p) => p - 1)}
              >
                Prev
              </button>
              <span>
                {regPage} / {regTotalPages}
              </span>
              <button
                disabled={regPage === regTotalPages}
                onClick={() => setRegPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Upcoming Registered Events */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button className="view-all" onClick={() => navigate("/student/events")}>
              Explore All Events
            </button>
          </div>

          <div className="upcoming-grid">
            {upcomingRegisteredEvents.length ? (
              upPaginated.map((event) => (
                <div key={event._id} className="upcoming-card">
                  <img
                    src={
                      event.image ||
                      "https://img.freepik.com/free-vector/hackathon-illustration_23-2148883451.jpg"
                    }
                    alt=""
                  />
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                    <p>🕒 {event.time || "TBD"}</p>

                    <button
                      className="btn"
                      disabled
                      style={{ background: "#9ca3af", cursor: "not-allowed" }}
                    >
                      Registered
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No upcoming registered events.</p>
            )}
          </div>

          {upcomingRegisteredEvents.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              <button disabled={upPage === 1} onClick={() => setUpPage((p) => p - 1)}>
                Prev
              </button>
              <span>
                {upPage} / {upTotalPages}
              </span>
              <button
                disabled={upPage === upTotalPages}
                onClick={() => setUpPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div
            className="edit-profile-modal settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Settings</h3>
            <div className="flex-space">
              <div>
                <strong>Theme</strong>
                <div className="desc">Toggle dark/light mode</div>
              </div>
              <button className="theme-toggle-btn" onClick={handleThemeToggle}>
                {darkMode ? (
                  <>
                    <FaSun /> Light
                  </>
                ) : (
                  <>
                    <FaMoon /> Dark
                  </>
                )}
              </button>
            </div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowSettings(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-buttons">
              <button
                className="save-btn"
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
              >
                Yes
              </button>
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
