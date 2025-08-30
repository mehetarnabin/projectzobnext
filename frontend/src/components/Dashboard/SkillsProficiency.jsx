import React from "react";

const SkillsProficiency = () => {
  const skills = [
    { name: "SQL", proficiency: 90 },
    { name: "PowerBI", proficiency: 85 },
    { name: "Tableau", proficiency: 80 },
    { name: "Excel", proficiency: 75 },
    { name: "Python", proficiency: 70 },
    { name: "ETL", proficiency: 65 },
    { name: "Looker", proficiency: 60 },
    { name: "Microsoft", proficiency: 55 },
    { name: "SQL Server", proficiency: 50 },
    { name: "dbt", proficiency: 45 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-2">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center">
            <span className="w-32 text-xs text-gray-400">{skill.name}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${skill.proficiency}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsProficiency;