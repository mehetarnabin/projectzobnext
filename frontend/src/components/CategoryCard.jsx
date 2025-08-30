import React from "react";

const CategoryCard = ({ title }) => {
  return (
    <div className="p-4 border-2 border-gray-100 rounded-lg hover:shadow-md border-hover-theme cursor-pointer text-center">
      <div className="text-xl font-medium text-gray-900 mb-2">{title}</div>
      <p className="text-sm text-gray-600">1,234 jobs</p>
    </div>
  );
};

export default CategoryCard;
