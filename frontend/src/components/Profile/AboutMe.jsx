// src/components/Profile/AboutMe.jsx
import React, { useState, useEffect } from "react"; // Add useEffect
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Transition } from "@headlessui/react";
import { HiOutlinePencil } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext"; // Import useProfile

const AboutMe = () => { // Remove 'about', 'onEdit' props
  const { profileData, loading, error } = useProfile(); // Get profileData from context
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Ensure about is not undefined initially
  const aboutContent = profileData.about || "";

  if (loading) {
    return <div className="text-center p-4">Loading About Me...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">About Me</h3>
        <div className="flex gap-2 items-center">
          <button
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
            onClick={() => navigate("/profile/edit-about-info")}
            title="Edit About Me"
          >
            <HiOutlinePencil />
          </button>
        </div>
      </div>

      {aboutContent.trim() === "" ? (
        <p className="text-gray-500">No "About Me" section available. Click edit to add.</p>
      ) : (
        <>
          <Transition
            show={true} // Always show the content wrapper
            enter="transition-all duration-500 ease-in-out"
            leave="transition-all duration-500 ease-in-out"
          >
            <div className={`prose text-sm text-gray-700 max-w-none transition-all duration-500 ${expanded ? "max-h-full" : "max-h-[200px] overflow-hidden"}`}>
              <ReactMarkdown>{aboutContent}</ReactMarkdown>
            </div>
          </Transition>
          {aboutContent.length > 500 && ( // Check length of content for expand/collapse
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-blue-600 mt-2 hover:text-blue-800"
            >
              {expanded ? <><FaChevronUp /> Collapse</> : <><FaChevronDown /> Expand</>}
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default AboutMe;