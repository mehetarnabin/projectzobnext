import { useState, useEffect } from "react";

export const useEvents = () => {
  const [events, setEvents] = useState([]);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) setEvents(JSON.parse(savedEvents));
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const createEvent = (eventData) => {
    const newEvent = {
      id: crypto.randomUUID(),
      ...eventData,
      status: "upcoming",
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (id, eventData) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...eventData, updatedAt: new Date().toISOString() } : event
      )
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const getEventById = (id) => events.find((event) => event.id === id);

  // Sort events by creation date (latest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { events: sortedEvents, createEvent, updateEvent, deleteEvent, getEventById };
};
