import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import api from "../api/axios"; // Axios instance
import JobStep1 from "../components/JobStep1";
import JobStep2 from "../components/JobStep2";
import JobStep3 from "../components/JobStep3";
import JobStep4 from "../components/JobStep4";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  const preparePayload = (data) => {
    const payload = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        payload[toSnakeCase(key)] = data[key];
      }
    }
    return payload;
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in as an employer to post a job.");
        return;
      }

      const form = new FormData();
      const { logo, keyPoints, packageData, ...restData } = formData;

      // Append rest of data
      const payload = preparePayload(restData);
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) form.append(key, value);
      });

      // Append package
      if (packageData?.id) form.append("package", packageData.id);
      else if (packageData?.name) form.append("package", packageData.name);

      // Append key points
      if (keyPoints?.length) keyPoints.forEach((kp) => form.append("key_points[]", kp));

      // Append logo
      if (logo) form.append("logo", logo);

      // POST job
      const response = await api.post("/jobs", form, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Job posted successfully:", response.data);
      alert("✅ Job posted successfully!");
      navigate("/employer/dashboard");

    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join("\n")
          : error.message) ||
        "Failed to post job";

      console.error("Error posting job:", message);
      alert(`❌ Error: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-[#003893]">Post a Job</h1>
        <div className="mb-6 text-sm text-gray-600">Step {step} of 4</div>

        {step === 1 && <JobStep1 onNext={handleNext} initialData={formData} />}
        {step === 2 && (
          <JobStep2 onNext={handleNext} onBack={handleBack} initialData={formData} />
        )}
        {step === 3 && (
          <JobStep3 formData={formData} onNext={handleNext} onBack={handleBack} />
        )}
        {step === 4 && (
          <Elements stripe={stripePromise}>
            <JobStep4 formData={formData} onBack={handleBack} onComplete={handleComplete} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PostJobPage;
