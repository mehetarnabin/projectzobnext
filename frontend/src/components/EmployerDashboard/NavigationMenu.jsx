import React from "react";
import { Link } from "react-router-dom"; 
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

const NavigationMenu = () => {
  const menuItems = [
    { name: "Post a Job", icon: <IoBriefcaseOutline />, path: "/postjob" },
    //{ name: "Posted Jobs", icon: <IoBriefcaseOutline />, path: "/employer/posted-jobs" },
    { name: "Applicants", icon: <BsCardChecklist />, path: "/employer/applicants" },
    //{ name: "Job Insight", icon: <AiOutlineBarChart /> },
    { name: "Resources", icon: <LuNotebookText /> },
    //{ name: "Resume Builder", icon: <FaRegFileLines /> },
    { name: "Companies", icon: <BsBuildings /> },
    { name: "Events", icon: <SlEvent />, path:"/employer/eventpage"}
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mr-4">
      <ul className="space-y-0">
        {menuItems.map((item, index) => (
          <li key={index}>
            {/* Conditionally render Link or button based on if a path exists */}
            {item.path ? (
              <Link
                to={item.path}
                className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#003983] transition-colors"
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ) : (
              <button
                className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#003983] transition-colors"
                onClick={() => console.log(`Navigating to ${item.name}`)} // Fallback for items without a path
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationMenu;