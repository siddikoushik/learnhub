import React from "react";
import { useNavigate } from "react-router-dom";
import "../StudentMenu/Menu.css"; // Shared styling

const TeachersMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-container container">
      <div className="menu-header">
        <h1>Instructor Hub 👨‍🏫</h1>
        <p>Manage your students, courses, and teaching profile.</p>
      </div>

      <div className="menu-grid">
        {/* Dashboard Card */}
        <div
          className="card menu-card"
          onClick={() => navigate("/teachersmenu/dashboard")}
        >
          <div className="menu-icon">📈</div>
          <h3>Instructor Dashboard</h3>
          <p>Track earnings, student engagement, and course performance.</p>
          <button className="btn-secondary btn-sm">View Analytics</button>
        </div>

        {/* Profile Card */}
        <div
          className="card menu-card"
          onClick={() => navigate("/teachersmenu/profile")}
        >
          <div className="menu-icon">🆔</div>
          <h3>My Profile</h3>
          <p>Edit your bio, qualifications, and availability.</p>
          <button className="btn-secondary btn-sm">Edit Profile</button>
        </div>

        {/* Create Course (Placeholder) */}
        <div
          className="card menu-card"
          onClick={() => navigate("/teachersmenu/dashboard")}
        >
          <div className="menu-icon">✍️</div>
          <h3>Create Course</h3>
          <p>Design a new curriculum and publish it to the platform.</p>
          <button className="btn-secondary btn-sm">Start Creating</button>
        </div>
      </div>
    </div>
  );
};

export default TeachersMenu;
