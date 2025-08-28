// src/components/Profile/CertificationList.jsx
import React from "react";
import { HiOutlinePencil } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";

const CertificationList = () => {
  const { profileData, loading, error } = useProfile(); // Added loading and error
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center p-4">Loading Training & Certifications...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  // Ensure certifications is an array, default to empty if not.
  const certificationItems = Array.isArray(profileData.certifications) ? profileData.certifications : [];

  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Training & Certifications</h3>
        <button
          onClick={() => navigate("/profile/edit-certifications")}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
          title="Edit Certifications"
        >
          <HiOutlinePencil />
        </button>
      </div>

      {certificationItems.length === 0 ? ( // Check for empty array
        <p className="text-gray-500">No training or certifications added yet. Click the edit button to add some.</p>
      ) : (
        <ul className="space-y-4">
          {certificationItems.map((cert, index) => (
            <li key={index} className="flex items-center gap-4">
              {cert.logo && <img src={cert.logo} alt={cert.provider} className="w-10 h-10 object-contain" />}
              <div>
                <h4 className="font-semibold text-sm">{cert.title}</h4>
                <p className="text-xs text-gray-600">
                  {cert.provider}
                  {cert.country && `, ${cert.country}`}
                </p>
                <p className="text-xs text-gray-600">
                  Completed: {cert.year}
                  {cert.expiry && `, Expiry: ${cert.expiry}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CertificationList;