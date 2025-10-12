import React from "react";

const EmployerCard = ({ companyName, logoUrl }) => {
  return (
    <div className="cursor-pointer p-6 border-2 border-gray-100 rounded-lg hover:shadow-lg transition-all duration-300 bg-white text-center">
      <img
        src={logoUrl}
        alt={`${companyName} Logo`}
        className="mx-auto w-28 h-16 object-contain"
      />
      <h3 className="text-2xl font-semibold mt-2">{companyName}</h3>
    </div>
  );
};

export default EmployerCard;
