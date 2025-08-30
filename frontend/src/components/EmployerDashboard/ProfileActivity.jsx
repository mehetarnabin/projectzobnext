import API_BASE_URL from "../../config"; // Add this line
import React, { useEffect, useState, useCallback } from "react";
import { FaEye, FaListAlt, FaUserCheck, FaUser } from "react-icons/fa"; // Existing icons
import { TbUsers } from "react-icons/tb"; // Existing icon
import { FaRegRectangleList } from "react-icons/fa6"; // Existing icon
import { FiUserCheck } from "react-icons/fi"; // Existing icon
import { FaTimesCircle, FaUserTie } from "react-icons/fa"; // Added icons for Rejected and Hired

import { useAuth } from '../../context/AuthContext'; // Import useAuth for token and user
import { toast } from 'react-toastify'; // For notifications

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const ProfileActivity = () => {
  const { token, user } = useAuth(); // Get token and user from AuthContext
  const [applicantCounts, setApplicantCounts] = useState({
    total_applicants: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0, // Initial value for hired
  });
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState(null);

  const fetchApplicantCounts = useCallback(async () => {
    // Only fetch if user is logged in and is an employer
    if (!token || !user || user.role !== 'employer') {
      setLoadingCounts(false);
      setErrorCounts('Unauthorized or not an employer.');
      return;
    }

    setLoadingCounts(true);
    setErrorCounts(null);
    try {
      const response = await fetch(`${API_BASE_URL}/employer/applicant-counts`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Ensure all expected keys are present, defaulting to 0 if not
      setApplicantCounts({
        total_applicants: data.counts.total_applicants || 0,
        shortlisted: data.counts.shortlisted || 0,
        rejected: data.counts.rejected || 0,
        hired: data.counts.hired || 0, // Ensure 'hired' is read from response
      });
    } catch (err) {
      console.error("Error fetching applicant counts for dashboard:", err);
      setErrorCounts(err.message || "Failed to load applicant counts.");
      toast.error("Failed to load applicant counts: " + (err.message || "Network error."));
    } finally {
      setLoadingCounts(false);
    }
  }, [token, user]); // Re-run if token or user changes

  useEffect(() => {
    fetchApplicantCounts();
  }, [fetchApplicantCounts]);

  // Dynamically generate stats based on fetched data
  const stats = [
    {
      id: 1,
      title: "Job Portal",
      value: applicantCounts.total_applicants,
      icon: <TbUsers />, // Using TbUsers for total applicants
      color: "bg-blue-50",
      textColor: "text-gray-700"
    },
    {
      id: 2,
      title: "Shortlisted",
      value: applicantCounts.shortlisted,
      icon: <FaRegRectangleList />, // Using FaRegRectangleList for shortlisted
      color: "bg-blue-50", // Changed color for shortlisted
      textColor: "text-gray-700"
    },
    {
      id: 3,
      title: "Rejected",
      value: applicantCounts.rejected,
      icon: <FaTimesCircle />, // Using FaTimesCircle for rejected
      color: "bg-blue-50", // Changed color for rejected
      textColor: "text-gray-700"
    },
    {
      id: 4,
      title: "Hired",
      value: applicantCounts.hired, // This will now display the fetched hired count
      icon: <FaUserTie />, // Using FaUserTie for hired
      color: "bg-blue-50", // Changed color for hired
      textColor: "text-gray-700"
    },
    // You can add "Profile Viewed" back here if it's a separate metric
    // {
    //   id: 5,
    //   title: "Profile Viewed",
    //   value: 42, // Static for now, fetch from backend if available
    //   icon: <FaEye />,
    //   color: "bg-gray-50",
    //   textColor: "text-gray-700"
    // }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {loadingCounts ? (
        <div className="col-span-full text-center text-gray-600 py-4">Loading applicant data...</div>
      ) : errorCounts ? (
        <div className="col-span-full text-center text-red-600 py-4">Error: {errorCounts}</div>
      ) : (
        stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-3">
            <div className="flex justify-between items-center">
              {/* Left Section - Number and Text */}
              <div>
                <h3 className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</h3>
                <p className="text-xs text-gray-400 mt-1">{stat.title}</p>
              </div>
              
              {/* Right Section - Circular Icon Button */}
              <button
                className={`h-12 w-12 rounded-full ${stat.color} flex items-center justify-center text-xl hover:bg-[#003893] hover:text-white transition-all`}
                onClick={() => console.log(`${stat.title} clicked`)} // Placeholder for click handler
              >
                {stat.icon}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProfileActivity;
