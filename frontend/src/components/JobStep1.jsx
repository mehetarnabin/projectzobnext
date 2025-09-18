import React, { useState } from "react";
import { MdWork, MdLocationOn, MdBusiness, MdAttachMoney, MdUpload, MdVideoLibrary, MdAccessTime, MdCategory } from "react-icons/md";
import RichTextEditor from "./RichTextEditor";

const JobStep1 = ({ onNext, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    location: initialData.location || "",
    classification: initialData.classification || "",
    description: initialData.description || "",
    workType: initialData.workType || "Full Time",
    workplace: initialData.workplace || "On-site",
    salary: initialData.salary || "",
    salaryType: initialData.salaryType || "Annual",
    company: initialData.company || "",
    logo: null,
    video: null, // video file
    applyBefore: initialData.applyBefore || "",
    keyPoints: initialData.keyPoints || ["", "", ""],
  });

  const [description, setDescription] = useState(formData.description);
  const [logoPreview, setLogoPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const MAX_LOGO_SIZE_MB = 2;
  const MAX_VIDEO_SIZE_MB = 10;

  const classifications = [
    "Information & Communication Technology",
    "Healthcare & Medical",
    "Construction",
    "Education & Training",
    "Finance & Accounting",
    "Marketing & Media",
  ];

  const workTypes = ["Full Time", "Part Time", "Contract", "Internship"];
  const workplaceTypes = ["On-site", "Hybrid", "Remote"];
  const salaryTypes = ["Annual", "Hourly", "Contract"];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files[0];
      if (file && file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
        alert("Logo size exceeds 2MB. Please upload a smaller file.");
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    } else if (name === "video") {
      const file = files[0];
      if (file && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        alert("Video size exceeds 10MB. Please upload a smaller file.");
        return;
      }
      setFormData((prev) => ({ ...prev, video: file }));
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyPointChange = (index, value) => {
    const updated = [...formData.keyPoints];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, keyPoints: updated }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    onNext({ ...formData, description });
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md px-6 py-8 space-y-6">
        {/* Job Title */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Job Title</label>
          <div className="flex items-center border border-gray-300 rounded-md px-3">
            <MdWork className="text-gray-400 text-xl" />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 focus:outline-none"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
        </div>

        {/* Company Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Company Name</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3">
              <MdBusiness className="text-gray-400 text-xl" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full p-3 focus:outline-none"
                placeholder="e.g., Tech Solutions Ltd."
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Company Logo</label>
            <label className="flex items-center justify-center border border-dashed border-gray-300 rounded-md h-14 cursor-pointer bg-white hover:border-blue-400 transition">
              <MdUpload className="text-gray-600 text-2xl" />
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">Max upload size: 2MB. PNG, JPG or SVG recommended.</p>

            {logoPreview && (
              <div className="mt-2">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="h-16 object-contain rounded-md border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location, Classification */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Location</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3">
              <MdLocationOn className="text-gray-400 text-xl" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full p-3 focus:outline-none"
                placeholder="e.g., Auckland, NZ"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Classification</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3">
              <MdCategory className="text-gray-400 text-xl" />
              <select
                name="classification"
                value={formData.classification}
                onChange={handleChange}
                required
                className="w-full p-3 focus:outline-none bg-transparent h-12"
              >
                <option value="">Select Classification</option>
                {classifications.map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workplace Type */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Workplace</label>
          <div className="flex gap-4">
            {workplaceTypes.map((option) => (
              <label
                key={option}
                className={`px-4 py-2 border rounded-md cursor-pointer text-sm ${
                  formData.workplace === option
                    ? "bg-blue-100 border-blue-600 text-blue-700"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="workplace"
                  value={option}
                  checked={formData.workplace === option}
                  onChange={handleChange}
                  className="hidden"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Job Description</label>
          <RichTextEditor content={description} onChange={setDescription} />
        </div>

        {/* Type, Salary, Salary Type */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Job Type</label>
            <select
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md h-12"
            >
              {workTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Salary</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3">
              <MdAttachMoney className="text-gray-400 text-xl" />
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full p-3 focus:outline-none"
                placeholder="e.g., $60,000 - $80,000"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Salary Type</label>
            <select
              name="salaryType"
              value={formData.salaryType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md h-12"
            >
              {salaryTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Apply Before */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Apply Before</label>
          <div className="flex items-center border border-gray-300 rounded-md px-3">
            <MdAccessTime className="text-gray-400 text-xl" />
            <input
              type="date"
              name="applyBefore"
              value={formData.applyBefore}
              onChange={handleChange}
              className="w-full p-3 focus:outline-none"
            />
          </div>
        </div>

        {/* Video Upload */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Optional Video Upload</label>
          <label className="flex items-center justify-center border border-dashed border-gray-300 rounded-md h-14 cursor-pointer bg-white hover:border-blue-400 transition">
            <MdVideoLibrary className="text-gray-600 text-2xl" />
            <input
              type="file"
              name="video"
              accept="video/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">Max upload size: 10MB. MP4, MOV, AVI recommended.</p>

          {videoPreview && (
            <div className="mt-2">
              <video controls className="w-full h-40 object-cover rounded-md border">
                <source src={videoPreview} />
              </video>
            </div>
          )}
        </div>

        {/* Key Points */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Key Selling Points (Optional)</label>
          <div className="space-y-2">
            {formData.keyPoints.map((point, idx) => (
              <input
                key={idx}
                type="text"
                value={point}
                onChange={(e) => handleKeyPointChange(idx, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder={`Point ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-[#003893] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default JobStep1;
