// src/pages/employer/PostedJobsPage.jsx
import API_BASE_URL from "../config"; // Add this line
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSyncAlt, FaFilter, FaArchive, FaEdit, FaTrash, FaMapMarkerAlt, FaDollarSign, FaBriefcase, FaClock, FaEye } from 'react-icons/fa'; // Added FaEye
import { ChevronRight, Eye, Trash2, Star, ArrowLeft, Filter, RefreshCcw, Archive, ChevronDown, ChevronUp } from 'lucide-react';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const PostedJobsPage = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [postedJobs, setPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedJobId, setExpandedJobId] = useState(null);

    const fetchPostedJobs = useCallback(async () => {
        if (!token || !user || user.role !== 'employer') {
            setError('Unauthorized. Please log in as an employer.');
            setLoading(false);
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/employer/jobs`, {
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
            setPostedJobs(data.jobs);
            toast.success(data.message || "Posted jobs loaded successfully!");
        } catch (err) {
            console.error("Error fetching posted jobs:", err);
            setError(err.message || "Failed to load posted jobs.");
            toast.error(err.message || "Failed to load posted jobs.");
        } finally {
            setLoading(false);
        }
    }, [token, user, navigate]);

    useEffect(() => {
        fetchPostedJobs();
    }, [fetchPostedJobs]);

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            toast.success("Job deleted successfully!");
            setPostedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        } catch (err) {
            console.error("Error deleting job:", err);
            toast.error(err.message || "Failed to delete job.");
        }
    };

    const handleEditJob = (jobId) => {
        navigate(`/employer/jobs/${jobId}/edit`);
    };

    // --- NEW: Handle view applicants for a specific job ---
    const handleViewApplicants = (jobId, jobTitle) => {
        navigate(`/employer/jobs/${jobId}/applicants`, { state: { jobTitle } });
    };
    // --- END NEW ---

    const handleBackToDashboard = () => {
        navigate('/employer/dashboard');
    };

    const handleRefresh = () => {
        fetchPostedJobs();
    };

    const handleFilter = () => {
        toast.info("Filter functionality to be implemented.");
    };

    const handleArchive = () => {
        toast.info("Archive functionality to be implemented.");
    };

    const handleToggleExpand = (jobId) => {
        setExpandedJobId(expandedJobId === jobId ? null : jobId);
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading your posted jobs...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    return (
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#003893]">Your Posted Jobs</h1>
                    <div className="flex gap-3 text-lg">
                        <button
                            onClick={handleBackToDashboard}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>
                        <button
                            onClick={handleFilter}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                            title="Filter Jobs"
                        >
                            <Filter size={20} className="text-gray-700" />
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
                            title="Archive Jobs"
                        >
                            <Archive size={20} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                {postedJobs.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p className="text-lg mb-2">You haven't posted any jobs yet.</p>
                        <button
                            onClick={() => navigate('/employer/post-job')}
                            className="bg-[#003893] text-white px-5 py-2 rounded-lg hover:bg-[#002a7a] transition duration-200"
                        >
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {postedJobs.map(job => (
                            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col">
                                {/* Job Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer" onClick={() => handleToggleExpand(job.id)}>
                                    <div className="flex-grow">
                                        <div className="flex items-center mb-2">
                                            {job.logo && (
                                                <img
                                                    src={job.logo}
                                                    alt="Company Logo"
                                                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/50x50/cccccc/000?text=No+Logo`; }}
                                                />
                                            )}
                                            <div>
                                                <h2 className="text-xl font-semibold text-[#003893]">{job.title}</h2>
                                                <p className="text-gray-700">{job.company}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-600 text-sm space-y-1">
                                            <p className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400" /> {job.location}</p>
                                            <p className="flex items-center gap-1"><FaBriefcase className="text-gray-400" /> {job.work_type} ({job.workplace})</p>
                                            <p className="flex items-center gap-1"><FaDollarSign className="text-gray-400" /> {job.salary} {job.salary_type}</p>
                                            {job.posted && <p className="flex items-center gap-1"><FaClock className="text-gray-400" /> Posted: {job.posted}</p>}
                                            {job.remainingdate && <p className="flex items-center gap-1"><FaClock className="text-gray-400" /> Apply before: {job.remainingdate}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleViewApplicants(job.id, job.title); }}
                                            className="p-3 rounded-full bg-gray-200 text-[#003893] hover:bg-gray-100 hover:border-[#003893] transition duration-200"
                                            title="View Applicants"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditJob(job.id); }}
                                            className="p-3 rounded-full bg-gray-200 text-[#003893] hover:bg-gray-100 hover:border-[#003893] transition duration-200"
                                            title="Edit Job"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                                            className="p-3 rounded-full bg-gray-200 text-[#003893] hover:bg-gray-100 hover:border-[#003893] transition duration-200"
                                            title="Delete Job"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Description */}
                                {expandedJobId === job.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700 text-sm whitespace-pre-line">
                                        <h4 className="font-semibold mb-2">Job Description:</h4>
                                        <div dangerouslySetInnerHTML={{ __html: job.description }}></div>

                                        {job.key_points && job.key_points.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold mb-2">Key Selling Points:</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {job.key_points.map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {job.video_url && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold mb-2">Job Video:</h4>
                                                <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
                                                    <iframe
                                                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                        src={job.video_url}
                                                        title="Job Video"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostedJobsPage;
