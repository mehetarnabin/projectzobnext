import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlinePencil } from "react-icons/hi2";

const EmployerUserProfile = ({ userData }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!userData) {
    return <div className="text-center py-4">Loading user profile...</div>;
  }

  return (
    <section className="bg-gray-100 rounded-2xl h-full">
      <div className="space-y-4 overflow-hidden bg-white border-2 border-gray-200 inset-shadow-md rounded-2xl relative p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={userData.logo_url || "/images/default_profile.jpg"}
              alt="User Logo"
              className="rounded-full object-cover w-full h-full border-2 border-gray-200"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#003893]">{userData.name || "N/A"}</h3>
            <p className="text-md font-regular text-gray-700">{userData.designation || "Not specified"}</p>
            <div className="mt-4 space-y-2 text-gray-700">
          <div className="flex gap-4 items-center">
            <span className="text-md">Email Address:</span>
            <span>{userData.email || "N/A"}</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-md">Phone Number:</span>
            <span>{userData.phone_number || "N/A"}</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-md">Current Time:</span>
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
          </div>
          
          <button
            onClick={() => navigate("/employer/profile/edit-user-profile")}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-100"
            title="Edit My Profile"
          >
            <HiOutlinePencil />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EmployerUserProfile;
