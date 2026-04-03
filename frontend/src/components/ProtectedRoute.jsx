import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to login with error message for insufficient permissions
    return <Navigate to="/login" state={{ error: `Access denied. Required role: ${allowedRoles.join(', ')}` }} replace />;
  }

  return children;
};

export default ProtectedRoute;
