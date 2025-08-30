import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaSave, FaTimes } from "react-icons/fa";
import { parsePhoneNumberFromString, getCountryCallingCode } from "libphonenumber-js";
import metadata from 'libphonenumber-js/metadata.full.json';
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const EditBasicInfo = () => {
  const { profileData, updateBasicInfo, loading, error } = useProfile();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const [editData, setEditData] = useState({
    email: "",
    phone: "",
    country: "AU",
    address: "",
    showEmail: true,
    showPhone: true,
    showAddress: true
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Only initialize editData if profileData is available AND the user is authenticated
    // This prevents trying to set data for an unauthenticated state
    if (isAuthenticated && profileData && profileData.basicInfo) {
      setEditData({
        email: profileData.basicInfo.email || "",
        phone: profileData.basicInfo.phone || "",
        country: profileData.basicInfo.country || "AU",
        address: profileData.basicInfo.address || "",
        showEmail: typeof profileData.basicInfo.showEmail === 'boolean' ? profileData.basicInfo.showEmail : true,
        showPhone: typeof profileData.basicInfo.showPhone === 'boolean' ? profileData.basicInfo.showPhone : true,
        showAddress: typeof profileData.basicInfo.showAddress === 'boolean' ? profileData.basicInfo.showAddress : true,
      });
    } else if (!isAuthenticated) {
      // Optionally reset editData if the user becomes unauthenticated while on this page
      setEditData({
        email: "", phone: "", country: "AU", address: "",
        showEmail: true, showPhone: true, showAddress: true
      });
    }
  }, [profileData, isAuthenticated]); // Add isAuthenticated to the dependency array

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (editData.showEmail && !editData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (editData.showEmail && editData.email.trim() && !emailRegex.test(editData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (editData.showPhone && !editData.phone.trim()) {
      errors.phone = "Phone number is required.";
    }

    if (editData.showAddress && !editData.address.trim()) {
      errors.address = "Address is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
        const dataToSend = {
            email: editData.email || null, // Send null if empty string
            phone: editData.phone || null, // Send null if empty string
            country: editData.country || null,
            address: editData.address || null,
            showEmail: editData.showEmail,
            showPhone: editData.showPhone,
            showAddress: editData.showAddress,
        };

        await updateBasicInfo(dataToSend);
        navigate("/profile"); // Navigate back to profile page after save attempt
    } else {
        toast.error("Please correct the errors in the form.");
    }
  };

  const formattedPhone = () => {
    if (!editData.phone || !editData.country) return "";
    try {
        const full = `+${getCountryCallingCode(editData.country)}${editData.phone}`;
        const parsed = parsePhoneNumberFromString(full, metadata);
        return parsed ? parsed.formatInternational() : editData.phone;
    } catch (e) {
            console.error("Error formatting phone number:", e);
            return editData.phone;
    }
  };

  // Render nothing or redirect if not authenticated
  if (!isAuthenticated && !loading) {
    navigate("/login"); // Or render a "Please log in" message
    return null;
  }

  if (loading) return <div className="text-center p-4">Loading basic info editor...</div>;
  if (error) return <div className="text-center p-4 text-red-600">Error: {error}</div>;


  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#003893]">Edit Contact Information</h3>
      </div>

      <div className="space-y-4">
        {/* Email Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-[#003893]" />
            <span className="text-sm font-medium text-gray-700">Email</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={editData.showEmail}
              onChange={(e) => setEditData({...editData, showEmail: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003893]"></div>
          </label>
        </div>

        {editData.showEmail && (
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-2 border-2 border-gray-200 rounded-4xl inset-shadow-lg ${formErrors.email ? "border-red-500" : ""}`}
              value={editData.email}
              onChange={(e) => setEditData({...editData, email: e.target.value})}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.email}</p>}
          </div>
        )}

        {/* Phone Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-[#003893]" />
            <span className="text-sm font-medium text-gray-700">Phone</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={editData.showPhone}
              onChange={(e) => setEditData({...editData, showPhone: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003893]"></div>
          </label>
        </div>

        {editData.showPhone && (
          <div>
            <div className="flex gap-2">
              <select
                className="p-2 border-2 border-gray-200 rounded-4xl inset-shadow-lg"
                value={editData.country}
                onChange={(e) => setEditData({...editData, country: e.target.value})}
              >
                <option value="AU">Australia (+61)</option>
                <option value="US">United States (+1)</option>
                <option value="GB">United Kingdom (+44)</option>
                <option value="NP">Nepal (+977)</option> {/* Added Nepal */}
              </select>
              <input
                type="tel"
                placeholder="Phone Number"
                className={`flex-1 p-2 border-2 border-gray-200 rounded-4xl inset-shadow-lg ${formErrors.phone ? "border-red-500" : ""}`}
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
              />
            </div>
            {formErrors.phone && <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.phone}</p>}
            {editData.phone && (
              <p className="text-xs text-gray-500 mt-1 ml-2">Preview: {formattedPhone()}</p>
            )}
          </div>
        )}

        {/* Address Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#003893]" />
            <span className="text-sm font-medium text-gray-700">Address</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={editData.showAddress}
              onChange={(e) => setEditData({...editData, showAddress: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003893]"></div>
          </label>
        </div>

        {editData.showAddress && (
          <div>
            <textarea
              placeholder="Address"
              className={`w-full p-2 border-2 border-gray-200 rounded-2xl inset-shadow-lg ${formErrors.address ? "border-red-500" : ""}`}
              value={editData.address}
              onChange={(e) => setEditData({...editData, address: e.target.value})}
              rows={3}
            />
            {formErrors.address && <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.address}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            className="bg-white text-[#003893] px-4 py-2 border border-[#003893] rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-[#003893]"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            className="bg-white text-gray-700 px-4 py-2 border border-gray-500 rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-gray-500"
            onClick={() => navigate("/profile")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
};

export default EditBasicInfo;