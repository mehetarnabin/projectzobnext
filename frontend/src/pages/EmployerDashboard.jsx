import React from "react";
import Sidebar from "../components/EmployerDashboard/Sidebar"; 
import ProfileActivity from "../components/EmployerDashboard/ProfileActivity"; 
import { useAuth } from "../context/AuthContext";
import VacancyStats from "../components/EmployerDashboard/VacancyStats";

// NEW IMPORTS
import UpcomingEvents from "../components/EmployerDashboard/UpcomingEvents";
import LatestActivity from "../components/EmployerDashboard/LatestActivity";
import RecruitmentStats from "../components/EmployerDashboard/RecruitmentStats"; // <-- Import added

const DashboardPage = () => {
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
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pr-0">
            {/* Employer-specific Dashboard Content */}
            {isEmployer ? (
              <>
                {/* Applicant Overview Cards */}
                <ProfileActivity />

                {/* Vacancy Stats + Events */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <VacancyStats />
                  </div>
                  <div className="lg:col-span-1">
                    <UpcomingEvents />
                  </div>
                </div>

                {/* Recruitment Stats + Latest Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <RecruitmentStats />   {/* Left side */}
                  </div>
                  <div>
                    <LatestActivity />     {/* Right side */}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-600">
                Welcome to your Dashboard! Content tailored for your role will appear here.
              </div>
            )}
          </main> 
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
