// src/components/AdminDashboard/AdminHeader.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminHeader = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-end">
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
