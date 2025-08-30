import React from "react";
import {
  FiHome,
  FiUser,
  FiHeart,
  FiCheckCircle,
  FiCalendar,
  FiFileText,
  FiBriefcase,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiCompass,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: <FiHome />, path: "/jobseeker/dashboard" },
  { label: "My Profile", icon: <FiUser />, path: "/jobseeker/profile" },
  { label: "Saved Jobs", icon: <FiHeart />, path: "/jobseeker/saved-jobs" },
  { label: "Applied Jobs", icon: <FiCheckCircle />, path: "/jobseeker/applied-jobs" },
  { label: "Interviewed", icon: <FiCalendar />, path: "/jobseeker/interviewed" },
  { label: "Matched Jobs", icon: <FiStar />, path: "/jobseeker/matched-jobs" },
  { label: "Resume Builder", icon: <FiFileText />, path: "/jobseeker/resume-builder" },
  { label: "Job Insight", icon: <FiCompass />, path: "/jobseeker/job-insight" },
  { label: "Calendar", icon: <FiCalendar />, path: "/jobseeker/calendar" },
  { label: "Membership", icon: <FiUsers />, path: "/jobseeker/membership" },
  { label: "Account Settings", icon: <FiSettings />, path: "/jobseeker/settings" },
  { label: "Help Center", icon: <FiHelpCircle />, path: "/help" },
];

const JobSeekerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="w-full md:w-64 bg-white shadow-lg border-r border-gray-200 h-screen fixed top-0 left-0 z-40">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <span className="text-[#003893]">Zob</span>
          <span className="text-[#DC143C]">Next</span>
        </Link>
      </div>

      <nav className="px-4 py-6 space-y-2 overflow-y-auto h-[calc(100vh-100px)] custom-scrollbar">
        {navItems.map((item) => (
          <Link
            to={item.path}
            key={item.label}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-[#0038930d] rounded-lg transition"
          >
            <span className="text-xl text-[#003893]">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition mt-4"
        >
          <FiLogOut className="text-xl" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default JobSeekerSidebar;
