import React from "react";
import { useNavigate } from "react-router-dom";
import "./Menu.css"; // We'll create a shared CSS file for these menus

const StudentMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-container container">
      <div className="menu-header">
        <h1>Student Portal 🎓</h1>
        <p>Access your learning resources and manage your profile.</p>
      </div>

      <div className="menu-grid">
        {/* Dashboard Card */}
        <div
          className="card menu-card"
          onClick={() => navigate("/studentsmenu/dashboard")}
        >
          <div className="menu-icon">📊</div>
          <h3>My Dashboard</h3>
          <p>View your progress, enrolled courses, and upcoming schedule.</p>
          <button className="btn-secondary btn-sm">Go to Dashboard</button>
        </div>

        {/* Profile Card */}
        <div
          className="card menu-card"
          onClick={() => navigate("/studentsmenu/profile")}
        >
          <div className="menu-icon">👤</div>
          <h3>My Profile</h3>
          <p>Update your personal details, skills, and resume.</p>
          <button className="btn-secondary btn-sm">View Profile</button>
        </div>

        {/* Browse Courses (New/Placeholder) */}
        <div
          className="card menu-card"
          onClick={() => navigate("/")}
        >
          <div className="menu-icon">🔍</div>
          <h3>Browse Courses</h3>
          <p>Find new topics to learn and mentors to connect with.</p>
          <button className="btn-secondary btn-sm">Explore</button>
        </div>
      </div>
    </div>
  );
};

export default StudentMenu;
