import React, { useState, useEffect } from "react"; 
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaShieldAlt } from "react-icons/fa";
import api from "../api/axios";

const JobStep4 = ({ formData = {}, draftJobId, setDraftJobId, onBack, onComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localJobId, setLocalJobId] = useState(draftJobId || null);

  const selectedPackage = formData.packageData;
  if (!selectedPackage) return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <p className="text-gray-600">No package selected. Go back and select a subscription plan.</p>
      <button onClick={onBack} className="mt-4 bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300">Back</button>
    </div>
  );

  const packagePrice = Number(selectedPackage.price || 0);
  const isFreePackage = packagePrice <= 0;

  useEffect(() => {
    if (!localJobId) {
      const storedId = localStorage.getItem("draftJobId");
      if (storedId) {
        setLocalJobId(storedId);
        setDraftJobId(storedId);
      }
    }
  }, [localJobId, setDraftJobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in as an employer.");

      let jobId = localJobId;

      // 🔹 Check for active subscription
      const { data } = await api.get("active-subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeSub = data.data;

      // Prepare FormData with defaults
      const fd = new FormData();
      fd.append("title", formData.title || "Job Title");
      fd.append("description", formData.description || "Job Description");
      fd.append("location", formData.location || "TBD");
      fd.append("classification", formData.classification || "General");
      fd.append("work_type", formData.work_type || "Full Time");
      fd.append("workplace", formData.workplace || "Remote");
      fd.append("salary", formData.salary || "TBD");
      fd.append("salary_type", formData.salary_type || "Annual");
      fd.append("company", formData.company || "TBD");
      fd.append("apply_before", formData.apply_before || new Date().toISOString().slice(0, 10));

      if (formData.logo instanceof File) fd.append("logo", formData.logo);
      if (formData.image instanceof File) fd.append("image", formData.image);

      // If employer has active subscription with remaining posts
      if (activeSub && activeSub.status === "active" && activeSub.remaining_posts > 0) {
        fd.append("subscription_id", activeSub.id);

        const { data: resp } = await api.post("/jobs", fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        onComplete(); // Job posted without payment
        return;
      }

      // ❌ No active subscription → follow payment flow
      if (!jobId) {
        fd.append("package_id", selectedPackage.id);
        fd.append("package_price", packagePrice);

        const { data: draft } = await api.post("/jobs", fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        jobId = draft.job_id;
        setLocalJobId(jobId);
        setDraftJobId(jobId);
        localStorage.setItem("draftJobId", jobId);
      }

      if (isFreePackage) {
        localStorage.removeItem("draftJobId");
        setDraftJobId(null);
        onComplete();
        return;
      }

      if (!stripe || !elements) throw new Error("Stripe is not loaded.");

      const { data: intentData } = await api.post(
        "/create-payment-intent",
        { job_id: jobId, package_id: selectedPackage.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card details are required.");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent.status === "succeeded") {
        await api.post(
          "/confirm-payment",
          { payment_intent_id: paymentIntent.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        localStorage.removeItem("draftJobId");
        setDraftJobId(null);
        onComplete();
      } else {
        setError("Payment not completed. Check with your bank.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-[#003893] mb-4">Payment & Confirmation</h2>

      <div className="border border-gray-300 rounded-xl p-4 mb-4 bg-blue-50">
        <h3 className="text-xl font-semibold text-[#003893]">{selectedPackage.name} Package</h3>
        <p className="text-gray-600">{selectedPackage.description}</p>
        <p className="text-lg font-bold mt-2">{isFreePackage ? "Free" : `${packagePrice} USD`}</p>
      </div>

      {!isFreePackage && (
        <div className="border border-gray-300 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
          <CardElement
            options={{
              style: {
                base: { fontSize: "16px", color: "#32325d", "::placeholder": { color: "#a0aec0" } },
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
          className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={loading || (!isFreePackage && !stripe)}
          className={`px-6 py-3 rounded-lg text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#003893] hover:bg-[#002766]"
          } transition`}
        >
          {loading ? "Processing..." : isFreePackage ? "Confirm & Post Job" : "Pay & Post Job"}
        </button>
      </div>
    </form>
  );
};

export default JobStep4;
