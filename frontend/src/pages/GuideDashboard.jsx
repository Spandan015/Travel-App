import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, DollarSign, Star,
  MessageSquare, User, Bell, LogOut, Menu, X,
  ChevronRight, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import chatService from '../services/chatService';

// Sub-pages
import GuideOverview      from './guide/GuideOverview';
import GuideBookings      from './guide/GuideBookings';
import GuideEarnings      from './guide/GuideEarnings';
import GuideReviews       from './guide/GuideReviews';
import GuideChat          from './guide/GuideChat';
import GuideProfileEdit   from './guide/GuideProfileEdit';
import GuideAvailability  from './guide/GuideAvailability';
import GuideNotifications from './guide/GuideNotifications';

const NAV = [
  { to: '/guide/dashboard',    icon: LayoutDashboard, label: 'Overview'     },
  { to: '/guide/bookings',     icon: CalendarDays,    label: 'Bookings'     },
  { to: '/guide/earnings',     icon: DollarSign,      label: 'Earnings'     },
  { to: '/guide/reviews',      icon: Star,            label: 'Reviews'      },
  { to: '/guide/chat',         icon: MessageSquare,   label: 'Messages'     },
  { to: '/guide/availability', icon: MapPin,          label: 'Availability' },
  { to: '/guide/profile-edit', icon: User,            label: 'Profile'      },
];

export default function GuideDashboard() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount]   = useState(0);
  const [msgCount,   setMsgCount]     = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [n, m] = await Promise.all([
          notificationService.getUnreadCount(),
          chatService.getUnreadCount(),
        ]);
        setNotifCount(n.count || 0);
        setMsgCount(m.count   || 0);
      } catch {}
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 30000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const currentLabel =
    NAV.find((n) => location.pathname.startsWith(n.to))?.label ||
    (location.pathname.includes('notifications') ? 'Notifications' : 'Dashboard');

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#f8faf8', fontFamily: "'Roboto', sans-serif",
    }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 40,
          }}
        />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'linear-gradient(180deg,#0a2818 0%,#0d3320 60%,#1a4a2a 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
        transition: 'transform 0.28s ease',
      }}>

        {/* Brand + guide info */}
        <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg,#16a34a,#4ade80)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}>🏔</div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>GuidePortal</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0,
            }}>
              {user?.profileImage
                ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user?.firstName?.[0] || user?.username?.[0] || 'G').toUpperCase()
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName || user?.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 600 }}>Verified Guide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label }) => {
            const badge = label === 'Messages' ? msgCount : 0;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 3,
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: isActive ? 'rgba(22,163,74,0.28)' : 'transparent',
                  color:      isActive ? '#4ade80' : 'rgba(255,255,255,0.72)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  border: isActive ? '1px solid rgba(74,222,128,0.22)' : '1px solid transparent',
                })}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && (
                  <span style={{
                    background: '#ef4444', color: '#fff',
                    fontSize: 10, fontWeight: 800,
                    padding: '1px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center',
                  }}>
                    {badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Notifications + Logout */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <NavLink
            to="/guide/notifications"
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 6,
              textDecoration: 'none',
              color:      isActive ? '#4ade80' : 'rgba(255,255,255,0.72)',
              background: isActive ? 'rgba(22,163,74,0.28)' : 'transparent',
              fontSize: 14, fontWeight: 500,
              border: isActive ? '1px solid rgba(74,222,128,0.22)' : '1px solid transparent',
            })}
          >
            <Bell size={17} />
            <span style={{ flex: 1 }}>Notifications</span>
            {notifCount > 0 && (
              <span style={{ background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 20 }}>
                {notifCount}
              </span>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 12px', borderRadius: 10,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)',
              color: '#fca5a5', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN AREA ══════════ */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e5f0e8',
          padding: '0 24px', height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: '0 1px 8px rgba(22,163,74,0.06)',
        }}>

          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: 4, marginRight: 8,
            }}
            className="guide-hamburger"
          >
            {sidebarOpen ? <X size={22} color="#16a34a" /> : <Menu size={22} color="#16a34a" />}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13 }}>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>Guide</span>
            <ChevronRight size={14} />
            <span style={{ fontWeight: 700, color: '#0a2818' }}>{currentLabel}</span>
          </div>

          {/* Right: bell + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NavLink to="/guide/notifications" style={{ position: 'relative', color: '#6b7280', textDecoration: 'none', display: 'flex' }}>
              <Bell size={20} />
              {notifCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#ef4444', color: '#fff',
                  width: 16, height: 16, borderRadius: '50%',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </NavLink>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#16a34a', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, overflow: 'hidden',
              }}>
                {user?.profileImage
                  ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user?.firstName?.[0] || 'G').toUpperCase()
                }
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0a2818' }}>
                {user?.firstName || user?.username}
              </span>
            </div>
          </div>
        </header>

        {/* ✅ Page content — Routes are RELATIVE to /guide/* */}
        <main style={{ flex: 1, padding: '24px', minHeight: 0 }}>
          <Routes>
            {/* ✅ /guide  and /guide/dashboard both show Overview */}
            <Route index                     element={<GuideOverview />} />
            <Route path="dashboard"          element={<GuideOverview />} />
            <Route path="bookings"           element={<GuideBookings />} />
            <Route path="earnings"           element={<GuideEarnings />} />
            <Route path="reviews"            element={<GuideReviews />} />
            <Route path="chat"               element={<GuideChat />} />
            <Route path="chat/:bookingId"    element={<GuideChat />} />
            <Route path="availability"       element={<GuideAvailability />} />
            <Route path="profile-edit"       element={<GuideProfileEdit />} />
            <Route path="notifications"      element={<GuideNotifications />} />
            {/* Catch unknown /guide/xxx paths → redirect to dashboard */}
            <Route path="*"                  element={<Navigate to="/guide/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .guide-hamburger { display: flex !important; }
          aside { transform: translateX(-100%) !important; }
          aside.open { transform: translateX(0) !important; }
          div[style*="marginLeft: 240px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
