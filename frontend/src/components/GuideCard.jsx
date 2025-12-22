import { Link } from 'react-router-dom';

const GuideCard = ({ guide }) => {
  return (
    <div className="card p-6 animate-fadeIn">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {guide.guideProfile?.profileImage ? (
            <img
              src={guide.guideProfile.profileImage}
              alt={guide.username}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
              👤
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{guide.username}</h3>
            {guide.guideProfile?.availability && (
              <span className="badge badge-success">Available</span>
            )}
          </div>

          <p className="text-gray-600 mt-2 line-clamp-2">
            {guide.guideProfile?.bio}
          </p>

          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>⭐ {guide.guideProfile?.rating || 0}/5</span>
            <span>💬 {guide.guideProfile?.totalReviews || 0} reviews</span>
            <span>📅 {guide.guideProfile?.experience || 0} years exp</span>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {guide.guideProfile?.languages?.map((lang, idx) => (
                <span key={idx} className="badge badge-info text-xs">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {guide.guideProfile?.specialties?.map((specialty, idx) => (
              <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {specialty}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-blue-600">
                ${guide.guideProfile?.hourlyRate}/hr
              </span>
              <span className="text-lg font-semibold text-blue-600">
                ${guide.guideProfile?.dailyRate}/day
              </span>
            </div>
            <Link
              to={`/guides/${guide._id}`}
              className="btn-primary"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;
