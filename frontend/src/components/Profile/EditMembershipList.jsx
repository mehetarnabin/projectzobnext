// src/components/Profile/EditMembershipList.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { GoPlusCircle } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const orgSuggestions = [
  { name: "Engineers Australia", domain: "engineersaustralia.org.au" },
  { name: "IEEE", domain: "ieee.org" },
  { name: "American Society of Civil Engineers", domain: "asce.org" },
  { name: "Institution of Civil Engineers", domain: "ice.org.uk" }
];

const EditMembershipList = () => {
  const { profileData, updateMemberships, loading } = useProfile();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const [editList, setEditList] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const navigate = useNavigate();

  // Initialize editList when profileData.memberships becomes available and user is authenticated
  useEffect(() => {
    if (isAuthenticated && profileData.memberships !== undefined) {
      // Ensure 'year' and 'end' are numbers for consistent state,
      // as they might come as strings from the backend, but we validate as numbers.
      const initialMemberships = Array.isArray(profileData.memberships)
        ? profileData.memberships.map(mem => ({
            ...mem,
            year: mem.year ? parseInt(mem.year, 10) : '', // Convert to number, or keep as string for input
            end: mem.end ? parseInt(mem.end, 10) : '',    // Convert to number, or keep as string for input
          }))
        : [];
      setEditList(initialMemberships);
      setFormErrors(initialMemberships.map(() => ({})));
    } else if (!isAuthenticated) {
      // Clear editList if the user becomes unauthenticated
      setEditList([]);
      setFormErrors([]);
    }
  }, [profileData.memberships, isAuthenticated]); // Add isAuthenticated to dependencies

  const handleSave = async () => {
    const errors = editList.map((mem) => {
      const e = {};
      if (!mem.org?.trim()) e.org = "Organization is required.";
      if (!mem.type?.trim()) e.type = "Membership type is required.";

      // Validate 'year' as a number and within a reasonable range
      const startYear = parseInt(mem.year, 10);
      if (isNaN(startYear) || startYear < 1900 || startYear > new Date().getFullYear() + 5) {
        e.year = "Please enter a valid start year (e.g., 2020).";
      }

      // Validate 'end' if present, as a number and after 'year'
      if (String(mem.end).trim()) { // Check if 'end' has any non-whitespace content
        const endYear = parseInt(mem.end, 10);
        if (isNaN(endYear) || endYear < 1900 || endYear > new Date().getFullYear() + 5) {
          e.end = "Please enter a valid end year (e.g., 2025).";
        } else if (!isNaN(startYear) && endYear < startYear) {
          e.end = "End year cannot be before start year.";
        }
      }
      return e;
    });

    const hasErrors = errors.some((e) => Object.keys(e).length > 0);
    if (hasErrors) {
      setFormErrors(errors);
      toast.error("Please fix the errors in your membership entries.");
      return;
    }

    // Prepare data for backend: ensure 'year' and 'end' are numbers or null
    const membershipsToSend = editList.map(mem => ({
      ...mem,
      year: parseInt(mem.year, 10) || null, // Convert to number, or null if invalid
      end: String(mem.end).trim() ? parseInt(mem.end, 10) : null, // Convert to number, or null if empty/invalid
    }));

    await updateMemberships(membershipsToSend); // Call the async update function
    navigate("/profile");
  };

  const handleAdd = () => {
    setEditList([...editList, { org: "", type: "", year: "", end: "", logo: "" }]);
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

    if (key === "org") {
      const match = orgSuggestions.find((s) => s.name.toLowerCase() === value.toLowerCase());
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
    return <div className="text-center p-4">Loading professional memberships editor...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Professional Memberships</h3>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="memberships">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
              {editList.map((mem, index) => (
                <Draggable key={index} draggableId={`mem-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="relative border border-gray-200 rounded p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="grid md:grid-cols-4 gap-4 pb-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.org ? "border-red-500" : ""}`}
                            value={mem.org}
                            onChange={(e) => updateField(index, "org", e.target.value)}
                            list={`org-list-${index}`}
                          />
                          <datalist id={`org-list-${index}`}>
                            {orgSuggestions.map((org) => (
                              <option key={org.name} value={org.name} />
                            ))}
                          </datalist>
                          {formErrors[index]?.org && (
                            <p className="text-red-500 text-xs">{formErrors[index].org}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.type ? "border-red-500" : ""}`}
                            value={mem.type}
                            onChange={(e) => updateField(index, "type", e.target.value)}
                          />
                          {formErrors[index]?.type && (
                            <p className="text-red-500 text-xs">{formErrors[index].type}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                          <input
                            type="text" // Keep as text to allow empty string for initial state
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.year ? "border-red-500" : ""}`}
                            value={mem.year}
                            onChange={(e) => updateField(index, "year", e.target.value)}
                            pattern="[0-9]{4}"
                            title="Please enter a four-digit year (e.g., 2020)"
                          />
                          {formErrors[index]?.year && (
                            <p className="text-red-500 text-xs">{formErrors[index].year}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Year (Optional)</label>
                          <input
                            type="text" // Keep as text to allow empty string for initial state
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.end ? "border-red-500" : ""}`}
                            value={mem.end}
                            onChange={(e) => updateField(index, "end", e.target.value)}
                            pattern="[0-9]{4}"
                            title="Please enter a four-digit year (e.g., 2025) or leave blank if ongoing"
                            placeholder="Current"
                          />
                          {formErrors[index]?.end && (
                            <p className="text-red-500 text-xs">{formErrors[index].end}</p>
                          )}
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

export default EditMembershipList;