// src/context/JobApplicationContext.jsx
import API_BASE_URL from "../config"; // Add this line
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import { toast } from 'react-toastify';

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const JobApplicationContext = createContext();

export const JobApplicationProvider = ({ children, jobId }) => {
    const { user, token } = useAuth();
    const { profileData, loading: profileLoading, error: profileError } = useProfile();

    const [currentStep, setCurrentStep] = useState(1);
    const [applicationId, setApplicationId] = useState(null);
    const [applicationData, setApplicationData] = useState({
        jobId: jobId,
        personalDetails: {
            fullName: '',
            email: '',
            phone: '',
            address: '',
        },
        resume: {
            type: 'upload',
            uploadedFile: null,
            savedResumeId: null,
        },
        coverLetter: {
            type: 'none',
            uploadedFile: null,
            writtenText: '',
        },
        experience: [],
        education: [],
        certifications: [],
        hasCertifications: true,
    });
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isInitiatingApplication, setIsInitiatingApplication] = useState(false); // New state to prevent double calls

    const totalSteps = 4;
    const stepLabels = {
        1: 'Personal Details',
        2: 'Experience',
        3: 'Education & Certifications',
        4: 'Review & Submit',
    };

    // Helper function to update specific parts of applicationData
    const updateApplicationData = (category, data) => {
        setApplicationData(prev => ({
            ...prev,
            [category]: data
        }));
    };

    // All fetch and save functions should be useCallback to prevent unnecessary re-renders of components using them
    // and to be stable dependencies for useEffects.

    // --- Function to fetch job details ---
    const fetchJobDetails = useCallback(async (jobIdToFetch, token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${jobIdToFetch}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setJobDetails(data);
        } catch (err) {
            console.error("Failed to load job details:", err);
            setError(err.message || 'Failed to load job details.');
            toast.error(`Failed to load job details: ${err.message}`);
        }
    }, []);

    // --- Function to fetch application-specific experience data ---
    const fetchApplicationExperiences = useCallback(async (source = 'application') => {
        if (!applicationId || !token) return { experiences: [] }; // Early exit if no applicationId

        // setLoading(true); // Don't set loading here to avoid flicker if called from context init
        setError(null);
        try {
            const url = `${API_BASE_URL}/applications/${applicationId}/experience?source=${source}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            updateApplicationData('experience', data.experiences);
            return data;
        } catch (err) {
            console.error(`Failed to load experiences from ${source}:`, err);
            setError(err.message || `Failed to load experiences from ${source}.`);
            toast.error(`Failed to load experiences: ${err.message}`);
            return { experiences: [] };
        }
    }, [applicationId, token]);


    // ... (saveApplicationExperiences - no changes needed, it's fine as is)
    const saveApplicationExperiences = useCallback(async (experiencesToSave) => {
        if (!applicationId || !token) {
            toast.error("Application not initiated. Cannot save experiences.");
            return false;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/experience`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ experiences: experiencesToSave }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 422 && responseData.errors) {
                    setFormErrors(responseData.errors);
                    const validationErrors = Object.values(responseData.errors).flat();
                    toast.error(`Validation failed: ${validationErrors.join(', ')}`);
                    setError(validationErrors.join(', '));
                    return false;
                }
                throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }

            updateApplicationData('experience', responseData.experiences);
            toast.success('Experience details saved successfully!');
            setFormErrors({});
            return true;
        } catch (err) {
            console.error("Failed to save experiences:", err);
            setError(err.message || 'Failed to save experiences.');
            toast.error(`Failed to save experiences: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, [applicationId, token]);


    // --- NEW: Function to fetch application-specific education data ---
    const fetchApplicationEducation = useCallback(async (source = 'application') => {
        if (!applicationId || !token) return { education: [] };

        // setLoading(true); // Don't set loading here
        setError(null);
        try {
            const url = `${API_BASE_URL}/applications/${applicationId}/education?source=${source}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            updateApplicationData('education', data.education);
            return data;
        } catch (err) {
            console.error(`Failed to load education from ${source}:`, err);
            setError(err.message || `Failed to load education from ${source}.`);
            toast.error(`Failed to load education: ${err.message}`);
            return { education: [] };
        }
    }, [applicationId, token]);

    // ... (saveApplicationEducation - no changes needed, it's fine as is)
    const saveApplicationEducation = useCallback(async (educationToSave) => {
        if (!applicationId || !token) {
            toast.error("Application not initiated. Cannot save education.");
            return false;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/education`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ education: educationToSave }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 422 && responseData.errors) {
                    setFormErrors(responseData.errors);
                    const validationErrors = Object.values(responseData.errors).flat();
                    toast.error(`Validation failed: ${validationErrors.join(', ')}`);
                    setError(validationErrors.join(', '));
                    return false;
                }
                throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }

            updateApplicationData('education', responseData.education);
            toast.success('Education details saved successfully!');
            setFormErrors({});
            return true;
        } catch (err) {
            console.error("Failed to save education:", err);
            setError(err.message || 'Failed to save education.');
            toast.error(`Failed to save education: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, [applicationId, token]);


    // --- NEW: Function to fetch application-specific certifications data ---
    const fetchApplicationCertifications = useCallback(async (source = 'application') => {
        if (!applicationId || !token) return { certifications: [] };

        setError(null);
        try {
            const url = `${API_BASE_URL}/applications/${applicationId}/certifications?source=${source}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            updateApplicationData('certifications', data.certifications);
            return data;
        } catch (err) {
            console.error(`Failed to load certifications from ${source}:`, err);
            setError(err.message || `Failed to load certifications from ${source}.`);
            toast.error(`Failed to load certifications: ${err.message}`);
            return { certifications: [] };
        }
    }, [applicationId, token]);

    // ... (saveApplicationCertifications)
    const saveApplicationCertifications = useCallback(async (certificationsToSave) => {
        if (!applicationId || !token) {
            toast.error("Application not initiated. Cannot save certifications.");
            return false;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/certifications`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ certifications: certificationsToSave }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 422 && responseData.errors) {
                    setFormErrors(responseData.errors);
                    const validationErrors = Object.values(responseData.errors).flat();
                    toast.error(`Validation failed: ${validationErrors.join(', ')}`);
                    setError(validationErrors.join(', '));
                    return false;
                }
                throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }

            updateApplicationData('certifications', responseData.certifications);
            toast.success('Certification details saved successfully!');
            setFormErrors({});
            return true;
        } catch (err) {
            console.error("Failed to save certifications:", err);
            setError(err.message || 'Failed to save certifications.');
            toast.error(`Failed to save certifications: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, [applicationId, token]);

    const submitApplication = useCallback(async () => {
        if (!applicationId || !token) {
            toast.error("Application not initiated. Cannot submit.");
            return false;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/submit`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }

            // Update application status in context (optional, but good for tracking)
            // This might not be needed if navigation happens immediately
            // updateApplicationData('status', responseData.status);
            toast.success(responseData.message || 'Application submitted successfully!');
            setFormErrors({}); // Clear any lingering form errors
            return true;
        } catch (err) {
            console.error("Failed to submit application:", err);
            setError(err.message || 'Failed to submit application.');
            toast.error(`Failed to submit application: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, [applicationId, token]);


    // --- Core function to initiate/retrieve the job application ---
    const startOrGetApplication = useCallback(async () => {
        if (isInitiatingApplication) { // Prevent multiple calls if already in progress
            return;
        }
        setIsInitiatingApplication(true); // Set flag to true
        setLoading(true);
        setError(null);
        try {
            console.log('Initiating/Retrieving application for Job ID:', jobId);
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Specifically handle 409 Conflict if already applied
                if (response.status === 409 && errorData.already_applied) {
                    setApplicationId(errorData.application_id);
                    // Ensure current_step is treated as string for mapping
                    const backendStep = String(errorData.current_step);
                    const newCurrentStep =
                        backendStep === 'personal_details' ? 1 :
                        backendStep.startsWith('experience') ? 2 :
                        backendStep.startsWith('education_certificates') ? 3 :
                        backendStep.startsWith('skills_details') ? 4 : // Assuming skills_details might be step 4 if you re-add it
                        backendStep.startsWith('attachments') ? 5 : // Assuming attachments might be step 5
                        backendStep.startsWith('review_submit') ? totalSteps :
                        1; // Default to 1 if unknown
                    setCurrentStep(newCurrentStep);
                    toast.info(errorData.message || "You have already applied for this job. Resuming your application.");
                    // Fetch job details and current step's data for existing application
                    await fetchJobDetails(jobId, token);
                    if (errorData.application_id) {
                        if (newCurrentStep === 2) {
                            await fetchApplicationExperiences('application');
                        } else if (newCurrentStep === 3) {
                            await fetchApplicationEducation('application');
                            await fetchApplicationCertifications('application');
                        }
                    }
                    return; // Exit successfully after handling existing application
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setApplicationId(data.application_id);
            // Map backend step names to frontend step numbers
            const backendStep = String(data.current_step); // Ensure it's a string
            const newCurrentStep =
                backendStep === 'personal_details' ? 1 :
                backendStep.startsWith('experience') ? 2 :
                backendStep.startsWith('education_certificates') ? 3 :
                backendStep.startsWith('skills_details') ? 4 :
                backendStep.startsWith('attachments') ? 5 :
                backendStep.startsWith('review_submit') ? totalSteps :
                1;
            setCurrentStep(newCurrentStep);

            await fetchJobDetails(jobId, token);

            // Fetch data for the current step immediately after setting applicationId and currentStep
            if (data.application_id) {
                if (newCurrentStep === 2) { // Experience Step
                    await fetchApplicationExperiences('application');
                } else if (newCurrentStep === 3) { // Education & Certifications Step
                    await fetchApplicationEducation('application');
                    await fetchApplicationCertifications('application');
                }
                // Add similar logic for other steps if you want to load initial data into context globally
            }


        } catch (err) {
            console.error("Failed to start/retrieve application:", err);
            setError(err.message || 'Failed to start/retrieve application.');
            toast.error(`Failed to start/retrieve application: ${err.message}`);
        } finally {
            setLoading(false);
            setIsInitiatingApplication(false); // Reset flag
        }
    }, [
        jobId, token, totalSteps, fetchJobDetails, isInitiatingApplication, // Add isInitiatingApplication here
        fetchApplicationExperiences, fetchApplicationEducation, fetchApplicationCertifications // Include all fetch dependencies
    ]);

    // --- Navigation Functions ---
    const goToNextStep = useCallback(async () => {
        if (!applicationId || !token) {
            toast.error("Application not initiated. Cannot proceed.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/next-step`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ requested_step_number: currentStep }), // NEW: Send current step number
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.current_step) {
                const backendStep = String(data.current_step); // Ensure it's a string
                const newCurrentStepNum =
                    backendStep === 'personal_details' ? 1 :
                    backendStep.startsWith('experience') ? 2 :
                    backendStep.startsWith('education_certificates') ? 3 :
                    backendStep.startsWith('review_submit') ? 4 :
                    backendStep.startsWith('submitted') ? 5 : // If 'submitted' is a step number
                    currentStep;
                setCurrentStep(newCurrentStepNum);
                toast.success(data.message || 'Moved to next step!');

                if (newCurrentStepNum === 2) {
                    await fetchApplicationExperiences('application');
                } else if (newCurrentStepNum === 3) {
                    await fetchApplicationEducation('application');
                    await fetchApplicationCertifications('application');
                }
            }
        } catch (err) {
            console.error("Failed to navigate to next step:", err);
            setError(err.message || 'Failed to move to next step.');
            toast.error(`Failed to move to next step: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [
        applicationId, token, currentStep, totalSteps,
        fetchApplicationExperiences, fetchApplicationEducation, fetchApplicationCertifications
    ]);

    const goToPreviousStep = useCallback(async () => {
        if (!applicationId || !token) {
            toast.error("Application not initiated. Cannot go back.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/back-step`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ requested_step_number: currentStep }), // NEW: Send current step number
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.current_step) {
                const backendStep = String(data.current_step); // Ensure it's a string
                const newCurrentStepNum =
                    backendStep === 'personal_details' ? 1 :
                    backendStep.startsWith('experience') ? 2 :
                    backendStep.startsWith('education_certificates') ? 3 :
                    backendStep.startsWith('review_submit') ? 4 :
                    currentStep;
                setCurrentStep(newCurrentStepNum);
                toast.success(data.message || 'Moved to previous step!');

                if (newCurrentStepNum === 2) {
                    await fetchApplicationExperiences('application');
                } else if (newCurrentStepNum === 3) {
                    await fetchApplicationEducation('application');
                    await fetchApplicationCertifications('application');
                }
            }
        } catch (err) {
            console.error("Failed to navigate to previous step:", err);
            setError(err.message || 'Failed to move to previous step.');
            toast.error(`Failed to move to previous step: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [
        applicationId, token, currentStep, totalSteps,
        fetchApplicationExperiences, fetchApplicationEducation, fetchApplicationCertifications
    ]);

    // Function to clear all global and form errors
    const clearErrors = useCallback(() => {
        setError(null);
        setFormErrors({});
    }, []);

    // --- Main Effect for Context Initialization ---
    useEffect(() => {
        // Only start the application process if jobId and token are available
        // and an application hasn't been initiated yet in this session, AND no initiation is currently in progress.
        if (jobId && token && !applicationId && !isInitiatingApplication) {
            startOrGetApplication();
        }
    }, [jobId, token, applicationId, isInitiatingApplication, startOrGetApplication]); // Added isInitiatingApplication to dependencies


    // Effect for pre-filling personal details from profile data
    useEffect(() => {
        if (currentStep === 1 && !profileLoading && !profileError && profileData && applicationData.personalDetails.fullName === '') {
            setApplicationData(prev => ({
                ...prev,
                personalDetails: {
                    fullName: profileData.name || user?.name || '',
                    email: profileData.email || user?.email || '',
                    phone: profileData.basicInfo?.phone || '',
                    address: profileData.basicInfo?.address || '',
                },
            }));
            console.log('Pre-filled personal details with profile data.');
        } else if (currentStep === 1 && profileError) {
            toast.warn("Could not pre-fill personal details from your profile. Please fill them manually if needed.");
        }
    }, [profileData, profileLoading, profileError, user, currentStep, applicationData.personalDetails.fullName]);


    const value = {
        currentStep,
        totalSteps,
        stepLabels,
        applicationId,
        applicationData,
        jobDetails,
        loading,
        error,
        formErrors,
        goToNextStep,
        goToPreviousStep,
        updateApplicationData,
        fetchApplicationExperiences,
        saveApplicationExperiences,
        fetchApplicationEducation,
        saveApplicationEducation,
        fetchApplicationCertifications,
        saveApplicationCertifications,
        submitApplication,
        clearErrors,
        setCurrentStep,
    };

    return (
        <JobApplicationContext.Provider value={value}>
            {children}
        </JobApplicationContext.Provider>
    );
};

export const useJobApplication = () => {
    const context = useContext(JobApplicationContext);
    if (context === undefined) {
        throw new Error('useJobApplication must be used within a JobApplicationProvider');
    }
    return context;
};
