// JobCard.jsx
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdWork, MdBookmarkBorder } from "react-icons/md";

// Destructure props here (title, company, location, description)
const JobCard = ({ title, company, location, description }) => {
  return (
    <div className="relative px-9 py-6 border-2 border-gray-100 rounded-lg hover:shadow-lg border-hover-theme bg-white h-full flex flex-col justify-between min-h-[250px]"> {/* Added h-full, flex flex-col justify-between, and min-h */}
      {/* Save and Share Icons */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <button><MdBookmarkBorder className="text-xl text-gray-400 hover:text-red-500" /></button>
      </div>
      <div> {/* Wrap fixed content in a div to allow flex-grow on description if needed */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3> {/* Use title prop */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MdWork className="mr-1" /> {company} {/* Use company prop */}
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FaMapMarkerAlt className="mr-1" /> {location} {/* Use location prop */}
        </div>
        <div
          className="text-sm text-gray-600 mb-4 overflow-hidden line-clamp-3" // Using div instead of p, added line-clamp
          dangerouslySetInnerHTML={{ __html: description }}
        ></div>
      </div>
      <button
        type="submit"
        className="mt-auto bg-[#003893] text-white px-3 py-2 flex items-center leading-none rounded-2xl transition whitespace-nowrap text-sm mr-4 self-start" // Added mt-auto and self-start
      >
        Quick Apply
      </button>
    </div>
  );
};

export default JobCard;