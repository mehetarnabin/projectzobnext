
import API_BASE_URL from "../config"; // Add this line
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext();

export const useProfile = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth(); // Get user and isAuthenticated from AuthContext
  const [profileData, setProfileData] = useState({
    name: "",
    designation: "",
    company: null, // Will be null for jobseekers, now explicitly set to null
    bannerUrl: "/images/default_banner.png", // Path in public folder for initial display
    logoUrl: "/images/default_profile.jpg", // Path in public folder for initial display
    badges: [],
    github: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    twitter: "",
    // Basic Info fields (nested as per Laravel API response)
    basicInfo: {
      email: "",
      phone: "",
      country: "AU",
      address: "",
      showEmail: true,
      showPhone: true,
      showAddress: true,
    },
    about: "",
    education: [],
    work_experience: [],
    memberships: [],
    certifications: [],
    licenses: [],
    role: "jobseeker", // Default role
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const API_BASE_URL = "http://10.120.30.250:8000/api"; // Replace with your Laravel API URL

  // Function to get JWT token from localStorage (still used for API calls)
  const getAuthToken = () => {
    return localStorage.getItem("token"); // Assuming you store your JWT in localStorage as 'token'
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    // Only attempt to fetch if authenticated and a user object exists
    if (!isAuthenticated || !user || !token) {
      console.warn("User not authenticated or user data missing. Clearing profile data.");
      // Reset profileData to initial state when not authenticated
      setProfileData({
        name: "", designation: "", company: null, bannerUrl: "/images/default_banner.png",
        logoUrl: "/images/default_profile.jpg", badges: [], github: "", linkedin: "",
        facebook: "", instagram: "", twitter: "", basicInfo: {
          email: "", phone: "", country: "AU", address: "",
          showEmail: true, showPhone: true, showAddress: true,
        },
        about: "", education: [], work_experience: [], memberships: [],
        certifications: [], licenses: [], role: "jobseeker",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
            toast.error("Session expired. Please log in again.");
            logout(); // Log out the user if the token is invalid/expired
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const data = await response.json(); // Access the entire response object directly

      // Ensure default values for missing data to prevent errors in components
      const processedData = {
        name: data.name || user.name || "", // Fallback to user.name from AuthContext
        designation: data.designation || "",
        company: data.company || null, // Ensure company is null for jobseekers or if not provided
        bannerUrl: data.bannerUrl || "/images/default_banner.png",
        logoUrl: data.logoUrl || "/images/default_profile.jpg",
        badges: Array.isArray(data.badges) ? data.badges : [],
        github: data.github || "",
        linkedin: data.linkedin || "",
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        twitter: data.twitter || "",
        // Basic Info fields
        basicInfo: {
            email: data.basicInfo?.email || "",
            phone: data.basicInfo?.phone || "",
            country: data.basicInfo?.country || "AU",
            address: data.basicInfo?.address || "",
            showEmail: typeof data.basicInfo?.showEmail === 'boolean' ? data.basicInfo.showEmail : true,
            showPhone: typeof data.basicInfo?.showPhone === 'boolean' ? data.basicInfo.showPhone : true,
            showAddress: typeof data.basicInfo?.showAddress === 'boolean' ? data.basicInfo.showAddress : true,
        },
        about: data.about || "",
        education: Array.isArray(data.education)
            ? data.education.map(edu => ({
                ...edu,
                startDate: typeof edu.startDate === 'number' ? new Date(edu.startDate, 0, 1) : null,
                endDate: typeof edu.endDate === 'number' ? new Date(edu.endDate, 0, 1) : null,
              }))
            : [],
        work_experience: Array.isArray(data.work_experience)
            ? data.work_experience.map(exp => ({
                ...exp,
                startDate: exp.startDate ? new Date(exp.startDate) : null,
                endDate: exp.endDate ? new Date(exp.endDate) : null,
              }))
            : [],
        memberships: Array.isArray(data.memberships) ? data.memberships : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        licenses: Array.isArray(data.licenses) ? data.licenses : [],
        role: data.role || user.role || "jobseeker", // Get role from backend or AuthContext
      };

      setProfileData(processedData);
    } catch (err) {
      setError(err.message);
      toast.error(`Error fetching profile: ${err.message}`);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, logout]); // Add isAuthenticated, user, and logout to dependency array

  // This useEffect will now trigger fetchProfile whenever isAuthenticated or user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfileHeader = async (updatedFields) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/header`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update profile header error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update profile header");
        }
      }

      toast.success(responseData.message || "Profile header updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating profile header: ${err.message}`);
      console.error("Error updating profile header:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBasicInfo = async (updatedFields) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/basic-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update basic info error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update basic info");
        }
      }

      toast.success(responseData.message || "Basic info updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating basic info: ${err.message}`);
      console.error("Error updating basic info:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAboutMe = async (updatedAboutText) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/about-me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ about: updatedAboutText }), // Send the about text in an object
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update about me error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update About Me");
        }
      }

      toast.success(responseData.message || "About Me updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating About Me: ${err.message}`);
      console.error("Error updating About Me:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = async (updatedEducationList) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      // educationList already contains year numbers from EditEducationList.jsx
      const response = await fetch(`${API_BASE_URL}/profile/education`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ education: updatedEducationList }), // Send the array as is
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update education error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update Education");
        }
      }

      toast.success(responseData.message || "Education updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating Education: ${err.message}`);
      console.error("Error updating Education:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkExperience = async (updatedExperienceList) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/work-experience`, { // NEW ENDPOINT
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ work_experience: updatedExperienceList }), // Key matches backend validation
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update work experience error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update Work Experience");
        }
      }

      toast.success(responseData.message || "Work experience updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating Work Experience: ${err.message}`);
      console.error("Error updating Work Experience:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberships = async (updatedMembershipsList) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/memberships`, { // NEW ENDPOINT
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ memberships: updatedMembershipsList }), // Key matches backend validation
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update memberships error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update Professional Memberships");
        }
      }

      toast.success(responseData.message || "Professional memberships updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating Professional Memberships: ${err.message}`);
      console.error("Error updating Professional Memberships:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateCertifications = async (updatedCertificationsList) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/certifications`, { // NEW ENDPOINT
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ certifications: updatedCertificationsList }), // Key matches backend validation
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update certifications error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update Training & Certifications");
        }
      }

      toast.success(responseData.message || "Training & Certifications updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating Training & Certifications: ${err.message}`);
      console.error("Error updating Training & Certifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateLicenses = async (updatedLicensesList) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
        toast.error("Not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/licenses`, { // NEW ENDPOINT
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ licenses: updatedLicensesList }), // Key matches backend validation
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update licenses error response:", responseData);
        if (response.status === 422) {
            const errorMessages = Object.values(responseData.errors).flat().join("\n");
            toast.error(`Validation Error:\n${errorMessages}`);
        } else {
            throw new Error(responseData.message || "Failed to update Licenses");
        }
      }

      toast.success(responseData.message || "Licenses updated successfully!");
      fetchProfile(); // Re-fetch all profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating Licenses: ${err.message}`);
      console.error("Error updating Licenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    profileData,
    loading,
    error,
    fetchProfile,
    updateProfileHeader,
    updateBasicInfo,
    updateAboutMe,
    updateEducation,
    updateWorkExperience,
    updateMemberships,
    updateCertifications,
    updateLicenses,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
