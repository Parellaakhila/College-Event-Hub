import React, { useState, useEffect } from "react";
import { FaBell, FaEdit, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../Styles/AdminLayout.css";

const AdminLayout = ({
  children,
  currentPath,
  onNavigate,
  updateUser = () => {},
  onLogout = () => {},
}) => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  // ✅ Load user from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser)
      : { fullName: "Admin", email: "", college: "" };
  });

  const [editData, setEditData] = useState({
    fullName: user.fullName,
    email: user.email,
    college: user.college,
  });

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Notifications toggle
  const toggleNotif = () => setNotifOpen(!notifOpen);

  // Profile dropdown toggle
  const toggleProfile = () => setProfileOpen(!profileOpen);

  // Edit Profile handlers
  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSaveProfile = () => {
    setUser(editData);
    localStorage.setItem("user", JSON.stringify(editData));
    updateUser(editData);
    setEditProfileOpen(false);
  };

  // Logout handlers
  const handleLogout = () => setLogoutConfirmOpen(true);
  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    localStorage.removeItem("user");
    onLogout();
    navigate("/login");
  };
  const cancelLogout = () => setLogoutConfirmOpen(false);

  // ✅ Fetch pending registrations every 10 seconds
  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/registrations/pending"
        );

        if (!res.ok) {
          console.error("❌ Failed to fetch notifications:", res.status);
          if (mounted) {
            setNotifications([]);
            setNotifCount(0);
          }
          return;
        }

        const data = await res.json();

        if (mounted) {
          setNotifications(data);
          setNotifCount(data.length);
        }
      } catch (err) {
        console.error("[AdminLayout] Error fetching notifications:", err);
        if (mounted) {
          setNotifications([]);
          setNotifCount(0);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleNotifClick = () => {
    setNotifOpen(false);
    navigate("/admin/registrations");
  };

  // ✅ Generate gradient avatar for username
  const getGradient = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 65%, 55%), hsl(${hue2}, 65%, 55%))`;
  };

  const userInitial = user.fullName.charAt(0).toUpperCase();

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        onNavigate={onNavigate}
        currentPath={currentPath}
      />
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <main className="main-content">
        <header className="topbar">
          <div className="left-controls">
            <button className="menu-icon" onClick={toggleSidebar}>
              ☰
            </button>
          </div>

          <div className="right-controls">
            {/* 🔔 Notifications */}
            <div className="notification" onClick={toggleNotif}>
              <FaBell size={20} />
              {notifCount > 0 && <span className="notif-count">{notifCount}</span>}
              {notifOpen && (
                <div className="notif-dropdown">
                  {notifCount > 0 ? (
                    <>
                      {notifications.map((notif, i) => (
                        <div
                          key={i}
                          className="notif-item"
                          onClick={handleNotifClick}
                        >
                          <strong>{notif.studentName}</strong> registered for{" "}
                          <strong>{notif.eventName}</strong>
                          <br />
                          <small>
                            {new Date(notif.timestamp).toLocaleString()}
                          </small>
                        </div>
                      ))}
                      <div
                        className="view-all"
                        onClick={handleNotifClick}
                        style={{
                          textAlign: "center",
                          padding: "8px",
                          cursor: "pointer",
                          color: "#0757db",
                          fontWeight: "bold",
                        }}
                      >
                        View All Pending Approvals →
                      </div>
                    </>
                  ) : (
                    <div>No new notifications</div>
                  )}
                </div>
              )}
            </div>

            {/* 👤 Profile */}
            <div className="profile" onClick={toggleProfile}>
              <div
                className="profile-avatar"
                style={{ background: getGradient(user.fullName) }}
              >
                {userInitial}
              </div>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <h4>{user.fullName}</h4>
                    <p>{user.college || "College Admin"}</p>
                    <p className="email">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditProfileOpen(true);
                      setProfileOpen(false);
                      setEditData(user);
                    }}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {children}

        {/* ✏️ Edit Profile Modal */}
        {editProfileOpen && (
          <div
            className="modal-overlay"
            onClick={() => setEditProfileOpen(false)}
          >
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

        {/* 🚪 Logout Confirmation Modal */}
        {logoutConfirmOpen && (
          <div className="modal-overlay" onClick={cancelLogout}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="modal-buttons">
                <button className="save-btn" onClick={confirmLogout}>
                  Yes, Logout
                </button>
                <button className="cancel-btn" onClick={cancelLogout}>
                  No, Stay
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
