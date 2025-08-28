import React from "react";
import { useProfile } from "../context/ProfileContext";
import ProfileHeader from "../components/Profile/ProfileHeader";
import BasicInfo from "../components/Profile/BasicInfo";
import AboutMe from "../components/Profile/AboutMe";
import EducationList from "../components/Profile/EducationList";
import ExperienceList from "../components/Profile/ExperienceList";
import MembershipList from "../components/Profile/MembershipList";
import CertificationList from "../components/Profile/CertificationList";
import LicenseList from "../components/Profile/LicenseList";

const JobseekerProfile = () => {
  const { profileData, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile data...</p> {/* Or a more elaborate loading spinner */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }

  // If profileData is still null/undefined after loading, it means there was an issue
  // or the data fetching mechanism didn't populate it. This is a fallback.
  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No profile data available. Please try again or create a profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-2">
        <ProfileHeader profileData={profileData} />
        <BasicInfo info={profileData.basicInfo} />
        <AboutMe about={profileData.about} />
        <EducationList />
        <ExperienceList />
        <MembershipList />
        <CertificationList />
        <LicenseList />
      </div>
    </div>
  );
};

export default JobseekerProfile;
