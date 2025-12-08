import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export const hotelsAPI = {
  list: () => api.get("/hotels"),
  get: (id) => api.get(`/hotels/${id}`), // backend route optional; frontend will handle if missing
  add: (hotel) => api.post("/hotels", hotel),
  remove: (id) => api.delete(`/hotels/${id}`),
};

export const guidesAPI = {
  list: () => api.get("/guides"),
  add: (guide) => api.post("/guides", guide),
  remove: (id) => api.delete(`/guides/${id}`),
};

export const bookingsAPI = {
  list: () => api.get("/bookings"),
  add: (booking) => api.post("/bookings", booking),
  get: (id) => api.get(`/bookings/${id}`),
  remove: (id) => api.delete(`/bookings/${id}`),
};

export default api;
