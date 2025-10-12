// src/components/AdminDashboard/AdminNavigationMenu.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaBuilding, FaUsers, FaChartBar } from "react-icons/fa";
import { MdSubscriptions } from "react-icons/md";
import { AiOutlineBarChart } from "react-icons/ai";

const AdminNavigationMenu = () => {
  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { name: "Employer Subscriptions", icon: <MdSubscriptions />, path: "/admin/employer-subscriptions" },
    { name: "Jobseeker Subscriptions", icon: <MdSubscriptions />, path: "/admin/jobseeker-subscriptions" },
    { name: "Companies", icon: <FaBuilding />, path: "/admin/companies" },
    { name: "Jobseekers", icon: <FaUsers />, path: "/admin/jobseekers" },
    { name: "Reports & Insights", icon: <AiOutlineBarChart />, path: "/admin/reports" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mr-4">
      <ul className="space-y-0">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#003983] transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNavigationMenu;
