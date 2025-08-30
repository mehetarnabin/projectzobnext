import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { HiOutlinePencil } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";

const ExperienceList = () => {
  const { profileData, loading, error } = useProfile(); // Added loading and error
  const [expandedIndex, setExpandedIndex] = useState(null);
  const navigate = useNavigate();

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  if (loading) {
    return <div className="text-center p-4">Loading Work Experience...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  // Ensure work_experience is an array, default to empty if not.
  const experienceItems = Array.isArray(profileData.work_experience) ? profileData.work_experience : [];

  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <button
          onClick={() => navigate("/profile/edit-experience")}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
          title="Edit Experience"
        >
          <HiOutlinePencil />
        </button>
      </div>

      {experienceItems.length === 0 ? ( // Check for empty array
        <p className="text-gray-500">No work experience details added yet. Click the edit button to add some.</p>
      ) : (
        <ul className="space-y-4">
          {experienceItems.map((exp, index) => (
            <li key={index} className="relative border border-gray-100 rounded p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {exp.logo && (
                    <img src={exp.logo} alt={exp.company} className="w-10 h-10 object-contain" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">{exp.title}</h4>
                    <p className="text-xs text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500">
                      {/* Safely display dates */}
                      {exp.startDate instanceof Date && !isNaN(exp.startDate)
                        ? exp.startDate.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
                        : ""}
                      {(exp.startDate instanceof Date && !isNaN(exp.startDate) && (exp.endDate === null || (exp.endDate instanceof Date && !isNaN(exp.endDate))))
                         ? " - " : "" // Only show hyphen if start date is valid and end date is valid or null
                      }
                      {exp.endDate instanceof Date && !isNaN(exp.endDate)
                        ? exp.endDate.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
                        : (exp.endDate === null ? "Present" : "") // Show 'Present' if endDate is null
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpand(index)}
                  className="text-blue-500 text-sm mt-1 flex items-center gap-1 hover:text-blue-700"
                >
                  {expandedIndex === index ? <><FaChevronUp /> Collapse</> : <><FaChevronDown /> Expand</>}
                </button>
              </div>
              {expandedIndex === index && exp.details && (
                <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                  <strong>Key responsibilities:</strong><br /> {exp.details}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ExperienceList;