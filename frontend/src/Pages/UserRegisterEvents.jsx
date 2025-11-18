// src/Pages/UserRegisterEvents.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import "../Styles/EventsPage.css";
import {
  FaClock,
  FaCheckCircle,
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaCalendarAlt,
  FaCog,
  FaMoon,
  FaSun,
  FaSearch,
  FaTrash,
  FaCommentDots,
  FaClipboardList,
} from "react-icons/fa";

const UserRegisterEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [student, setStudent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const location = useLocation();

  // Load student info
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

  // Load dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Fetch student registrations
  useEffect(() => {
    if (!student?.email) return;
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/registrations/student/${student.email}`
        );
        const data = await res.json();
        setRegistrations(data.registrations || []);
      } catch (err) {
        console.error("Error fetching registrations:", err);
      }
    };
    fetchRegistrations();
  }, [student?.email]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const toggleProfileMenu = () => setShowProfileMenu((s) => !s);

  // Theme toggle
  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("dark", next);
  };

  // Delete registration with confirmation modal
  const confirmDelete = (id) => {
    setRegistrationToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!registrationToDelete) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/${registrationToDelete}`,
        { method: "DELETE" }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        data = { success: res.ok, message: res.statusText };
      }

      if (res.ok && data.success) {
        setRegistrations((prev) => prev.filter((r) => r._id !== registrationToDelete));
        alert("Registration deleted successfully!");
      } else {
        alert(data.message || "Failed to delete registration.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting registration.");
    } finally {
      setDeleteModalOpen(false);
      setRegistrationToDelete(null);
    }
  };

  // Feedback handler (navigate to feedback page)
  const handleFeedback = (eventId) => {
    navigate(`/student/feedback/${eventId}`);
  };

  if (!student) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
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
          <NavLink
            to="/student-dashboard"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            end
          >
            <FaHome style={{ marginRight: 10 }} /> Dashboard
          </NavLink>

          <NavLink
            to="/student/events"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <FaClipboardList style={{ marginRight: 10 }} /> Explore Events
          </NavLink>

          <NavLink
            to="/student/my-events"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <FaCalendarAlt style={{ marginRight: 10 }} /> My Registrations
          </NavLink>

          <NavLink
            to="/student/profile"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <FaUserCircle style={{ marginRight: 10 }} /> Profile
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`main-content ${sidebarOpen ? "shifted" : ""}`}
        /* inline fallback so content doesn't sit under the fixed sidebar */
        style={{ marginLeft: sidebarOpen ? 250 : undefined }}
      >
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={toggleSidebar} />
            <h1 className="logo">My Registered Events</h1>
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
            <FaBell className="icon" />
            <div className="profile" onClick={toggleProfileMenu}>
              <FaUserCircle className="profile-icon" />
              <div className="profile-info">
                <p className="name">{student.name}</p>
              </div>
            </div>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <p
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/student/profile");
                  }}
                >
                  <FaUserCircle /> View Profile
                </p>
                <p
                  onClick={() => {
                    setShowSettings(true);
                    setShowProfileMenu(false);
                  }}
                >
                  <FaCog /> Settings
                </p>
                <p onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Registered Events */}
        <div className="events-grid" style={{ marginLeft: 20 }}>
          {registrations.length > 0 ? (
            registrations.map((r, i) => (
              <div key={i} className="event-card">
                <img
                  src={
                    r.eventId?.image ||
                    "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
                  }
                  alt={r.eventId?.title || "Event"}
                />
                <div className="event-info">
                  <h3>{r.eventId?.title || "Event Title"}</h3>
                  <p>📅 {r.eventId?.date || "TBD"}</p>
                  <p>🕒 {r.eventId?.time || "TBD"}</p>
                  <p>
                    {r.status === "Approved" ? (
                      <span style={{ color: "green", fontWeight: 500 }}>
                        <FaCheckCircle /> Approved
                      </span>
                    ) : (
                      <span style={{ color: "#d97706", fontWeight: 500 }}>
                        <FaClock /> Pending Approval
                      </span>
                    )}
                  </p>

                  {/* Buttons row */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <button
                      className="delete-btn"
                      onClick={() => confirmDelete(r._id)}
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <FaTrash /> Delete
                    </button>

                    <button
                      className="feedback-btn"
                      onClick={() => handleFeedback(r.eventId?._id)}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <FaCommentDots /> Feedback
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-events">You haven’t registered for any events yet.</p>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="edit-profile-modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Settings</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div>
                <strong>Theme</strong>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Toggle dark / light mode</div>
              </div>
              <button className="theme-toggle-btn" onClick={handleThemeToggle}>
                {darkMode ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}
              </button>
            </div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="edit-profile-modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this registration?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="cancel-btn" onClick={() => setDeleteModalOpen(false)}>No</button>
              <button className="delete-btn" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRegisterEvents;
