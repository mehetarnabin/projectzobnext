import React from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { FaShieldAlt, FaStar, FaChartLine, FaRocket, FaGem } from "react-icons/fa";

const iconMap = {
  Free: <FaStar className="text-yellow-400 text-4xl" />,
  Basic: <FaChartLine className="text-blue-400 text-4xl" />,
  Advance: <FaRocket className="text-purple-500 text-4xl" />,
  Premium: <FaGem className="text-pink-500 text-4xl" />,
};

const JobStep4 = ({ formData = {}, onBack, onComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const selectedPackage = formData.packageData;

  if (!selectedPackage) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          No package selected. Please go back and select a subscription plan.
        </p>
        <button
          onClick={onBack}
          className="mt-4 bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      alert("Stripe is not loaded yet. Please wait.");
      return;
    }

    try {
      await onComplete(); // calls PostJobPage.handleComplete
    } catch (error) {
      console.error("Error completing job:", error);
      alert("Failed to post job. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003893] mb-6">
        Payment & Confirmation
      </h2>

      {/* Package Summary */}
      <div className="border border-gray-300 rounded-xl p-6 bg-blue-50 flex items-center gap-6">
        <div className="text-4xl">{iconMap[selectedPackage.name]}</div>
        <div>
          <h3 className="text-xl font-semibold text-[#003893]">
            {selectedPackage.name} Package
          </h3>
          <p className="text-gray-600">{selectedPackage.description}</p>
          <p className="font-bold mt-1">{selectedPackage.price}</p>
          {selectedPackage.features?.dayDuration && (
            <p className="text-sm text-gray-700">
              Duration: {selectedPackage.features.dayDuration} days
            </p>
          )}
        </div>
      </div>

      {/* Stripe Card Input */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
          <FaShieldAlt /> Secure SSL encrypted payment
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={!stripe}
          className="bg-[#003893] text-white px-6 py-3 rounded-lg hover:bg-[#002766]"
        >
          Confirm & Post Job
        </button>
      </div>
    </form>
  );
};

export default JobStep4;
