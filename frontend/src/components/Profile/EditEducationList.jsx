// src/components/Profile/EditEducationList.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { GoPlusCircle } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const institutionSuggestions = [
  { name: "University of Melbourne", domain: "unimelb.edu.au" },
  { name: "Monash University", domain: "monash.edu" },
  { name: "Harvard University", domain: "harvard.edu" },
  { name: "Stanford University", domain: "stanford.edu" },
  { name: "Central Queensland University", domain: "cqu.edu.au" },
  { name: "Melbourne High School", domain: "mhs.vic.edu.au" },
  { name: "Richmond Secondary College", domain: "richmondsc.vic.edu.au" },
];

const EditEducationList = () => {
  const { profileData, updateEducation, loading } = useProfile();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const [editList, setEditList] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const navigate = useNavigate();

  // Initialize editList from profileData when it becomes available and authenticated
  useEffect(() => {
    if (isAuthenticated && profileData.education !== undefined) { // Check for undefined to differentiate from null/empty array
      const initialEducation = Array.isArray(profileData.education)
        ? profileData.education.map((edu) => ({
            ...edu,
            // Convert year (number) back to a Date object for DatePicker
            startDate: edu.startDate ? new Date(edu.startDate, 0, 1) : null,
            endDate: edu.endDate ? new Date(edu.endDate, 0, 1) : null,
          }))
        : [];
      setEditList(initialEducation);
      setFormErrors(initialEducation.map(() => ({})));
    } else if (!isAuthenticated) {
      // Clear editList if the user becomes unauthenticated
      setEditList([]);
      setFormErrors([]);
    }
  }, [profileData.education, isAuthenticated]); // Add isAuthenticated to dependencies

  const handleSave = async () => {
    const errors = editList.map((edu) => {
      const e = {};
      if (!edu.degree?.trim()) e.degree = "Degree is required.";
      if (!edu.institution?.trim()) e.institution = "Institution is required.";

      // Check if start and end dates are selected and valid
      if (!edu.startDate || isNaN(edu.startDate.getTime())) e.startDate = "Start year is required.";
      if (!edu.endDate || isNaN(edu.endDate.getTime())) e.endDate = "End year is required.";
      else if (edu.startDate && edu.endDate && edu.startDate.getFullYear() > edu.endDate.getFullYear()) {
        e.endDate = "End year cannot be before start year.";
      }
      return e;
    });

    const hasErrors = errors.some((e) => Object.keys(e).length > 0);
    if (hasErrors) {
      setFormErrors(errors);
      toast.error("Please fix the errors in your education entries.");
      return;
    }

    // Convert Date objects back to just the year (number) for sending to backend
    const educationToSend = editList.map(edu => ({
      ...edu,
      startDate: edu.startDate ? edu.startDate.getFullYear() : null,
      endDate: edu.endDate ? edu.endDate.getFullYear() : null,
    }));

    await updateEducation(educationToSend);
    navigate("/profile");
  };

  const handleAdd = () => {
    setEditList([
      ...editList,
      { degree: "", institution: "", startDate: null, endDate: null, grade: "", highlights: "", logo: "", honors: false },
    ]);
    setFormErrors([...formErrors, {}]);
  };

  const handleRemove = (index) => {
    const updatedList = [...editList];
    const updatedErrors = [...formErrors];
    updatedList.splice(index, 1);
    updatedErrors.splice(index, 1);
    setEditList(updatedList);
    setFormErrors(updatedErrors);
  };

  const updateField = (index, field, value) => {
    const updated = [...editList];
    updated[index][field] = value;

    if (field === "institution") {
      const match = institutionSuggestions.find(
        (i) => i.name.toLowerCase() === value.toLowerCase()
      );
      if (match) {
        updated[index].logo = `https://logo.clearbit.com/${match.domain}`;
      } else {
        updated[index].logo = ""; // Clear logo if no match
      }
    }

    setEditList(updated);
    // Clear error for this field as user is typing
    const newFormErrors = [...formErrors];
    if (newFormErrors[index] && newFormErrors[index][field]) {
      delete newFormErrors[index][field];
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
    navigate("/login");
    return null;
  }

  if (loading && isAuthenticated) {
    return <div className="text-center p-4">Loading education editor...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Education</h3>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="education">
          {(provided) => (
            <div className="space-y-6" ref={provided.innerRef} {...provided.droppableProps}>
              {editList.map((edu, index) => (
                <Draggable key={index} draggableId={`edu-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="relative border border-gray-200 rounded p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.degree ? "border-red-500" : ""}`}
                            value={edu.degree}
                            onChange={(e) => updateField(index, "degree", e.target.value)} />
                          {formErrors[index]?.degree && <p className="text-red-500 text-xs mt-1">{formErrors[index].degree}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Grade / GPA</label>
                          <div className="flex gap-4">
                            <div className="flex flex-1 items-center gap-4">
                              <input
                                type="text"
                                className="border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full"
                                value={edu.grade}
                                onChange={(e) => updateField(index, "grade", e.target.value)} />
                            </div>
                            <div className="flex flex-1 items-center gap-4">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={edu.honors}
                                  onChange={(e) => updateField(index, "honors", e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#003893] transition-all duration-300"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                              </label>
                              <span className="text-xs text-gray-600">Completed with Honour</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.institution ? "border-red-500" : ""}`}
                            value={edu.institution}
                            onChange={(e) => updateField(index, "institution", e.target.value)}
                            list={`institution-list-${index}`} />
                          <datalist id={`institution-list-${index}`}>
                            {institutionSuggestions.map((inst) => (
                              <option key={inst.name} value={inst.name} />
                            ))}
                          </datalist>
                          {formErrors[index]?.institution && <p className="text-red-500 text-xs mt-1">{formErrors[index].institution}</p>}
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <DatePicker
                              selected={edu.startDate}
                              onChange={(date) => updateField(index, "startDate", date)}
                              dateFormat="yyyy"
                              showYearPicker
                              placeholderText="Start Year"
                              className={`w-full px-3 py-2 border border-gray-300 rounded-full inset-shadow-lg ${formErrors[index]?.startDate ? "border-red-500" : ""}`} />
                            {formErrors[index]?.startDate && <p className="text-red-500 text-xs mt-1">{formErrors[index].startDate}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <DatePicker
                              selected={edu.endDate}
                              onChange={(date) => updateField(index, "endDate", date)}
                              dateFormat="yyyy"
                              showYearPicker
                              placeholderText="End Year"
                              className={`w-full px-3 py-2 border border-gray-300 rounded-full inset-shadow-lg ${formErrors[index]?.endDate ? "border-red-500" : ""}`} />
                            {formErrors[index]?.endDate && <p className="text-red-500 text-xs mt-1">{formErrors[index].endDate}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Course Highlight</label>
                          <textarea
                            rows="6"
                            className="border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full"
                            value={edu.highlights}
                            onChange={(e) => updateField(index, "highlights", e.target.value)} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(index)}
                        className="absolute top-2 right-2 text-red-600 text-2xl rounded-full hover:text-white hover:bg-red-600"
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

export default EditEducationList;