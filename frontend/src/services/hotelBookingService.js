import axios from 'axios';

const API_BASE_URL = '/api';

class HotelBookingService {
  // Create a new hotel booking
  async createHotelBooking(bookingData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/hotel-bookings`, bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating hotel booking:', error);
      throw error.response?.data || error.message;
    }
  }

  // Get user's hotel bookings
  async getUserHotelBookings() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/hotel-bookings/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user hotel bookings:', error);
      throw error.response?.data || error.message;
    }
  }

  // Get hotel booking by ID
  async getHotelBookingById(bookingId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/hotel-bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hotel booking:', error);
      throw error.response?.data || error.message;
    }
  }

  // Cancel hotel booking
  async cancelHotelBooking(bookingId, cancellationReason = '') {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/hotel-bookings/${bookingId}/cancel`, {
        cancellationReason
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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





