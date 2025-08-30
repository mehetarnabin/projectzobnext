// src/components/AppliedJobs.jsx
import API_BASE_URL from "../../config"; // Add this line
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Eye, 
  X, 
  Star, 
  ArrowLeft, 
  Filter, 
  RefreshCcw, 
  Archive, 
  ChevronDown, 
  ChevronUp,
  Search,
  RotateCcw,
  Download,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const AppliedJobs = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    
    // Dummy data for applied jobs - matching ShortlistedCandidate structure
    const [jobs, setJobs] = useState([
        {
            id: 1,
            jobTitle: "Job Title",
            companyName: "Location | Salary",
            location: "Mumbai, Maharashtra",
            salary: "₹8-12 LPA",
            appliedDate: "2024-01-15",
            status: "Applied",
            statusColor: "bg-yellow-500 text-white",
            description: "React.js developer position with 2+ years experience required.",
            companyLogo: "https://placehold.co/50x50/007bff/ffffff?text=J",
            job_id: 1
        },
        {
            id: 2,
            jobTitle: "Job Title",
            companyName: "Location | Salary",
            location: "Bangalore, Karnataka",
            salary: "₹6-10 LPA",
            appliedDate: "2024-01-12",
            status: "Shortlisted",
            statusColor: "bg-blue-500 text-white",
            description: "Creative UI/UX designer with Figma and Adobe XD expertise.",
            companyLogo: "https://placehold.co/50x50/007bff/ffffff?text=J",
            job_id: 2
        },
        {
            id: 3,
            jobTitle: "Job Title",
            companyName: "Location | Salary",
            location: "Pune, Maharashtra",
            salary: "₹10-15 LPA",
            appliedDate: "2024-01-10",
            status: "Interviewed",
            statusColor: "bg-red-500 text-white",
            description: "Node.js backend developer with database management skills.",
            companyLogo: "https://placehold.co/50x50/007bff/ffffff?text=J",
            job_id: 3
        },
        {
            id: 4,
            jobTitle: "Job Title",
            companyName: "Location | Salary",
            location: "Delhi, NCR",
            salary: "₹12-18 LPA",
            appliedDate: "2024-01-08",
            status: "Offered",
            statusColor: "bg-green-500 text-white",
            description: "Full stack developer with React and Node.js experience.",
            companyLogo: "https://placehold.co/50x50/007bff/ffffff?text=J",
            job_id: 4
        }
    ]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedJobId, setExpandedJobId] = useState(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showSearch, setShowSearch] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [actionDropdowns, setActionDropdowns] = useState({});

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.search-container') && showSearch) {
                setShowSearch(false);
            }
            if (!event.target.closest('.filter-container') && showFilter) {
                setShowFilter(false);
            }
            if (!event.target.closest('.action-dropdown')) {
                setActionDropdowns({});
            }
        };

        if (showSearch || showFilter || Object.keys(actionDropdowns).length > 0) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearch, showFilter, actionDropdowns]);

    const fetchAppliedJobs = useCallback(async () => {
        // Dummy function - keeping for compatibility
        console.log('Jobs already loaded with dummy data');
    }, [token]);

    // Filter jobs based on search and status
    const getFilteredJobs = () => {
        let filtered = jobs;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(job => 
                job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(job => 
                job.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        return filtered;
    };

    // Handle refresh
    const handleRefresh = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setShowSearch(false);
        setShowFilter(false);
        setActionDropdowns({});
        console.log('Refreshed job applications');
    };

    const handleStarToggle = (id) => {
        setJobs(jobs.map(job =>
            job.id === id ? { ...job, isStarred: !job.isStarred } : job
        ));
        // TODO: Send update to backend
    };

    const handleToggleActions = (id) => {
        setActionDropdowns(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleToggleExpand = (id) => {
        setExpandedJobId(expandedJobId === id ? null : id);
    };

    const handleViewDetails = (job) => {
        console.log('Viewing details for:', job.jobTitle, job.job_id);
        alert(`Viewing details for ${job.jobTitle}`);
    };

    const handleDeleteJob = (job) => {
        if (window.confirm(`Are you sure you want to remove this application for "${job.jobTitle}"?`)) {
            setJobs(jobs.filter(j => j.id !== job.id));
            setActionDropdowns({});
            toast.success(`Application for "${job.jobTitle}" removed.`);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Applied':
                return 'bg-yellow-500 text-white';
            case 'Shortlisted':
                return 'bg-blue-500 text-white';
            case 'Interviewed':
                return 'bg-red-500 text-white';
            case 'Offered':
                return 'bg-green-500 text-white';
            case 'Rejected':
                return 'bg-red-600 text-white';
            case 'Draft':
                return 'bg-gray-500 text-white';
            default:
                return 'bg-gray-400 text-white';
        }
    };

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'applied', label: 'Applied' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'interviewed', label: 'Interviewed' },
        { value: 'offered', label: 'Offered' }
    ];

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

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Applied Jobs</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            The applications, Shortlisted and Interviewed page are the same page. The tabs on the dashboard act as a filter.
                        </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {/* Search Button */}
                        <div className="relative search-container">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    showSearch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title="Search jobs"
                            >
                                <Search size={18} />
                            </button>
                            
                            {showSearch && (
                                <div className="absolute top-12 right-0 z-50">
                                    <input
                                        type="text"
                                        placeholder="Search jobs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        {/* Filter Button */}
                        <div className="relative filter-container">
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    showFilter ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title="Filter by status"
                            >
                                <Filter size={18} />
                            </button>
                            
                            {showFilter && (
                                <div className="absolute top-12 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-xl py-1 w-36">
                                    {statusOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setStatusFilter(option.value);
                                                setShowFilter(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                                statusFilter === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                            title="Refresh"
                        >
                            <RotateCcw size={18} />
                        </button>

                        {/* Copy Button */}
                        <button
                            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                            title="Copy"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="p-6">
                {getFilteredJobs().length > 0 ? (
                    <div className="space-y-4">
                        {getFilteredJobs().map((job) => (
                            <div 
                                key={job.id} 
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                            >
                                <div className="flex items-center justify-between">
                                    {/* Left Side - Job Info */}
                                    <div className="flex items-center space-x-4 flex-1">
                                        {/* Company Avatar - Blue Circle */}
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-lg">J</span>
                                        </div>
                                        
                                        {/* Job Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {job.jobTitle}
                                            </h3>
                                            <p className="text-sm text-gray-600">{job.companyName}</p>
                                        </div>
                                    </div>

                                    {/* Center - Status Badges */}
                                    <div className="flex items-center space-x-2 mx-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
                                            Applied
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                                            Shortlisted
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                                            Interviewed
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                                            Offered
                                        </span>
                                    </div>

                                    {/* Right Side - Action Buttons */}
                                    <div className="flex items-center space-x-2">
                                        {/* Info Button */}
                                        <button
                                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                            title="Info"
                                        >
                                            <span className="text-xs font-bold">i</span>
                                        </button>

                                        {/* View Button */}
                                        <button
                                            onClick={() => handleViewDetails(job)}
                                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                            title="View"
                                        >
                                            <Eye size={14} />
                                        </button>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleDeleteJob(job)}
                                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                                            title="Remove"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* No Results */
                    <div className="text-center py-12">
                        <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                        <p className="text-gray-500 mb-4">
                            {jobs.length === 0 
                                ? "You haven't applied for any jobs yet." 
                                : "No jobs match your search criteria."
                            }
                        </p>
                        {jobs.length > 0 && (
                            <button 
                                onClick={handleRefresh}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            {getFilteredJobs().length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing {getFilteredJobs().length} of {jobs.length} applications
                        {statusFilter !== 'all' && ` • Filtered by: ${statusFilter}`}
                        {searchTerm && ` • Search: "${searchTerm}"`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AppliedJobs;
