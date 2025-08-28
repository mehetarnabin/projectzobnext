import React from "react";
import ProfileCard from "./ProfileCard";
import ProfileCompletion from "./ProfileCompletion";
import NavigationMenu from "./NavigationMenu";
import CalendarWidget from "./CalendarWidget";
import RecentActivity from "./RecentActivity";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray flex flex-col">
      {/* Profile Card - Top Section */}
      <div className="p-4 pl-0">
        <ProfileCard />
      </div>

      {/* Profile Completion Component */}
      <div className="px-4 pb-4 pl-0">
        <ProfileCompletion />
      </div>
      
      {/* Navigation Menu - Removed overflow-y-auto */}
      <div className="flex-1 pl-0">
        <NavigationMenu />
      </div>
      
      {/* Calendar Widget */}
      <div className="p-4 pl-0">
        <CalendarWidget />
      </div>
      
      {/* Recent Activity */}
      {/* <div className="p-4">
        <RecentActivity />
      </div> */}
    </div>
  );
};

export default Sidebar;