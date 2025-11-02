import React, { useEffect, useState } from "react";
import "../Styles/ActivityLog.css";

const ActivityLogPage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const res = await fetch("http://localhost:5000/api/admin/activity");
      const data = await res.json();
      setActivities(data);
    };
    fetchActivity();
  }, []);

  return (
    <div className="activity-log-container">
      <h2>Activity Log</h2>
      <table>
        <thead>
          <tr>
            <th>Event</th>
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
              <td colSpan="3">No activity found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogPage;
