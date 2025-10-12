// src/components/AdminDashboard/AdminSidebar.jsx
import React from "react";
import AdminProfileCard from "./AdminProfileCard";
import AdminNavigationMenu from "./AdminNavigationMenu";

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 h-screen shadow-md flex flex-col">
      {/* Profile Card - Top */}
      <div className="p-4">
        <AdminProfileCard />
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-2">
        <AdminNavigationMenu />
      </div>
    </aside>
  );
};

export default AdminSidebar;
