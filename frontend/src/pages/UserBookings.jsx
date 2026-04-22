import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, CheckCircle2, XCircle,
  AlertCircle, Package, Compass, Hotel, Star, X,
  Inbox, ArrowRight
} from 'lucide-react';
import bookingService from '../services/bookingService';
import Loading from '../components/Loading';

const STATUS_CFG = {
  confirmed: { bg: '#dcfce7', color: '#15803d', dot: '#16a34a', label: 'Confirmed', Icon: CheckCircle2 },
  pending:   { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04', label: 'Pending',   Icon: AlertCircle  },
  cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626', label: 'Cancelled', Icon: XCircle      },
  completed: { bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed', label: 'Completed', Icon: Star         },
};

const TYPE_CFG = {
  package: { bg: '#dbeafe', color: '#1d4ed8', label: 'Travel Package', Icon: Package },
  guide:   { bg: '#dcfce7', color: '#15803d', label: 'Guide Booking',  Icon: Compass },
  hotel:   { bg: '#ffedd5', color: '#c2410c', label: 'Hotel Booking',  Icon: Hotel   },
};

const TABS = [
  { key: 'all',       label: 'All Bookings', emoji: '🗂️' },
  { key: 'packages',  label: 'Packages',     emoji: '🏔️' },
  { key: 'guides',    label: 'Guides',       emoji: '🧭' },
  { key: 'hotels',    label: 'Hotels',       emoji: '🏨' },
  { key: 'upcoming',  label: 'Upcoming',     emoji: '🗓️' },
  { key: 'pending',   label: 'Pending',      emoji: '⏳' },
  { key: 'completed', label: 'Past',         emoji: '✓'  },
];

const EMPTY_STATES = {
  all:       { Icon: Inbox,       title: 'No bookings yet',         sub: 'Start planning your next Himalayan adventure!' },
  packages:  { Icon: Package,     title: 'No package bookings',     sub: 'Browse our curated Nepal trekking packages.' },
  guides:    { Icon: Compass,     title: 'No guide bookings',       sub: 'Find a certified local guide for your trek.' },
  hotels:    { Icon: Hotel,       title: 'No hotel bookings',       sub: 'Book your perfect mountain stay.' },
  upcoming:  { Icon: Calendar,    title: 'No upcoming trips',       sub: 'Your confirmed adventures will appear here.' },
  pending:   { Icon: AlertCircle, title: 'No pending bookings',     sub: 'All your bookings are confirmed or completed.' },
  completed: { Icon: Star,        title: 'No past trips',           sub: 'Your completed adventures will appear here.' },
};

export default function UserBookings() {
  const location = useLocation();
  const [bookings,      setBookings]      = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('all');
  const [successMsg,    setSuccessMsg]    = useState('');

  useEffect(() => {
    fetchBookings();
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  }, [location.state]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [pkg, guide, hotel] = await Promise.all([
        bookingService.getUserBookings(),
        bookingService.getUserGuideBookings(),
        bookingService.getUserHotelBookings(),
      ]);
      setBookings(pkg.bookings || []);
      setGuideBookings(guide.bookings || []);
      setHotelBookings(hotel.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, type = 'package') => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      if (type === 'guide')      await bookingService.cancelGuideBooking(id);
      else if (type === 'hotel') await bookingService.cancelHotelBooking(id);
      else                       await bookingService.cancelPackageBooking(id);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking');
    }
  };

  const allBookings = [
    ...bookings.map(b => ({ ...b, type: 'package' })),
    ...guideBookings.map(b => ({ ...b, type: 'guide' })),
    ...hotelBookings.map(b => ({ ...b, type: 'hotel' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isUpcoming = (b) =>
    b.type === 'hotel'
      ? new Date(b.checkInDate) >= new Date() && b.status === 'confirmed'
      : new Date(b.date) >= new Date() && b.status === 'confirmed';

  const isPast = (b) =>
    b.type === 'hotel'
      ? b.status === 'completed' || new Date(b.checkOutDate) < new Date()
      : b.status === 'completed' || new Date(b.date) < new Date();

  const tabCount = (key) => {
    if (key === 'all')       return allBookings.length;
    if (key === 'packages')  return bookings.length;
    if (key === 'guides')    return guideBookings.length;
    if (key === 'hotels')    return hotelBookings.length;
    if (key === 'upcoming')  return allBookings.filter(isUpcoming).length;
    if (key === 'pending')   return allBookings.filter(b => b.status === 'pending').length;
    if (key === 'completed') return allBookings.filter(isPast).length;
    return 0;
  };

  const filtered = allBookings.filter(b => {
    if (activeTab === 'all')       return true;
    if (activeTab === 'packages')  return b.type === 'package';
    if (activeTab === 'guides')    return b.type === 'guide';
    if (activeTab === 'hotels')    return b.type === 'hotel';
    if (activeTab === 'upcoming')  return isUpcoming(b);
    if (activeTab === 'pending')   return b.status === 'pending';
    if (activeTab === 'completed') return isPast(b);
    return true;
  });

  const canCancel = (b) =>
    b.status === 'confirmed' && (
      b.type === 'hotel'
        ? new Date(b.checkInDate) >= new Date()
        : new Date(b.date) >= new Date()
    );

  const fmtDate = (d, opts = { year: 'numeric', month: 'short', day: 'numeric' }) =>
    d ? new Date(d).toLocaleDateString('en-US', opts) : '—';

  if (loading) return <Loading />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }

        .ub-page {
          font-family: 'Roboto', sans-serif;
          background: #fafaf9;
          color: #0f172a;
          min-height: 100vh;
        }

        /* ── BANNER ── */
        .ub-banner {
          background: #071a0f;
          padding: 3.5rem 2rem 3rem;
          position: relative; overflow: hidden;
        }
        .ub-banner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 55% 80% at 80% 50%, rgba(22,163,74,0.18), transparent);
          pointer-events: none;
        }
        .ub-banner-inner {
          max-width: 1240px; margin: 0 auto;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .ub-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #4ade80; margin-bottom: 0.5rem;
          display: flex; align-items: center; gap: 8px;
          font-family: 'Roboto', sans-serif;
        }
        .ub-eyebrow::before {
          content: ''; display: inline-block;
          width: 20px; height: 2px;
          background: #4ade80; border-radius: 2px;
        }
        .ub-title {
          font-family: 'Roboto', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          font-weight: 700; color: #fff;
          line-height: 1.1; letter-spacing: -0.02em;
          margin-bottom: 0.6rem;
        }
        .ub-subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 1rem; line-height: 1.65;
          font-family: 'Roboto', sans-serif; font-weight: 400;
        }

        /* ── STATS ── */
        .ub-stats {
          display: flex; gap: 0; flex-wrap: wrap;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin-top: 2.5rem;
        }
        .ub-stat {
          padding: 1.5rem 2.5rem 0.5rem 0;
          border-right: 1px solid rgba(255,255,255,0.08);
          margin-right: 2.5rem;
        }
        .ub-stat:last-child { border-right: none; }
        .ub-stat-num {
          font-family: 'Roboto', sans-serif;
          font-size: 2rem; font-weight: 700;
          color: #fff; display: block; line-height: 1; margin-bottom: 4px;
        }
        .ub-stat-label {
          font-size: 11px; color: rgba(255,255,255,0.4);
          font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;
          font-family: 'Roboto', sans-serif;
        }

        /* ── BODY ── */
        .ub-body { max-width: 1240px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }

        /* ── TOAST ── */
        .ub-toast {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 14px; padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 2rem;
          animation: slideDown 0.4s ease both;
        }
        .ub-toast-icon { color: #16a34a; flex-shrink: 0; }
        .ub-toast-text { font-size: 14px; font-weight: 500; color: #15803d; flex: 1; font-family: 'Roboto', sans-serif; }
        .ub-toast-close {
          color: #86efac; cursor: pointer; transition: color 0.2s;
          background: none; border: none; display: flex; align-items: center;
        }
        .ub-toast-close:hover { color: #16a34a; }

        /* ── TABS ── */
        .ub-tabs-wrap {
          display: flex; align-items: center;
          gap: 6px; flex-wrap: wrap; margin-bottom: 2rem;
        }
        .ub-tab {
          border: 1px solid #e2e8f0; background: #fff;
          border-radius: 100px; padding: 8px 16px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; color: #64748b;
          font-family: 'Roboto', sans-serif;
          transition: all 0.2s;
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .ub-tab:hover { border-color: #16a34a; color: #16a34a; }
        .ub-tab.active { background: #0f172a; border-color: #0f172a; color: #fff; }
        .ub-tab-count {
          background: rgba(0,0,0,0.08); border-radius: 100px;
          padding: 1px 7px; font-size: 11px; font-weight: 700;
          min-width: 22px; text-align: center;
        }
        .ub-tab.active .ub-tab-count { background: rgba(255,255,255,0.18); }

        /* ── BOOKING CARD ── */
        .ub-card {
          background: #fff; border: 1px solid #e8f5ee;
          border-radius: 20px; padding: 1.75rem;
          margin-bottom: 1.25rem;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          animation: fadeUp 0.5s ease both;
          display: flex; gap: 1.5rem; align-items: flex-start;
        }
        .ub-card:hover {
          border-color: #bbf7d0;
          box-shadow: 0 12px 40px rgba(22,163,74,0.1), 0 2px 8px rgba(0,0,0,0.04);
          transform: translateY(-2px);
        }
        .ub-card-accent {
          width: 4px; border-radius: 4px;
          flex-shrink: 0; align-self: stretch; min-height: 60px;
        }
        .accent-confirmed { background: #16a34a; }
        .accent-pending   { background: #ca8a04; }
        .accent-cancelled { background: #dc2626; }
        .accent-completed { background: #7c3aed; }

        .ub-card-body { flex: 1; min-width: 0; }

        .ub-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 0.85rem; }
        .ub-badge {
          border-radius: 100px; padding: 4px 12px;
          font-size: 11px; font-weight: 700;
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Roboto', sans-serif;
        }

        .ub-booking-name {
          font-size: 1.1rem; font-weight: 700;
          color: #0f172a; margin-bottom: 0.75rem; line-height: 1.3;
          font-family: 'Roboto', sans-serif;
        }

        .ub-meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 8px 16px; margin-bottom: 1rem;
        }
        .ub-meta-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; color: #64748b; font-weight: 400;
          font-family: 'Roboto', sans-serif;
        }
        .ub-meta-item strong { color: #374151; font-weight: 500; }
        .ub-meta-icon { color: #94a3b8; flex-shrink: 0; }

        .ub-special {
          margin-top: 0.75rem; background: #f8fafc;
          border: 1px solid #f1f5f9; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; color: #64748b;
          line-height: 1.6; font-family: 'Roboto', sans-serif;
        }
        .ub-special strong { color: #374151; font-weight: 500; }

        .ub-card-right {
          flex-shrink: 0; display: flex; flex-direction: column;
          align-items: flex-end; gap: 10px; min-width: 150px;
        }
        .ub-price-label {
          font-size: 10px; color: #94a3b8; font-weight: 500;
          text-align: right; text-transform: uppercase;
          letter-spacing: 0.05em; margin-bottom: 2px;
          font-family: 'Roboto', sans-serif;
        }
        .ub-price {
          font-family: 'Roboto', sans-serif;
          font-size: 1.6rem; font-weight: 700;
          color: #0f172a; line-height: 1;
        }

        .ub-btn-cancel {
          background: #fff; border: 1.5px solid #fecaca;
          color: #dc2626; border-radius: 10px;
          padding: 8px 14px; font-size: 12px; font-weight: 500;
          cursor: pointer; font-family: 'Roboto', sans-serif;
          transition: all 0.2s;
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .ub-btn-cancel:hover { background: #fee2e2; border-color: #fca5a5; }

        .ub-btn-view {
          border: none; border-radius: 10px;
          padding: 9px 16px; font-size: 12px; font-weight: 500;
          cursor: pointer; font-family: 'Roboto', sans-serif;
          transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
          text-decoration: none; white-space: nowrap;
        }
        .ub-btn-view-package { background: #0f172a; color: #fff; }
        .ub-btn-view-package:hover { background: #16a34a; }
        .ub-btn-view-guide { background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; }
        .ub-btn-view-guide:hover { background: #16a34a; color: #fff; border-color: #16a34a; }
        .ub-btn-view-hotel { background: #fff7ed; color: #c2410c; border: 1.5px solid #fed7aa; }
        .ub-btn-view-hotel:hover { background: #c2410c; color: #fff; border-color: #c2410c; }

        /* ── EMPTY STATE ── */
        .ub-empty {
          text-align: center; padding: 5rem 2rem;
          background: #fff; border: 1px solid #e8f5ee;
          border-radius: 20px; animation: fadeIn 0.4s ease both;
        }
        .ub-empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem; color: #16a34a;
        }
        .ub-empty-title {
          font-family: 'Roboto', sans-serif;
          font-size: 1.5rem; font-weight: 700;
          color: #0f172a; margin-bottom: 0.5rem;
        }
        .ub-empty-sub {
          font-size: 14px; color: #94a3b8; margin-bottom: 1.75rem;
          line-height: 1.6; font-family: 'Roboto', sans-serif;
        }
        .ub-empty-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .ub-empty-btn-primary {
          background: #16a34a; color: #fff;
          padding: 11px 24px; border-radius: 12px;
          font-weight: 500; font-size: 13px;
          text-decoration: none; transition: all 0.2s;
          font-family: 'Roboto', sans-serif;
          display: flex; align-items: center; gap: 6px;
        }
        .ub-empty-btn-primary:hover { background: #15803d; transform: translateY(-1px); }
        .ub-empty-btn-secondary {
          background: #f0fdf4; color: #16a34a;
          border: 1.5px solid #bbf7d0; padding: 11px 24px; border-radius: 12px;
          font-weight: 500; font-size: 13px;
          text-decoration: none; transition: all 0.2s;
          font-family: 'Roboto', sans-serif;
          display: flex; align-items: center; gap: 6px;
        }
        .ub-empty-btn-secondary:hover { background: #dcfce7; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .ub-card { flex-direction: column; gap: 1rem; }
          .ub-card-accent { width: auto; height: 4px; align-self: auto; min-height: auto; }
          .ub-card-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; }
          .ub-banner { padding: 2.5rem 1.25rem 2rem; }
          .ub-body { padding: 1.5rem 1rem 4rem; }
          .ub-stat { padding: 1rem 1.5rem 0.5rem 0; margin-right: 1.5rem; }
          .ub-stat-num { font-size: 1.5rem; }
        }
      `}</style>

      <div className="ub-page">

        {/* ── BANNER ── */}
        <div className="ub-banner">
          <div className="ub-banner-inner">
            <div className="ub-eyebrow">My Account</div>
            <h1 className="ub-title">My Bookings</h1>
            <p className="ub-subtitle">Manage your trips, hotel stays, and guide reservations across Nepal.</p>
            <div className="ub-stats">
              <div className="ub-stat">
                <span className="ub-stat-num">{allBookings.length}</span>
                <span className="ub-stat-label">Total Bookings</span>
              </div>
              <div className="ub-stat">
                <span className="ub-stat-num">{allBookings.filter(isUpcoming).length}</span>
                <span className="ub-stat-label">Upcoming Trips</span>
              </div>
              <div className="ub-stat">
                <span className="ub-stat-num">{allBookings.filter(b => b.status === 'pending').length}</span>
                <span className="ub-stat-label">Pending</span>
              </div>
              <div className="ub-stat">
                <span className="ub-stat-num">{allBookings.filter(isPast).length}</span>
                <span className="ub-stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="ub-body">

          {/* Toast */}
          {successMsg && (
            <div className="ub-toast">
              <CheckCircle2 size={18} className="ub-toast-icon" />
              <span className="ub-toast-text">{successMsg}</span>
              <button className="ub-toast-close" onClick={() => setSuccessMsg('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="ub-tabs-wrap">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`ub-tab${activeTab === tab.key ? ' active' : ''}`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                <span className="ub-tab-count">{tabCount(tab.key)}</span>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="ub-empty">
              <div className="ub-empty-icon">
                {(() => {
                  const es = EMPTY_STATES[activeTab] || EMPTY_STATES.all;
                  return <es.Icon size={36} strokeWidth={1.5} />;
                })()}
              </div>
              <h3 className="ub-empty-title">{(EMPTY_STATES[activeTab] || EMPTY_STATES.all).title}</h3>
              <p className="ub-empty-sub">{(EMPTY_STATES[activeTab] || EMPTY_STATES.all).sub}</p>
              <div className="ub-empty-btns">
                {['all', 'packages', 'upcoming', 'pending', 'completed'].includes(activeTab) && (
                  <Link to="/packages" className="ub-empty-btn-primary">
                    <Package size={14} /> Browse Packages
                  </Link>
                )}
                {['all', 'guides'].includes(activeTab) && (
                  <Link to="/guides" className="ub-empty-btn-secondary">
                    <Compass size={14} /> Find a Guide
                  </Link>
                )}
                {['hotels'].includes(activeTab) && (
                  <Link to="/hotels" className="ub-empty-btn-secondary">
                    <Hotel size={14} /> Browse Hotels
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div>
              {filtered.map((booking, idx) => {
                const status = (booking.status || 'pending').toLowerCase();
                const sc = STATUS_CFG[status] || STATUS_CFG.pending;
                const tc = TYPE_CFG[booking.type] || TYPE_CFG.package;
                const StatusIcon = sc.Icon;
                const TypeIcon = tc.Icon;

                const name =
                  booking.type === 'package'
                    ? booking.package?.name || 'Package Booking'
                    : booking.type === 'guide'
                    ? `Guide: ${booking.guide?.username || 'Unknown Guide'}`
                    : booking.hotel?.name || 'Hotel Booking';

                const primaryDate =
                  booking.type === 'hotel' ? booking.checkInDate : booking.date;
                const secondaryDate =
                  booking.type === 'hotel' ? booking.checkOutDate : null;

                const dest =
                  booking.type === 'hotel'
                    ? booking.hotel?.location
                    : booking.location || booking.package?.destinations?.[0]?.name;

                const viewLink =
                  booking.type === 'package' && booking.package
                    ? `/packages/${booking.package._id}`
                    : booking.type === 'guide' && booking.guide
                    ? `/guides/${booking.guide._id}`
                    : booking.type === 'hotel' && booking.hotel
                    ? `/hotels/${booking.hotel._id}`
                    : null;

                return (
                  <div
                    key={booking._id}
                    className="ub-card"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Accent bar */}
                    <div className={`ub-card-accent accent-${status}`} />

                    {/* Body */}
                    <div className="ub-card-body">
                      <div className="ub-badges">
                        <span className="ub-badge" style={{ background: sc.bg, color: sc.color }}>
                          <StatusIcon size={11} />
                          {sc.label}
                        </span>
                        <span className="ub-badge" style={{ background: tc.bg, color: tc.color }}>
                          <TypeIcon size={11} />
                          {tc.label}
                        </span>
                      </div>

                      <div className="ub-booking-name">{name}</div>

                      <div className="ub-meta">
                        <div className="ub-meta-item">
                          <Calendar size={13} className="ub-meta-icon" />
                          <span>
                            <strong>{booking.type === 'hotel' ? 'Check-in: ' : 'Date: '}</strong>
                            {fmtDate(primaryDate)}
                          </span>
                        </div>
                        {secondaryDate && (
                          <div className="ub-meta-item">
                            <Calendar size={13} className="ub-meta-icon" />
                            <span><strong>Check-out: </strong>{fmtDate(secondaryDate)}</span>
                          </div>
                        )}
                        {dest && (
                          <div className="ub-meta-item">
                            <MapPin size={13} className="ub-meta-icon" />
                            <span>
                              <strong>{booking.type === 'hotel' ? 'Location: ' : 'Destination: '}</strong>
                              {dest}
                            </span>
                          </div>
                        )}
                        {booking.type === 'guide' && booking.duration && (
                          <div className="ub-meta-item">
                            <Clock size={13} className="ub-meta-icon" />
                            <span>
                              <strong>Duration: </strong>
                              {booking.duration} {booking.bookingType === 'hourly' ? 'hour' : 'day'}{booking.duration > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        <div className="ub-meta-item">
                          <Clock size={13} className="ub-meta-icon" />
                          <span><strong>Booked: </strong>{fmtDate(booking.createdAt)}</span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="ub-special">
                          <strong>Special Requests: </strong>{booking.specialRequests}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div className="ub-card-right">
                      <div>
                        <div className="ub-price-label">Total</div>
                        <div className="ub-price">${booking.totalPrice || booking.price || 0}</div>
                      </div>

                      {viewLink && (
                        <Link to={viewLink} className={`ub-btn-view ub-btn-view-${booking.type}`}>
                          {booking.type === 'package' ? <Package size={13} /> :
                           booking.type === 'guide'   ? <Compass size={13} /> :
                           <Hotel size={13} />}
                          View {booking.type === 'package' ? 'Package' : booking.type === 'guide' ? 'Guide' : 'Hotel'}
                          <ArrowRight size={13} />
                        </Link>
                      )}

                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancel(booking._id, booking.type)}
                          className="ub-btn-cancel"
                        >
                          <XCircle size={13} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
