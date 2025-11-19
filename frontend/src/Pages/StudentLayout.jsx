// src/Pages/StudentLayout.jsx
import React, { useState, useEffect, createContext } from "react";
import { NavLink } from "react-router-dom";
import "../Styles/StudentLayout.css";
import { FaBars, FaHome, FaClipboardList, FaCalendarAlt, FaUserCircle } from "react-icons/fa";

export const LayoutContext = createContext(); // CONTEXT CREATED

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load saved sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved === "false") setSidebarOpen(false);
  }, []);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
  }, [sidebarOpen]);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className={`layout-container ${sidebarOpen ? "sidebar-open" : ""}`}>

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2>🎓 EventHub</h2>

            {/* SIDEBAR TOGGLE */}
            <FaBars
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>

          <nav className="sidebar-menu">
            <NavLink to="/student-dashboard">
              <FaHome /> Dashboard
            </NavLink>

            <NavLink to="/student/events">
              <FaClipboardList /> Explore Events
            </NavLink>

            <NavLink to="/student/registrations">
              <FaCalendarAlt /> My Registrations
            </NavLink>

            <NavLink to="/student/profile">
              <FaUserCircle /> Profile
            </NavLink>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
          {children}
        </main>

      </div>
    </LayoutContext.Provider>
  );
};

export default StudentLayout;
