// src/components/EmployerDashboard/LatestActivity.jsx
import API_BASE_URL from "../../config"; // Add this line
import React, { useState, useCallback, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Bell, User, FileText, MessageSquare, UploadCloud } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Assuming useAuth is available

// const API_BASE_URL = "http://10.120.30.250:8000/api"; // Your backend API base URL

const LatestActivity = () => {
    const { token, user } = useAuth();
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]); // e.g., [{ type: 'status', value: 'applied' }]
    const [activityData, setActivityData] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [errorActivity, setErrorActivity] = useState(null);

    // Filter options (for dropdown)
    const filterOptions = [
        { type: 'activity_type', label: 'New Application', value: 'new_application' },
        { type: 'activity_type', label: 'Document Upload', value: 'document_upload' },
        { type: 'activity_type', label: 'Comment', value: 'comment' },
        { type: 'activity_type', label: 'Profile View', value: 'profile_view' },
        { type: 'job_id', label: 'Job: Frontend Dev', value: '1' }, // Example: replace with actual job IDs
        { type: 'job_id', label: 'Job: Backend Dev', value: '2' },
        // Add more filter options as needed
    ];

    // Placeholder for fetching latest activities (requires backend API)
    const fetchLatestActivity = useCallback(async () => {
        if (!token || !user || user.role !== 'employer') {
            setLoadingActivity(false);
            setErrorActivity('Unauthorized or not an employer.');
            return;
        }

        setLoadingActivity(true);
        setErrorActivity(null);

        const queryParams = new URLSearchParams();
        activeFilters.forEach(filter => {
            queryParams.append(filter.type, filter.value);
        });

        const url = `${API_BASE_URL}/employer/latest-activities?${queryParams.toString()}`; // New API endpoint

        try {
            const response = await fetch(url, {
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
            setActivityData(data.activities); // Assuming backend returns { activities: [...] }
            toast.success(data.message || "Latest activities loaded!");
        } catch (err) {
            console.error("Error fetching latest activities:", err);
            setErrorActivity(err.message || "Failed to load latest activities.");
            toast.error(err.message || "Failed to load latest activities.");
        } finally {
            setLoadingActivity(false);
        }
    }, [token, user, activeFilters]); // Re-fetch when activeFilters change

    useEffect(() => {
        fetchLatestActivity();
    }, [fetchLatestActivity]);

    const toggleFilterDropdown = () => {
        setIsFilterDropdownOpen(prev => !prev);
    };

    const addFilter = (filterType, filterValue, filterLabel) => {
        // Prevent adding duplicate filters of the same type and value
        if (!activeFilters.some(f => f.type === filterType && f.value === filterValue)) {
            setActiveFilters(prev => [...prev, { type: filterType, value: filterValue, label: filterLabel }]);
        }
        setIsFilterDropdownOpen(false); // Close dropdown after selection
    };

    const removeFilter = (filterToRemove) => {
        setActiveFilters(prev => prev.filter(filter =>
            !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
        ));
    };

    // Helper to get icon based on activity type (for static data, will need mapping for real data)
    const getActivityIcon = (type) => {
        switch (type) {
            case 'new_application': return <FileText size={16} className="text-blue-500" />;
            case 'document_upload': return <UploadCloud size={16} className="text-green-500" />;
            case 'comment': return <MessageSquare size={16} className="text-purple-500" />;
            case 'profile_view': return <User size={16} className="text-gray-500" />;
            default: return <Bell size={16} className="text-yellow-500" />;
        }
    };

    if (loadingActivity) {
        return <div className="bg-white rounded-lg shadow p-4 h-full flex items-center justify-center">Loading latest activities...</div>;
    }

    if (errorActivity) {
        return <div className="bg-white rounded-lg shadow p-4 h-full flex items-center justify-center text-red-600">Error: {errorActivity}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 relative">
                <h3 className="text-lg font-semibold text-gray-800">Latest Activity</h3>
                <button
                    onClick={toggleFilterDropdown}
                    className="p-2 bg-gray-100 rounded-full shadow hover:bg-gray-200 transition-all duration-200 flex items-center"
                    title="Filter Activities"
                >
                    <Filter size={18} className="text-gray-700" />
                    {isFilterDropdownOpen ? <ChevronUp size={14} className="ml-1 text-gray-700" /> : <ChevronDown size={14} className="ml-1 text-gray-700" />}
                </button>

                {/* Filter Dropdown Content */}
                {isFilterDropdownOpen && (
                    <div className="absolute right-0 mt-12 w-64 bg-white rounded-lg shadow-lg z-10 p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Filter By:</h4>
                        <div className="space-y-2">
                            {filterOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => addFilter(option.type, option.value, option.label)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Applied Filters */}
            {activeFilters.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {activeFilters.map((filter, index) => (
                        <span key={index} className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            {filter.label}
                            <button
                                onClick={() => removeFilter(filter)}
                                className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {activityData.length === 0 ? (
                <div className="text-center text-gray-500 py-4 flex-grow flex items-center justify-center">No latest activities found.</div>
            ) : (
                <div className="space-y-3 flex-grow overflow-y-auto">
                    {activityData.map(activity => (
                        <div key={activity.id} className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-100">
                            <div className="flex-shrink-0 mr-3 mt-1">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                <p className="text-xs text-gray-500">{activity.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LatestActivity;
