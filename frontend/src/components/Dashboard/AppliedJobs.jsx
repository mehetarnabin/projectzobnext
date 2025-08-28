// src/components/AppliedJobs.jsx
import API_BASE_URL from "../../config"; // Add this line
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Eye, Trash2, Star, ArrowLeft, Filter, RefreshCcw, Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const AppliedJobs = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedJobId, setExpandedJobId] = useState(null);

    const fetchAppliedJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError('Authentication token not found. Please log in.');
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
            const formattedJobs = data.applications.map(app => ({
                id: app.id,
                job_id: app.job_id,
                companyLogo: app.companyLogo,
                jobTitle: app.jobTitle,
                companyName: app.companyName,
                location: app.location,
                salary: app.salary,
                status: app.status, // This will now correctly receive 'Applied', 'Shortlisted', 'Interviewed', 'Offered'
                backend_status: app.backend_status,
                description: app.description,
                isStarred: app.isStarred || false,
                showActions: false,
                isExpanded: false,
            }));

            setJobs(formattedJobs);
            toast.success('Applied jobs loaded successfully!');
        } catch (err) {
            console.error("Failed to fetch applied jobs:", err);
            setError(err.message || 'Failed to load applied jobs.');
            toast.error(`Failed to load applied jobs: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAppliedJobs();
    }, [fetchAppliedJobs]);

    const handleStarToggle = (id) => {
        setJobs(jobs.map(job =>
            job.id === id ? { ...job, isStarred: !job.isStarred } : job
        ));
        // TODO: Send update to backend
    };

    const handleToggleActions = (id) => {
        setJobs(jobs.map(job =>
            job.id === id ? { ...job, showActions: !job.showActions } : { ...job, showActions: false }
        ));
    };

    const handleToggleExpand = (id) => {
        setExpandedJobId(expandedJobId === id ? null : id);
    };

    const handleViewDetails = (job) => {
        console.log('Viewing details for:', job.jobTitle, job.job_id);
        // Example: navigate(`/jobs/${job.job_id}`);
        toast.info(`Viewing details for: ${job.jobTitle}`);
    };

    const handleDeleteJob = (job) => {
        if (window.confirm(`Are you sure you want to archive this application for "${job.jobTitle}"?`)) {
            console.log('Archiving job application:', job.id);
            // TODO: Send API call to change status to 'archived'
            setJobs(jobs.filter(j => j.id !== job.id));
            toast.success(`Application for "${job.jobTitle}" archived.`);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Applied':
                return 'bg-[#003893]';
            case 'Shortlisted':
                return 'bg-green-600';
            case 'Interviewed':
                return 'bg-purple-600';
            case 'Offered':
                return 'bg-teal-600';
            case 'Rejected':
                return 'bg-red-600';
            case 'Draft':
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <p className="text-gray-600 text-lg">Loading your applied jobs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg shadow-sm">
                <p>Error: {error}</p>
                <button
                    onClick={fetchAppliedJobs}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center p-8 text-gray-600 bg-white rounded-lg shadow-md">
                <p className="text-xl font-semibold mb-4">No jobs applied yet!</p>
                <p>Start exploring job listings to find your next opportunity.</p>
                <button
                    onClick={() => navigate('/jobs')}
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
                >
                    Browse Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Top Right Icons */}
            <div className="flex justify-end gap-4 mb-6">
                <button
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                    aria-label="Back to Dashboard"
                    onClick={() => navigate('/jobseeker/dashboard')}
                >
                    <ArrowLeft size={20} className="text-gray-700" />
                </button>
                <button
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                    aria-label="Filter Jobs"
                >
                    <Filter size={20} className="text-gray-700" />
                </button>
                <button
                    onClick={fetchAppliedJobs}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                    aria-label="Refresh Jobs"
                >
                    <RefreshCcw size={20} className="text-gray-700" />
                </button>
                <button
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                    aria-label="View Archive"
                >
                    <Archive size={20} className="text-gray-700" />
                </button>
            </div>

            {/* List of Applied Jobs */}
            <div className="space-y-4">
                {jobs.map((job) => (
                    <div key={job.id} className="relative flex flex-col bg-white rounded-xl shadow-md p-4 overflow-hidden">
                        {/* Clickable Header for Expansion */}
                        <div
                            className="flex flex-col sm:flex-row items-start sm:items-center w-full cursor-pointer"
                            onClick={() => handleToggleExpand(job.id)}
                        >
                            {/* Company Logo */}
                            <div className="flex-shrink-0 mr-4 mb-4 sm:mb-0">
                                <img
                                    src={job.companyLogo}
                                    alt="Company Logo"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://placehold.co/50x50/cccccc/000?text=No+Logo`;
                                    }}
                                />
                            </div>

                            {/* Job Details */}
                            <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                                <h3 className="text-lg font-semibold text-gray-800 truncate">{job.jobTitle}</h3>
                                <p className="text-sm text-gray-600 truncate">{job.companyName} | {job.location} | {job.salary}</p>
                            </div>

                            {/* Status Indicator and Action Toggle */}
                            <div className="flex flex-wrap gap-2 justify-start items-center sm:justify-center mx-auto md:mx-0 min-w-max ml-0 sm:ml-4">
                                {/* Only show the current status */}
                                <span
                                    className={`px-4 py-2 text-xs font-semibold rounded-full text-white flex items-center h-7 ${getStatusStyle(job.status)} transition-colors duration-200`}
                                >
                                    {job.status}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStarToggle(job.id); }}
                                    className={`p-2 rounded-full transition-colors duration-200 ${job.isStarred ? 'text-yellow-500 bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'}`}
                                    aria-label={job.isStarred ? "Unstar Job" : "Star Job"}
                                >
                                    <Star size={20} fill={job.isStarred ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleActions(job.id); }}
                                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                                    aria-label={job.showActions ? "Hide Actions" : "Show Actions"}
                                >
                                    <ChevronRight size={20} className={`${job.showActions ? 'rotate-90' : ''} transition-transform duration-200`} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleExpand(job.id); }}
                                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                                    aria-label={expandedJobId === job.id ? "Collapse Description" : "Expand Description"}
                                >
                                    {expandedJobId === job.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Description */}
                        {expandedJobId === job.id && job.description && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-line">
                                <h4 className="font-semibold mb-2">Job Description:</h4>
                                <div dangerouslySetInnerHTML={{ __html: job.description }}></div>
                            </div>
                        )}

                        {/* Expanded Action Box (positioned relative to the job item) */}
                        {job.showActions && (
                            <div className="flex flex-col md:flex-row items-center p-2 mt-4 bg-blue-50 rounded-xl shadow-inner md:absolute md:top-1/2 md:-translate-y-1/2 md:right-0 md:transform md:translate-x-full md:min-w-max transition-transform duration-300 ease-out z-10">
                                <button
                                    onClick={() => handleViewDetails(job)}
                                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                                    aria-label="View Job Details"
                                >
                                    <Eye size={20} />
                                </button>
                                <button
                                    onClick={() => handleDeleteJob(job)}
                                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-200"
                                    aria-label="Delete Job"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppliedJobs;
