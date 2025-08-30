import API_BASE_URL from "../config"; // Add this line
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext"; // Assuming AuthContext provides user and isAuthenticated

const EmployerProfileContext = createContext();

export const useEmployerProfile = () => {
  return useContext(EmployerProfileContext);
};

export const EmployerProfileProvider = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [employerProfileData, setEmployerProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]); // This will now typically be empty or used for other manager listings

  // const API_BASE_URL = "http://10.120.30.250:8000/api";

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchEmployerProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!isAuthenticated || !user || !token || !['employer', 'staffing'].includes(user.role)) {
      console.warn("User not authenticated, not an employer/staffing, or token missing. Clearing employer profile data.");
      setEmployerProfileData(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employer-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch employer profile");
      }

      const data = await response.json();
      setEmployerProfileData(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Error fetching employer profile: ${err.message}`);
      console.error("Error fetching employer profile:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, logout]);

  // The fetchManagers function is now largely irrelevant for the "manager" string field,
  // but keeping it in case it's used elsewhere for a list of users with 'Manager' designation.
  // For the company's single 'manager' field, it's not needed.
  const fetchManagers = useCallback(async () => {
    const token = getAuthToken();
    if (!isAuthenticated || !user || !token || !['employer', 'staffing'].includes(user.role)) {
      setManagers([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employer-profile/managers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch managers");
      }

      const data = await response.json();
      setManagers(data);
    } catch (err) {
      console.error("Error fetching managers:", err);
      toast.error(`Error fetching managers: ${err.message}`);
      setManagers([]);
    }
  }, [isAuthenticated, user]);


  useEffect(() => {
    fetchEmployerProfile();
    fetchManagers(); // Still call this if you intend to use the list of managers elsewhere
  }, [fetchEmployerProfile, fetchManagers]);

  const updateCompanyProfileHeader = async (updatedFields) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
      toast.error("Not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employer-profile/company-header`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update company header error response:", responseData);
        if (response.status === 422) {
          const errorMessages = Object.values(responseData.errors).flat().join("\n");
          toast.error(`Validation Error:\n${errorMessages}`);
        } else {
          throw new Error(responseData.message || "Failed to update company header");
        }
      }

      toast.success(responseData.message || "Company header updated successfully!");
      fetchEmployerProfile(); // Re-fetch all employer profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating company header: ${err.message}`);
      console.error("Error updating company header:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateEmployerUserProfile = async (updatedFields) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
      toast.error("Not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employer-profile/user-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Update employer user profile error response:", responseData);
        if (response.status === 422) {
          const errorMessages = Object.values(responseData.errors).flat().join("\n");
          toast.error(`Validation Error:\n${errorMessages}`);
        } else {
          throw new Error(responseData.message || "Failed to update employer user profile");
        }
      }

      toast.success(responseData.message || "Your profile details updated successfully!");
      fetchEmployerProfile(); // Re-fetch all employer profile data after successful update
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating your profile details: ${err.message}`);
      console.error("Error updating employer user profile:", err);
    } finally {
      setLoading(false);
    }
  };


  const value = {
    employerProfileData,
    loading,
    error,
    managers,
    fetchEmployerProfile,
    updateCompanyProfileHeader,
    updateEmployerUserProfile,
  };

  return (
    <EmployerProfileContext.Provider value={value}>
      {children}
    </EmployerProfileContext.Provider>
  );
};