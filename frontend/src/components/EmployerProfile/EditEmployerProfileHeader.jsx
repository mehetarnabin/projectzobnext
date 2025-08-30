import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaTimes, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { LuUpload } from "react-icons/lu";
import { GoPlusCircle } from "react-icons/go";
import { useEmployerProfile } from "../../context/EmployerProfileContext";

const EditEmployerProfileHeader = () => {
  const { employerProfileData, updateCompanyProfileHeader, loading, error } = useEmployerProfile();
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    website: "",
    bannerUrl: "/images/default_banner.png",
    logoUrl: "/images/default_profile.jpg",
    badges: [],
  });

  const [formErrors, setFormErrors] = useState({});

  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const badgeInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (employerProfileData && employerProfileData.company) {
      setEditData({
        name: employerProfileData.company.name || "",
        email: employerProfileData.company.email || "",
        phone_number: employerProfileData.company.phone_number || "",
        address: employerProfileData.company.address || "",
        website: employerProfileData.company.website || "",
        bannerUrl: employerProfileData.company.banner_url || "/images/default_banner.png",
        logoUrl: employerProfileData.company.logo_url || "/images/default_profile.jpg",
        badges: Array.isArray(employerProfileData.company.badges) ? [...employerProfileData.company.badges] : [],
      });
    }
  }, [employerProfileData]);

  const validateForm = () => {
    const errors = {};
    if (!editData.name.trim()) errors.name = "Company name is required.";
    if (!editData.email.trim()) errors.email = "Company email is required.";
    else if (!/\S+@\S+\.\S+/.test(editData.email)) errors.email = "Invalid email address.";
    if (editData.website && editData.website.trim() && !/^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i.test(editData.website)) {
      errors.website = "Enter a valid website URL.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result; // Base64 string
        if (key === "badge") {
          setEditData((prev) => ({
            ...prev,
            badges: [...prev.badges, result].slice(0, 4),
          }));
        } else {
          setEditData((prev) => ({ ...prev, [key]: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBadge = (index) => {
    setEditData((prev) => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (validateForm()) {
      const dataToSend = {
        name: editData.name,
        email: editData.email,
        phone_number: editData.phone_number || null,
        address: editData.address || null,
        website: editData.website || null,
        bannerUrl: editData.bannerUrl,
        logoUrl: editData.logoUrl,
        badges: editData.badges,
      };

      await updateCompanyProfileHeader(dataToSend);
      navigate("/employer/profile");
    } else {
      toast.error("Please correct the errors in the form.");
    }
  };

  if (loading || !employerProfileData || !employerProfileData.company) {
    return <div className="text-center p-4">Loading company profile editor...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative">
        <img src={editData.bannerUrl} alt="Company Banner" className="w-full h-48 object-cover rounded-xl" />
        <button
          onClick={() => bannerInputRef.current.click()}
          className="absolute top-2 right-2 bg-gray-600 bg-opacity-60 text-white p-2 rounded-full"
        >
          <FaCamera />
        </button>
        <input type="file" accept="image/*" ref={bannerInputRef} onChange={(e) => handleImageChange(e, "bannerUrl")} hidden />
      </div>

      {/* Logo */}
      <div className="relative -mt-14 ml-6 w-28 h-28 bg-white rounded-full p-1 shadow-md">
        <img src={editData.logoUrl} alt="Company Logo" className="w-full h-full object-cover rounded-full" />
        <button
          onClick={() => logoInputRef.current.click()}
          className="absolute bottom-1 right-1 bg-gray-600 bg-opacity-60 text-white p-1 rounded-full"
        >
          <FaCamera size={14} />
        </button>
        <input type="file" accept="image/*" ref={logoInputRef} onChange={(e) => handleImageChange(e, "logoUrl")} hidden />
      </div>

      {/* Form Grid */}
      <div className="pt-6 px-6 grid md:grid-cols-2 gap-6 items-start">
        {/* Left Column - Company Info */}
        <div className="space-y-4">
          {["name", "email", "phone_number", "address", "website"].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').replace('_', ' ').trim()}
              </label>
              <input
                type={key === 'email' ? 'email' : (key === 'website' ? 'url' : 'text')}
                className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[key] ? "border-red-500" : ""}`}
                value={editData[key] || ""}
                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
              />
              {formErrors[key] && <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>}
            </div>
          ))}
        </div>

        {/* Right Column - Badges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Badges</label>
          <div className="flex gap-6 flex-wrap items-center">
            {Array.isArray(editData.badges) && editData.badges.map((badge, i) => (
              <div className="relative group mt-10" key={i}>
                <img src={badge} alt={`Badge ${i + 1}`} className="w-22 h-22 object-contain" />
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(i)}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-600 text-2xl rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 hover:text-white"
                  title="Remove Badge"
                >
                  <IoIosCloseCircleOutline />
                </button>
              </div>
            ))}
            <div className="mt-10">
              {Array.isArray(editData.badges) && editData.badges.length < 4 && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={badgeInputRef}
                    onChange={(e) => handleImageChange(e, "badge")}
                    hidden
                  />
                  <button
                    onClick={() => badgeInputRef.current.click()}
                    className="flex gap-2 items-center bg-white text-[#003893] text-2xl font-bold p-2 rounded-full border-2 border-[#003893] hover:bg-[#003893] hover:text-white"
                    title="upload badge"
                  >
                    <LuUpload />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 flex gap-3 pt-3">
        <button
          className="bg-white text-[#003893] px-4 py-2 border border-[#003893] rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-[#003893]"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          className="bg-white text-gray-700 px-4 py-2 border border-gray-500 rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-gray-500"
          onClick={() => navigate("/employer/profile")}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditEmployerProfileHeader;