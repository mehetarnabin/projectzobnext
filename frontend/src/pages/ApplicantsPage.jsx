// src/pages/employer/ApplicantsPage.jsx
import API_BASE_URL from "../config"; // Add this line
import React, { useEffect, useState, useCallback, useRef } from 'react'; // Added useRef
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser } from 'react-icons/fa';
import { ArrowLeft, Filter, RefreshCcw, Archive, ChevronDown, ChevronUp, Briefcase, CalendarDays, ListFilter, Eye } from 'lucide-react';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const ApplicantsPage = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [selectedJobFilter, setSelectedJobFilter] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [filterDateRange, setFilterDateRange] = useState('');
    const [employerJobs, setEmployerJobs] = useState([]);

    // useRef to track if it's the initial mount. This prevents fetchApplicants
    // from running on every filter state change before "Apply" is clicked.
    const isInitialMount = useRef(true);

    // Fetch employer's jobs for the "Filter by Job" dropdown
    const fetchEmployerJobs = useCallback(async () => {
        if (!token || !user || user.role !== 'employer') {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/employer/jobs`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setEmployerJobs(data.jobs);
            } else {
                console.error("Failed to fetch employer jobs for filter.");
            }
        } catch (err) {
            console.error("Error fetching employer jobs for filter:", err);
        }
    }, [token, user]);

    // fetchApplicants now takes current filter states as arguments
    // This allows us to control when it's called with specific filter values
    const fetchApplicants = useCallback(async (jobId, status, dateRange) => {
        if (!token || !user || user.role !== 'employer') {
            setError('Unauthorized. Please log in as an employer.');
            setLoading(false);
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (jobId) {
            queryParams.append('job_id', jobId);
        }
        if (status) {
            queryParams.append('status', status);
        }
        if (dateRange) {
            queryParams.append('date_range', dateRange);
        }

        const url = `${API_BASE_URL}/employer/applicants?${queryParams.toString()}`;

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
            setApplicants(data.applicants);
            toast.success(data.message || "Applicants loaded successfully!");
        } catch (err) {
            console.error("Error fetching applicants:", err);
            setError(err.message || "Failed to load applicants.");
            toast.error(err.message || "Failed to load applicants.");
        } finally {
            setLoading(false);
        }
    }, [token, user, navigate]); // Dependencies are now only token, user, navigate

    useEffect(() => {
        // On initial mount, fetch applicants without any filters
        if (isInitialMount.current) {
            fetchApplicants('', '', ''); // Call with empty filters
            isInitialMount.current = false;
        }
        fetchEmployerJobs(); // Fetch jobs for the dropdown
    }, [fetchApplicants, fetchEmployerJobs]); // Only depends on the fetch functions

    const handleViewDetails = (applicationId) => {
        navigate(`/employer/applicants/${applicationId}`);
    };

    const handleBackToDashboard = () => {
        navigate('/employer/dashboard');
    };

    const toggleFilterDropdown = () => {
        setIsFilterDropdownOpen(prev => !prev);
    };

    const handleRefresh = () => {
        // Reset filters and then explicitly fetch
        setSelectedJobFilter('');
        setSelectedStatusFilter('');
        setFilterDateRange('');
        fetchApplicants('', '', ''); // Fetch with no filters
        toast.info("Filters reset and refreshing applicants.");
    };

    const handleArchive = () => {
        toast.info("Archive functionality to be implemented.");
    };

    // Apply filters and close dropdown
    const applyFilters = () => {
        // Explicitly call fetchApplicants with current filter states
        fetchApplicants(selectedJobFilter, selectedStatusFilter, filterDateRange);
        setIsFilterDropdownOpen(false); // Close dropdown after applying
    };

    // Reset filters and close dropdown
    const resetFilters = () => {
        setSelectedJobFilter('');
        setSelectedStatusFilter('');
        setFilterDateRange('');
        fetchApplicants('', '', ''); // Fetch with no filters
        setIsFilterDropdownOpen(false); // Close dropdown
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading applicants...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    return (
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#003893]">Job Applicants</h1>
                    <div className="flex gap-3 text-lg relative">
                        <button
                            onClick={handleBackToDashboard}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>
                        <button
                            onClick={toggleFilterDropdown}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200 flex items-center"
                            title="Filter Applicants"
                        >
                            <Filter size={20} className="text-gray-700" />
                            {isFilterDropdownOpen ? <ChevronUp size={16} className="ml-1 text-gray-700" /> : <ChevronDown size={16} className="ml-1 text-gray-700" />}
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                            title="Refresh List"
                        >
                            <RefreshCcw size={20} className="text-gray-700" />
                        </button>
                        <button
                            onClick={handleArchive}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                            title="Archive Applications"
                        >
                            <Archive size={20} className="text-gray-700" />
                        </button>

                        {/* Filter Dropdown Content */}
                        {isFilterDropdownOpen && (
                            <div className="absolute right-0 mt-12 w-72 bg-white rounded-lg shadow-lg z-10 p-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-3">Filter Applicants</h3>

                                {/* Filter by Job */}
                                <div className="mb-4">
                                    <label htmlFor="jobFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Briefcase size={16} /> Filter by Job:
                                    </label>
                                    <select
                                        id="jobFilter"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        value={selectedJobFilter}
                                        onChange={(e) => setSelectedJobFilter(e.target.value)}
                                    >
                                        <option value="">All Jobs</option>
                                        {employerJobs.map(job => (
                                            <option key={job.id} value={job.id}>{job.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filter by Status */}
                                <div className="mb-4">
                                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <ListFilter size={16} /> Filter by Status:
                                    </label>
                                    <select
                                        id="statusFilter"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        value={selectedStatusFilter}
                                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="interview">Interview</option>
                                        <option value="selected">Selected</option>
                                        <option value="hired">Hired</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* Filter by Date */}
                                <div className="mb-4">
                                    <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <CalendarDays size={16} /> Filter by Date:
                                    </label>
                                    <select
                                        id="dateFilter"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        value={filterDateRange}
                                        onChange={(e) => setFilterDateRange(e.target.value)}
                                    >
                                        <option value="">Any Date</option>
                                        <option value="today">Today</option>
                                        <option value="last_7_days">Last 7 Days</option>
                                        <option value="last_30_days">Last 30 Days</option>
                                        <option value="this_month">This Month</option>
                                        <option value="this_year">This Year</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {applicants.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p className="text-lg mb-2">No applicants for your jobs yet.</p>
                        <p>Share your job postings to attract more candidates!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applicants.map(applicant => (
                            <div
                                key={applicant.id}
                                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:shadow-md transition-shadow duration-200"
                                onClick={() => handleViewDetails(applicant.id)}
                            >
                                <div className="flex-grow">
                                    <div className="flex items-center mb-2">
                                        <FaUser className="w-10 h-10 text-blue-500 bg-blue-100 rounded-full p-2 mr-3" />
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">{applicant.applicantName}</h2>
                                            <p className="text-gray-600 text-sm">Applied for: <span className="font-medium text-[#003893]">{applicant.jobTitle}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-gray-500 text-sm space-y-1 mt-2 md:mt-0">
                                        <p>Applied: {applicant.appliedAt}</p>
                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full text-white ${
                                            applicant.backend_status === 'submitted' ? 'bg-blue-600' :
                                            applicant.backend_status === 'shortlisted' ? 'bg-green-600' :
                                            applicant.backend_status === 'interview' ? 'bg-purple-600' :
                                            applicant.backend_status === 'selected' ? 'bg-orange-600' :
                                            applicant.backend_status === 'hired' ? 'bg-teal-600' :
                                            applicant.backend_status === 'rejected' ? 'bg-red-600' :
                                            'bg-gray-500'
                                        }`}>
                                            Status: {applicant.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 mt-4 md:mt-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(applicant.id); }}
                                        className="p-3 rounded-full bg-gray-200 text-[#003893] hover:bg-gray-100 hover:border-[#003893] transition duration-200"
                                        title="View Details"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicantsPage;
