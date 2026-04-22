import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const tok = () => localStorage.getItem('nt_token');
const headers = () => ({ Authorization: `Bearer ${tok()}` });

const itineraryService = {
  // Generate preview (no save, no auth needed)
  generatePreview: (destination, days) =>
    axios.post(`${API}/itinerary/generate`, { destination, days })
      .then(r => r.data.plan),

  // Save itinerary (requires auth)
  create: (payload) =>
    axios.post(`${API}/itinerary`, payload, { headers: headers() })
      .then(r => r.data.itinerary),

  // Get all itineraries for current user
  getMyItineraries: (userId) =>
    axios.get(`${API}/itinerary/user/${userId}`, { headers: headers() })
      .then(r => r.data.itineraries),

  // Get single itinerary
  getOne: (id) =>
    axios.get(`${API}/itinerary/${id}`, { headers: headers() })
      .then(r => r.data.itinerary),

  // Update plan (after drag/add/delete)
  update: (id, payload) =>
    axios.put(`${API}/itinerary/${id}`, payload, { headers: headers() })
      .then(r => r.data.itinerary),

  // Delete
  delete: (id) =>
    axios.delete(`${API}/itinerary/${id}`, { headers: headers() }),
};

export default itineraryService;