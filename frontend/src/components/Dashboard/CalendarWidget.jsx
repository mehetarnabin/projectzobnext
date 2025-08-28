import React from "react";
import { FaCalendarAlt, FaChevronRight } from "react-icons/fa";
import { LuLightbulb } from "react-icons/lu";

const CalendarWidget = () => {
  // Sample interview data
  const upcomingInterviews = [
    {
      id: 1,
      company: "TechCorp",
      position: "Frontend Developer",
      date: "May 15, 2023",
      time: "10:00 AM",
      avatar: "https://logo.clearbit.com/techcorp.com"
    },
    {
      id: 2,
      company: "DesignHub",
      position: "UI Designer",
      date: "May 18, 2023",
      time: "2:30 PM",
      avatar: "https://logo.clearbit.com/designhub.com"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          Calendar
        </h3>
        <a href="#" className="text-xs text-gray-500 hover:text-[#003983]">View all</a>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Today</h4>
        
        {upcomingInterviews.map((interview) => (
          <div key={interview.id} className="flex items-center p-3 cursor-pointer bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 mr-3 p-4 rounded-full bg-gray-200 text-gray-700">
              <LuLightbulb />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {interview.company}
              </p>
              <p className="text-xs text-gray-500">
                {interview.date} • {interview.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-2">
        <h4 className="font-medium text-gray-700">Upcoming</h4>
        
        {upcomingInterviews.map((interview) => (
          <div key={interview.id} className="flex items-center p-3 cursor-pointer bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 mr-3 p-4 rounded-full bg-gray-200 text-gray-700">
              <LuLightbulb />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {interview.company}
              </p>
              <p className="text-xs text-gray-500">
                {interview.date} • {interview.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;