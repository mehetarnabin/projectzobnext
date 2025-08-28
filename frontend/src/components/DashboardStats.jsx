import React from "react";
import { FaBriefcase, FaBookmark, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";

const stats = [
  {
    id: 1,
    label: "Applied Jobs",
    icon: <FaBriefcase className="text-white text-2xl" />,
    count: 12,
    bg: "bg-[#003893]",
  },
  {
    id: 2,
    label: "Saved Jobs",
    icon: <FaBookmark className="text-white text-2xl" />,
    count: 5,
    bg: "bg-[#005EF5]",
  },
  {
    id: 3,
    label: "Shortlisted",
    icon: <FaCheckCircle className="text-white text-2xl" />,
    count: 3,
    bg: "bg-[#1B9C85]",
  },
  {
    id: 4,
    label: "Interviews",
    icon: <FaCalendarAlt className="text-white text-2xl" />,
    count: 2,
    bg: "bg-[#DC143C]",
  },
];

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {stats.map(({ id, label, icon, count, bg }) => (
        <div
          key={id}
          className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
        >
          <div className={`w-12 h-12 flex items-center justify-center rounded-full ${bg}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{count}</h3>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
