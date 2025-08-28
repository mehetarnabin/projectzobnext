import React from "react";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";

const ProfileCompletion = () => {
  const { profileData, loading, error } = useProfile();
  const { user } = useAuth();

  // Function to calculate profile completion percentage
  const calculateProfileCompletion = (data, authUser) => {
    if (!data || !authUser) return 0; // Ensure both profileData and AuthContext user are available

    let completion = 0;

    // --- 1. Basic Info (12% total: Email 4%, Phone 4%, Address 4%) ---
    // Email is usually guaranteed from registration, but we can check if it's there
    if (data.basicInfo?.email) completion += 4;
    if (data.basicInfo?.phone) completion += 4;
    if (data.basicInfo?.address) completion += 4;

    // --- 2. About Me (12%) ---
    if (data.about && data.about !== 'Write something about yourself here...') {
      completion += 12;
    }

    // --- 3. Education (12%) ---
    if (data.education && data.education.length > 0) {
      completion += 12;
    }

    // --- 4. Work Experience (12%) ---
    if (data.work_experience && data.work_experience.length > 0) {
      completion += 12;
    }

    // --- 5. Memberships (12%) ---
    if (data.memberships && data.memberships.length > 0) {
      completion += 12;
    }

    // --- 6. Certifications (12%) ---
    if (data.certifications && data.certifications.length > 0) {
      completion += 12;
    }

    // --- 7. Licenses (12%) ---
    if (data.licenses && data.licenses.length > 0) {
      completion += 12;
    }

    // --- 8. Social Links (12% if at least one is filled) ---
    if (data.linkedin || data.github || data.facebook || data.instagram || data.twitter) {
      completion += 12;
    }

    // --- 9. Profile Header (Remaining 4%) ---
    let headerCompletedPoints = 0;
    let headerTotalPoints = 4;

    // Use authUser.role for consistency and immediate availability
    const userRole = authUser.role;

    // Designation (Position)
    if (data.designation) headerCompletedPoints += 1;
    // Company (if not jobseeker, use authUser.role for the check)
    if (userRole !== 'jobseeker' && data.company) headerCompletedPoints += 1;
    if (userRole === 'jobseeker') headerTotalPoints -= 1; // Adjust total points if company is not applicable

    // Logo/Avatar (if not default)
    if (data.logoUrl && !data.logoUrl.includes('default_profile.jpg')) headerCompletedPoints += 1;
    // Banner (if not default)
    if (data.bannerUrl && !data.bannerUrl.includes('default_banner.png')) headerCompletedPoints += 1;

    if (headerTotalPoints > 0) {
      completion += (headerCompletedPoints / headerTotalPoints) * 4;
    }

    return Math.round(Math.min(completion, 100));
  };

  if (loading || !user) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-sm">
        Loading completion...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-red-600 text-sm">
        Error calculating completion.
      </div>
    );
  }

  const completionPercentage = calculateProfileCompletion(profileData, user);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">My Profile</h3>

      {/* Percentage */}
      <div className="mb-1">
        <span className="text-xs font-bold text-gray-600">
          {completionPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
        <div
          className="bg-[#003893] h-2.5 rounded-full"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {/* Completion Text */}
      <p className="text-xs text-gray-400">
        Profile Complete
      </p>
    </div>
  );
};

export default ProfileCompletion;