import api from "./axios"; // your base axios config

// 🔹 Helper: build FormData for both text + file fields
const buildFormData = (eventData) => {
  const formData = new FormData();
  for (const key in eventData) {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      formData.append(key, eventData[key]);
    }
  }
  return formData;
};

// Get all events
export const fetchEvents = async () => {
  const response = await api.get("/events");
  return response.data;
};

export const createEvent = async (eventData) => {
  const formData = new FormData();
  for (const key in eventData) {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      formData.append(key, eventData[key]); // This will append the file correctly
    }
  }

  const response = await api.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Update event (supports image upload)
export const updateEvent = async (id, eventData) => {
  const formData = buildFormData(eventData);
  formData.append("_method", "PUT"); // Laravel method spoofing

  const response = await api.post(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Delete event
export const deleteEvent = async (id) => {
  return api.delete(`/events/${id}`);
};

// Share event via email
export const shareEvent = async (id, payload) => {
  // payload = { selectedTemplateId, recipientEmails, senderName, senderEmail, customMessage }
  const response = await api.post(`/events/${id}/share`, payload);
  return response.data;
};