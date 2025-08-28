// src/pages/employer/JobApplicantsListPage.jsx
import API_BASE_URL from "../config"; // Add this line
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSyncAlt, FaFilter, FaArchive, FaEye, FaUser } from 'react-icons/fa';
import { ChevronRight, Eye, Trash2, Star, ArrowLeft, Filter, RefreshCcw, Archive, ChevronDown, ChevronUp } from 'lucide-react';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const JobApplicantsListPage = () => {
    const { jobId } = useParams(); // Get jobId from URL
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const location = useLocation(); // To get state passed from navigate
    const jobTitle = location.state?.jobTitle || 'Job Applicants'; // Get jobTitle from state or default

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplicantsForJob = useCallback(async () => {
        if (!token || !user || user.role !== 'employer') {
            setError('Unauthorized. Please log in as an employer.');
            setLoading(false);
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/employer/jobs/${jobId}/applicants`, {
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
            // jobTitle might be more accurate from backend if available, but for now, use state
            // setJobTitle(data.job_title || jobTitle);
            toast.success(data.message || `Applicants for "${data.job_title || 'this job'}" loaded successfully!`);
        } catch (err) {
            console.error("Error fetching applicants for job:", err);
            setError(err.message || "Failed to load applicants for this job.");
            toast.error(err.message || "Failed to load applicants for this job.");
        } finally {
            setLoading(false);
        }
    }, [token, user, navigate, jobId]);

    useEffect(() => {
        fetchApplicantsForJob();
    }, [fetchApplicantsForJob]);

    const handleViewApplicantDetails = (applicationId) => {
        // Navigate to the existing ApplicantDetailsPage
        navigate(`/employer/applicants/${applicationId}`);
    };

    const handleBackToPostedJobs = () => {
        navigate('/employer/posted-jobs');
    };

    const handleRefresh = () => {
        fetchApplicantsForJob();
    };

    const handleFilter = () => {
        toast.info("Filter functionality to be implemented.");
    };

    const handleArchive = () => {
        toast.info("Archive functionality to be implemented.");
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading applicants for "{jobTitle}"...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    return (
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#003893]">Applicants for "{jobTitle}"</h1>
                    <div className="flex gap-3 text-lg">
                        <button
                            onClick={handleBackToPostedJobs}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                            title="Back to Posted Jobs"
                        >
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>
                        <button
                            onClick={handleFilter}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                            title="Filter Applicants"
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
                            title="Archive Applications"
                        >
                            <Archive size={20} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                {applicants.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p className="text-lg mb-2">No applicants for this job yet.</p>
                        <p>Share this job posting to attract more candidates!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applicants.map(applicant => (
                            <div
                                key={applicant.id} // This is the application ID
                                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:shadow-md transition-shadow duration-200"
                                onClick={() => handleViewApplicantDetails(applicant.id)}
                            >
                                <div className="flex-grow">
                                    <div className="flex items-center mb-2">
                                        <FaUser className="w-10 h-10 text-blue-500 bg-blue-100 rounded-full p-2 mr-3" />
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">{applicant.applicantName}</h2>
                                            <p className="text-gray-600 text-sm">{applicant.applicantEmail}</p>
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
                                        onClick={(e) => { e.stopPropagation(); handleViewApplicantDetails(applicant.id); }}
                                        className="p-3 rounded-full bg-gray-200 text-[#003893] hover:bg-gray-100 hover:border-[#003893] transition duration-200"
                                        title="View Details"
                                    >
                                        <FaEye />
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

export default JobApplicantsListPage;
