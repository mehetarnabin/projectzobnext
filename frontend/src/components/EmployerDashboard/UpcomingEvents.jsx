import API_BASE_URL from "../../config";
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, ChevronRight, Clock, Video, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Dummy events for demo
const demoEvents = [
  {
    id: 101,
    interviewDate: "2025-09-05",
    interviewTime: "11:00",
    interviewType: "online",
    interviewLink: "https://zoom.us/demo-link",
    applicantName: "Demo User 1",
    jobTitle: "Demo Developer"
  },
  {
    id: 102,
    interviewDate: "2025-09-06",
    interviewTime: "15:00",
    interviewType: "in-person",
    interviewLink: "Demo Office, Kathmandu",
    applicantName: "Demo User 2",
    jobTitle: "Demo Designer"
  },
];

const UpcomingEvents = () => {
    const { token, user } = useAuth();
    const [currentDate, setCurrentDate] = useState('');
    const [scheduledInterviews, setScheduledInterviews] = useState(demoEvents); // start with demo events
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [errorEvents, setErrorEvents] = useState(null);

    useEffect(() => {
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
            const filteredInterviews = data.interviews.filter(interview => {
                const interviewDateTime = parseISO(`${interview.interviewDate}T${interview.interviewTime}`);
                return interviewDateTime >= new Date();
            });

            filteredInterviews.sort((a, b) => {
                const dateA = parseISO(`${a.interviewDate}T${a.interviewTime}`);
                const dateB = parseISO(`${b.interviewDate}T${b.interviewTime}`);
                return dateA.getTime() - dateB.getTime();
            });

            setScheduledInterviews(filteredInterviews.length ? filteredInterviews : demoEvents); // fallback to demo
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
        const interval = setInterval(fetchScheduledInterviews, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchScheduledInterviews]);

    const handleEdit = (id) => {
        console.log("Edit event", id);
        toast.info(`Edit event ${id} clicked`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            setScheduledInterviews(scheduledInterviews.filter(ev => ev.id !== id));
            toast.success("Event deleted successfully");
        }
    };

    const renderEventDetails = (interview) => {
        let icon;
        switch (interview.interviewType) {
            case 'online': icon = <Video size={14} className="inline-block mr-1" />; break;
            case 'in-person': icon = <MapPin size={14} className="inline-block mr-1" />; break;
            case 'phone': icon = <Phone size={14} className="inline-block mr-1" />; break;
            default: icon = null;
        }

        return (
            <p className="text-xs text-gray-500">
                {icon} {interview.interviewLink}
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
            ) : (
                <div className="space-y-3 flex-grow overflow-y-auto">
                    {scheduledInterviews.map(interview => (
                        <div key={interview.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-md flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    <Clock size={14} className="inline-block mr-1" />
                                    {format(parseISO(`${interview.interviewDate}T${interview.interviewTime}`), 'hh:mm a')} - Interview with {interview.applicantName} for {interview.jobTitle}
                                </p>
                                {renderEventDetails(interview)}
                            </div>
                            <div className="flex space-x-2 mt-1">
                                <button onClick={() => handleEdit(interview.id)} className="text-blue-500 hover:text-blue-700" title="Edit">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete(interview.id)} className="text-red-500 hover:text-red-700" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingEvents;
