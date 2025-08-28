// src/components/Profile/EditLicenseList.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { GoPlusCircle } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const EditLicenseList = () => {
  const { profileData, updateLicenses, loading } = useProfile();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const [editList, setEditList] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const navigate = useNavigate();

  // Initialize editList when profileData.licenses becomes available and user is authenticated
  useEffect(() => {
    if (isAuthenticated && profileData.licenses !== undefined) {
      // Ensure 'issued' and 'expiry' are numbers for consistent state,
      // as they might come as strings from the backend, but we validate as numbers.
      const initialLicenses = Array.isArray(profileData.licenses)
        ? profileData.licenses.map(lic => ({
            ...lic,
            issued: lic.issued ? parseInt(lic.issued, 10) : '', // Convert to number, or keep as string for input
            expiry: lic.expiry ? parseInt(lic.expiry, 10) : '', // Convert to number, or keep as string for input
          }))
        : [];
      setEditList(initialLicenses);
      setFormErrors(initialLicenses.map(() => ({})));
    } else if (!isAuthenticated) {
      // Clear editList if the user becomes unauthenticated
      setEditList([]);
      setFormErrors([]);
    }
  }, [profileData.licenses, isAuthenticated]); // Add isAuthenticated to dependencies

  const handleSave = async () => {
    const errors = editList.map((lic) => {
      const e = {};
      if (!lic.type?.trim()) e.type = "License type is required.";
      if (!lic.authority?.trim()) e.authority = "Authority is required.";

      // Validate 'issued' as a number and within a reasonable range
      const issuedYear = parseInt(lic.issued, 10);
      if (isNaN(issuedYear) || issuedYear < 1900 || issuedYear > new Date().getFullYear() + 5) {
        e.issued = "Please enter a valid issued year (e.g., 2020).";
      }

      // Validate 'expiry' if present, as a number and after 'issued'
      if (String(lic.expiry).trim()) { // Check if 'expiry' has any non-whitespace content
        const expiryYear = parseInt(lic.expiry, 10);
        if (isNaN(expiryYear) || expiryYear < 1900 || expiryYear > new Date().getFullYear() + 15) {
          e.expiry = "Please enter a valid expiry year (e.g., 2025).";
        } else if (!isNaN(issuedYear) && expiryYear < issuedYear) {
          e.expiry = "Expiry year cannot be before issued year.";
        }
      }
      return e;
    });

    const hasErrors = errors.some((e) => Object.keys(e).length > 0);
    if (hasErrors) {
      setFormErrors(errors);
      toast.error("Please fix the errors in your license entries.");
      return;
    }

    // Prepare data for backend: ensure 'issued' and 'expiry' are numbers or null
    const licensesToSend = editList.map(lic => ({
      ...lic,
      issued: parseInt(lic.issued, 10) || null, // Convert to number, or null if invalid
      expiry: String(lic.expiry).trim() ? parseInt(lic.expiry, 10) : null, // Convert to number, or null if empty/invalid
    }));

    await updateLicenses(licensesToSend); // Call the async update function
    navigate("/profile");
  };

  const handleAdd = () => {
    setEditList([...editList, { type: "", authority: "", issued: "", expiry: "" }]);
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
    return <div className="text-center p-4">Loading licenses editor...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Licenses</h3>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="licenses">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
              {editList.map((lic, index) => (
                <Draggable key={index} draggableId={`lic-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="relative border border-gray-200 rounded p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="grid md:grid-cols-2 gap-4 pb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.type ? "border-red-500" : ""}`}
                            value={lic.type}
                            onChange={(e) => updateField(index, "type", e.target.value)}
                          />
                          {formErrors[index]?.type && (
                            <p className="text-red-500 text-xs">{formErrors[index].type}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Authority</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.authority ? "border-red-500" : ""}`}
                            value={lic.authority}
                            onChange={(e) => updateField(index, "authority", e.target.value)}
                          />
                          {formErrors[index]?.authority && (
                            <p className="text-red-500 text-xs">{formErrors[index].authority}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 pb-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issued Year</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.issued ? "border-red-500" : ""}`}
                            value={lic.issued}
                            onChange={(e) => updateField(index, "issued", e.target.value)}
                            pattern="[0-9]{4}"
                            title="Please enter a four-digit year (e.g., 2020)"
                          />
                          {formErrors[index]?.issued && (
                            <p className="text-red-500 text-xs">{formErrors[index].issued}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year (Optional)</label>
                          <input
                            type="text"
                            className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${formErrors[index]?.expiry ? "border-red-500" : ""}`}
                            value={lic.expiry}
                            onChange={(e) => updateField(index, "expiry", e.target.value)}
                            pattern="[0-9]{4}"
                            title="Please enter a four-digit year (e.g., 2025) or leave blank if no expiry"
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

export default EditLicenseList;