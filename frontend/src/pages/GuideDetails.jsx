import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import guideService from '../services/guideService';
import bookingService from '../services/bookingService';
import Loading from '../components/Loading';

const GuideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    duration: 1,
    type: 'hourly', // hourly or daily
    location: '',
    specialRequests: ''
  });

  useEffect(() => {
    fetchGuideDetails();
  }, [id]);

  const fetchGuideDetails = async () => {
    try {
      setLoading(true);
      const data = await guideService.getGuideById(id);
      setGuide(data.guide);
    } catch (error) {
      console.error('Error fetching guide details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePrice = () => {
    if (!guide?.guideProfile) return 0;
    const { hourlyRate, dailyRate } = guide.guideProfile;
    const { duration, type } = bookingData;

    if (type === 'hourly') {
      return hourlyRate * duration;
    } else {
      return dailyRate * duration;
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingPayload = {
        guideId: id,
        ...bookingData,
        totalPrice: calculatePrice()
      };

      await bookingService.createGuideBooking(bookingPayload);
      alert('Booking request sent successfully! The guide will respond soon.');
      setShowBookingForm(false);
      // Reset form
      setBookingData({
        date: '',
        duration: 1,
        type: 'hourly',
        location: '',
        specialRequests: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating booking');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Guide Not Found</h1>
          <p className="text-gray-600 mb-8">The guide you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/guides')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  const guideProfile = guide.guideProfile || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Guide Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {guide.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{guide.username}</h1>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-500 mr-2">
                    {'⭐'.repeat(Math.floor(guideProfile.rating || 0))}
                  </span>
                  <span className="text-gray-600">
                    {guideProfile.rating?.toFixed(1) || '0.0'} ({guideProfile.totalReviews || 0} reviews)
                  </span>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                  guideProfile.availability
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {guideProfile.availability ? 'Available' : 'Currently Unavailable'}
                </span>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                ${guideProfile.hourlyRate || 0}/hour
              </div>
              <div className="text-lg text-green-600 mb-4">
                ${guideProfile.dailyRate || 0}/day
              </div>
              <button
                onClick={() => setShowBookingForm(true)}
                disabled={!guideProfile.availability}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Book This Guide
              </button>
            </div>
          </div>
        </div>

        {/* Guide Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* About */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            {guideProfile.bio ? (
              <p className="text-gray-700 mb-6">{guideProfile.bio}</p>
            ) : (
              <p className="text-gray-500 mb-6">No bio available</p>
            )}

            <div className="space-y-3">
              {guideProfile.experience && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 w-24">Experience:</span>
                  <span className="text-gray-700">{guideProfile.experience} years</span>
                </div>
              )}

              {guideProfile.languages && guideProfile.languages.length > 0 && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-900 w-24">Languages:</span>
                  <span className="text-gray-700">{guideProfile.languages.join(', ')}</span>
                </div>
              )}

              <div className="flex items-center">
                <span className="font-medium text-gray-900 w-24">Member since:</span>
                <span className="text-gray-700">
                  {new Date(guide.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Specialties</h2>
            {guideProfile.specialties && guideProfile.specialties.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {guideProfile.specialties.map((specialty, idx) => (
                  <div key={idx} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-center">
                    {specialty}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specialties listed</p>
            )}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">Book {guide.username}</h3>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Type *
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingData.type}
                      onChange={handleBookingChange}
                    >
                      <option value="hourly">Hourly (${guideProfile.hourlyRate}/hour)</option>
                      <option value="daily">Daily (${guideProfile.dailyRate}/day)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration ({bookingData.type === 'hourly' ? 'hours' : 'days'}) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      required
                      min="1"
                      max={bookingData.type === 'hourly' ? '12' : '30'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingData.duration}
                      onChange={handleBookingChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g., Hotel lobby, Airport, Central Park"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingData.location}
                      onChange={handleBookingChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      rows="3"
                      placeholder="Any special requirements or preferences..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingData.specialRequests}
                      onChange={handleBookingChange}
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${calculatePrice()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {bookingData.duration} {bookingData.type === 'hourly' ? 'hour' : 'day'}{bookingData.duration > 1 ? 's' : ''} × ${bookingData.type === 'hourly' ? guideProfile.hourlyRate : guideProfile.dailyRate}
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Booking Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideDetails;