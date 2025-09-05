// src/components/AdminDashboard/AdminSidebar.jsx
import React from "react";
import AdminProfileCard from "./AdminProfileCard";
import AdminNavigationMenu from "./AdminNavigationMenu";

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-gray flex flex-col">
      {/* Profile Card - Top */}
      <div className="p-4 pl-0">
        <AdminProfileCard />
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 pl-0">
        <AdminNavigationMenu />
      </div>
    </div>
  );
};

export default AdminSidebar;
