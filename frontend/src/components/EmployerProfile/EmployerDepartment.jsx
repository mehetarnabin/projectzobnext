import React from "react";
import { useEmployerProfile } from "../../context/EmployerProfileContext";

const EmployerDepartment = ({ userData }) => {
  const { employerProfileData, loading, error, managers } = useEmployerProfile(); // Get managers from context

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading department info...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>Error loading department: {error}</p>
      </div>
    );
  }

  const currentDepartment = userData?.designation || "Not specified";
  // The 'managers' array from context now contains users with 'Manager' designation
  const companyManagers = managers; // This already comes filtered from context

  return (
    <section className="bg-gray-100 rounded-2xl h-full">
      <div className="space-y-2 overflow-hidden bg-white border-2 border-gray-200 inset-shadow-md rounded-2xl relative p-6">
        <h3 className="text-md text-[#003893]">Department</h3>

        <div className="space-y-2 text-gray-700">
          <div className="flex items-center">
            <span>{currentDepartment}</span>
          </div>
        </div>

        {companyManagers.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md text-[#003893] mb-2">Manager</h4>
            <div className="space-y-1">
              {companyManagers.map((manager) => (
                <div key={manager.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex-shrink-0">
                    <img
                      src={manager.logo_url || "/images/default_profile.jpg"} // Display manager's logo
                      alt={`${manager.name} Logo`}
                      className="rounded-full object-cover w-full h-full border border-gray-200"
                    />
                  </div>
                  <div>
                    <p className="text-gray-700">{manager.name}</p> {/* Display manager's name */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {companyManagers.length === 0 && (
          <p className="mt-6 text-gray-600">No managers found for this company.</p>
        )}
      </div>
    </section>
  );
};

export default EmployerDepartment;
