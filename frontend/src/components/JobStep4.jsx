import { FaCreditCard, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { packages } from "./JobStep2"; // Export your packages array from Step2 to reuse

const JobStep4 = ({ formData = {}, onBack, onComplete }) => {
  const selectedPackage = packages.find(pkg => pkg.name === formData.package);

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(); // ✅ Don't pass the event or merge it into formData
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003893] mb-6">Payment & Confirmation</h2>

      {/* Selected Package Summary */}
      {selectedPackage && (
        <div className="border border-gray-300 rounded-xl p-6 bg-blue-50 flex items-center gap-6">
          <div className="text-4xl">{selectedPackage.icon}</div>
          <div>
            <h3 className="text-xl font-semibold text-[#003893]">
              {selectedPackage.name} Package
            </h3>
            <p className="text-sm text-gray-600">{selectedPackage.description}</p>
            <p className="text-lg font-bold mt-1">{selectedPackage.price}</p>
          </div>
        </div>
      )}

      {/* Payment Info (Fake UI for now) */}
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
