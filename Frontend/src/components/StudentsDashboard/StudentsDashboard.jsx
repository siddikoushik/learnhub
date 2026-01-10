import React, { useEffect, useState, useContext } from "react";
import "./StudentsDashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const StudentsDashboard = () => {
  const { url, user, setLogin } = useContext(AuthContext); // Get setLogin to trigger modal
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTutorId, setExpandedTutorId] = useState(null);

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
      const res = await fetch(`${url}/api/booking/student/${user._id}`);
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
          rating: 4.9, // Default rating
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
      const res = await fetch(`${url}/api/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: user._id,
          teacherId: tutor._id,
          timeSlot: slot.time
        })
      });

      const data = await res.json();
      if (data.success) {
        navigate('/payment');
        fetchBookings(); // Refresh bookings
        fetchTutors();   // Refresh slots
      } else {
        alert("Booking Failed: " + data.message);
      }
    } catch (error) {
      console.error("Booking Error:", error);
      // Fallback for demo
      navigate('/payment');
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
                      <span className="tutor-avatar">{tutor.image}</span>
                      <div>
                        <h4>{tutor.name}</h4>
                        <p className="subject-tag">{tutor.subject || "General Tutor"}</p>
                        <span className="rating-badge">⭐ {tutor.rating}</span>
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
              <p>Meetings</p>
            </div>
            <div className="card stat-card">
              <h3>$0.00</h3>
              <p>Wallet</p>
            </div>
            <div className="card stat-card">
              <h3>{availableTutors.length}</h3>
              <p>Tutors</p>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <span className="tag">Confirmed</span>
                        <button
                          className="btn-primary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                          onClick={() => navigate(`/classroom/${item._id}`)}
                        >
                          Join
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
    </motion.div>
  );
};

export default StudentsDashboard;
