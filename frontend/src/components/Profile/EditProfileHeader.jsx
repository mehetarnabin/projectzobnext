import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaTimes, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { useProfile } from "../../context/ProfileContext";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { LuUpload } from "react-icons/lu";
import { GoPlusCircle } from "react-icons/go";
import { useAuth } from "../../context/AuthContext";

const EditProfileHeader = () => {
  const { profileData, updateProfileHeader, loading, error } = useProfile();
  const { user } = useAuth();
  // Initialize editData with a deep copy of profileData to avoid direct mutation
  const [editData, setEditData] = useState(() => {
    return {
      name: "",
      designation: "",
      bannerUrl: "/images/default_banner.png",
      logoUrl: "/images/default_profile.jpg",
      badges: [],
      github: "",
      linkedin: "",
      facebook: "",
      instagram: "",
      twitter: "",
    };
  });

  const [formErrors, setFormErrors] = useState({});
  const [extraSocials, setExtraSocials] = useState([]);

  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const badgeInputRef = useRef(null);
  const navigate = useNavigate();

  const SOCIAL_ORDER = ["facebook", "instagram", "twitter"];
  const SOCIAL_LABELS = {
    github: "GitHub",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "Twitter"
  };

  // Sync internal editData with profileData when profileData changes (e.g., after initial fetch)
  useEffect(() => {
    // Only update if profileData and user from AuthContext are available and user is a jobseeker
    if (profileData && user && user.role === 'jobseeker') {
      setEditData({
        name: profileData.name || user.name || "",
        designation: profileData.designation || "",
        bannerUrl: profileData.bannerUrl || "/images/default_banner.png",
        logoUrl: profileData.logoUrl || "/images/default_profile.jpg",
        badges: Array.isArray(profileData.badges) ? [...profileData.badges] : [],
        github: profileData.github || "",
        linkedin: profileData.linkedin || "",
        facebook: profileData.facebook || "",
        instagram: profileData.instagram || "",
        twitter: profileData.twitter || "",
      });

      // Re-evaluate extra socials based on new profile data
      const currentExtraSocials = [];
      SOCIAL_ORDER.forEach(key => {
          if (profileData[key]) {
              currentExtraSocials.push(key);
          }
      });
      setExtraSocials(currentExtraSocials);
    }
  }, [profileData, user]);

  const validateForm = () => {
    const errors = {};
    if (!editData.name.trim()) errors.name = "Name is required.";

    const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
    // Iterate through all potential social fields, but only if they are being displayed/edited
    ["github", "linkedin", ...extraSocials].forEach((key) => {
      // Check if the field is visible (i.e., part of socialFields being mapped)
      if (editData[key] && editData[key].trim() && !urlPattern.test(editData[key])) {
        errors[key] = `Enter a valid ${SOCIAL_LABELS[key]} URL.`;
      }
    });

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
        designation: editData.designation || null,
        bannerUrl: editData.bannerUrl, // This will be a base64 string if changed, or old URL
        logoUrl: editData.logoUrl,     // This will be a base64 string if changed, or old URL
        badges: editData.badges,       // This will be base64 strings
        github: editData.github || null,
        linkedin: editData.linkedin || null,
        facebook: editData.facebook || null,
        instagram: editData.instagram || null,
        twitter: editData.twitter || null,
      };

      await updateProfileHeader(dataToSend);
      navigate("/profile"); // Navigate back to profile page after save attempt
    } else {
        toast.error("Please correct the errors in the form.");
    }
  };

  const handleAddMoreSocial = () => {
    // Only add a social field if it's not already displayed OR populated
    const next = SOCIAL_ORDER.find((key) => !extraSocials.includes(key) && !editData[key]);
    if (next) {
      setExtraSocials([...extraSocials, next]);
      setEditData(prev => ({ ...prev, [next]: '' })); // Initialize new social field as empty string
    } else {
        toast.info("No more social media fields to add or already present.");
    }
  };

  // Combine default social fields with dynamically added ones
  const socialFields = ["github", "linkedin", ...extraSocials]
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates


  // Show loading/error if profileData is not available, or user from AuthContext is not available
  if (loading || !profileData || !user || user.role !== 'jobseeker') {
    // If not a jobseeker, this component should not be rendered, or show a message.
    // For now, we'll show a loading/error or direct to appropriate page.
    if (user && user.role !== 'jobseeker') {
      return <div className="text-center p-4 text-red-600">This page is for Jobseeker Profile editing.</div>;
    }
    return <div className="text-center p-4">Loading editor...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative">
        <img src={editData.bannerUrl} alt="Banner" className="w-full h-48 object-cover rounded-xl" />
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
        <img src={editData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
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
        {/* Left Column */}
        <div className="space-y-4">
          {["name", "designation"].map((key) => ( // Removed 'company' field for jobseeker
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="text"
                className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[key] ? "border-red-500" : ""}`}
                value={editData[key] || ""}
                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
              />
              {formErrors[key] && <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>}
            </div>
          ))}

            {/* Badges */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Showcase Achievements/Badges</label>
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

        {/* Right Column */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Social Profiles</h4>

          <div className="space-y-10">
          {socialFields.map((key) => (
            <div key={key}>
              <input
                type="url"
                placeholder={`${SOCIAL_LABELS[key]} URL`}
                className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[key] ? "border-red-500" : ""}`}
                value={editData[key] || ""}
                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
              />
              {formErrors[key] && <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>}
            </div>
          ))}
          </div>

          {socialFields.length < SOCIAL_ORDER.length + 2 && (
            <button
              type="button"
              className="text-green-600 text-2xl mt-4 rounded-full hover:bg-green-600 hover:text-white"
              onClick={handleAddMoreSocial}
              title="add more rows"
            >
              <GoPlusCircle />
            </button>
          )}
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
          onClick={() => navigate("/profile")}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfileHeader;
