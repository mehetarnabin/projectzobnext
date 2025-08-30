import React from "react";
import { FaBriefcase, FaClock, FaMapMarkerAlt } from "react-icons/fa";

const applications = [
  {
    id: 1,
    jobTitle: "Senior Civil Engineer",
    company: "Arup Group",
    location: "Melbourne, VIC",
    status: "Under Review",
    dateApplied: "May 18, 2025",
  },
  {
    id: 2,
    jobTitle: "Infrastructure Project Manager",
    company: "AECOM",
    location: "Sydney, NSW",
    status: "Interview Scheduled",
    dateApplied: "May 15, 2025",
  },
  {
    id: 3,
    jobTitle: "Structural Engineer",
    company: "WSP Australia",
    location: "Brisbane, QLD",
    status: "Application Sent",
    dateApplied: "May 10, 2025",
  },
];

const statusColor = {
  "Under Review": "text-yellow-500",
  "Interview Scheduled": "text-green-600",
  "Application Sent": "text-blue-600",
};

const JobApplicationList = () => {
  return (
    <div className="bg-white shadow rounded-2xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Applications</h3>
      <div className="divide-y">
        {applications.map((app) => (
          <div key={app.id} className="py-4 flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <h4 className="text-md font-medium text-[#003893]">{app.jobTitle}</h4>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <FaBriefcase className="text-gray-400" /> {app.company}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <FaMapMarkerAlt className="text-gray-400" /> {app.location}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${statusColor[app.status]}`}>{app.status}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                <FaClock className="text-gray-300" /> {app.dateApplied}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobApplicationList;
