// src/pages/StudentLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import "../Styles/StudentLayout.css";

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
 const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
 
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Profile dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // ================== LOAD THEME ==================
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



  const handleBellClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    setUnread(0);
  };

  // Close profile menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`layout-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      
      {/* ================== SIDEBAR ================== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>🎓 EventHub</h2>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard">🏠 Dashboard</NavLink>
          <NavLink to="/student/events">📋 Explore Events</NavLink>
          <NavLink to="/student/registrations">📅 My Registrations</NavLink>
          <NavLink to="/student/profile">👤 Profile</NavLink>
        </nav>
      </aside>

      {/* ================== MAIN CONTENT ================== */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        
        {/* ================== NAVBAR ================== */}
        <header className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <h1 className="logo">Student Portal</h1>
          </div>

          {/* Search */}
          <div className="nav-center">
            <div className="search-bar">
              <FaSearch />
              <input type="text" placeholder="Search..." />
            </div>
          </div>

          {/* Right Section */}
          <div className="nav-right" ref={profileRef}>
            
            {/* Theme Toggle */}
            <div className="theme-switch" onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            {/* Notifications */}
            <div className="bell-btn" onClick={handleBellClick}>
              <FaBell />
              {unread > 0 && <span className="badge">{unread}</span>}
            </div>

            {/* Profile */}
            <div className="profile-icon" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <FaUserCircle />
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="profile-dropdown">
                <p onClick={() => navigate("/student/profile")}><FaUserCircle /> Profile</p>
                <p onClick={() => navigate("/student/settings")}><FaCog /> Settings</p>
                <p onClick={handleLogout}><FaSignOutAlt /> Logout</p>
              </div>
            )}
          </div>
        </header>

        {/* ================== NOTIFICATION DROPDOWN ================== */}
        {showNotifDropdown && (
          <div className="notifications-dropdown">
            <h4>Notifications</h4>
            <ul className="notif-list">
              {notifications.map((n) => (
                <li key={n.id} className="notif-item">
                  <p>{n.text}</p>
                  <small>{n.time}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
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
        {/* RENDER CHILD PAGES */}
        <div className="content-area">
          {children}
        </div>

      </div>
    </div>
  );
};

export default StudentLayout;
