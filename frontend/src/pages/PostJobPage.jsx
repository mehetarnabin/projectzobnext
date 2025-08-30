import API_BASE_URL from "../config"; // Add this line
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobStep1 from "../components/JobStep1";
import JobStep2 from "../components/JobStep2";
import JobStep3 from "../components/JobStep3";
import JobStep4 from "../components/JobStep4";

const PostJobPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleNext = (data) => {
    if (!(data instanceof Event)) {
      setFormData((prev) => ({ ...prev, ...data }));
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const toSnakeCase = (str) => 
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  const preparePayload = (data) => {
    const payload = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const snakeKey = toSnakeCase(key);
        payload[snakeKey] = data[key];
      }
    }

    return payload;
  };

  const handleComplete = async () => {
    if (formData instanceof Event) {
      console.error("Invalid form data: received DOM event instead of object.");
      return;
    }
    console.log("Sending form data:");
console.log("workType:", formData.workType);
console.log("salaryType:", formData.salaryType);
console.log("applyBefore:", formData.applyBefore);
console.log("Full formData:", formData);
console.log("Prepared payload:", preparePayload(formData));
    
  try {
    const form = new FormData();

    const { logo, keyPoints, ...restData } = formData;

    // Prepare payload with snake_case keys
    const payload = preparePayload(restData);

    // Append all text fields with snake_case keys
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });

    // Append key_points array properly
    if (keyPoints && Array.isArray(keyPoints)) {
      keyPoints.forEach(point => form.append('key_points[]', point));
    }

    if (logo) {
      form.append('logo', logo);
    }

    const token = localStorage.getItem('token');

    // const response = await fetch('http://10.120.30.250:8000/api/jobs', {
    const response = await fetch(`${API_BASE_URL}jobs`, {

      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // Do NOT add Content-Type
      },
      body: form,
  });

    if (!response.ok) {
      const errorData = await response.json();
      let errorMsg = errorData.message || 'Failed to post job';
      if (errorData.errors) {
        errorMsg = Object.values(errorData.errors).flat().join('\n');
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('Job posted successfully:', data);
    
    navigate("/employer/dashboard");
  } catch (error) {
    console.error('Error posting job:', error.message);
    // Show error to user
    alert(`Error: ${error.message}`);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-[#003893]">Post a Job</h1>
        <div className="mb-6 text-sm text-gray-600">Step {step} of 4</div>

        {step === 1 && <JobStep1 onNext={handleNext} initialData={formData} />}
        {step === 2 && <JobStep2 onNext={handleNext} onBack={handleBack} initialData={formData} />}
        {step === 3 && <JobStep3 formData={formData} onNext={handleNext} onBack={handleBack} />}
        {step === 4 && <JobStep4 formData={formData} onBack={handleBack} onComplete={handleComplete} />}
      </div>
    </div>
  );
};

export default PostJobPage;
