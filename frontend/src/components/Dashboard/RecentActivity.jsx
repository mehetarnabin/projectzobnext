import React from "react";
import { FaBell, FaUser, FaFileAlt, FaCheckCircle } from "react-icons/fa";

const RecentActivity = () => {
  // Sample activity data
  const activities = [
    {
      id: 1,
      type: "profile_view",
      title: "Your profile was viewed",
      company: "TechSolutions Inc",
      time: "2 hours ago",
      icon: <FaUser className="text-blue-500" />
    },
    {
      id: 2,
      type: "application",
      title: "Application submitted",
      position: "Senior UX Designer",
      time: "1 day ago",
      icon: <FaFileAlt className="text-green-500" />
    },
    {
      id: 3,
      type: "notification",
      title: "New job matches",
      description: "5 new jobs match your profile",
      time: "2 days ago",
      icon: <FaBell className="text-yellow-500" />
    },
    {
      id: 4,
      type: "completion",
      title: "Profile completion bonus",
      description: "You earned 50 points",
      time: "3 days ago",
      icon: <FaCheckCircle className="text-purple-500" />
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          See All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className="flex-shrink-0 mt-1 mr-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                {activity.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              {activity.company && (
                <p className="text-xs text-gray-500">by {activity.company}</p>
              )}
              {activity.position && (
                <p className="text-xs text-gray-500">for {activity.position}</p>
              )}
              {activity.description && (
                <p className="text-xs text-gray-500">{activity.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;