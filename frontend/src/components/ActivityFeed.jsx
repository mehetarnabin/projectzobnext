import React from "react";
import { FaRegClock } from "react-icons/fa";

const activities = [
  {
    id: 1,
    type: "applied",
    message: "You applied for the position of Project Civil Engineer at Cardno Engineering.",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "saved",
    message: "You saved a job: Urban Infrastructure Specialist at Jacobs.",
    time: "Yesterday",
  },
  {
    id: 3,
    type: "profile-update",
    message: "You updated your professional summary in your profile.",
    time: "3 days ago",
  },
];

const ActivityFeed = () => {
  return (
    <div className="bg-white shadow rounded-2xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <div className="text-blue-600 mt-1">
              <FaRegClock size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-5">{activity.message}</p>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
