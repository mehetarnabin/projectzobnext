import React from "react";
import { FaCreditCard, FaShieldAlt, FaStar, FaChartLine, FaRocket, FaGem } from "react-icons/fa";

// Map package name to icons (same as in Step2)
const iconMap = {
  Basic: <FaStar className="text-yellow-400 text-4xl" />,
  Intermediate: <FaChartLine className="text-blue-400 text-4xl" />,
  Premium: <FaRocket className="text-purple-500 text-4xl" />,
  Elite: <FaGem className="text-pink-500 text-4xl" />,
};

const JobStep4 = ({ formData = {}, onBack, onComplete }) => {
  // Get the selected package from Step2
  const selectedPackage = formData.packageData;

  if (!selectedPackage) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          No package selected. Please go back and select a subscription plan.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(); // Proceed to the final step
  };

  // Helper to render feature values (like Step2)
  const renderFeatureValue = (key, features) => {
    if (!features) return null;

    const value = features[key];
    if (value === true || value === "true" || value === 1) return "✅";
    if (value === false || value === "false" || value === 0) return "❌";
    if (key.toLowerCase().includes("duration")) return value?.dayDuration || value || "⏱";
    return typeof value === "string" ? value : "-";
  };

  // Prepare feature list for display (similar to Step2)
  const featureOrder = [
    "visibility",
    "highlight",
    "analytics",
    "duration",
    "priorityListing",
    "branding",
    "socialPromo",
    "emailAlert",
    "support",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003893] mb-6">Payment & Confirmation</h2>

      {/* Selected Package Summary */}
      <div className="border border-gray-300 rounded-xl p-6 bg-blue-50 flex items-center gap-6">
        <div className="text-4xl">
          {iconMap[selectedPackage.name] || null}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#003893]">{selectedPackage.name} Package</h3>
          <p className="text-sm text-gray-600">{selectedPackage.description}</p>
          <p className="text-lg font-bold mt-1">{selectedPackage.price}</p>
          {/* Display duration if available */}
          {selectedPackage.features?.dayDuration && (
            <p className="text-sm text-gray-700 mt-1">
              Duration: {selectedPackage.features.dayDuration}
            </p>
          )}
        </div>
      </div>

      {/* Selected Package Features */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-2">
        <h4 className="font-semibold text-gray-800 mb-2">Included Features:</h4>
        <ul className="list-disc list-inside text-gray-700">
          {featureOrder.map((feat) => (
            selectedPackage.features?.[feat] !== undefined && (
              <li key={feat}>
                {feat.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:{" "}
                {renderFeatureValue(feat, selectedPackage.features)}
              </li>
            )
          ))}
        </ul>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
          <input
            type="text"
            required
            className="block w-full p-3 border border-gray-300 rounded-md"
            placeholder="John Doe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              required
              className="block w-full p-3 border border-gray-300 rounded-md"
              placeholder="•••• •••• •••• ••••"
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security code (CVV)</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="CVV"
              />
            </div>
          </div>
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
          className="bg-[#003893] text-white px-6 py-3 rounded-lg hover:bg-[#002766]"
        >
          Confirm & Post Job
        </button>
      </div>
    </form>
  );
};

export default JobStep4;
