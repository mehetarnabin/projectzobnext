import React, { useState, useEffect, useRef } from "react";
import { MdTune, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const SearchFilters = ({
    workTypes = ["Full time", "Part time", "Contract/Temp", "Casual"],
    remoteOptions = ["Remote", "On-site", "Hybrid"],
    payingRanges = ["$0 - $50k", "$50k - $100k", "$100k - $150k", "$150k+"],
    listedTimes = ["Last 24 hours", "Last 7 days", "Last 14 days", "Anytime"],
    onFilterChange,
  }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const filtersRef = useRef(null);
  
    const handleDropdownClick = (key) => {
      setOpenDropdown((prev) => (prev === key ? null : key));
    };
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (filtersRef.current && !filtersRef.current.contains(event.target)) {
          setOpenDropdown(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    return (
      <div className="w-full relative" ref={filtersRef}>
        <div className="flex justify-end absolute z-10 right-0 mb-4">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-white hover:text-gray-400 font-semibold transition duration-200"
          >
            <MdTune className="text-2xl" />
            {showFilters ? "Hide options" : "More options"}
          </button>
        </div>
  
        <div
          className={`transition-all duration-300 ease-in-out ${
            showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-4">
            <Dropdown
              title="All work types"
              isOpen={openDropdown === "workType"}
              onClick={() => handleDropdownClick("workType")}
              items={workTypes}
              filterKey="workType"
              onSelectionChange={onFilterChange}
            />
            <Dropdown
              title="All remote options"
              isOpen={openDropdown === "remoteOption"}
              onClick={() => handleDropdownClick("remoteOption")}
              items={remoteOptions}
              filterKey="remoteOption"
              onSelectionChange={onFilterChange}
            />
            <Dropdown
              title="Paying"
              isOpen={openDropdown === "paying"}
              onClick={() => handleDropdownClick("paying")}
              items={payingRanges}
              filterKey="paying"
              onSelectionChange={onFilterChange}
            />
            <Dropdown
              title="Listed any time"
              isOpen={openDropdown === "listed"}
              onClick={() => handleDropdownClick("listed")}
              items={listedTimes}
              filterKey="listed"
              onSelectionChange={onFilterChange}
            />
          </div>
        </div>
      </div>
    );
  };
  
  const Dropdown = ({ title, isOpen, onClick, items, filterKey, onSelectionChange }) => {
    const [selectedItems, setSelectedItems] = useState([]);
  
    const toggleItem = (item) => {
      const updated = selectedItems.includes(item)
        ? selectedItems.filter((val) => val !== item)
        : [...selectedItems, item];
  
      setSelectedItems(updated);
      onSelectionChange(filterKey, updated);
    };
  
    return (
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 bg-transparent text-white focus:outline-none"
        >
          {title}
          {isOpen ? <MdKeyboardArrowUp className="text-lg" /> : <MdKeyboardArrowDown className="text-lg" />}
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto transition-all duration-200">
            {items.map((item, idx) => (
              <label
                key={idx}
                className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item)}
                  onChange={() => toggleItem(item)}
                  className="mr-2"
                />
                {item}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default SearchFilters;
