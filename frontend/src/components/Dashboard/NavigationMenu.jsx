import React from "react";
import { 
  FaBriefcase, 
  FaFileAlt, 
  FaChartLine,
  FaGem  // Premium icon
} from "react-icons/fa";
import { BsCardChecklist, BsBuildings } from "react-icons/bs";
import { IoBriefcaseOutline } from "react-icons/io5";
import { LuNotebookText } from "react-icons/lu";
import { SlEvent } from "react-icons/sl";
import { useNavigate } from "react-router-dom";

const NavigationMenu = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: "Saved Jobs", icon: <IoBriefcaseOutline />, path: "/dashboard" },
    { name: "Applied Jobs", icon: <BsCardChecklist />, path: "/jobseeker/dashboard/applied-jobs" },
    { name: "Shortlisted Candidate", icon: <FaBriefcase />, path: "/jobseeker/dashboard/shortlisted-candidate" },
    { name: "Document Hub", icon: <BsCardChecklist />, path: "/jobseeker/dashboard/document-hub" },
    { 
      name: "Job Insight", 
      icon: <FaChartLine />, 
      path: "/dashboard/job-insight", 
      premium: true // mark as premium
    },
    { name: "Resources", icon: <LuNotebookText />, path: "/dashboard/resources" },
    { 
      name: "Resume Builder", 
      icon: <FaFileAlt />, 
      path: "/dashboard/resume-builder", 
      premium: true // mark as premium
    },
    { name: "Companies", icon: <BsBuildings />, path: "/dashboard/companies" },
    { name: "Events", icon: <SlEvent />, path: "/dashboard/events" }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mr-4">
      <ul className="space-y-0">
        {menuItems.map((item, index) => (
          <li key={index}>
            <button 
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 hover:text-[#003983] transition-colors"
              onClick={() => navigate(item.path)}
            >
              <span className="flex items-center">
                <span className="mr-3 text-gray-700 text-xl">{item.icon}</span>
                <span className="text-gray-800">{item.name}</span>
              </span>
              {item.premium && (
                <FaGem className="text-pink-500 text-xl" /> // Premium icon on right
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationMenu;
