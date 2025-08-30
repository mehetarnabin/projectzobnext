// src/components/JobDetails.jsx
import {
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaBriefcase,
  FaCheckCircle,
  FaEllipsisV,
  FaRegShareSquare,
} from "react-icons/fa";
import { GoBookmark, GoShare, GoPlus } from "react-icons/go";
import { RiShareBoxFill, RiShareBoxLine } from "react-icons/ri";
import { CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// JobDetails now receives the full list of jobs and the selected jobId
const JobDetails = ({ jobId, jobs }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  // Find the job from the passed jobs array
  const job = jobs.find((j) => j.id == jobId); // Use == for loose comparison as jobId from URL is string

  if (!jobId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="text-5xl text-blue-300 mb-4">👈</div>
        <h2 className="text-xl font-semibold mb-2">Select a job</h2>
        <p className="text-gray-500">Display job details here.</p>
      </div>
    );
  }

  if (!job) {
    return <div className="text-center text-gray-500 p-6">Job not found or no longer available.</div>;
  }

  // Determine the job image. Your DB schema doesn't have 'image'.
  // You might want to use a default or add a column to your DB.
  // For now, it will be undefined unless you explicitly add it in JobSearchPage processing.
  const jobImage = job.image || "/images/default-job-banner.jpg"; // Path to a default banner image
  const cleanDescription = job.description.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "");

  // Function to handle Apply Now click
  const handleApplyNow = () => {
    // Navigate to the apply job page, opening in a new tab
    // We'll pass the jobId as a URL parameter or state
    // For now, let's use a simple path with the job ID
    // window.open(`/apply-job/${job.id}`, '_blank'); // Opens in a new tab
    navigate(`/apply-job/${job.id}`); // Navigates within the same tab for easier development initially
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top fixed panel */}
      <div
        className={`space-y-4 ${
          expanded ? "h-1/2" : "h-full"
        } overflow-hidden bg-white border-2 border-gray-200 inset-shadow-md rounded-2xl`}
      >
        {/* Banner Image: Use job.image (from employer profile banner_path) */}
        {job.image && (
          <img src={job.image} alt="Job Banner" className="rounded-t-xl w-full h-48 object-cover mb-0" />
        )}
        <div className="px-6 py-4 shadow-md mb-0">
          <div className="relative flex items-center justify-between mb-16">
            {/* Company Logo: Use job.logo (from job logo_path or employer profile logo_path) */}
            {job.logo && (
              <img
                src={job.logo}
                alt="Company logo"
                className="absolute -top-10 left-0 shadow-md p-2 rounded-xl w-22 h-22 object-contain bg-white"
              />
            )}
            <div className="absolute top-0 right-0 flex gap-3 items-center text-xl">
              <button className="flex p-2 rounded-full bg-gray-100 items-center hover:outline-2 hover:outline-[#003893]">
                <GoBookmark />
              </button>
              <button className="flex p-2 rounded-full bg-gray-100 items-center hover:outline-2 hover:outline-[#003893]">
                <GoShare />
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-[#003893]">{job.title}</h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 border-b border-gray-400 mb-1 border-current hover:border-white text-md font-regular text-gray-700"
          >
            {job.company}
            <RiShareBoxLine />
          </a>
          <div className="flex items-center font-regular text-sm text-gray-600 gap-2 mb-1">
            {job.location}
          </div>
          <div className="flex items-center font-regular text-sm text-gray-600 gap-2 mb-1">{job.type}</div>
          <div className="flex items-center font-regular text-sm text-gray-600 gap-2">{job.salary}</div>
          <div className="flex gap-4 text-xs text-gray-500 mt-4">
            {job.posted && (
              <div className="flex items-center gap-2">
                <FaClock /> Posted {job.posted}
              </div>
            )}
            {job.remainingdate && (
              <div className="flex items-center gap-2">
                <FaClock /> Apply before {job.remainingdate}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleApplyNow} // Attach the click handler here
              className="bg-[#003893] text-white text-sm font-medium px-3 py-2 rounded-lg flex gap-2 items-center"
            >
              Apply Now
              <RiShareBoxFill />
            </button>
            <button className="border border-[#003893] text-[#003893] px-6 py-2 flex items-center rounded-lg">
              Save job
            </button>
          </div>

          {/* Expand Toggle */}
          <div className="mt-4 text-right">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-[#003893] hover:underline inline-flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <div className="flex items-center gap-1">
                    Collapse
                    <CiSquareMinus className="text-lg" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    Expand
                    <CiSquarePlus className="text-lg" />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable description */}
        {expanded && (
          <div className="flex-1 overflow-y-auto p-6 bg-white border-t border-gray-200 text-gray-700 mb-0 shadow-md">
            <h3 className="text-lg font-semibold mb-2">Job Description</h3>
            <div className="space-y-2" dangerouslySetInnerHTML={{ __html: cleanDescription }}>
              {/* job.description can contain HTML, so dangerouslySetInnerHTML is used */}
            </div>
            {/* Key Selling Points: Only show if job.key_points exists and has items */}
            {job.key_points && job.key_points.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Key Selling Points</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {job.key_points.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.video_url && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Job Video</h3>
                <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={job.video_url}
                    title="Job Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div></div>
    </div>
  );
};

export default JobDetails;