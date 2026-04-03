import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import bookingService from '../services/bookingService';
import Loading from '../components/Loading';

const UserBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBookings();

    // Check for success message from redirect
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [packageBookings, guideBookingData, hotelBookingData] = await Promise.all([
        bookingService.getUserBookings(),
        bookingService.getUserGuideBookings(),
        bookingService.getUserHotelBookings()
      ]);

      setBookings(packageBookings.bookings || []);
      setGuideBookings(guideBookingData.bookings || []);
      setHotelBookings(hotelBookingData.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, bookingType = 'package') => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        if (bookingType === 'guide') {
          await bookingService.cancelGuideBooking(bookingId);
        } else if (bookingType === 'hotel') {
          await bookingService.cancelHotelBooking(bookingId);
        } else {
          await bookingService.cancelPackageBooking(bookingId);
        }
        alert('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
      } catch (error) {
        alert(error.response?.data?.message || 'Error cancelling booking');
      }
    }
  };

  const allBookings = [
    ...bookings.map(booking => ({ ...booking, type: 'package' })),
    ...guideBookings.map(booking => ({ ...booking, type: 'guide' })),
    ...hotelBookings.map(booking => ({ ...booking, type: 'hotel' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredBookings = allBookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'packages') return booking.type === 'package';
    if (activeTab === 'guides') return booking.type === 'guide';
    if (activeTab === 'hotels') return booking.type === 'hotel';
    if (activeTab === 'upcoming') {
      if (booking.type === 'hotel') {
        return new Date(booking.checkInDate) >= new Date() && booking.status === 'confirmed';
      }
      return new Date(booking.date) >= new Date() && booking.status === 'confirmed';
    }
    if (activeTab === 'pending') return booking.status === 'pending';
    if (activeTab === 'completed') {
      if (booking.type === 'hotel') {
        return booking.status === 'completed' || new Date(booking.checkOutDate) < new Date();
      }
      return booking.status === 'completed' || new Date(booking.date) < new Date();
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-xl text-gray-600">
            Manage your travel bookings and guide reservations.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'All Bookings', count: allBookings.length },
              { key: 'packages', label: 'Travel Packages', count: bookings.length },
              { key: 'guides', label: 'Guide Bookings', count: guideBookings.length },
              { key: 'hotels', label: 'Hotel Bookings', count: hotelBookings.length },
              { key: 'upcoming', label: 'Upcoming', count: allBookings.filter(b => {
                if (b.type === 'hotel') return new Date(b.checkInDate) >= new Date() && b.status === 'confirmed';
                return new Date(b.date) >= new Date() && b.status === 'confirmed';
              }).length },
              { key: 'pending', label: 'Pending', count: allBookings.filter(b => b.status === 'pending').length },
              { key: 'completed', label: 'Past', count: allBookings.filter(b => {
                if (b.type === 'hotel') return b.status === 'completed' || new Date(b.checkOutDate) < new Date();
                return b.status === 'completed' || new Date(b.date) < new Date();
              }).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'all' ? '📅' : activeTab === 'packages' ? '🎒' : activeTab === 'guides' ? '🗺️' : activeTab === 'hotels' ? '🏨' : '📅'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {activeTab === 'all' ? 'No bookings yet' :
                 activeTab === 'packages' ? 'No package bookings' :
                 activeTab === 'guides' ? 'No guide bookings' :
                 activeTab === 'hotels' ? 'No hotel bookings' :
                 activeTab === 'upcoming' ? 'No upcoming trips' :
                 activeTab === 'pending' ? 'No pending bookings' :
                 'No past bookings'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'all' ? 'Start planning your next adventure!' :
                 activeTab === 'packages' ? 'Browse our travel packages.' :
                 activeTab === 'guides' ? 'Find a local guide for your trip.' :
                 activeTab === 'hotels' ? 'Book your perfect stay.' :
                 'Check back later.'}
              </p>
              {(activeTab === 'all' || activeTab === 'packages') && (
                <Link
                  to="/packages"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Packages
                </Link>
              )}
              {(activeTab === 'all' || activeTab === 'guides') && (
                <Link
                  to="/guides"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors ml-4"
                >
                  Browse Guides
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.type === 'package' ? 'bg-blue-100 text-blue-800' :
                              booking.type === 'guide' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {booking.type === 'package' ? 'Travel Package' :
                               booking.type === 'guide' ? 'Guide Booking' :
                               'Hotel Booking'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {booking.type === 'package'
                              ? booking.package?.name || 'Package Booking'
                              : booking.type === 'guide'
                              ? `Guide: ${booking.guide?.username || 'Unknown Guide'}`
                              : booking.hotel?.name || 'Hotel Booking'}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${booking.totalPrice || booking.price || 0}
                          </div>
                          {booking.type === 'guide' && (
                            <div className="text-sm text-gray-600">
                              {booking.duration} {booking.type === 'hourly' ? 'hour' : 'day'}{booking.duration > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                        <div>
                          <strong>
                            {booking.type === 'hotel' ? 'Check-in:' : 'Date:'}
                          </strong> {
                            booking.type === 'hotel'
                              ? new Date(booking.checkInDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : new Date(booking.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                          }
                        </div>
                        {/* Check-out date for hotels */}
                        {booking.type === 'hotel' && (
                          <div>
                            <strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                        {/* Location/Destination */}
                        {(booking.location || booking.hotel?.location || booking.package?.destinations?.[0]) && (
                          <div>
                            <strong>
                              {booking.type === 'hotel' ? 'Location:' : 'Destination:'}
                            </strong> {
                              booking.type === 'hotel'
                                ? booking.hotel?.location || 'Unknown Location'
                                : booking.location || booking.package?.destinations?.[0]?.name || 'Unknown Destination'
                            }
                          </div>
                        )}
                        {booking.package?.destinations?.[0] && booking.type !== 'hotel' && (
                          <div>
                            <strong>Destination:</strong> {booking.package.destinations[0].name}
                          </div>
                        )}
                        <div>
                          <strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <strong>Special Requests:</strong>
                          <p className="text-gray-700 mt-1">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                      {booking.status === 'confirmed' && (
                        (booking.type === 'hotel' && new Date(booking.checkInDate) >= new Date()) ||
                        (booking.type !== 'hotel' && new Date(booking.date) >= new Date())
                      ) && (
                        <button
                          onClick={() => handleCancelBooking(booking._id, booking.type)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {booking.type === 'package' && booking.package && (
                        <Link
                          to={`/packages/${booking.package._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                        >
                          View Package
                        </Link>
                      )}

                      {booking.type === 'guide' && booking.guide && (
                        <Link
                          to={`/guides/${booking.guide._id}`}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                        >
                          View Guide
                        </Link>
                      )}

                      {booking.type === 'hotel' && booking.hotel && (
                        <Link
                          to={`/hotels/${booking.hotel._id}`}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center"
                        >
                          View Hotel
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBookings;
