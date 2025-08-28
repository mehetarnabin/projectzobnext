// src/pages/employer/ScheduleInterviewPage.jsx
import API_BASE_URL from "../config"; // Add this line
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import datepicker styles
import { format } from 'date-fns'; // For formatting dates
import { ArrowLeft, Calendar, Clock, Link, MessageSquare, Users, Video } from 'lucide-react'; // Lucide icons

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const ScheduleInterviewPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [interviewLink, setInterviewLink] = useState('');
    const [interviewMessage, setInterviewMessage] = useState('');
    const [interviewDate, setInterviewDate] = useState(null); // Date object
    const [interviewTime, setInterviewTime] = useState(null); // Date object for time
    const [interviewType, setInterviewType] = useState('online'); // 'online', 'in-person', 'phone'
    const [interviewers, setInterviewers] = useState(''); // Comma-separated names
    const [isSending, setIsSending] = useState(false);

    // Fetch applicant details to display context
    const [applicantName, setApplicantName] = useState('Applicant');
    const [jobTitle, setJobTitle] = useState('Job');

    useEffect(() => {
        const fetchApplicantContext = async () => {
            if (!token || !user || user.role !== 'employer') {
                navigate('/login');
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/employer/applicants/${applicationId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setApplicantName(data.applicant_details.applicantName);
                    setJobTitle(data.applicant_details.jobTitle);
                } else {
                    console.error("Failed to fetch applicant context for interview page.");
                }
            } catch (err) {
                console.error("Error fetching applicant context:", err);
            }
        };
        fetchApplicantContext();
    }, [applicationId, token, user, navigate]);

    const handleSendInterviewRequest = async () => {
        if (!interviewLink.trim() || !interviewMessage.trim() || !interviewDate || !interviewTime) {
            toast.error("Please fill in all required fields: Meeting Link, Message, Date, and Time.");
            return;
        }

        setIsSending(true);
        try {
            const formattedDate = format(interviewDate, 'yyyy-MM-dd');
            const formattedTime = format(interviewTime, 'HH:mm'); // 24-hour format

            const payload = {
                interview_link: interviewLink,
                message: interviewMessage,
                interview_date: formattedDate,
                interview_time: formattedTime,
                interview_type: interviewType,
                interviewers: interviewers.split(',').map(s => s.trim()).filter(Boolean), // Array of names
            };

            const response = await fetch(`${API_BASE_URL}/employer/applicants/${applicationId}/schedule-interview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            toast.success(data.message || "Interview request sent successfully and status updated!");
            navigate(`/employer/applicants/${applicationId}`); // Go back to applicant details
        } catch (err) {
            console.error("Error sending interview request:", err);
            toast.error(err.message || "Failed to send interview request.");
        } finally {
            setIsSending(false);
        }
    };

    const handleCancel = () => {
        navigate(`/employer/applicants/${applicationId}`); // Go back to applicant details
    };

    return (
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleCancel}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200"
                        title="Back to Applicant Details"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-[#003893]">Schedule Interview</h1>
                    <div></div>
                </div>

                <p className="text-gray-700 mb-6">
                    Scheduling an interview for <span className="font-semibold">{applicantName}</span> for the position of <span className="font-semibold">{jobTitle}</span>.
                </p>

                <div className="space-y-6">
                    {/* Interview Type */}
                    <div>
                        <label htmlFor="interviewType" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Video size={16} /> Interview Type:
                        </label>
                        <select
                            id="interviewType"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            value={interviewType}
                            onChange={(e) => setInterviewType(e.target.value)}
                        >
                            <option value="online">Online (Video Call)</option>
                            <option value="in-person">In-Person</option>
                            <option value="phone">Phone Call</option>
                        </select>
                    </div>

                    {/* Interview Link (Conditional based on type) */}
                    {interviewType === 'online' && (
                        <div>
                            <label htmlFor="interviewLink" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Link size={16} /> Meeting Link (Zoom, Google Meet, Teams, etc.): <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                id="interviewLink"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={interviewLink}
                                onChange={(e) => setInterviewLink(e.target.value)}
                                placeholder="e.g., https://zoom.us/j/1234567890"
                                required
                            />
                        </div>
                    )}
                    {interviewType === 'in-person' && (
                        <div>
                            <label htmlFor="interviewLocation" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Link size={16} /> Interview Location: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="interviewLocation"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={interviewLink} // Reusing interviewLink state for location
                                onChange={(e) => setInterviewLink(e.target.value)}
                                placeholder="e.g., Company HQ, 123 Main St, City"
                                required
                            />
                        </div>
                    )}
                    {interviewType === 'phone' && (
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Link size={16} /> Phone Number for Interview: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={interviewLink} // Reusing interviewLink state for phone number
                                onChange={(e) => setInterviewLink(e.target.value)}
                                placeholder="e.g., +1 (555) 123-4567"
                                required
                            />
                        </div>
                    )}

                    {/* Interview Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar size={16} /> Interview Date: <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                id="interviewDate"
                                selected={interviewDate}
                                onChange={(date) => setInterviewDate(date)}
                                dateFormat="MMMM d, yyyy"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholderText="Select a date"
                                minDate={new Date()} // Cannot select past dates
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="interviewTime" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Clock size={16} /> Interview Time: <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                id="interviewTime"
                                selected={interviewTime}
                                onChange={(time) => setInterviewTime(time)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholderText="Select a time"
                                required
                            />
                        </div>
                    </div>

                    {/* Interviewers (Optional) */}
                    <div>
                        <label htmlFor="interviewers" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Users size={16} /> Interviewer(s) (Comma-separated names):
                        </label>
                        <input
                            type="text"
                            id="interviewers"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            value={interviewers}
                            onChange={(e) => setInterviewers(e.target.value)}
                            placeholder="e.g., John Doe, Jane Smith"
                        />
                    </div>

                    {/* Message Box */}
                    <div>
                        <label htmlFor="interviewMessage" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare size={16} /> Message to Applicant: <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="interviewMessage"
                            rows="5"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            value={interviewMessage}
                            onChange={(e) => setInterviewMessage(e.target.value)}
                            placeholder="Dear [Applicant Name], we would like to invite you for an interview..."
                            required
                        ></textarea>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSendInterviewRequest}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        disabled={isSending}
                    >
                        {isSending ? 'Sending...' : 'Send Interview Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleInterviewPage;
