// src/components/ApplyJob/ExperienceStep.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useJobApplication } from '../../context/JobApplicationContext';
import { FaPlus, FaEdit, FaTrash, FaTimesCircle, FaSave, FaExclamationCircle, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import classNames from 'classnames';

const ExperienceStep = () => {
    const {
        applicationId,
        setCurrentStep, // We'll still use this for direct step jumps (e.g., from ReviewStep)
        fetchApplicationExperiences,
        saveApplicationExperiences,
        clearErrors,
        loading: contextLoading,
        goToNextStep, // Use this from context
        goToPreviousStep, // Use this from context
        applicationData,
    } = useJobApplication();

    const [experiences, setExperiences] = useState([]);
    const [currentExperience, setCurrentExperience] = useState({
        id: null, job_title: '', company: '', start_date: '', end_date: '', current_job: false, description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        clearErrors();
        // Load initial experiences from context's applicationData
        if (applicationData.experience && applicationData.experience.length > 0) {
            setExperiences(applicationData.experience.map(exp => ({
                id: exp.id || null, job_title: exp.job_title || '', company: exp.company || '', start_date: exp.start_date || '',
                end_date: exp.end_date || '', current_job: exp.current_job || false, description: exp.description || '',
            })));
            setIsEditing(false);
        } else {
            setExperiences([]);
            setIsEditing(true);
        }
        handleCancelEdit(); // Ensure form is reset on mount
    }, [applicationData.experience, clearErrors]); // Removed fetchApplicationExperiences from dependencies

    const loadExperiences = async (source) => {
        try {
            const data = await fetchApplicationExperiences(source);
            if (data && data.experiences) {
                const formattedExperiences = data.experiences.map(exp => ({
                    id: exp.id || null, job_title: exp.job_title || '', company: exp.company || '', start_date: exp.start_date || '',
                    end_date: exp.end_date || '', current_job: exp.current_job || false, description: exp.description || '',
                }));
                setExperiences(formattedExperiences);
                setIsEditing(false);
                toast.success(`Experiences loaded successfully from ${source === 'profile' ? 'your profile' : 'application'}.`);
            } else {
                setExperiences([]);
                setIsEditing(true);
                toast.info(`No experiences found in ${source === 'profile' ? 'your profile' : 'application'}.`);
            }
        } catch (error) {
            toast.error("Failed to load experiences. Please try again.");
            console.error("Failed to load experiences:", error);
            setExperiences([]);
            setIsEditing(true);
        }
        handleCancelEdit(); // Clear current form after loading
    };

    const handleLoadFromProfile = () => {
        loadExperiences('profile');
    };

    const validateForm = () => {
        const errors = {};
        if (!currentExperience.job_title.trim()) errors.job_title = 'Job Title is required.';
        if (!currentExperience.company.trim()) errors.company = 'Company is required.';
        if (!currentExperience.start_date.trim()) errors.start_date = 'Start Date is required.';

        if (!currentExperience.current_job && !currentExperience.end_date.trim()) {
            errors.end_date = 'End Date is required unless it is your current job.';
        }
        if (currentExperience.start_date && currentExperience.end_date && !currentExperience.current_job) {
            if (new Date(currentExperience.start_date) > new Date(currentExperience.end_date)) {
                errors.end_date = 'End Date cannot be before Start Date.';
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentExperience(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'current_job' && checked && { end_date: '' })
        }));
    };

    const handleAddExperience = () => {
        if (!validateForm()) return;

        setExperiences(prev => {
            const newId = `new-${Date.now()}-${Math.random()}`;
            return [...prev, { ...currentExperience, id: newId }];
        });
        handleCancelEdit();
        toast.success("Experience added to list. Click 'Save Experiences' to confirm.");
    };

    const handleEdit = (index) => {
        setIsEditing(true);
        setEditIndex(index);
        setCurrentExperience({ ...experiences[index] });
        setFormErrors({});
    };

    const handleUpdateExperience = () => {
        if (!validateForm()) return;

        setExperiences(prev =>
            prev.map((exp, idx) => (idx === editIndex ? { ...currentExperience, id: exp.id } : exp))
        );
        handleCancelEdit();
        toast.success("Experience updated. Click 'Save Experiences' to confirm.");
    };

    const handleDelete = (indexToDelete) => {
        if (window.confirm("Are you sure you want to delete this experience?")) {
            setExperiences(prev => prev.filter((_, idx) => idx !== indexToDelete));
            toast.info("Experience deleted from list. Click 'Save Experiences' to confirm.");
            if (editIndex === indexToDelete) {
                handleCancelEdit();
            }
        }
    };

    const handleCancelEdit = () => {
        setCurrentExperience({
            id: null, job_title: '', company: '', start_date: '', end_date: '', current_job: false, description: '',
        });
        setIsEditing(false);
        setEditIndex(null);
        setFormErrors({});
    };

    const handleSaveExperiences = async () => {
        if (isEditing) {
            toast.error("Please add or cancel the current experience entry before saving.");
            return;
        }
        if (experiences.length === 0) {
            toast.warn("Please add at least one work experience to save.");
            return;
        }

        const experiencesToSend = experiences.map(exp => {
            const { id, ...rest } = exp;
            return rest;
        });

        const success = await saveApplicationExperiences(experiencesToSend);
        if (success) {
            await loadExperiences('application'); // This will update local state with real IDs
            setIsEditing(false);
            setEditIndex(null);
            setFormErrors({});
        }
    };

    const handleNext = async () => {
        if (isEditing) {
            toast.error("Please save or cancel your current experience edits before proceeding.");
            return;
        }
        // No need to check experiences.length here, as it's not a hard requirement for the step itself
        // The backend will handle validation for submission.
        await goToNextStep(); // Call the context function
    };

    const handleBack = async () => { // Made async
        if (isEditing) {
            toast.warn("Please save or cancel your current experience edits before going back.");
            return;
        }
        await goToPreviousStep(); // Call the context function
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                <FaBriefcase className="inline-block mr-2 text-blue-500" /> Work Experience
            </h2>

            <div className="mb-4 flex gap-4">
                <button
                    onClick={handleLoadFromProfile}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                >
                    Load from Profile
                </button>
                <button
                    onClick={() => {
                        setIsEditing(true);
                        setEditIndex(null);
                        setCurrentExperience({
                            id: null, job_title: '', company: '', start_date: '', end_date: '', current_job: false, description: '',
                        });
                        setFormErrors({});
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition duration-200"
                >
                    Add New Manually
                </button>
            </div>

            {/* Experience Input Form */}
            {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
                    <div>
                        <label htmlFor="job_title" className="block text-gray-700 text-sm font-bold mb-2">
                            Job Title:
                        </label>
                        <input
                            type="text"
                            id="job_title"
                            name="job_title"
                            value={currentExperience.job_title || ''}
                            onChange={handleChange}
                            className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", {
                                'border-red-500': formErrors.job_title
                            })}
                            placeholder="e.g., Software Developer"
                        />
                        {formErrors.job_title && (
                            <p className="text-red-500 text-xs italic mt-1 flex items-center">
                                <FaExclamationCircle className="mr-1" /> {formErrors.job_title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="company" className="block text-gray-700 text-sm font-bold mb-2">
                            Company:
                        </label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={currentExperience.company || ''}
                            onChange={handleChange}
                            className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", {
                                'border-red-500': formErrors.company
                            })}
                            placeholder="e.g., Google"
                        />
                        {formErrors.company && (
                            <p className="text-red-500 text-xs italic mt-1 flex items-center">
                                <FaExclamationCircle className="mr-1" /> {formErrors.company}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">
                            Start Date:
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={currentExperience.start_date || ''}
                            onChange={handleChange}
                            className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", {
                                'border-red-500': formErrors.start_date
                            })}
                        />
                        {formErrors.start_date && (
                            <p className="text-red-500 text-xs italic mt-1 flex items-center">
                                <FaExclamationCircle className="mr-1" /> {formErrors.start_date}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="end_date" className="block text-gray-700 text-sm font-bold mb-2">
                            End Date:
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={currentExperience.end_date || ''}
                            onChange={handleChange}
                            disabled={currentExperience.current_job}
                            className={classNames("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", {
                                'border-red-500': formErrors.end_date
                            })}
                        />
                        {formErrors.end_date && (
                            <p className="text-red-500 text-xs italic mt-1 flex items-center">
                                <FaExclamationCircle className="mr-1" /> {formErrors.end_date}
                            </p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="current_job" className="inline-flex items-center">
                            <input
                                type="checkbox"
                                id="current_job"
                                name="current_job"
                                checked={currentExperience.current_job}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700 text-sm font-bold">Currently working here</span>
                        </label>
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                            Description:
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={currentExperience.description || ''}
                            onChange={handleChange}
                            rows="4"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                            placeholder="Describe your responsibilities and achievements."
                        ></textarea>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                        {isEditing && editIndex !== null ? (
                            <>
                                <button onClick={handleUpdateExperience} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 flex items-center">
                                    <FaSave className="mr-2" /> Update Experience
                                </button>
                                <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 flex items-center">
                                    <FaTimesCircle className="mr-2" /> Cancel
                                </button>
                            </>
                        ) : (
                            <button onClick={handleAddExperience} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                                <FaPlus className="mr-2" /> Add Experience
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Display Experiences */}
            {experiences.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Added Experiences</h3>
                    <div className="space-y-4">
                        {experiences.map((exp, index) => (
                            <div key={exp.id || `temp-${index}`} className="border p-4 rounded-md bg-white shadow-sm flex justify-between items-center">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{exp.job_title} at {exp.company}</h4>
                                    <p className="text-sm text-gray-600">
                                        <FaCalendarAlt className="inline-block mr-1" />
                                        {exp.start_date} - {exp.current_job ? 'Present' : exp.end_date}
                                    </p>
                                    {exp.description && (
                                        <p className="text-gray-700 text-sm mt-1">{exp.description}</p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(index)} className="text-blue-500 hover:text-blue-700" title="Edit">
                                        <FaEdit className="text-lg" />
                                    </button>
                                    <button onClick={() => handleDelete(index)} className="text-red-500 hover:text-red-700" title="Delete">
                                        <FaTrash className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save All Experiences Button */}
            {experiences.length > 0 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={handleSaveExperiences}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md flex items-center justify-center mx-auto"
                    >
                        <FaSave className="mr-2" /> Save All Experiences
                    </button>
                </div>
            )}


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
                    Next
                </button>
            </div>
        </div>
    );
};

export default ExperienceStep;