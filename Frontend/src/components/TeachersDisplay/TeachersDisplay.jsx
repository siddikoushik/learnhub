import React, { useEffect, useState, useContext } from "react";
import "./TeachersDisplay.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios';

const TeachersDisplay = () => {
  const { url, user, token, setUser } = useContext(AuthContext); // Get setUser to sync state
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  const [appointments, setAppointments] = useState([]);

  // Load Availability and Bookings on Mount
  useEffect(() => {
    if (user && user._id) {
      // Ideally we fetch fresh data to avoid stale localStorage issues
      fetchProfile();
      fetchBookings();
    }
  }, [user?._id]); // Depend on ID safely

  if (!user) {
    return <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>Loading Dashboard...</div>;
  }

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${url}/api/booking/teacher/${user._id}`);
      if (res.data.success) {
        // 1. DEDUPLICATE ALL SESSIONS (Show everything to fix "Not Working" issue)
        // Ensure we handle status display in UI instead of filtering data out entirely
        const uniqueSessions = [];
        const seenTimes = new Set();

        res.data.bookings.forEach(session => {
          if (!seenTimes.has(session.timeSlot)) {
            seenTimes.add(session.timeSlot);
            uniqueSessions.push(session);
          }
        });

        setAppointments(uniqueSessions);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const freshUser = res.data.user;
        // Update context if data changed (avoid loop if possible, but simpler here)
        // We mainly want availability
        if (freshUser.availability) {
          setAvailability(freshUser.availability);
          // Check if we need to sync context
          // setUser(freshUser); // Optional: might cause re-render loop if not careful.
          // For now, setting local state is enough for "Active Slots" to show up.
        }
      }
    } catch (error) {
      console.error("Fetch Profile Error:", error);
    }
  };

  const handleAvailability = async (action, timeSlot, subjectVal) => {
    // ... existing handleAvailability logic
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setAvailability(data.availability);
        // SYNC CONTEXT
        setUser({ ...user, availability: data.availability });
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

  // Mock Stats (Keep these for visual appeal or update with real data later)
  const mockStats = [
    { label: "Upcoming Sessions", value: appointments.length.toString(), icon: "📅" },
    { label: "Total Earnings", value: "$450", icon: "💰" },
    { label: "Students Met", value: "12", icon: "👥" },
    { label: "Rating", value: "4.9", icon: "⭐" },
  ];

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;

    try {
      const { data } = await axios.delete(`${url}/api/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        alert("Session Cancelled");
        // Optimistic Update: Remove directly from list
        setAppointments(prev => prev.filter(appt => appt._id !== bookingId));
        fetchProfile(); // Refresh slots availability
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Cancellation Error:", error);
      alert("Failed to cancel session");
    }
  };

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

            <div className="time-range-inputs">
              <select id="fromTime">
                <option value="">From</option>
                {["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span>to</span>
              <select id="toTime">
                <option value="">To</option>
                {["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              className="btn-primary"
              disabled={loading}
              onClick={() => {
                const subj = document.getElementById('subjectInput').value;
                const start = document.getElementById('fromTime').value;
                const end = document.getElementById('toTime').value;

                if (!subj) return alert("Enter a subject");
                if (!start || !end) return alert("Select both Start and End time");
                if (!user || !user._id) return alert("Please login again to add slots.");

                // Generate Slots Logic
                const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];
                const startIndex = times.indexOf(start);
                const endIndex = times.indexOf(end);

                if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
                  return alert("Invalid Time Range (Start must be before End)");
                }

                // Slice the array to get range (e.g. 5pm to 8pm -> [5pm, 6pm, 7pm])
                // Note: If user selects 5 to 9, they likely mean sessions at 5,6,7,8. 
                // So we allow up to endIndex - 1 if we treat 'end' as closing time.
                // Let's assume inclusive start, exclusive end for sessions.
                const selectedSlots = times.slice(startIndex, endIndex);

                handleAvailability('add', selectedSlots, subj);
              }}
            >
              {loading ? "Generating..." : "+ Add Range"}
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
                {appointments.length > 0 ? (
                  appointments.map((session) => (
                    <tr key={session._id}>
                      <td data-label="Student Name"><span className="course-title-cell">{session.studentId?.name || "Student"}</span></td>
                      <td data-label="Subject">{user?.subject || "Session"}</td>
                      <td data-label="Time">{session.timeSlot}</td>
                      <td data-label="Status"><span className="status-badge active">{session.status || "Confirmed"}</span></td>
                      <td data-label="Action">
                        <button
                          className="btn-secondary btn-sm"
                          style={{ marginRight: '10px' }}
                          onClick={() => navigate(`/classroom/${session._id}`, {
                            state: { studentId: session.studentId?._id }
                          })}
                        >
                          Join Call
                        </button>
                        <button
                          className="btn-secondary btn-sm"
                          style={{ background: '#ef4444', color: 'white', border: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent row click
                            cancelBooking(session._id);
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No upcoming sessions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeachersDisplay;
