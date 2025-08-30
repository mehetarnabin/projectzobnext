// src/components/ProfileActivity.jsx
import API_BASE_URL from "../../config"; // Add this line
import React, { useState, useEffect, useCallback } from "react";
import { FaEye, FaListAlt, FaUserCheck, FaUser } from "react-icons/fa";
import { TbUsers } from "react-icons/tb";
import { FaRegRectangleList } from "react-icons/fa6";
import { FiUserCheck } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-toastify';

// const API_BASE_URL = "http://10.120.30.250:8000/api"; // Define API base URL

const ProfileActivity = () => {
    const { token } = useAuth();
    const [applicationsCount, setApplicationsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplicationsCount = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            // If no token, it means user is not logged in or token is not ready.
            // This component might render before auth context is fully loaded.
            // Set counts to 0 and stop loading.
            setApplicationsCount(0);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/applications`, {
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
            // Count applications where backend_status is 'submitted'
            const submittedApplications = data.applications.filter(app => app.backend_status === 'submitted');
            setApplicationsCount(submittedApplications.length);

        } catch (err) {
            console.error("Failed to fetch applications count:", err);
            setError(err.message || 'Failed to load application count.');
            toast.error(`Failed to load application count: ${err.message}`);
            setApplicationsCount(0); // Reset count on error
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchApplicationsCount();
    }, [fetchApplicationsCount]);

    // Dynamic stats based on fetched data
    const stats = [
        {
            id: 1,
            title: "Applications",
            value: applicationsCount,
            icon: <TbUsers />,
            color: "bg-blue-50"
        },
        {
            id: 2,
            title: "Shortlisted",
            value: 0, // Set to 0 as requested
            icon: <FaRegRectangleList />,
            color: "bg-blue-50"
        },
        {
            id: 3,
            title: "Interviewed",
            value: 0, // Set to 0 as requested
            icon: <FiUserCheck />,
            color: "bg-blue-50"
        },
        {
            id: 4,
            title: "Profile Viewed",
            value: 0, // Set to 0 as requested
            icon: <FaEye />,
            color: "bg-blue-50"
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-lg shadow p-3 animate-pulse">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-600 bg-red-50 rounded-lg shadow-sm mb-6">
                <p>Error loading activity data.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
                <div key={stat.id} className="bg-white rounded-lg shadow p-3">
                    <div className="flex justify-between items-center">
                        {/* Left Section - Number and Text */}
                        <div>
                            <h3 className="text-3xl font-bold text-gray-700">{stat.value}</h3>
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
            ))}
        </div>
    );
};

export default ProfileActivity;
