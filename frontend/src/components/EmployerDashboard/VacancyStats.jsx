import API_BASE_URL from "../../config"; // Add this line
import React, { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext'; // Import useAuth for token and user
import { toast } from 'react-toastify'; // For notifications

// const API_BASE_URL = "http://10.120.30.250:8000/api";

const ActivityStatistics = () => {
  const { token, user } = useAuth();
  const [showPageVisited, setShowPageVisited] = useState(true);
  const [showApplied, setShowApplied] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState([]);
  const [loadingChartData, setLoadingChartData] = useState(true);
  const [errorChartData, setErrorChartData] = useState(null);

  // Static sample data for "Page Visited" (since no backend API for this yet)
  // This data will be combined with actual 'Applied' data from the backend
  const staticPageVisitedDataByRange = {
    day: [
      { name: '9AM', page_visited: 100 },
      { name: '12PM', page_visited: 250 },
      { name: '3PM', page_visited: 180 },
      { name: '6PM', page_visited: 120 },
      { name: '9PM', page_visited: 80 },
    ],
    week: [
      { name: 'Mon', page_visited: 500 },
      { name: 'Tue', page_visited: 750 },
      { name: 'Wed', page_visited: 600 },
      { name: 'Thu', page_visited: 820 },
      { name: 'Fri', page_visited: 450 },
      { name: 'Sat', page_visited: 300 },
      { name: 'Sun', page_visited: 200 },
    ],
    month: [
      { name: 'Week 1', page_visited: 2000 },
      { name: 'Week 2', page_visited: 2500 },
      { name: 'Week 3', page_visited: 1800 },
      { name: 'Week 4', page_visited: 2200 },
    ]
  };

  const fetchChartData = useCallback(async () => {
    if (!token || !user || user.role !== 'employer') {
      setLoadingChartData(false);
      setErrorChartData('Unauthorized or not an employer.');
      return;
    }

    setLoadingChartData(true);
    setErrorChartData(null);
    try {
      // Fetch total applicants (which we'll use as 'Applied' count for the chart)
      const response = await fetch(`${API_BASE_URL}/employer/applicant-counts`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const totalApplicants = data.counts.total_applicants; // Get total applicants

      // Combine static 'Page Visited' data with dynamic 'Applied' data
      // For simplicity, we'll assume 'Applied' is a single cumulative number for the period
      // In a real scenario, you'd need a backend API that returns 'applied' data over time.
      const baseData = staticPageVisitedDataByRange[timeRange];
      const combinedData = baseData.map((item, index) => {
        // Distribute total applicants across the time range for a more realistic graph
        // This is a simplified distribution; a real API would provide per-interval data.
        const appliedCount = Math.round(totalApplicants / baseData.length * (index + 1));
        return {
          ...item,
          applied: appliedCount // Use 'applied' as the dataKey for applications
        };
      });

      // Make the graph more wavy by adding intermediate points
      const smoothData = combinedData.map((item, index) => {
        const nextItem = combinedData[index + 1] || combinedData[index];
        return [
          { ...item, name: `${item.name}_start` },
          {
            name: `${item.name}_mid`,
            page_visited: Math.round((item.page_visited + nextItem.page_visited) / 2),
            applied: Math.round((item.applied + nextItem.applied) / 2)
          }
        ];
      }).flat();

      setChartData(smoothData);

    } catch (err) {
      console.error("Error fetching chart data:", err);
      setErrorChartData(err.message || "Failed to load chart data.");
      toast.error("Failed to load activity statistics: " + (err.message || "Network error."));
    } finally {
      setLoadingChartData(false);
    }
  }, [token, user, timeRange]); // Re-fetch if token, user, or timeRange changes

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Custom Tooltip content
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Filter out intermediate points for display
      if (label.includes('_')) return null;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-sm">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.stroke }}>
              {entry.dataKey === 'page_visited' ? 'Page Visited' : 'Applied'}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow px-6 py-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Activity Statistics</h3> {/* Changed title */}
        
        <div className="flex items-center space-x-4">
          {/* Toggle Switches */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Page Visited</span> {/* Changed label */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showPageVisited}
                onChange={() => setShowPageVisited(!showPageVisited)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Applied</span> {/* Changed label */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showApplied}
                onChange={() => setShowApplied(!showApplied)}
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
      
      {/* Chart */}
      <div className="flex-1" style={{ minHeight: '250px' }}>
        {loadingChartData ? (
          <div className="flex items-center justify-center h-full text-gray-600">Loading chart data...</div>
        ) : errorChartData ? (
          <div className="flex items-center justify-center h-full text-red-600">Error: {errorChartData}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPageVisited" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
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
                tickFormatter={(value) => value.includes('_') ? '' : value}
              />
              <YAxis 
                axisLine={false}
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} /> {/* Use custom tooltip */}
              
              {showPageVisited && (
                <Area 
                  type="monotone" 
                  dataKey="page_visited" // Changed dataKey
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPageVisited)" // Changed ID
                  dot={false}
                  activeDot={{ r: 6 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {showApplied && (
                <Area 
                  type="monotone" 
                  dataKey="applied" // Changed dataKey
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorApplied)" // Changed ID
                  dot={false}
                  activeDot={{ r: 6 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ActivityStatistics;
