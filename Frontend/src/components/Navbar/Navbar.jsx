import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/frontendImages'; // Corrected import
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import logoHeader from "../../assets/logo_header.png"; // Import new header logo
const Navbar = ({ setLogin }) => {
  const { token, setToken, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile Menu State
  const [notifications, setNotifications] = useState([]); // List of notifications
  const [showNotifications, setShowNotifications] = useState(false); // Toggle dropdown
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Theme Toggler
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  const notificationRef = React.useRef(null);
  const profileRef = React.useRef(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Notifications if clicked outside
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      // Close Profile Menu if clicked outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleNotificationClick = (notif) => {
    if (notif.type === 'class-started') {
      navigate(`/classroom/${notif.data.roomId}`);
      setShowNotifications(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.includes(path);
  };

  return (
    <nav className={`nav-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      {/* LOGO */}
      <div className="nav-logo" onClick={() => navigate("/")}>
        <img src={logoHeader} alt="logo" />
        <span className="logo-text">LearnHub</span>
      </div>

      {/* MOBILE MENU TOGGLE */}
      <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* MENU (Desktop + Mobile) */}
      <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
        <li
          className={isActive('/') ? "active" : ""}
          onClick={() => {
            navigate("/");
            window.scrollTo(0, 0);
            setMobileMenuOpen(false);
          }}
        >
          Home
        </li>

        <li
          className={isActive('menu') || isActive('dashboard') ? "active" : ""}
          onClick={() => {
            if (user?.role === 'teacher') {
              navigate("/teachersmenu/dashboard");
            } else if (user?.role === 'student') {
              navigate("/studentsmenu/dashboard");
            } else {
              navigate("/studentsmenu");
            }
            setMobileMenuOpen(false);
          }}
        >
          Dashboard
        </li>

        <li
          className={location.hash === "#about" ? "active" : ""}
          onClick={() => {
            navigate("/");
            setTimeout(() => {
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
            setMobileMenuOpen(false);
          }}
        >
          About
        </li>

        <li
          className={location.hash === "#contact" ? "active" : ""}
          onClick={() => {
            navigate("/");
            setTimeout(() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
            setMobileMenuOpen(false);
          }}
        >
          Contact
        </li>
      </ul>

      {/* AUTH / PROFILE & NOTIFICATION */}
      <div className="nav-auth">
        {/* THEME TOGGLE */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>

        {/* NOTIFICATION */}
        <div
          className="nav-notification"
          ref={notificationRef}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <img src={assets.notification} alt="notification" />
          {notifications.length > 0 && <span className="nav-dot" />}

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notif-header">Notifications</div>
              <ul className="notif-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <li key={notif.id} className="notif-item" onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notif);
                    }}>
                      <div className="notif-content">
                        <p className="notif-msg">{notif.message}</p>
                        <span className="notif-time">{notif.timestamp}</span>
                      </div>
                      {notif.type === 'class-started' && <span className="notif-action">Join</span>}
                    </li>
                  ))
                ) : (
                  <li className="notif-empty" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No new notifications
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {!token ? (
          <button className="nav-auth-btn" onClick={() => setLogin(true)}>
            Sign In
          </button>
        ) : (
          <div
            className="nav-profile"
            ref={profileRef}
            onClick={() => setShowMenu(!showMenu)}
          >
            <img src={assets.profile_icon} alt="profile" />

            {showMenu && (
              <div className="nav-profile-menu">
                <div className="profile-header">
                  <div className="profile-initials">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="profile-details">
                    <p className="profile-name">{user?.name || "User"}</p>
                    <p className="profile-email">{user?.email || "user@example.com"}</p>
                  </div>
                </div>

                <div className="menu-divider" />

                <ul className="menu-list">
                  <li onClick={() => navigate("/profile")}>
                    <span>My Profile</span>
                  </li>
                  <li onClick={() => navigate("/settings")}>
                    <span>Settings</span>
                  </li>

                  <div className="menu-divider" />

                  <li onClick={logout} className="logout-item">
                    <span>Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );

};

export default Navbar;
