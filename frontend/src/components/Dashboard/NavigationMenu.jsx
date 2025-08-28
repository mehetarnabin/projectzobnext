import React from "react";
import { 
  FaSave, 
  FaBriefcase, 
  FaFileAlt, 
  FaBook, 
  FaBuilding,
  FaCalendarAlt
} from "react-icons/fa";
import { BsCardChecklist, BsBuildings } from "react-icons/bs";
import { IoBriefcaseOutline } from "react-icons/io5";
import { AiOutlineBarChart } from "react-icons/ai";
import { LuNotebookText } from "react-icons/lu";
import { FaRegFileLines } from "react-icons/fa6";
import { SlEvent } from "react-icons/sl";
import { useNavigate } from "react-router-dom";

const NavigationMenu = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: "Saved Jobs", icon: <IoBriefcaseOutline />, path: "/dashboard" },
    { name: "Applied Jobs", icon: <BsCardChecklist />, path: "/jobseeker/dashboard/applied-jobs" },
    { name: "Document Hub", icon: <BsCardChecklist />, path: "/jobseeker/dashboard/document-hub" },
    { name: "Job Insight", icon: <AiOutlineBarChart />, path: "/dashboard/job-insight" },
    { name: "Resources", icon: <LuNotebookText />, path: "/dashboard/resources" },
    { name: "Resume Builder", icon: <FaRegFileLines />, path: "/dashboard/resume-builder" },
    { name: "Companies", icon: <BsBuildings />, path: "/dashboard/companies" },
    { name: "Events", icon: <SlEvent />, path: "/dashboard/events" }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mr-4">
      <ul className="space-y-0">
        {menuItems.map((item, index) => (
          <li key={index}>
            <button 
              className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#003983] transition-colors"
              onClick={() => navigate(item.path)}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationMenu;