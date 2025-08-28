import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ProfileStrength = () => {
  const data = [
    { name: "Visitor", value: 90, color: "#f97316" },
    { name: "Contact", value: 68, color: "#ef4444" },
    { name: "Follow", value: 85, color: "#3b82f6" }
  ];

  return (
    <div className="bg-white rounded-lg shadow px-6 py-3     h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Strength</h3>
      
      <div className="space-y-4 flex-1">
        {data.map((metric, index) => (
          <div key={index}>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className={`h-2 rounded-full`}
                style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{metric.name}</span>
              <span>{metric.value}%</span>
            </div>
          </div>
        ))}
        
        {/* Pie Chart */}
        <div className="mt-6 flex-1" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfileStrength;