import React, { useEffect, useState, useContext } from "react";
import "./StudentsDashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RatingModal from "../RatingModal/RatingModal";
import axios from "axios";

const StudentsDashboard = () => {
  const { url, user, token, setLogin } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTutorId, setExpandedTutorId] = useState(null);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    // Small timeout to allow Context to restore user from localStorage
    const timer = setTimeout(() => {
      if (!user) {
        alert("You must be logged in to view the dashboard.");
        navigate('/');
        // If setLogin is available in context (it's passed to Navbar but maybe not Context value?)
        // setLogin(true); 
        // Checking AuthContext value... passed props might not be in value.
        // Let's just redirect for now.
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  // Real Tutors Data from API
  const [availableTutors, setAvailableTutors] = useState([]);

  // Mock Available Tutors for Fallback (Demo Mode)
  const MOCK_TUTORS = [
    {
      _id: "101",
      name: "Dr. Alan Grant",
      subject: "Maths M1",
      rating: 4.9,
      image: "👨‍🏫",
      slots: [
        { time: "7:00 PM", status: "free" },
        { time: "8:00 PM", status: "booked" },
        { time: "9:00 PM", status: "free" }
      ]
    },
    {
      _id: "102",
      name: "Prof. Ellie Sattler",
      subject: "Physics",
      rating: 4.8,
      image: "👩‍🔬",
      slots: [
        { time: "6:00 PM", status: "free" },
        { time: "7:00 PM", status: "free" }
      ]
    },
    {
      _id: "103",
      name: "Ian Malcolm",
      subject: "Chaos Theory",
      rating: 5.0,
      image: "🦖",
      slots: [
        { time: "8:00 PM", status: "booked" },
        { time: "9:00 PM", status: "booked" }
      ]
    },
  ];

  // State for Bookings
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchTutors();
    if (user && user._id) {
      fetchBookings();
    }
  }, [url, user]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${url}/api/booking/student/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // 1. Deduplicate bookings by Time Slot + Teacher to clean up legacy double-bookings
        // (Assuming user only wants to see one confirmed slot per time regardless if they essentially double booked)
        // Or strictly unique by timeSlot if they can't be in two places at once.
        // DEBUG: Check what we received
        console.log("DEBUG: Raw Bookings:", data.bookings);

        const uniqueBookings = [];
        const seen = new Set();

        // Show all sessions found in DB (filtered by ID), but deduplicate time/teacher combos

        data.bookings.forEach(b => {
          const key = `${b.timeSlot}-${b.teacherId?._id}`;
          console.log(`Processing ${key}`, b);
          if (!seen.has(key)) {
            seen.add(key);
            uniqueBookings.push(b);
          }
        });

        console.log("DEBUG: Unique Bookings:", uniqueBookings);
        setAppointments(uniqueBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch(`${url}/api/booking/tutors`);
      const data = await res.json();

      if (data.success && data.tutors.length > 0) {
        // Map Backend Data to Frontend Structure
        const formattedTutors = data.tutors.map(t => ({
          ...t,
          image: "👨‍🏫", // Default avatar for now
          rating: t.totalRatings > 0 ? t.averageRating.toFixed(1) : "N/A", // Map averageRating or fallback
          // Map availability array to slots format
          slots: t.availability ? t.availability.map(a => ({
            time: a.time,
            status: a.isBooked ? 'booked' : 'free'
          })) : []
        }));
        setAvailableTutors(formattedTutors);
      } else {
        // Fallback if no real tutors found
        setAvailableTutors(MOCK_TUTORS);
      }
    } catch (error) {
      console.log("Using Mock Data (API unavailable)");
      setAvailableTutors(MOCK_TUTORS);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = availableTutors.filter(t =>
    (t.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpandedTutorId(expandedTutorId === id ? null : id);
  };

  const handleSlotBook = async (tutor, slot) => {
    if (slot.status === 'booked') return;

    // Use Mock Logic if User ID is missing (Demo Mode) or if tutor is Mock 101/102
    // DEBUG: Log why it might fail
    if (!user || !user._id || tutor._id.length < 5) { // Simple check for mock IDs
      console.log("Processing Mock Payment redirection...", {
        hasUser: !!user,
        userId: user?._id,
        tutorId: tutor._id
      });
      navigate('/payment');
      return;
    }

    // Call Real API
    try {
      // Step 1: Create the booking
      const bookingRes = await fetch(`${url}/api/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: user._id,
          teacherId: tutor._id,
          timeSlot: slot.time
        })
      });

      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        alert("Booking Failed: " + bookingData.message);
        return;
      }

      // Step 2: Create a payment record
      const payRes = await fetch(`${url}/api/payment/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: user._id,
          teacherId: tutor._id,
          amount: tutor.price || 1000,
          bookingId: bookingData.booking._id
        })
      });

      const payData = await payRes.json();

      // Step 3: Navigate to QR payment page
      navigate('/payment-qr', {
        state: {
          paymentRef: payData.success ? payData.payment.paymentRef : 'LH' + Date.now(),
          paymentId: payData.success ? payData.payment._id : null,
          amount: tutor.price || 1000,
          teacherName: tutor.name,
          upiId: tutor.upiId,
          qrCode: tutor.qrCode,
          phone: tutor.phone
        }
      });

      fetchBookings();
      fetchTutors();
    } catch (error) {
      console.error("Booking Error:", error);
      navigate('/studentsmenu/dashboard');
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await axios.delete(`${url}/api/booking/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Booking cancelled successfully.");
        fetchBookings();
      }
    } catch (error) {
      console.error("Error cancelling:", error);
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
          <h1>Student Portal 👋</h1>
          <p>Find a mentor and schedule your next learning session.</p>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* MAIN CONTENT Area */}
        <div className="main-content">

          {/* 1. SEARCH SECTION (MOVED TO TOP) */}
          <div className="search-section search-highlight">
            <h2 className="section-title">Find a Mentor & Book a Session 🔍</h2>
            <div className="search-bar-wrapper">
              <input
                type="text"
                placeholder="Search by Subject (e.g. Maths, Physics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="tutors-grid-booking">
              {filteredTutors.map((tutor) => (
                <div className="card tutor-booking-card" key={tutor._id}>

                  {/* Top Row: Info */}
                  <div className="tutor-card-top">
                    <div className="tutor-info-left">
                      <div className="tutor-avatar-wrapper" onClick={() => navigate(`/teacher/${tutor._id}`)}>
                        {tutor.profileImage || tutor.image ? (
                          <img 
                            src={tutor.profileImage ? `${url}/images/${tutor.profileImage}` : (tutor.image.length > 5 ? `${url}/images/${tutor.image}` : null)} 
                            alt={tutor.name} 
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <span className="avatar-fallback" style={{ display: (tutor.profileImage || (tutor.image && tutor.image.length > 5)) ? 'none' : 'flex' }}>
                          {tutor.name.charAt(0)}
                        </span>
                      </div>
                      <div className="tutor-details-brief">
                        <h4 onClick={() => navigate(`/teacher/${tutor._id}`)}>{tutor.name}</h4>
                        <p className="subject-tag">{tutor.subject || "General Tutor"}</p>
                        <div className="tutor-meta">
                          <span className="rating-badge">⭐ {tutor.rating || "N/A"}</span>
                          <span className="meta-separator">•</span>
                          <button 
                            className="view-profile-link" 
                            onClick={() => navigate(`/teacher/${tutor._id}`)}
                          >
                            View Full Profile
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="tutor-info-right">
                      <button
                        className={`btn-primary btn-sm ${expandedTutorId === tutor._id ? 'btn-active' : ''}`}
                        onClick={() => toggleExpand(tutor._id)}
                      >
                        {expandedTutorId === tutor._id ? 'Close Schedule' : 'View Schedule'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Row: Line Form Timetable */}
                  <AnimatePresence>
                    {expandedTutorId === tutor._id && (
                      <motion.div
                        className="tutor-timetable"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="timetable-label">Select a Time Slot:</div>
                        <div className="slots-line-container">
                          {tutor.slots && tutor.slots.length > 0 ? (
                            tutor.slots.map((slot, idx) => (
                              <div
                                key={idx}
                                className={`time-slot-pill ${slot.status}`}
                                onClick={() => handleSlotBook(tutor, slot)}
                              >
                                {slot.time}
                                {slot.status === 'booked' && <span className="booked-badge">BUSY</span>}
                              </div>
                            ))
                          ) : (
                            <p className="no-results" style={{ margin: 0 }}>No visual slots available (Mock)</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ))}
              {filteredTutors.length === 0 && <p className="no-results">No tutors found for "{searchQuery}"</p>}
            </div>
          </div>

          {/* 2. STATS ROW (Moved Below) */}
          <div className="stats-cards small-stats">
            <div className="card stat-card">
              <h3>{appointments.length}</h3>
              <p>Total Meetings</p>
            </div>
            <div className="card stat-card">
              <h3>₹{appointments.filter(a => a.paymentStatus === 'Paid').reduce((sum, a) => sum + (a.teacherId?.price || 1000), 0)}</h3>
              <p>Total Spent</p>
            </div>
            <div className="card stat-card">
              <h3>{availableTutors.length}</h3>
              <p>Available Tutors</p>
            </div>
          </div>

        </div>

        {/* SIDEBAR */}
        <div className="dashboard-sidebar">
          {/* UPCOMING SCHEDULE */}
          <div className="card sidebar-card">
            <h3>📅 Your Schedule</h3>
            <ul className="schedule-list">
              {appointments.length > 0 ? (
                appointments.map((item) => (
                  <li key={item._id} className="schedule-item">
                    <div className="time-badge">{item.timeSlot}</div>
                    <div className="event-info">
                      <h4>{item.teacherId?.subject || "Session"} w/ {item.teacherId?.name || "Tutor"}</h4>
                      {item.zoomLink && (
                        <p style={{ fontSize: '12px', color: '#2563eb' }}>
                          <a href={item.zoomLink} target="_blank" rel="noopener noreferrer">🌍 External Zoom Link</a>
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <span className={`tag ${item.paymentStatus === 'Paid' ? 'tag-paid' : item.paymentStatus === 'Under Review' ? 'tag-review' : 'tag-pending'}`}>
                          {item.paymentStatus === 'Paid' ? 'Paid' : item.paymentStatus === 'Under Review' ? 'Under Review' : 'Unpaid'}
                        </span>
                        {item.paymentStatus === 'Paid' ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn-success btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                              onClick={() => {
                                if (item.zoomLink) {
                                  window.open(item.zoomLink, '_blank');
                                } else {
                                  navigate(`/classroom/${item._id}`);
                                }
                              }}
                            >
                              {item.zoomLink ? "Join Zoom" : "Join Class"}
                            </button>
                            <button
                              className="btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.8rem', background: '#f59e0b', borderColor: '#f59e0b', color: 'white' }}
                              onClick={() => setSelectedBookingForRating(item)}
                            >
                              {item.ratingToTeacher && item.ratingToStudent ? "View Rating" : "Rate"}
                            </button>
                          </div>
                        ) : item.paymentStatus === 'Under Review' ? (
                          <button
                            className="btn-secondary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.8rem', cursor: 'not-allowed' }}
                            disabled
                          >
                            Verifying...
                          </button>
                        ) : (
                          <button
                            className="btn-primary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            onClick={async () => {
                              try {
                                // Create a payment record then redirect to QR pay
                                const payRes = await fetch(`${url}/api/payment/create-payment`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({
                                    studentId: user._id,
                                    teacherId: item.teacherId?._id,
                                    amount: item.teacherId?.price || 1000,
                                    bookingId: item._id
                                  })
                                });
                                const payData = await payRes.json();
                                navigate('/payment-qr', {
                                  state: {
                                    paymentRef: payData.success ? payData.payment.paymentRef : 'LH' + Date.now(),
                                    paymentId: payData.success ? payData.payment._id : null,
                                    amount: item.teacherId?.price || 1000,
                                    teacherName: item.teacherId?.name,
                                    upiId: item.teacherId?.upiId,
                                    qrCode: item.teacherId?.qrCode,
                                    phone: item.teacherId?.phone
                                  }
                                });
                              } catch (err) {
                                console.error('Pay Now error:', err);
                              }
                            }}
                          >
                            Pay Now
                          </button>
                        )}
                        <button 
                          className="cancel-btn" 
                          onClick={() => cancelBooking(item._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No upcoming sessions.</p>
              )}
            </ul>
          </div>

          {/* PROMO */}
          <div className="card promo-card">
            <h3>Need Help?</h3>
            <button className="btn-secondary full-width">Support</button>
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

export default StudentsDashboard;
