import React, { useEffect, useState, useCallback } from "react";
import { parseISO, format } from "date-fns";
import { Clock, Edit, Trash2 } from "lucide-react";
import { fetchEvents, deleteEvent } from "../../api/event"; // adjust path if needed
import { toast } from "react-toastify";

const UpcomingEvents = ({ category = "upcoming" }) => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState(null);

  const getEventDateTime = (ev) => {
    if (!ev?.date) return null;
    const timePart = ev.time && ev.time.trim() ? ev.time : "00:00";
    const dateTimeString = `${ev.date}T${timePart}:00`;
    const parsed = parseISO(dateTimeString);
    return isNaN(parsed) ? null : parsed;
  };

  const fetchEventsByCategory = useCallback(async () => {
    setLoadingEvents(true);
    setErrorEvents(null);

    try {
      const data = await fetchEvents();
      console.log("📌 Raw events from API:", data);

      // Filter by category
      const filtered = data.filter((ev) => ev.category === category);

      // Sort by datetime
      filtered.sort((a, b) => {
        const aDate = getEventDateTime(a);
        const bDate = getEventDateTime(b);
        return aDate - bDate;
      });

      setEvents(filtered);
    } catch (err) {
      console.error("Error fetching events:", err);
      setErrorEvents("Failed to load events.");
      toast.error("Failed to load events.");
    } finally {
      setLoadingEvents(false);
    }
  }, [category]);

  useEffect(() => {
    fetchEventsByCategory();
  }, [fetchEventsByCategory]);

  const handleEdit = (id) => toast.info(`Edit event ${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(id);
      // Remove the deleted event from state
      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success("Event deleted successfully");
    } catch (err) {
      console.error("Failed to delete event", err);
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">
        {category.charAt(0).toUpperCase() + category.slice(1)} Events
      </h2>

      {loadingEvents && <p className="text-gray-500">Loading...</p>}
      {errorEvents && <p className="text-red-500">{errorEvents}</p>}

      {!loadingEvents && events.length === 0 && (
        <p className="text-gray-400">No {category} events.</p>
      )}

      <div className="space-y-2">
        {events.map((event) => {
          const start = getEventDateTime(event);
          return (
            <div
              key={event.id}
              className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-md flex justify-between items-start"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  <Clock size={14} className="inline-block mr-1" />
                  {start ? format(start, "hh:mm a") : "Invalid Time"} – {event.title}
                </p>
                <p className="text-xs text-gray-500">{event.location || "No location specified"}</p>
              </div>
              <div className="flex space-x-2 mt-1">
                <button
                  onClick={() => handleEdit(event.id)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingEvents;
