import React from "react";
import { FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";

const recommendedJobs = [
  {
    id: 1,
    title: "Project Civil Engineer",
    company: "Cardno Engineering",
    location: "Adelaide, SA",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Urban Infrastructure Specialist",
    company: "Jacobs",
    location: "Canberra, ACT",
    type: "Contract",
  },
  {
    id: 3,
    title: "Senior Design Consultant",
    company: "AECOM",
    location: "Sydney, NSW",
    type: "Remote",
  },
];

const RecommendedJobs = () => {
  return (
    <div className="bg-white shadow rounded-2xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Jobs</h3>
      <div className="grid gap-4">
        {recommendedJobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-md transition"
          >
            <div>
              <h4 className="text-md font-semibold text-[#003893]">{job.title}</h4>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FaBriefcase className="text-gray-400" />
                {job.company}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                {job.location}
              </p>
              <p className="text-sm mt-1 text-[#DC143C] font-medium">{job.type}</p>
            </div>
            <div className="mt-3 md:mt-0">
              <button className="bg-[#003893] text-white px-5 py-2 rounded-2xl text-sm hover:bg-[#005EF5] transition">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedJobs;
