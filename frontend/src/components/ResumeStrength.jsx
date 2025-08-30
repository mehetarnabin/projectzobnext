import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';

const ResumeStrength = ({ completion = 72 }) => {
  const isComplete = completion >= 100;

  return (
    <div className="bg-white shadow rounded-2xl p-6 flex flex-col items-center text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Resume Strength</h3>

      <div className="w-32 h-32 mb-4">
        <CircularProgressbar
          value={completion}
          text={`${completion}%`}
          styles={buildStyles({
            textColor: "#003893",
            pathColor: "#003893",
            trailColor: "#e5e7eb",
            textSize: "16px",
          })}
        />
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Your profile is {completion}% complete. Complete your resume to increase chances of getting hired!
      </p>

      {!isComplete && (
        <button className="bg-[#003893] text-white px-4 py-2 rounded-full text-sm hover:bg-[#005EF5] transition">
          Complete Now
        </button>
      )}
    </div>
  );
};

export default ResumeStrength;
