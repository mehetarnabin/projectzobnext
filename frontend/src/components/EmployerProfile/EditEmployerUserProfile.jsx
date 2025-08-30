import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { useEmployerProfile } from "../../context/EmployerProfileContext";

const EditEmployerUserProfile = () => {
  const { employerProfileData, updateEmployerUserProfile, loading, error } = useEmployerProfile();
  const [editData, setEditData] = useState({
    name: "",
    designation: "",
    email: "",
    phone_number: "",
    logoUrl: "/images/default_profile.jpg", // User's personal logo
  });
  const [formErrors, setFormErrors] = useState({});
  const logoInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (employerProfileData && employerProfileData.user) {
      setEditData({
        name: employerProfileData.user.name || "",
        designation: employerProfileData.user.designation || "",
        email: employerProfileData.user.email || "",
        phone_number: employerProfileData.user.phone_number || "",
        logoUrl: employerProfileData.user.logo_url || "/images/default_profile.jpg",
      });
    }
  }, [employerProfileData]);

  const validateForm = () => {
    const errors = {};
    if (!editData.name.trim()) errors.name = "Full Name is required.";
    if (!editData.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(editData.email)) errors.email = "Invalid email address.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result; // Base64 string
        setEditData((prev) => ({ ...prev, [key]: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      const dataToSend = {
        name: editData.name,
        designation: editData.designation || null,
        email: editData.email,
        phone_number: editData.phone_number || null,
        logoUrl: editData.logoUrl,
      };

      await updateEmployerUserProfile(dataToSend);
      navigate("/employer/profile");
    } else {
      toast.error("Please correct the errors in the form.");
    }
  };

  if (loading || !employerProfileData || !employerProfileData.user) {
    return <div className="text-center p-4">Loading user profile editor...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#003893] mb-4">Edit Your Profile Details</h3>
      <div className="relative w-28 h-28 mx-auto bg-white rounded-full p-1 shadow-md mb-6">
        <img src={editData.logoUrl} alt="User Logo" className="w-full h-full object-cover rounded-full" />
        <button
          onClick={() => logoInputRef.current.click()}
          className="absolute bottom-1 right-1 bg-gray-600 bg-opacity-60 text-white p-1 rounded-full"
        >
          <FaCamera size={14} />
        </button>
        <input type="file" accept="image/*" ref={logoInputRef} onChange={(e) => handleImageChange(e, "logoUrl")} hidden />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {["name", "designation", "email", "phone_number"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').replace('_', ' ').trim()}
            </label>
            <input
              type={key === 'email' ? 'email' : 'text'}
              className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[key] ? "border-red-500" : ""}`}
              value={editData[key] || ""}
              onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
            />
            {formErrors[key] && <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-3">
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

export default EditEmployerUserProfile;
