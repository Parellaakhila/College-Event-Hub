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

  // 🔔 Notifications
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unseenApprovedIds, setUnseenApprovedIds] = useState([]);

  // 🔢 Pagination
  const [regPage, setRegPage] = useState(1);
  const [upPage, setUpPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const navigate = useNavigate();
  const profileRef = useRef(null);

  // ========================== LOAD STUDENT ==========================
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) return navigate("/login");
      setStudent(user);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // ========================== THEME ==========================
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("dark", next);
  };

  // ========================== SIDEBAR MEMORY ==========================
  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved === "true") setSidebarOpen(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
  }, [sidebarOpen]);

  // ========================== FETCH EVENTS ==========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events/all");
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch {
        setEvents([]);
      }
    };
    load();
  }, []);

  // ========================== FETCH REGISTRATIONS ==========================
  useEffect(() => {
    if (!student?.email) return;
    const load = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/registrations/student/${student.email}`
        );
        const data = await res.json();
        const sorted = (data.registrations || data || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRegistrations(sorted);
      } catch {
        setRegistrations([]);
      }
    };
    load();
  }, [student?.email]);

  // ========================== NOTIFICATIONS ==========================
  const getApprovedIds = () =>
    registrations.filter((r) => r.status === "Approved").map((r) => r._id);

  const seenKey = (email) => `seenApproved_${email}`;

  useEffect(() => {
    if (!student?.email) return;
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    setUnseenApprovedIds(approved.filter((id) => !seen.includes(id)));
  }, [registrations, student?.email]);

  const handleBellClick = () => {
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    localStorage.setItem(seenKey(student.email), JSON.stringify([...new Set([...seen, ...approved])]));
    setUnseenApprovedIds([]);
    setShowNotifDropdown((x) => !x);
  };

  // ========================== UTILITIES ==========================
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning ☀️";
    if (hr < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const isRegistered = (id) =>
    registrations.some((r) => String(r.eventId?._id || r.eventId) === String(id));

  // ========================== PAGINATION ==========================
  const regPaginated = registrations.slice(
    (regPage - 1) * ITEMS_PER_PAGE,
    regPage * ITEMS_PER_PAGE
  );
  const regTotalPages = Math.ceil(registrations.length / ITEMS_PER_PAGE);

  const registeredEventIds = new Set(
    registrations.map((r) => (typeof r.eventId === "object" ? r.eventId._id : r.eventId))
  );

  const upcomingRegisteredEvents = events
    .filter(
      (e) => registeredEventIds.has(String(e._id)) && e.date && new Date(e.date) > new Date()
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upPaginated = upcomingRegisteredEvents.slice(
    (upPage - 1) * ITEMS_PER_PAGE,
    upPage * ITEMS_PER_PAGE
  );
  const upTotalPages = Math.ceil(upcomingRegisteredEvents.length / ITEMS_PER_PAGE);

  // ========================== RENDER ==========================
  if (!student) return <div className="loading-screen"><h2>Loading...</h2></div>;

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>

      {/* ========================== SIDEBAR ========================== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header"><h2>🎓 EventHub</h2></div>
        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard"><FaHome /> Dashboard</NavLink>
          <NavLink to="/student/events"><FaClipboardList /> Explore Events</NavLink>
          <NavLink to="/student/registrations"><FaCalendarAlt /> My Registrations</NavLink>
          <NavLink to="/student/profile"><FaUserCircle /> Profile</NavLink>
        </nav>
      </aside>

      {/* ========================== MAIN CONTENT ========================== */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>

        {/* 🔥 STICKY NAVBAR */}
        <nav className="navbar sticky-nav">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <h1 className="logo">Student Dashboard</h1>
          </div>

          <div className="nav-center">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search events..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="nav-right">
            <div className="theme-switch nav-switch" onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            <button className="bell-btn" onClick={handleBellClick}>
              <FaBell />{unseenApprovedIds.length > 0 && <span className="badge">{unseenApprovedIds.length}</span>}
            </button>

            <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <FaUserCircle className="profile-icon" />
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <p onClick={() => navigate("/student/profile")}><FaUserCircle /> View Profile</p>
                <p onClick={() => setShowSettings(true)}><FaCog /> Settings</p>
                <p onClick={() => setShowLogoutModal(true)}><FaSignOutAlt /> Logout</p>
              </div>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div className="dashboard-header hero">
          <div className="hero-content">
            <div className="welcome-text">
              <h2>{getGreeting()}, <span>{student.name}</span> 👋</h2>
              <p>Welcome back — here’s a quick summary of your events.</p>
            </div>
            <div className="stats-grid center-stats">
              <div className="stat-card"><h2>{registrations.length}</h2><p>Registered</p></div>
              <div className="stat-card"><h2>{upcomingRegisteredEvents.length}</h2><p>Upcoming</p></div>
            </div>
          </div>
        </div>

        {/* MY REGISTRATIONS */}
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
                    {r.status === "Approved"
                      ? <span className="approved"><FaCheckCircle /> Approved</span>
                      : <span className="pending"><FaClock /> Pending</span>}
                  </div>
                </div>
              ))) : <p>No registrations yet.</p>}
          </div>

          {/* 🔥 PAGINATION */}
          {regTotalPages > 1 && (
            <div className="pagination">
              <button disabled={regPage === 1} onClick={() => setRegPage((p) => p - 1)}>Prev</button>
              <span>{regPage} / {regTotalPages}</span>
              <button disabled={regPage === regTotalPages} onClick={() => setRegPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </section>

        {/* UPCOMING */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button className="view-all" onClick={() => navigate("/student/events")}>
              Explore All Events
            </button>
          </div>

          <div className="upcoming-grid">
            {upcomingRegisteredEvents.length ? (
              upPaginated.map((e) => (
                <div key={e._id} className="upcoming-card">
                  <img src={e.image || "https://img.freepik.com/free-vector/hackathon-illustration_23-2148883451.jpg"} alt="" />
                  <div className="event-info">
                    <h3>{e.title}</h3>
                    <p>📅 {new Date(e.date).toLocaleDateString()}</p>
                    <p>🕒 {e.time || "TBD"}</p>
                    <button className="btn" disabled style={{ background: "#9CA3AF" }}>Registered</button>
                  </div>
                </div>
              ))
            ) : <p>No upcoming registered events.</p>}
          </div>

          {/* 🔥 PAGINATION */}
          {upTotalPages > 1 && (
            <div className="pagination">
              <button disabled={upPage === 1} onClick={() => setUpPage((p) => p - 1)}>Prev</button>
              <span>{upPage} / {upTotalPages}</span>
              <button disabled={upPage === upTotalPages} onClick={() => setUpPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default StudentDashboard;
