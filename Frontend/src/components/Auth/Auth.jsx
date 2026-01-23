


import React, { useContext, useState } from "react";
import "./Auth.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import config from "../../config";


const Auth = ({ setLogin }) => {
  const [state, setState] = useState("signup");
  const { loginUser, registerUser } = useContext(AuthContext); // Use context actions
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conpass, setConpass] = useState("");
  const [role, setRole] = useState("student"); // Default role

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state === "signup" && password !== conpass) {
      alert("Passwords are not matching!");
      return;
    }

    try {
      const url =
        state === "signup"
          ? `${config.API_BASE_URL}/api/user/register`
          : `${config.API_BASE_URL}/api/user/login`;

      const body =
        state === "signup"
          ? { name, email, password, role }
          : { email, password };

      const res = await axios.post(url, body);

      if (res.data.success) {
        // Use context functions to save User Data & Token
        if (state === "signup") {
          registerUser(res.data.user, res.data.token);
        } else {
          loginUser(res.data.user, res.data.token);
        }

        setLogin(false);
        alert("Authentication Successful");

        const userRole = res.data.user?.role || role; // Use role from user object

        if (userRole === "teacher") {
          navigate("/teachersmenu/dashboard");
        } else {
          navigate("/studentsmenu/dashboard");
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Server Error");
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-close">
          <span onClick={() => setLogin(false)}>✕</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h3 className="auth-title">
            {state === "signup" ? "Sign Up" : "Login"}
          </h3>

          {state === "signup" && (
            <input
              className="auth-input"
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            className="auth-input"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            autoComplete="new-password"
          />

          {state === "signup" && (
            <>
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm Password"
                value={conpass}
                onChange={(e) => setConpass(e.target.value)}
                required
                name="confirmPassword"
                autoComplete="new-password"
              />
              {conpass && password !== conpass && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "-10px", marginBottom: "10px" }}>
                  Passwords do not match
                </p>
              )}
            </>
          )}

          {/* Role Selection */}
          <div className="auth-role-selection" style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '10px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === "student"}
                onChange={(e) => setRole(e.target.value)}
              />
              Student
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === "teacher"}
                onChange={(e) => setRole(e.target.value)}
              />
              Teacher
            </label>
          </div>

          <button className="auth-submit" type="submit">
            {state === "signup" ? "Sign Up" : "Login"}
          </button>

          <p className="auth-switch">
            {state === "signup" ? (
              <>
                Already have an account?
                <span onClick={() => setState("login")}> Login</span>
              </>
            ) : (
              <>
                Don’t have an account?
                <span onClick={() => setState("signup")}> Sign Up</span>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
