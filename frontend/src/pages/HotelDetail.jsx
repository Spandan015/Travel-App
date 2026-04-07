import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import hotelService from '../services/hotelService';
import MapView from '../components/MapView';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const authToken = () => localStorage.getItem('nt_token');

const AMENITY_ICONS = {
  'WiFi':'📶','Pool':'🏊','Gym':'🏋️','Restaurant':'🍽️','Bar':'🍸',
  'Spa':'💆','Parking':'🅿️','Room Service':'🛎️','Airport Shuttle':'🚌',
  'Laundry':'👕','AC':'❄️','Heating':'🔥','TV':'📺','Safe':'🔒','Balcony':'🌅',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  :root {
    --blue:#1B4F8A; --blue-dark:#0F3362; --blue-light:#EEF4FB;
    --text:#1E2D3D; --muted:#6b7c93; --border:#E4ECF3; --bg:#F5F9FF;
  }
  .hd-root { font-family:'Roboto',sans-serif; background:var(--bg); padding-top:68px; min-height:100vh; }

  /* ── GALLERY — Booking.com style 5-panel ── */
  .hd-gallery-wrap { position:relative; max-height:400px; overflow:hidden; cursor:pointer; }
  .hd-gallery {
    display:grid;
    grid-template-columns:2fr 1fr 1fr;
    grid-template-rows:200px 200px;
    gap:3px;
    height:400px;
  }
  .hd-gp { overflow:hidden; position:relative; }
  .hd-gp img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; display:block; }
  .hd-gp:hover img { transform:scale(1.04); }
  .hd-gp-main { grid-column:1; grid-row:1/3; }
  .hd-gp:nth-child(2) { grid-column:2; grid-row:1; }
  .hd-gp:nth-child(3) { grid-column:3; grid-row:1; }
  .hd-gp:nth-child(4) { grid-column:2; grid-row:2; }
  .hd-gp:nth-child(5) { grid-column:3; grid-row:2; position:relative; }
  .hd-gallery-more-btn {
    position:absolute; bottom:12px; right:12px;
    background:rgba(255,255,255,0.92); color:#1E2D3D;
    padding:7px 14px; border-radius:8px; font-size:13px; font-weight:700;
    backdrop-filter:blur(4px); border:1px solid rgba(0,0,0,0.1);
    cursor:pointer; transition:background 0.15s;
  }
  .hd-gallery-more-btn:hover { background:#fff; }
  @media(max-width:768px){
    .hd-gallery { grid-template-columns:1fr; grid-template-rows:260px; }
    .hd-gp-main { grid-column:1; grid-row:1; }
    .hd-gp:nth-child(n+2) { display:none; }
    .hd-gallery-wrap { max-height:260px; }
  }

  /* ── LIGHTBOX ── */
  .hd-lightbox { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:1000; display:flex; align-items:center; justify-content:center; }
  .hd-lightbox-img { max-width:90vw; max-height:85vh; object-fit:contain; border-radius:8px; }
  .hd-lightbox-close { position:absolute; top:20px; right:24px; background:rgba(255,255,255,0.1); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .hd-lightbox-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; color:#fff; width:48px; height:48px; border-radius:50%; font-size:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
  .hd-lightbox-nav:hover { background:rgba(255,255,255,0.2); }
  .hd-lightbox-prev { left:20px; }
  .hd-lightbox-next { right:20px; }
  .hd-lightbox-count { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); color:rgba(255,255,255,0.7); font-size:13px; }

  /* ── STICKY NAV TABS (like Booking.com) ── */
  .hd-nav-tabs {
    background:#fff; border-bottom:1px solid var(--border);
    position:sticky; top:68px; z-index:40;
  }
  .hd-nav-inner { max-width:1180px; margin:0 auto; padding:0 24px; display:flex; gap:0; }
  .hd-nav-tab {
    padding:14px 18px; font-size:13px; font-weight:600; color:var(--muted);
    border-bottom:3px solid transparent; cursor:pointer;
    transition:all 0.15s; white-space:nowrap; background:none; border-top:none; border-left:none; border-right:none;
    font-family:'Roboto',sans-serif;
  }
  .hd-nav-tab:hover { color:var(--text); }
  .hd-nav-tab.active { color:var(--blue); border-bottom-color:var(--blue); }

  /* ── HEADER ── */
  .hd-header-wrap { max-width:1180px; margin:0 auto; padding:20px 24px 0; }
  .hd-breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); margin-bottom:12px; flex-wrap:wrap; }
  .hd-breadcrumb a { color:var(--blue); text-decoration:none; }
  .hd-breadcrumb a:hover { text-decoration:underline; }
  .hd-header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:6px; flex-wrap:wrap; }
  .hd-name { font-size:clamp(1.4rem,3vw,1.9rem); font-weight:800; color:var(--text); margin:0; line-height:1.2; }
  .hd-score-wrap { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .hd-score-label { font-size:13px; font-weight:700; color:var(--text); }
  .hd-score-pill { background:var(--blue); color:#fff; font-size:17px; font-weight:800; padding:8px 13px; border-radius:8px 8px 8px 0; }
  .hd-score-reviews { font-size:11px; color:var(--muted); }
  .hd-meta-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:16px; }
  .hd-stars { color:#F59E0B; font-size:14px; letter-spacing:1px; }
  .hd-location { font-size:13px; color:var(--blue); display:flex; align-items:center; gap:4px; text-decoration:underline; cursor:pointer; }
  .hd-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; background:#ECFDF3; color:#027A48; }

  /* ── BODY ── */
  .hd-body { max-width:1180px; margin:0 auto; padding:24px; display:grid; grid-template-columns:1fr 340px; gap:24px; align-items:start; }
  @media(max-width:960px){ .hd-body { grid-template-columns:1fr; } }

  /* ── SECTIONS ── */
  .hd-section { background:#fff; border-radius:12px; border:1px solid var(--border); padding:22px; margin-bottom:16px; }
  .hd-section:last-child { margin-bottom:0; }
  .hd-section-title { font-size:16px; font-weight:800; color:var(--text); margin:0 0 14px; padding-bottom:12px; border-bottom:1px solid var(--border); }
  .hd-desc { font-size:14px; color:var(--muted); line-height:1.8; font-weight:400; }
  .hd-read-more { color:var(--blue); font-size:13px; font-weight:600; cursor:pointer; border:none; background:none; padding:0; margin-top:8px; display:block; font-family:'Roboto',sans-serif; }

  /* Highlights */
  .hd-highlights { display:flex; flex-direction:column; gap:10px; }
  .hd-highlight { display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--text); }
  .hd-check { width:20px; height:20px; border-radius:50%; background:#ECFDF3; color:#027A48; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; margin-top:1px; }

  /* Amenities */
  .hd-amenities { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  @media(max-width:600px){ .hd-amenities { grid-template-columns:repeat(2,1fr); } }
  .hd-amenity { display:flex; align-items:center; gap:9px; font-size:13px; color:var(--text); padding:10px 12px; background:var(--bg); border-radius:9px; border:1px solid var(--border); font-weight:500; }

  /* Policies */
  .hd-policies { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  @media(max-width:600px){ .hd-policies { grid-template-columns:1fr; } }
  .hd-policy { padding:14px; background:var(--bg); border-radius:10px; border:1px solid var(--border); }
  .hd-policy-icon { font-size:20px; margin-bottom:8px; display:block; }
  .hd-policy-label { font-size:12px; font-weight:700; color:var(--text); margin-bottom:3px; }
  .hd-policy-val   { font-size:12px; color:var(--muted); }

  /* ── BOOKING CARD ── */
  .hd-book-card { background:#fff; border-radius:12px; border:1px solid var(--border); padding:22px; position:sticky; top:120px; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .hd-book-price { font-size:26px; font-weight:800; color:var(--text); letter-spacing:-0.5px; }
  .hd-book-price span { font-size:14px; font-weight:400; color:var(--muted); }
  .hd-book-rating { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); margin:6px 0 18px; }
  .hd-book-score { background:var(--blue); color:#fff; padding:3px 8px; border-radius:6px; font-size:12px; font-weight:700; }
  .hd-book-score-label { font-weight:600; color:var(--text); }

  /* Date box */
  .hd-dates-box { border:2px solid var(--border); border-radius:10px; overflow:hidden; margin-bottom:10px; }
  .hd-dates-row { display:grid; grid-template-columns:1fr 1fr; }
  .hd-date-field { padding:11px 14px; position:relative; }
  .hd-date-field:first-child { border-right:1px solid var(--border); }
  .hd-date-label { font-size:10px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--text); margin-bottom:4px; }
  .hd-date-input { border:none; outline:none; font-size:13px; font-family:'Roboto',sans-serif; color:var(--text); width:100%; background:transparent; cursor:pointer; }
  .hd-dates-box:focus-within { border-color:var(--blue); }
  .hd-nights-badge { text-align:center; font-size:12px; color:var(--muted); margin-bottom:10px; font-weight:500; }

  /* Guests box */
  .hd-guests-box { border:2px solid var(--border); border-radius:10px; padding:11px 14px; margin-bottom:14px; cursor:pointer; transition:border 0.15s; }
  .hd-guests-box:hover { border-color:var(--blue); }
  .hd-guests-label { font-size:10px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--text); margin-bottom:4px; }
  .hd-guests-val   { font-size:13px; color:var(--text); font-weight:500; }
  .hd-counter-panel { border:2px solid var(--border); border-radius:10px; padding:14px; margin-bottom:14px; }
  .hd-counter-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); }
  .hd-counter-row:last-child { border-bottom:none; }
  .hd-counter-name { font-size:13px; font-weight:600; color:var(--text); }
  .hd-counter-sub  { font-size:11px; color:var(--muted); }
  .hd-counter-btns { display:flex; align-items:center; gap:12px; }
  .hd-counter-btn  { width:28px; height:28px; border-radius:50%; border:1.5px solid var(--border); background:#fff; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:600; color:var(--text); transition:all 0.15s; line-height:1; }
  .hd-counter-btn:hover:not(:disabled) { border-color:var(--blue); color:var(--blue); }
  .hd-counter-btn:disabled { opacity:0.3; cursor:not-allowed; }
  .hd-counter-val { font-size:14px; font-weight:700; color:var(--text); min-width:20px; text-align:center; }

  /* Requests */
  .hd-textarea { width:100%; padding:11px 13px; border:2px solid var(--border); border-radius:10px; font-size:13px; font-family:'Roboto',sans-serif; color:var(--text); outline:none; resize:vertical; min-height:80px; margin-bottom:14px; transition:border 0.15s; }
  .hd-textarea:focus { border-color:var(--blue); }
  .hd-textarea-label { font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; display:block; }

  /* Breakdown */
  .hd-breakdown { background:var(--bg); border-radius:10px; padding:14px; margin-bottom:14px; }
  .hd-pb-row { display:flex; justify-content:space-between; font-size:13px; color:var(--muted); margin-bottom:8px; }
  .hd-pb-total { display:flex; justify-content:space-between; font-size:15px; font-weight:800; color:var(--text); padding-top:10px; border-top:1px solid var(--border); }
  .hd-pb-total span:last-child { color:var(--blue); }

  /* Reserve btn */
  .hd-reserve-btn { width:100%; padding:15px; background:var(--blue); color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:800; cursor:pointer; font-family:'Roboto',sans-serif; transition:all 0.2s; margin-bottom:10px; }
  .hd-reserve-btn:hover:not(:disabled) { background:var(--blue-dark); transform:translateY(-1px); box-shadow:0 6px 20px rgba(27,79,138,0.3); }
  .hd-reserve-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .hd-book-note { font-size:11.5px; color:var(--muted); text-align:center; margin-bottom:12px; }
  .hd-trust { display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; }
  .hd-trust-item { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--muted); }

  /* Error/success */
  .hd-error { background:#FEF3F2; border:1px solid #FDA29B; color:#B42318; padding:10px 14px; border-radius:10px; font-size:13px; margin-bottom:14px; font-weight:500; }
  .hd-success { text-align:center; padding:20px 0; }
  .hd-success-icon { font-size:48px; margin-bottom:12px; display:block; }
  .hd-success h3 { font-family:'Roboto',sans-serif; font-size:18px; font-weight:800; color:var(--text); margin:0 0 8px; }
  .hd-success p { font-size:13px; color:var(--muted); margin:0 0 16px; line-height:1.6; }
  .hd-success-id { background:var(--blue-light); border-radius:8px; padding:8px 14px; font-size:12px; color:var(--blue); font-weight:700; margin-bottom:16px; display:inline-block; }
  .hd-success-btn { display:inline-block; background:var(--blue); color:#fff; padding:11px 24px; border-radius:10px; font-size:13px; font-weight:700; text-decoration:none; font-family:'Roboto',sans-serif; }

  /* Loading */
  .hd-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:16px; }
  .hd-spinner { width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--blue); border-radius:50%; animation:hdSpin 0.8s linear infinite; }
  @keyframes hdSpin { to{transform:rotate(360deg);} }

  /* Property highlights box */
  .hd-prop-highlights { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:16px; }
  .hd-prop-hl { background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:500; color:var(--text); }
`;

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [hotel,          setHotel]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [lightboxIdx,    setLightboxIdx]    = useState(0);
  const [showCounters,   setShowCounters]   = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError,   setBookingError]   = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [showFullDesc,   setShowFullDesc]   = useState(false);
  const [activeTab,      setActiveTab]      = useState('overview');

  const today = new Date().toISOString().split('T')[0];
  const [checkIn,  setCheckIn]  = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults,   setAdults]   = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms,    setRooms]    = useState(1);
  const [requests, setRequests] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await hotelService.getHotelById(id);
        setHotel(res.hotel || res);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const basePrice  = (hotel?.pricePerNight || 0) * nights * rooms;
  const serviceFee = Math.round(basePrice * 0.10);
  const tax        = Math.round(basePrice * 0.13);
  const total      = basePrice + serviceFee + tax;

  const guestSummary = `${adults} adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} child${children > 1 ? 'ren' : ''}` : ''} · ${rooms} room${rooms > 1 ? 's' : ''}`;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!checkIn || !checkOut) { setBookingError('Please select check-in and check-out dates.'); return; }
    if (nights <= 0) { setBookingError('Check-out must be after check-in.'); return; }
    setBookingLoading(true);
    setBookingError('');
    try {
      const { data } = await axios.post(
        `${API}/hotel-bookings`,
        { hotelId: id, checkInDate: checkIn, checkOutDate: checkOut, numberOfGuests: adults + children, numberOfRooms: rooms, specialRequests: requests },
        { headers: { Authorization: `Bearer ${authToken()}` } }
      );
      setBookingSuccess(data.booking || data);
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const fallback = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
  const allImages = hotel
    ? [hotel.mainImage, ...(hotel.images || [])].filter(Boolean).filter((v,i,a) => a.indexOf(v) === i)
    : [];

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="hd-root">
        <div className="hd-loading"><div className="hd-spinner" /><p style={{color:'var(--muted)',fontFamily:'Roboto,sans-serif',fontSize:14}}>Loading hotel…</p></div>
      </div>
    </>
  );

  if (!hotel) return (
    <>
      <style>{STYLES}</style>
      <div className="hd-root" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',flexDirection:'column',gap:16,fontFamily:'Roboto,sans-serif'}}>
        <div style={{fontSize:'3rem'}}>🏨</div>
        <h2 style={{color:'var(--text)',fontWeight:800}}>Hotel Not Found</h2>
        <Link to="/browse-hotels" style={{background:'var(--blue)',color:'#fff',padding:'11px 24px',borderRadius:10,fontWeight:700,textDecoration:'none'}}>← Back to Hotels</Link>
      </div>
    </>
  );

  const TABS = ['overview','facilities','policies'];

  return (
    <>
      <style>{STYLES}</style>
      <div className="hd-root">

        {/* ── GALLERY ── */}
        <div className="hd-gallery-wrap" onClick={() => setLightboxOpen(true)}>
          <div className="hd-gallery">
            {/* Main large panel */}
            <div className="hd-gp hd-gp-main">
              <img src={allImages[0] || fallback} alt={hotel.name} onError={e=>{e.target.src=fallback;}} />
            </div>
            {/* 4 smaller panels */}
            {[1,2,3,4].map(i => (
              <div key={i} className="hd-gp" style={i >= allImages.length ? {background:'#E4ECF3',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'} : {}}>
                {allImages[i]
                  ? <img src={allImages[i]} alt="" onError={e=>{e.target.src=fallback;}} />
                  : <span>🏨</span>
                }
                {/* "+X photos" on last visible panel */}
                {i === 4 && allImages.length > 5 && (
                  <div className="hd-gallery-more-btn">+{allImages.length - 5} photos</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="hd-lightbox" onClick={() => setLightboxOpen(false)}>
            <button className="hd-lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
            <button className="hd-lightbox-nav hd-lightbox-prev" onClick={e=>{e.stopPropagation();setLightboxIdx(i=>(i-1+allImages.length)%allImages.length);}}>‹</button>
            <img className="hd-lightbox-img" src={allImages[lightboxIdx]||fallback} alt="" onClick={e=>e.stopPropagation()} onError={e=>{e.target.src=fallback;}} />
            <button className="hd-lightbox-nav hd-lightbox-next" onClick={e=>{e.stopPropagation();setLightboxIdx(i=>(i+1)%allImages.length);}}>›</button>
            <div className="hd-lightbox-count">{lightboxIdx+1} / {allImages.length}</div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="hd-header-wrap">
          <div className="hd-breadcrumb">
            <Link to="/">Home</Link> › <Link to="/browse-hotels">Hotels</Link> › <span>{hotel.name}</span>
          </div>
          <div className="hd-header-row">
            <div>
              <h1 className="hd-name">{hotel.name}</h1>
            </div>
            {hotel.rating > 0 && (
              <div className="hd-score-wrap">
                <div>
                  <div style={{textAlign:'right'}}>
                    <span className="hd-score-label">
                      {hotel.rating >= 4.5 ? 'Exceptional' : hotel.rating >= 4 ? 'Excellent' : 'Very Good'}
                    </span>
                    <div className="hd-score-reviews">{hotel.totalReviews || 0} reviews</div>
                  </div>
                </div>
                <div className="hd-score-pill">{Number(hotel.rating).toFixed(1)}</div>
              </div>
            )}
          </div>
          <div className="hd-meta-row">
            {(hotel.starRating || hotel.stars) > 0 && (
              <span className="hd-stars">{'★'.repeat(Math.min(hotel.starRating||hotel.stars||0,5))}</span>
            )}
            <span className="hd-location">📍 {hotel.address || hotel.location || 'Nepal'}</span>
            {hotel.isActive !== false && <span className="hd-badge">✓ Available</span>}
          </div>
        </div>

        {/* ── NAV TABS ── */}
        <div className="hd-nav-tabs">
          <div className="hd-nav-inner">
            {TABS.map(t => (
              <button key={t} className={`hd-nav-tab${activeTab===t?' active':''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="hd-body">

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* Property highlights strip */}
            {hotel.amenities?.length > 0 && (
              <div className="hd-prop-highlights">
                {hotel.amenities.slice(0,4).map(a => (
                  <div key={a} className="hd-prop-hl">
                    <span style={{fontSize:18}}>{AMENITY_ICONS[a]||'✅'}</span> {a}
                  </div>
                ))}
              </div>
            )}

            {/* About */}
            {activeTab === 'overview' && (
              <>
                <div className="hd-section" id="overview">
                  <h2 className="hd-section-title">About this property</h2>
                  <p className="hd-desc">
                    {showFullDesc || !hotel.description || hotel.description.length <= 300
                      ? (hotel.description || 'Experience exceptional comfort and hospitality at this beautiful property nestled in the heart of Nepal.')
                      : hotel.description.slice(0, 300) + '…'
                    }
                  </p>
                  {hotel.description?.length > 300 && (
                    <button className="hd-read-more" onClick={() => setShowFullDesc(v => !v)}>
                      {showFullDesc ? 'Show less ▲' : 'Read more ▼'}
                    </button>
                  )}
                </div>

                {/* Why guests love it */}
                <div className="hd-section">
                  <h2 className="hd-section-title">Why guests love it</h2>
                  <div className="hd-highlights">
                    {[
                      hotel.location && `Excellent location — ${hotel.location}`,
                      hotel.amenities?.includes('WiFi')       && 'Free WiFi throughout the property',
                      hotel.amenities?.includes('Pool')       && 'Swimming pool available',
                      hotel.amenities?.includes('Restaurant') && 'On-site restaurant',
                      hotel.amenities?.includes('Spa')        && 'Full-service spa & wellness',
                      (hotel.starRating||hotel.stars) >= 4   && `${hotel.starRating||hotel.stars}-star rated property`,
                      'Verified by My Travel Buddy',
                    ].filter(Boolean).slice(0,5).map((h,i) => (
                      <div key={i} className="hd-highlight">
                        <div className="hd-check">✓</div>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                {(hotel.phone || hotel.email || hotel.website) && (
                  <div className="hd-section">
                    <h2 className="hd-section-title">Contact</h2>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {hotel.phone   && <div style={{fontSize:13,color:'var(--text)'}}>📞 {hotel.phone}</div>}
                      {hotel.email   && <div style={{fontSize:13,color:'var(--text)'}}>✉️ {hotel.email}</div>}
                      {hotel.website && <a href={hotel.website} target="_blank" rel="noreferrer" style={{fontSize:13,color:'var(--blue)'}}>🌐 {hotel.website}</a>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Facilities tab */}
            {activeTab === 'facilities' && (
              <div className="hd-section" id="facilities">
                <h2 className="hd-section-title">Facilities & Amenities</h2>
                {hotel.amenities?.length > 0 ? (
                  <div className="hd-amenities">
                    {hotel.amenities.map(a => (
                      <div key={a} className="hd-amenity">
                        <span style={{fontSize:16}}>{AMENITY_ICONS[a]||'✅'}</span> {a}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{fontSize:13,color:'var(--muted)'}}>No amenities listed yet.</p>
                )}
              </div>
            )}

            {/* Policies tab */}
            {activeTab === 'policies' && (
              <div className="hd-section" id="policies">
                <h2 className="hd-section-title">Hotel policies</h2>
                <div className="hd-policies">
                  {[
                    { icon:'🕐', label:'Check-in',  val: `From ${hotel.checkIn||'14:00'}` },
                    { icon:'🚪', label:'Check-out', val: `Until ${hotel.checkOut||'12:00'}` },
                    { icon:'👶', label:'Children',  val: hotel.policies?.childrenAllowed!==false ? 'Children welcome' : 'No children' },
                    { icon:'🐾', label:'Pets',      val: hotel.policies?.petsAllowed ? 'Pets allowed' : 'No pets' },
                    { icon:'🚬', label:'Smoking',   val: hotel.policies?.smokingAllowed ? 'Smoking areas available' : 'Non-smoking property' },
                    { icon:'💳', label:'Payment',   val: 'Pay at property' },
                  ].map(p => (
                    <div key={p.label} className="hd-policy">
                      <span className="hd-policy-icon">{p.icon}</span>
                      <div className="hd-policy-label">{p.label}</div>
                      <div className="hd-policy-val">{p.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {activeTab === 'overview' && (() => {
              const lat = hotel.location?.coordinates?.lat || hotel.coordinates?.latitude || hotel.lat;
              const lng = hotel.location?.coordinates?.lng || hotel.coordinates?.longitude || hotel.lng;
              if (!lat || !lng) return null;
              return (
                <div className="hd-section">
                  <MapView
                    title="📍 Location on Map"
                    height="300px"
                    markers={[{ lat:Number(lat), lng:Number(lng), title:hotel.name, description:hotel.address||hotel.location||'Nepal', primary:true }]}
                  />
                </div>
              );
            })()}

          </div>

          {/* ── BOOKING CARD ── */}
          <div>
            <div className="hd-book-card">
              {bookingSuccess ? (
                <div className="hd-success">
                  <span className="hd-success-icon">🎉</span>
                  <h3>Booking Confirmed!</h3>
                  <p>Your stay at <strong>{hotel.name}</strong> has been booked. You'll receive a confirmation shortly.</p>
                  {bookingSuccess._id && <div className="hd-success-id">ID: {String(bookingSuccess._id).slice(-10).toUpperCase()}</div>}
                  <Link to="/dashboard" className="hd-success-btn">View My Bookings</Link>
                </div>
              ) : (
                <form onSubmit={handleBook}>
                  <div className="hd-book-price">
                    NPR {Number(hotel.pricePerNight||0).toLocaleString()} <span>/ night</span>
                  </div>
                  {hotel.rating > 0 && (
                    <div className="hd-book-rating">
                      <span className="hd-book-score">{Number(hotel.rating).toFixed(1)}</span>
                      <span className="hd-book-score-label">
                        {hotel.rating >= 4.5 ? 'Exceptional' : 'Excellent'}
                      </span>
                      <span>· {hotel.totalReviews||0} reviews</span>
                    </div>
                  )}

                  {bookingError && <div className="hd-error">⚠️ {bookingError}</div>}

                  {/* Dates */}
                  <div className="hd-dates-box">
                    <div className="hd-dates-row">
                      <div className="hd-date-field">
                        <div className="hd-date-label">Check-in</div>
                        <input className="hd-date-input" type="date" required min={today}
                          value={checkIn}
                          onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }} />
                      </div>
                      <div className="hd-date-field">
                        <div className="hd-date-label">Check-out</div>
                        <input className="hd-date-input" type="date" required min={checkIn||today}
                          value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  {nights > 0 && <div className="hd-nights-badge">📅 {nights} night{nights>1?'s':''}</div>}

                  {/* Guests */}
                  <div className="hd-guests-box" onClick={() => setShowCounters(v=>!v)}>
                    <div className="hd-guests-label">Guests & Rooms</div>
                    <div className="hd-guests-val">{guestSummary} {showCounters?'▲':'▼'}</div>
                  </div>

                  {showCounters && (
                    <div className="hd-counter-panel">
                      {[
                        {label:'Adults',   sub:'Age 13+',  val:adults,   set:setAdults,   min:1,max:10},
                        {label:'Children', sub:'Age 0–12', val:children, set:setChildren, min:0,max:6 },
                        {label:'Rooms',    sub:null,       val:rooms,    set:setRooms,    min:1,max:5 },
                      ].map(item => (
                        <div key={item.label} className="hd-counter-row">
                          <div>
                            <div className="hd-counter-name">{item.label}</div>
                            {item.sub && <div className="hd-counter-sub">{item.sub}</div>}
                          </div>
                          <div className="hd-counter-btns">
                            <button type="button" className="hd-counter-btn" disabled={item.val<=item.min} onClick={()=>item.set(v=>v-1)}>−</button>
                            <span className="hd-counter-val">{item.val}</span>
                            <button type="button" className="hd-counter-btn" disabled={item.val>=item.max} onClick={()=>item.set(v=>v+1)}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special requests */}
                  <label className="hd-textarea-label">Special requests (optional)</label>
                  <textarea className="hd-textarea" placeholder="e.g. Early check-in, high floor, dietary requirements…" value={requests} onChange={e=>setRequests(e.target.value)} />

                  {/* Price breakdown */}
                  {nights > 0 && (
                    <div className="hd-breakdown">
                      <div className="hd-pb-row">
                        <span>NPR {Number(hotel.pricePerNight).toLocaleString()} × {nights} night{nights>1?'s':''} × {rooms} room{rooms>1?'s':''}</span>
                        <span>NPR {basePrice.toLocaleString()}</span>
                      </div>
                      <div className="hd-pb-row"><span>Service fee (10%)</span><span>NPR {serviceFee.toLocaleString()}</span></div>
                      <div className="hd-pb-row"><span>Taxes (13% VAT)</span><span>NPR {tax.toLocaleString()}</span></div>
                      <div className="hd-pb-total">
                        <span>Total</span><span>NPR {total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="hd-reserve-btn" disabled={bookingLoading||!checkIn||!checkOut}>
                    {bookingLoading ? '⏳ Booking…' : nights > 0 ? `Reserve · NPR ${total.toLocaleString()}` : 'Reserve Now'}
                  </button>
                  <p className="hd-book-note">You won't be charged yet · Free cancellation available</p>
                  <div className="hd-trust">
                    <div className="hd-trust-item">🔒 Secure</div>
                    <div className="hd-trust-item">✅ Instant confirmation</div>
                    <div className="hd-trust-item">🇳🇵 Local support</div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
