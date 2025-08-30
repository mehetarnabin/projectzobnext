// src/pages/employer/ApplicantDetailsPage.jsx
import API_BASE_URL from "../config"; // Add this line
import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaDownload, FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaCertificate, FaFileAlt, FaCheckCircle, FaTimesCircle, FaRobot, FaCalendarAlt, FaUserTie, FaHandshake } from 'react-icons/fa'; // Added FaUserTie, FaHandshake
import { ArrowLeft, Eye } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const ApplicantDetailsPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [applicantDetails, setApplicantDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestedDocumentTypes, setRequestedDocumentTypes] = useState([]);
    const [isRequestingDocuments, setIsRequestingDocuments] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [aiMatchPercentage, setAiMatchPercentage] = useState(null); // New state for AI match

    // Simulate AI Match Percentage (replace with actual AI call later)
    useEffect(() => {
        if (applicantDetails) {
            // This is a placeholder. In a real app, you'd call an AI API here.
            // For now, generate a random percentage between 50 and 95.
            setAiMatchPercentage(Math.floor(Math.random() * (95 - 50 + 1)) + 50);
        }
    }, [applicantDetails]);

    const fetchApplicantDetails = useCallback(async () => {
        if (!token || !user || user.role !== 'employer') {
            setError('Unauthorized. Please log in as an employer.');
            setLoading(false);
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/employer/applicants/${applicationId}`, {
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
            setApplicantDetails(data.applicant_details);
            toast.success(data.message || "Applicant details loaded successfully!");
        } catch (err) {
            console.error("Error fetching applicant details:", err);
            setError(err.message || "Failed to load applicant details.");
            toast.error(err.message || "Failed to load applicant details.");
        } finally {
            setLoading(false);
        }
    }, [token, user, navigate, applicationId]);

    useEffect(() => {
        fetchApplicantDetails();
    }, [fetchApplicantDetails]);

    const handleUpdateStatus = async (newStatus) => {
        if (!applicantDetails || isUpdatingStatus) {
            return;
        }

        // Prevent action if already in the target status
        if (applicantDetails.backendStatus === newStatus) {
            toast.info(`Application is already ${ucfirst(newStatus)}.`);
            return;
        }

        // Specific status transition rules
        if (newStatus === 'shortlisted' && applicantDetails.backendStatus !== 'submitted') {
            toast.info("Only 'Submitted' applications can be 'Shortlisted'.");
            return;
        }
        if (newStatus === 'interview' && applicantDetails.backendStatus !== 'shortlisted') {
            toast.info("Only 'Shortlisted' applications can proceed to 'Interview'.");
            return;
        }
        if (newStatus === 'selected' && applicantDetails.backendStatus !== 'interview') {
            toast.info("Only 'Interview' applications can be 'Selected'.");
            return;
        }
        if (newStatus === 'hired' && applicantDetails.backendStatus !== 'selected') {
            toast.info("Only 'Selected' applications can be 'Hired'.");
            return;
        }
        // Reject can happen from any non-rejected, non-hired state
        if (newStatus === 'rejected' && (applicantDetails.backendStatus === 'rejected' || applicantDetails.backendStatus === 'hired')) {
            toast.info("Cannot reject an application that is already rejected or hired.");
            return;
        }


        if (!window.confirm(`Are you sure you want to set this application status to '${ucfirst(newStatus)}'?`)) {
            return;
        }

        setIsUpdatingStatus(true);
        try {
            const response = await fetch(`${API_BASE_URL}/employer/applicants/${applicationId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setApplicantDetails(prevDetails => ({
                ...prevDetails,
                applicationStatus: ucfirst(newStatus),
                backendStatus: newStatus,
            }));
            toast.success(data.message || `Application status updated to ${ucfirst(newStatus)}.`);
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error(err.message || "Failed to update application status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleRequestDocuments = async () => {
        if (!requestMessage.trim()) {
            toast.error("Please provide a message for the document request.");
            return;
        }

        setIsRequestingDocuments(true);
        try {
            const response = await fetch(`${API_BASE_URL}/employer/applicants/${applicationId}/request-documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: requestMessage,
                    document_types: requestedDocumentTypes,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            toast.success(data.message || "Document request sent successfully!");
            setIsRequestModalOpen(false);
            setRequestMessage('');
            setRequestedDocumentTypes([]);
        } catch (err) {
            console.error("Error requesting documents:", err);
            toast.error(err.message || "Failed to send document request.");
        } finally {
            setIsRequestingDocuments(false);
        }
    };

    const handleScheduleInterview = () => {
        navigate(`/employer/applicants/${applicationId}/schedule-interview`);
    };

    const handleBack = () => {
        navigate('/employer/applicants');
    };

    const handleViewApplicantProfile = (applicantId) => {
        navigate(`/profile/${applicantId}`);
        toast.info("Navigating to applicant's profile.");
    };

    const handleDocumentTypeChange = (e) => {
        const { value, checked } = e.target;
        setRequestedDocumentTypes(prev =>
            checked ? [...prev, value] : prev.filter(type => type !== value)
        );
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading applicant details...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    if (!applicantDetails) {
        return <div className="p-6 text-center text-gray-600">Applicant details not found.</div>;
    }

    const {
        applicantName, applicantEmail, applicantPhone, applicantLocation, applicantAboutMe,
        jobTitle, // Keep jobTitle
        // companyName, jobLocation, jobSalary, jobDescription, // These are removed
        appliedAt, applicationStatus, backendStatus, documents_provided,
        applicant_id, experience_summary, education_summary, certifications_summary
    } = applicantDetails;

    // Determine button states and texts based on backendStatus
    const isSubmitted = backendStatus === 'submitted';
    const isShortlisted = backendStatus === 'shortlisted';
    const isInterview = backendStatus === 'interview';
    const isSelected = backendStatus === 'selected'; // New status
    const isHired = backendStatus === 'hired'; // New status
    const isRejected = backendStatus === 'rejected';

    // Button Visibility and Disabled Logic
    const showAcceptButton = isSubmitted;
    const showScheduleInterviewButton = isShortlisted;
    const showSelectedButton = isInterview;
    const showHireButton = isSelected;

    // Reject button is always shown unless already rejected or hired
    const showRejectButton = !isRejected && !isHired;

    // Disabled states for buttons
    const isAcceptButtonDisabled = isUpdatingStatus || !showAcceptButton;
    const isScheduleInterviewButtonDisabled = isUpdatingStatus || !showScheduleInterviewButton;
    const isSelectedButtonDisabled = isUpdatingStatus || !showSelectedButton;
    const isHireButtonDisabled = isUpdatingStatus || !showHireButton;
    const isRejectButtonDisabled = isUpdatingStatus || !showRejectButton;


    return (
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleBack}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                        title="Back to Applicants"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    {/* Dynamic Page Title */}
                    <h1 className="text-2xl font-bold text-[#003893]">
                        {jobTitle} &gt; {applicantName}
                    </h1>
                    <div></div>
                </div>

                {/* Applicant & Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FaUserCircle className="text-blue-500" /> {applicantName}
                        </h2>
                        <p className="text-gray-600 flex items-center gap-2 mb-1"><FaEnvelope className="text-gray-400" /> {applicantEmail}</p>
                        {applicantPhone && <p className="text-gray-600 flex items-center gap-2 mb-1"><FaPhone className="text-gray-400" /> {applicantPhone}</p>}
                        {applicantLocation && <p className="text-gray-600 flex items-center gap-2 mb-1"><FaMapMarkerAlt className="text-gray-400" /> {applicantLocation}</p>}
                        <p className="text-gray-500 text-sm mt-3">Applied: {appliedAt}</p>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full text-white mt-2 ${
                            backendStatus === 'submitted' ? 'bg-blue-600' :
                            backendStatus === 'shortlisted' ? 'bg-green-600' :
                            backendStatus === 'interview' ? 'bg-purple-600' :
                            backendStatus === 'selected' ? 'bg-orange-600' : // New color for 'selected'
                            backendStatus === 'offered' ? 'bg-teal-600' :
                            backendStatus === 'rejected' ? 'bg-red-600' :
                            backendStatus === 'hired' ? 'bg-indigo-600' :
                            'bg-gray-500'
                        }`}>
                            Status: {applicationStatus}
                        </span>
                    </div>

                    {/* Right Box: Applied Position & AI Match */}
                    <div className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Applied Position</h2>
                            <p className="text-gray-600 font-medium">{jobTitle}</p>
                        </div>
                        
                        {/* AI Match Percentage with Progress Bar */}
                        {aiMatchPercentage !== null && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FaRobot className="text-purple-500 text-xl" />
                                        <p className="text-gray-700 font-semibold">AI Match:</p>
                                    </div>
                                    <span className="text-lg font-bold text-purple-600">{aiMatchPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${aiMatchPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Based on skills and experience alignment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Applicant Summary Sections (remain unchanged) */}
                <div className="space-y-2 mb-2">
                    <div className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaUserCircle /> About Applicant</h3>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{applicantAboutMe}</p>
                    </div>

                    <div className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaBriefcase /> Work Experience</h3>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{experience_summary}</p>
                    </div>

                    <div className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaGraduationCap /> Education</h3>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{education_summary}</p>
                    </div>

                    <div className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaCertificate /> Certifications</h3>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{certifications_summary}</p>
                    </div>
                </div>


                {/* Documents Provided Section (remains unchanged) */}
                <div className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaFileAlt className="text-gray-800" /> Documents Provided
                    </h2>
                    {documents_provided && documents_provided.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2">
                            {documents_provided.map((doc, index) => (
                                <li key={index} className="flex items-center justify-between text-gray-700 text-sm">
                                    <span>{doc.name} ({doc.type})</span>
                                    {doc.url && doc.downloadable && (
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-4 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-200 flex items-center gap-1"
                                        >
                                            View/Download
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No specific documents listed for this application.</p>
                    )}
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center gap-2 text-sm"
                    >
                        Request Additional Documents
                    </button>
                </div>

                {/* Dynamic Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                    {/* Accept (Shortlist) Button */}
                    {showAcceptButton && (
                        <button
                            onClick={() => handleUpdateStatus('shortlisted')}
                            className={`text-sm flex items-center gap-1 px-4 py-2 transition duration-200 border rounded-4xl
                                ${isAcceptButtonDisabled ? 'bg-[#003893] text-white cursor-not-allowed opacity-50' : 'bg-white text-[#003893] border-[#003893] hover:bg-[#003893] hover:text-white'}
                            `}
                            disabled={isAcceptButtonDisabled}
                        >
                            Accept (Shortlist)
                        </button>
                    )}

                    {/* Schedule Interview Button */}
                    {showScheduleInterviewButton && (
                        <button
                            onClick={handleScheduleInterview}
                            className={`text-sm flex items-center gap-1 px-4 py-2 transition duration-200 border rounded-4xl
                                ${isScheduleInterviewButtonDisabled ? 'bg-[#003893] text-white cursor-not-allowed opacity-50' : 'bg-white text-[#003893] border-[#003893] hover:bg-[#003893] hover:text-white'}
                            `}
                            disabled={isScheduleInterviewButtonDisabled}
                        >
                            Schedule Interview
                        </button>
                    )}

                    {/* Selected Button */}
                    {showSelectedButton && (
                        <button
                            onClick={() => handleUpdateStatus('selected')}
                            className={`text-sm flex items-center gap-1 px-4 py-2 transition duration-200 border rounded-4xl
                                ${isSelected ? 'bg-[#003893] text-white cursor-not-allowed opacity-50' : 'bg-white text-[#003893] border-[#003893] hover:bg-[#003893] hover:text-white'}
                            `}
                            disabled={isSelectedButtonDisabled}
                        >
                            Selected
                        </button>
                    )}

                    {/* Hire Button */}
                    {showHireButton && (
                        <button
                            onClick={() => handleUpdateStatus('hired')}
                            className={`text-sm flex items-center gap-1 px-4 py-2 transition duration-200 border rounded-4xl
                                ${isHired ? 'bg-[#003893] text-white cursor-not-allowed opacity-50' : 'bg-white text-[#003893] border-[#003893] hover:bg-[#003893] hover:text-white'}
                            `}
                            disabled={isHireButtonDisabled}
                        >
                            Hire
                        </button>
                    )}

                    {/* Reject Button (Always visible unless already rejected or hired) */}
                    {showRejectButton && (
                        <button
                            onClick={() => handleUpdateStatus('rejected')}
                            className={`text-sm flex items-center gap-1 px-4 py-2 transition duration-200 border rounded-4xl
                                ${isRejected ? 'bg-red-600 text-white cursor-not-allowed opacity-50' : 'bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white'}
                            `}
                            disabled={isRejectButtonDisabled}
                        >
                            Reject
                        </button>
                    )}
                </div>

                {/* Request Additional Documents Modal (remains unchanged) */}
                <Transition appear show={isRequestModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-10" onClose={() => setIsRequestModalOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900"
                                        >
                                            Request Additional Documents
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-4">
                                                Send a message to {applicantName} requesting additional documents.
                                            </p>
                                            <div className="mb-4">
                                                <label htmlFor="requestMessage" className="block text-sm font-medium text-gray-700">
                                                    Message to Applicant:
                                                </label>
                                                <textarea
                                                    id="requestMessage"
                                                    rows="4"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    value={requestMessage}
                                                    onChange={(e) => setRequestMessage(e.target.value)}
                                                    placeholder="e.g., Please provide your portfolio and a copy of your degree certificate."
                                                ></textarea>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Suggest Document Types (Optional):
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Portfolio', 'Certificate', 'Transcript', 'Work Sample', 'Reference Letter'].map(type => (
                                                        <label key={type} className="inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                                value={type}
                                                                checked={requestedDocumentTypes.includes(type)}
                                                                onChange={handleDocumentTypeChange}
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                                onClick={() => setIsRequestModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                onClick={handleRequestDocuments}
                                                disabled={isRequestingDocuments}
                                            >
                                                {isRequestingDocuments ? 'Sending...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

// Helper function to capitalize first letter and replace underscores
const ucfirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
};

export default ApplicantDetailsPage;
