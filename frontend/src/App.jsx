import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder pages (to be created)
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ComingSoon title="User Dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guides"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ComingSoon title="Browse Guides" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guides/:id"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ComingSoon title="Guide Details" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ComingSoon title="My Bookings" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply-guide"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ComingSoon title="Apply as Guide" />
                  </ProtectedRoute>
                }
              />
              
              {/* Guide Routes */}
              <Route
                path="/guide/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['guide']}>
                    <ComingSoon title="Guide Dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide/requests"
                element={
                  <ProtectedRoute allowedRoles={['guide']}>
                    <ComingSoon title="Booking Requests" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide/profile"
                element={
                  <ProtectedRoute allowedRoles={['guide']}>
                    <ComingSoon title="Guide Profile" />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ComingSoon title="Admin Dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ComingSoon title="Guide Applications" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/hotels"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ComingSoon title="Manage Hotels" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/packages"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ComingSoon title="Manage Packages" />
                  </ProtectedRoute>
                }
              />
              
              {/* Fallback */}
              <Route path="*" element={<ComingSoon title="Page Not Found" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
