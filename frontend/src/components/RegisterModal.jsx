import API_BASE_URL from "../config"; // Add this line
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaBuilding, FaUserTie, FaUser, FaGoogle, FaLinkedin, FaTwitter, FaFacebook } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { FiUserCheck, FiBriefcase, FiUsers } from "react-icons/fi";
import { IoIosCloseCircleOutline, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { toast } from "react-toastify"; // Import toast for notifications

// const API_BASE_URL = "http://10.120.30.250:8000/api"; // Ensure this matches your Laravel API URL

const roles = [
  {
    id: "staffing",
    label: "Staffing Agency",
    icon: <FiUsers size={24} />,
  },
  {
    id: "employer",
    label: "Employer",
    icon: <FiBriefcase size={24} />,
  },
  {
    id: "jobseeker",
    label: "Job Seeker",
    icon: <FiUserCheck size={24} />,
  },
];

const svgPattern = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 640 800"><g stroke-width="2" stroke="hsl(50, 98%, 50%)" fill="none" stroke-linecap="butt"><line x1="0" y1="0" x2="54" y2="54" opacity="0.05"></line><line x1="54" y1="0" x2="108" y2="54" opacity="0.05"></line><line x1="162" y1="0" x2="108" y2="54" opacity="0.05"></line><line x1="216" y1="0" x2="162" y2="54" opacity="0.05"></line><line x1="216" y1="0" x2="270" y2="54" opacity="0.05"></line><line x1="324" y1="0" x2="270" y2="54" opacity="0.05"></line><line x1="324" y1="0" x2="378" y2="54" opacity="0.05"></line><line x1="432" y1="0" x2="378" y2="54" opacity="0.05"></line><line x1="486" y1="0" x2="432" y2="54" opacity="0.05"></line><line x1="540" y1="0" x2="486" y2="54" opacity="0.05"></line><line x1="540" y1="0" x2="594" y2="54" opacity="0.05"></line><line x1="594" y1="0" x2="648" y2="54" opacity="0.05"></line><line x1="54" y1="54" x2="0" y2="108" opacity="0.11"></line><line x1="54" y1="54" x2="108" y2="108" opacity="0.11"></line><line x1="162" y1="54" x2="108" y2="108" opacity="0.11"></line><line x1="216" y1="54" x2="162" y2="108" opacity="0.11"></line><line x1="216" y1="54" x2="270" y2="108" opacity="0.11"></line><line x1="324" y1="54" x2="270" y2="108" opacity="0.11"></line><line x1="324" y1="54" x2="378" y2="108" opacity="0.11"></line><line x1="432" y1="54" x2="378" y2="108" opacity="0.11"></line><line x1="486" y1="54" x2="432" y2="108" opacity="0.11"></line><line x1="486" y1="54" x2="540" y2="108" opacity="0.11"></line><line x1="594" y1="54" x2="540" y2="108" opacity="0.11"></line><line x1="648" y1="54" x2="594" y2="108" opacity="0.11"></line><line x1="0" y1="108" x2="54" y2="162" opacity="0.18"></line><line x1="108" y1="108" x2="54" y2="162" opacity="0.18"></line><line x1="162" y1="108" x2="108" y2="162" opacity="0.18"></line><line x1="216" y1="108" x2="162" y2="162" opacity="0.18"></line><line x1="270" y1="108" x2="216" y2="162" opacity="0.18"></line><line x1="270" y1="108" x2="324" y2="162" opacity="0.18"></line><line x1="378" y1="108" x2="324" y2="162" opacity="0.18"></line><line x1="432" y1="108" x2="378" y2="162" opacity="0.18"></line><line x1="486" y1="108" x2="432" y2="162" opacity="0.18"></line><line x1="540" y1="108" x2="486" y2="162" opacity="0.18"></line><line x1="540" y1="108" x2="594" y2="162" opacity="0.18"></line><line x1="648" y1="108" x2="594" y2="162" opacity="0.18"></line><line x1="0" y1="162" x2="54" y2="216" opacity="0.24"></line><line x1="108" y1="162" x2="54" y2="216" opacity="0.24"></line><line x1="108" y1="162" x2="162" y2="216" opacity="0.24"></line><line x1="162" y1="162" x2="216" y2="216" opacity="0.24"></line><line x1="216" y1="162" x2="270" y2="216" opacity="0.24"></line><line x1="270" y1="162" x2="324" y2="216" opacity="0.24"></line><line x1="378" y1="162" x2="324" y2="216" opacity="0.24"></line><line x1="432" y1="162" x2="378" y2="216" opacity="0.24"></line><line x1="432" y1="162" x2="486" y2="216" opacity="0.24"></line><line x1="486" y1="162" x2="540" y2="216" opacity="0.24"></line><line x1="540" y1="162" x2="594" y2="216" opacity="0.24"></line><line x1="648" y1="162" x2="594" y2="216" opacity="0.24"></line><line x1="54" y1="216" x2="0" y2="270" opacity="0.31"></line><line x1="108" y1="216" x2="54" y2="270" opacity="0.31"></line><line x1="162" y1="216" x2="108" y2="270" opacity="0.31"></line><line x1="162" y1="216" x2="216" y2="270" opacity="0.31"></line><line x1="216" y1="216" x2="270" y2="270" opacity="0.31"></line><line x1="324" y1="216" x2="270" y2="270" opacity="0.31"></line><line x1="378" y1="216" x2="324" y2="270" opacity="0.31"></line><line x1="432" y1="216" x2="378" y2="270" opacity="0.31"></line><line x1="486" y1="216" x2="432" y2="270" opacity="0.31"></line><line x1="486" y1="216" x2="540" y2="270" opacity="0.31"></line><line x1="540" y1="216" x2="594" y2="270" opacity="0.31"></line><line x1="594" y1="216" x2="648" y2="270" opacity="0.31"></line><line x1="54" y1="270" x2="0" y2="324" opacity="0.37"></line><line x1="108" y1="270" x2="54" y2="324" opacity="0.37"></line><line x1="108" y1="270" x2="162" y2="324" opacity="0.37"></line><line x1="162" y1="270" x2="216" y2="324" opacity="0.37"></line><line x1="216" y1="270" x2="270" y2="324" opacity="0.37"></line><line x1="270" y1="270" x2="324" y2="324" opacity="0.37"></line><line x1="324" y1="270" x2="378" y2="324" opacity="0.37"></line><line x1="378" y1="270" x2="432" y2="324" opacity="0.37"></line><line x1="486" y1="270" x2="432" y2="324" opacity="0.37"></line><line x1="540" y1="270" x2="486" y2="324" opacity="0.37"></line><line x1="594" y1="270" x2="540" y2="324" opacity="0.37"></line><line x1="648" y1="270" x2="594" y2="324" opacity="0.37"></line><line x1="0" y1="324" x2="54" y2="378" opacity="0.43"></line><line x1="108" y1="324" x2="54" y2="378" opacity="0.43"></line><line x1="108" y1="324" x2="162" y2="378" opacity="0.43"></line><line x1="162" y1="324" x2="216" y2="378" opacity="0.43"></line><line x1="270" y1="324" x2="216" y2="378" opacity="0.43"></line><line x1="270" y1="324" x2="324" y2="378" opacity="0.43"></line><line x1="324" y1="324" x2="378" y2="378" opacity="0.43"></line><line x1="432" y1="324" x2="378" y2="378" opacity="0.43"></line><line x1="486" y1="324" x2="432" y2="378" opacity="0.43"></line><line x1="486" y1="324" x2="540" y2="378" opacity="0.43"></line><line x1="540" y1="324" x2="594" y2="378" opacity="0.43"></line><line x1="648" y1="324" x2="594" y2="378" opacity="0.43"></line><line x1="54" y1="378" x2="0" y2="432" opacity="0.50"></line><line x1="108" y1="378" x2="54" y2="432" opacity="0.50"></line><line x1="108" y1="378" x2="162" y2="432" opacity="0.50"></line><line x1="162" y1="378" x2="216" y2="432" opacity="0.50"></line><line x1="270" y1="378" x2="216" y2="432" opacity="0.50"></line><line x1="324" y1="378" x2="270" y2="432" opacity="0.50"></line><line x1="378" y1="378" x2="324" y2="432" opacity="0.50"></line><line x1="432" y1="378" x2="378" y2="432" opacity="0.50"></line><line x1="486" y1="378" x2="432" y2="432" opacity="0.50"></line><line x1="486" y1="378" x2="540" y2="432" opacity="0.50"></line><line x1="540" y1="378" x2="594" y2="432" opacity="0.50"></line><line x1="648" y1="378" x2="594" y2="432" opacity="0.50"></line><line x1="0" y1="432" x2="54" y2="486" opacity="0.56"></line><line x1="108" y1="432" x2="54" y2="486" opacity="0.56"></line><line x1="108" y1="432" x2="162" y2="486" opacity="0.56"></line><line x1="162" y1="432" x2="216" y2="486" opacity="0.56"></line><line x1="270" y1="432" x2="216" y2="486" opacity="0.56"></line><line x1="324" y1="432" x2="270" y2="486" opacity="0.56"></line><line x1="378" y1="432" x2="324" y2="486" opacity="0.56"></line><line x1="378" y1="432" x2="432" y2="486" opacity="0.56"></line><line x1="486" y1="432" x2="432" y2="486" opacity="0.56"></line><line x1="486" y1="432" x2="540" y2="486" opacity="0.56"></line><line x1="594" y1="432" x2="540" y2="486" opacity="0.56"></line><line x1="594" y1="432" x2="648" y2="486" opacity="0.56"></line><line x1="0" y1="486" x2="54" y2="540" opacity="0.63"></line><line x1="108" y1="486" x2="54" y2="540" opacity="0.63"></line><line x1="108" y1="486" x2="162" y2="540" opacity="0.63"></line><line x1="216" y1="486" x2="162" y2="540" opacity="0.63"></line><line x1="216" y1="486" x2="270" y2="540" opacity="0.63"></line><line x1="270" y1="486" x2="324" y2="540" opacity="0.63"></line><line x1="324" y1="486" x2="378" y2="540" opacity="0.63"></line><line x1="378" y1="486" x2="432" y2="540" opacity="0.63"></line><line x1="432" y1="486" x2="486" y2="540" opacity="0.63"></line><line x1="486" y1="486" x2="540" y2="540" opacity="0.63"></line><line x1="594" y1="486" x2="540" y2="540" opacity="0.63"></line><line x1="594" y1="486" x2="648" y2="540" opacity="0.63"></line><line x1="54" y1="540" x2="0" y2="594" opacity="0.69"></line><line x1="108" y1="540" x2="54" y2="594" opacity="0.69"></line><line x1="108" y1="540" x2="162" y2="594" opacity="0.69"></line><line x1="216" y1="540" x2="162" y2="594" opacity="0.69"></line><line x1="270" y1="540" x2="216" y2="594" opacity="0.69"></line><line x1="270" y1="540" x2="324" y2="594" opacity="0.69"></line><line x1="324" y1="540" x2="378" y2="594" opacity="0.69"></line><line x1="378" y1="540" x2="432" y2="594" opacity="0.69"></line><line x1="432" y1="540" x2="486" y2="594" opacity="0.69"></line><line x1="540" y1="540" x2="486" y2="594" opacity="0.69"></line><line x1="540" y1="540" x2="594" y2="594" opacity="0.69"></line><line x1="594" y1="540" x2="648" y2="594" opacity="0.69"></line><line x1="54" y1="594" x2="0" y2="648" opacity="0.76"></line><line x1="54" y1="594" x2="108" y2="648" opacity="0.76"></line><line x1="162" y1="594" x2="108" y2="648" opacity="0.76"></line><line x1="216" y1="594" x2="162" y2="648" opacity="0.76"></line><line x1="216" y1="594" x2="270" y2="648" opacity="0.76"></line><line x1="270" y1="594" x2="324" y2="648" opacity="0.76"></line><line x1="378" y1="594" x2="324" y2="648" opacity="0.76"></line><line x1="432" y1="594" x2="378" y2="648" opacity="0.76"></line><line x1="432" y1="594" x2="486" y2="648" opacity="0.76"></line><line x1="486" y1="594" x2="540" y2="648" opacity="0.76"></line><line x1="594" y1="594" x2="540" y2="648" opacity="0.76"></line><line x1="594" y1="594" x2="648" y2="648" opacity="0.76"></line><line x1="54" y1="648" x2="0" y2="702" opacity="0.82"></line><line x1="54" y1="648" x2="108" y2="702" opacity="0.82"></line><line x1="162" y1="648" x2="108" y2="702" opacity="0.82"></line><line x1="162" y1="648" x2="216" y2="702" opacity="0.82"></line><line x1="270" y1="648" x2="216" y2="702" opacity="0.82"></line><line x1="324" y1="648" x2="270" y2="702" opacity="0.82"></line><line x1="378" y1="648" x2="324" y2="702" opacity="0.82"></line><line x1="432" y1="648" x2="378" y2="702" opacity="0.82"></line><line x1="486" y1="648" x2="432" y2="702" opacity="0.82"></line><line x1="540" y1="648" x2="486" y2="702" opacity="0.82"></line><line x1="594" y1="648" x2="540" y2="702" opacity="0.82"></line><line x1="594" y1="648" x2="648" y2="702" opacity="0.82"></line><line x1="0" y1="702" x2="54" y2="756" opacity="0.88"></line><line x1="54" y1="702" x2="108" y2="756" opacity="0.88"></line><line x1="108" y1="702" x2="162" y2="756" opacity="0.88"></line><line x1="216" y1="702" x2="162" y2="756" opacity="0.88"></line><line x1="216" y1="702" x2="270" y2="756" opacity="0.88"></line><line x1="270" y1="702" x2="324" y2="756" opacity="0.88"></line><line x1="378" y1="702" x2="324" y2="756" opacity="0.88"></line><line x1="378" y1="702" x2="432" y2="756" opacity="0.88"></line><line x1="486" y1="702" x2="432" y2="756" opacity="0.88"></line><line x1="540" y1="702" x2="486" y2="756" opacity="0.88"></line><line x1="540" y1="702" x2="594" y2="756" opacity="0.88"></line><line x1="594" y1="702" x2="648" y2="756" opacity="0.88"></line><line x1="0" y1="756" x2="54" y2="810" opacity="0.95"></line><line x1="108" y1="756" x2="54" y2="810" opacity="0.95"></line><line x1="162" y1="756" x2="108" y2="810" opacity="0.95"></line><line x1="216" y1="756" x2="162" y2="810" opacity="0.95"></line><line x1="270" y1="756" x2="216" y2="810" opacity="0.95"></line><line x1="270" y1="756" x2="324" y2="810" opacity="0.95"></line><line x1="324" y1="756" x2="378" y2="810" opacity="0.95"></line><line x1="378" y1="756" x2="432" y2="810" opacity="0.95"></line><line x1="486" y1="756" x2="432" y2="810" opacity="0.95"></line><line x1="540" y1="756" x2="486" y2="810" opacity="0.95"></line><line x1="594" y1="756" x2="540" y2="810" opacity="0.95"></line><line x1="594" y1="756" x2="648" y2="810" opacity="0.95"></line></g></svg>`
)}`;

const RegisterModal = ({ onClose }) => {
  const [selectedRole, setSelectedRole] = useState("jobseeker");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    role: "jobseeker",
    companyName: "",
    companyId: null, // New state for selected company ID
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    countryCode: "+61",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce for company search
  useEffect(() => {
    const fetchCompanySuggestions = async () => {
      if (formData.companyName.length < 2) {
        setCompanySuggestions([]);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/companies/search?query=${formData.companyName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch company suggestions');
        }
        const data = await response.json();
        setCompanySuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching company suggestions:', error);
        setCompanySuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (selectedRole !== 'jobseeker') { // Only fetch for employer/staffing roles
        fetchCompanySuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [formData.companyName, selectedRole]);


  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "companyName") {
      setFormData((prev) => ({ ...prev, companyId: null })); // Clear company ID if user types
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, role, companyName: "", companyId: null })); // Clear company fields on role change
    setCompanySuggestions([]);
    setShowSuggestions(false);
  };

  const handleCompanySelect = (company) => {
    setFormData((prev) => ({ ...prev, companyName: company.name, companyId: company.id }));
    setCompanySuggestions([]);
    setShowSuggestions(false);
  };

  const handleRegister = async () => {
    if (!agreeToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy"); // Using toast
      return;
    }

    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone_number: `${formData.countryCode}${formData.phoneNumber}`,
      role: selectedRole,
    };

    if (selectedRole !== 'jobseeker') {
      payload.company_id = formData.companyId; // Send company_id if selected
      // Only send company_name if a new company is being created (i.e., companyId is null)
      if (!formData.companyId) {
        payload.company_name = formData.companyName;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Registration failed:", result.message);
        // Display validation errors if available
        if (result.errors) {
            const errorMessages = Object.values(result.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            toast.error(result.message || "Registration failed.");
        }
        return;
      }

      // Save token and user to localStorage
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      // Redirect to the correct dashboard based on role
      const dashboardMap = {
        employer: "/employer/dashboard",
        jobseeker: "/jobseeker/dashboard",
        staffing: "/staffing/dashboard",
      };

      const userRole = result.data.user.role;
      const redirectUrl = dashboardMap[userRole] || "/";

      toast.success("Registration successful!"); // Using toast
      window.location.href = redirectUrl; // Redirect
      onClose(); // Close modal after successful registration and redirect
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Try again."); // Using toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl bg-white flex flex-col md:flex-row rounded-lg overflow-hidden h-[90vh]">
        {/* Left Branding (40%) - Fixed height */}
        <div
          className="bg-gray-100 text-white p-8 w-full md:w-[40%] flex flex-col justify-center items-center text-center"
          style={{
            backgroundImage: `url("${svgPattern}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(243, 244, 246, 0.8)', // gray-100 with opacity
            backgroundBlendMode: 'overlay'
          }}
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#003893]">Zob</span>
            <span className="text-[#DC143C]">Next</span>
          </h1>
          <p className="text-lg font-medium max-w-sm mt-4 text-[#003893]">
            "Unlock your potential with the right role and the right organization."
          </p>
        </div>

        {/* Right Form (60%) - Scrollable */}
        <div className="w-full md:w-[60%] px-8 sm:px-16 py-8 relative bg-white overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl text-red-600 hover:text-white hover:bg-red-600 rounded-full"
          >
            <IoIosCloseCircleOutline />
          </button>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#003893] text-center">Create your ZobNext account</h2>

            {/* Role Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {roles.map(({ id, label, icon }) => (
                <div
                  key={id}
                  onClick={() => handleRoleSelect(id)}
                  className={`border rounded-lg p-4 flex flex-col items-center gap-2 text-center cursor-pointer relative hover:border-[#003893] hover:shadow-md ${
                    selectedRole === id ? "border-[#003893]" : "border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3 text-[#003893]">{icon}
                  <h3 className="text-lg font-semibold">{label}</h3>
                  </div>
                  {selectedRole === id && (
                    <span className="absolute -top-2 -right-2 text-green-600 text-2xl rounded-full bg-white">
                      <IoIosCheckmarkCircleOutline />
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {(selectedRole === "staffing" || selectedRole === "employer") && (
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    onFocus={() => formData.companyName.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay hiding to allow click
                    className="w-full px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg"
                    placeholder="Type to search or add new company"
                  />
                  {showSuggestions && companySuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {companySuggestions.map((company) => (
                        <li
                          key={company.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => handleCompanySelect(company)} // Use onMouseDown to prevent blur event
                        >
                          {company.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg"
                  placeholder="Enter your email"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg"
                  >
                    <option value="+61">🇦🇺 +61 (AU)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+977">🇳🇵 +977 (NP)</option>
                    <option value="+64">🇳🇿 +64 (NZ)</option>
                  </select>
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center mt-8">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the <a href="/terms" className="text-[#003893] hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#003893] hover:underline">Privacy Policy</a>
                </label>
              </div>

              <button
                onClick={handleRegister}
                className="w-full bg-[#003893] text-white py-2 mb-1 rounded-4xl inset-shadow-lg hover:bg-[#005EF5] transition mt-4"
              >
                Create an account
              </button>

              {/* No credit card required */}
              <p className="text-sm text-center text-gray-500">*No credit card required</p>

              {/* Social Login Section */}
              <div className="mt-6">
                <div className="flex items-center justify-center mb-4">
                  <span className="mx-4 text-sm text-gray-500">or sign up using</span>
                </div>

                <div className="flex justify-center gap-4">
                  <button className="p-3 text-2xl bg-gray-50 rounded-full hover:bg-gray-200">
                    <FaGoogle className="text-red-500" />
                  </button>
                  <button className="p-3 text-2xl bg-gray-50 rounded-full hover:bg-gray-100">
                    <FaLinkedin className="text-blue-600" />
                  </button>
                  <button className="p-3 text-2xl bg-gray-50 rounded-full hover:bg-gray-100">
                    <FaTwitter className="text-blue-400" />
                  </button>
                  <button className="p-3 text-2xl bg-gray-50 rounded-full hover:bg-gray-100">
                    <FaFacebook className="text-blue-700" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
