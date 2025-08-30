import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null); // Initialize with null for clarity

export const AuthProvider = ({ children }) => {
  // Initialize user and token state from localStorage
  // This ensures that on initial load, if a user is logged in, their data is available.
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null; // Return null if parsing fails
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token');
  });

  const navigate = useNavigate();

  // The 'login' function now receives the 'userData' and 'userToken' directly from the API response.
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    // Navigation should ideally happen after the login success and context update
    // It's often handled by the component that *calls* login (e.g., LoginModal)
    // to allow for more flexible routing logic based on role.
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/"); // Navigate to home or login page on logout
  };

  // Optional: Add an effect to re-sync if localStorage somehow changes from outside (less common but robust)
  // This listener is useful if your app is open in multiple tabs and login/logout happens in one.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        try {
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('token');
          setUser(storedUser ? JSON.parse(storedUser) : null);
          setToken(storedToken);
        } catch (error) {
          console.error("Failed to parse user from localStorage on storage event:", error);
          setUser(null);
          setToken(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Provide user, token, isAuthenticated status, and login/logout functions
  const authContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token, // True if both user object and token exist
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);