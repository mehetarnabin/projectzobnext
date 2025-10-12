// RecruitmentStats.jsx
import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const RecruitmentStats = () => {
  // Donut Chart for a single percentage
  const DonutChart = ({ label, value, color }) => {
    const data = [
      { name: "Filled", value, color },
      { name: "Remaining", value: 100 - value, color: "#E5E7EB" }, // light gray
    ];

    return (
      <div className="flex flex-col items-center">
        <PieChart width={100} height={100}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={45}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {/* % inside the donut */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-semibold"
            fill={color}
          >
            {value}%
          </text>
        </PieChart>
        <span className="text-xs text-gray-500 mt-1">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Shortlisted from CVs */}
      <div>
        <Card className="rounded-2xl shadow p-4">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Shortlisted from CVs</h3>
              <span className="text-2xl font-bold">35</span>
            </div>
            <div className="flex justify-around">
              <DonutChart label="Task success" value={46} color="#3B82F6" />
              <DonutChart label="No response" value={54} color="#FACC15" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviewed from CVs */}
      <div>
        <Card className="rounded-2xl shadow p-4">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Interviewed from CVs</h3>
              <span className="text-2xl font-bold">30</span>
            </div>
            <div className="flex justify-around">
              <DonutChart label="Passed" value={27} color="#22C55E" />
              <DonutChart label="Rejected" value={73} color="#EF4444" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecruitmentStats;
