import React from "react";
import { FaBell, FaCheckCircle, FaEnvelope, FaBriefcase } from "react-icons/fa";

const notifications = [
  {
    icon: <FaCheckCircle className="text-green-500" />,
    message: "Your application for 'Frontend Developer' was viewed.",
    time: "2 hrs ago",
  },
  {
    icon: <FaEnvelope className="text-blue-500" />,
    message: "You have a new message from Pixel Studio.",
    time: "5 hrs ago",
  },
  {
    icon: <FaBriefcase className="text-yellow-500" />,
    message: "Interview scheduled for 'UI/UX Designer' on Sep 12.",
    time: "1 day ago",
  },
];

const NotificationPanel = () => {
  return (
    <div className="bg-white shadow rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        <button className="text-sm text-blue-600 hover:underline">Mark all as read</button>
      </div>
      <ul className="space-y-4">
        {notifications.map((n, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-none">
            <div className="mt-1">{n.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{n.message}</p>
              <span className="text-xs text-gray-400">{n.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPanel;
