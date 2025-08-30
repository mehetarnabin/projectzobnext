import React from "react";
import Sidebar from "../components/EmployerDashboard/Sidebar"; // Assuming this is correct
// import Header from "../components/Dashboard/Header"; // Keeping commented out as in your example
import ProfileActivity from "../components/EmployerDashboard/ProfileActivity"; // This is now your applicant counts
// import ActivityStatistics from "../components/EmployerDashboard/VacancyStats";
import { useAuth } from "../context/AuthContext";
import VacancyStats from "../components/EmployerDashboard/VacancyStats";

// NEW IMPORTS FOR EMPLOYER DASHBOARD
import UpcomingEvents from "../components/EmployerDashboard/UpcomingEvents";
import LatestActivity from "../components/EmployerDashboard/LatestActivity";

const DashboardPage = () => { // Renamed from EmployerDashboard for consistency with App.jsx
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-8">Loading user data...</div>;
  }

  // Determine if the user is an employer
  const isEmployer = user.role === 'employer';

  return (
    <div className="outer-wrapper bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-4 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header (if you uncomment it later) */}
          {/* <Header /> */}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pr-0">
            {/* Employer-specific Dashboard Content */}
            {isEmployer ? (
              <>
                {/* Applicant Overview Cards (ProfileActivity) */}
                <ProfileActivity />

                {/* Activity Statistics Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <VacancyStats />
                  </div>
                  <div className="lg:col-span-1">
                    <UpcomingEvents />
                  </div>
                </div>

                {/* New Row: Upcoming Events and Latest Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <LatestActivity />
                </div>
              </>
            ) : (
              // Content for Job Seeker Dashboard (if this DashboardPage is shared)
              // Or a message if this page is strictly for employers
              <div className="text-center py-8 text-gray-600">
                Welcome to your Dashboard! Content tailored for your role will appear here.
                {/* You might put job seeker specific components here if this is a universal dashboard */}
              </div>
            )}
          </main> 
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;