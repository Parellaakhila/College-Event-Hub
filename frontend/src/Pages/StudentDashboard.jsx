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
  const [unseenApprovedIds, setUnseenApprovedIds] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // 🔢 Pagination
  const [regPage, setRegPage] = useState(1);
  const [upPage, setUpPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const navigate = useNavigate();
  const profileRef = useRef(null);

  // ================= LOAD STUDENT =================
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.email) return navigate("/login");

      setStudent(parsedUser);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // ================= THEME =================
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("dark", next);
  };

  // ================= SIDEBAR MEMORY =================
  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved === "true") setSidebarOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
  }, [sidebarOpen]);

  // ================= FETCH EVENTS =================
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

  // ================= FETCH REGISTRATIONS =================
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

  // ================= NOTIFICATIONS =================
  const getApprovedIds = () =>
    registrations
      .filter((r) => r.status === "Approved")
      .map((r) => r._id);

  const seenKey = (email) => `seenApproved_${email}`;

  useEffect(() => {
    if (!student?.email) return;
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    setUnseenApprovedIds(approved.filter((id) => !seen.includes(id)));
  }, [registrations, student?.email]);

  const handleBellClick = () => {
    if (!student?.email) return;
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    localStorage.setItem(seenKey(student.email), JSON.stringify([...new Set([...seen, ...approved])]));
    setUnseenApprovedIds([]);
    setShowNotifDropdown((p) => !p);
  };

  // ================= UTILITIES =================
 const getGreeting = (username) => {
  const hour = new Date().getHours();
  let greeting = "";

  if (hour < 12) greeting = "Good Morning ☀️";
  else if (hour < 17) greeting = "Good Afternoon 🌤️";
  else greeting = "Good Evening 🌙";

  return `${greeting}, ${username}`;
};

// Get logged-in user
const user = JSON.parse(localStorage.getItem("user"));
const username = user?.name || "User";


  // Check whether the current student is registered for a given event id
  const isRegistered = (eventId) =>
    registrations.some(
      (r) => r?.eventId && (r.eventId._id === eventId || r.eventId === eventId)
    );


  // ================= UPCOMING EVENTS =================
  const upcomingEvents = events
    .filter(
      (ev) =>
        ev?.date &&
        new Date(ev.date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upPaginated = upcomingEvents.slice(
    (upPage - 1) * ITEMS_PER_PAGE,
    upPage * ITEMS_PER_PAGE
  );
  const upTotalPages = Math.max(1, Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE));

  // ================= REGISTRATIONS =================
  const regPaginated = registrations.slice(
    (regPage - 1) * ITEMS_PER_PAGE,
    regPage * ITEMS_PER_PAGE
  );
  const regTotalPages = Math.max(1, Math.ceil(registrations.length / ITEMS_PER_PAGE));

  if (!student) return <div className="loading-screen"><h2>Loading...</h2></div>;

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>🎓 EventHub</h2>
        </div>
        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard"><FaHome /> Dashboard</NavLink>
          <NavLink to="/student/events"><FaClipboardList /> Explore Events</NavLink>
          <NavLink to="/student/registrations"><FaCalendarAlt /> My Registrations</NavLink>
          <NavLink to="/student/profile"><FaUserCircle /> Profile</NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>

        {/* NAVBAR */}
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
            <div className="theme-switch nav-switch" onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            <button className="bell-btn" onClick={handleBellClick}>
              <FaBell />
              {unseenApprovedIds.length > 0 && (
                <span className="badge">{unseenApprovedIds.length}</span>
              )}
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

        {/* 🔔 NOTIFICATION DROPDOWN */}
        {showNotifDropdown && (
          <div className="notifications-dropdown">
            <h4>Notifications</h4>
            <ul className="notif-list">
              {registrations
  .filter((r) => r.status === "Approved")
  .map((r) => (
    <li key={r._id} className="notif-item">
      <strong>{r.eventId?.title}</strong>
      <span className="notif-approved">Approved 🎉</span>
      <small>
        {r.eventId?.date
          ? new Date(r.eventId.date).toLocaleDateString()
          : "No Date"}
      </small>
    </li>
  ))}

              {registrations.filter((r) => r.status === "Approved").length === 0 && (
                <p className="no-notif">No new notifications</p>
              )}
            </ul>
          </div>
        )}

        {/* HERO */}
        <div className="dashboard-header hero">
          <div className="hero-content">
            <div className="welcome-text">
              <h2>{getGreeting(student.fullName)}👋 </h2>
        

              <p>Welcome back — here’s a quick summary of your events.</p>
            </div>
            <div className="stats-grid center-stats">
              <div className="stat-card"><h2>{registrations.length}</h2><p>Events Registered</p></div>
              <div className="stat-card"><h2>{upcomingEvents.length}</h2><p>Upcoming Events</p></div>
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
            {!registrations.length ? (
              <p>No registrations yet.</p>
            ) : (
              regPaginated.map((r) => (
                <div key={r._id} className="event-card">
                  <img src={r.eventId?.image} alt="" />
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
            )}
          </div>

          {registrations.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              <button disabled={regPage === 1} onClick={() => setRegPage((p) => p - 1)}>Prev</button>
              <span>{regPage} / {regTotalPages}</span>
              <button disabled={regPage === regTotalPages} onClick={() => setRegPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </section>

        {/* UPCOMING EVENTS */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button className="view-all" onClick={() => navigate("/student/events")}>
              Explore All Events
            </button>
          </div>

          <div className="upcoming-grid">
            {!events.length ? (
              <p>Loading events...</p>
            ) : !upcomingEvents.length ? (
              <p>No upcoming events.</p>
            ) : (
              upPaginated.map((event) => (
                <div key={event._id} className="upcoming-card">
                  <img src={event.image} alt="" />
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                    <p>🕒 {event.time || "TBD"}</p>

                    {isRegistered(event._id) ? (
                      <button className="btn" disabled style={{ background: "#9ca3af" }}>
                        Registered
                      </button>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => navigate("/event-registration", { state: { event } })}
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {upcomingEvents.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              <button disabled={upPage === 1} onClick={() => setUpPage((p) => p - 1)}>Prev</button>
              <span>{upPage} / {upTotalPages}</span>
              <button disabled={upPage === upTotalPages} onClick={() => setUpPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </section>

      </div>

     {showSettings && (
  <div className="modal-overlay" onClick={() => setShowSettings(false)}>
    <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Settings</h3>

      <div className="flex-space">
        <div>
          <strong>Theme</strong>
          <div className="desc">Toggle dark / light mode</div>
        </div>

        <div
  onClick={handleThemeToggle}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 14px",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.22s ease",
    userSelect: "none",
    border: `1px solid ${darkMode ? "rgba(255,255,255,0.12)" : "rgba(37,99,235,0.38)"}`,
    background: darkMode
      ? "rgba(255,255,255,0.08)"
      : "rgba(37,99,235,0.12)",
    color: darkMode ? "#fff" : "var(--primary)"
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  {darkMode ? (
    <>
      <FaSun /> <span>Light</span>
    </>
  ) : (
    <>
      <FaMoon /> <span>Dark</span>
    </>
  )}
</div>

      </div>

      <button className="close-settings" onClick={() => setShowSettings(false)}>
        Close
      </button>
    </div>
  </div>
)}

      {/* ========== LOGOUT CONFIRMATION ========== */}
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
