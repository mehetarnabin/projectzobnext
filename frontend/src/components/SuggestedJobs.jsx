import React from "react";
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave } from "react-icons/fa";

const suggestedJobs = [
  {
    title: "UI/UX Designer",
    company: "Pixel Studio",
    location: "Melbourne, VIC",
    salary: "$85k - $100k",
    type: ["Full-time", "Remote"],
  },
  {
    title: "Frontend Developer",
    company: "DevSoft",
    location: "Sydney, NSW",
    salary: "$95k - $110k",
    type: ["Full-time", "Hybrid"],
  },
  {
    title: "Digital Marketing Specialist",
    company: "MarketGenius",
    location: "Brisbane, QLD",
    salary: "$70k - $85k",
    type: ["Part-time", "Remote"],
  },
];

const SuggestedJobs = () => {
  return (
    <div className="bg-white shadow rounded-2xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Jobs</h3>
      <div className="space-y-4">
        {suggestedJobs.map((job, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#003893]">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span>{job.location}</span>
                  <FaMoneyBillWave className="text-gray-400 ml-3" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {job.type.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="mt-4 sm:mt-0 bg-[#003893] text-white px-4 py-2 text-sm rounded-4xl hover:bg-[#005EF5] transition">
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedJobs;
