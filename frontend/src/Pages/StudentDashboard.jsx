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

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Fetch all events
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
          return db - da; // latest first
        });
        setRegistrations(regs);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setRegistrations([]);
      }
    };
    fetchRegs();
  }, [student?.email]);

  // Helpers for notifications: approved ids and seen key
  const getApprovedIds = (regs = registrations) =>
    regs
      .filter((r) => r.status === "Approved" && (r._id || (r.eventId && r.eventId._id)))
      .map((r) => r._id || (r.eventId && r.eventId._id));

  const seenKey = (email) => `seenApproved_${email || "anon"}`;

  // Compute unseen approved ids whenever registrations or student change
  useEffect(() => {
    if (!student?.email) {
      setUnseenApprovedIds([]);
      return;
    }
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    const unseen = approved.filter((id) => !seen.includes(id));
    setUnseenApprovedIds(unseen);
  }, [registrations, student?.email]);

  // Toggle sidebar & profile menu
  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const toggleProfileMenu = () => setShowProfileMenu((s) => !s);

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("dark", next);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  // check registration presence (used for disabling register button)
  const isRegistered = (eventId) =>
    registrations.some((r) => {
      const rid =
        r.eventId && typeof r.eventId === "object" ? r.eventId._id : r.eventId;
      return String(rid) === String(eventId);
    });

  const handleRegister = (event) => {
    if (isRegistered(event._id)) {
      alert("You have already registered for this event!");
      return;
    }
    navigate("/event-registration", { state: { event } });
  };

  // Notification bell click: toggle dropdown and mark approved items as seen
  const handleBellClick = () => {
    if (!student?.email) {
      setShowNotifDropdown((s) => !s);
      return;
    }

    // if opening dropdown, mark all approved as seen
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    const newSeen = Array.from(new Set([...seen, ...approved]));
    localStorage.setItem(seenKey(student.email), JSON.stringify(newSeen));
    setUnseenApprovedIds([]);
    setShowNotifDropdown((s) => !s);
  };

  // Navigate to registrations page anchored to the specific registration (if id available)
  const goToRegistration = (regId) => {
    // toggle dropdown off, then navigate
    setShowNotifDropdown(false);
    // Use a hash anchor so registration page can scroll to it (as in your other component)
    navigate(`/student/registrations#${regId}`);
  };

  // Some safe derived data for UI counts
  const upcomingCount = events.filter((e) => e.date && new Date(e.date) > new Date()).length;

  if (!student) {
    return (
      <div className="loading-screen">
        <h2>Loading Student Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>🎓 EventHub</h2>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard" className={({ isActive }) => (isActive ? "active-link" : "")} end>
            <FaHome style={{ marginRight: 10 }} /> Dashboard
          </NavLink>

          <NavLink to="/student/events" className={({ isActive }) => (isActive ? "active-link" : "")}>
            <FaClipboardList style={{ marginRight: 10 }} /> Explore Events
          </NavLink>

          <NavLink to="/student/registrations" className={({ isActive }) => (isActive ? "active-link" : "")}>
            <FaCalendarAlt style={{ marginRight: 10 }} /> My Registrations
          </NavLink>

          <NavLink to="/student/profile" className={({ isActive }) => (isActive ? "active-link" : "")}>
            <FaUserCircle style={{ marginRight: 10 }} /> Profile
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <nav className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={toggleSidebar} />
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
            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button
                className="bell-btn"
                onClick={handleBellClick}
                title="Notifications"
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18 }}
              >
                <FaBell />
                {unseenApprovedIds.length > 0 && (
                  <span className="badge" style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 12,
                    padding: "2px 6px",
                    borderRadius: 999
                  }}>
                    {unseenApprovedIds.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown" style={{
                  position: "absolute",
                  right: 0,
                  top: 36,
                  width: 320,
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 8px 30px rgba(15,23,42,0.12)",
                  zIndex: 60,
                  padding: 8
                }}>
                  <div className="notif-header" style={{ fontWeight: 700, padding: "8px 10px", borderBottom: "1px solid #eef2ff" }}>
                    Recent approvals
                  </div>

                  {registrations.filter(r => r.status === "Approved").length === 0 ? (
                    <div className="notif-empty" style={{ padding: 12, color: "#6b7280" }}>No approvals yet</div>
                  ) : (
                    <ul className="notif-list" style={{ listStyle: "none", padding: 8, margin: 0, maxHeight: 260, overflow: "auto" }}>
                      {registrations
                        .filter(r => r.status === "Approved")
                        .map((r) => {
                          const id = r._id || (r.eventId && r.eventId._id);
                          return (
                            <li
                              key={id || Math.random()}
                              onClick={() => goToRegistration(id)}
                              className="notif-item"
                              style={{
                                padding: "8px 10px",
                                cursor: "pointer",
                                borderRadius: 8,
                                display: "flex",
                                gap: 8,
                                alignItems: "center"
                              }}
                            >
                              <div style={{ width: 44, height: 44, overflow: "hidden", borderRadius: 8, flexShrink: 0 }}>
                                <img
                                  src={r.eventId?.image || "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"}
                                  alt={r.eventId?.title || "Event"}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </div>

                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <strong style={{ fontSize: 14 }}>{r.eventId?.title || "Untitled event"}</strong>
                                <span style={{ fontSize: 13, color: "#6b7280" }}>
                                  {r.eventId?.date ? new Date(r.eventId.date).toLocaleDateString() : "Date TBD"}
                                </span>
                              </div>

                              <div style={{ marginLeft: "auto", color: unseenApprovedIds.includes(id) ? "#ef4444" : "#10b981", fontSize: 13, fontWeight: 600 }}>
                                {unseenApprovedIds.includes(id) ? "New" : "Seen"}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="profile" onClick={toggleProfileMenu} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginLeft: 12 }}>
              <FaUserCircle className="profile-icon" />
              <div className="profile-info">
                <p className="name" style={{ margin: 0 }}>{student.name}</p>
              </div>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown" style={{ position: "absolute", right: 8, top: 62, background: "#fff", borderRadius: 10, boxShadow: "0 8px 30px rgba(15,23,42,0.12)", padding: 10, width: 220, zIndex: 50 }}>
                <p onClick={() => { setShowProfileMenu(false); navigate("/student/profile"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, margin: 0, cursor: "pointer", borderRadius: 8 }}>
                  <FaUserCircle /> View Profile
                </p>
                <p onClick={() => { setShowSettings(true); setShowProfileMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, margin: 0, cursor: "pointer", borderRadius: 8 }}>
                  <FaCog /> Settings
                </p>
                <p onClick={() => setShowLogoutModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, margin: 0, cursor: "pointer", borderRadius: 8 }}>
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
              <h2>{getGreeting()}, <span>{student?.fullName || student?.name || "Student"}</span> 👋</h2>
              <p>Welcome back — here’s a quick summary of your events.</p>
            </div>

            <div className="stats-grid center-stats" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div className="stat-card">
                <h2>{registrations.length}</h2>
                <p>Events Registered</p>
              </div>
              <div className="stat-card">
                <h2>{upcomingCount}</h2>
                <p>Upcoming Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Registrations (shows latest first) */}
        <section className="registrations-section">
          <div className="section-header">
            <h2>My Registrations</h2>
            <button
              className="view-all"
              onClick={() => navigate("/student/registrations")}
              style={{ visibility: registrations.length > 0 ? "visible" : "hidden" }}
            >
              View All
            </button>
          </div>

          <div className="registrations-grid">
            {registrations.length > 0 ? (
              registrations.slice(0, 3).map((r, i) => (
                <div key={r._id || i} className="event-card">
                  <img
                    src={r.eventId?.image || "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"}
                    alt={r.eventId?.title || "Event"}
                  />
                  <div className="event-info">
                    <h3>{r.eventId?.title || "Event Title"}</h3>
                    <p>📅 {r.eventId?.date ? new Date(r.eventId.date).toLocaleDateString() : "TBD"}</p>
                    <p>🕒 {r.eventId?.time || "TBD"}</p>
                    <p>
                      {r.status === "Approved" ? (
                        <span className="approved"><FaCheckCircle /> Approved</span>
                      ) : (
                        <span className="pending"><FaClock /> Pending</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No registrations yet.</p>
            )}
          </div>
        </section>

        {/* Upcoming Events preview */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button className="view-all" onClick={() => navigate("/student/events")}>View All</button>
          </div>

          <div className="upcoming-grid">
            {events.length > 0 ? (
              events
                .filter((ev) => ev.date)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3)
                .map((event) => {
                  const registered = isRegistered(event._id || event.id);
                  return (
                    <div key={event._id || event.id} className="upcoming-card">
                      <img src={event.image || "https://img.freepik.com/free-vector/hackathon-illustration_23-2148883451.jpg"} alt={event.title} />
                      <div className="event-info">
                        <h3>{event.title}</h3>
                        <p>📅 {event.date ? new Date(event.date).toLocaleDateString() : "TBD"}</p>
                        <p>🕒 {event.time || "TBD"}</p>
                        <button
                          className="btn"
                          onClick={() => handleRegister(event)}
                          disabled={registered}
                          style={{
                            backgroundColor: registered ? "#9ca3af" : undefined,
                            cursor: registered ? "not-allowed" : undefined,
                          }}
                        >
                          {registered ? "Registered" : "Register Now"}
                        </button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p>No upcoming events available.</p>
            )}
          </div>
        </section>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="edit-profile-modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Settings</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div><strong>Theme</strong><div style={{ fontSize: 13, color: "#6b7280" }}>Toggle dark / light mode</div></div>
              <button className="theme-toggle-btn" onClick={handleThemeToggle}>{darkMode ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}</button>
            </div>
            <div className="modal-buttons"><button className="cancel-btn" onClick={() => setShowSettings(false)}>Close</button></div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
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
