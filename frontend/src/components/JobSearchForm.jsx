import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import SearchFilters from "./SearchFilters"; // Assuming this is for additional filters, not part of initial search form

const JobSearchForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [selectedClassifications, setSelectedClassifications] = useState(
    searchParams.get("classification") ? [searchParams.get("classification")] : []
  );
  const [showClassification, setShowClassification] = useState(false);

  const locationRef = useRef(null);
  // Ref for the classification dropdown itself to handle click outside
  const classificationDropdownRef = useRef(null);
  const classificationButtonRef = useRef(null);


  const classifications = [
    "Information & Communication Technology",
    "Healthcare & Medical",
    "Construction",
    "Education & Training",
  ];

  // --- Click outside hook for Classification Dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showClassification &&
        classificationDropdownRef.current && !classificationDropdownRef.current.contains(event.target) &&
        classificationButtonRef.current && !classificationButtonRef.current.contains(event.target)
      ) {
        setShowClassification(false);
      }
    };

    if (showClassification) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showClassification]);
  // --- End click outside hook ---


  useEffect(() => {
    // Ensure google maps API is loaded before initializing autocomplete
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps Places API not loaded. Autocomplete will not function.");
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(locationRef.current, {
      types: ["(cities)"], // restrict to cities
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setLocation(place.formatted_address || place.name || "");
    });
  }, []);

  const toggleClassification = (item) => {
    setSelectedClassifications((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (title) query.set("title", title);
    if (location) query.set("location", location);
    // When multiple classifications are allowed, you might want to join them differently
    // For now, based on your previous code, it only sends the first selected one.
    if (selectedClassifications.length > 0)
      query.set("classification", selectedClassifications[0]);
    navigate(`/jobs?${query.toString()}`);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Job title, keywords, or company"
          className="w-full md:w-100 p-3 border border-gray-300 rounded-lg bg-white text-gray-700"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          ref={locationRef}
          className="w-full md:w-100 p-3 border border-gray-300 rounded-lg bg-white text-gray-700"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {/* Classification Dropdown */}
        <div className="relative w-full md:w-80">
          <button
            type="button"
            ref={classificationButtonRef} // Attach ref here
            onClick={() => setShowClassification(!showClassification)}
            className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center bg-white text-gray-500"
          >
            {selectedClassifications.length > 0
              ? selectedClassifications.join(", ")
              : "Classification"}
            <span>
              <MdKeyboardArrowDown className="text-lg" />
            </span>
          </button>

          {showClassification && (
            <div
              ref={classificationDropdownRef} // Attach ref here
              className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto"
            >
              {classifications.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedClassifications.includes(item)}
                    onChange={() => toggleClassification(item)}
                    className="text-gray-500 accent-blue-500"
                  />
                  <span className="text-gray-500">{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-secondary text-white px-6 py-3 rounded-lg transition whitespace-nowrap"
        >
          Search Job
        </button>
      </div>

      <SearchFilters />
    </form>
  );
};

export default JobSearchForm;