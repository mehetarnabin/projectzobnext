// src/components/EmployerDashboard/UpcomingEvents.jsx
import API_BASE_URL from "../../config"; // Add this line
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, ChevronRight, Clock, Video, Phone, MapPin } from 'lucide-react'; // Added Clock, Video, Phone, MapPin
import { format, isToday, parseISO } from 'date-fns'; // Added isToday, parseISO
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { toast } from 'react-toastify';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const UpcomingEvents = () => {
    const { token, user } = useAuth();
    const [currentDate, setCurrentDate] = useState('');
    const [scheduledInterviews, setScheduledInterviews] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [errorEvents, setErrorEvents] = useState(null);

    useEffect(() => {
        // Set current date on component mount
        setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
    }, []);

    const fetchScheduledInterviews = useCallback(async () => {
        if (!token || !user || user.role !== 'employer') {
            setLoadingEvents(false);
            setErrorEvents('Unauthorized or not an employer.');
            return;
        }

        setLoadingEvents(true);
        setErrorEvents(null);
        try {
            const response = await fetch(`${API_BASE_URL}/employer/scheduled-interviews`, {
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
            // Filter interviews to only show those scheduled for today or later
            const filteredInterviews = data.interviews.filter(interview => {
                const interviewDateTime = parseISO(`${interview.interviewDate}T${interview.interviewTime}`);
                return interviewDateTime >= new Date(); // Only show future or current events
            });

            // Sort by date and then time
            filteredInterviews.sort((a, b) => {
                const dateA = parseISO(`${a.interviewDate}T${a.interviewTime}`);
                const dateB = parseISO(`${b.interviewDate}T${b.interviewTime}`);
                return dateA.getTime() - dateB.getTime();
            });

            setScheduledInterviews(filteredInterviews);
        } catch (err) {
            console.error("Error fetching scheduled interviews:", err);
            setErrorEvents(err.message || "Failed to load scheduled interviews.");
            toast.error("Failed to load scheduled interviews: " + (err.message || "Network error."));
        } finally {
            setLoadingEvents(false);
        }
    }, [token, user]);

    useEffect(() => {
        fetchScheduledInterviews();
        // Optionally, refetch every few minutes for real-time updates
        const interval = setInterval(fetchScheduledInterviews, 5 * 60 * 1000); // Refetch every 5 minutes
        return () => clearInterval(interval); // Cleanup on unmount
    }, [fetchScheduledInterviews]);

    const renderEventDetails = (interview) => {
        let icon;
        let detailText;
        switch (interview.interviewType) {
            case 'online':
                icon = <Video size={14} className="inline-block mr-1" />;
                detailText = interview.interviewLink;
                break;
            case 'in-person':
                icon = <MapPin size={14} className="inline-block mr-1" />;
                detailText = interview.interviewLink; // Reusing interviewLink for location
                break;
            case 'phone':
                icon = <Phone size={14} className="inline-block mr-1" />;
                detailText = interview.interviewLink; // Reusing interviewLink for phone number
                break;
            default:
                icon = null;
                detailText = '';
        }

        return (
            <p className="text-xs text-gray-500">
                {icon} {detailText}
                {interview.interviewers && interview.interviewers.length > 0 && (
                    <span className="ml-2"> | Interviewers: {interview.interviewers.join(', ')}</span>
                )}
            </p>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    View All <ChevronRight size={16} />
                </button>
            </div>

            <div className="flex items-center text-gray-600 text-sm mb-4">
                <CalendarDays size={16} className="mr-2" />
                <span>{currentDate}</span>
            </div>

            {loadingEvents ? (
                <div className="text-center text-gray-500 py-4">Loading upcoming events...</div>
            ) : errorEvents ? (
                <div className="text-center text-red-500 py-4">Error: {errorEvents}</div>
            ) : scheduledInterviews.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No upcoming interviews scheduled.</div>
            ) : (
                <div className="space-y-3 flex-grow overflow-y-auto">
                    {scheduledInterviews.map(interview => (
                        <div key={interview.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-md">
                            <p className="text-sm font-medium text-gray-900">
                                <Clock size={14} className="inline-block mr-1" />
                                {format(parseISO(`${interview.interviewDate}T${interview.interviewTime}`), 'hh:mm a')} - Interview with {interview.applicantName} for {interview.jobTitle}
                            </p>
                            {renderEventDetails(interview)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingEvents;
