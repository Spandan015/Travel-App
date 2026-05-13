import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, CheckCircle2, XCircle,
  AlertCircle, Package, Compass, Hotel, Star, X,
  Inbox, ArrowRight, Mountain
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
  package: { bg: '#dbeafe', color: '#1d4ed8', label: 'Travel Package', Icon: Package  },
  guide:   { bg: '#dcfce7', color: '#15803d', label: 'Guide Booking',  Icon: Compass  },
  hotel:   { bg: '#ffedd5', color: '#c2410c', label: 'Hotel Booking',  Icon: Hotel    },
  trek:    { bg: '#fdf4ff', color: '#7e22ce', label: 'Trek Booking',   Icon: Mountain },
};

const TABS = [
  { key: 'all',       label: 'All Bookings', emoji: '🗂️' },
  { key: 'packages',  label: 'Packages',     emoji: '🏔️' },
  { key: 'treks',     label: 'Treks',        emoji: '🥾' },
  { key: 'hotels',    label: 'Hotels',       emoji: '🏨' },
  { key: 'guides',    label: 'Guides',       emoji: '🧭' },
  { key: 'upcoming',  label: 'Upcoming',     emoji: '🗓️' },
  { key: 'pending',   label: 'Pending',      emoji: '⏳' },
  { key: 'completed', label: 'Past',         emoji: '✓'  },
];

const EMPTY_STATES = {
  all:       { Icon: Inbox,       title: 'No bookings yet',         sub: 'Start planning your next Himalayan adventure!' },
  packages:  { Icon: Package,     title: 'No package bookings',     sub: 'Browse our curated Nepal trekking packages.' },
  treks:     { Icon: Mountain,    title: 'No trek bookings',        sub: 'Explore Nepal\'s stunning trekking routes.' },
  guides:    { Icon: Compass,     title: 'No guide bookings',       sub: 'Find a certified local guide for your trek.' },
  hotels:    { Icon: Hotel,       title: 'No hotel bookings',       sub: 'Book your perfect mountain stay.' },
  upcoming:  { Icon: Calendar,    title: 'No upcoming trips',       sub: 'Your confirmed adventures will appear here.' },
  pending:   { Icon: AlertCircle, title: 'No pending bookings',     sub: 'All your bookings are confirmed or completed.' },
  completed: { Icon: Star,        title: 'No past trips',           sub: 'Your completed adventures will appear here.' },
};

const fmtPrice = (amount) => {
  if (!amount && amount !== 0) return 'NPR 0';
  return `NPR ${Number(amount).toLocaleString('en-NP')}`;
};

