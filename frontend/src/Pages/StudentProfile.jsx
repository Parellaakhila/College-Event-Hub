// src/pages/StudentProfile.jsx
import React, { useEffect, useState } from "react";
import "../Styles/StudentProfile.css";
import {
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaCalendarAlt,
  FaCog,
  FaSave,
  FaTimes,
  FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR = "/mnt/data/13969856-fc9e-41f7-852a-1bb60e029d78.png";

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [form, setForm] = useState({});
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });

  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return navigate("/login");
      const parsed = JSON.parse(stored);
      if (!parsed?.email) return navigate("/login");
      setStudent(parsed);
      setForm({
        name: parsed.fullName || parsed.name || "",
        email: parsed.email || "",
        department: parsed.department || "",
        phone: parsed.phone || "",
        year: parsed.year || "",
        bio: parsed.bio || "",
      });
    } catch (err) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleFormChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSaveProfile = () => {
    let updated = {
      ...student,
      fullName: form.name,
      name: form.name,
      email: form.email,
      department: form.department,
      phone: form.phone,
      year: form.year,
      bio: form.bio,
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updated.avatar = reader.result;
        localStorage.setItem("user", JSON.stringify(updated));
        setStudent(updated);
        setShowEditModal(false);
      };
      reader.readAsDataURL(imageFile);
    } else {
      localStorage.setItem("user", JSON.stringify(updated));
      setStudent(updated);
      setShowEditModal(false);
    }
  };

  const handleChangePassword = () => {
    if (pwdForm.newPwd !== pwdForm.confirm) return alert("Passwords do not match!");
    setShowPwdModal(false);
    setPwdForm({ current: "", newPwd: "", confirm: "" });
    alert("Password change request submitted (UI only). Hook API.");
  };

  if (!student) return <h2 style={{ padding: 20 }}>Loading profile...</h2>;

  return (
    <div className="profile-page-container">

      {/* Modern Centered Header */}
      <header className="profile-header profile-header-modern">
        <div className="profile-center-box">

          {/* Avatar Upload */}
          <div
            className="profile-avatar upload-avatar"
            onClick={() => document.getElementById("avatarUpload").click()}
          >
            <img
              src={preview || student.avatar || student.photo || DEFAULT_AVATAR}
              alt="avatar"
              onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
            />
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          {/* Details */}
          <h2 className="profile-name">{student.fullName || student.name}</h2>
          <p className="profile-email">{student.email}</p>

          <div className="profile-mini-details">
            <span><FaUniversity /> {student.department || "Department not set"}</span>
            <span><FaCalendarAlt /> {student.year || "Year not set"}</span>
          </div>

          {/* Buttons */}
          <div className="profile-action-buttons">
            <button className="btn" onClick={() => setShowEditModal(true)}>
              <FaEdit /> Edit Profile
            </button>
            <button className="btn outline" onClick={() => setShowPwdModal(true)}>
              <FaLock /> Change Password
            </button>
          </div>

        </div>
      </header>

      {/* Details Cards */}
      <section className="profile-grid page-inner container-grid">

        <div className="card">
          <h3>Contact</h3>
          <div className="card-body">
            <div className="info-row"><FaEnvelope className="icon" /> <strong>Email:</strong> <span>{student.email}</span></div>
            <div className="info-row"><FaPhone className="icon" /> <strong>Phone:</strong> <span>{student.phone || "—"}</span></div>
            <div className="info-row"><FaUniversity className="icon" /> <strong>Department:</strong> <span>{student.department || "—"}</span></div>
          </div>
        </div>

        <div className="card">
          <h3>Academic</h3>
          <div className="card-body">
            <div className="info-row"><FaCalendarAlt className="icon" /> <strong>Year / Batch:</strong> <span>{student.year || "—"}</span></div>
            <div className="info-row"><FaCog className="icon" /> <strong>Role:</strong> <span>{student.role || "Student"}</span></div>
          </div>
        </div>

        <div className="card full-width">
          <h3>About</h3>
          <div className="card-body">
            <p className="muted">{student.bio || "No bio — edit your profile to add one."}</p>
          </div>
        </div>

      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="icon-btn" onClick={() => setShowEditModal(false)}><FaTimes /></button>
            </div>

            <div className="modal-body">
              <label>Name<input value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} /></label>
              <label>Email<input value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} /></label>
              <label>Department<input value={form.department} onChange={(e) => handleFormChange("department", e.target.value)} /></label>
              <label>Phone<input value={form.phone} onChange={(e) => handleFormChange("phone", e.target.value)} /></label>
              <label>Year<input value={form.year} onChange={(e) => handleFormChange("year", e.target.value)} /></label>
              <label>Bio<textarea rows={3} value={form.bio} onChange={(e) => handleFormChange("bio", e.target.value)} /></label>
            </div>

            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn" onClick={handleSaveProfile}><FaSave /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPwdModal && (
        <div className="modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="modal edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="icon-btn" onClick={() => setShowPwdModal(false)}><FaTimes /></button>
            </div>

            <div className="modal-body">
              <label>Current Password<input type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} /></label>
              <label>New Password<input type="password" value={pwdForm.newPwd} onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })} /></label>
              <label>Confirm Password<input type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} /></label>
            </div>

            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowPwdModal(false)}>Cancel</button>
              <button className="btn" onClick={handleChangePassword}><FaSave /> Change</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProfile;
