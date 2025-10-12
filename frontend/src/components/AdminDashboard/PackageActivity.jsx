import React, { useEffect, useState } from "react";
import { FaUserTie, FaUser, FaBoxOpen, FaCalendarAlt } from "react-icons/fa";
import api from "../../api/AdminApi"; // adjust path if needed

const PackageActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("admin_Token"); // admin auth token
        const response = await api.get("/admin/users-with-packages", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedData = response.data.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan_name: user.plan_name,
          posts_left: user.posts_left,
          posts_used: user.posts_used,
          posts_allowed: user.posts_allowed,
          end_date: user.subscription_end_date,
          icon:
            user.role === "employer" ? (
              <FaUserTie className="text-blue-500" />
            ) : (
              <FaUser className="text-green-500" />
            ),
        }));

        setActivities(formattedData);
      } catch (error) {
        console.error("Error fetching package activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Package Purchases
        </h3>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Recent Package Purchases
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          See All
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No active packages found.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 mt-1 mr-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                  {activity.icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.name} ({activity.role})
                </p>
                <p className="text-xs text-gray-500 mb-1">{activity.email}</p>
                <p className="text-xs text-gray-600">
                  Purchased <strong>{activity.plan_name}</strong> plan
                </p>
                <p className="text-xs text-gray-500">
                  Posts used:{" "}
                  <span className="text-gray-800">
                    {activity.posts_used}/{activity.posts_allowed}
                  </span>{" "}
                  | Remaining:{" "}
                  <span className="text-green-600 font-semibold">
                    {activity.posts_left}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <FaCalendarAlt className="inline text-gray-400" />{" "}
                  {activity.end_date}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageActivity;
