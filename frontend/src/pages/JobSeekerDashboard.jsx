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

  if (!user) {
    return <div className="text-center py-8">Loading user data...</div>;
  }

  return (
    <div className="outer-wrapper bg-gray-100 min-h-screen flex flex-col">
      {/* Top-left Hamburger Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <ProfileActivity />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-1">
                    <ProfileStrength />
                  </div>
                  <div className="lg:col-span-2">
                    <VacancyStats />
                  </div>
                </div>

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
  );
};

export default JobSeekerDashboard;
