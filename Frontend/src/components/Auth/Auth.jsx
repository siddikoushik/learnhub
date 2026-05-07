


import React, { useContext, useState, useEffect, useCallback } from "react";
import "./Auth.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import config from "../../config";


const Auth = ({ setLogin }) => {
  const [state, setState] = useState("signup"); // signup, verify, login, forgot, reset
  const { loginUser, registerUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conpass, setConpass] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  // Resend OTP cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Start cooldown when entering verify or reset state
  useEffect(() => {
    if (state === "verify" || state === "reset") {
      setResendCooldown(60);
    }
  }, [state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state === "signup" && password !== conpass) {
      alert("Passwords are not matching!");
      return;
    }

    setLoading(true);

    try {
      let url = "";
      let body = {};

      if (state === "signup") {
        url = `${config.API_BASE_URL}/api/user/register`;
        body = { name, email, password, role };
      } else if (state === "verify") {
        url = `${config.API_BASE_URL}/api/user/verify-otp`;
        body = { email, otp };
      } else if (state === "login") {
        url = `${config.API_BASE_URL}/api/user/login`;
        body = { email, password };
      } else if (state === "forgot") {
        url = `${config.API_BASE_URL}/api/user/forgot-password`;
        body = { email };
      } else if (state === "reset") {
        url = `${config.API_BASE_URL}/api/user/reset-password`;
        body = { email, otp, newPassword: password };
      }

      const res = await axios.post(url, body);

      if (res.data.success) {
        if (state === "signup") {
          alert(res.data.message || "Registration successful! Please check your email for the OTP.");
          setState("verify");
        } else if (state === "verify") {
          alert(res.data.message || "Email verified successfully!");
          registerUser(res.data.user, res.data.token);
          setLogin(false);
          navigate(res.data.user.role === "teacher" ? "/teachersmenu/dashboard" : "/studentsmenu/dashboard");
        } else if (state === "login") {
          loginUser(res.data.user, res.data.token);
          setLogin(false);
          alert(res.data.message || "Login successful!");
          navigate(res.data.user.role === "teacher" ? "/teachersmenu/dashboard" : "/studentsmenu/dashboard");
        } else if (state === "forgot") {
          alert(res.data.message || "Reset OTP sent to your email!");
          setState("reset");
        } else if (state === "reset") {
          alert(res.data.message || "Password reset successfully! You can now login.");
          setState("login");
          setPassword("");
          setOtp("");
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      let url, body;

      if (state === "verify") {
        url = `${config.API_BASE_URL}/api/user/resend-otp`;
        body = { email };
      } else if (state === "reset") {
        url = `${config.API_BASE_URL}/api/user/forgot-password`;
        body = { email };
      }

      const res = await axios.post(url, body);
      if (res.data.success) {
        alert("New OTP sent to your email!");
        setResendCooldown(60);
        setOtp(""); // Clear old OTP input
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP";
      alert(msg);
      // If server returns a cooldown message, parse the seconds and set timer
      const match = msg.match(/wait (\d+) seconds/);
      if (match) {
        setResendCooldown(parseInt(match[1]));
      }
    } finally {
      setLoading(false);
    }
  }, [resendCooldown, state, email]);

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-close">
          <span onClick={() => setLogin(false)}>✕</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h3 className="auth-title" style={{ marginBottom: "20px", fontSize: "24px", color: "#333" }}>
            {state === "signup" && "Sign Up"}
            {state === "login" && "Login"}
            {state === "verify" && "Verify Email"}
            {state === "forgot" && "Forgot Password"}
            {state === "reset" && "Reset Password"}
          </h3>

          {state === "signup" && (
            <input
              className="auth-input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          {(state === "signup" || state === "login" || state === "forgot") && (
            <input
              className="auth-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          {state === "verify" && (
            <p style={{ textAlign: "center", marginBottom: "15px", fontSize: "14px", color: "#666" }}>
              OTP sent to <b>{email}</b>
            </p>
          )}

          {state === "reset" && (
            <p style={{ textAlign: "center", marginBottom: "15px", fontSize: "14px", color: "#666" }}>
              Reset code sent to <b>{email}</b>
            </p>
          )}

          {(state === "verify" || state === "reset") && (
            <input
              className="auth-input"
              type="text"
              placeholder="6-Digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
          )}

          {(state === "signup" || state === "login" || state === "reset") && (
            <input
              className="auth-input"
              type="password"
              placeholder={state === "reset" ? "New Password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          )}

          {state === "signup" && (
            <>
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm Password"
                value={conpass}
                onChange={(e) => setConpass(e.target.value)}
                required
                autoComplete="new-password"
              />
              {conpass && password !== conpass && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "-10px", marginBottom: "10px" }}>
                  Passwords do not match
                </p>
              )}
            </>
          )}

          {state === "signup" && (
            <div className="auth-role-selection" style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '15px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: "14px" }}>
                <input type="radio" value="student" checked={role === "student"} onChange={(e) => setRole(e.target.value)} />
                Student
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: "14px" }}>
                <input type="radio" value="teacher" checked={role === "teacher"} onChange={(e) => setRole(e.target.value)} />
                Teacher
              </label>
            </div>
          )}

          {state === "login" && (
            <p className="auth-switch" style={{ textAlign: "right", marginTop: "-10px", marginBottom: "15px" }}>
              <span onClick={() => setState("forgot")} style={{ fontSize: "13px", color: "#007bff" }}>Forgot Password?</span>
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
            style={{ padding: "12px", borderRadius: "8px", fontWeight: "600", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <span className="auth-spinner"></span>
            ) : (
              <>
                {state === "signup" && "Sign Up"}
                {state === "login" && "Login"}
                {state === "verify" && "Verify Now"}
                {state === "forgot" && "Send OTP"}
                {state === "reset" && "Update Password"}
              </>
            )}
          </button>

          {(state === "verify" || state === "reset") && (
            <div className="auth-resend-section">
              <p className="auth-switch" style={{ marginTop: "15px" }}>
                Didn't get code?{" "}
                {resendCooldown > 0 ? (
                  <span className="auth-resend-timer">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <span
                    onClick={handleResend}
                    className="auth-resend-link"
                    style={{ color: "#007bff", cursor: "pointer" }}
                  >
                    Resend OTP
                  </span>
                )}
              </p>
            </div>
          )}

          <p className="auth-switch" style={{ marginTop: "20px" }}>
            {state === "signup" ? (
              <>Already have an account? <span onClick={() => setState("login")}>Login</span></>
            ) : (
              <><span onClick={() => setState("signup")}>Create an Account</span> or <span onClick={() => setState("login")}>Login</span></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
