import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { JobApplicationProvider } from '../context/JobApplicationContext';
import { useJobApplication } from '../context/JobApplicationContext';
import ApplicationHeader from '../components/ApplyJob/ApplicationHeader';
import PersonalDetailsStep from '../components/ApplyJob/PersonalDetailsStep';
import ExperienceStep from '../components/ApplyJob/ExperienceStep';
import EducationCertificatesStep from '../components/ApplyJob/EducationCertificatesStep';
// import QuestionsStep from '../components/ApplyJob/QuestionsStep';
import ReviewSubmitStep from '../components/ApplyJob/ReviewSubmitStep';

const ApplyJobPageContent = () => {
    const { currentStep, totalSteps } = useJobApplication(); // Get currentStep from context

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border-2 border-gray-200">
                <ApplicationHeader /> {/* Job info and progress bar */}

                <div className="p-4 sm:p-6 md:p-8">
                    {/* Render different steps based on the current step in context */}
                    {currentStep === 1 && <PersonalDetailsStep />}
                    {currentStep === 2 && <ExperienceStep />}
                    {currentStep === 3 && <EducationCertificatesStep />}
                    {/* {currentStep === 3 && <QuestionsStep />} */}
                    {currentStep === 4 && <ReviewSubmitStep />}
                </div>
            </div>
        </div>
    );
};

const ApplyJobPage = () => {
    const { jobId } = useParams(); // Get jobId from the URL

    if (!jobId) {
        return <div className="text-center p-8 text-red-600">Error: No Job ID provided for application.</div>;
    }

    return (
        // Wrap the entire application process with the JobApplicationProvider
        <JobApplicationProvider jobId={jobId}>
            <ApplyJobPageContent /> {/* A wrapper component to access context */}
        </JobApplicationProvider>
    );
};

export default ApplyJobPage;