import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  Star,
  User,
  Info
} from "lucide-react";
import "./TeacherDetailsById.css";

const TeacherDetailsById = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url, token, user } = useContext(AuthContext);

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");

  // Booking states
  const [showBooking, setShowBooking] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTeacher();
    } else {
      // If no token, we still try to fetch but maybe the backend allows public view or we redirect
      // For now, assume token is needed as per current logic
      setLoading(false);
    }
  }, [token, id]);

  const fetchTeacher = async () => {
    try {
      const res = await axios.get(`${url}/api/teacher/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setTeacher(res.data.teacher);
        setDescription(res.data.description || "");
      }
    } catch (err) {
      console.error("FETCH TEACHER ERROR:", err.response?.data || err.message);
      toast.error("Failed to load tutor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!token) {
      toast.warning("Please login to book a teacher");
      return;
    }

    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    try {
      const res = await axios.post(
        `${url}/api/booking/create`,
        {
          teacherId: teacher._id,
          date,
          time,
          message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("🎉 Booking request sent successfully!");
        setShowBooking(false);
        setDate("");
        setTime("");
        setMessage("");
      }
    } catch (error) {
      toast.error("Booking failed");
      console.error(error);
    }
  };

  const handleEnroll = async () => {
    if (!token || !user) {
      toast.warning("Please login to enroll");
      return;
    }

    setEnrolling(true);
    try {
      const res = await axios.post(
        `${url}/api/payment/create-payment`,
        {
          studentId: user._id,
          teacherId: teacher._id,
          amount: teacher.price || 1000
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        const { paymentRef, _id: paymentId, amount } = res.data.payment;
        navigate("/payment-qr", { 
          state: { 
            paymentRef, 
            amount, 
            paymentId, 
            teacherId: teacher._id,
            upiId: teacher.upiId,
            qrCode: teacher.qrCode,
            teacherName: teacher.name,
            phone: teacher.phone
          } 
        });
      }
    } catch (error) {
      toast.error("Enrollment failed");
      console.error(error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Loading Tutor Profile...</p>
    </div>
  );

  if (!teacher) return (
    <div className="error-container">
      <Info size={48} color="var(--primary)" />
      <h2>Tutor Not Found</h2>
      <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  return (
    <div className="teacher-profile-page">
      <div className="profile-header-nav">
        <button className="icon-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="profile-card-main">
        {/* Profile Header */}
        <div className="profile-header-section">
          <div className="profile-image-wrapper">
            <img
              src={(teacher.profileImage || teacher.image) ? `${url}/images/${teacher.profileImage || teacher.image}` : "/default-teacher.png"}
              alt={teacher.name}
              className="profile-avatar"
            />
            <div className="status-badge">Available</div>
          </div>
          
          <div className="profile-title-info">
            <h1>{teacher.name}</h1>
            <div className="quick-badges">
              <span className="badge-item"><Star size={14} /> {teacher.totalRatings > 0 ? teacher.averageRating.toFixed(1) : "N/A"} ({teacher.totalRatings || 0} Reviews)</span>
              <span className="badge-item"><ShieldCheck size={14} /> Verified Tutor</span>
            </div>
            <div className="contact-info">
              <span className="info-item"><Mail size={16} /> {teacher.email}</span>
              <span className="info-item"><MapPin size={16} /> {teacher.mode} Session</span>
            </div>
          </div>

          <div className="profile-pricing-card">
            <div className="price-tag">
              <IndianRupee size={24} />
              <span className="amount">{teacher.price}</span>
              <span className="per-hour">/ hour</span>
            </div>
            <button className="enroll-primary-btn" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? "Processing..." : "Enroll Now"}
            </button>
            <button className="book-secondary-btn" onClick={() => setShowBooking(true)}>
              Schedule Free Demo
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="profile-content-grid">
          <div className="content-left">
            <section className="profile-section">
              <h3><User size={20} /> About Me</h3>
              <p className="bio-text">{teacher.bio || "No bio available."}</p>
              {description && <p className="bio-text secondary">{description}</p>}
            </section>

            <section className="profile-section">
              <h3><GraduationCap size={20} /> Education & Experience</h3>
              <div className="stats-row">
                <div className="stat-box">
                  <span className="stat-label">Qualification</span>
                  <span className="stat-value">{teacher.qualification || "Not specified"}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Experience</span>
                  <span className="stat-value">{teacher.experience} Years</span>
                </div>
              </div>
            </section>
          </div>

          <div className="content-right">
            <section className="profile-section">
              <h3><BookOpen size={20} /> Teaching Details</h3>
              <div className="details-list">
                <div className="detail-item">
                  <span className="label">Subjects</span>
                  <div className="tag-container">
                    {(teacher.subjects || (teacher.subject ? [teacher.subject] : [])).map((sub, i) => (
                      <span key={i} className="subject-tag">{sub}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="label">Target Classes</span>
                  <span className="value">{teacher.classRange || "All Classes"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Teaching Mode</span>
                  <span className="value">{teacher.mode}</span>
                </div>
              </div>
            </section>


            <section className="profile-section help-card">
              <h3>Need Help?</h3>
              <p>Have questions about the courses or teaching style? Feel free to message the tutor.</p>
              <button className="msg-btn"><MessageSquare size={16} /> Send Message</button>
            </section>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="booking-overlay" onClick={() => setShowBooking(false)}>
          <div className="booking-modal-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule a Session</h3>
              <button className="close-modal" onClick={() => setShowBooking(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="tutor-mini-info">
                <img src={teacher.image ? `${url}/images/${teacher.image}` : "/default-teacher.png"} alt="" />
                <div>
                  <h4>{teacher.name}</h4>
                  <p>{teacher.subjects[0]} Specialist</p>
                </div>
              </div>

              <div className="input-group">
                <label><Calendar size={16} /> Select Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="input-group">
                <label><Clock size={16} /> Select Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>

              <div className="input-group">
                <label><MessageSquare size={16} /> Message (Optional)</label>
                <textarea 
                  placeholder="Tell the tutor about your learning goals..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button className="confirm-btn" onClick={handleBooking}>Confirm Booking</button>
                <button className="cancel-btn" onClick={() => setShowBooking(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetailsById;

