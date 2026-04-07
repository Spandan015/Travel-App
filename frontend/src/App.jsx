import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home               from './pages/Home';
import Login              from './pages/Login';
import Register           from './pages/Register';
import AdminLogin         from './pages/AdminLogin';
import GuideDashboard     from './pages/GuideDashboard';
import GuideProfile       from './pages/GuideProfile';
import BrowseGuides       from './pages/BrowseGuides';
import GuideDetails       from './pages/GuideDetails';
import RegisterAdmin      from './pages/RegisterAdmin';
import BrowsePackages     from './pages/BrowsePackages';
import BrowseHotels       from './pages/BrowseHotels';
import HotelDetail        from './pages/HotelDetail';
import PackageDetails     from './pages/PackageDetails';
import UserBookings       from './pages/UserBookings';
import ApplyGuide         from './pages/ApplyGuide';
import CurrencyExchanger  from './pages/CurrencyExchanger';
import ItineraryPlanner   from './pages/ItineraryPlanner';
import BudgetPlanner      from './pages/BudgetPlanner';
import About              from './pages/About';
import Contact            from './pages/Contact';
import Blog               from './pages/Blog';
import ComingSoon         from './pages/ComingSoon';
import BrowseDestinations from './pages/BrowseDestinations';
import RegionDetail       from './pages/RegionDetail';
import TrekDetail         from './pages/TrekDetail';
import AdminDashboard     from './pages/admin/AdminDashboard';
import ManageHotels       from './pages/admin/ManageHotels';
import ManagePackages     from './pages/admin/ManagePackages';
import ManageDestinations from './pages/admin/ManageDestinations';
import ManageRegions      from './pages/admin/ManageRegions';
import ManageTreks        from './pages/admin/ManageTreks';
import GuideApplications  from './pages/admin/GuideApplications';
import ManageUsers        from './pages/admin/ManageUsers';
import ManageBookings     from './pages/admin/ManageBookings';

import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

function AppContent() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');
  const isGuide  = location.pathname.startsWith('/guide');
  const hideFooter = isAdmin || isGuide;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdmin && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>

          {/* ── Public ── */}
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/admin/login"    element={<AdminLogin />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/about"          element={<About />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/blog"           element={<Blog />} />

          {/* ── Payment ── eSewa appends ?data=<base64> to these URLs */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />

          {/* ── Browse ── */}
          <Route path="/browse-hotels"       element={<BrowseHotels />} />
          <Route path="/browse-packages"     element={<BrowsePackages />} />
          <Route path="/browse-guides"       element={<BrowseGuides />} />
          <Route path="/hotels/:id"          element={<HotelDetail />} />
          <Route path="/packages/:id"        element={<PackageDetails />} />
          <Route path="/guides/:id"          element={<GuideDetails />} />

          {/* ── Destinations ── */}
          <Route path="/browse-destinations" element={<BrowseDestinations />} />
          <Route path="/destinations/:slug"  element={<RegionDetail />} />
          <Route path="/treks/:slug"         element={<TrekDetail />} />

          {/* ── Tools ── */}
          <Route path="/currency-exchanger"  element={<CurrencyExchanger />} />
          <Route path="/itinerary-planner"   element={<ItineraryPlanner />} />
          <Route path="/budget-planner"      element={<BudgetPlanner />} />

          {/* ── User (logged in) ── */}
          <Route path="/dashboard"   element={<ProtectedRoute allowedRoles={['user']}><Home /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['user']}><UserBookings /></ProtectedRoute>} />
          <Route path="/apply-guide" element={<ProtectedRoute allowedRoles={['user']}><ApplyGuide /></ProtectedRoute>} />

          {/* ── Guide ── */}
          <Route path="/guide/dashboard" element={<ProtectedRoute allowedRoles={['guide']}><GuideDashboard /></ProtectedRoute>} />
          <Route path="/guide/requests"  element={<ProtectedRoute allowedRoles={['guide']}><ComingSoon title="Booking Requests" /></ProtectedRoute>} />
          <Route path="/guide/profile"   element={<ProtectedRoute allowedRoles={['guide']}><GuideProfile /></ProtectedRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin/dashboard"    element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/hotels"       element={<ProtectedRoute allowedRoles={['admin']}><ManageHotels /></ProtectedRoute>} />
          <Route path="/admin/packages"     element={<ProtectedRoute allowedRoles={['admin']}><ManagePackages /></ProtectedRoute>} />
          <Route path="/admin/destinations" element={<ProtectedRoute allowedRoles={['admin']}><ManageDestinations /></ProtectedRoute>} />
          <Route path="/admin/regions"      element={<ProtectedRoute allowedRoles={['admin']}><ManageRegions /></ProtectedRoute>} />
          <Route path="/admin/treks"        element={<ProtectedRoute allowedRoles={['admin']}><ManageTreks /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><GuideApplications /></ProtectedRoute>} />
          <Route path="/admin/users"        element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/bookings"     element={<ProtectedRoute allowedRoles={['admin']}><ManageBookings /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />

        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router><AppContent /></Router>
    </AuthProvider>
  );
}
