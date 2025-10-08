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

      // If Step 2 is skipped due to active subscription, jump to Step 3
      if (step === 1 && data.packageData && data.packageData.remaining_posts >= 0) {
        setStep(3);
      } else {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    // If Step 2 was skipped, going back from Step 3 should go to Step 1
    if (step === 3 && formData.packageData && formData.packageData.remaining_posts >= 0) {
      setStep(1);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    alert("✅ Job posted successfully!");
    navigate("/employer/dashboard");
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
