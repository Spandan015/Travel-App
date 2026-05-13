import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, DollarSign, Star,
  MessageSquare, User, Bell, LogOut, Menu, X,
  ChevronRight, MapPin, Settings, ChevronDown,
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

// Resolve relative backend image paths to full URLs
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE}${url}`;
};

function Avatar({ user, size = 40, fontSize = 16 }) {
  const img = getImageUrl(user?.profileImage || user?.guideProfile?.profileImage);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#16a34a,#4ade80)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, color: '#fff', fontWeight: 700,
      overflow: 'hidden', flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.15)',
    }}>
      {img
        ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }} />
        : (user?.firstName?.[0] || user?.username?.[0] || 'G').toUpperCase()
      }
    </div>
  );
}

export default function GuideDashboard() {
  const { user, logout }   = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [notifCount, setNotifCount]     = useState(0);
  const [msgCount,   setMsgCount]       = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!profileMenuOpen) return;
    const close = () => setProfileMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [profileMenuOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const currentLabel =
    NAV.find((n) => location.pathname.startsWith(n.to))?.label ||
    (location.pathname.includes('notifications') ? 'Notifications' : 'Dashboard');

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Guide';
  const initials = (user?.firstName?.[0] || user?.username?.[0] || 'G').toUpperCase();

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#f4f7f4', fontFamily: "'Roboto', sans-serif",
    }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }}
        />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'linear-gradient(180deg,#071a0f 0%,#0a2818 50%,#0d3320 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        boxShadow: '4px 0 32px rgba(0,0,0,0.25)',
        transition: 'transform 0.28s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }}>

        {/* ── Brand header ── */}
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(0,0,0,0.15)',
        }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#16a34a,#4ade80)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
            }}>🏔</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em' }}>
                GuidePortal
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Nepal Travel
              </div>
            </div>
          </div>

          {/* Guide card */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Avatar user={user} size={38} fontSize={15} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                color: '#fff', fontWeight: 700, fontSize: 13,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {fullName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#4ade80', display: 'inline-block',
                  boxShadow: '0 0 6px #4ade80',
                }} />
                <span style={{ color: '#4ade80', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
                  VERIFIED GUIDE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav links ── */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
            Menu
          </div>
          {NAV.map(({ to, icon: Icon, label }) => {
            const badge = label === 'Messages' ? msgCount : 0;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: isActive ? 'rgba(22,163,74,0.25)' : 'transparent',
                  color:      isActive ? '#4ade80' : 'rgba(255,255,255,0.65)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13.5,
                  borderLeft: isActive ? '3px solid #4ade80' : '3px solid transparent',
                  paddingLeft: isActive ? 9 : 12,
                })}
              >
                <Icon size={16} />
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

        {/* ── Bottom: notifications + logout ── */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <NavLink
            to="/guide/notifications"
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, marginBottom: 6,
              textDecoration: 'none',
              color:      isActive ? '#4ade80' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'rgba(22,163,74,0.25)' : 'transparent',
              fontSize: 13.5, fontWeight: 500,
              borderLeft: isActive ? '3px solid #4ade80' : '3px solid transparent',
              paddingLeft: isActive ? 9 : 12,
            })}
          >
            <Bell size={16} />
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
              width: '100%', padding: '9px 12px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ══ */}
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

          {/* Right: bell + profile dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Notification bell */}
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

            {/* ── Profile dropdown ── */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setProfileMenuOpen((v) => !v); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: profileMenuOpen ? '#f0fdf4' : 'transparent',
                  border: profileMenuOpen ? '1px solid #86efac' : '1px solid transparent',
                  borderRadius: 10, padding: '5px 10px 5px 5px',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!profileMenuOpen) e.currentTarget.style.background = '#f8faf8'; }}
                onMouseLeave={(e) => { if (!profileMenuOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Small avatar for topbar (non-sidebar style) */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#16a34a,#4ade80)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  overflow: 'hidden',
                }}>
                  {user?.profileImage || user?.guideProfile?.profileImage
                    ? <img
                        src={getImageUrl(user.profileImage || user.guideProfile?.profileImage)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    : initials
                  }
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2818', lineHeight: 1.2 }}>
                    {user?.firstName || user?.username}
                  </div>
                  <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>Verified Guide</div>
                </div>
                <ChevronDown size={14} color="#6b7280" style={{ transition: 'transform 0.15s', transform: profileMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {/* Dropdown menu */}
              {profileMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#fff', borderRadius: 14, minWidth: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e5f0e8', overflow: 'hidden', zIndex: 100,
                  }}
                >
                  {/* Profile summary at top of dropdown */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0fdf4', background: '#f8faf8' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2818' }}>{fullName}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{user?.email}</div>
                  </div>

                  {[
                    { icon: <User size={15} />,     label: 'Edit Profile',     to: '/guide/profile-edit' },
                    { icon: <Settings size={15} />, label: 'Availability',     to: '/guide/availability' },
                    { icon: <Bell size={15} />,     label: 'Notifications',    to: '/guide/notifications' },
                  ].map(({ icon, label, to }) => (
                    <button
                      key={to}
                      onClick={() => { navigate(to); setProfileMenuOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 16px',
                        background: 'none', border: 'none',
                        color: '#374151', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'inherit',
                        textAlign: 'left', transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span style={{ color: '#16a34a' }}>{icon}</span>
                      {label}
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid #f0fdf4' }}>
                    <button
                      onClick={() => { handleLogout(); setProfileMenuOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 16px',
                        background: 'none', border: 'none',
                        color: '#ef4444', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', minHeight: 0 }}>
          <Routes>
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
            <Route path="*"                  element={<Navigate to="/guide/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .guide-hamburger { display: flex !important; }
          aside { transform: translateX(-100%) !important; }
          div[style*="marginLeft: 240px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
