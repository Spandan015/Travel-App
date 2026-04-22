import axios from 'axios';

const API_BASE_URL = '/api';

// ✅ matches AuthContext.jsx which saves as 'nt_token'
const getToken = () => localStorage.getItem('nt_token');

class HotelBookingService {
  async createHotelBooking(bookingData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/hotel-bookings`, bookingData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating hotel booking:', error);
      throw error.response?.data || error.message;
    }
  }

  async getUserHotelBookings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotel-bookings/my`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user hotel bookings:', error);
      throw error.response?.data || error.message;
    }
  }

  async getHotelBookingById(bookingId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotel-bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hotel booking:', error);
      throw error.response?.data || error.message;
    }
  }

  async cancelHotelBooking(bookingId, cancellationReason = '') {
    try {
      const response = await axios.put(`${API_BASE_URL}/hotel-bookings/${bookingId}/cancel`, {
        cancellationReason
      }, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling hotel booking:', error);
      throw error.response?.data || error.message;
    }
  }
}

const hotelBookingService = new HotelBookingService();
export default hotelBookingService;