import React from "react";
import { useEmployerProfile } from "../context/EmployerProfileContext";
import EmployerProfileHeader from "../components/EmployerProfile/EmployerProfileHeader";
import EmployerUserProfile from "../components/EmployerProfile/EmployerUserProfile";
import EmployerDepartment from "../components/EmployerProfile/EmployerDepartment";

const EmployerProfilePage = () => {
  const { employerProfileData, loading, error } = useEmployerProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading employer profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p>Error loading employer profile: {error}</p>
      </div>
    );
  }

  if (!employerProfileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No employer profile data available. Please try again or ensure you are logged in as an employer.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-2">
        {/* Company Header */}
        <EmployerProfileHeader companyData={employerProfileData.company} />

        {/* User Profile and Department in a row */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Employer User Profile (60-70%) */}
          <div className="md:w-3/5"> {/* Approximately 60% */}
            <EmployerUserProfile userData={employerProfileData.user} />
          </div>
          {/* Employer Department (30-40%) */}
          <div className="md:w-2/5"> {/* Approximately 40% */}
            <EmployerDepartment userData={employerProfileData.user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfilePage;
