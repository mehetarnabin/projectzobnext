import React, { useState } from "react";
import { MdEdit } from "react-icons/md";

const JobStep3 = ({ formData = {}, onBack, onNext, setFormData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(formData);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // If file input, save file, else save value
    if (files) {
      setEditableData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setEditableData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = () => {
    setFormData(editableData);
    setIsEditing(false);
  };

  const {
    title = "",
    location = "",
    classification = "",
    description = "",
    workType = "",
    salary = "",
    salaryType = "",
    company = "",
    logo = null,
    applyBefore = "",
    video_path = null,
    keyPoints = [],
  } = editableData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#003893]">Preview Your Job Post</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
          >
            <MdEdit className="text-lg" /> Edit
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              name="title"
              value={title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Job Title"
            />
            <input
              name="company"
              value={company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Company"
            />
            <input
              name="location"
              value={location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Location"
            />
            <input
              name="classification"
              value={classification}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Classification"
            />
            <textarea
              name="description"
              value={description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Job Description"
              rows={4}
            />
            <input
              name="salary"
              value={salary}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Salary"
            />
            <input
              name="salaryType"
              value={salaryType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Salary Type"
            />
            <input
              name="applyBefore"
              type="date"
              value={applyBefore}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
            />
            <input
              type="file"
              name="video_path"
              accept="video/*"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2 text-[#003893]">{title}</h3>
            <p className="text-gray-600 mb-1">{company}</p>
            <p className="text-sm text-gray-500 mb-4">
              {location} • {workType} • {classification}
            </p>
            <div
              dangerouslySetInnerHTML={{ __html: description }}
              className="prose max-w-none text-gray-800"
            />
            {keyPoints.length > 0 && (
              <ul className="list-disc list-inside mt-4 text-gray-700">
                {keyPoints.map((point, idx) => point && <li key={idx}>{point}</li>)}
              </ul>
            )}
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Salary:</strong> {salary} ({salaryType})
              </p>
              <p>
                <strong>Apply Before:</strong> {applyBefore}
              </p>
              {video_path && (
                <p>
                  <strong>Video:</strong> {video_path.name}
                </p>
              )}
            </div>
            {logo && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(logo)}
                  alt="Company Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}
          </>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Update
          </button>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default JobStep3;
