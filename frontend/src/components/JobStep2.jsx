import { useState } from "react";
import { FaStar, FaChartLine, FaRocket, FaGem, FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // icons
import { Tooltip } from "react-tooltip"; // you can use react-tooltip or your own

export const packages = [
  {
    name: "Basic",
    price: "$49",
    icon: <FaStar className="text-yellow-400 text-3xl" />,
    description: "Reach a small pool of candidates.",
    features: {
      visibility: true,
      highlight: false,
      analytics: false,
      duration: "7 Days",
      priorityListing: false,
      branding: false,
      socialPromo: false,
      emailAlert: false,
      support: "Standard",
    },
  },
  {
    name: "Intermediate",
    price: "$99",
    icon: <FaChartLine className="text-blue-400 text-3xl" />,
    description: "Better visibility with more reach.",
    features: {
      visibility: true,
      highlight: true,
      analytics: false,
      duration: "14 Days",
      priorityListing: true,
      branding: false,
      socialPromo: false,
      emailAlert: true,
      support: "Standard",
    },
  },
  {
    name: "Premium",
    price: "$149",
    icon: <FaRocket className="text-purple-500 text-3xl" />,
    recommended: true,
    description: "Top visibility and branding.",
    features: {
      visibility: true,
      highlight: true,
      analytics: true,
      duration: "21 Days",
      priorityListing: true,
      branding: true,
      socialPromo: true,
      emailAlert: true,
      support: "Priority",
    },
  },
  {
    name: "Elite",
    price: "$199",
    icon: <FaGem className="text-pink-500 text-3xl" />,
    description: "Maximum reach with priority support.",
    features: {
      visibility: true,
      highlight: true,
      analytics: true,
      duration: "30 Days",
      priorityListing: true,
      branding: true,
      socialPromo: true,
      emailAlert: true,
      support: "Dedicated Manager",
    },
  },
];

const JobStep2 = ({ onNext, onBack, initialData }) => {
  const [selected, setSelected] = useState(initialData.package || "Premium");

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ package: selected });
  };

  const featureList = [
    { key: "visibility", label: "Visibility Boost" },
    { key: "highlight", label: "Highlighted Ad" },
    { key: "analytics", label: "Advanced Analytics" },
    { key: "duration", label: "Ad Duration" },
    { key: "priorityListing", label: "Priority Listing" },
    { key: "branding", label: "Company Branding" },
    { key: "socialPromo", label: "Social Media Promotion" },
    { key: "emailAlert", label: "Email Alerts to Candidates" },
    { key: "support", label: "Customer Support Level" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            onClick={() => setSelected(pkg.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(pkg.name)}
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
            <div className="mb-4 flex justify-center">{pkg.icon}</div>
            <h3 className="text-lg font-bold text-[#003893]">{pkg.name}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{pkg.price}</p>
            <p className="text-gray-600 text-sm mb-4 mt-2">{pkg.description}</p>
            <ul className="text-sm space-y-1 mt-4 text-gray-700">
              {featureList.slice(0, 4).map((feat) => (
                <li key={feat.key}>
                  {typeof pkg.features[feat.key] === "boolean" ? (
                    pkg.features[feat.key] ? (
                      <FaCheckCircle className="inline mr-2 text-green-500" />
                    ) : (
                      <FaTimesCircle className="inline mr-2 text-red-400" />
                    )
                  ) : (
                    <span className="inline mr-2 text-gray-600">⏱</span>
                  )}
                  {feat.label}:{" "}
                  {typeof pkg.features[feat.key] === "string"
                    ? pkg.features[feat.key]
                    : ""}
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
                    {typeof pkg.features[feat.key] === "boolean" ? (
                      pkg.features[feat.key] ? (
                        <FaCheckCircle className="text-green-500 mx-auto" />
                      ) : (
                        <FaTimesCircle className="text-red-400 mx-auto" />
                      )
                    ) : (
                      pkg.features[feat.key]
                    )}
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
