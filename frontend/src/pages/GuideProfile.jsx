import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import guideService from '../services/guideService';
import Loading from '../components/Loading';

const GuideProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.guideProfile?.bio || '',
    experience: user?.guideProfile?.experience || '',
    languages: user?.guideProfile?.languages?.join(', ') || '',
    specialties: user?.guideProfile?.specialties?.join(', ') || '',
    hourlyRate: user?.guideProfile?.hourlyRate || '',
    dailyRate: user?.guideProfile?.dailyRate || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
    availability: user?.guideProfile?.availability ?? true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        experience: Number(formData.experience),
        hourlyRate: Number(formData.hourlyRate),
        dailyRate: Number(formData.dailyRate),
        languages: formData.languages.split(',').map(lang => lang.trim()).filter(lang => lang),
        specialties: formData.specialties.split(',').map(spec => spec.trim()).filter(spec => spec)
      };

      await guideService.updateGuideProfile(updateData);

      // Update local user state
      setUser(prev => ({
        ...prev,
        phone: formData.phone,
        profileImage: formData.profileImage,
        guideProfile: {
          ...prev.guideProfile,
          ...updateData
        }
      }));

      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Guide Profile</h1>
          <p className="text-xl text-gray-600">
            Update your information to attract more clients and provide better service.
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About You *
              </label>
              <textarea
                name="bio"
                required
                rows="4"
                placeholder="Tell travelers about yourself, your passion for guiding, and what makes you special..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* Experience & Languages */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  required
                  min="0"
                  max="50"
                  placeholder="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages (comma-separated) *
                </label>
                <input
                  type="text"
                  name="languages"
                  required
                  placeholder="English, Spanish, French"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.languages}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties (comma-separated) *
              </label>
              <input
                type="text"
                name="specialties"
                required
                placeholder="Hiking, Cultural Tours, Food Tours, Photography, History"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.specialties}
                onChange={handleChange}
              />
            </div>

            {/* Rates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (USD) *
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  required
                  min="10"
                  max="500"
                  placeholder="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Rate (USD) *
                </label>
                <input
                  type="number"
                  name="dailyRate"
                  required
                  min="50"
                  max="2000"
                  placeholder="300"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.dailyRate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  name="profileImage"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.profileImage}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="availability"
                id="availability"
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.availability}
                onChange={handleChange}
              />
              <label htmlFor="availability" className="text-sm font-medium text-gray-700">
                Available for bookings
              </label>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? 'Updating Profile...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Stats & Info */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Current Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Rating:</span>
                <span className="font-bold">
                  {user?.guideProfile?.rating?.toFixed(1) || '0.0'} ⭐
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Reviews:</span>
                <span className="font-bold">
                  {user?.guideProfile?.totalReviews || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ${
                  user?.guideProfile?.isApproved ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {user?.guideProfile?.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Availability:</span>
                <span className={`font-bold ${
                  formData.availability ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Tips for Success</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">💡</span>
                <span>Write a compelling bio that highlights your unique experiences</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">📸</span>
                <span>Add a professional profile picture to build trust</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">⭐</span>
                <span>Respond quickly to booking requests to get better ratings</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">💰</span>
                <span>Set competitive rates based on your experience and location</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfile;

