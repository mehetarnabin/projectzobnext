import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaSearch, FaRegBell, FaChevronDown } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { MdWorkOutline } from "react-icons/md";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [modalType, setModalType] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { profileData, loading: profileLoading } = useProfile();

  // Create a ref for the dropdown container
  const dropdownRef = useRef(null);
  // Create a ref for the button that toggles the dropdown
  const dropdownButtonRef = useRef(null);

  const openLogin = () => setModalType('login');
  const openRegister = () => setModalType('register');
  const closeModal = () => setModalType(null);

  // --- Click outside hook for dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the dropdown is open and the click is outside both the dropdown button and the dropdown content
      if (
        isDropdownOpen &&
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]); // Re-run effect when dropdown state changes
  // --- End click outside hook ---

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
    setIsDropdownOpen(false); // Close dropdown on logout
    // navigate("/") is handled by AuthContext's logout
  };

  const isDashboard = () => {
    if (!user) return false;
    switch (user.role) {
      case "jobseeker":
        return location.pathname.startsWith("/jobseeker/dashboard");
      case "employer":
        return location.pathname.startsWith("/employer/dashboard");
      case "staffing":
        return location.pathname.startsWith("/staffing/dashboard");
      default:
        return false;
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "jobseeker":
        return "/jobseeker/dashboard";
      case "employer":
        return "/employer/dashboard";
      case "staffing":
        return "/staffing/dashboard";
      default:
        return "/";
    }
  };

  // Determine the profile path based on user role
  const getProfilePath = () => {
    if (!user) return "/"; // Fallback
    if (user.role === "jobseeker") {
      return "/profile"; // Jobseeker profile path
    } else if (user.role === "employer" || user.role === "staffing") {
      return "/employer/profile"; // Employer/Staffing profile path
    }
    return "/"; // Default if role is not recognized
  };


  const displayUserName = user?.name || profileData.name || "User";
  const displayAvatarUrl =
    (profileData.logoUrl && !profileData.logoUrl.includes('default_profile.jpg'))
    ? profileData.logoUrl
    : (user?.avatar || "images/default_profile.jpg");

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="max-w-screen-xl mx-auto p-4 flex items-center">
          <div className="flex flex-1 items-center">
            <Link to="/" className="text-2xl font-bold mr-4">
              <span className="text-[#003893]">Zob</span><span className="text-[#DC143C]">Next</span>
            </Link>
            <nav>
                <ul className="flex space-x-4 ml-4">
                  <li><Link to="/jobs" className="text-gray-700 hover:text-blue-500">Find a Job</Link></li>
                  <li><Link to="#" className="text-gray-700 hover:text-blue-500">Companies</Link></li>
                  <li><Link to="#" className="text-gray-700 hover:text-blue-500">Tips and Tricks</Link></li>
                </ul>
            </nav>
          </div>

          {/* Use isAuthenticated from AuthContext */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {!isDashboard() && (
                <Link
                  to={getDashboardPath()}
                  className="p-2 rounded-full text-gray-600 bg-gray-100 hover:outline-2 hover:outline-[#003893] focus:outline-none"
                  title="Dashboard"
                >
                  <RxDashboard className="h-5 w-5" />
                </Link>
              )}

              {/* Conditional Profile Link based on user role */}
              {user && (
                <Link
                  to={getProfilePath()} // Dynamically set profile path
                  className="p-2 rounded-full text-gray-600 bg-gray-100 hover:outline-2 hover:outline-[#003893] focus:outline-none"
                  title="Profile"
                >
                  <CgProfile className="h-5 w-5" />
                </Link>
              )}

              <button className="p-2 rounded-full text-gray-600 bg-gray-100 hover:outline-2 hover:outline-[#003893] focus:outline-none relative" title="Notification">
                <FaRegBell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative ml-4">
                <button
                  ref={dropdownButtonRef}
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={displayAvatarUrl}
                      alt={displayUserName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {displayUserName}
                  </span>
                  <FaChevronDown className={`hidden md:inline h-3 w-3 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div className="py-1">
                      <a
                        href="#membership"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Membership
                      </a>
                      <a
                        href="#accountSettings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Account Settings
                      </a>
                      <a
                        href="#helpCenter"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Help center
                      </a>
                      <button
                        onClick={handleLogout} // Calls the new handleLogout
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 justify-end items-center">
              <div>
                <button
                  onClick={openLogin}
                  className="text-gray-700 hover:text-blue-500"
                >
                  Login
                </button>
              </div>
              <button
                className="ml-8 text-gray-900 border-2 border-[#003893] px-6 py-2 rounded hover:text-[#DC143C] transition"
                onClick={openRegister}
              >
                Post a Job
              </button>
            </div>
          )}
        </div>
      </header>

      {modalType === "login" && (
        <LoginModal onClose={closeModal} onRegisterClick={openRegister} />
      )}
      {modalType === "register" && (
        <RegisterModal onClose={closeModal} />
      )}
    </>
  );
};

export default Header;
