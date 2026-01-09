import React, { useEffect, useState, useContext } from "react";
import "./TeachersDisplay.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios';

const TeachersDisplay = () => {
  const { url, user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Availability on Mount
  useEffect(() => {
    if (user && user.availability) {
      setAvailability(user.availability);
      // Also fetch fresh profile to be sure
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // We use the booking/tutors endpoint or similar, or just rely on user context if it's updated.
      // For now, let's assume valid user context context updates.
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvailability = async (action, timeSlot, subjectVal) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${url}/api/teacher/availability`,
        {
          userId: user._id,
          action,
          time: timeSlot,
          subject: subjectVal
        },
        { headers: { Authorization: `Bearer ${token}` } } // Correct Header Format
      );

      if (data.success) {
        setAvailability(data.availability);
        alert(action === 'add' ? "Slot Added!" : "Slot Removed!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  // Mock Stats (Keep these for visual appeal)
  const mockStats = [
    { label: "Upcoming Sessions", value: "3", icon: "📅" },
    { label: "Total Earnings", value: "$450", icon: "💰" },
    { label: "Students Met", value: "12", icon: "👥" },
    { label: "Rating", value: "4.9", icon: "⭐" },
  ];

  const upcomingSessions = [
    { id: 1, student: "John Doe", subject: user?.subject || "Maths", time: "Today, 7 PM", status: "Confirmed" },
  ];

  return (
    <motion.div
      className="dashboard-container container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard 🎓</h1>
          <p>Welcome, {user?.name || "Teacher"}. Manage your slots below.</p>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="stats-cards">
        {mockStats.map((stat, index) => (
          <div className="card stat-card" key={index}>
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AVAILABILITY SECTION - WORKING REAL */}
      <div className="availability-section">
        <h2 className="section-title">Manage Availability 🗓️</h2>
        <div className="availability-container card">
          <div className="add-slot-form">
            <input
              type="text"
              placeholder="Your Subject (e.g. Maths)"
              id="subjectInput"
              defaultValue={user?.subject || ""}
            />
            <select id="timeInput">
              <option value="9:00 AM">9:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="1:00 PM">1:00 PM</option>
              <option value="2:00 PM">2:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
              <option value="4:00 PM">4:00 PM</option>
              <option value="5:00 PM">5:00 PM</option>
              <option value="6:00 PM">6:00 PM</option>
              <option value="7:00 PM">7:00 PM</option>
              <option value="8:00 PM">8:00 PM</option>
            </select>
            <button
              className="btn-primary"
              disabled={loading}
              onClick={() => {
                const subj = document.getElementById('subjectInput').value;
                const time = document.getElementById('timeInput').value;
                if (!subj) return alert("Enter a subject");
                if (!user || !user._id) return alert("Please login again to add slots.");
                handleAvailability('add', time, subj);
              }}
            >
              {loading ? "Saving..." : "+ Add Slot"}
            </button>
          </div>

          <div className="current-slots">
            <h4>Your Active Slots</h4>
            {availability.length > 0 ? (
              availability.map((slot, idx) => (
                <div className="slot-item" key={idx}>
                  <span>
                    <strong>{user.subject || "Session"}</strong> • {slot.time}
                    {slot.isBooked && <span className="booked-badge-mini"> (Booked)</span>}
                  </span>
                  <button
                    className="btn-icon"
                    onClick={() => handleAvailability('remove', slot.time)}
                  >
                    🗑️
                  </button>
                </div>
              ))
            ) : (
              <p className="no-results">No slots added yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid-teacher">
        <div className="main-content">
          <h2 className="section-title">Upcoming Sessions</h2>
          <div className="card table-card">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session) => (
                  <tr key={session.id}>
                    <td><span className="course-title-cell">{session.student}</span></td>
                    <td>{session.subject}</td>
                    <td>{session.time}</td>
                    <td><span className="status-badge active">{session.status}</span></td>
                    <td><button className="btn-secondary btn-sm">Join Call</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeachersDisplay;
