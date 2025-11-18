import React, { useEffect, useState } from "react";
import "../Styles/Registrations.css";
import AdminLayout from "../Pages/AdminLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRegistrations();
  }, [location.pathname]); // ✅ listen to path changes

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/registrations");
      const data = await res.json();
      setRegistrations(data.registrations || data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setRegistrations([]);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();

      if (data.success) {
        fetchRegistrations();
        if (status === "Approved") {
          toast.success("Registration approved successfully!");
        } else if (status === "Rejected") {
          toast.error("❌ Registration rejected!");
        }
      } else {
        toast.warn(data.message || "⚠️ Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("❌ Failed to update status");
    }
  };

  return (
    <AdminLayout currentPath={location.pathname} onNavigate={(p) => navigate(p)}>
      <div className="panel">
        <h3>Registrations</h3>
        <div className="table-wrapper">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length > 0 ? (
                registrations.map((reg) => (
                  <tr key={reg._id}>
                    <td data-label="Event">
                      {reg.eventId?.title || reg.eventId || "N/A"}
                    </td>
                    <td data-label="Student">{reg.studentName}</td>
                    <td data-label="Email">{reg.studentEmail}</td>
                    <td data-label="Status">{reg.status}</td>
                    <td data-label="Actions">
                      {reg.status === "Pending" ? (
                        <div className="action-buttons">
                          <button
                            className="approve-btn"
                            onClick={() => updateStatus(reg._id, "Approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => updateStatus(reg._id, "Rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`status-${reg.status.toLowerCase()}`}
                        >
                          {reg.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No registrations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </AdminLayout>
  );
};

export default RegistrationsPage;
