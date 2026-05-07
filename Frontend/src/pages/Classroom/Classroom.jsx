import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import config from "../../config";
import "./Classroom.css";

const Classroom = () => {
    const { roomId } = useParams();
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const res = await fetch(`${config.API_BASE_URL}/api/booking/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && data.booking) {
                    setBooking(data.booking);

                    // Access Guard
                    if (data.booking.paymentStatus !== 'Paid' && user?.role === 'student') {
                        alert("Access Denied: Payment required.");
                        navigate('/studentsmenu/dashboard');
                        return;
                    }

                    // If Zoom link exists, take them there automatically
                    if (data.booking.zoomLink) {
                        window.location.href = data.booking.zoomLink;
                    }
                }
            } catch (e) {
                console.error("Failed to fetch booking:", e);
            }
        };
        fetchBookingDetails();
    }, [roomId, user, navigate]);

    if (!booking) return <div className="classroom-loading">Loading Room...</div>;

    return (
        <div className="classroom-container">
            <div className="classroom-card">
                <h1>📚 Virtual Classroom</h1>
                <p><strong>Session:</strong> {booking.timeSlot}</p>
                <p><strong>Tutor:</strong> {booking.teacherId?.name}</p>
                <p><strong>Subject:</strong> {booking.teacherId?.subject}</p>

                <div className="classroom-status">
                    {booking.zoomLink ? (
                        <div className="zoom-section">
                            <p>This class is being held on Zoom.</p>
                            <a href={booking.zoomLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
                                Launch Zoom Meeting
                            </a>
                        </div>
                    ) : (
                        <div className="waiting-section">
                            <p>Waiting for the teacher to provide the Zoom link...</p>
                            <button className="btn-secondary" onClick={() => window.location.reload()}>
                                Refresh Page
                            </button>
                        </div>
                    )}
                </div>

                <button className="btn-text" onClick={() => navigate(-1)}>Back to Dashboard</button>
            </div>
        </div>
    );
};

export default Classroom;
