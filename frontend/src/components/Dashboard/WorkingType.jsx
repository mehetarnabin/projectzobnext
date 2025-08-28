import React from "react";
import { FaEllipsisH, FaRegCalendarAlt } from "react-icons/fa";

const WorkingType = () => {
  // Colors
  const WFO_COLOR = "#F97316";
  const WFO_LIGHT = "#FED7AA";
  const WFH_COLOR = "#000000";
  const WFH_LIGHT = "#D4D4D4";

  // Data values
  const wfoValue = 1000;
  const wfhValue = 700;
  const total = wfoValue + wfhValue;
  const wfoPercent = Math.round((wfoValue / total) * 100);
  const wfhPercent = 100 - wfoPercent;

  // Create segmented blocks
  const SEGMENTS = 24; // Total segments
  const segmentAngle = 360 / SEGMENTS;
  const gapSize = 2; // 2px gap between segments

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-gray-200 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Working Type</h3>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
            <FaRegCalendarAlt className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
            <FaEllipsisH className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row items-center">
        {/* Left Side - Details */}
        <div className="flex-1 pr-4 mb-4 md:mb-0">
          <div className="mb-4">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="w-4 h-4 rounded-full absolute" style={{ backgroundColor: WFO_LIGHT }} />
                <div 
                  className="w-4 h-4 rounded-full relative border-2 border-white" 
                  style={{ backgroundColor: WFO_COLOR }}
                />
              </div>
              <span className="text-sm font-medium">WFO</span>
            </div>
            <div className="ml-7 mt-1">
              <p className="text-xs text-gray-500">1000 Applicants ({wfoPercent}%)</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="w-4 h-4 rounded-full absolute" style={{ backgroundColor: WFH_LIGHT }} />
                <div 
                  className="w-4 h-4 rounded-full relative border-2 border-white" 
                  style={{ backgroundColor: WFH_COLOR }}
                />
              </div>
              <span className="text-sm font-medium">WFH</span>
            </div>
            <div className="ml-7 mt-1">
              <p className="text-xs text-gray-500">700 Applicants ({wfhPercent}%)</p>
            </div>
          </div>
        </div>

        {/* Right Side - Concentric Diagrams */}
        <div className="w-64 h-64 relative flex items-center justify-center">
          {/* Outer Diagram (WFO) - Large */}
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: SEGMENTS }).map((_, i) => {
              const isFilled = i < (SEGMENTS * wfoPercent / 100);
              return (
                <div
                  key={`wfo-${i}`}
                  className="absolute top-[48%] left-[48%] w-4 h-6 rounded-sm"
                  style={{
                    backgroundColor: isFilled ? WFO_COLOR : WFO_LIGHT,
                    transform: `
                      rotate(${i * segmentAngle}deg)
                      translateY(-90px)
                    `,
                    transformOrigin: 'center center',
                    margin: `${gapSize}px 0`
                  }}
                />
              );
            })}
          </div>

          {/* Inner Diagram (WFH) - Medium */}
          <div className="absolute top-[50%] left-[50%] w-3/4 h-3/4">
            {Array.from({ length: SEGMENTS }).map((_, i) => {
              const isFilled = i < (SEGMENTS * wfhPercent / 100);
              return (
                <div
                  key={`wfh-${i}`}
                  className="absolute w-2 h-4 rounded-sm"
                  style={{
                    backgroundColor: isFilled ? WFH_COLOR : WFH_LIGHT,
                    transform: `
                      rotate(${i * segmentAngle}deg)
                      translateY(-45px)
                    `,
                    transformOrigin: 'center center',
                    margin: `${gapSize}px 0`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingType;