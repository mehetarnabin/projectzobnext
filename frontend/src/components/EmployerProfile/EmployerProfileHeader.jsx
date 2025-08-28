import React from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlinePencil } from "react-icons/hi2";
import { useEmployerProfile } from "../../context/EmployerProfileContext";

const EmployerProfileHeader = ({ companyData }) => {
  const { loading } = useEmployerProfile();
  const navigate = useNavigate();

  if (loading || !companyData) {
    return <div className="text-center py-4">Loading company header...</div>;
  }

  return (
    <section className="bg-gray-100 rounded-2xl">
      <div className="space-y-4 overflow-hidden bg-white border-2 border-gray-200 inset-shadow-md rounded-2xl relative">
        <div className="relative group">
          <img
            src={companyData.banner_url || "/images/default_banner.png"}
            alt="Company Banner"
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="absolute -bottom-12 left-6 w-26 h-26 bg-white rounded-full p-1 shadow-md">
            <img
              src={companyData.logo_url || "/images/default_profile.jpg"}
              alt="Company Logo"
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          <button
            onClick={() => navigate("/employer/profile/edit-company-header")}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-100"
            title="Edit Company Profile"
          >
            <HiOutlinePencil />
          </button>
        </div>

        <div className="pt-14 px-6 pb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[#003893]">{companyData.name || "N/A"}</h2>
              {companyData.address && (
                <p className="text-md font-regular text-gray-700">{companyData.address}</p>
              )}
              {companyData.phone_number && (
                <p className="text-md font-regular text-gray-700">{companyData.phone_number}</p>
              )}
              {companyData.website && (
                <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-md font-regular text-[#003893] hover:underline">
                  {companyData.website}
                </a>
              )}
              {/* ADDED: Display Manager Name */}
              {/* {companyData.manager && (
                <p className="text-md font-regular text-gray-700">Manager: {companyData.manager}</p>
              )} */}
            </div>

            <div className="flex flex-1 gap-4 justify-end items-center">
              {Array.isArray(companyData.badges) && companyData.badges.map((badge, i) => (
                <img key={i} src={badge} alt={`Company Badge ${i + 1}`} className="w-18 h-18" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployerProfileHeader;