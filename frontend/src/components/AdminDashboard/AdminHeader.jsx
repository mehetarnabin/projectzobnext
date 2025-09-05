// src/components/AdminHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate("/admin/login"); // Redirect admin to login page after logout
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          <span className="text-[#003893]">Zob</span>
          <span className="text-[#DC143C]">Next</span>
        </Link>

        {/* Logout button */}
        {user && (
          <button
            onClick={handleLogout}
            className="text-gray-900 border-2 border-[#003893] px-6 py-2 rounded hover:text-[#DC143C] transition"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
