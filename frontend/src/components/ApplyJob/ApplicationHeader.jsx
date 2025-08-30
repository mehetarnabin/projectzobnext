// src/components/ApplyJob/ApplicationHeader.jsx
import React from 'react';
import { useJobApplication } from '../../context/JobApplicationContext';

const ApplicationHeader = () => {
    const { jobDetails, currentStep, totalSteps, stepLabels, loading, error } = useJobApplication();

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600 rounded-t-2xl bg-white border-b border-gray-200">
                Loading job details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600 rounded-t-2xl bg-white border-b border-gray-200">
                Error loading job details: {error}
            </div>
        );
    }

    if (!jobDetails) {
        return (
            <div className="p-6 text-center text-gray-500 rounded-t-2xl bg-white border-b border-gray-200">
                Job details not available. Please go back and select a job.
            </div>
        );
    }

    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const currentStepLabel = stepLabels[currentStep] || `Step ${currentStep}`;

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-white rounded-t-2xl border-b border-gray-200">
            {/* Job Info Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                {jobDetails.logo && (
                    <img
                        src={jobDetails.logo} // This comes from backend's processed logo URL
                        alt={`${jobDetails.company} logo`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl shadow-md p-1 bg-white flex-shrink-0 text-xs"
                    />
                )}
                <div className="flex-grow">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#003893] mb-1">
                        {jobDetails.title}
                    </h1>
                    <p className="text-md text-gray-700">{jobDetails.company}</p> {/* Only display company name */}
                    <p className="text-sm text-gray-500">{jobDetails.location}</p>
                </div>
            </div>

            {/* Progress Bar Section */}
            <div className="mt-6">
                <h2 className="text-md font-semibold text-gray-700 mb-2">
                    Step {currentStep} of {totalSteps}: {currentStepLabel}
                </h2>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-[#003893] h-2.5 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationHeader;