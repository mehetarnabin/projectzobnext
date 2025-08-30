import React from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { HiOutlinePencil } from "react-icons/hi2";
import { parsePhoneNumberFromString, getCountryCallingCode } from "libphonenumber-js";
import metadata from 'libphonenumber-js/metadata.full.json';
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";

const BasicInfo = () => {
  const { profileData, loading, error } = useProfile();
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center p-4">Loading basic info...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  // Destructure basicInfo from profileData
  const {
    email,
    phone,
    country,
    address,
    showEmail,
    showPhone,
    showAddress
  } = profileData.basicInfo || {}; // Ensure basicInfo exists

  const formattedPhone = () => {
    if (!phone || !country) return ""; // Ensure country is also available for formatting
    try {
        const full = `+${getCountryCallingCode(country)}${phone}`;
        const parsed = parsePhoneNumberFromString(full, metadata);
        return parsed ? parsed.formatInternational() : phone;
    } catch (e) {
        console.error("Error formatting phone number:", e);
        return phone; // Return unformatted if error
    }
  };

  // Only render if at least one field is visible and has data
  const hasVisibleContent = (showEmail && email) || (showPhone && phone) || (showAddress && address);

  if (!hasVisibleContent) {
    return (
        <section className="bg-white inset-shadow-md rounded-2xl p-4 flex border-2 border-gray-200 flex-col md:flex-row justify-between items-start md:items-center">
            <div className="w-full md:w-auto flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="text-right">
                        <button
                        onClick={() => navigate("/profile/edit-basic-info")}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
                        title="Edit Contact Info"
                        >
                        <HiOutlinePencil />
                        </button>
                    </div>
                </div>
                <p className="text-gray-500">No contact information available. Click edit to add.</p>
            </div>
        </section>
    );
  }

  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4 flex border-2 border-gray-200 flex-col md:flex-row justify-between items-start md:items-center">
      <div className="w-full md:w-auto flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="text-right">
            <button
              onClick={() => navigate("/profile/edit-basic-info")}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#003893]"
              title="Edit Contact Info"
            >
              <HiOutlinePencil />
            </button>
          </div>
        </div>

        <div className="flex w-full gap-2 text-sm space-y-1">
          <div className="flex-2 space-y-2">
            {showEmail && email && (
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-blue-500" />
                <span><strong>Email:</strong> {email}</span>
              </div>
            )}
            {showPhone && phone && (
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-blue-500" />
                <span><strong>Phone:</strong> {formattedPhone()}</span>
              </div>
            )}
            {showAddress && address && (
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <span><strong>Address:</strong> {address}</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-end">
            <div className="mt-4 md:mt-0 md:ml-4">
              {/* <button className="flex items-center gap-2 bg-transparent border-1 border-[#003893] text-[#003893] px-3 py-1 rounded-3xl text-sm hover:bg-[#003893] hover:text-white">
                <a href="/jobseeker/dashboard">
                  Dashboard
                </a>
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicInfo;