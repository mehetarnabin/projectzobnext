import API_BASE_URL from "../../config"; // Add this line
import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VacancyStats = () => {
  const [showApplications, setShowApplications] = useState(true);
  const [showInterviews, setShowInterviews] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  // Sample data for different time ranges
  const dataByRange = {
    day: [
      { name: '9AM', applications: 10, interviews: 5 },
      { name: '12PM', applications: 25, interviews: 12 },
      { name: '3PM', applications: 18, interviews: 8 },
      { name: '6PM', applications: 12, interviews: 4 },
    ],
    week: [
      { name: 'Mon', applications: 15, interviews: 8 },
      { name: 'Tue', applications: 22, interviews: 12 },
      { name: 'Wed', applications: 18, interviews: 9 },
      { name: 'Thu', applications: 24, interviews: 14 },
      { name: 'Fri', applications: 12, interviews: 5 },
      { name: 'Sat', applications: 8, interviews: 3 },
      { name: 'Sun', applications: 5, interviews: 2 },
    ],
    month: [
      { name: 'Jan', applications: 40, interviews: 24 },
      { name: 'Feb', applications: 30, interviews: 13 },
      { name: 'Mar', applications: 20, interviews: 8 },
      { name: 'Apr', applications: 27, interviews: 19 },
      { name: 'May', applications: 18, interviews: 6 },
      { name: 'Jun', applications: 23, interviews: 15 },
      { name: 'Jul', applications: 34, interviews: 25 },
    ]
  };

  // Get data based on selected time range
  const currentData = dataByRange[timeRange];

  // Make the graph more wavy by adding intermediate points
  const smoothData = currentData.map((item, index) => {
    const nextItem = currentData[index + 1] || currentData[index];
    return [
      { ...item, name: `${item.name}_start` },
      { 
        name: `${item.name}_mid`,
        applications: Math.round((item.applications + nextItem.applications) / 2),
        interviews: Math.round((item.interviews + nextItem.interviews) / 2)
      }
    ];
  }).flat();

  return (
    <div className="bg-white rounded-lg shadow px-6 py-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Vacancy Stats</h3>
        
        <div className="flex items-center space-x-4">
          {/* Toggle Switches */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Applications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showApplications}
                onChange={() => setShowApplications(!showApplications)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Interviews</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showInterviews}
                onChange={() => setShowInterviews(!showInterviews)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          
          {/* Time Range Buttons */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${timeRange === range ? 'bg-[#003983] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Enhanced Chart with Wavier Lines */}
      <div className="flex-1" style={{ minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={smoothData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            {/* Light Gray Reference Lines */}
            <CartesianGrid 
              stroke="#f3f4f6" 
              strokeDasharray="0" 
              horizontal={true} 
              vertical={false}
            />
            
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => value.includes('_') ? '' : value} // Only show original time points
            />
            <YAxis 
              axisLine={false}
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                background: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            {showApplications && (
              <Area 
                type="monotone" 
                dataKey="applications" 
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorApplications)" 
                dot={false}
                activeDot={{ r: 6 }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {showInterviews && (
              <Area 
                type="monotone" 
                dataKey="interviews" 
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInterviews)" 
                dot={false}
                activeDot={{ r: 6 }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VacancyStats;