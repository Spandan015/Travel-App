import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Compass, MessageSquare,
  LogOut, User, ChevronDown, Menu, X, Wallet,
  Map, ArrowLeftRight, Info, UserPlus, Bell,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import UserProfileModal from './UserProfileModal';

const AUTH_ROUTES = ['/login', '/register', '/register-admin', '/apply-guide', '/admin-login', '/admin/login'];

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE}${url}`;
};

function Navbar() {
  const { user, isAuthenticated, isAdmin, isGuide, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [toolsOpen,     setToolsOpen]     = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const profileRef = useRef(null);
  const toolsRef   = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setToolsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (toolsRef.current   && !toolsRef.current.contains(e.target))   setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (AUTH_ROUTES.includes(location.pathname)) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  const isHome      = location.pathname === '/';
  const transparent = isHome && !scrolled && !menuOpen;
  const isRegularUser = isAuthenticated && user && !isAdmin && !isGuide;

  const navLinks = [
    { label: 'Hotels',       to: '/browse-hotels'       },
    { label: 'Packages',     to: '/browse-packages'     },
    { label: 'Guides',       to: '/browse-guides'       },
    { label: 'Trekkings',    to: '/browse-destinations' },
    { label: 'Destinations', to: '/browse-places'       },
  ];

  const toolLinks = [
    { label: 'Budget Planner',     to: '/budget-planner',     icon: Wallet       },
    { label: 'Itinerary Planner',  to: '/itinerary-planner',  icon: Map          },
    { label: 'Currency Exchanger', to: '/currency-exchanger', icon: ArrowLeftRight },
  ];

  const getDashboardLink  = () => isAdmin ? '/admin/dashboard'  : isGuide ? '/guide/dashboard'  : '/';
  const getDashboardLabel = () => isAdmin ? 'Admin Dashboard'   : isGuide ? 'Guide Dashboard'   : 'Home';

  // Profile image for navbar avatar
  const profileImg = getImageUrl(user?.profileImage || '');
  const initials   = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: background 0.3s, box-shadow 0.3s;
          font-family: 'Roboto', sans-serif;
        }
        .navbar.transparent { background: transparent; box-shadow: none; }
        .navbar.solid { background: rgba(255,255,255,0.97); box-shadow: 0 1px 0 #e2e8f0; backdrop-filter: blur(12px); }
        .nav-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px 0 16px;
          height: 68px; display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .nav-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#16a34a,#15803d); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .nav-logo-text { display: flex; flex-direction: column; line-height: 1.1; }
        .nav-logo-name { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; color: #0f172a; transition: color 0.3s; }
        .navbar.transparent .nav-logo-name { color: #fff; }
        .nav-logo-sub { font-size: 10px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: #64748b; transition: color 0.3s; }
        .navbar.transparent .nav-logo-sub { color: rgba(255,255,255,0.65); }
        .nav-links { display: flex; align-items: center; gap: 2px; }
        @media(max-width:900px){ .nav-links { display: none; } }
        .nav-link { padding: 8px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none; transition: background 0.2s, color 0.2s; color: #374151; }
        .navbar.transparent .nav-link { color: rgba(255,255,255,0.9); }
        .nav-link:hover { background: rgba(0,0,0,0.06); }
        .navbar.transparent .nav-link:hover { background: rgba(255,255,255,0.12); }
        .nav-link.active { color: #16a34a; font-weight: 600; }
        .navbar.transparent .nav-link.active { color: #fff; background: rgba(255,255,255,0.15); }
        .nav-tools-wrap { position: relative; }
        .nav-tools-btn { display: flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; background: none; cursor: pointer; color: #374151; font-family: 'Roboto', sans-serif; transition: background 0.2s; }
        .navbar.transparent .nav-tools-btn { color: rgba(255,255,255,0.9); }
        .nav-tools-btn:hover { background: rgba(0,0,0,0.06); }
        .navbar.transparent .nav-tools-btn:hover { background: rgba(255,255,255,0.12); }
        .nav-chevron { transition: transform 0.2s; display: inline-flex; }
        .nav-chevron.open { transform: rotate(180deg); }
        .nav-dropdown { position: absolute; top: calc(100% + 8px); left: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 8px; min-width: 200px; }
        .nav-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; color: #374151; transition: background 0.15s; }
        .nav-dropdown-item:hover { background: #f1f5f9; }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        @media(max-width:900px){ .nav-sign-in, .nav-get-started { display: none !important; } }
        .nav-sign-in { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; color: #374151; }
        .navbar.transparent .nav-sign-in { color: #fff; }
        .nav-get-started { padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; background: #16a34a; color: #fff; transition: background 0.2s; }
        .navbar.transparent .nav-get-started { background: rgba(255,255,255,0.18); border: 1.5px solid rgba(255,255,255,0.4); }
        .nav-get-started:hover { background: #15803d; }
        .nav-profile-wrap { position: relative; }
        .nav-profile-btn { display: flex; align-items: center; gap: 8px; padding: 5px 10px 5px 5px; border-radius: 24px; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; font-family: 'Roboto', sans-serif; transition: border-color 0.2s; }
        .nav-profile-btn:hover { border-color: #16a34a; }
        .nav-profile-name { font-size: 13px; font-weight: 600; color: #374151; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nav-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg,#16a34a,#15803d); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; }
        .nav-profile-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 8px; min-width: 230px; z-index: 1050; }
        .nav-profile-header { padding: 10px 12px 12px; border-bottom: 1px solid #f1f5f9; margin-bottom: 6px; }
        .nav-profile-full-name { font-size: 14px; font-weight: 700; color: #0f172a; }
        .nav-profile-email { font-size: 12px; color: #64748b; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nav-profile-role { display: inline-block; margin-top: 6px; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #16a34a; }
        .nav-profile-role.admin { background: #ede9fe; color: #6d28d9; }
        .nav-profile-role.guide { background: #d1fae5; color: #065f46; }
        .nav-profile-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; color: #374151; transition: background 0.15s; width: 100%; box-sizing: border-box; }
        .nav-profile-link:hover { background: #f0fdf4; color: #16a34a; }
        .nav-profile-btn-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #374151; background: none; border: none; cursor: pointer; font-family: 'Roboto', sans-serif; width: 100%; text-align: left; transition: background 0.15s; }
        .nav-profile-btn-link:hover { background: #f0fdf4; color: #16a34a; }
        .nav-profile-divider { height: 1px; background: #f1f5f9; margin: 6px 0; }
        .nav-logout-btn { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #ef4444; background: none; border: none; cursor: pointer; width: 100%; text-align: left; font-family: 'Roboto', sans-serif; transition: background 0.15s; }
        .nav-logout-btn:hover { background: #fef2f2; }
        .nav-hamburger { display: none; flex-direction: column; justify-content: center; gap: 5px; width: 36px; height: 36px; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; }
        @media(max-width:900px){ .nav-hamburger { display: flex; } }
        .hamburger-line { width: 20px; height: 2px; border-radius: 1px; background: #374151; transition: transform 0.25s, opacity 0.2s; }
        .navbar.transparent .hamburger-line { background: #fff; }
        .hamburger-line.l1.open { transform: translateY(7px) rotate(45deg); }
        .hamburger-line.l2.open { opacity: 0; }
        .hamburger-line.l3.open { transform: translateY(-7px) rotate(-45deg); }
        .nav-mobile { display: none; position: fixed; top: 68px; left: 0; right: 0; bottom: 0; background: #fff; z-index: 999; overflow-y: auto; padding: 16px; flex-direction: column; gap: 4px; }
        .nav-mobile.open { display: flex; }
        .mobile-link { display: flex; align-items: center; gap: 10px; padding: 13px 16px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 500; color: #374151; transition: background 0.15s; }
        .mobile-link:hover, .mobile-link.active { background: #f0fdf4; color: #16a34a; }
        .mobile-divider { height: 1px; background: #f1f5f9; margin: 8px 0; }
        .mobile-section-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 16px 2px; }
        .mobile-auth-btns { display: flex; flex-direction: column; gap: 10px; padding: 12px 0; }
        .mobile-btn-signin { display: block; text-align: center; padding: 13px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 15px; font-weight: 600; color: #374151; text-decoration: none; }
        .mobile-btn-start { display: block; text-align: center; padding: 13px; background: #16a34a; border-radius: 10px; font-size: 15px; font-weight: 700; color: #fff; text-decoration: none; }
        .mobile-btn-link { display: flex; align-items: center; gap: 10px; padding: 13px 16px; border-radius: 10px; font-size: 15px; font-weight: 500; color: #374151; background: none; border: none; cursor: pointer; font-family: 'Roboto', sans-serif; width: 100%; text-align: left; transition: background 0.15s; }
        .mobile-btn-link:hover { background: #f0fdf4; color: #16a34a; }
      `}</style>

      <nav className={`navbar ${transparent ? 'transparent' : 'solid'}`}>
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🏔</div>
            <div className="nav-logo-text">
              <span className="nav-logo-name">My Travel Buddy</span>
              <span className="nav-logo-sub">Explore Nepal</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`nav-link${location.pathname === link.to ? ' active' : ''}`}>
                {link.label}
              </Link>
            ))}

            {/* Tools dropdown */}
            <div className="nav-tools-wrap" ref={toolsRef}>
              <button className="nav-tools-btn" onClick={() => setToolsOpen(v => !v)}>
                Tools
                <span className={`nav-chevron${toolsOpen ? ' open' : ''}`}>
                  <ChevronDown size={14} />
                </span>
              </button>
              {toolsOpen && (
                <div className="nav-dropdown">
                  {toolLinks.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} className="nav-dropdown-item" onClick={() => setToolsOpen(false)}>
                      <Icon size={16} color="#16a34a" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about" className={`nav-link${location.pathname === '/about' ? ' active' : ''}`}>About</Link>
          </div>

          {/* Right side */}
          <div className="nav-right">
            {isAuthenticated && user ? (
              <div className="nav-profile-wrap" ref={profileRef}>
                <button className="nav-profile-btn" onClick={() => setProfileOpen(v => !v)}>
                  <span className="nav-profile-name">{user.firstName || user.username || 'Account'}</span>
                  <div className="nav-avatar">
                    {profileImg
                      ? <img src={profileImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      : initials
                    }
                  </div>
                </button>

                {profileOpen && (
                  <div className="nav-profile-dropdown">
                    {/* Header */}
                    <div className="nav-profile-header">
                      <div className="nav-profile-full-name">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                      </div>
                      <div className="nav-profile-email">{user.email}</div>
                      <span className={`nav-profile-role ${user.role}`}>
                        {user.role === 'hotel_owner' ? 'Hotel Owner' : user.role}
                      </span>
                    </div>

                    {/* Dashboard */}
                    <Link to={getDashboardLink()} className="nav-profile-link" onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard size={16} color="#16a34a" />
                      {getDashboardLabel()}
                    </Link>

                    {/* My Bookings
                    <Link to="/my-bookings" className="nav-profile-link" onClick={() => setProfileOpen(false)}>
                      <ShoppingBag size={16} color="#16a34a" />
                      My Bookings
                    </Link> */}

                    {/* My Guide Chats — regular users only */}
                    {isRegularUser && (
                      <Link to="/my-chats" className="nav-profile-link" onClick={() => setProfileOpen(false)}>
                        <MessageSquare size={16} color="#16a34a" />
                        My Guide Chats
                      </Link>
                    )}

                    {/* Apply as Guide — regular users only */}
                    {isRegularUser && (
                      <Link to="/apply-guide" className="nav-profile-link" onClick={() => setProfileOpen(false)}>
                        <Compass size={16} color="#16a34a" />
                        Apply as Guide
                      </Link>
                    )}

                    {/* /Edit Profile — opens modal */}
                    {/* <button
                      className="nav-profile-btn-link"
                      onClick={() => { setProfileOpen(false); setShowProfileModal(true); }}
                    >
                      <User size={16} color="#16a34a" />
                      Edit Profile
                    </button> */}

                    <div className="nav-profile-divider" />

                    {/* Sign out */}
                    <button className="nav-logout-btn" onClick={handleLogout}>
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"    className="nav-sign-in">Sign In</Link>
                <Link to="/register" className="nav-get-started">Get Started</Link>
              </>
            )}

            {/* Hamburger */}
            <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              <span className={`hamburger-line l1${menuOpen ? ' open' : ''}`} />
              <span className={`hamburger-line l2${menuOpen ? ' open' : ''}`} />
              <span className={`hamburger-line l3${menuOpen ? ' open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`nav-mobile${menuOpen ? ' open' : ''}`}>
        {navLinks.map(link => (
          <Link key={link.to} to={link.to} className={`mobile-link${location.pathname === link.to ? ' active' : ''}`}>
            {link.label}
          </Link>
        ))}
        <div className="mobile-divider" />
        <div className="mobile-section-label">Planning Tools</div>
        {toolLinks.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="mobile-link">
            <Icon size={16} color="#16a34a" /> {label}
          </Link>
        ))}
        <Link to="/about" className={`mobile-link${location.pathname === '/about' ? ' active' : ''}`}>
          <Info size={16} color="#16a34a" /> About
        </Link>
        <div className="mobile-divider" />
        {isAuthenticated && user ? (
          <>
            <Link to={getDashboardLink()} className="mobile-link">
              <LayoutDashboard size={16} color="#16a34a" /> {getDashboardLabel()}
            </Link>
            <Link to="/my-bookings" className="mobile-link">
              <ShoppingBag size={16} color="#16a34a" /> My Bookings
            </Link>
            {isRegularUser && (
              <Link to="/my-chats" className="mobile-link">
                <MessageSquare size={16} color="#16a34a" /> My Guide Chats
              </Link>
            )}
            {isRegularUser && (
              <Link to="/apply-guide" className="mobile-link">
                <Compass size={16} color="#16a34a" /> Apply as Guide
              </Link>
            )}
            <button className="mobile-btn-link" onClick={() => { setMenuOpen(false); setShowProfileModal(true); }}>
              <User size={16} color="#16a34a" /> Edit Profile
            </button>
            <div className="mobile-divider" />
            <button className="nav-logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </>
        ) : (
          <div className="mobile-auth-btns">
            <Link to="/login"    className="mobile-btn-signin">Sign In</Link>
            <Link to="/register" className="mobile-btn-start">Get Started Free</Link>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
}

export default Navbar;
