import React, { useState, useEffect } from "react";
import "../Styles/AdminDashboard.css";
import {
  FaBell,
  FaCalendarAlt,
  FaClipboardList,
  FaComments,
  FaFileAlt,
  FaHome,
  FaUserCircle,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    pendingApprovals: 0,
  });
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    college: "",
  });

  const navigate = useNavigate();

  // ✅ Check admin access and load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "admin") {
      navigate("/login");
    } else {
      setUser(storedUser);
      setEditData({
        fullName: storedUser.fullName || "",
        email: storedUser.email || "",
        college: storedUser.college || "",
      });
    }
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // ✅ Fetch dashboard data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchActivity = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/activity");
        const data = await res.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    fetchStats();
    fetchActivity();

    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Handle profile edit input
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // ✅ Save profile changes
  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditProfileOpen(false);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>College Admin</h2>
          <button className="close-btn" onClick={closeSidebar}>✕</button>
        </div>
        <ul className="sidebar-menu">
          <li className="active"><FaHome /> Dashboard</li>
          <li onClick={() => navigate("/admin/events")}><FaCalendarAlt /> Events</li>
          <li onClick={() => navigate("/admin/registrations")}><FaClipboardList /> Registrations</li>
          <li onClick={() => navigate("/admin/feedbacks")}><FaComments /> Feedback</li>
          <li onClick={() => navigate("/admin/activity")}><FaFileAlt /> Activity Log</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="left-controls">
            <button className="menu-icon" onClick={toggleSidebar}>☰</button>
          </div>

          <div className="nav-right">
            <FaBell className="icon" />
            <div className="profile" onClick={toggleDropdown}>
              <FaUserCircle className="profile-icon" />
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <p><strong>{user?.fullName || "Admin User"}</strong></p>
                  <p>{user?.college || "Your College"}</p>
                  <p className="email">{user?.email}</p>
                  <hr />
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditProfileOpen(true);
                      setDropdownOpen(false);
                    }}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Header */}
        <section className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of all events and registrations</p>
          </div>
          <button
            className="create-event-btn"
            onClick={() => navigate("/create-event")}
          >
            + Create Event
          </button>
        </section>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="card total-events">
            <p>Total Events</p>
            <h2>{stats.totalEvents}</h2>
            <h5>All time events created</h5>
          </div>
          <div className="card active-events">
            <p>Active Events</p>
            <h2>{stats.activeEvents}</h2>
            <h5>Currently open for registration</h5>
          </div>
          <div className="card registrations">
            <p>Total Registrations</p>
            <h2>{stats.totalRegistrations}</h2>
            <h5>Across all Events</h5>
          </div>
          <div className="card pending">
            <p>Pending Approvals</p>
            <h2>{stats.pendingApprovals}</h2>
            <h5>Awaiting action</h5>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="panel-container">
          <div className="panel">
            <h3>Recent Activity</h3>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.length > 0 ? (
                  activities.map((act, i) => (
                    <tr key={i}>
                      <td>{act.eventName}</td>
                      <td>{act.action}</td>
                      <td>{new Date(act.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No recent activity found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="panel quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="blue-btn">+ Create New Event</button>
              <button className="gray-btn">Review Approvals</button>
              <button className="gray-btn">Active Events</button>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ Edit Profile Modal */}
      {editProfileOpen && (
        <div className="modal-overlay" onClick={() => setEditProfileOpen(false)}>
          <div
            className="edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Profile</h3>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={editData.fullName}
              onChange={handleEditChange}
            />
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleEditChange}
            />
            <label>College</label>
            <input
              type="text"
              name="college"
              value={editData.college}
              onChange={handleEditChange}
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleSaveProfile}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditProfileOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
