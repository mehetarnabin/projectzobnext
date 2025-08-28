// src/components/ApplyJob/ReviewSubmitStep.jsx
import React from 'react';
import { useJobApplication } from '../../context/JobApplicationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaBriefcase, FaGraduationCap, FaCertificate, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const ReviewSubmitStep = () => {
    const {
        applicationData,
        jobDetails,
        submitApplication,
        setCurrentStep,
        loading: contextLoading,
    } = useJobApplication();

    const navigate = useNavigate();

    // Corrected destructuring: use 'certifications' (plural)
    const { personalDetails, resume, coverLetter, experience, education, certifications, hasCertifications } = applicationData;

    const handleSubmit = async () => {
        if (contextLoading) {
            toast.info("Please wait, an operation is already in progress.");
            return;
        }
        if (window.confirm("Are you sure you want to submit your application? You cannot make changes after submission.")) {
            const success = await submitApplication();
            if (success) {
                navigate('/jobseeker/dashboard');
            }
        }
    };

    const renderAttachment = (type, file, text) => {
        if (type === 'upload' && file) {
            return (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaCheckCircle className="text-green-500" /> {file.name}
                </div>
            );
        } else if (type === 'write' && text) {
            return (
                <div className="text-sm text-gray-700 whitespace-pre-line border p-2 rounded-md bg-gray-50">
                    {text}
                </div>
            );
        } else if (type === 'none') {
            return <p className="text-sm text-gray-500">Not provided.</p>;
        }
        return <p className="text-sm text-gray-500">No file uploaded or text provided.</p>;
    };

    if (contextLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <p className="text-gray-600">Loading application data for review...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[#003893] mb-6 text-center">Review Your Application</h2>
            <p className="text-center text-gray-600 mb-8">Please review all your details carefully before submitting. You can go back to any step to make changes.</p>

            {/* Job Details Summary */}
            {jobDetails && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Applying for:</h3>
                    <p className="text-lg font-medium text-[#003893]">{jobDetails.title}</p>
                    <p className="text-md text-gray-700">{jobDetails.company}</p>
                    <p className="text-sm text-gray-500">{jobDetails.location}</p>
                </div>
            )}

            {/* Personal Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-500" /> Personal Details
                </h3>
                <button
                    onClick={() => setCurrentStep(1)}
                    className="absolute top-6 right-6 text-blue-600 hover:underline text-sm font-medium"
                >
                    Edit
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <p><strong>Full Name:</strong> {personalDetails.fullName}</p>
                    <p><strong>Email:</strong> {personalDetails.email}</p>
                    <p><strong>Phone:</strong> {personalDetails.phone}</p>
                    <p><strong>Address:</strong> {personalDetails.address}</p>
                </div>
                <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Resume:</h4>
                    {renderAttachment(resume.type, resume.uploadedFile, null)}
                </div>
                <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Cover Letter:</h4>
                    {renderAttachment(coverLetter.type, coverLetter.uploadedFile, coverLetter.writtenText)}
                </div>
            </div>

            {/* Work Experience Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaBriefcase className="text-blue-500" /> Work Experience
                </h3>
                <button
                    onClick={() => setCurrentStep(2)}
                    className="absolute top-6 right-6 text-blue-600 hover:underline text-sm font-medium"
                >
                    Edit
                </button>
                {experience.length === 0 ? (
                    <p className="text-gray-500">No work experience provided.</p>
                ) : (
                    <div className="space-y-4">
                        {experience.map((exp, index) => (
                            <div key={exp.id || index} className="border border-gray-100 rounded p-4 bg-gray-50">
                                <h4 className="font-semibold text-lg text-gray-900">{exp.job_title} at {exp.company}</h4>
                                <p className="text-sm text-gray-600">
                                    {exp.start_date} - {exp.current_job ? 'Present' : exp.end_date}
                                </p>
                                {exp.description && <p className="text-sm text-gray-700 mt-1">{exp.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Education & Certifications Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaGraduationCap className="text-blue-500" /> Education & Certifications
                </h3>
                <button
                    onClick={() => setCurrentStep(3)}
                    className="absolute top-6 right-6 text-blue-600 hover:underline text-sm font-medium"
                >
                    Edit
                </button>

                {/* Education Sub-section */}
                <h4 className="font-semibold text-gray-800 mb-2 mt-4">Education:</h4>
                {education.length === 0 ? (
                    <p className="text-gray-500 ml-4">No education details provided.</p>
                ) : (
                    <div className="space-y-4 ml-4">
                        {education.map((edu, index) => (
                            <div key={edu.id || index} className="border border-gray-100 rounded p-4 bg-gray-50">
                                <h5 className="font-semibold text-md text-gray-900">{edu.degree} at {edu.institution}</h5>
                                {edu.field_of_study && <p className="text-sm text-gray-700">Field: {edu.field_of_study}</p>}
                                <p className="text-sm text-gray-600">
                                    {edu.start_date} {edu.end_date && ` - ${edu.end_date}`}
                                    {edu.grade && ` (Grade: ${edu.grade})`}
                                    {edu.honors && ` (Honors)`}
                                </p>
                                {edu.highlights && <p className="text-sm text-gray-700 mt-1">{edu.highlights}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Certifications Sub-section */}
                <h4 className="font-semibold text-gray-800 mb-2 mt-6 flex items-center gap-2">
                    <FaCertificate className="text-blue-500" /> Certifications:
                </h4>
                {/* Corrected logic for displaying certifications */}
                {!hasCertifications ? ( // If user explicitly disabled certifications
                    <p className="text-gray-500 ml-4">User chose not to provide certifications.</p>
                ) : certifications.length === 0 ? ( // If certifications are enabled but no entries
                    <p className="text-gray-500 ml-4">No certifications provided.</p>
                ) : ( // If certifications are enabled and there are entries
                    <div className="space-y-4 ml-4">
                        {certifications.map((cert, index) => ( // <--- Corrected variable name here
                            <div key={cert.id || index} className="border border-gray-100 rounded p-4 bg-gray-50">
                                <h5 className="font-semibold text-md text-gray-900">{cert.title}</h5>
                                {cert.provider && <p className="text-sm text-gray-700">Provider: {cert.provider}</p>}
                                <p className="text-sm text-gray-600">
                                    {cert.year && `Completed: ${cert.year}`}
                                    {cert.expiry && `, Expires: ${cert.expiry}`}
                                </p>
                                {cert.credential_id && <p className="text-sm text-gray-600">ID: {cert.credential_id}</p>}
                                {cert.credential_url && (
                                    <p className="text-sm text-blue-600 hover:underline">
                                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">View Credential</a>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation and Submit Button */}
            <div className="flex justify-between mt-8 p-6 bg-white rounded-b-2xl border-t border-gray-200">
                <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition duration-200 flex items-center gap-2"
                >
                    Back
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center gap-2"
                    disabled={contextLoading}
                >
                    {contextLoading ? 'Submitting...' : <><FaPaperPlane className="mr-2" /> Submit Application</>}
                </button>
            </div>
        </div>
    );
};

export default ReviewSubmitStep;