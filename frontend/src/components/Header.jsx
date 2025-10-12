import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { MdWorkOutline } from "react-icons/md";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { profileData } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const [modalType, setModalType] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const notificationRef = useRef(null);

  const displayUserName = user?.name || profileData?.name || "User";
  const displayAvatarUrl =
    profileData?.logoUrl && !profileData.logoUrl.includes("default_profile.jpg")
      ? profileData.logoUrl
      : user?.avatar || "images/default_profile.jpg";

  const openLogin = () => setModalType("login");
  const openRegister = () => setModalType("register");
  const closeModal = () => setModalType(null);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
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

  const getProfilePath = () => {
    if (!user) return "/";
    if (user.role === "jobseeker") return "/profile";
    if (user.role === "employer" || user.role === "staffing") return "/employer/profile";
    return "/";
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

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        const data = res.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read_at).length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post("/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date() })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read_at: new Date() } : item))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    if (n.data?.link) navigate(n.data.link);
    setIsNotificationOpen(false);
  };

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target)
      ) setIsDropdownOpen(false);

      if (notificationRef.current && !notificationRef.current.contains(event.target))
        setIsNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="max-w-screen-xl mx-auto p-4 flex items-center">
          {/* Logo + Nav */}
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

              {/* Profile Link */}
              {user && (
                <Link
                  to={getProfilePath()}
                  className="p-2 rounded-full text-gray-600 bg-gray-100 hover:outline-2 hover:outline-[#003893] focus:outline-none"
                  title="Profile"
                >
                  <CgProfile className="h-5 w-5" />
                </Link>
              )}

              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="p-2 rounded-full text-gray-600 bg-gray-100 hover:outline-2 hover:outline-[#003893] focus:outline-none relative"
                  onClick={() => {
                    setIsNotificationOpen((prev) => !prev);
                    if (unreadCount > 0) markAllRead();
                  }}
                >
                  <FaBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <div
                  className={`origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999] transition-all ${isNotificationOpen ? "block" : "hidden"}`}
                >
                  <div className="py-2 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`px-4 py-2 text-sm cursor-pointer ${!n.read_at ? "bg-blue-50" : "hover:bg-gray-100"}`}
                        >
                          <div className="font-medium text-gray-800">
                            {n.data?.type === "ending_soon" ? "Subscription Ending Soon" : "Subscription Ended"}
                          </div>
                          <div className="text-gray-600">{n.data?.message}</div>
                          <div className="text-gray-400 text-xs">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Dropdown */}
              <div className="relative ml-4">
                <button
                  ref={dropdownButtonRef}
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                    <img src={displayAvatarUrl} alt={displayUserName} className="h-full w-full object-cover" />
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-700">{displayUserName}</span>
                  <FaChevronDown className={`hidden md:inline h-3 w-3 text-gray-500 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div className="py-1">
                      <a href="#membership" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Membership</a>
                      <a href="#accountSettings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Account Settings</a>
                      <a href="#helpCenter" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Help center</a>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 justify-end items-center">
              <button onClick={openLogin} className="text-gray-700 hover:text-blue-500">Login</button>
              <button onClick={openRegister} className="ml-8 text-gray-900 border-2 border-[#003893] px-6 py-2 rounded hover:text-[#DC143C] transition">Post a Job</button>
            </div>
          )}
        </div>
      </header>

      {modalType === "login" && <LoginModal onClose={closeModal} onRegisterClick={openRegister} />}
      {modalType === "register" && <RegisterModal onClose={closeModal} />}
    </>
  );
};

export default Header;
