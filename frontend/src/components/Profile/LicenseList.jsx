import React from "react";
import { HiOutlinePencil } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";

const LicenseList = () => {
  const { profileData, loading, error } = useProfile(); // Added loading and error
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center p-4">Loading Licenses...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  // Ensure licenses is an array, default to empty if not.
  const licenseItems = Array.isArray(profileData.licenses) ? profileData.licenses : [];

  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Licenses</h3>
        <button
          onClick={() => navigate("/profile/edit-licenses")}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
          title="Edit Licenses"
        >
          <HiOutlinePencil />
        </button>
      </div>

      {licenseItems.length === 0 ? ( // Check for empty array
        <p className="text-gray-500">No licenses added yet. Click the edit button to add some.</p>
      ) : (
        <ul className="space-y-4">
          {licenseItems.map((lic, index) => (
            <li key={index}>
              <h4 className="font-semibold text-sm">{lic.type}</h4>
              <p className="text-xs text-gray-600">{lic.authority}</p>
              <p className="text-xs text-gray-500">
                Issued: {lic.issued}
                {lic.expiry && `, Expiry: ${lic.expiry}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default LicenseList;