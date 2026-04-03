import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const tok = () => localStorage.getItem('nt_token');

// Icons
const IHome = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IPackage = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const ICompass = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const IUser = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IWallet = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>;
const ILogout = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IMenu = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IClose = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ISearch = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IBell = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IStar = () => <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IClock = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IRoute = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15"/><circle cx="18" cy="5" r="3"/></svg>;
const IBudget = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>;
const ICurrency = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IPin = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 018 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 018-8z"/></svg>;

const STATUS_CFG = {
  confirmed: { bg: '#dcfce7', color: '#15803d', dot: '#16a34a', label: 'Confirmed' },
  pending: { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04', label: 'Pending' },
  completed: { bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed', label: 'Completed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626', label: 'Cancelled' },
};

const Skel = ({ w = '100%', h = 16, r = 6 }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200%', animation: 'shimmer 1.4s infinite' }} />
);

export default function BookingDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('hotels');

  const [hotelBookings, setHotelBookings] = useState([]);
  const [pkgBookings, setPkgBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingBook, setLoadingBook] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingPkgs, setLoadingPkgs] = useState(true);

  const firstName = user?.firstName || user?.username?.split(' ')[0] || 'Traveler';
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'Traveler';
  const initials = ((user?.firstName?.[0] || user?.username?.[0] || 'T') + (user?.lastName?.[0] || '')).toUpperCase();

  useEffect(() => {
    const h = { Authorization: `Bearer ${tok()}` };
    axios.get(`${API}/hotel-bookings/my`, { headers: h }).then(r => setHotelBookings(r.data.bookings || r.data || [])).catch(() => setHotelBookings([])).finally(() => setLoadingBook(false));
    axios.get(`${API}/bookings/my`, { headers: h }).then(r => setPkgBookings(r.data.bookings || r.data || [])).catch(() => setPkgBookings([]));
    axios.get(`${API}/hotels`).then(r => setHotels((r.data.hotels || r.data || []).slice(0, 6))).catch(() => setHotels([])).finally(() => setLoadingHotels(false));
    axios.get(`${API}/packages`).then(r => setPackages((r.data.packages || r.data || []).slice(0, 6))).catch(() => setPackages([])).finally(() => setLoadingPkgs(false));
  }, []);

  const allBookings = [
    ...hotelBookings.map(b => ({ ...b, _type: 'hotel' })),
    ...pkgBookings.map(b => ({ ...b, _type: 'package' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const activeBookings = allBookings.filter(b => ['confirmed', 'pending'].includes(b.status?.toLowerCase())).length;
  const totalSpent = allBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const hotelCount = hotelBookings.length;
  const pkgCount = pkgBookings.length;

  const handleLogout = () => { logout(); navigate('/'); };
  const handleSearch = (e) => { e.preventDefault(); navigate(`/browse-${searchType}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`); };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API.replace('/api', '')}/uploads/${img}`;
  };

  const NAV = [
    { id: 'overview', label: 'Dashboard', icon: <IHome /> },
    { id: 'hotels', label: 'Browse Hotels', icon: <IHome />, href: '/browse-hotels' },
    { id: 'packages', label: 'Browse Packages', icon: <IPackage />, href: '/browse-packages' },
    { id: 'guides', label: 'Find Guides', icon: <ICompass />, href: '/browse-guides' },
    { id: 'bookings', label: 'My Bookings', icon: <IWallet /> },
    { id: 'profile', label: 'Profile', icon: <IUser />, href: '/guide/profile' },
  ];

  const TOOLS = [
    { label: 'Itinerary Planner', icon: <IRoute />, href: '/itinerary-planner' },
    { label: 'Budget Planner', icon: <IBudget />, href: '/budget-planner' },
    { label: 'Currency Exchange', icon: <ICurrency />, href: '/currency-exchanger' },
  ];

  const renderStatus = (s) => {
    const st = STATUS_CFG[(s || 'pending').toLowerCase()] || STATUS_CFG.pending;
    return (
      <span style={{ background: st.bg, color: st.color, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
        {st.label}
      </span>
    );
  };

  const BookingRow = ({ b }) => {
    const name = b.hotel?.name || b.destination?.name || b.package?.name || `Booking #${b._id?.slice(-6)}`;
    const date = b.checkInDate || b.startDate || b.createdAt;
    const out = b.checkOutDate || b.endDate;
    const imgUrl = getImageUrl(b.hotel?.images?.[0] || b.package?.images?.[0]);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f8fafc', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
          {imgUrl ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : (b._type === 'hotel' ? '🏨' : '🏔')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <IClock />
            {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            {out ? ` → ${new Date(out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {b.totalPrice > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>NPR {b.totalPrice.toLocaleString()}</div>}
          {renderStatus(b.status)}
        </div>
      </div>
    );
  };

  const STAT_CARDS = [
    { label: 'Active Bookings', value: loadingBook ? null : activeBookings, icon: '📅', color: '#eff6ff', iconBg: '#dbeafe', change: '+1 this month' },
    { label: 'Total Spent', value: loadingBook ? null : `NPR ${totalSpent.toLocaleString()}`, icon: '💰', color: '#f0fdf4', iconBg: '#bbf7d0', change: 'Lifetime total' },
    { label: 'Hotel Bookings', value: loadingBook ? null : hotelCount, icon: '🏨', color: '#fdf4ff', iconBg: '#f3e8ff', change: 'All time' },
    { label: 'Package Bookings', value: loadingBook ? null : pkgCount, icon: '🏔', color: '#fff7ed', iconBg: '#fed7aa', change: 'All time' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f8fafc; }
        nav.site-navbar, footer.site-footer, .site-navbar, .site-footer, .navbar, footer { display: none !important; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

        .db-root { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .db-sidebar {
          width: 240px; background: #fff;
          border-right: 1px solid #f1f5f9;
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          transition: transform 0.3s;
        }
        .db-sidebar.mobile-hidden { transform: translateX(-100%); }
        @media (max-width: 900px) { .db-sidebar { transform: translateX(-100%); } .db-sidebar.mobile-open { transform: translateX(0); box-shadow: 0 0 0 100vw rgba(0,0,0,0.2); } }

        .db-sidebar-logo { padding: 1.25rem 1.25rem 1rem; display: flex; align-items: center; gap: 10px; text-decoration: none; border-bottom: 1px solid #f1f5f9; }
        .db-logo-mark { width: 34px; height: 34px; background: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .db-logo-text { font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-logo-sub { font-size: 10px; color: #94a3b8; display: block; font-family: 'DM Sans', sans-serif; font-weight: 400; }

        .db-nav { flex: 1; padding: 1rem 0.75rem; overflow-y: auto; }
        .db-nav-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; padding: 0 0.5rem; margin-bottom: 4px; margin-top: 12px; }
        .db-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px; cursor: pointer;
          color: #64748b; font-size: 13.5px; font-weight: 500;
          text-decoration: none; transition: all 0.15s;
          border: none; background: none; width: 100%; font-family: 'DM Sans', sans-serif;
          margin-bottom: 1px;
        }
        .db-nav-item:hover { background: #f8fafc; color: #0f172a; }
        .db-nav-item.active { background: #f0fdf4; color: #15803d; font-weight: 600; }
        .db-nav-item.active svg { stroke: #16a34a; }
        .db-nav-badge { background: #16a34a; color: #fff; border-radius: 100px; font-size: 10px; font-weight: 700; padding: 1px 7px; margin-left: auto; }

        .db-user-area { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .db-user-card { display: flex; align-items: center; gap: 10px; }
        .db-avatar { width: 34px; height: 34px; border-radius: 50%; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'Fraunces', serif; flex-shrink: 0; }
        .db-user-name { font-size: 13px; font-weight: 600; color: #0f172a; }
        .db-user-email { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
        .db-logout-btn { margin-left: auto; background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; padding: 4px; border-radius: 6px; }
        .db-logout-btn:hover { background: #fee2e2; color: #dc2626; }

        /* MAIN */
        .db-main { margin-left: 240px; flex: 1; min-width: 0; }
        @media (max-width: 900px) { .db-main { margin-left: 0; } }

        /* TOPBAR */
        .db-topbar {
          background: #fff; border-bottom: 1px solid #f1f5f9;
          padding: 0 1.5rem; height: 58px;
          display: flex; align-items: center; gap: 1rem;
          position: sticky; top: 0; z-index: 30;
        }
        .db-hamburger { display: none; background: none; border: none; cursor: pointer; color: #374151; }
        @media (max-width: 900px) { .db-hamburger { display: flex; } }
        .db-search-bar {
          flex: 1; max-width: 420px;
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1px solid #f1f5f9;
          border-radius: 10px; padding: 0 12px; height: 38px;
          color: #94a3b8;
        }
        .db-search-input { border: none; outline: none; background: transparent; font-size: 13px; color: #374151; flex: 1; font-family: 'DM Sans', sans-serif; }
        .db-search-input::placeholder { color: #94a3b8; }
        .db-search-kbd { background: #e2e8f0; border-radius: 4px; padding: 1px 5px; font-size: 10px; color: #64748b; font-family: monospace; }
        .db-topbar-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .db-icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #f1f5f9; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; position: relative; }
        .db-notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: #dc2626; border: 1.5px solid #fff; }
        .db-user-pill { display: flex; align-items: center; gap: 7px; border: 1px solid #f1f5f9; border-radius: 100px; padding: 4px 12px 4px 5px; background: #fff; cursor: pointer; }
        .db-user-pill-name { font-size: 13px; font-weight: 600; color: #0f172a; }

        /* CONTENT */
        .db-content { padding: 2rem 1.5rem; max-width: 1000px; animation: fadeIn 0.4s ease; }

        /* GREETING */
        .db-greeting { margin-bottom: 2rem; }
        .db-greeting h1 { font-family: 'Fraunces', serif; font-size: 1.6rem; font-weight: 700; color: #0f172a; }
        .db-greeting p { font-size: 13px; color: #64748b; margin-top: 3px; }

        /* STAT CARDS */
        .db-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .db-stat-card { background: #fff; border-radius: 14px; padding: 1.25rem; border: 1px solid #f1f5f9; }
        .db-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 0.75rem; }
        .db-stat-value { font-family: 'Fraunces', serif; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .db-stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }
        .db-stat-change { font-size: 11px; color: #94a3b8; margin-top: 4px; }

        /* GRID */
        .db-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }
        @media (max-width: 1100px) { .db-grid { grid-template-columns: 1fr; } }

        /* CARD */
        .db-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; }
        .db-card-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.25rem 0; }
        .db-card-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; }
        .db-card-link { font-size: 12px; color: #16a34a; text-decoration: none; font-weight: 600; }
        .db-card-link:hover { text-decoration: underline; }
        .db-card-body { padding: 1rem 1.25rem 1.25rem; }

        /* SEARCH WIDGET */
        .db-search-widget { background: linear-gradient(135deg, #0f172a 0%, #1a3a20 100%); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; color: #fff; }
        .db-sw-title { font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .db-sw-sub { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 1rem; }
        .db-sw-tabs { display: flex; gap: 6px; margin-bottom: 1rem; }
        .db-sw-tab { border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.7); border-radius: 100px; padding: 5px 14px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .db-sw-tab.active { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.35); }
        .db-sw-form { display: flex; gap: 8px; }
        .db-sw-input { flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 10px 14px; color: #fff; font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; }
        .db-sw-input::placeholder { color: rgba(255,255,255,0.4); }
        .db-sw-btn { background: #16a34a; color: #fff; border: none; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .db-sw-btn:hover { background: #15803d; }

        /* EXPLORE GRID */
        .db-explore-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .db-explore-card { border-radius: 12px; overflow: hidden; position: relative; aspect-ratio: 3/2; cursor: pointer; text-decoration: none; display: block; }
        .db-explore-card:hover .db-ec-img { transform: scale(1.05); }
        .db-ec-img { width: 100%; height: 100%; object-fit: cover; background: #e2e8f0; transition: transform 0.3s; }
        .db-ec-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 100%); }
        .db-ec-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px; }
        .db-ec-name { font-size: 12px; font-weight: 700; color: #fff; }
        .db-ec-meta { font-size: 10px; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 3px; }
        .db-ec-placeholder { width: 100%; height: 100%; background: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }

        /* BOOKINGS TABLE */
        .db-bookings-list { padding: 0 1.25rem 1.25rem; }
        .db-no-bookings { text-align: center; padding: 2.5rem 1rem; }
        .db-no-bookings-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .db-no-bookings-text { font-size: 14px; color: #64748b; margin-bottom: 1rem; }
        .db-no-bookings-btn { display: inline-block; background: #0f172a; color: #fff; padding: 9px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; }
        .db-no-bookings-btn:hover { background: #16a34a; }

        /* QUICK LINKS */
        .db-tools-list { padding: 0.5rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 6px; }
        .db-tool-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #f8fafc; text-decoration: none; color: #374151; transition: all 0.2s; }
        .db-tool-item:hover { background: #f0fdf4; color: #15803d; }
        .db-tool-icon { width: 32px; height: 32px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; }
        .db-tool-label { font-size: 13px; font-weight: 500; }
        .db-tool-arrow { margin-left: auto; font-size: 14px; color: #94a3b8; }

        /* EXPLORE SECTION */
        .db-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .db-section-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .db-mini-card { border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9; background: #fff; text-decoration: none; color: inherit; display: block; transition: all 0.2s; }
        .db-mini-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .db-mini-img { aspect-ratio: 16/9; overflow: hidden; background: #f1f5f9; position: relative; }
        .db-mini-img img { width: 100%; height: 100%; object-fit: cover; }
        .db-mini-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .db-mini-body { padding: 10px 12px 12px; }
        .db-mini-name { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 3px; }
        .db-mini-meta { font-size: 11px; color: #94a3b8; }
        .db-mini-price { font-weight: 700; color: #0f172a; font-size: 12px; }

        @media (max-width: 600px) { .db-stats { grid-template-columns: 1fr 1fr; } .db-explore-grid { grid-template-columns: 1fr; } .db-cards-grid { grid-template-columns: 1fr 1fr; } .db-content { padding: 1.25rem 1rem; } }
      `}</style>

      <div className="db-root">
        {/* SIDEBAR */}
        <aside className={`db-sidebar${mobileNav ? ' mobile-open' : ''}`}>
          <Link to="/" className="db-sidebar-logo">
            <div className="db-logo-mark">🏔</div>
            <div>
              <div className="db-logo-text">My Travel Buddy</div>
              <span className="db-logo-sub">Nepal Explorer</span>
            </div>
          </Link>

          <nav className="db-nav">
            <div className="db-nav-label">Main</div>
            {[
              { id: 'overview', label: 'Dashboard', icon: <IHome /> },
              { id: 'bookings', label: 'My Bookings', icon: <IWallet />, badge: allBookings.length || null },
            ].map(item => (
              <button key={item.id} className={`db-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => { setTab(item.id); setMobileNav(false); }}>
                {item.icon}{item.label}
                {item.badge && <span className="db-nav-badge">{item.badge}</span>}
              </button>
            ))}

            <div className="db-nav-label">Explore</div>
            {[
              { label: 'Browse Hotels', icon: <IHome />, href: '/browse-hotels' },
              { label: 'Browse Packages', icon: <IPackage />, href: '/browse-packages' },
              { label: 'Find Guides', icon: <ICompass />, href: '/browse-guides' },
              { label: 'Apply as Guide', icon: <IUser />, href: '/apply-guide' },
            ].map(item => (
              <Link key={item.label} to={item.href} className="db-nav-item" onClick={() => setMobileNav(false)}>
                {item.icon}{item.label}
              </Link>
            ))}

            <div className="db-nav-label">Tools</div>
            {TOOLS.map(t => (
              <Link key={t.label} to={t.href} className="db-nav-item" onClick={() => setMobileNav(false)}>
                {t.icon}{t.label}
              </Link>
            ))}
          </nav>

          <div className="db-user-area">
            <div className="db-user-card">
              <div className="db-avatar">{initials}</div>
              <div>
                <div className="db-user-name">{firstName}</div>
                <div className="db-user-email">{user?.email || ''}</div>
              </div>
              <button className="db-logout-btn" onClick={handleLogout} title="Sign out"><ILogout /></button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="db-main">
          <div className="db-topbar">
            <button className="db-hamburger" onClick={() => setMobileNav(o => !o)}>
              {mobileNav ? <IClose /> : <IMenu />}
            </button>
            <form className="db-search-bar" onSubmit={handleSearch} style={{ flex: 1 }}>
              <ISearch />
              <input className="db-search-input" placeholder="Search trails, regions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <span className="db-search-kbd">⌘K</span>
            </form>
            <div className="db-topbar-actions">
              <div className="db-icon-btn">
                <IBell />
                <span className="db-notif-dot" />
              </div>
              <div className="db-user-pill">
                <div className="db-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{initials}</div>
                <span className="db-user-pill-name">{firstName}</span>
              </div>
            </div>
          </div>

          <div className="db-content">

            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <>
                <div className="db-greeting">
                  <h1>Good afternoon, {firstName} 👋</h1>
                  <p>Here's an overview of your travel activity and upcoming trips.</p>
                </div>

                {/* STAT CARDS */}
                <div className="db-stats">
                  {STAT_CARDS.map((sc, i) => (
                    <div key={i} className="db-stat-card">
                      <div className="db-stat-icon" style={{ background: sc.iconBg }}>{sc.icon}</div>
                      {sc.value === null ? <Skel h={28} w={80} r={6} /> : <div className="db-stat-value">{sc.value}</div>}
                      <div className="db-stat-label">{sc.label}</div>
                      <div className="db-stat-change">{sc.change}</div>
                    </div>
                  ))}
                </div>

                <div className="db-grid">
                  {/* LEFT COL */}
                  <div>
                    {/* SEARCH WIDGET */}
                    <div className="db-search-widget">
                      <div className="db-sw-title">Where to next, {firstName}?</div>
                      <div className="db-sw-sub">Find exclusive deals on hotels, treks, and guided tours across Nepal</div>
                      <div className="db-sw-tabs">
                        {['hotels', 'packages', 'guides'].map(t => (
                          <button key={t} className={`db-sw-tab${searchType === t ? ' active' : ''}`} onClick={() => setSearchType(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                      <form className="db-sw-form" onSubmit={handleSearch}>
                        <div className="db-sw-input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}><IPin /></span>
                          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={`Search ${searchType}...`} style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, fontFamily: 'DM Sans, sans-serif', flex: 1 }} />
                        </div>
                        <button className="db-sw-btn" type="submit">Search</button>
                      </form>
                    </div>

                    {/* RECENT BOOKINGS */}
                    <div className="db-card">
                      <div className="db-card-header">
                        <div className="db-card-title">Recent Bookings</div>
                        <button className="db-card-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setTab('bookings')}>View all →</button>
                      </div>
                      <div className="db-bookings-list">
                        {loadingBook
                          ? Array(3).fill(0).map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                              <Skel w={44} h={44} r={10} />
                              <div style={{ flex: 1 }}><Skel h={13} w="60%" r={4} /><div style={{ marginTop: 6 }}><Skel h={10} w="40%" r={4} /></div></div>
                              <Skel w={70} h={22} r={100} />
                            </div>
                          ))
                          : allBookings.length === 0
                            ? (
                              <div className="db-no-bookings">
                                <div className="db-no-bookings-icon">📭</div>
                                <div className="db-no-bookings-text">No bookings yet</div>
                                <Link to="/browse-packages" className="db-no-bookings-btn">Explore packages</Link>
                              </div>
                            )
                            : allBookings.slice(0, 5).map((b, i) => <BookingRow key={i} b={b} />)
                        }
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COL */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* QUICK TOOLS */}
                    <div className="db-card">
                      <div className="db-card-header">
                        <div className="db-card-title">Travel Tools</div>
                      </div>
                      <div className="db-tools-list">
                        {TOOLS.map(t => (
                          <Link key={t.label} to={t.href} className="db-tool-item">
                            <div className="db-tool-icon">{t.icon}</div>
                            <span className="db-tool-label">{t.label}</span>
                            <span className="db-tool-arrow">›</span>
                          </Link>
                        ))}
                        <Link to="/browse-guides" className="db-tool-item">
                          <div className="db-tool-icon"><ICompass /></div>
                          <span className="db-tool-label">Find a Guide</span>
                          <span className="db-tool-arrow">›</span>
                        </Link>
                        <Link to="/apply-guide" className="db-tool-item">
                          <div className="db-tool-icon"><IUser /></div>
                          <span className="db-tool-label">Apply as Guide</span>
                          <span className="db-tool-arrow">›</span>
                        </Link>
                      </div>
                    </div>

                    {/* QUICK EXPLORE */}
                    <div className="db-card">
                      <div className="db-card-header">
                        <div className="db-card-title">Quick Explore</div>
                        <Link to="/browse-hotels" className="db-card-link">View all →</Link>
                      </div>
                      <div className="db-card-body" style={{ paddingTop: '0.75rem' }}>
                        <div className="db-explore-grid">
                          {loadingHotels
                            ? Array(4).fill(0).map((_, i) => <div key={i} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '3/2' }}><Skel h="100%" r={12} /></div>)
                            : hotels.slice(0, 4).map(h => {
                              const imgUrl = getImageUrl(h.images?.[0]);
                              return (
                                <Link key={h._id} to={`/hotels/${h._id}`} className="db-explore-card">
                                  <div className="db-ec-img" style={{ width: '100%', height: '100%', background: '#0f172a', position: 'absolute', inset: 0 }}>
                                    {imgUrl ? <img src={imgUrl} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : <div className="db-ec-placeholder">🏨</div>}
                                  </div>
                                  <div className="db-ec-overlay" />
                                  <div className="db-ec-body">
                                    <div className="db-ec-name">{h.name}</div>
                                    <div className="db-ec-meta"><IPin />{h.location || h.city || 'Nepal'}</div>
                                  </div>
                                </Link>
                              );
                            })
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PACKAGES */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="db-section-header">
                    <div className="db-section-title">Recommended Packages</div>
                    <Link to="/browse-packages" className="db-card-link">View all →</Link>
                  </div>
                  <div className="db-cards-grid">
                    {loadingPkgs
                      ? Array(4).fill(0).map((_, i) => (
                        <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                          <Skel h={120} r={0} />
                          <div style={{ padding: '10px 12px 12px' }}><Skel h={13} w="70%" /><div style={{ marginTop: 6 }}><Skel h={10} w="50%" /></div></div>
                        </div>
                      ))
                      : packages.map(pkg => {
                        const imgUrl = getImageUrl(pkg.images?.[0]);
                        return (
                          <Link key={pkg._id} to={`/packages/${pkg._id}`} className="db-mini-card">
                            <div className="db-mini-img">
                              {imgUrl ? <img src={imgUrl} alt={pkg.name} onError={e => e.target.style.display = 'none'} /> : null}
                              <div className="db-mini-placeholder" style={{ display: imgUrl ? 'none' : 'flex' }}>🏔️</div>
                            </div>
                            <div className="db-mini-body">
                              <div className="db-mini-name">{pkg.name}</div>
                              <div className="db-mini-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{pkg.duration ? `${pkg.duration} days` : ''}</span>
                                <span className="db-mini-price">NPR {(pkg.price || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    }
                  </div>
                </div>
              </>
            )}

            {/* BOOKINGS TAB */}
            {tab === 'bookings' && (
              <>
                <div className="db-greeting">
                  <h1>My Bookings</h1>
                  <p>All your planned and completed trips in one place.</p>
                </div>

                {/* Filter row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {['All', 'Hotels', 'Packages', 'Confirmed', 'Pending', 'Completed'].map(f => (
                    <button key={f} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>{f}</button>
                  ))}
                </div>

                <div className="db-card">
                  <div className="db-bookings-list">
                    {loadingBook
                      ? Array(5).fill(0).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <Skel w={48} h={48} r={10} />
                          <div style={{ flex: 1 }}><Skel h={14} w="55%" r={4} /><div style={{ marginTop: 6 }}><Skel h={11} w="40%" r={4} /></div></div>
                          <div><Skel h={16} w={80} r={4} /><div style={{ marginTop: 6 }}><Skel h={22} w={80} r={100} /></div></div>
                        </div>
                      ))
                      : allBookings.length === 0
                        ? (
                          <div className="db-no-bookings">
                            <div className="db-no-bookings-icon">📭</div>
                            <div className="db-no-bookings-text">You haven't made any bookings yet</div>
                            <Link to="/browse-packages" className="db-no-bookings-btn">Start exploring</Link>
                          </div>
                        )
                        : allBookings.map((b, i) => <BookingRow key={i} b={b} />)
                    }
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
