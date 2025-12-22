import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ✈️ TravelApp
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            ) : (
              <>
                {user.role === 'user' && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link to="/guides" className="text-gray-700 hover:text-blue-600">
                      Browse Guides
                    </Link>
                    <Link to="/bookings" className="text-gray-700 hover:text-blue-600">
                      My Bookings
                    </Link>
                  </>
                )}

                {user.role === 'guide' && (
                  <>
                    <Link to="/guide/dashboard" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link to="/guide/requests" className="text-gray-700 hover:text-blue-600">
                      Booking Requests
                    </Link>
                    <Link to="/guide/profile" className="text-gray-700 hover:text-blue-600">
                      Profile
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link to="/admin/applications" className="text-gray-700 hover:text-blue-600">
                      Applications
                    </Link>
                    <Link to="/admin/hotels" className="text-gray-700 hover:text-blue-600">
                      Hotels
                    </Link>
                    <Link to="/admin/packages" className="text-gray-700 hover:text-blue-600">
                      Packages
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">👤 {user.username}</span>
                  <span className="badge badge-info">{user.role}</span>
                  <button onClick={handleLogout} className="btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
