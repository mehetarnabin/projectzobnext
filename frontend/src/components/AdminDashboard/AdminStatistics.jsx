import API_BASE_URL from "../../config";
import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const AdminStatistics = () => {
  const { token, user } = useAuth();
  const [showCompanies, setShowCompanies] = useState(true);
  const [showJobseekers, setShowJobseekers] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [chartData, setChartData] = useState([]);
  const [loadingChartData, setLoadingChartData] = useState(true);
  const [errorChartData, setErrorChartData] = useState(null);

  // Mock time buckets for display
  const timeBuckets = {
    day: ["9AM", "12PM", "3PM", "6PM", "9PM"],
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    month: ["Week 1", "Week 2", "Week 3", "Week 4"],
  };

  const fetchChartData = useCallback(async () => {
    if (!token || !user || user.role !== "admin") {
      setLoadingChartData(false);
      setErrorChartData("Unauthorized or not an admin.");
      return;
    }

    setLoadingChartData(true);
    setErrorChartData(null);

    try {
      // Fetch admin statistics (backend should return counts)
      const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! ${response.status}`);
      }

      const data = await response.json();
      const totalCompanies = data.counts?.companies || 0;
      const totalJobseekers = data.counts?.jobseekers || 0;

      // Distribute totals across buckets (mock, unless backend provides real timeseries)
      const buckets = timeBuckets[timeRange];
      const distributedData = buckets.map((label, index) => {
        return {
          name: label,
          companies: Math.round((totalCompanies / buckets.length) * (index + 1)),
          jobseekers: Math.round((totalJobseekers / buckets.length) * (index + 1)),
        };
      });

      setChartData(distributedData);
    } catch (err) {
      console.error("Error fetching admin statistics:", err);
      setErrorChartData(err.message || "Failed to load admin stats.");
      toast.error(
        "Failed to load admin statistics: " + (err.message || "Network error.")
      );
    } finally {
      setLoadingChartData(false);
    }
  }, [token, user, timeRange]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-sm">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.stroke }}>
              {entry.dataKey === "companies" ? "Companies" : "Jobseekers"}:{" "}
              <span className="font-bold">{entry.value}</span>
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
        <h3 className="text-lg font-semibold text-gray-800">
          Admin Statistics
        </h3>

        <div className="flex items-center space-x-4">
          {/* Companies toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Companies</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showCompanies}
                onChange={() => setShowCompanies(!showCompanies)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Jobseekers toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Jobseekers</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showJobseekers}
                onChange={() => setShowJobseekers(!showJobseekers)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Time range buttons */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {["day", "week", "month"].map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                  timeRange === range
                    ? "bg-[#003983] text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1" style={{ minHeight: "250px" }}>
        {loadingChartData ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            Loading chart data...
          </div>
        ) : errorChartData ? (
          <div className="flex items-center justify-center h-full text-red-600">
            Error: {errorChartData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorJobseekers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {showCompanies && (
                <Area
                  type="monotone"
                  dataKey="companies"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompanies)"
                  dot={false}
                  activeDot={{ r: 6 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {showJobseekers && (
                <Area
                  type="monotone"
                  dataKey="jobseekers"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorJobseekers)"
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

export default AdminStatistics;
