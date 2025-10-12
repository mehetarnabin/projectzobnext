import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaChartLine,
  FaRocket,
  FaGem,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import api from "../api/axios";

const iconMap = {
  Free: <FaStar className="text-yellow-400 text-3xl" />,
  Basic: <FaChartLine className="text-blue-400 text-3xl" />,
  Advance: <FaRocket className="text-purple-500 text-3xl" />,
  Premium: <FaGem className="text-pink-500 text-3xl" />,
};

const packageOrder = ["Free", "Basic", "Advance", "Premium"];
const staticFeatureOrder = [
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

const JobStep2 = ({ onNext, onBack, initialData }) => {
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(initialData.package || "Premium");
  const [featureList, setFeatureList] = useState([]);
  const [skipSelection, setSkipSelection] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check for active subscription
  useEffect(() => {
    const checkActiveSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. User not logged in.");
          return setLoading(false);
        }

        const { data } = await api.get("/active-subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Active subscription API response:", data);

        if (!data) {
          console.warn("No data returned from subscription API.");
          return setLoading(false);
        }

        const activeSub = data.subscription || null;

        if (!activeSub) {
          console.warn("No active subscription found.");
          return setLoading(false);
        }

        // Check all conditions to skip Step 2
        if (data.active === true && activeSub.remaining_posts > 0) {
          console.log(
            "Active subscription found. Skipping package selection.",
            activeSub
          );
          setSkipSelection(true);
          onNext({ packageData: activeSub }); // move to next step
        } else {
          console.log(
            "Subscription found but conditions not met:",
            "Active:", data.active,
            "Remaining posts:", activeSub.remaining_posts
          );
        }
      } catch (err) {
        console.error("Error checking active subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    checkActiveSubscription();
  }, [onNext]);

  // Fetch available subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/subscription-plans");
        let plansData = res.data.data || [];

        // Sort packages in custom order
        plansData.sort(
          (a, b) => packageOrder.indexOf(a.name) - packageOrder.indexOf(b.name)
        );

        const allFeatures = new Set();
        plansData.forEach((pkg) => {
          const features = pkg.features || {};
          Object.keys(features).forEach((key) => allFeatures.add(key));
        });

        const featuresArray = staticFeatureOrder
          .filter((key) => allFeatures.has(key))
          .map((key) => ({
            key,
            label: key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase()),
          }));

        setPackages(plansData);
        setFeatureList(featuresArray);
        if (!selected && plansData.length > 0) setSelected(plansData[0].name);
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
      }
    };

    fetchPlans();
  }, [selected]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedPackageObj = packages.find((pkg) => pkg.name === selected);
    onNext({ packageData: selectedPackageObj });
  };

  const renderFeatureIcon = (value, key, pkg) => {
    if (value === true || value === "true" || value === 1) {
      return <FaCheckCircle className="inline mr-2 text-green-500" />;
    } else if (value === false || value === "false" || value === 0) {
      return <FaTimesCircle className="inline mr-2 text-red-400" />;
    } else if (key.toLowerCase().includes("duration")) {
      const days = pkg.features.dayDuration || value;
      return <span className="inline mr-2 text-gray-600">⏱ {days}</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <p className="text-gray-600">Checking your subscription...</p>
      </div>
    );
  }

  if (skipSelection) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <p className="text-gray-600">
          You already have an active subscription. Skipping package selection...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            onClick={() => setSelected(pkg.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && setSelected(pkg.name)
            }
            className={`relative border rounded-xl px-6 py-8 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg ${
              selected === pkg.name
                ? "border-blue-700 bg-blue-50 ring-1 ring-blue-600"
                : "border-gray-300"
            } ${pkg.recommended ? "bg-yellow-50 border-yellow-400" : ""}`}
          >
            {pkg.recommended && (
              <div className="absolute top-1 right-1 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full shadow">
                Recommended
              </div>
            )}
            <div className="mb-4 flex justify-center">{iconMap[pkg.name]}</div>
            <h3 className="text-lg font-bold text-[#003893]">{pkg.name}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{pkg.price}</p>
            <p className="text-gray-600 text-sm mb-4 mt-2">{pkg.description}</p>
            <ul className="text-sm space-y-1 mt-4 text-gray-700">
              {featureList.slice(0, 4).map((feat) => (
                <li key={feat.key}>
                  {renderFeatureIcon(pkg.features[feat.key], feat.key, pkg)}
                  {feat.key.toLowerCase() !== "duration" && pkg.features[feat.key]}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="bg-[#003893] text-white">
              <th className="p-4 text-left">Features</th>
              {packages.map((pkg) => (
                <th key={pkg.name} className="p-4 text-center">
                  {pkg.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {featureList.map((feat) => (
              <tr key={feat.key} className="border-t border-gray-200">
                <td className="p-4">{feat.label}</td>
                {packages.map((pkg) => (
                  <td key={pkg.name} className="p-4 text-center">
                    {renderFeatureIcon(pkg.features[feat.key], feat.key, pkg) ||
                      (typeof pkg.features[feat.key] === "string"
                        ? pkg.features[feat.key]
                        : "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-[#003893] text-white px-6 py-3 rounded-lg hover:bg-[#002766] transition"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default JobStep2;
