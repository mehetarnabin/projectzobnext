import React from "react";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";

const ProfileCard = () => {
  const { profileData, loading, error } = useProfile(); // Get profile data, loading, and error states
  const { user } = useAuth();

  // Function to calculate profile completion percentage
  const calculateProfileCompletion = (data) => {
    if (!data) return 0;

    let completion = 0;

    // --- Basic Information ---
    if (data.designation) completedFields += 1;
    if (data.company) completedFields += 1;

    // Address & Country (from basicInfo)
    totalFields += 1; // Country
    if (data.basicInfo?.country && data.basicInfo.country !== 'AU') completedFields += 1; // Assuming AU is default, if changed, it's completed
    totalFields += 1; // Address
    if (data.basicInfo?.address) completedFields += 1;

    // Profile Images
    totalFields += 1; // Logo/Avatar
    if (data.logoUrl && !data.logoUrl.includes('default_profile.jpg')) completedFields += 1;
    totalFields += 1; // Banner
    if (data.bannerUrl && !data.bannerUrl.includes('default_banner.png')) completedFields += 1;

    // --- About Me ---
    totalFields += 1; // About section
    if (data.about && data.about !== 'Write something about yourself here...') completedFields += 1;

    // --- Social Links ---
    totalFields += 1; // LinkedIn
    if (data.linkedin) completedFields += 1;
    totalFields += 1; // GitHub
    if (data.github) completedFields += 1;
    totalFields += 1; // Facebook
    if (data.facebook) completedFields += 1;
    totalFields += 1; // Instagram
    if (data.instagram) completedFields += 1;
    totalFields += 1; // Twitter
    if (data.twitter) completedFields += 1;

    // --- Dynamic Lists (at least one entry indicates completion) ---
    totalFields += 1; // Education
    if (data.education && data.education.length > 0) completedFields += 1;
    totalFields += 1; // Work Experience
    if (data.work_experience && data.work_experience.length > 0) completedFields += 1;
    totalFields += 1; // Memberships
    if (data.memberships && data.memberships.length > 0) completedFields += 1;
    totalFields += 1; // Certifications
    if (data.certifications && data.certifications.length > 0) completedFields += 1;
    totalFields += 1; // Licenses
    if (data.licenses && data.licenses.length > 0) completedFields += 1;

    // Calculate percentage
    if (totalFields === 0) return 0; // Avoid division by zero
    const percentage = (completedFields / totalFields) * 100;
    return Math.round(percentage); // Round to nearest whole number
    return 0;
  };

 // Determine display values, providing fallbacks for null/empty
  // Prioritize AuthContext's user.name if profileData is not yet loaded, then profileData.name
  const userName = user?.name || profileData.name || "N/A";
  const userPosition = profileData.designation || "Not specified";
  // Use user.role from AuthContext for immediate check
  const userCompany = profileData.company || (user?.role === 'jobseeker' ? '' : "Not specified");
  const userAddress = profileData.basicInfo?.address || "Not specified";

  // Prioritize profileData.logoUrl, then user.avatar from AuthContext, then default
  const userAvatar =
    (profileData.logoUrl && !profileData.logoUrl.includes('default_profile.jpg'))
      ? profileData.logoUrl
      : (user?.avatar || "images/default_profile.jpg"); // user.avatar might come from login response

  // Use profileData.bannerUrl, as AuthContext user object typically doesn't contain banner info
  const userBanner = profileData.bannerUrl || "images/default_banner.png";

  // Render loading or error states (still based on profileLoading)
  if (loading) {
    return (
      <div className="relative bg-white rounded-lg shadow overflow-hidden p-4 text-center">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-white rounded-lg shadow overflow-hidden p-4 text-center text-red-600">
        Error loading profile: {error}
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow overflow-hidden">
      {/* Background Image (top 20% of card) */}
      <div
        className="h-16 bg-blue-500 relative"
        style={{ backgroundImage: `url('${userBanner}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Circular Profile Image */}
        <div className="absolute -bottom-8 left-4 transform">
          <div className="h-16 w-16 rounded-full border-2 border-white bg-white overflow-hidden shadow-md">
            <img
              src={userAvatar}
              alt={userName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="pt-10 pb-4 px-4">
        <h3 className="font-semibold text-lg text-gray-800">{userName}</h3>
        <p className="text-sm text-gray-600">
          {userPosition}
          {userCompany && `, ${userCompany}`} {/* Conditionally add company */}
        </p>
        <p className="text-xs text-gray-500 mt-1">{userAddress}</p>

        {/* Profile Completion Bar */}
        {/* <div className="mt-4">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>Profile Completion</span>
            <span className="font-semibold">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#003893] h-2 rounded-full"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ProfileCard;