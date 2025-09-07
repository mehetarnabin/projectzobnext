import React, { useState } from "react";
import { List, X } from "lucide-react"; // Hamburger and close icons

import ProfileCard from "./ProfileCard";
import ProfileCompletion from "./ProfileCompletion";
import NavigationMenu from "./NavigationMenu";
import CalendarWidget from "./CalendarWidget";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button at top-left */}
      <button
        className="p-2 m-2 rounded hover:bg-gray-200 fixed top-4 left-4 z-50 bg-white shadow"
        onClick={() => setIsOpen(true)}
      >
        <List className="w-6 h-6" />
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-Out Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside sidebar */}
        <div className="flex justify-end p-2">
          <button onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 border-b flex-shrink-0">
            <ProfileCard />
          </div>

          <div className="p-4 border-b flex-shrink-0">
            <ProfileCompletion />
          </div>

          <div className="p-4 border-b">
            <NavigationMenu />
          </div>

          <div className="p-4 border-b flex-shrink-0">
            <CalendarWidget />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
