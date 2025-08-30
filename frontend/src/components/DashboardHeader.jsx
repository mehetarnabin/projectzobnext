import React from "react";
import { FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";

const DashboardHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Hello, <span className="text-[#003893]">{user?.name || "User"}</span> 👋
        </h1>
        <p className="text-sm text-gray-500">Welcome to your dashboard</p>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 bg-[#f5f8ff] rounded-full hover:bg-[#e6f0ff] transition">
          <FiBell className="text-[#003893] text-xl" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-[5px] py-[1px] rounded-full">
            3
          </span>
        </button>

        {/* Profile */}
        <Link to="/jobseeker/profile" className="flex items-center gap-2">
          <img
            src="https://ui-avatars.com/api/?name=User&background=003893&color=fff"
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-[#003893]"
          />
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader;
