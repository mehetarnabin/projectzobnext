import React from "react";
import { HiOutlinePencil } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";

const MembershipList = () => {
  const { profileData, loading, error } = useProfile(); // Added loading and error
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center p-4">Loading Professional Memberships...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  // Ensure memberships is an array, default to empty if not.
  const membershipItems = Array.isArray(profileData.memberships) ? profileData.memberships : [];

  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Professional Memberships</h3>
        <button
          onClick={() => navigate("/profile/edit-memberships")}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
          title="Edit Memberships"
        >
          <HiOutlinePencil />
        </button>
      </div>

      {membershipItems.length === 0 ? ( // Check for empty array
        <p className="text-gray-500">No professional memberships added yet. Click the edit button to add some.</p>
      ) : (
        <ul className="space-y-4">
          {membershipItems.map((mem, index) => (
            <li key={index} className="flex items-center gap-4">
              {mem.logo && <img src={mem.logo} alt={mem.org} className="w-10 h-10 object-contain" />}
              <div>
                <h4 className="font-semibold text-sm">{mem.org}</h4>
                <p className="text-xs text-gray-600">{mem.type}</p>
                <p className="text-xs text-gray-500">
                  {mem.year}
                  {mem.end && ` - ${mem.end}`} {/* Only show " - end" if end year exists */}
                  {!mem.end && mem.year && ' - Current'} {/* Show ' - Current' if no end year but a start year */}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MembershipList;