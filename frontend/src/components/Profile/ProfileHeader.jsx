import React from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlinePencil } from "react-icons/hi2";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";

const ProfileHeader = () => {
  const { profileData, loading } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading || !profileData || !user) {
    return <div className="text-center py-4">Loading profile header...</div>; // Or a skeleton loader
  }

  // Determine display values based on role and available data
  const isJobseeker = user.role === 'jobseeker';

  // For jobseekers, name and designation come from profileData (and user fallback)
  // For employers, name and designation come from user (AuthContext)
  const displayName = isJobseeker ? (profileData.name || user.name || "N/A") : (user.name || "N/A");
  const displayDesignation = isJobseeker ? (profileData.designation || "Not specified") : (user.designation || "Not specified");

  // Company name is only displayed for non-jobseekers and comes from the company object in profileData
  const displayCompany = !isJobseeker && profileData.company ? profileData.company.name : "";

  // Banner and Logo URLs are user-specific for jobseekers
  const displayBannerUrl = profileData.bannerUrl || "/images/default_banner.png";
  const displayLogoUrl = profileData.logoUrl || "/images/default_profile.jpg";

  // Filter out social links that are empty
  const socialLinks = [
    { key: 'github', icon: <FaGithub />, url: profileData.github },
    { key: 'linkedin', icon: <FaLinkedin />, url: profileData.linkedin },
    { key: 'facebook', icon: <FaFacebook />, url: profileData.facebook },
    { key: 'instagram', icon: <FaInstagram />, url: profileData.instagram },
    { key: 'twitter', icon: <FaTwitter />, url: profileData.twitter },
  ].filter(link => link.url); // Only keep links that have a URL

  return (
    <section className="bg-gray-100 rounded-2xl">
      <div className="space-y-4 overflow-hidden bg-white border-2 border-gray-200 inset-shadow-md rounded-2xl relative">
        <div className="relative group">
          <img
            src={displayBannerUrl}
            alt="Banner"
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="absolute -bottom-12 left-6 w-26 h-26 bg-white rounded-full p-1 shadow-md">
            <img
              src={displayLogoUrl}
              alt="Logo"
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          {/* Edit button for jobseeker profile header */}
          {isJobseeker && (
            <button
              onClick={() => navigate("/profile/edit-profile-head")}
              className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-100"
              title="Edit"
            >
              <HiOutlinePencil />
            </button>
          )}
        </div>

        <div className="pt-14 px-6 pb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[#003893]">{displayName}</h2>
              <p className="text-md font-regular text-gray-700">{displayDesignation}</p>
              {/* Conditionally display company name only if it's an employer/staffing user */}
              {!isJobseeker && displayCompany && (
                <p className="text-md font-regular text-gray-700">{displayCompany}</p>
              )}
            </div>

            <div className="flex flex-1 gap-4 justify-end items-center">
              {/* Badges are user-specific for jobseekers */}
              {isJobseeker && profileData?.badges?.map((badge, i) => (
                <img key={i} src={badge} alt={`Badge ${i + 1}`} className="w-18 h-18" />
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-2xl text-[#003893]">
            {socialLinks.map(link => (
              <a key={link.key} href={link.url} target="_blank" rel="noreferrer">
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
