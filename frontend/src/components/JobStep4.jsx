import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaShieldAlt } from "react-icons/fa";
import api from "../api/axios";

const JobStep4 = ({ formData = {}, onBack, onComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedPackage = formData.packageData;
  const jobIdToSend = formData.id || null;

  if (!selectedPackage) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <p className="text-gray-600">
          No package selected. Please go back and select a subscription plan.
        </p>
        <button
          onClick={onBack}
          className="mt-4 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in as an employer.");

      // ===== Handle free package =====
      if (Number(selectedPackage.price) <= 0) {
        if (!jobIdToSend) {
          setError("Job ID is missing. Please complete previous steps.");
          setLoading(false);
          return;
        }

        await api.post(
          "/confirm-free-package",
          {
            job_id: jobIdToSend,
            package_id: selectedPackage.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` }, // ✅ ensure auth
          }
        );

        onComplete();
        return;
      }

      // ===== Paid package =====
      if (!stripe || !elements) throw new Error("Stripe not loaded.");

      const { data: intentData } = await api.post(
        "/create-payment-intent",
        {
          package_id: selectedPackage.id,
          job_id: jobIdToSend,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ ensure auth
        }
      );

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card details are required.");

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent.status === "succeeded") {
        await api.post(
          "/confirm-payment",
          {
            payment_intent_id: paymentIntent.id,
            job_id: jobIdToSend,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        onComplete();
      } else {
        setError(
          "Payment is not completed yet. Please follow the instructions from your bank."
        );
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold text-[#003893] mb-4">
        Payment & Confirmation
      </h2>

      <div className="border border-gray-300 rounded-xl p-4 mb-4 bg-blue-50">
        <h3 className="text-xl font-semibold text-[#003893]">
          {selectedPackage.name} Package
        </h3>
        <p className="text-gray-600">{selectedPackage.description}</p>
        <p className="text-lg font-bold mt-2">
          {Number(selectedPackage.price) <= 0
            ? "Free"
            : `${selectedPackage.price} USD`}
        </p>
      </div>

      {Number(selectedPackage.price) > 0 && (
        <div className="border border-gray-300 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": { color: "#a0aec0" },
                },
                invalid: { color: "#e53e3e" },
              },
            }}
          />
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
            <FaShieldAlt /> Secure SSL encrypted payment
          </p>
        </div>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={loading || (Number(selectedPackage.price) > 0 && !stripe)}
          className={`px-6 py-3 rounded-lg text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#003893] hover:bg-[#002766]"
          } transition`}
        >
          {loading
            ? "Processing..."
            : Number(selectedPackage.price) <= 0
            ? "Confirm & Post Job"
            : "Pay & Post Job"}
        </button>
      </div>
    </form>
  );
};

export default JobStep4;
