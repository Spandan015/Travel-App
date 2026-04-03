import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import Loading from '../components/Loading';

const GuideDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [availability, setAvailability] = useState({
    isAvailable: user?.guideProfile?.availability ?? true,
    schedule: {}, // Store availability schedule
    blockedDates: [] // Store blocked dates
  });
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    monthlyBreakdown: []
  });

  useEffect(() => {
    fetchGuideData();
  }, []);

  const fetchGuideData = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingRequests();
      setBookings(data.bookings || []);
      calculateEarnings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching guide data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = (bookingData) => {
    const completedBookings = bookingData.filter(booking => booking.status === 'completed');
    const confirmedBookings = bookingData.filter(booking => booking.status === 'confirmed');
    const pendingBookings = bookingData.filter(booking => booking.status === 'pending');

    const totalEarnings = completedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const pendingEarnings = confirmedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Calculate this month's earnings
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthEarnings = completedBookings
      .filter(booking => new Date(booking.updatedAt) >= thisMonth)
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    setEarnings({
      total: totalEarnings,
      thisMonth: thisMonthEarnings,
      pending: pendingEarnings
    });
  };

  const toggleAvailability = async () => {
    try {
      const newAvailability = !availability.isAvailable;
      setAvailability({ ...availability, isAvailable: newAvailability });

      // In a real implementation, this would update the backend
      // await guideService.updateAvailability(newAvailability);

      alert(`Availability ${newAvailability ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      alert('Error updating availability');
    }
  };

  const updateGuideProfile = async (updates) => {
    try {
      // This would call the guide service to update profile
      // await guideService.updateProfile(updates);
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    if (window.confirm('Accept this booking request?')) {
      try {
        await bookingService.acceptBooking(bookingId, 'Booking confirmed! Looking forward to meeting you.');
        alert('Booking accepted successfully');
        fetchGuideData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error accepting booking');
      }
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await bookingService.rejectBooking(bookingId, reason || 'Not available at this time.');
      alert('Booking rejected');
      fetchGuideData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting booking');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (window.confirm('Mark this booking as completed?')) {
      try {
        await bookingService.completeBooking(bookingId);
        alert('Booking marked as completed');
        fetchGuideData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error completing booking');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');

  const totalEarnings = completedBookings.reduce((total, booking) => total + (booking.totalPrice || booking.price), 0);
  const upcomingBookings = confirmedBookings.filter(booking =>
    new Date(booking.date) >= new Date()
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}! 🗺️
          </h1>
          <p className="text-gray-600">
            Manage your bookings and grow your guiding business.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-900">{pendingBookings.length}</div>
            <div className="text-gray-600">Pending Requests</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</div>
            <div className="text-gray-600">Active Tours</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-green-600">${earnings.total}</div>
            <div className="text-gray-600">Total Earnings</div>
            <div className="text-sm text-gray-500">This month: ${earnings.thisMonth}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-gray-900">{user?.guideProfile?.rating?.toFixed(1) || '0.0'}</div>
            <div className="text-gray-600">Your Rating</div>
            <div className={`text-sm ${user?.guideProfile?.totalReviews > 0 ? 'text-gray-500' : 'text-gray-400'}`}>
              {user?.guideProfile?.totalReviews || 0} reviews
            </div>
          </div>
        </div>

        {/* Availability Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Guide Availability</h3>
              <p className="text-gray-600">Let travelers know when you're available for bookings</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                availability.isAvailable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {availability.isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  availability.isAvailable
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {availability.isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/guide/profile"
              className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg text-center transition-colors"
            >
              <div className="text-4xl mb-2">👤</div>
              <div className="font-bold text-gray-900">Update Profile</div>
              <div className="text-sm text-gray-600 mt-1">Manage your guide info</div>
            </Link>

            <Link
              to="/guide/requests"
              className="bg-yellow-50 hover:bg-yellow-100 p-6 rounded-lg text-center transition-colors"
            >
              <div className="text-4xl mb-2">📬</div>
              <div className="font-bold text-gray-900">Booking Requests</div>
              <div className="text-sm text-gray-600 mt-1">Review new requests</div>
            </Link>

            <Link
              to="/guide/bookings"
              className="bg-green-50 hover:bg-green-100 p-6 rounded-lg text-center transition-colors"
            >
              <div className="text-4xl mb-2">📅</div>
              <div className="font-bold text-gray-900">My Bookings</div>
              <div className="text-sm text-gray-600 mt-1">View all bookings</div>
            </Link>

            <Link
              to="/guide/availability"
              className="bg-purple-50 hover:bg-purple-100 p-6 rounded-lg text-center transition-colors"
            >
              <div className="text-4xl mb-2">🕐</div>
              <div className="font-bold text-gray-900">Availability</div>
              <div className="text-sm text-gray-600 mt-1">Set your schedule</div>
            </Link>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { key: 'overview', label: 'Overview', count: null },
                { key: 'requests', label: 'Booking Requests', count: pendingBookings.length },
                { key: 'confirmed', label: 'Active Tours', count: confirmedBookings.length },
                { key: 'upcoming', label: 'Upcoming Trips', count: upcomingBookings.length },
                { key: 'earnings', label: 'Earnings', count: null },
                { key: 'completed', label: 'Completed', count: completedBookings.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} {tab.count !== null && `(${tab.count})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Earnings Summary */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-800">${earnings.total}</p>
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">This Month</p>
                      <p className="text-2xl font-bold text-blue-800">${earnings.thisMonth}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Pending Payment</p>
                      <p className="text-2xl font-bold text-yellow-800">${earnings.pending}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={toggleAvailability}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          availability.isAvailable
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {availability.isAvailable ? '🔴 Go Offline' : '🟢 Go Online'}
                      </button>
                      <Link
                        to="/guide/profile"
                        className="block w-full py-2 px-4 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition-colors text-center"
                      >
                        👤 Update Profile
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Trips</h3>
                    {upcomingBookings.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingBookings.slice(0, 3).map((booking) => (
                          <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.user?.username || 'Client'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-green-600 font-semibold">
                              ${booking.totalPrice || booking.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No upcoming trips</p>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {completedBookings.slice(0, 3).map((booking) => (
                      <div key={booking._id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Completed tour with {booking.user?.username || 'Client'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.updatedAt).toLocaleDateString()} • Earned ${booking.totalPrice || booking.price}
                          </p>
                        </div>
                      </div>
                    ))}

                    {pendingBookings.slice(0, 2).map((booking) => (
                      <div key={booking._id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600">⏳</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            New booking request from {booking.user?.username || 'Client'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {completedBookings.length === 0 && pendingBookings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Earnings Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Earnings</span>
                        <span className="text-2xl font-bold text-green-600">${earnings.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">This Month</span>
                        <span className="text-xl font-semibold text-blue-600">${earnings.thisMonth}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending Payment</span>
                        <span className="text-xl font-semibold text-yellow-600">${earnings.pending}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed Tours</span>
                        <span className="text-lg font-medium">{completedBookings.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Hourly Rate</p>
                        <p className="text-lg font-semibold">${user?.guideProfile?.hourlyRate || 0}/hour</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Daily Rate</p>
                        <p className="text-lg font-semibold">${user?.guideProfile?.dailyRate || 0}/day</p>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 Tip: Update your rates regularly based on demand and your experience level.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Earnings</h3>
                  {completedBookings.length > 0 ? (
                    <div className="space-y-3">
                      {completedBookings.slice(0, 10).map((booking) => (
                        <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              Tour with {booking.user?.username || 'Client'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.updatedAt).toLocaleDateString()} • {booking.location || 'Location'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +${booking.totalPrice || booking.price}
                            </p>
                            <span className="text-xs text-gray-500">Completed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">💰</div>
                      <p>No earnings yet. Complete some tours to see your earnings here!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Booking Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📬</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-600">
                      New booking requests will appear here for your review.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingBookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Booking Request from {booking.user?.username || 'Unknown User'}
                            </h3>
                            <div className="text-gray-600 space-y-1">
                              <p>📅 {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                              <p>📍 {booking.location || 'Location not specified'}</p>
                              <p>⏱️ {booking.duration} {booking.type === 'hourly' ? 'hour' : 'day'}{booking.duration > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              ${booking.totalPrice || booking.price}
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                              Pending
                            </span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <strong>Special Requests:</strong>
                            <p className="text-gray-700 mt-1">{booking.specialRequests}</p>
                          </div>
                        )}

                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleAcceptBooking(booking._id)}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Accept Booking
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking._id)}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Confirmed Bookings Tab */}
            {activeTab === 'confirmed' && (
              <div>
                {confirmedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No confirmed bookings</h3>
                    <p className="text-gray-600">
                      Accepted booking requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {confirmedBookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Confirmed: {booking.user?.username || 'Unknown User'}
                            </h3>
                            <div className="text-gray-600 space-y-1">
                              <p>📅 {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                              <p>📍 {booking.location || 'Location not specified'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              ${booking.totalPrice || booking.price}
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              Confirmed
                            </span>
                          </div>
                        </div>

                        {new Date(booking.date) >= new Date() ? (
                          <button
                            onClick={() => handleCompleteBooking(booking._id)}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Mark as Completed
                          </button>
                        ) : (
                          <span className="text-gray-500">Booking completed</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Trips Tab */}
            {activeTab === 'upcoming' && (
              <div>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming trips</h3>
                    <p className="text-gray-600">
                      Your upcoming confirmed bookings will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingBookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Trip with {booking.user?.username || 'Unknown User'}
                            </h3>
                            <div className="text-gray-600 space-y-1">
                              <p>📅 {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                              <p>📍 {booking.location || 'Location not specified'}</p>
                              <p>⏱️ {booking.duration} {booking.type === 'hourly' ? 'hour' : 'day'}{booking.duration > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${booking.totalPrice || booking.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Tab */}
            {activeTab === 'completed' && (
              <div>
                {completedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No completed bookings yet</h3>
                    <p className="text-gray-600">
                      Your completed trips will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {completedBookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Completed: {booking.user?.username || 'Unknown User'}
                            </h3>
                            <div className="text-gray-600 space-y-1">
                              <p>📅 {new Date(booking.date).toLocaleDateString()}</p>
                              <p>📍 {booking.location || 'Location not specified'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              +${booking.totalPrice || booking.price}
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;

