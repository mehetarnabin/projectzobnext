import React from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

const interviews = [
  {
    id: 1,
    role: "Frontend Developer",
    company: "TechNova Inc.",
    logo: "/logos/technova.png",
    date: "Sep 15, 2025",
    time: "10:00 AM",
  },
  {
    id: 2,
    role: "UI/UX Designer",
    company: "Pixel Studio",
    logo: "/logos/pixelstudio.png",
    date: "Sep 20, 2025",
    time: "2:30 PM",
  },
];

const UpcomingInterviews = () => {
  return (
    <div className="bg-white shadow rounded-2xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Interviews</h3>
      <div className="space-y-4">
        {interviews.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border border-gray-100 p-4 rounded-xl hover:shadow"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.logo}
                alt={item.company}
                className="w-12 h-12 rounded-full object-contain border"
              />
              <div>
                <h4 className="font-semibold text-sm text-gray-800">{item.role}</h4>
                <p className="text-sm text-gray-500">{item.company}</p>
                <div className="flex items-center text-xs text-gray-400 gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock /> {item.time}
                  </span>
                </div>
              </div>
            </div>
            <button className="text-sm bg-[#003893] text-white px-4 py-1 rounded-full hover:bg-[#005EF5] transition">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingInterviews;
