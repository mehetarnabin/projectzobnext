import React from "react";

const EmployerCard = ({ companyName, tagline, logoUrl }) => {
  return (
    <div
      onClick={() => alert(`Clicked on ${companyName}`)}
      className="cursor-pointer p-6 border-2 border-gray-100 rounded-lg hover:shadow-lg border-hover-theme transition-all duration-300 bg-white text-center"
    >
      <img
        src={logoUrl}
        alt={`${companyName} Logo`}
        className="mx-auto w-28 h-16 object-contain"
      />
      <h3 className="text-2xl font-semibold mb-2">{companyName}</h3>
      {/* <p className="text-gray-600 text-sm">{tagline}</p> */}
    </div>  
  );
};

export default EmployerCard;