export default function UserBookings() {
  const location = useLocation();
  const [bookings,      setBookings]      = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [trekBookings,  setTrekBookings]  = useState([]);
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
      const [pkg, guide, hotel, trek] = await Promise.allSettled([
        bookingService.getUserBookings(),
        bookingService.getUserGuideBookings(),
        bookingService.getUserHotelBookings(),
        bookingService.getUserTrekBookings(),
      ]);

      setBookings(     pkg.status   === 'fulfilled' ? (pkg.value.bookings   || []) : []);
      setGuideBookings(guide.status === 'fulfilled' ? (guide.value.bookings || []) : []);
      setHotelBookings(hotel.status === 'fulfilled' ? (hotel.value.bookings || []) : []);
      setTrekBookings( trek.status  === 'fulfilled' ? (trek.value.bookings  || []) : []);

      if (pkg.status   === 'rejected') console.error('Package bookings failed:', pkg.reason);
      if (guide.status === 'rejected') console.error('Guide bookings failed:',   guide.reason);
      if (hotel.status === 'rejected') console.error('Hotel bookings failed:',   hotel.reason);
      if (trek.status  === 'rejected') console.error('Trek bookings failed:',    trek.reason);
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
      else if (type === 'trek')  await bookingService.cancelTrekBooking(id);
      else                       await bookingService.cancelPackageBooking(id);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking');
    }
  };

  const allBookings = [
    ...bookings.map(b      => ({ ...b, type: 'package' })),
    ...guideBookings.map(b => ({ ...b, type: 'guide'   })),
    ...hotelBookings.map(b => ({ ...b, type: 'hotel'   })),
    ...trekBookings.map(b  => ({ ...b, type: 'trek'    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isUpcoming = (b) => {
    const notCancelled = b.status !== 'cancelled';
    if (b.type === 'hotel') return notCancelled && b.checkInDate  && new Date(b.checkInDate)  >= new Date();
    return notCancelled && b.startDate && new Date(b.startDate) >= new Date() && b.status === 'confirmed';
  };

  const isPast = (b) => {
    if (b.type === 'hotel') return b.status === 'completed' || (b.checkOutDate && new Date(b.checkOutDate) < new Date());
    return b.status === 'completed' || (b.startDate && new Date(b.startDate) < new Date());
  };

  // Allow cancel for any booking not already cancelled or completed
  const canCancel = (b) => !['cancelled', 'completed'].includes(b.status);

  const tabCount = (key) => {
    if (key === 'all')       return allBookings.length;
    if (key === 'packages')  return bookings.length;
    if (key === 'guides')    return guideBookings.length;
    if (key === 'hotels')    return hotelBookings.length;
    if (key === 'treks')     return trekBookings.length;
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
    if (activeTab === 'treks')     return b.type === 'trek';
    if (activeTab === 'upcoming')  return isUpcoming(b);
    if (activeTab === 'pending')   return b.status === 'pending';
    if (activeTab === 'completed') return isPast(b);
    return true;
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  if (loading) return <Loading />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
        .ub-page { font-family:'Roboto',sans-serif; background:#fafaf9; color:#0f172a; min-height:100vh; }
        .ub-banner { background:#071a0f; padding:3.5rem 2rem 3rem; position:relative; overflow:hidden; }
        .ub-banner::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 55% 80% at 80% 50%,rgba(22,163,74,0.18),transparent); pointer-events:none; }
        .ub-banner-inner { max-width:1240px; margin:0 auto; position:relative; z-index:1; animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .ub-eyebrow { font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#4ade80; margin-bottom:0.5rem; display:flex; align-items:center; gap:8px; }
        .ub-eyebrow::before { content:''; display:inline-block; width:20px; height:2px; background:#4ade80; border-radius:2px; }
        .ub-title { font-size:clamp(2.2rem,5vw,3.2rem); font-weight:700; color:#fff; line-height:1.1; letter-spacing:-0.02em; margin-bottom:0.6rem; }
        .ub-subtitle { color:rgba(255,255,255,0.5); font-size:1rem; line-height:1.65; font-weight:400; }
        .ub-stats { display:flex; gap:0; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.07); margin-top:2.5rem; }
        .ub-stat { padding:1.5rem 2.5rem 0.5rem 0; border-right:1px solid rgba(255,255,255,0.08); margin-right:2.5rem; }
        .ub-stat:last-child { border-right:none; }
        .ub-stat-num { font-size:2rem; font-weight:700; color:#fff; display:block; line-height:1; margin-bottom:4px; }
        .ub-stat-label { font-size:11px; color:rgba(255,255,255,0.4); font-weight:500; letter-spacing:0.05em; text-transform:uppercase; }
        .ub-body { max-width:1240px; margin:0 auto; padding:2.5rem 2rem 5rem; }
        .ub-toast { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:12px; margin-bottom:2rem; animation:slideDown 0.4s ease both; }
        .ub-toast-text { font-size:14px; font-weight:500; color:#15803d; flex:1; }
        .ub-toast-close { color:#86efac; cursor:pointer; background:none; border:none; display:flex; align-items:center; }
        .ub-toast-close:hover { color:#16a34a; }
        .ub-tabs-wrap { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:2rem; }
        .ub-tab { border:1px solid #e2e8f0; background:#fff; border-radius:100px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; color:#64748b; transition:all 0.2s; display:flex; align-items:center; gap:6px; white-space:nowrap; font-family:inherit; }
        .ub-tab:hover { border-color:#16a34a; color:#16a34a; }
        .ub-tab.active { background:#0f172a; border-color:#0f172a; color:#fff; }
        .ub-tab-count { background:rgba(0,0,0,0.08); border-radius:100px; padding:1px 7px; font-size:11px; font-weight:700; min-width:22px; text-align:center; }
        .ub-tab.active .ub-tab-count { background:rgba(255,255,255,0.18); }
        .ub-card { background:#fff; border:1px solid #e8f5ee; border-radius:20px; padding:1.75rem; margin-bottom:1.25rem; transition:all 0.3s cubic-bezier(0.22,1,0.36,1); animation:fadeUp 0.5s ease both; display:flex; gap:1.5rem; align-items:flex-start; }
        .ub-card:hover { border-color:#bbf7d0; box-shadow:0 12px 40px rgba(22,163,74,0.1),0 2px 8px rgba(0,0,0,0.04); transform:translateY(-2px); }
        .ub-card-accent { width:4px; border-radius:4px; flex-shrink:0; align-self:stretch; min-height:60px; }
        .accent-confirmed{background:#16a34a} .accent-pending{background:#ca8a04} .accent-cancelled{background:#dc2626} .accent-completed{background:#7c3aed}
        .ub-card-body { flex:1; min-width:0; }
        .ub-badges { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:0.85rem; }
        .ub-badge { border-radius:100px; padding:4px 12px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:5px; }
        .ub-booking-name { font-size:1.1rem; font-weight:700; color:#0f172a; margin-bottom:0.75rem; line-height:1.3; }
        .ub-meta { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:8px 16px; margin-bottom:1rem; }
        .ub-meta-item { display:flex; align-items:center; gap:7px; font-size:13px; color:#64748b; }
        .ub-meta-item strong { color:#374151; font-weight:500; }
        .ub-payment-pill { display:inline-flex; align-items:center; gap:5px; border-radius:100px; padding:3px 10px; font-size:11px; font-weight:700; }
        .ub-payment-paid{background:#dcfce7;color:#15803d} .ub-payment-unpaid{background:#fef9c3;color:#854d0e}
        .ub-special { margin-top:0.75rem; background:#f8fafc; border:1px solid #f1f5f9; border-radius:10px; padding:10px 14px; font-size:13px; color:#64748b; line-height:1.6; }
        .ub-card-right { flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:10px; min-width:160px; }
        .ub-price-label { font-size:10px; color:#94a3b8; font-weight:500; text-align:right; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px; }
        .ub-price { font-size:1.3rem; font-weight:700; color:#0f172a; line-height:1; text-align:right; }
        .ub-btn-cancel { background:#fff; border:1.5px solid #fecaca; color:#dc2626; border-radius:10px; padding:8px 14px; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; transition:all 0.2s; display:flex; align-items:center; gap:6px; white-space:nowrap; }
        .ub-btn-cancel:hover { background:#fee2e2; }
        .ub-btn-details { background:#0f172a; color:#fff; border:none; border-radius:10px; padding:9px 16px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; text-decoration:none; white-space:nowrap; }
        .ub-btn-details:hover { background:#16a34a; }
        .ub-empty { text-align:center; padding:5rem 2rem; background:#fff; border:1px solid #e8f5ee; border-radius:20px; animation:fadeIn 0.4s ease both; }
        .ub-empty-icon { width:80px; height:80px; border-radius:50%; background:#f0fdf4; border:1px solid #bbf7d0; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; color:#16a34a; }
        .ub-empty-title { font-size:1.5rem; font-weight:700; color:#0f172a; margin-bottom:0.5rem; }
        .ub-empty-sub { font-size:14px; color:#94a3b8; margin-bottom:1.75rem; line-height:1.6; }
        .ub-empty-btns { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
        .ub-empty-btn { padding:11px 24px; border-radius:12px; font-weight:500; font-size:13px; text-decoration:none; transition:all 0.2s; display:flex; align-items:center; gap:6px; }
        .ub-empty-btn-green { background:#16a34a; color:#fff; }
        .ub-empty-btn-green:hover { background:#15803d; }
        .ub-empty-btn-outline { background:#f0fdf4; color:#16a34a; border:1.5px solid #bbf7d0; }
        .ub-empty-btn-outline:hover { background:#dcfce7; }
        @media(max-width:768px){
          .ub-card{flex-direction:column;gap:1rem}
          .ub-card-accent{width:auto;height:4px;align-self:auto;min-height:auto}
          .ub-card-right{align-items:flex-start;flex-direction:row;flex-wrap:wrap}
          .ub-banner{padding:2.5rem 1.25rem 2rem}
          .ub-body{padding:1.5rem 1rem 4rem}
        }
      `}</style>

      <div className="ub-page">
        {/* BANNER */}
        <div className="ub-banner">
          <div className="ub-banner-inner">
            <div className="ub-eyebrow">My Account</div>
            <h1 className="ub-title">My Bookings</h1>
            <p className="ub-subtitle">Manage your trips, hotel stays, and guide reservations across Nepal.</p>
            <div className="ub-stats">
              {[
                { num: allBookings.length,                        label: 'Total Bookings' },
                { num: allBookings.filter(isUpcoming).length,     label: 'Upcoming Trips' },
                { num: allBookings.filter(b=>b.status==='pending').length, label: 'Pending' },
                { num: allBookings.filter(isPast).length,         label: 'Completed' },
              ].map(({ num, label }) => (
                <div key={label} className="ub-stat">
                  <span className="ub-stat-num">{num}</span>
                  <span className="ub-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ub-body">
          {successMsg && (
            <div className="ub-toast">
              <CheckCircle2 size={18} color="#16a34a" />
              <span className="ub-toast-text">{successMsg}</span>
              <button className="ub-toast-close" onClick={() => setSuccessMsg('')}><X size={16} /></button>
            </div>
          )}

          {/* Tabs */}
          <div className="ub-tabs-wrap">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`ub-tab${activeTab === tab.key ? ' active' : ''}`}>
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
                {(() => { const es = EMPTY_STATES[activeTab] || EMPTY_STATES.all; return <es.Icon size={36} strokeWidth={1.5} />; })()}
              </div>
              <h3 className="ub-empty-title">{(EMPTY_STATES[activeTab] || EMPTY_STATES.all).title}</h3>
              <p className="ub-empty-sub">{(EMPTY_STATES[activeTab] || EMPTY_STATES.all).sub}</p>
              <div className="ub-empty-btns">
                <Link to="/browse-packages" className="ub-empty-btn ub-empty-btn-green"><Package size={14} /> Browse Packages</Link>
                <Link to="/browse-destinations" className="ub-empty-btn ub-empty-btn-outline"><Mountain size={14} /> Browse Treks</Link>
                <Link to="/browse-hotels" className="ub-empty-btn ub-empty-btn-outline"><Hotel size={14} /> Browse Hotels</Link>
              </div>
            </div>
          ) : (
            <div>
              {filtered.map((booking, idx) => {
                const status = (booking.status || 'pending').toLowerCase();
                const sc = STATUS_CFG[status] || STATUS_CFG.pending;
                const tc = TYPE_CFG[booking.type] || TYPE_CFG.package;
                const StatusIcon = sc.Icon;
                const TypeIcon   = tc.Icon;

                const name =
                  booking.type === 'package' ? booking.package?.name || 'Package Booking' :
                  booking.type === 'trek'    ? booking.trek?.name    || 'Trek Booking'    :
                  booking.type === 'guide'   ? `Guide: ${booking.guide?.username || 'Unknown'}` :
                  booking.hotel?.name || 'Hotel Booking';

                const primaryDate   = booking.type === 'hotel' ? booking.checkInDate  : booking.startDate;
                const secondaryDate = booking.type === 'hotel' ? booking.checkOutDate : booking.endDate;

                const dest =
                  booking.type === 'hotel'   ? booking.hotel?.location   :
                  booking.type === 'trek'    ? booking.trek?.region       :
                  booking.type === 'package' ? booking.package?.destinations?.[0]?.name : null;

                // Always link to booking detail page
                const detailLink = `/bookings/${booking.type}/${booking._id}`;

                return (
                  <div key={booking._id} className="ub-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className={`ub-card-accent accent-${status}`} />

                    <div className="ub-card-body">
                      <div className="ub-badges">
                        <span className="ub-badge" style={{ background: sc.bg, color: sc.color }}>
                          <StatusIcon size={11} /> {sc.label}
                        </span>
                        <span className="ub-badge" style={{ background: tc.bg, color: tc.color }}>
                          <TypeIcon size={11} /> {tc.label}
                        </span>
                        {booking.paymentStatus && (
                          <span className={`ub-payment-pill ${booking.paymentStatus === 'paid' ? 'ub-payment-paid' : 'ub-payment-unpaid'}`}>
                            {booking.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
                          </span>
                        )}
                      </div>

                      <div className="ub-booking-name">{name}</div>

                      <div className="ub-meta">
                        {primaryDate && (
                          <div className="ub-meta-item">
                            <Calendar size={13} color="#94a3b8" />
                            <span><strong>{booking.type === 'hotel' ? 'Check-in: ' : 'Start: '}</strong>{fmtDate(primaryDate)}</span>
                          </div>
                        )}
                        {secondaryDate && (
                          <div className="ub-meta-item">
                            <Calendar size={13} color="#94a3b8" />
                            <span><strong>{booking.type === 'hotel' ? 'Check-out: ' : 'End: '}</strong>{fmtDate(secondaryDate)}</span>
                          </div>
                        )}
                        {dest && (
                          <div className="ub-meta-item">
                            <MapPin size={13} color="#94a3b8" />
                            <span><strong>Location: </strong>{dest}</span>
                          </div>
                        )}
                        {booking.numberOfGuests && (
                          <div className="ub-meta-item">
                            <Star size={13} color="#94a3b8" />
                            <span><strong>Guests: </strong>{booking.numberOfGuests}</span>
                          </div>
                        )}
                        {booking.type === 'hotel' && booking.numberOfRooms && (
                          <div className="ub-meta-item">
                            <Hotel size={13} color="#94a3b8" />
                            <span><strong>Rooms: </strong>{booking.numberOfRooms}{booking.roomType ? ` (${booking.roomType})` : ''}</span>
                          </div>
                        )}
                        <div className="ub-meta-item">
                          <Clock size={13} color="#94a3b8" />
                          <span><strong>Booked: </strong>{fmtDate(booking.createdAt)}</span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="ub-special"><strong>Special Requests: </strong>{booking.specialRequests}</div>
                      )}
                    </div>

                    {/* Right panel */}
                    <div className="ub-card-right">
                      <div>
                        <div className="ub-price-label">Total</div>
                        <div className="ub-price">{fmtPrice(booking.totalPrice || booking.price)}</div>
                      </div>

                      <Link to={detailLink} className="ub-btn-details">
                        <ArrowRight size={13} /> View Details
                      </Link>

                      {canCancel(booking) && (
                        <button onClick={() => handleCancel(booking._id, booking.type)} className="ub-btn-cancel">
                          <XCircle size={13} /> Cancel
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
