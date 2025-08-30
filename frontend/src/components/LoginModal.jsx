import API_BASE_URL from "../config"; // Add this line
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaLinkedin, FaMicrosoft, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FiUserCheck, FiBriefcase, FiUsers } from "react-icons/fi";
import { IoIosCloseCircleOutline, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useAuth } from '../context/AuthContext';

const roles = [
  {
    id: "staffing",
    label: "Staffing Agency",
    description: "Manage clients and candidates, and post jobs on behalf of employers.",
    icon: <FiUsers size={24} />,
  },
  {
    id: "employer",
    label: "Employer",
    description: "Post jobs and hire candidates directly from our talent pool.",
    icon: <FiBriefcase size={24} />,
  },
  {
    id: "jobseeker",
    label: "Job Seeker",
    description: "Apply for jobs, manage your profile and connect with employers.",
    icon: <FiUserCheck size={24} />,
  },
];

const LoginModal = ({ onClose, onRegisterClick }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (roleId) => setSelectedRole(roleId);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: selectedRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Login failed:", result.message);
        alert(result.message || "Login failed.");
        return;
      }

      const { token, user } = result.data;

      if (user.role !== selectedRole) {
        alert("Account does not exist for the selected role.");
        return;
      }

      login(user, token);

      alert("Login successful!");

      // Auto-route based on role
      if (user.role === "jobseeker") {
        navigate("/jobseeker/dashboard");
      } else if (user.role === "employer") {
        navigate("/employer/dashboard");
      } else if (user.role === "staffing") {
        navigate("/staffing/dashboard");
      }

      onClose(); // close modal
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-60 flex items-center justify-center p-4 transition-all duration-300">
      <div className="relative w-full bg-white p-6 md:p-12 rounded-lg border border-gray-200 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl rounded-full text-red-600 hover:text-white hover:bg-red-600"
        >
          <IoIosCloseCircleOutline />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#003893]">Welcome to Zob<span className="text-[#DC143C]">Next</span></h2>
          <p className="text-gray-700 mt-2">Choose an account type to continue</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`relative border rounded-lg p-4 cursor-pointer hover:border-[#003893] hover:shadow-md transition ${
                selectedRole === role.id ? "border-[#003893]" : "border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2 text-[#003893]">{role.icon}<h3 className="text-lg font-semibold">{role.label}</h3></div>
              <p className="text-sm text-gray-600">{role.description}</p>
              {selectedRole === role.id && (
                <span className="absolute -top-2 -right-2 text-green-600 text-2xl rounded-full bg-white"><IoIosCheckmarkCircleOutline /></span>
              )}
            </div>
          ))}
        </div>

        {/* Only show form if a role is selected */}
        {selectedRole && (
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email address or mobile number</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email or mobile"
                className="w-full px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-4xl border-gray-200 inset-shadow-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-[#003893] text-white py-2 rounded-4xl inset-shadow-lg hover:bg-[#005EF5] transition"
            >
              Sign In
            </button>

            <button className="w-full text-[#003893] underline hover:text-red-600 text-sm">
              Forgot Password?
            </button>

            {/* Social Sign In */}
            <div className="text-center my-4 text-sm text-gray-500">or sign in using</div>
            <div className="flex justify-center gap-4">
              <button className="p-3 text-2xl bg-gray-50 rounded-full hover:bg-gray-200">
                <FaGoogle className="text-red-500" />
              </button>
              <button className="p-3 text-2xl bg-gray-50 rounded-full hover:bg-gray-100">
                <FaLinkedin className="text-blue-600" />
              </button>
              <button className="p-3 text-2xl bg-gray-50 rounded-full hover:bg-gray-100">
                <FaMicrosoft className="text-blue-700" />
              </button>
            </div>

            {/* Register Prompt */}
            <p className="text-center text-sm mt-6 text-gray-600">
              Don't have a ZobNext account?{" "}
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-[#003893] font-medium underline hover:text-[#005EF5]"
              >
                Register Now
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;