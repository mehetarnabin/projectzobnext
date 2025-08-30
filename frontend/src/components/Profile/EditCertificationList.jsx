// src/components/Profile/EditCertificationList.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { GoPlusCircle } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const providerSuggestions = [
  { name: "SkillBuilder Australia", domain: "skillbuilder.edu.au" },
  { name: "Coursera", domain: "coursera.org" },
  { name: "LinkedIn Learning", domain: "linkedin.com" },
  { name: "Udemy", domain: "udemy.com" },
  { name: "TAFE NSW", domain: "tafensw.edu.au" },
  { name: "Harvard University", domain: "harvard.edu" }
];

const EditCertificationList = () => {
  const { profileData, updateCertifications, loading } = useProfile();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const [editList, setEditList] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const navigate = useNavigate();

  // Initialize editList when profileData.certifications becomes available and user is authenticated
  useEffect(() => {
    if (isAuthenticated && profileData.certifications !== undefined) {
      // Ensure 'year' and 'expiry' are numbers for consistent state,
      // as they might come as strings from the backend, but we validate as numbers.
      const initialCertifications = Array.isArray(profileData.certifications)
        ? profileData.certifications.map(cert => ({
            ...cert,
            year: cert.year ? parseInt(cert.year, 10) : '', // Convert to number, or keep as string for input
            expiry: cert.expiry ? parseInt(cert.expiry, 10) : '', // Convert to number, or keep as string for input
          }))
        : [];
      setEditList(initialCertifications);
      setFormErrors(initialCertifications.map(() => ({})));
    } else if (!isAuthenticated) {
      // Clear editList if the user becomes unauthenticated
      setEditList([]);
      setFormErrors([]);
    }
  }, [profileData.certifications, isAuthenticated]); // Add isAuthenticated to dependencies

  const handleSave = async () => {
    const errors = editList.map((cert) => {
      const e = {};
      if (!cert.title?.trim()) e.title = "Title is required.";
      if (!cert.provider?.trim()) e.provider = "Provider is required.";
      if (!cert.country?.trim()) e.country = "Country is required.";

      // Validate 'year' as a number and within a reasonable range
      const completedYear = parseInt(cert.year, 10);
      if (isNaN(completedYear) || completedYear < 1900 || completedYear > new Date().getFullYear() + 5) {
        e.year = "Please enter a valid completed year (e.g., 2023).";
      }

      // Validate 'expiry' if present, as a number and after 'year'
      if (String(cert.expiry).trim()) { // Check if 'expiry' has any non-whitespace content
        const expiryYear = parseInt(cert.expiry, 10);
        if (isNaN(expiryYear) || expiryYear < 1900 || expiryYear > new Date().getFullYear() + 15) {
          e.expiry = "Please enter a valid expiry year (e.g., 2028).";
        } else if (!isNaN(completedYear) && expiryYear < completedYear) {
          e.expiry = "Expiry year cannot be before completed year.";
        }
      }
      return e;
    });

    const hasErrors = errors.some((e) => Object.keys(e).length > 0);
    if (hasErrors) {
      setFormErrors(errors);
      toast.error("Please fix the errors in your certification entries.");
      return;
    }

    // Prepare data for backend: ensure 'year' and 'expiry' are numbers or null
    const certificationsToSend = editList.map(cert => ({
      ...cert,
      year: parseInt(cert.year, 10) || null, // Convert to number, or null if invalid
      expiry: String(cert.expiry).trim() ? parseInt(cert.expiry, 10) : null, // Convert to number, or null if empty/invalid
    }));

    await updateCertifications(certificationsToSend); // Call the async update function
    navigate("/profile");
  };

  const handleAdd = () => {
    setEditList([
      ...editList,
      { title: "", provider: "", country: "", year: "", expiry: "", logo: "" }
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

    if (key === "provider") {
      const match = providerSuggestions.find(
        (p) => p.name.toLowerCase() === value.toLowerCase()
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
    return <div className="text-center p-4">Loading training & certifications editor...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Training & Certifications</h3>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="certifications">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
              {editList.map((cert, index) => (
                <Draggable key={index} draggableId={`cert-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="relative border border-gray-200 rounded p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="grid pb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.title ? "border-red-500" : ""}`}
                            value={cert.title}
                            onChange={(e) => updateField(index, "title", e.target.value)}
                          />
                          {formErrors[index]?.title && (
                            <p className="text-red-500 text-xs">{formErrors[index].title}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 pb-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.provider ? "border-red-500" : ""}`}
                            value={cert.provider}
                            onChange={(e) => updateField(index, "provider", e.target.value)}
                            list={`provider-list-${index}`}
                          />
                          <datalist id={`provider-list-${index}`}>
                            {providerSuggestions.map((p) => (
                              <option key={p.name} value={p.name} />
                            ))}
                          </datalist>
                          {formErrors[index]?.provider && (
                            <p className="text-red-500 text-xs">{formErrors[index].provider}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.country ? "border-red-500" : ""}`}
                            value={cert.country}
                            onChange={(e) => updateField(index, "country", e.target.value)}
                          />
                          {formErrors[index]?.country && (
                            <p className="text-red-500 text-xs">{formErrors[index].country}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Completed Year</label>
                          <input
                            type="text" // Keep as text to allow empty string for initial state
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.year ? "border-red-500" : ""}`}
                            value={cert.year}
                            onChange={(e) => updateField(index, "year", e.target.value)}
                            pattern="[0-9]{4}"
                            title="Please enter a four-digit year (e.g., 2023)"
                          />
                          {formErrors[index]?.year && (
                            <p className="text-red-500 text-xs">{formErrors[index].year}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (Optional)</label>
                          <input
                            type="text" // Keep as text to allow empty string for initial state
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.expiry ? "border-red-500" : ""}`}
                            value={cert.expiry}
                            onChange={(e) => updateField(index, "expiry", e.target.value)}
                            pattern="[0-9]{4}"
                            title="Please enter a four-digit year (e.g., 2028) or leave blank if no expiry"
                            placeholder="No Expiry"
                          />
                          {formErrors[index]?.expiry && (
                            <p className="text-red-500 text-xs">{formErrors[index].expiry}</p>
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

export default EditCertificationList;