import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import JobStep1 from "../components/JobStep1";
import JobStep2 from "../components/JobStep2";
import JobStep3 from "../components/JobStep3";
import JobStep4 from "../components/JobStep4";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PostJobPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [draftJobId, setDraftJobId] = useState(null);
  const navigate = useNavigate();

  const handleNext = (data) => {
    if (!(data instanceof Event)) {
      setFormData((prev) => ({ ...prev, ...data }));
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleComplete = () => {
    // ✅ Job already created/published in Step4
    alert("✅ Job posted successfully!");
    navigate("/employer/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-[#003893]">Post a Job</h1>
        <div className="mb-6 text-sm text-gray-600">Step {step} of 4</div>

        {step === 1 && <JobStep1 onNext={handleNext} initialData={formData} />}
        {step === 2 && <JobStep2 onNext={handleNext} onBack={handleBack} initialData={formData} />}
        {step === 3 && <JobStep3 formData={formData} onNext={handleNext} onBack={handleBack} />}
        {step === 4 && (
          <Elements stripe={stripePromise}>
            <JobStep4
              formData={formData}
              draftJobId={draftJobId}
              setDraftJobId={setDraftJobId}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PostJobPage;
