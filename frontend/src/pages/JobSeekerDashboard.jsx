import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import ProfileActivity from "../components/Dashboard/ProfileActivity";
import ProfileStrength from "../components/Dashboard/ProfileStrength";
import VacancyStats from "../components/Dashboard/VacancyStats";
import SkillsProficiency from "../components/Dashboard/SkillsProficiency";
import WorkingType from "../components/Dashboard/WorkingType";
import AppliedJobs from "../components/Dashboard/AppliedJobs";
import DocumentHubNew from "../components/Dashboard/DocumentHubNew";
import ShortlistedCandidate from "../components/Dashboard/ShortlistedCandidate";
import { useAuth } from "../context/AuthContext";

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Check if we're on the applied jobs page
  const isAppliedJobsPage = location.pathname.includes("/applied-jobs");

  if (!user) {
    // You might want to show a loading spinner or redirect to login
    return <div className="text-center py-8">Loading user data...</div>;
  }

  return (
    <div className="outer-wrapper bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-4 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pr-0">
            <Routes>
              <Route 
                path="/" 
                element={
                  <>
                    {/* Default Dashboard View */}
                    <ProfileActivity />

                    {/* Second Row - Profile Strength and Vacancy Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <div className="lg:col-span-1">
                        <ProfileStrength />
                      </div>
                      <div className="lg:col-span-2">
                        <VacancyStats />
                      </div>
                    </div>

                    {/* Third Row: Skills Proficiency (left) and Working Type (right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <SkillsProficiency />
                      <WorkingType />
                    </div>
                  </>
                } 
              />
              <Route path="/applied-jobs" element={<AppliedJobs />} />
              <Route path="/shortlisted-candidate" element={<ShortlistedCandidate />} />
              <Route path="/document-hub" element={<DocumentHubNew />} />
            </Routes>
          </main> 
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;