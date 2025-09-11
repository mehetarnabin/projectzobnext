import React from "react";
import { Link } from "react-router-dom"; 
import { 
  FaBriefcase, 
  FaGem 
} from "react-icons/fa";
import { BsCardChecklist, BsBuildings } from "react-icons/bs";
import { IoBriefcaseOutline } from "react-icons/io5";
import { LuNotebookText } from "react-icons/lu";
import { SlEvent } from "react-icons/sl";
import { FaRegFileLines } from "react-icons/fa6";

const NavigationMenu = () => {
  const menuItems = [
    { name: "Post a Job", icon: <IoBriefcaseOutline />, path: "/postjob" },
    { name: "Applicants", icon: <BsCardChecklist />, path: "/employer/applicants" },
    { name: "Resources", icon: <LuNotebookText /> },
    { name: "Companies", icon: <BsBuildings /> },
    { name: "Events", icon: <SlEvent />, path: "/employer/eventpage", premium: true } // Premium gem
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mr-4">
      <ul className="space-y-0">
        {menuItems.map((item, index) => (
          <li key={index}>
            {item.path ? (
              <Link
                to={item.path}
                className="w-full flex items-center justify-between p-2 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#003983] transition-colors"
              >
                <span className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </span>
                {item.premium && (
                  <FaGem className="text-pink-500 text-xl" /> // Right-side premium icon
                )}
              </Link>
            ) : (
              <button
                className="w-full flex items-center justify-between p-2 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#003983] transition-colors"
                onClick={() => console.log(`Navigating to ${item.name}`)}
              >
                <span className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </span>
                {item.premium && (
                  <FaGem className="text-pink-500 text-xl" />
                )}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationMenu;
