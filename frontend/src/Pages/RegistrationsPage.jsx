import React, { useEffect, useState } from "react";
import "../Styles/Registrations.css";

const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      const res = await fetch("http://localhost:5000/api/admin/registrations");
      const data = await res.json();
      setRegistrations(data);
    };
    fetchRegistrations();
  }, []);

  return (
    <div className="registrations-container">
      <h2>Registrations</h2>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Student</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length > 0 ? (
            registrations.map((reg) => (
              <tr key={reg._id}>
                <td>{reg.eventId?.title}</td>
                <td>{reg.studentName}</td>
                <td>{reg.studentEmail}</td>
                <td>{reg.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No registrations found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RegistrationsPage;
