import React, { createContext, useState, useEffect } from "react";
import { Students, Teachers } from "../assets/frontendImages";
import config from "../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState(null);
  const [menu, setMenu] = useState("");

  const url = config.API_BASE_URL;

  // 🔐 Load auth data safely on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // ✅ SAFE USER PARSE
    let parsedUser = null;
    if (storedUser && storedUser !== "undefined") {
      try {
        parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user data. Clearing storage.");
        localStorage.removeItem("user");
      }
    }

    // ✅ SAFE TOKEN LOAD + VALIDATE
    if (storedToken && storedToken !== "undefined" && parsedUser) {
      setToken(storedToken);

      // Validate token against backend (catch stale / wrong-secret tokens)
      fetch(`${url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (res.status === 401) {
            console.warn("Stored token is invalid/expired. Logging out.");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
            setToken("");
          }
        })
        .catch(() => {
          // Network error — keep token, will retry later
        });
    }
  }, []);

  // ✅ LOGIN
  const loginUser = (userData, jwtToken) => {
    if (!userData || !jwtToken) {
      console.error("Login failed: missing user or token");
      return;
    }

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);

    setUser(userData);
    setToken(jwtToken);
  };

  // ✅ REGISTER
  const registerUser = (userData, jwtToken) => {
    if (!userData || !jwtToken) {
      console.error("Register failed: missing user or token");
      return;
    }

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);

    setUser(userData);
    setToken(jwtToken);
  };

  // ✅ LOGOUT
  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken("");
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        url,
        menu,
        setMenu,
        Students,
        Teachers,
        user,
        setUser,
        token,
        profile,
        setProfile,
        loginUser,
        registerUser,
        logoutUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
