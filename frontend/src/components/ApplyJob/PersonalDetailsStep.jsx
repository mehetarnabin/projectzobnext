// src/components/ApplyJob/PersonalDetailsStep.jsx
import React, { useState, useEffect } from 'react';
import { useJobApplication } from '../../context/JobApplicationContext';
import { FaUpload, FaFileAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import classNames from 'classnames';

const PersonalDetailsStep = () => {
    const {
        applicationData,
        updateApplicationData,
        goToNextStep, // Use this from context
        currentStep,
        totalSteps,
        jobDetails, // Not directly used in this component's logic, but kept for consistency
    } = useJobApplication();

    const [personalInfo, setPersonalInfo] = useState(applicationData.personalDetails);
    const [resumeOption, setResumeOption] = useState(applicationData.resume.type);
    const [coverLetterOption, setCoverLetterOption] = useState(applicationData.coverLetter.type);
    const [uploadedResumeFile, setUploadedResumeFile] = useState(applicationData.resume.uploadedFile);
    const [uploadedCoverLetterFile, setUploadedCoverLetterFile] = useState(applicationData.coverLetter.uploadedFile);
    const [writtenCoverLetter, setWrittenCoverLetter] = useState(applicationData.coverLetter.writtenText);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setPersonalInfo(applicationData.personalDetails);
        setResumeOption(applicationData.resume.type);
        setCoverLetterOption(applicationData.coverLetter.type);
        setUploadedResumeFile(applicationData.resume.uploadedFile);
        setUploadedCoverLetterFile(applicationData.coverLetter.uploadedFile);
        setWrittenCoverLetter(applicationData.coverLetter.writtenText);
    }, [applicationData, currentStep]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleResumeFileChange = (e) => {
        setUploadedResumeFile(e.target.files[0]);
    };

    const handleCoverLetterFileChange = (e) => {
        setUploadedCoverLetterFile(e.target.files[0]);
    };

    const handleValidation = () => {
        let newErrors = {};
        let isValid = true;

        if (!personalInfo.fullName.trim()) {
            newErrors.fullName = 'Full Name is required.';
            isValid = false;
        }
        if (!personalInfo.email.trim()) {
            newErrors.email = 'Email Address is required.';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
            newErrors.email = 'Email Address is invalid.';
            isValid = false;
        }
        if (!personalInfo.phone.trim()) {
            newErrors.phone = 'Phone Number is required.';
            isValid = false;
        } else if (!/^\+?[0-9\s-()]{7,20}$/.test(personalInfo.phone)) {
            newErrors.phone = 'Phone Number is invalid.';
            isValid = false;
        }
        if (!personalInfo.address.trim()) {
            newErrors.address = 'Address is required.';
            isValid = false;
        }

        if (resumeOption === 'upload' && !uploadedResumeFile) {
            newErrors.resume = 'Please upload your resume.';
            isValid = false;
        }

        if (coverLetterOption === 'write' && !writtenCoverLetter.trim()) {
            newErrors.coverLetter = 'Please write your cover letter.';
            isValid = false;
        } else if (coverLetterOption === 'upload' && !uploadedCoverLetterFile) {
            newErrors.coverLetter = 'Please upload your cover letter.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = async () => { // Made async
        if (handleValidation()) {
            updateApplicationData('personalDetails', personalInfo);
            updateApplicationData('resume', { type: resumeOption, uploadedFile: uploadedResumeFile });
            updateApplicationData('coverLetter', { type: coverLetterOption, uploadedFile: uploadedCoverLetterFile, writtenText: writtenCoverLetter });
            await goToNextStep(); // Call the context function
        } else {
            toast.error('Please fill in all required fields and correct any errors.');
        }
    };

    const savedResumes = []; // Placeholder

    return (
        <div className="space-y-8">
            {/* Personal Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-[#003893] mb-4">Personal Details</h2>
                <p className="text-sm text-gray-600 mb-6">We'll pre-fill these from your profile, but you can edit them.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={personalInfo.fullName}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#003893] focus:border-transparent transition duration-200 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Your Full Name"
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.fullName}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={personalInfo.email}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#003893] focus:border-transparent transition duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="your.email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={personalInfo.phone}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#003893] focus:border-transparent transition duration-200 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="+977 98XXXXXXXX"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.phone}</p>}
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={personalInfo.address}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#003893] focus:border-transparent transition duration-200 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Street, City, Country"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.address}</p>}
                    </div>
                </div>
            </div>

            {/* Resume Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-[#003893] mb-4">Resume</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="radio"
                            id="uploadResume"
                            name="resumeOption"
                            value="upload"
                            checked={resumeOption === 'upload'}
                            onChange={() => setResumeOption('upload')}
                            className="form-radio text-[#003893] h-4 w-4"
                        />
                        <label htmlFor="uploadResume" className="text-gray-700 font-medium">Upload New Resume</label>
                    </div>
                    {resumeOption === 'upload' && (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#003893] transition duration-200">
                            <input
                                type="file"
                                id="resumeUpload"
                                className="hidden"
                                onChange={handleResumeFileChange}
                                accept=".pdf,.doc,.docx"
                            />
                            <label
                                htmlFor="resumeUpload"
                                className="cursor-pointer text-[#003893] hover:text-[#002a7a] transition duration-200 flex flex-col items-center justify-center"
                            >
                                <FaUpload className="text-3xl mb-2" />
                                <span className="font-medium">Click to upload or drag and drop</span>
                                <span className="text-sm text-gray-500">PDF, DOC, DOCX (Max 5MB)</span>
                            </label>
                            {uploadedResumeFile && (
                                <p className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-2">
                                    <FaFileAlt /> {uploadedResumeFile.name} <FaCheckCircle className="text-green-500" />
                                </p>
                            )}
                            {errors.resume && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.resume}</p>}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <input
                            type="radio"
                            id="savedResume"
                            name="resumeOption"
                            value="saved"
                            checked={resumeOption === 'saved'}
                            onChange={() => setResumeOption('saved')}
                            disabled={savedResumes.length === 0}
                            className="form-radio text-[#003893] h-4 w-4"
                        />
                        <label
                            htmlFor="savedResume"
                            className={classNames("text-gray-700 font-medium", {
                                'text-gray-400 cursor-not-allowed': savedResumes.length === 0
                            })}
                        >
                            Choose from Saved Resumes {savedResumes.length === 0 && "(None Available)"}
                        </label>
                    </div>
                    {resumeOption === 'saved' && savedResumes.length > 0 && (
                        <div className="mt-2">
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003893] focus:border-transparent transition duration-200"
                            >
                                <option value="">Select a saved resume</option>
                                {savedResumes.map(res => (
                                    <option key={res.id} value={res.id}>{res.name}</option>
                                ))}
                            </select>
                            {errors.resume && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.resume}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Cover Letter Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-[#003893] mb-4">Cover Letter (Optional)</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="radio"
                            id="noCoverLetter"
                            name="coverLetterOption"
                            value="none"
                            checked={coverLetterOption === 'none'}
                            onChange={() => setCoverLetterOption('none')}
                            className="form-radio text-[#003893] h-4 w-4"
                        />
                        <label htmlFor="noCoverLetter" className="text-gray-700 font-medium">No Cover Letter</label>
                    </div>

                    <div className="flex items-center gap-4">
                        <input
                            type="radio"
                            id="uploadCoverLetter"
                            name="coverLetterOption"
                            value="upload"
                            checked={coverLetterOption === 'upload'}
                            onChange={() => setCoverLetterOption('upload')}
                            className="form-radio text-[#003893] h-4 w-4"
                        />
                        <label htmlFor="uploadCoverLetter" className="text-gray-700 font-medium">Upload Cover Letter</label>
                    </div>
                    {coverLetterOption === 'upload' && (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#003893] transition duration-200">
                            <input
                                type="file"
                                id="coverLetterUpload"
                                className="hidden"
                                onChange={handleCoverLetterFileChange}
                                accept=".pdf,.doc,.docx"
                            />
                            <label
                                htmlFor="coverLetterUpload"
                                className="cursor-pointer text-[#003893] hover:text-[#002a7a] transition duration-200 flex flex-col items-center justify-center"
                            >
                                <FaUpload className="text-3xl mb-2" />
                                <span className="font-medium">Click to upload or drag and drop</span>
                                <span className="text-sm text-gray-500">PDF, DOC, DOCX (Max 5MB)</span>
                            </label>
                            {uploadedCoverLetterFile && (
                                <p className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-2">
                                    <FaFileAlt /> {uploadedCoverLetterFile.name} <FaCheckCircle className="text-green-500" />
                                </p>
                            )}
                            {errors.coverLetter && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.coverLetter}</p>}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <input
                            type="radio"
                            id="writeCoverLetter"
                            name="coverLetterOption"
                            value="write"
                            checked={coverLetterOption === 'write'}
                            onChange={() => setCoverLetterOption('write')}
                            className="form-radio text-[#003893] h-4 w-4"
                        />
                        <label htmlFor="writeCoverLetter" className="text-gray-700 font-medium">Write Cover Letter</label>
                    </div>
                    {coverLetterOption === 'write' && (
                        <div>
                            <textarea
                                id="writtenCoverLetter"
                                rows="8"
                                value={writtenCoverLetter}
                                onChange={(e) => setWrittenCoverLetter(e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#003893] focus:border-transparent transition duration-200 ${errors.coverLetter ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Start typing your cover letter here..."
                            ></textarea>
                            {errors.coverLetter && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle />{errors.coverLetter}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-8 p-6 bg-white rounded-b-2xl border-t border-gray-200">
                <button
                    onClick={handleNext}
                    className="bg-[#003893] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#002a7a] transition duration-200 flex items-center gap-2"
                >
                    Next Step ({currentStep}/{totalSteps})
                </button>
            </div>
        </div>
    );
};

export default PersonalDetailsStep;