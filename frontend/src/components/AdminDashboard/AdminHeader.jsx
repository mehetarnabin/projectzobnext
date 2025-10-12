// src/components/AdminDashboard/AdminHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import adminApi from "../../api/AdminApi";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // --- Fetch admin notifications ---
  const fetchNotifications = async () => {
    try {
      const res = await adminApi.get("/admin/notifications");
      const data = res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read_at).length);
    } catch (err) {
      console.error("Error fetching admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  // --- Mark a single notification as read ---
  const markAsRead = async (notification) => {
    if (!notification.read_at) {
      try {
        await adminApi.post("/admin/notifications/mark-read", {
          notification_id: notification.id,
        });
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read_at: new Date() } : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }
  };

  // --- Handle clicking a notification ---
  const handleNotificationClick = (n) => {
    markAsRead(n);
    if (n.data?.link) navigate(n.data.link);
    setIsNotificationOpen(false);
  };

  // --- Close dropdown when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <span className="text-[#003893]">Zob</span>
          <span className="text-[#DC143C]">Next</span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              className="p-2 rounded-full text-gray-600 bg-gray-100 hover:outline-2 hover:outline-[#003893] focus:outline-none relative"
              onClick={() =>
                setIsNotificationOpen((prev) => !prev)
              }
            >
              <FaBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>

            <div
              className={`origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999] transition-all ${
                isNotificationOpen ? "block" : "hidden"
              }`}
            >
              <div className="py-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        !n.read_at ? "bg-blue-50" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium text-gray-800">
                        {n.data?.title || "Notification"}
                      </div>
                      <div className="text-gray-600">{n.data?.message}</div>
                      <div className="text-gray-400 text-xs">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-gray-900 border-2 border-[#003893] px-6 py-2 rounded hover:text-[#DC143C] transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
