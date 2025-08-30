// src/components/Profile/EditExperienceList.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { GoPlusCircle } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import './datepicker-custom.css';

const knownCompanies = [
  { name: "Arup Group", domain: "arup.com" },
  { name: "SMEC Australia", domain: "smec.com" },
  { name: "Hobsons Bay City Council", domain: "hobsonsbay.vic.gov.au" },
  { name: "AECOM", domain: "aecom.com" },
  { name: "GHD", domain: "ghd.com" },
  { name: "Jacobs", domain: "jacobs.com" },
  { name: "WSP", domain: "wsp.com" },
];

const EditExperienceList = () => {
  const { profileData, updateWorkExperience, loading } = useProfile();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const [editList, setEditList] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const navigate = useNavigate();

  // Initialize editList when profileData.work_experience becomes available and user is authenticated
  useEffect(() => {
    if (isAuthenticated && profileData.work_experience !== undefined) {
      // profileData.work_experience should already contain Date objects from ProfileContext
      // or you'd convert them here if they're strings from the backend.
      // Assuming ProfileContext provides Date objects:
      setEditList(Array.isArray(profileData.work_experience) ? profileData.work_experience : []);
      setFormErrors(Array.isArray(profileData.work_experience) ? profileData.work_experience.map(() => ({})) : []);
    } else if (!isAuthenticated) {
      // Clear editList if the user becomes unauthenticated
      setEditList([]);
      setFormErrors([]);
    }
  }, [profileData.work_experience, isAuthenticated]); // Add isAuthenticated to dependencies

  const handleSave = async () => {
    const errors = editList.map((exp) => {
      const e = {};
      if (!exp.title?.trim()) e.title = "Job title is required.";
      if (!exp.company?.trim()) e.company = "Company is required.";

      // Check if startDate is a valid Date object
      if (!exp.startDate || !(exp.startDate instanceof Date) || isNaN(exp.startDate.getTime())) {
        e.startDate = "Start date is required.";
      }

      // If endDate is present, check if it's a valid Date object and after startDate
      if (exp.endDate) { // This means it's not null (for "Present")
        if (!(exp.endDate instanceof Date) || isNaN(exp.endDate.getTime())) {
          e.endDate = "End date is invalid.";
        } else if (exp.startDate && exp.endDate < exp.startDate) {
          e.endDate = "End date cannot be before start date.";
        }
      }
      return e;
    });

    const hasErrors = errors.some((e) => Object.keys(e).length > 0);
    if (hasErrors) {
      setFormErrors(errors);
      toast.error("Please fix the errors in your work experience entries.");
      return;
    }

    // Prepare data for backend: convert Date objects to YYYY-MM-DD strings
    const experienceToSend = editList.map(exp => ({
      ...exp,
      startDate: exp.startDate ? exp.startDate.toISOString().split('T')[0] : null, // YYYY-MM-DD
      endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : null,     // YYYY-MM-DD
    }));

    await updateWorkExperience(experienceToSend); // Call the async update function
    navigate("/profile");
  };

  const handleAdd = () => {
    setEditList([
      ...editList,
      { title: "", company: "", startDate: null, endDate: null, details: "", logo: "" },
    ]);
    setFormErrors([...formErrors, {}]); // Add a new empty error object for the new entry
  };

  const handleRemove = (index) => {
    const updatedList = [...editList];
    const updatedErrors = [...formErrors];
    updatedList.splice(index, 1);
    updatedErrors.splice(index, 1);
    setEditList(updatedList);
    setFormErrors(updatedErrors);
  };

  const updateField = (index, key, value) => {
    const updated = [...editList];
    updated[index][key] = value;

    if (key === "company") {
      const match = knownCompanies.find(
        (c) => c.name.toLowerCase() === value.toLowerCase()
      );
      if (match) {
        updated[index].logo = `https://logo.clearbit.com/${match.domain}`;
      } else {
        updated[index].logo = ""; // Clear logo if no match
      }
    }

    setEditList(updated);
    // Clear error for this field as user is typing/selecting
    const newFormErrors = [...formErrors];
    if (newFormErrors[index] && newFormErrors[index][key]) {
      delete newFormErrors[index][key];
      setFormErrors(newFormErrors);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(editList);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setEditList(reordered);
    // Reorder errors too
    const reorderedErrors = Array.from(formErrors);
    const [movedError] = reorderedErrors.splice(result.source.index, 1);
    reorderedErrors.splice(result.destination.index, 0, movedError);
    setFormErrors(reorderedErrors);
  };

  // Render nothing or redirect if not authenticated
  if (!isAuthenticated && !loading) {
    navigate("/login"); // Redirect to login page if not authenticated
    return null;
  }

  // Handle loading state while authenticated
  if (loading && isAuthenticated) {
    return <div className="text-center p-4">Loading work experience editor...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Work Experience</h3>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="experience">
          {(provided) => (
            <div className="space-y-6" ref={provided.innerRef} {...provided.droppableProps}>
              {editList.map((exp, index) => (
                <Draggable key={index} draggableId={`exp-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="relative border border-gray-200 rounded p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="grid md:grid-cols-2 gap-4 pb-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.title ? "border-red-500" : ""}`}
                            value={exp.title}
                            onChange={(e) => updateField(index, "title", e.target.value)}
                          />
                          {formErrors[index]?.title && (
                            <p className="text-red-500 text-xs">{formErrors[index].title}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.company ? "border-red-500" : ""}`}
                            value={exp.company}
                            onChange={(e) => updateField(index, "company", e.target.value)}
                            list={`company-list-${index}`}
                          />
                          <datalist id={`company-list-${index}`}>
                            {knownCompanies.map((c) => (
                              <option key={c.name} value={c.name} />
                            ))}
                          </datalist>
                          {formErrors[index]?.company && (
                            <p className="text-red-500 text-xs">{formErrors[index].company}</p>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <DatePicker
                              selected={exp.startDate}
                              onChange={(date) => updateField(index, "startDate", date)}
                              dateFormat="MMM yyyy" // Keep this format for display
                              showMonthYearPicker
                              placeholderText="Start Date"
                              className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.startDate ? "border-red-500" : ""}`}
                            />
                            {formErrors[index]?.startDate && (
                              <p className="text-red-500 text-xs">{formErrors[index].startDate}</p>
                            )}
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <DatePicker
                              selected={exp.endDate}
                              onChange={(date) => updateField(index, "endDate", date)}
                              dateFormat="MMM yyyy" // Keep this format for display
                              showMonthYearPicker
                              isClearable // Allows user to clear for "Present"
                              placeholderText="Present"
                              className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.endDate ? "border-red-500" : ""}`}
                            />
                            {formErrors[index]?.endDate && (
                              <p className="text-red-500 text-xs">{formErrors[index].endDate}</p>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Key responsibilities</label>
                          <textarea
                            rows="8"
                            className="border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full"
                            maxLength={500}
                            value={exp.details}
                            onChange={(e) => updateField(index, "details", e.target.value)}
                          />
                          <div className="text-xs text-gray-500 text-right">{exp.details.length}/500</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(index)}
                        className="absolute bottom-2 right-2 text-red-600 text-2xl rounded-full hover:text-white hover:bg-red-600"
                        title="Remove"
                      >
                        <IoIosCloseCircleOutline />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-end px-2">
        <button
          onClick={handleAdd}
          className="text-green-600 text-2xl mt-2 rounded-full hover:bg-green-600 hover:text-white"
          title="add more rows"
          disabled={loading}
        >
          <GoPlusCircle />
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="bg-white text-[#003893] px-4 py-2 border border-[#003893] rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-[#003893]"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="bg-white text-gray-700 px-4 py-2 border border-gray-500 rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-gray-500"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </section>
  );
};

export default EditExperienceList;