// src/pages/admin/AdminDashboard.jsx
import React from "react";
import AdminSidebar from "../components/AdminDashboard/AdminSidebar";
import AdminHeader from "../components/AdminDashboard/AdminHeader";
import PackageActivity from "../components/AdminDashboard/PackageActivity";
import PackageActivityStatistics from "../components/AdminDashboard/PackageActivityStatistics";



const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeader />

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Welcome message */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-gray-600">
              You are now logged in as an admin. Manage the system from here.
            </p>
          </div>
          <PackageActivityStatistics />
          <PackageActivity />

          
          
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
