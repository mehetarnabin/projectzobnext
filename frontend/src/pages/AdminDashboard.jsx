// src/pages/admin/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token"); // remove token on logout
    navigate("/admin/login"); // redirect to admin login
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">
          You are now logged in as an admin. Manage the system from here.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white rounded-xl py-3 px-6 hover:bg-red-700 transition-all text-lg font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
