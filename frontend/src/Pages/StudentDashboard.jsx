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
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unseenApprovedIds, setUnseenApprovedIds] = useState([]);

  const [regPage, setRegPage] = useState(1);
  const [upPage, setUpPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Load user
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");
      const parsed = JSON.parse(storedUser);
      if (!parsed?.email) return navigate("/login");
      setStudent(parsed);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // Load Theme
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleThemeToggle = () => {
    const mode = !darkMode;
    setDarkMode(mode);
    localStorage.setItem("darkMode", mode ? "true" : "false");
    document.documentElement.classList.toggle("dark", mode);
  };

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
      } catch {
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  // Fetch registrations
  useEffect(() => {
    if (!student?.email) return;
    const fetchRegs = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/registrations/student/${student.email}`
        );
        const data = await res.json();
        const regs = data.registrations || data || [];
        regs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRegistrations(regs);
      } catch {
        setRegistrations([]);
      }
    };
    fetchRegs();
  }, [student?.email]);

  // Check registered
  const isRegistered = (eventId) =>
    registrations.some((r) => {
      const rid = typeof r.eventId === "object" ? r.eventId._id : r.eventId;
      return String(rid) === String(eventId);
    });

  // Notifications Logic
  const getApprovedIds = () =>
    registrations
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
    localStorage.setItem(seenKey(student.email), JSON.stringify([...new Set([...seen, ...approved])]));
    setUnseenApprovedIds([]);
    setShowNotifDropdown((p) => !p);
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  // Pagination
  const regPaginated = registrations.slice((regPage - 1) * ITEMS_PER_PAGE, regPage * ITEMS_PER_PAGE);
  const regTotalPages = Math.max(1, Math.ceil(registrations.length / ITEMS_PER_PAGE));

  const upcomingEvents = events
    .filter((ev) => ev.date && new Date(ev.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upPaginated = upcomingEvents.slice((upPage - 1) * ITEMS_PER_PAGE, upPage * ITEMS_PER_PAGE);
  const upTotalPages = Math.max(1, Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE));

  if (!student) return <div className="loading-screen"><h2>Loading Student Dashboard...</h2></div>;

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header"><h2>🎓 EventHub</h2></div>
        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard"><FaHome /> Dashboard</NavLink>
          <NavLink to="/student/events"><FaClipboardList /> Explore Events</NavLink>
          <NavLink to="/student/registrations"><FaCalendarAlt /> My Registrations</NavLink>
          <NavLink to="/student/profile"><FaUserCircle /> Profile</NavLink>
        </nav>
      </aside>

      {/* Main */}
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
            {/* SAME SWITCH AS SETTINGS */}
            <div className="theme-switch nav-switch" onClick={handleThemeToggle}>
              <div className={`switch ${darkMode ? "on" : ""}`}>
                <div className="circle"></div>
              </div>
            </div>

            <button className="bell-btn" onClick={handleBellClick}>
              <FaBell />
              {unseenApprovedIds.length > 0 && <span className="badge">{unseenApprovedIds.length}</span>}
            </button>

            <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <FaUserCircle className="profile-icon" />
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <p onClick={() => navigate("/student/profile")}><FaUserCircle /> View Profile</p>
                <p onClick={() => { setShowProfileMenu(false); setShowSettings(true); }}><FaCog /> Settings</p>
                <p onClick={() => setShowLogoutModal(true)}><FaSignOutAlt /> Logout</p>
              </div>
            )}

            {showNotifDropdown && (
              <div className="notifications-dropdown">
                <h4>Notifications</h4>
                <ul className="notif-list">
                  {registrations
                    .filter((r) => r.status === "Approved")
                    .map((r) => {
                      const ev = typeof r.eventId === "object" ? r.eventId : null;
                      return (
                        <li key={r._id} className="notif-item">
                          <strong>{ev?.title}</strong>
                          <span className="notif-approved">✔ Registration Approved</span>
                          {ev?.date && <small>📅 {new Date(ev.date).toLocaleDateString()}</small>}
                        </li>
                      );
                    })}
                  {!registrations.some((r) => r.status === "Approved") && (
                    <p className="no-notif">No new notifications</p>
                  )}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* Hero */}
        <div className="dashboard-header hero">
          <div className="hero-content">
            <div className="welcome-text">
              <h2>{getGreeting()}, <span>{student.name}</span> 👋</h2>
              <p>Welcome back — here’s a quick summary of your events.</p>
            </div>
            <div className="stats-grid center-stats">
              <div className="stat-card"><h2>{registrations.length}</h2><p>Events Registered</p></div>
              <div className="stat-card"><h2>{upcomingEvents.length}</h2><p>Upcoming Events</p></div>
            </div>
          </div>
        </div>

        {/* Registrations */}
        <section className="registrations-section">
          <div className="section-header">
            <h2>My Registrations</h2>
            <button className="view-all" onClick={() => navigate("/student/registrations")}>View All</button>
          </div>

          <div className="registrations-grid">
            {registrations.length ? (
              regPaginated.map((r) => (
                <div key={r._id} className="event-card">
                  <img src={r.eventId?.image || "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"} alt="" />
                  <div className="event-info">
                    <h3>{r.eventId?.title}</h3>
                    <p>📅 {new Date(r.eventId?.date).toLocaleDateString()}</p>
                    <p>🕒 {r.eventId?.time || "TBD"}</p>
                    {r.status === "Approved" ? (
                      <span className="approved"><FaCheckCircle /> Approved</span>
                    ) : (
                      <span className="pending"><FaClock /> Pending</span>
                    )}
                  </div>
                </div>
              ))
            ) : <p>No registrations yet.</p>}
          </div>
        </section>

        {/* Upcoming */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button className="view-all" onClick={() => navigate("/student/events")}>Explore All Events</button>
          </div>

          <div className="upcoming-grid">
            {upcomingEvents.length ? (
              upPaginated.map((event) => (
                <div key={event._id} className="upcoming-card">
                  <img src={event.image || "https://img.freepik.com/free-vector/hackathon-illustration_23-2148883451.jpg"} alt="" />
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                    <p>🕒 {event.time || "TBD"}</p>

                    {isRegistered(event._id) ? (
                      <button className="btn" disabled style={{ background: "#9CA3AF" }}>Registered</button>
                    ) : (
                      <button className="btn" onClick={() => navigate("/event-registration", { state: { event } })}>Register Now</button>
                    )}
                  </div>
                </div>
              ))
            ) : <p>No upcoming events.</p>}
          </div>
        </section>
      </div>

      {/* ⚙ Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="edit-profile-modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Settings</h3>

            <div className="flex-space">
              <div>
                <strong>Theme</strong>
                <div className="desc">Toggle dark/light mode</div>
              </div>

              {/* SAME SWITCH */}
              <div className="theme-switch" onClick={handleThemeToggle}>
                <div className={`switch ${darkMode ? "on" : ""}`}>
                  <div className="circle"></div>
                </div>
                <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 Logout */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-buttons">
              <button className="save-btn" onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}>Yes</button>
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
