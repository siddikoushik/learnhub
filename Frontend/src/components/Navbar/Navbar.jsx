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

      </ul>


      {/* AUTH / PROFILE & NOTIFICATION */}
      <div className="nav-auth">

        {/* NOTIFICATION (Now inside Auth group to be near profile) */}
        <div
          className="nav-notification"
          ref={notificationRef}
          onClick={() => setShowNotifications(!showNotifications)}
        >
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
            ref={profileRef}
            onClick={() => setShowMenu(!showMenu)}
          >
            <img src={assets.profile_icon} alt="profile" />

            {showMenu && (
              <div className="nav-profile-menu">
                {/* User Header */}
                <div className="profile-header">
                  <div className="profile-initials">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="profile-details">
                    <p className="profile-name">{user?.name || "User"}</p>
                    <p className="profile-email">{user?.email || "user@example.com"}</p>
                  </div>
                </div>

                <hr className="menu-divider" />

                <ul className="menu-list">
                  {/* Mobile Only Navigation */}
                  <li className="mobile-only" onClick={() => navigate("/")}>Home</li>
                  <li className="mobile-only" onClick={() => {
                    if (user?.role === 'teacher') navigate("/teachersmenu/dashboard");
                    else if (user?.role === 'student') navigate("/studentsmenu/dashboard");
                    else navigate("/studentsmenu");
                  }}>Dashboard</li>

                  {/* Standard Links */}
                  <li onClick={() => navigate("/profile")}>
                    <span>My Profile</span>
                  </li>
                  <li onClick={() => navigate("/profile")}> {/* Could be settings */}
                    <span>Settings</span>
                  </li>

                  <hr className="menu-divider" />

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
