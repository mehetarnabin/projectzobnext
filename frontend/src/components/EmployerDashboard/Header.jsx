import API_BASE_URL from "../../config"; // Add this line
import React, { useState } from "react";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import { MdWorkOutline } from "react-icons/md";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample user data
  const user = {
    firstName: "John",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs, companies..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center space-x-4">
          {/* Matched Jobs Link */}
          <button className="p-1 rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none">
            <MdWorkOutline className="h-5 w-5" />
          </button>

          {/* Notification Bell */}
          <button className="p-1 rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none relative">
            <FaBell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative ml-4">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user.firstName}
              </span>
              <FaChevronDown className={`hidden md:inline h-3 w-3 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a
                    href="#membership"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Membership
                  </a>
                  <a
                    href="#accountSettings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Account Settings
                  </a>
                  <a
                    href="#helpCenter"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Help center
                  </a>
                  <a
                    href="#logout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;