// src/components/ApplyJob/EducationCertificatesStep.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useJobApplication } from '../../context/JobApplicationContext';
import { FaPlus, FaEdit, FaTrash, FaTimesCircle, FaSave, FaExclamationCircle, FaGraduationCap, FaCertificate, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import classNames from 'classnames';

const EducationCertificatesStep = () => {
    const {
        applicationId,
        setCurrentStep,
        fetchApplicationEducation,
        saveApplicationEducation,
        fetchApplicationCertifications,
        saveApplicationCertifications,
        clearErrors,
        loading: contextLoading,
        applicationData,
        goToNextStep, // Use this from context
        goToPreviousStep, // Use this from context
    } = useJobApplication();

    const [educationEntries, setEducationEntries] = useState([]);
    const [currentEducation, setCurrentEducation] = useState({
        id: null, degree: '', institution: '', field_of_study: '', start_date: '', end_date: '', grade: '', honors: false, highlights: '',
    });
    const [isEditingEducation, setIsEditingEducation] = useState(false);
    const [editEducationIndex, setEditEducationIndex] = useState(null);
    const [educationFormErrors, setEducationFormErrors] = useState({});

    const [certificationsEnabled, setCertificationsEnabled] = useState(true);
    const [certificationEntries, setCertificationEntries] = useState([]);
    const [currentCertification, setCurrentCertification] = useState({
        id: null, title: '', provider: '', country: '', year: '', expiry: '', credential_id: '', credential_url: '',
    });
    const [isEditingCertification, setIsEditingCertification] = useState(false);
    const [editCertificationIndex, setEditCertificationIndex] = useState(null);
    const [certificationFormErrors, setCertificationFormErrors] = useState({});

    useEffect(() => {
        clearErrors();

        if (applicationData.education && applicationData.education.length > 0) {
            setEducationEntries(applicationData.education.map(edu => ({
                id: edu.id || null, degree: edu.degree || '', institution: edu.institution || '', field_of_study: edu.field_of_study || '',
                start_date: edu.start_date || '', end_date: edu.end_date || '', grade: edu.grade || '', honors: edu.honors || false, highlights: edu.highlights || '',
            })));
            setIsEditingEducation(false);
        } else {
            setEducationEntries([]);
            setIsEditingEducation(true);
        }

        if (applicationData.certifications && applicationData.certifications.length > 0) {
            setCertificationEntries(applicationData.certifications.map(cert => ({
                id: cert.id || null, title: cert.title || '', provider: cert.provider || '', country: cert.country || '',
                year: cert.year || '', expiry: cert.expiry || '', credential_id: cert.credential_id || '', credential_url: cert.credential_url || '',
            })));
            setCertificationsEnabled(true);
            setIsEditingCertification(false);
        } else {
            setCertificationEntries([]);
            setIsEditingCertification(false);
            setCertificationsEnabled(false);
        }

        handleCancelEducationEdit();
        handleCancelCertificationEdit();

    }, [applicationData.education, applicationData.certifications, clearErrors]);

    const loadEducationFromProfile = async () => {
        const data = await fetchApplicationEducation('profile');
        if (data && data.education && data.education.length > 0) {
            setEducationEntries(data.education.map(edu => ({
                id: edu.id || null, degree: edu.degree || '', institution: edu.institution || '', field_of_study: edu.field_of_study || '',
                start_date: edu.start_date || '', end_date: edu.end_date || '', grade: edu.grade || '', honors: edu.honors || false, highlights: edu.highlights || '',
            })));
            setIsEditingEducation(false);
            toast.success('Education loaded from your profile!');
        } else {
            setEducationEntries([]);
            setIsEditingEducation(true);
            toast.info('No education found in your profile. Please add manually.');
        }
        handleCancelEducationEdit();
    };

    const validateEducationForm = () => {
        const errors = {};
        if (!currentEducation.degree.trim()) errors.degree = 'Degree is required.';
        if (!currentEducation.institution.trim()) errors.institution = 'Institution is required.';
        if (currentEducation.start_date && currentEducation.end_date && new Date(currentEducation.start_date) > new Date(currentEducation.end_date)) {
            errors.end_date = 'End Date cannot be before Start Date.';
        }
        setEducationFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEducationChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentEducation(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAddEducation = () => {
        if (!validateEducationForm()) return;
        setEducationEntries(prev => [...prev, { ...currentEducation, id: `new-edu-${Date.now()}-${Math.random()}` }]);
        handleCancelEducationEdit();
        toast.success("Education added to list. Click 'Save' to confirm.");
    };

    const handleEditEducation = (index) => {
        setIsEditingEducation(true);
        setEditEducationIndex(index);
        setCurrentEducation({ ...educationEntries[index] });
        setEducationFormErrors({});
    };

    const handleUpdateEducation = () => {
        if (!validateEducationForm()) return;
        setEducationEntries(prev =>
            prev.map((edu, idx) => (idx === editEducationIndex ? { ...currentEducation, id: edu.id } : edu))
        );
        handleCancelEducationEdit();
        toast.success("Education updated. Click 'Save' to confirm.");
    };

    const handleDeleteEducation = (indexToDelete) => {
        if (window.confirm("Are you sure you want to delete this education entry?")) {
            setEducationEntries(prev => prev.filter((_, index) => index !== indexToDelete));
            toast.info("Education removed from list. Click 'Save' to confirm.");
            if (editEducationIndex === indexToDelete) {
                handleCancelEducationEdit();
            }
        }
    };

    const handleCancelEducationEdit = () => {
        setCurrentEducation({
            id: null, degree: '', institution: '', field_of_study: '', start_date: '', end_date: '', grade: '', honors: false, highlights: '',
        });
        setIsEditingEducation(false);
        setEditEducationIndex(null);
        setEducationFormErrors({});
    };

    const handleSaveEducation = async () => {
        if (isEditingEducation) {
            toast.error("Please add or cancel the current education entry before saving.");
            return;
        }
        const educationToSend = educationEntries.map(edu => {
            const { id, ...rest } = edu;
            return rest;
        });
        const success = await saveApplicationEducation(educationToSend);
        if (success) {
            await fetchApplicationEducation('application');
            toast.success('Education details saved successfully!');
        }
    };


    const loadCertificationsFromProfile = async () => {
        const data = await fetchApplicationCertifications('profile');
        if (data && data.certifications && data.certifications.length > 0) {
            setCertificationEntries(data.certifications.map(cert => ({
                id: cert.id || null, title: cert.title || '', provider: cert.provider || '', country: cert.country || '',
                year: cert.year || '', expiry: cert.expiry || '', credential_id: cert.credential_id || '', credential_url: cert.credential_url || '',
            })));
            setIsEditingCertification(false);
            setCertificationsEnabled(true);
            toast.success('Certifications loaded from your profile!');
        } else {
            setCertificationEntries([]);
            setIsEditingCertification(true);
            setCertificationsEnabled(true);
            toast.info('No certifications found in your profile. Please add manually.');
        }
        handleCancelCertificationEdit();
    };

    const validateCertificationForm = () => {
        const errors = {};
        if (!currentCertification.title.trim()) errors.title = 'Certification Title is required.';
        if (currentCertification.year && !/^\d{4}$/.test(currentCertification.year)) {
            errors.year = 'Year must be a 4-digit number.';
        }
        if (currentCertification.credential_url && !/^https?:\/\/\S+$/.test(currentCertification.credential_url)) {
            errors.credential_url = 'Invalid URL format.';
        }
        setCertificationFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCertificationChange = (e) => {
        const { name, value } = e.target;
        setCurrentCertification(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCertification = () => {
        if (!validateCertificationForm()) return;
        setCertificationEntries(prev => [...prev, { ...currentCertification, id: `new-cert-${Date.now()}-${Math.random()}` }]);
        handleCancelCertificationEdit();
        toast.success("Certification added to list. Click 'Save' to confirm.");
    };

    const handleEditCertification = (index) => {
        setIsEditingCertification(true);
        setEditCertificationIndex(index);
        setCurrentCertification({ ...certificationEntries[index] });
        setCertificationFormErrors({});
    };

    const handleUpdateCertification = () => {
        if (!validateCertificationForm()) return;
        setCertificationEntries(prev =>
            prev.map((cert, idx) => (idx === editCertificationIndex ? { ...currentCertification, id: cert.id } : cert))
        );
        handleCancelCertificationEdit();
        toast.success("Certification updated. Click 'Save' to confirm.");
    };

    const handleDeleteCertification = (indexToDelete) => {
        if (window.confirm("Are you sure you want to delete this certification?")) {
            setCertificationEntries(prev => prev.filter((_, index) => index !== indexToDelete));
            toast.info("Certification removed from list. Click 'Save' to confirm.");
            if (editCertificationIndex === indexToDelete) {
                handleCancelCertificationEdit();
            }
        }
    };

    const handleCancelCertificationEdit = () => {
        setCurrentCertification({
            id: null, title: '', provider: '', country: '', year: '', expiry: '', credential_id: '', credential_url: '',
        });
        setIsEditingCertification(false);
        setEditCertificationIndex(null);
        setCertificationFormErrors({});
    };

    const handleSaveCertifications = async () => {
        if (isEditingCertification) {
            toast.error("Please add or cancel the current certification entry before saving.");
            return;
        }
        const certificationsToSend = certificationsEnabled
            ? certificationEntries.map(cert => {
                const { id, ...rest } = cert;
                return rest;
            })
            : [];

        const success = await saveApplicationCertifications(certificationsToSend);
        if (success) {
            await fetchApplicationCertifications('application');
            toast.success('Certification details saved successfully!');
        }
    };


    const handleNext = async () => {
        if (isEditingEducation || isEditingCertification) {
            toast.error("Please save or cancel all current edits before proceeding.");
            return;
        }
        await goToNextStep(); // Call context function
    };

    const handleBack = async () => { // Made async
        if (isEditingEducation || isEditingCertification) {
            toast.warn("Please save or cancel all current edits before going back.");
            return;
        }
        await goToPreviousStep(); // Call context function
    };

    if (contextLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <p className="text-gray-600">Loading education and certification data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Education Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-[#003893] mb-4 flex items-center gap-2">
                    <FaGraduationCap /> Education
                </h2>
                <p className="text-sm text-gray-600 mb-6">Tell us about your academic background.</p>

                <div className="mb-4 flex gap-4">
                    <button
                        onClick={loadEducationFromProfile}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                    >
                        Load from Profile
                    </button>
                    <button
                        onClick={() => {
                            setIsEditingEducation(true);
                            setEditEducationIndex(null);
                            setCurrentEducation({
                                id: null, degree: '', institution: '', field_of_study: '', start_date: '', end_date: '', grade: '', honors: false, highlights: '',
                            });
                            setEducationFormErrors({});
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition duration-200"
                    >
                        Add New Manually
                    </button>
                </div>

                {/* Education Input Form */}
                {isEditingEducation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
                        <div>
                            <label htmlFor="degree" className="block text-gray-700 text-sm font-bold mb-2">Degree/Qualification</label>
                            <input type="text" id="degree" name="degree" value={currentEducation.degree || ''} onChange={handleEducationChange}
                                className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { 'border-red-500': educationFormErrors.degree })}
                                placeholder="e.g., Bachelor of Science" />
                            {educationFormErrors.degree && <p className="text-red-500 text-xs italic mt-1 flex items-center"><FaExclamationCircle className="mr-1" /> {educationFormErrors.degree}</p>}
                        </div>
                        <div>
                            <label htmlFor="institution" className="block text-gray-700 text-sm font-bold mb-2">Institution</label>
                            <input type="text" id="institution" name="institution" value={currentEducation.institution || ''} onChange={handleEducationChange}
                                className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { 'border-red-500': educationFormErrors.institution })}
                                placeholder="e.g., University of California, Berkeley" />
                            {educationFormErrors.institution && <p className="text-red-500 text-xs italic mt-1 flex items-center"><FaExclamationCircle className="mr-1" /> {educationFormErrors.institution}</p>}
                        </div>
                        <div>
                            <label htmlFor="field_of_study" className="block text-gray-700 text-sm font-bold mb-2">Field of Study (Optional)</label>
                            <input type="text" id="field_of_study" name="field_of_study" value={currentEducation.field_of_study || ''} onChange={handleEducationChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., Computer Science" />
                        </div>
                        <div>
                            <label htmlFor="grade" className="block text-gray-700 text-sm font-bold mb-2">Grade/GPA (Optional)</label>
                            <input type="text" id="grade" name="grade" value={currentEducation.grade || ''} onChange={handleEducationChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., 3.8/4.0 or 90%" />
                        </div>
                        <div>
                            <label htmlFor="start_date_edu" className="block text-gray-700 text-sm font-bold mb-2">Start Date (Optional)</label>
                            <input type="date" id="start_date_edu" name="start_date" value={currentEducation.start_date || ''} onChange={handleEducationChange}
                                className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { 'border-red-500': educationFormErrors.start_date })} />
                            {educationFormErrors.start_date && <p className="text-red-500 text-xs italic mt-1 flex items-center"><FaExclamationCircle className="mr-1" /> {educationFormErrors.start_date}</p>}
                        </div>
                        <div>
                            <label htmlFor="end_date_edu" className="block text-gray-700 text-sm font-bold mb-2">End Date (Optional)</label>
                            <input type="date" id="end_date_edu" name="end_date" value={currentEducation.end_date || ''} onChange={handleEducationChange}
                                className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { 'border-red-500': educationFormErrors.end_date })} />
                            {educationFormErrors.end_date && <p className="text-red-500 text-xs italic mt-1 flex items-center"><FaExclamationCircle className="mr-1" /> {educationFormErrors.end_date}</p>}
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="honors" className="inline-flex items-center">
                                <input type="checkbox" id="honors" name="honors" checked={currentEducation.honors} onChange={handleEducationChange}
                                    className="form-checkbox h-5 w-5 text-blue-600" />
                                <span className="ml-2 text-gray-700 text-sm font-bold">Graduated with Honors</span>
                            </label>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="highlights" className="block text-gray-700 text-sm font-bold mb-2">Highlights/Achievements (Optional)</label>
                            <textarea id="highlights" name="highlights" value={currentEducation.highlights || ''} onChange={handleEducationChange}
                                rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                                placeholder="e.g., Dean's List, relevant projects, thesis topic."></textarea>
                        </div>
                        <div className="col-span-2 flex justify-end gap-2">
                            {isEditingEducation && editEducationIndex !== null ? (
                                <>
                                    <button onClick={handleUpdateEducation} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 flex items-center">
                                        <FaSave className="mr-2" /> Update Education
                                    </button>
                                    <button onClick={handleCancelEducationEdit} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 flex items-center">
                                        <FaTimesCircle className="mr-2" /> Cancel
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleAddEducation} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                                    <FaPlus className="mr-2" /> Add Education
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Display Education Entries */}
                {educationEntries.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Added Education</h3>
                        <div className="space-y-4">
                            {educationEntries.map((edu, index) => (
                                <div key={edu.id || `edu-temp-${index}`} className="border p-4 rounded-md bg-white shadow-sm flex justify-between items-center">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{edu.degree} at {edu.institution}</h4>
                                        {edu.field_of_study && <p className="text-sm text-gray-700">Field: {edu.field_of_study}</p>}
                                        <p className="text-sm text-gray-600">
                                            <FaCalendarAlt className="inline-block mr-1" />
                                            {edu.start_date} {edu.end_date && ` - ${edu.end_date}`}
                                            {edu.grade && ` (Grade: ${edu.grade})`}
                                            {edu.honors && ` (Honors)`}
                                        </p>
                                        {edu.highlights && <p className="text-sm text-gray-700 mt-1">{edu.highlights}</p>}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleEditEducation(index)} className="text-blue-500 hover:text-blue-700" title="Edit">
                                            <FaEdit className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDeleteEducation(index)} className="text-red-500 hover:text-red-700" title="Delete">
                                            <FaTrash className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Education Button */}
                {educationEntries.length > 0 && (
                    <div className="mt-4 text-center">
                        <button onClick={handleSaveEducation} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md flex items-center justify-center mx-auto">
                            <FaSave className="mr-2" /> Save Education
                        </button>
                    </div>
                )}
            </div>

            {/* Certifications Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-[#003893] mb-4 flex items-center gap-2">
                    <FaCertificate /> Certifications
                </h2>
                <div className="mb-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            checked={certificationsEnabled}
                            onChange={(e) => {
                                setCertificationsEnabled(e.target.checked);
                                // No need to clear entries immediately, as saveCertifications will handle sending empty array
                                handleCancelCertificationEdit();
                                if (!e.target.checked) {
                                    toast.info("Certifications section disabled. Remember to save to clear existing entries.");
                                } else {
                                    toast.info("Certifications section enabled.");
                                }
                            }}
                        />
                        <span className="ml-2 text-gray-700 font-bold">I want to add Certifications</span>
                    </label>
                </div>

                {certificationsEnabled && (
                    <>
                        <p className="text-sm text-gray-600 mb-6">List any relevant training or certifications.</p>
                        <div className="mb-4 flex gap-4">
                            <button
                                onClick={loadCertificationsFromProfile}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                            >
                                Load from Profile
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingCertification(true);
                                    setEditCertificationIndex(null);
                                    setCurrentCertification({
                                        id: null, title: '', provider: '', country: '', year: '', expiry: '', credential_id: '', credential_url: '',
                                    });
                                    setCertificationFormErrors({});
                                }}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition duration-200"
                            >
                                Add New Manually
                            </button>
                        </div>

                        {/* Certifications Input Form */}
                        {isEditingCertification && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
                                <div>
                                    <label htmlFor="cert_title" className="block text-gray-700 text-sm font-bold mb-2">Certification Title</label>
                                    <input type="text" id="cert_title" name="title" value={currentCertification.title || ''} onChange={handleCertificationChange}
                                        className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { 'border-red-500': certificationFormErrors.title })}
                                        placeholder="e.g., AWS Certified Developer" />
                                    {certificationFormErrors.title && <p className="text-red-500 text-xs italic mt-1 flex items-center"><FaExclamationCircle className="mr-1" /> {certificationFormErrors.title}</p>}
                                </div>
                                <div>
                                    <label htmlFor="provider" className="block text-gray-700 text-sm font-bold mb-2">Issuing Body/Provider (Optional)</label>
                                    <input type="text" id="provider" name="provider" value={currentCertification.provider || ''} onChange={handleCertificationChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="e.g., Amazon Web Services" />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country (Optional)</label>
                                    <input type="text" id="country" name="country" value={currentCertification.country || ''} onChange={handleCertificationChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="e.g., USA" />
                                </div>
                                <div>
                                    <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Year Completed (Optional)</label>
                                    <input type="text" id="year" name="year" value={currentCertification.year || ''} onChange={handleCertificationChange}
                                        className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { 'border-red-500': certificationFormErrors.year })}
                                        placeholder="e.g., 2023" maxLength="4" />
                                    {certificationFormErrors.year && <p className="text-red-500 text-xs italic mt-1 flex items-center"><FaExclamationCircle className="mr-1" /> {certificationFormErrors.year}</p>}
                                </div>
                                <div>
                                    <label htmlFor="expiry" className="block text-gray-700 text-sm font-bold mb-2">Expiry Date (Optional)</label>
                                    <input type="text" id="expiry" name="expiry" value={currentCertification.expiry || ''} onChange={handleCertificationChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="e.g., 2025-12-31 or N/A" />
                                </div>
                                <div>
                                    <label htmlFor="credential_id" className="block text-gray-700 text-sm font-bold mb-2">Credential ID (Optional)</label>
                                    <input type="text" id="credential_id" name="credential_id" value={currentCertification.credential_id || ''} onChange={handleCertificationChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="e.g., ABC123XYZ" />
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="credential_url" className="block text-gray-700 text-sm font-bold mb-2">Credential URL (Optional)</label>
                                    <input type="url" id="credential_url" name="credential_url" value={currentCertification.credential_url || ''} onChange={handleCertificationChange}
                                        className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { 'border-red-500': certificationFormErrors.credential_url })}
                                        placeholder="e.g., https://verify.cert.com/ABC123XYZ" />
                                    {certificationFormErrors.credential_url && <p className="text-red-500 text-xs italic mt-1 flex items-center"><FaExclamationCircle className="mr-1" /> {certificationFormErrors.credential_url}</p>}
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    {isEditingCertification && editCertificationIndex !== null ? (
                                        <>
                                            <button onClick={handleUpdateCertification} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 flex items-center">
                                                <FaSave className="mr-2" /> Update Certification
                                            </button>
                                            <button onClick={handleCancelCertificationEdit} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 flex items-center">
                                                <FaTimesCircle className="mr-2" /> Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={handleAddCertification} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                                            <FaPlus className="mr-2" /> Add Certification
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Display Certification Entries */}
                        {certificationEntries.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Added Certifications</h3>
                                <div className="space-y-4">
                                    {certificationEntries.map((cert, index) => (
                                        <div key={cert.id || `cert-temp-${index}`} className="border p-4 rounded-md bg-white shadow-sm flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-md text-gray-900">{cert.title}</h4>
                                                {cert.provider && <p className="text-sm text-gray-700">Provider: {cert.provider}</p>}
                                                <p className="text-sm text-gray-600">
                                                    {cert.year && `Completed: ${cert.year}`}
                                                    {cert.expiry && `, Expiry: ${cert.expiry}`}
                                                </p>
                                                {cert.credential_id && <p className="text-sm text-gray-600">ID: {cert.credential_id}</p>}
                                                {cert.credential_url && (
                                                    <p className="text-sm text-blue-600 hover:underline">
                                                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">View Credential</a>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleEditCertification(index)} className="text-blue-500 hover:text-blue-700" title="Edit">
                                                    <FaEdit className="text-lg" />
                                                </button>
                                                <button onClick={() => handleDeleteCertification(index)} className="text-red-500 hover:text-red-700" title="Delete">
                                                    <FaTrash className="text-lg" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save Certifications Button */}
                        {certificationEntries.length > 0 && (
                            <div className="mt-4 text-center">
                                <button onClick={handleSaveCertifications} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md flex items-center justify-center mx-auto">
                                    <FaSave className="mr-2" /> Save Certifications
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 p-6 bg-white rounded-b-2xl border-t border-gray-200">
                <button
                    onClick={handleBack}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition duration-200 flex items-center gap-2"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="bg-[#003893] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#002a7a] transition duration-200 flex items-center gap-2"
                >
                    Next Step
                </button>
            </div>
        </div>
    );
};

export default EducationCertificatesStep;