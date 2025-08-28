// StaffingDashboard.jsx
import React from "react";

const StaffingDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#003893]">
        Welcome to Staffing Agency Dashboard, {user?.name}!
      </h1>
    </div>
  );
};

export default StaffingDashboard;
