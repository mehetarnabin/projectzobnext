// src/components/Profile/EducationList.jsx
import React from "react";
import { HiOutlinePencil } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";

const EducationList = () => {
  const { profileData, loading, error } = useProfile();
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center p-4">Loading Education...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  const educationItems = Array.isArray(profileData.education) ? profileData.education : [];

  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Education</h3>
        <button
          onClick={() => navigate("/profile/edit-education")}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
          title="Edit Education"
        >
          <HiOutlinePencil />
        </button>
      </div>

      {educationItems.length === 0 ? (
        <p className="text-gray-500">No education details added yet. Click the edit button to add some.</p>
      ) : (
        <ul className="space-y-4">
          {educationItems.map((edu, index) => (
            <li key={index} className="flex items-start gap-4">
              {edu.logo && <img src={edu.logo} alt="logo" className="w-10 h-10 object-contain" />}
              <div>
                <h4 className="font-semibold text-sm">
                  {edu.degree}
                  {edu.grade && <span className="ml-2 text-xs text-gray-500">{edu.grade}</span>}
                  {edu.honors && <span className="ml-2 text-xs text-gray-500">(Honour)</span>}
                </h4>
                <p className="text-xs text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-500">
                  {/* Robust date display: Check if it's a valid Date object before getting year */}
                  {edu.startDate instanceof Date && !isNaN(edu.startDate) ? edu.startDate.getFullYear() : ''}
                  {(edu.startDate && edu.endDate && edu.startDate instanceof Date && !isNaN(edu.startDate) && edu.endDate instanceof Date && !isNaN(edu.endDate)) ? ' - ' : ''}
                  {edu.endDate instanceof Date && !isNaN(edu.endDate) ? edu.endDate.getFullYear() : ''}
                </p>
                {edu.highlights && <p className="text-xs text-gray-700 mt-1">{edu.highlights}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default EducationList;