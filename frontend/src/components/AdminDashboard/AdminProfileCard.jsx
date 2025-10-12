// src/components/AdminDashboard/AdminProfileCard.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminProfileCard = () => {
  const { user } = useAuth();

  // Fallbacks if data is missing
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@example.com";
  const userAvatar = user?.avatar || "/images/default_profile.jpg";

  return (
    <div className="relative bg-white rounded-lg shadow overflow-hidden">
      {/* Banner Section */}
      <div className="h-16 bg-[#003893] relative">
        {/* Circular Avatar */}
        <div className="absolute -bottom-8 left-4 transform">
          <div className="h-16 w-16 rounded-full border-2 border-white bg-white overflow-hidden shadow-md">
            <img
              src={userAvatar}
              alt={userName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="pt-10 pb-4 px-4">
        <h3 className="font-semibold text-lg text-gray-800">{userName}</h3>
        <p className="text-sm text-gray-600">Administrator</p>
        <p className="text-xs text-gray-500 mt-1">{userEmail}</p>
      </div>
    </div>
  );
};

export default AdminProfileCard;
