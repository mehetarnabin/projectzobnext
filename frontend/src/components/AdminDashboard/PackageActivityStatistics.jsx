import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";
import adminApi from "../../api/AdminApi";

const EmployerActivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [showUsed, setShowUsed] = useState(true);
  const [showRemaining, setShowRemaining] = useState(true);

  // Simulated grouping based on timeRange
  const groupByTimeRange = (users) => {
    return users.map((u, i) => ({
      ...u,
      name:
        timeRange === "day"
          ? `Hour ${i + 1}`
          : timeRange === "week"
          ? `Day ${i + 1}`
          : `Week ${i + 1}`,
    }));
  };

  const fetchEmployerActivity = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.get("/admin/users-with-packages");
      const users = response.data;

      const mappedData = users.map((u) => ({
        name: u.name,
        posts_used: u.posts_used || 0,
        posts_remaining: u.posts_left || 0,
        total_posts: (u.posts_used || 0) + (u.posts_left || 0),
        total_packages: u.total_packages || 1, // default 1 if backend doesn't provide
        current_package_name: u.plan_name || "N/A",
        current_package_purchased_at: u.subscription_end_date || "-",
      }));

      const groupedData = groupByTimeRange(mappedData);

      // Sort by posts used
      groupedData.sort((a, b) => b.posts_used - a.posts_used);

      setChartData(groupedData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch employer activity.");
      toast.error("Failed to fetch employer activity.");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchEmployerActivity();
  }, [fetchEmployerActivity]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-sm">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.fill }}>
              {entry.dataKey === "posts_used" ? "Posts Used" : "Posts Remaining"}:{" "}
              <span className="font-bold">{entry.value}</span>
            </p>
          ))}
          <p>Total Posts: <span className="font-bold">{payload[0].payload.total_posts}</span></p>
          <p>Total Packages: <span className="font-bold">{payload[0].payload.total_packages}</span></p>
          <p>Current Package: <span className="font-bold">{payload[0].payload.current_package_name}</span></p>
          <p>Purchased At: <span className="font-bold">{payload[0].payload.current_package_purchased_at}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Employer Activity</h3>

        <div className="flex items-center space-x-4">
          {/* Toggle Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Posts Used</span>
            <input type="checkbox" checked={showUsed} onChange={() => setShowUsed(!showUsed)} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Posts Remaining</span>
            <input
              type="checkbox"
              checked={showRemaining}
              onChange={() => setShowRemaining(!showRemaining)}
            />
          </div>

          {/* Time Range Selection */}
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

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600">Loading chart...</div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-600">{error}</div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">No data</div>
      ) : (
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 50 }}>
              <CartesianGrid stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              {showUsed && <Bar dataKey="posts_used" fill="#3b82f6" name="Posts Used" />}
              {showRemaining && <Bar dataKey="posts_remaining" fill="#10b981" name="Posts Remaining" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EmployerActivityChart;
