import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/frontendImages'; // Corrected import
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import socket from '../../socket';
import logoHeader from "../../assets/logo_header.png"; // Import new header logo

const Navbar = ({ setLogin }) => {
  const { token, setToken, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile Menu State
  const [notifications, setNotifications] = useState([]); // List of notifications
  const [showNotifications, setShowNotifications] = useState(false); // Toggle dropdown

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  // Socket Setup & Notification Listener
  React.useEffect(() => {
    if (user && user._id) {
      socket.emit("setup", user); // Join User Room
    }

    socket.on("class-started", (data) => {
      console.log("🔔 Class Started Notification:", data);
      // Add new notification to list
      const newNotif = {
        id: Date.now(),
        type: 'class-started',
        message: `Class with ${data.teacherName} has started!`,
        data: data,
        timestamp: new Date().toLocaleTimeString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => {
      socket.off("class-started");
    };
  }, [user]);

  const handleNotificationClick = (notif) => {
    if (notif.type === 'class-started') {
      navigate(`/classroom/${notif.data.roomId}`);
      setShowNotifications(false);
    }
    // Mark as read or remove? Let's remove for now or keep as history
    // setNotifications(prev => prev.filter(n => n.id !== notif.id));
  };

  return (
    <nav className="nav-wrapper">
      {/* LOGO */}
      <div className="nav-logo" onClick={() => navigate("/")}>
        <img src={logoHeader} alt="logo" />
      </div>

      {/* MENU */}
      {/* MENU (Desktop + Mobile) */}
      <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
        <li onClick={() => {
          navigate("/");
          window.scrollTo(0, 0);
          setMobileMenuOpen(false);
        }}>Home</li>

        <li
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

        <li onClick={() => {
          navigate("/");
          setTimeout(() => {
            document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
          setMobileMenuOpen(false);
        }}>AboutUs</li>

        <li onClick={() => {
          navigate("/");
          setTimeout(() => {
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
          setMobileMenuOpen(false);
        }}>Contact</li>

        {/* Mobile Only: Auth Links */}
        <div className="mobile-auth-links">
          {!token ? (
            <li onClick={() => { setLogin(true); setMobileMenuOpen(false); }}>Sign Up / Login</li>
          ) : (
            <>
              <li onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>My Profile</li>
              <li onClick={() => {
                localStorage.removeItem("token");
                setToken("");
                navigate("/");
                setMobileMenuOpen(false);
              }}>Logout</li>
            </>
          )}
        </div>
      </ul>

      {/* HAMBURGER ICON */}
      <div className="nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <span className={mobileMenuOpen ? "bar open" : "bar"}></span>
        <span className={mobileMenuOpen ? "bar open" : "bar"}></span>
        <span className={mobileMenuOpen ? "bar open" : "bar"}></span>
      </div>

      {/* AUTH / PROFILE & NOTIFICATION */}
      <div className="nav-auth">

        {/* NOTIFICATION (Now inside Auth group to be near profile) */}
        <div className="nav-notification" onClick={() => setShowNotifications(!showNotifications)}>
          <img src={assets.notification} alt="notification" />
          {notifications.length > 0 && <span className="nav-dot" style={{ display: 'block' }} />}

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notif-header">Notifications</div>
              <ul className="notif-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <li key={notif.id} className="notif-item" onClick={(e) => {
                      e.stopPropagation(); // Prevent closing immediately
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
                  <li className="notif-empty">No new notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {!token ? (
          <button className="nav-auth-btn" onClick={() => setLogin(true)}>
            SignUp
          </button>
        ) : (
          <div
            className="nav-profile"
            onClick={() => setShowMenu(!showMenu)}
          >
            <img src={assets.profile_icon} alt="profile" />

            {showMenu && (
              <ul className="nav-profile-menu">
                <li onClick={() => navigate("/profile")}>
                  <span>Profile</span>
                </li>
                <li onClick={logout}>
                  <span>Logout</span>
                </li>
              </ul>
            )}

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
