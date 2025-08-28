import React, { useState } from "react";
import {
  MdWorkOutline,
  MdSearch,
  MdOutlineLocationCity,
  MdLocationOn,
} from "react-icons/md";

const tabIcons = {
  "Popular Searches": <MdSearch className="text-[#003893] text-lg" />,
  "Popular Companies": <MdOutlineLocationCity className="text-[#003893] text-lg" />,
  "Popular Jobs": <MdWorkOutline className="text-[#003893] text-lg" />,
  "Popular Location": <MdLocationOn className="text-[#003893] text-lg" />,
};

const itemIcons = {
  "Popular Searches": <MdSearch className="text-[#003893] text-base" />,
  "Popular Companies": <MdOutlineLocationCity className="text-[#003893] text-base" />,
  "Popular Jobs": <MdWorkOutline className="text-[#003893] text-base" />,
  "Popular Location": <MdLocationOn className="text-[#003893] text-base" />,
};

const TabbedSection = ({ title, tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const activeLabel = tabs[activeTab].label;

  return (
    <section className="mb-20">
      {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}

      <div className="bg-white py-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-4 font-medium flex items-center space-x-2 transition ${
                activeTab === index
                  ? "border-b-2 border-[#003893] text-[#003893]"
                  : "text-gray-500 hover:text-[#003893]"
              }`}
            >
              {tabIcons[tab.label]}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="flex flex-wrap w-250 gap-3">
          {tabs[activeTab]?.items?.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-[#f5f8ff] text-[#003893] px-3 py-1.5 rounded-full text-sm font-medium hover:bg-[#e6efff] cursor-pointer transition"
            >
              {itemIcons[activeLabel]}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TabbedSection;
