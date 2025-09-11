import React, { useEffect, useState } from "react";
import Sidebar from "../components/EmployerDashboard/Sidebar"; 
import ProfileActivity from "../components/EmployerDashboard/ProfileActivity"; 
import { useAuth } from "../context/AuthContext";
import VacancyStats from "../components/EmployerDashboard/VacancyStats";

// NEW IMPORTS
import UpcomingEvents from "../components/EmployerDashboard/UpcomingEvents";
import LatestActivity from "../components/EmployerDashboard/LatestActivity";
import RecruitmentStats from "../components/EmployerDashboard/RecruitmentStats"; 
import { toast } from "react-toastify";
import { fetchEvents, deleteEvent } from "../api/event"; // <-- Make sure path is correct

const DashboardPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
        toast.error("Failed to fetch events");
      }
    };
    loadEvents();
  }, []);

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Failed to delete event", error);
      toast.error("Failed to delete event");
    }
  };

  if (!user) {
    return <div className="text-center py-8">Loading user data...</div>;
  }

  const isEmployer = user.role === "employer";

  return (
    <div className="outer-wrapper bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-4 flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pr-0">
            {isEmployer ? (
              <>
                <ProfileActivity />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <VacancyStats />
                  </div>
                  <div className="lg:col-span-1">
                    <UpcomingEvents
                      events={events}
                      category="upcoming"
                      onDeleteEvent={handleDeleteEvent}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <RecruitmentStats />
                  </div>
                  <div>
                    <LatestActivity />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-600">
                Welcome to your Dashboard! Content tailored for your role will appear here.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
