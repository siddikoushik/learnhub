import React, { useEffect, useState, useContext } from "react";
import "./TeachersDisplay.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios';
import RatingModal from "../RatingModal/RatingModal";

const TeachersDisplay = () => {
  const { url, user, token, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      fetchProfile();
      fetchBookings();
    }
  }, [user?._id]);

  if (!user) {
    return <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>Loading Dashboard...</div>;
  }

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${url}/api/booking/teacher/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAppointments(res.data.bookings);
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
        setUser(prev => ({ ...prev, ...freshUser })); // Sync global state
        if (freshUser.availability) {
          setAvailability(freshUser.availability);
        }
      }
    } catch (error) {
      console.error("Fetch Profile Error:", error);
    }
  };

  const handleAvailability = async (action, timeSlot, subjectVal, priceVal, classRangeVal) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${url}/api/teacher/availability`,
        {
          userId: user._id,
          action,
          time: timeSlot,
          subject: subjectVal,
          price: priceVal,
          classRange: classRangeVal
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setAvailability(data.availability);
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

  const totalEarnings = appointments
    .filter(appt => appt.paymentStatus === 'Paid')
    .reduce((sum, appt) => sum + (appt.teacherId?.price || 500), 0);

  const stats = [
    { label: "Upcoming Sessions", value: appointments.length.toString(), icon: "📅" },
    { label: "Total Earnings", value: `₹${totalEarnings}`, icon: "💰" },
    { label: "Students Met", value: appointments.filter(a => a.status === 'Completed').length.toString(), icon: "👥" },
    { label: "Rating", value: user?.totalRatings > 0 ? user.averageRating.toFixed(1) : "N/A", icon: "⭐" },
  ];

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      const { data } = await axios.delete(`${url}/api/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        alert("Session Deleted");
        fetchBookings();
      }
    } catch (err) {
      alert("Failed to cancel");
    }
  };

  const approvePayment = async (bookingId) => {
    if (!window.confirm("Approve this payment?")) return;
    try {
      const { data } = await axios.put(`${url}/api/booking/${bookingId}/approve-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        alert("Payment Approved!");
        fetchBookings();
      }
    } catch (err) {
      alert("Failed to approve");
    }
  };

  const rejectPayment = async (bookingId) => {
    if (!window.confirm("Reject this payment? The student will need to re-submit proof.")) return;
    try {
      const { data } = await axios.put(`${url}/api/booking/${bookingId}/reject-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        alert("Payment Rejected.");
        fetchBookings();
      }
    } catch (err) {
      alert("Failed to reject");
    }
  };

  const handleZoomUpdate = async (bookingId, link) => {
    try {
      await axios.put(`${url}/api/booking/${bookingId}/zoom`, { zoomLink: link }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Silent refresh for better UX
      fetchBookings();
    } catch (err) {
      console.error("Zoom update failed:", err);
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

      <div className="stats-cards">
        {stats.map((stat, index) => (
          <motion.div 
            className="card stat-card" 
            key={index}
            whileHover={{ translateY: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="stat-icon-wrapper">
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="availability-section">
        <h2 className="section-title">Manage Availability 🗓️</h2>
        <div className="availability-container card">
          <div className="add-slot-form">
            <input
              type="text"
              placeholder="Subject (e.g. Maths)"
              id="subjectInput"
              defaultValue={user?.subject || ""}
              style={{ flex: '1.5' }}
            />
            <input
              type="text"
              placeholder="Class Range (5-10)"
              id="classRangeInput"
              defaultValue={user?.classRange || ""}
              style={{ flex: '1' }}
            />
            <input
              type="number"
              placeholder="Price (₹)"
              id="priceInput"
              defaultValue={user?.price || ""}
              style={{ flex: '0.8' }}
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
                const crange = document.getElementById('classRangeInput').value;
                const price = document.getElementById('priceInput').value;
                const start = document.getElementById('fromTime').value;
                const end = document.getElementById('toTime').value;

                if (!subj) return alert("Enter a subject");
                if (!crange) return alert("Enter class range");
                if (!price) return alert("Enter price");
                if (!start || !end) return alert("Select both Start and End time");

                const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];
                const startIndex = times.indexOf(start);
                const endIndex = times.indexOf(end);

                if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
                  return alert("Invalid Time Range");
                }
                const selectedSlots = times.slice(startIndex, endIndex);
                
                // Duplicate check
                const existingTimes = availability.map(s => s.time);
                const duplicates = selectedSlots.filter(t => existingTimes.includes(t));
                
                if (duplicates.length === selectedSlots.length) {
                  return alert("All selected time slots are already in your schedule!");
                }
                
                if (duplicates.length > 0) {
                  const proceed = window.confirm(`${duplicates.length} slot(s) already exist and will be skipped. Continue?`);
                  if (!proceed) return;
                }

                handleAvailability('add', selectedSlots, subj, price, crange);
              }}
            >
              {loading ? "Generating..." : "+ Add Range"}
            </button>
          </div>

          <div className="current-slots">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4>Your Active Slots</h4>
              {availability.length > 0 && (
                <button 
                  className="btn-text btn-sm" 
                  style={{ color: '#ef4444', fontSize: '0.8rem' }}
                  onClick={() => {
                    if (window.confirm("Remove all availability slots?")) {
                      handleAvailability('clear_all');
                    }
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
            {availability.length > 0 ? (
              availability.map((slot, idx) => (
                <div className="slot-item" key={idx}>
                  <span><strong>{user.subject || "Session"}</strong> • {slot.time}</span>
                  <button className="btn-icon" onClick={() => handleAvailability('remove', slot.time)}>🗑️</button>
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
          <div className="card table-card premium-table-wrapper">
            <div className="table-responsive">
              <table className="courses-table modern-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Subject & Time</th>
                    <th>Zoom Details</th>
                    <th>Payment</th>
                    <th>Verification</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((session) => (
                      <motion.tr 
                        key={session._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td data-label="Student">
                          <div className="student-cell">
                            <div className="student-avatar">{session.studentId?.name?.charAt(0) || "S"}</div>
                            <div className="student-info">
                              <span className="student-name">{session.studentId?.name || "Student"}</span>
                              <span className="student-email">{session.studentId?.email || ""}</span>
                            </div>
                          </div>
                        </td>
                        <td data-label="Subject & Time">
                          <div className="subject-time-cell">
                            <span className="subject-tag-mini">{session.teacherId?.subject || user?.subject || "N/A"}</span>
                            <span className="time-display">🕒 {session.timeSlot}</span>
                          </div>
                        </td>
                        <td data-label="Zoom Link">
                          <div className="zoom-cell">
                            <input
                              type="text"
                              className="zoom-inline-input"
                              placeholder="Paste Zoom link..."
                              defaultValue={session.zoomLink || ""}
                              onBlur={(e) => handleZoomUpdate(session._id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleZoomUpdate(session._id, e.target.value);
                              }}
                            />
                            {session.zoomLink && (
                              <button 
                                className="btn-link-icon" 
                                onClick={() => window.open(session.zoomLink, '_blank')}
                                title="Open Link"
                              >
                                🔗
                              </button>
                            )}
                          </div>
                        </td>
                        <td data-label="Payment">
                          <div className="payment-cell">
                            <span className="amount-text">₹{session.teacherId?.price || user?.price || "—"}</span>
                            <span className={`status-badge ${
                              session.paymentStatus === 'Paid' ? 'active' : 
                              session.paymentStatus === 'Under Review' ? 'review' : 
                              session.paymentStatus === 'Failed' ? 'failed' : 'pending'
                            }`}>
                              {session.paymentStatus || "Pending"}
                            </span>
                          </div>
                        </td>
                        <td data-label="Verification">
                          <div className="proof-cell">
                            {session.paymentScreenshot ? (
                              <button
                                className="btn-proof-view"
                                onClick={() => {
                                  const imgUrl = session.paymentScreenshot.startsWith('/images')
                                    ? `${url}${session.paymentScreenshot}`
                                    : `${url}/images/${session.paymentScreenshot}`;
                                  window.open(imgUrl, '_blank');
                                }}
                              >
                                📄 View Proof
                              </button>
                            ) : (
                              <span className="no-proof">Waiting...</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Action" className="text-right">
                          <div className="action-buttons-group">
                            {session.paymentStatus === 'Under Review' && (
                              <div className="verification-actions">
                                <button className="btn-action approve" onClick={() => approvePayment(session._id)} title="Approve">✅</button>
                                <button className="btn-action reject" onClick={() => rejectPayment(session._id)} title="Reject">❌</button>
                              </div>
                            )}
                            <button
                              className="btn-main-action"
                              disabled={session.paymentStatus !== 'Paid'}
                              onClick={() => {
                                if (session.zoomLink) window.open(session.zoomLink, '_blank');
                                else navigate(`/classroom/${session._id}`);
                              }}
                            >
                              {session.zoomLink ? "Start Zoom" : "Join Class"}
                            </button>
                            <button 
                              className="btn-secondary-action" 
                              disabled={session.paymentStatus !== 'Paid'}
                              onClick={() => setSelectedBookingForRating(session)}
                            >
                              {session.ratingToTeacher && session.ratingToStudent ? "⭐ View" : "⭐ Rate"}
                            </button>
                            <button className="btn-delete-session" onClick={() => cancelBooking(session._id)}>🗑️</button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="empty-row">No sessions found. Start by adding availability!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {selectedBookingForRating && (
        <RatingModal 
          booking={selectedBookingForRating} 
          onClose={() => setSelectedBookingForRating(null)} 
          onRatingSuccess={fetchBookings}
        />
      )}
    </motion.div>
  );
};

export default TeachersDisplay;
