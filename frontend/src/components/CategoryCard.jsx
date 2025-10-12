import React from "react";

const CategoryCard = ({ title, count }) => {
  return (
    <div className="p-4 border-2 border-gray-100 rounded-lg hover:shadow-md cursor-pointer text-center">
      <div className="text-xl font-medium text-gray-900 mb-2">{title}</div>
      <p className="text-sm text-gray-600">{count} jobs</p>
    </div>
  );
};

export default CategoryCard;
