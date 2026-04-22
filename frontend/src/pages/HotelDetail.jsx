import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Star, Wifi, Car, Utensils, Dumbbell, Waves, Wind,
  Tv, ShieldCheck, Coffee, Plane, WashingMachine, Flame, Trees,
  Users, BedDouble, ChevronRight, ChevronLeft, X, Grid2X2,
  BadgeCheck, Clock, CreditCard, Phone, CalendarDays, ArrowRight,
  AlertCircle, CheckCircle2, Sparkles
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import hotelService from '../services/hotelService';
import MapView from '../components/MapView';

// ─── Amenity icon map using Lucide icons ──────────────────────────────────────
const AMENITY_ICON_MAP = {
  'WiFi':           { icon: Wifi,           label: 'Free WiFi' },
  'Pool':           { icon: Waves,          label: 'Swimming Pool' },
  'Gym':            { icon: Dumbbell,       label: 'Fitness Center' },
  'Restaurant':     { icon: Utensils,       label: 'Restaurant' },
  'Bar':            { icon: Coffee,         label: 'Bar & Lounge' },
  'Spa':            { icon: Sparkles,       label: 'Spa & Wellness' },
  'Parking':        { icon: Car,            label: 'Free Parking' },
  'Room Service':   { icon: BedDouble,      label: 'Room Service' },
  'Airport Shuttle':{ icon: Plane,          label: 'Airport Shuttle' },
  'Laundry':        { icon: WashingMachine, label: 'Laundry Service' },
  'AC':             { icon: Wind,           label: 'Air Conditioning' },
  'Heating':        { icon: Flame,          label: 'Heating' },
  'TV':             { icon: Tv,             label: 'Flat-screen TV' },
  'Safe':           { icon: ShieldCheck,    label: 'In-room Safe' },
  'Balcony':        { icon: Trees,          label: 'Balcony / Terrace' },
};

const TABS = ['overview', 'rooms', 'amenities', 'policies', 'map'];

const FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

// ─── CSS injected once ────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --green: #16a34a;
  --green-dark: #0f7a35;
  --green-light: #f0fdf4;
  --green-mid: #dcfce7;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --bg: #f8fafc;
  --card: #ffffff;
  --amber: #f59e0b;
}

.hd-root { font-family: 'DM Sans', sans-serif; background: var(--bg); padding-top: 68px; min-height: 100vh; color: var(--text); }

/* ── Gallery ── */
.hd-gallery-wrap { position: relative; background: #0f172a; }
.hd-gallery { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 220px 220px; gap: 3px; height: 440px; }
.hd-gp { overflow: hidden; position: relative; background: #1e293b; }
.hd-gp img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
.hd-gp:hover img { transform: scale(1.05); }
.hd-gp-main { grid-column: 1; grid-row: 1 / 3; }
.hd-gp:nth-child(2) { grid-column: 2; grid-row: 1; }
.hd-gp:nth-child(3) { grid-column: 3; grid-row: 1; }
.hd-gp:nth-child(4) { grid-column: 2; grid-row: 2; }
.hd-gp:nth-child(5) { grid-column: 3; grid-row: 2; }
.hd-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #e2e8f0; color: #94a3b8; }
.hd-gallery-btn { position: absolute; bottom: 16px; right: 16px; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,0.1); color: var(--text); padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; font-family: inherit; transition: all 0.15s; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
.hd-gallery-btn:hover { background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.16); }
@media(max-width:768px) {
  .hd-gallery { grid-template-columns: 1fr; grid-template-rows: 280px; height: 280px; }
  .hd-gp-main { grid-column: 1; grid-row: 1; }
  .hd-gp:nth-child(n+2) { display: none; }
}

/* ── Lightbox ── */
.hd-lb { position: fixed; inset: 0; background: rgba(0,0,0,0.94); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: hdFadeIn 0.2s ease; }
@keyframes hdFadeIn { from { opacity: 0; } to { opacity: 1; } }
.hd-lb-img { max-width: 88vw; max-height: 82vh; object-fit: contain; border-radius: 8px; }
.hd-lb-close { position: absolute; top: 20px; right: 24px; background: rgba(255,255,255,0.12); border: none; color: #fff; width: 42px; height: 42px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
.hd-lb-close:hover { background: rgba(255,255,255,0.22); }
.hd-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.12); border: none; color: #fff; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
.hd-lb-nav:hover { background: rgba(255,255,255,0.22); }
.hd-lb-prev { left: 20px; }
.hd-lb-next { right: 20px; }
.hd-lb-count { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.65); font-size: 13px; }

/* ── Header ── */
.hd-header { max-width: 1200px; margin: 0 auto; padding: 24px 24px 0; }
.hd-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); margin-bottom: 14px; flex-wrap: wrap; }
.hd-breadcrumb a { color: var(--green); text-decoration: none; font-weight: 500; }
.hd-breadcrumb a:hover { text-decoration: underline; }
.hd-breadcrumb-sep { color: #cbd5e1; }
.hd-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
.hd-hotel-name { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; color: var(--text); margin: 0; line-height: 1.2; letter-spacing: -0.02em; }
.hd-score-block { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.hd-score-badge { background: var(--green); color: #fff; font-size: 18px; font-weight: 700; padding: 8px 14px; border-radius: 10px 10px 10px 2px; letter-spacing: -0.5px; }
.hd-score-text { text-align: right; }
.hd-score-label { font-size: 13px; font-weight: 600; color: var(--text); display: block; }
.hd-score-reviews { font-size: 11px; color: var(--muted); }
.hd-meta-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
.hd-stars { display: flex; gap: 2px; align-items: center; }
.hd-star { color: var(--amber); }
.hd-star-empty { color: #d1d5db; }
.hd-location-tag { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--green); font-weight: 500; cursor: pointer; }
.hd-location-tag:hover { text-decoration: underline; }
.hd-pill { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.hd-pill-green { background: var(--green-mid); color: var(--green-dark); }
.hd-pill-red { background: #fef2f2; color: #dc2626; }
.hd-verified { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--green); font-weight: 600; background: var(--green-light); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--green-mid); }

/* ── Nav tabs ── */
.hd-tabs { background: var(--card); border-bottom: 1px solid var(--border); position: sticky; top: 68px; z-index: 40; }
.hd-tabs-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; gap: 0; overflow-x: auto; scrollbar-width: none; }
.hd-tabs-inner::-webkit-scrollbar { display: none; }
.hd-tab { padding: 14px 20px; font-size: 13.5px; font-weight: 600; color: var(--muted); border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap; background: none; border-top: none; border-left: none; border-right: none; font-family: 'DM Sans', sans-serif; text-transform: capitalize; }
.hd-tab:hover { color: var(--text); }
.hd-tab.active { color: var(--green); border-bottom-color: var(--green); }

/* ── Body layout ── */
.hd-body { max-width: 1200px; margin: 0 auto; padding: 28px 24px; display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
@media(max-width: 980px) { .hd-body { grid-template-columns: 1fr; } .hd-sticky-panel { position: static !important; } }

/* ── Cards ── */
.hd-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; margin-bottom: 16px; }
.hd-card:last-child { margin-bottom: 0; }
.hd-card-title { font-size: 15px; font-weight: 700; color: var(--text); margin: 0 0 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }

/* ── Overview ── */
.hd-desc { font-size: 14px; color: var(--muted); line-height: 1.85; }
.hd-read-more { color: var(--green); font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: none; padding: 0; margin-top: 10px; display: inline-flex; align-items: center; gap: 4px; font-family: inherit; }
.hd-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0; }
@media(max-width:600px) { .hd-highlights { grid-template-columns: 1fr; } }
.hd-highlight { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text); background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; font-weight: 500; }
.hd-check-circle { width: 22px; height: 22px; border-radius: 50%; background: var(--green-mid); color: var(--green); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* ── Rooms ── */
.hd-room-grid { display: flex; flex-direction: column; gap: 14px; }
.hd-room-card { border: 2px solid var(--border); border-radius: 14px; overflow: hidden; transition: all 0.2s; background: var(--card); cursor: pointer; display: grid; grid-template-columns: 180px 1fr; }
@media(max-width:600px) { .hd-room-card { grid-template-columns: 1fr; } }
.hd-room-card:hover:not(.hd-room-soldout) { border-color: var(--green); box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
.hd-room-card.hd-room-selected { border-color: var(--green); box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }
.hd-room-card.hd-room-soldout { opacity: 0.6; cursor: not-allowed; }
.hd-room-img { width: 180px; height: 100%; min-height: 140px; object-fit: cover; display: block; background: #e2e8f0; }
@media(max-width:600px) { .hd-room-img { width: 100%; height: 160px; } }
.hd-room-body { padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
.hd-room-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.hd-room-name { font-size: 15px; font-weight: 700; color: var(--text); }
.hd-room-price { text-align: right; flex-shrink: 0; }
.hd-room-price-main { font-size: 17px; font-weight: 700; color: var(--green); }
.hd-room-price-night { font-size: 11px; color: var(--muted); font-weight: 400; }
.hd-room-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.hd-room-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--muted); font-weight: 500; }
.hd-room-avail { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.hd-avail-ok { background: var(--green-mid); color: var(--green-dark); }
.hd-avail-low { background: #fffbeb; color: #92400e; }
.hd-avail-none { background: #fef2f2; color: #dc2626; }
.hd-room-bottom { display: flex; align-items: center; justify-content: space-between; }
.hd-room-select-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--green); color: #fff; border: none; border-radius: 9px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.hd-room-select-btn:hover { background: var(--green-dark); transform: translateY(-1px); }
.hd-room-select-btn.selected { background: #0f172a; }
.hd-room-selected-check { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--green); }

/* ── Amenities ── */
.hd-amenity-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
@media(max-width:600px) { .hd-amenity-grid { grid-template-columns: repeat(2, 1fr); } }
.hd-amenity { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text); padding: 12px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; font-weight: 500; }
.hd-amenity-icon { color: var(--green); flex-shrink: 0; }

/* ── Policies ── */
.hd-policy-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media(max-width:600px) { .hd-policy-grid { grid-template-columns: 1fr; } }
.hd-policy-item { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
.hd-policy-icon { color: var(--green); margin-bottom: 10px; }
.hd-policy-label { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.hd-policy-val { font-size: 12px; color: var(--muted); line-height: 1.5; }

/* ── Sticky booking panel ── */
.hd-sticky-panel { position: sticky; top: 124px; }
.hd-book-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: 0 4px 32px rgba(0,0,0,0.08); }
.hd-book-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
.hd-book-price { font-size: 28px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
.hd-book-price-night { font-size: 14px; color: var(--muted); font-weight: 400; }
.hd-book-rating-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
.hd-book-score { background: var(--green); color: #fff; padding: 3px 9px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.hd-book-score-text { font-size: 12px; color: var(--muted); font-weight: 500; }
.hd-book-divider { height: 1px; background: var(--border); margin: 16px 0; }
.hd-select-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; }
.hd-select { width: 100%; padding: 11px 13px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; background: #fff; margin-bottom: 14px; transition: border 0.15s; -webkit-appearance: none; cursor: pointer; }
.hd-select:focus { border-color: var(--green); }
.hd-price-breakdown { background: var(--bg); border-radius: 10px; padding: 14px; margin-bottom: 16px; }
.hd-price-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
.hd-price-row:last-child { margin-bottom: 0; font-weight: 700; color: var(--text); font-size: 14px; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px; }
.hd-reserve-btn { width: 100%; padding: 15px; background: var(--green); color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.hd-reserve-btn:hover:not(:disabled) { background: var(--green-dark); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(22,163,74,0.3); }
.hd-reserve-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.hd-book-note { font-size: 11.5px; color: var(--muted); text-align: center; margin-bottom: 14px; }
.hd-trust-row { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
.hd-trust-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); font-weight: 500; }
.hd-sold-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #dc2626; font-weight: 600; margin-bottom: 14px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px; }

/* ── Loading / Error ── */
.hd-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
.hd-spinner { width: 42px; height: 42px; border: 3px solid var(--green-mid); border-top-color: var(--green); border-radius: 50%; animation: hdSpin 0.8s linear infinite; }
@keyframes hdSpin { to { transform: rotate(360deg); } }
`;

// ─── Inject CSS once ──────────────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('hd-styles')) {
  const s = document.createElement('style');
  s.id = 'hd-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ─── Helper: star rating ──────────────────────────────────────────────────────
function StarRating({ value = 0 }) {
  const n = Math.min(Math.round(value), 5);
  return (
    <div className="hd-stars">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} fill={i <= n ? '#f59e0b' : 'none'}
          className={i <= n ? 'hd-star' : 'hd-star-empty'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

// ─── Helper: availability badge ───────────────────────────────────────────────
function availInfo(rt) {
  if (rt.availableRooms == null && rt.totalRooms == null)
    return { avail: 999, cls: 'hd-avail-ok', label: 'Available' };
  const avail = rt.availableRooms != null ? rt.availableRooms : (rt.totalRooms || 0);
  if (avail <= 0)  return { avail: 0,     cls: 'hd-avail-none', label: 'Sold out' };
  if (avail <= 3)  return { avail,         cls: 'hd-avail-low',  label: `Only ${avail} left!` };
  return           { avail,               cls: 'hd-avail-ok',   label: `${avail} available` };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HotelDetail() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const { user }       = useContext(AuthContext);

  const [hotel,           setHotel]           = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState('overview');
  const [lightboxOpen,    setLightboxOpen]    = useState(false);
  const [lightboxIdx,     setLightboxIdx]     = useState(0);
  const [showFullDesc,    setShowFullDesc]    = useState(false);
  const [selectedRoom,    setSelectedRoom]    = useState(null); // room type string

  // ── Load hotel ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await hotelService.getHotelById(id);
        const h   = res.hotel || res;
        if (!cancelled) {
          setHotel(h);
          // Pre-select first available room
          if (h.roomTypes?.length > 0) {
            const first = h.roomTypes.find(rt => availInfo(rt).avail > 0);
            setSelectedRoom(first?.type || null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const allImages = hotel
    ? [hotel.mainImage, ...(hotel.images || [])].filter(Boolean).filter((v,i,a) => a.indexOf(v) === i)
    : [];

  const hasRoomTypes   = hotel?.roomTypes?.length > 0;
  const selectedRtObj  = hasRoomTypes && selectedRoom
    ? hotel.roomTypes.find(r => r.type === selectedRoom)
    : null;

  const nightlyPrice   = selectedRtObj?.price || hotel?.pricePerNight || 0;

  const isFullySoldOut = hasRoomTypes &&
    hotel.roomTypes.every(rt => availInfo(rt).avail <= 0);

  const selectedSoldOut = hasRoomTypes && selectedRoom &&
    hotel.roomTypes.some(rt => rt.type === selectedRoom && availInfo(rt).avail <= 0);

  const scoreLabel = !hotel?.rating ? '' :
    hotel.rating >= 4.5 ? 'Exceptional' :
    hotel.rating >= 4   ? 'Excellent'   :
    hotel.rating >= 3   ? 'Very Good'   : 'Good';

  // ── Navigate to checkout ────────────────────────────────────────────────────
  const handleReserve = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/hotels/${id}/checkout`, {
      state: {
        hotel,
        selectedRoomType: selectedRoom,
        pricePerNight:    nightlyPrice,
      }
    });
  };

  // ── Lightbox keys ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = e => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft')  setLightboxIdx(i => (i - 1 + allImages.length) % allImages.length);
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i + 1) % allImages.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, allImages.length]);

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (loading) return (
    <div className="hd-root">
      <div className="hd-loading">
        <div className="hd-spinner" />
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading hotel…</p>
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="hd-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', flexDirection:'column', gap:16 }}>
      <AlertCircle size={48} color="#dc2626" />
      <h2 style={{ color:'var(--text)', fontWeight:700, margin:0 }}>Hotel Not Found</h2>
      <Link to="/browse-hotels" style={{ background:'var(--green)', color:'#fff', padding:'11px 24px', borderRadius:10, fontWeight:700, textDecoration:'none', fontSize:14 }}>
        Back to Hotels
      </Link>
    </div>
  );

  const amenities   = hotel.amenities   || [];
  const policies    = hotel.policies    || {};
  const description = hotel.description || '';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="hd-root">

      {/* ── HERO GALLERY ──────────────────────────────────────────────────── */}
      <div className="hd-gallery-wrap">
        <div className="hd-gallery">
          {/* Main image */}
          <div className="hd-gp hd-gp-main" onClick={() => { setLightboxIdx(0); setLightboxOpen(true); }} style={{ cursor:'pointer' }}>
            {allImages[0]
              ? <img src={allImages[0]} alt={hotel.name} onError={e => e.target.src = FALLBACK} />
              : <div className="hd-placeholder"><BedDouble size={48} /></div>
            }
          </div>
          {/* Thumbnail slots */}
          {[1,2,3,4].map(i => (
            <div key={i} className="hd-gp" onClick={() => { setLightboxIdx(i); setLightboxOpen(true); }} style={{ cursor: allImages[i] ? 'pointer' : 'default' }}>
              {allImages[i]
                ? <img src={allImages[i]} alt="" onError={e => e.target.src = FALLBACK} />
                : <div className="hd-placeholder"><BedDouble size={32} /></div>
              }
            </div>
          ))}
        </div>
        <button className="hd-gallery-btn" onClick={() => setLightboxOpen(true)}>
          <Grid2X2 size={14} />
          Show all photos
        </button>
      </div>

      {/* ── LIGHTBOX ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="hd-lb" onClick={() => setLightboxOpen(false)}>
          <button className="hd-lb-close" onClick={() => setLightboxOpen(false)}><X size={18} /></button>
          <button className="hd-lb-nav hd-lb-prev" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i-1+allImages.length)%allImages.length); }}>
            <ChevronLeft size={22} />
          </button>
          <img className="hd-lb-img" src={allImages[lightboxIdx] || FALLBACK} alt="" onClick={e => e.stopPropagation()} onError={e => e.target.src = FALLBACK} />
          <button className="hd-lb-nav hd-lb-next" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i+1)%allImages.length); }}>
            <ChevronRight size={22} />
          </button>
          <div className="hd-lb-count">{lightboxIdx + 1} / {allImages.length || 1}</div>
        </div>
      )}

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="hd-header">
        {/* Breadcrumb */}
        <nav className="hd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={12} className="hd-breadcrumb-sep" />
          <Link to="/browse-hotels">Hotels</Link>
          <ChevronRight size={12} className="hd-breadcrumb-sep" />
          <span>{hotel.name}</span>
        </nav>

        {/* Title row */}
        <div className="hd-title-row">
          <h1 className="hd-hotel-name">{hotel.name}</h1>
          {hotel.rating > 0 && (
            <div className="hd-score-block">
              <div className="hd-score-text">
                <span className="hd-score-label">{scoreLabel}</span>
                <span className="hd-score-reviews">{hotel.totalReviews || 0} reviews</span>
              </div>
              <div className="hd-score-badge">{Number(hotel.rating).toFixed(1)}</div>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="hd-meta-row">
          {(hotel.starRating || hotel.stars) > 0 && (
            <StarRating value={hotel.starRating || hotel.stars} />
          )}
          <span className="hd-location-tag" onClick={() => setActiveTab('map')}>
            <MapPin size={13} />
            {hotel.address || hotel.location || 'Nepal'}
          </span>
          {hotel.isActive !== false && !isFullySoldOut && (
            <span className="hd-pill hd-pill-green">Available</span>
          )}
          {isFullySoldOut && (
            <span className="hd-pill hd-pill-red">Fully Booked</span>
          )}
          <span className="hd-verified">
            <BadgeCheck size={13} />
            Verified by My Travel Buddy
          </span>
        </div>
      </div>

      {/* ── NAVIGATION TABS ───────────────────────────────────────────────── */}
      <div className="hd-tabs">
        <div className="hd-tabs-inner">
          {TABS.map(t => (
            <button
              key={t}
              className={`hd-tab${activeTab === t ? ' active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'rooms' ? `Rooms${hasRoomTypes ? ` (${hotel.roomTypes.length})` : ''}` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="hd-body">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="hd-card">
                <p className="hd-card-title">About this property</p>
                <p className="hd-desc" style={{ margin:0 }}>
                  {showFullDesc || description.length <= 280
                    ? description || 'No description available.'
                    : description.slice(0, 280) + '…'}
                </p>
                {description.length > 280 && (
                  <button className="hd-read-more" onClick={() => setShowFullDesc(v => !v)}>
                    {showFullDesc ? 'Show less' : 'Read more'}
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>

              {/* Property highlights */}
              {hotel.highlights?.length > 0 && (
                <div className="hd-card">
                  <p className="hd-card-title">Why guests love it</p>
                  <div className="hd-highlights">
                    {hotel.highlights.map((h, i) => (
                      <div key={i} className="hd-highlight">
                        <div className="hd-check-circle"><CheckCircle2 size={13} /></div>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenity quick preview (top 6) */}
              {amenities.length > 0 && (
                <div className="hd-card">
                  <p className="hd-card-title">Top amenities</p>
                  <div className="hd-amenity-grid">
                    {amenities.slice(0, 6).map((a, i) => {
                      const entry = AMENITY_ICON_MAP[a];
                      const IconComp = entry?.icon || CheckCircle2;
                      return (
                        <div key={i} className="hd-amenity">
                          <IconComp size={16} className="hd-amenity-icon" />
                          {entry?.label || a}
                        </div>
                      );
                    })}
                  </div>
                  {amenities.length > 6 && (
                    <button className="hd-read-more" style={{ marginTop:12 }} onClick={() => setActiveTab('amenities')}>
                      View all {amenities.length} amenities <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* ROOMS TAB */}
          {activeTab === 'rooms' && (
            <div className="hd-card">
              <p className="hd-card-title">Available room types</p>
              {hasRoomTypes ? (
                <div className="hd-room-grid">
                  {hotel.roomTypes.map((rt, i) => {
                    const { avail, cls, label } = availInfo(rt);
                    const price = rt.price || hotel.pricePerNight || 0;
                    const isSelected = selectedRoom === rt.type;
                    const isSoldOut  = avail <= 0;
                    return (
                      <div
                        key={i}
                        className={`hd-room-card${isSelected ? ' hd-room-selected' : ''}${isSoldOut ? ' hd-room-soldout' : ''}`}
                        onClick={() => !isSoldOut && setSelectedRoom(rt.type)}
                      >
                        {/* Room thumbnail */}
                        <div style={{ overflow:'hidden', background:'#e2e8f0', minHeight:140 }}>
                          {allImages[0]
                            ? <img src={allImages[0]} alt={rt.type} className="hd-room-img" onError={e => e.target.src = FALLBACK} />
                            : <div style={{ width:180, minHeight:140, display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', color:'#94a3b8' }}>
                                <BedDouble size={36} />
                              </div>
                          }
                        </div>

                        <div className="hd-room-body">
                          <div className="hd-room-top">
                            <div className="hd-room-name">{rt.type}</div>
                            <div className="hd-room-price">
                              <div className="hd-room-price-main">NPR {Number(price).toLocaleString()}</div>
                              <div className="hd-room-price-night">/ night</div>
                            </div>
                          </div>

                          <div className="hd-room-meta">
                            <div className="hd-room-meta-item">
                              <Users size={13} /> Up to {rt.maxGuests || 2} guests
                            </div>
                            {rt.totalRooms && (
                              <div className="hd-room-meta-item">
                                <BedDouble size={13} /> {rt.totalRooms} rooms total
                              </div>
                            )}
                          </div>

                          <div className="hd-room-bottom">
                            <span className={`hd-room-avail ${cls}`}>{label}</span>
                            {!isSoldOut ? (
                              <button
                                className={`hd-room-select-btn${isSelected ? ' selected' : ''}`}
                                onClick={e => { e.stopPropagation(); setSelectedRoom(rt.type); }}
                              >
                                {isSelected ? <><CheckCircle2 size={14} /> Selected</> : 'Select room'}
                              </button>
                            ) : (
                              <span style={{ fontSize:12, color:'#dc2626', fontWeight:600 }}>Unavailable</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize:14, color:'var(--muted)' }}>
                  No room types listed. Contact the hotel directly.
                </p>
              )}
            </div>
          )}

          {/* AMENITIES TAB */}
          {activeTab === 'amenities' && (
            <div className="hd-card">
              <p className="hd-card-title">All amenities</p>
              {amenities.length > 0 ? (
                <div className="hd-amenity-grid">
                  {amenities.map((a, i) => {
                    const entry = AMENITY_ICON_MAP[a];
                    const IconComp = entry?.icon || CheckCircle2;
                    return (
                      <div key={i} className="hd-amenity">
                        <IconComp size={16} className="hd-amenity-icon" />
                        {entry?.label || a}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize:14, color:'var(--muted)' }}>No amenities listed.</p>
              )}
            </div>
          )}

          {/* POLICIES TAB */}
          {activeTab === 'policies' && (
            <div className="hd-card">
              <p className="hd-card-title">Hotel policies</p>
              <div className="hd-policy-grid">
                <div className="hd-policy-item">
                  <div className="hd-policy-icon"><CalendarDays size={20} /></div>
                  <div className="hd-policy-label">Check-in</div>
                  <div className="hd-policy-val">{policies.checkIn || 'From 12:00 PM'}</div>
                </div>
                <div className="hd-policy-item">
                  <div className="hd-policy-icon"><Clock size={20} /></div>
                  <div className="hd-policy-label">Check-out</div>
                  <div className="hd-policy-val">{policies.checkOut || 'Until 11:00 AM'}</div>
                </div>
                <div className="hd-policy-item">
                  <div className="hd-policy-icon"><CreditCard size={20} /></div>
                  <div className="hd-policy-label">Payment</div>
                  <div className="hd-policy-val">{policies.payment || 'eSewa, Cash, Bank Transfer'}</div>
                </div>
                <div className="hd-policy-item">
                  <div className="hd-policy-icon"><ShieldCheck size={20} /></div>
                  <div className="hd-policy-label">Cancellation</div>
                  <div className="hd-policy-val">{policies.cancellation || 'Free cancellation up to 24h before check-in'}</div>
                </div>
                <div className="hd-policy-item">
                  <div className="hd-policy-icon"><Users size={20} /></div>
                  <div className="hd-policy-label">Children</div>
                  <div className="hd-policy-val">{policies.children || 'Children of all ages welcome'}</div>
                </div>
                <div className="hd-policy-item">
                  <div className="hd-policy-icon"><Phone size={20} /></div>
                  <div className="hd-policy-label">Contact</div>
                  <div className="hd-policy-val">{hotel.phone || hotel.contact || 'Available at front desk'}</div>
                </div>
              </div>
            </div>
          )}

          {/* MAP TAB */}
          {activeTab === 'map' && (
            <div className="hd-card">
              <p className="hd-card-title">Location</p>
              <p style={{ fontSize:13, color:'var(--muted)', display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
                <MapPin size={13} color="var(--green)" />
                {hotel.address || hotel.location || 'Nepal'}
              </p>
              {hotel.location?.coordinates ? (
                <div style={{ borderRadius:12, overflow:'hidden', height:320 }}>
                  <MapView
                    latitude={hotel.location.coordinates[1]}
                    longitude={hotel.location.coordinates[0]}
                  />
                </div>
              ) : (
                <div style={{ background:'#f1f5f9', height:280, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10, color:'#94a3b8' }}>
                  <MapPin size={32} />
                  <span style={{ fontSize:13 }}>Map coordinates not available</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN: STICKY BOOKING PANEL ──────────────────────────── */}
        <div className="hd-sticky-panel">
          <div className="hd-book-card">

            {/* Price */}
            <div className="hd-book-price-row">
              <span className="hd-book-price">NPR {Number(nightlyPrice).toLocaleString()}</span>
              <span className="hd-book-price-night">/ night</span>
            </div>

            {/* Rating */}
            {hotel.rating > 0 && (
              <div className="hd-book-rating-row">
                <span className="hd-book-score">{Number(hotel.rating).toFixed(1)}</span>
                <StarRating value={hotel.rating} />
                <span className="hd-book-score-text">{hotel.totalReviews || 0} reviews</span>
              </div>
            )}

            <div className="hd-book-divider" />

            {/* Room type selector */}
            {hasRoomTypes && (
              <>
                <span className="hd-select-label">Select room type</span>
                <select
                  className="hd-select"
                  value={selectedRoom || ''}
                  onChange={e => setSelectedRoom(e.target.value)}
                >
                  {hotel.roomTypes.map((rt, i) => {
                    const { avail, label } = availInfo(rt);
                    return (
                      <option key={i} value={rt.type} disabled={avail <= 0}>
                        {rt.type} — NPR {Number(rt.price || hotel.pricePerNight || 0).toLocaleString()} {avail <= 0 ? '(Sold out)' : `(${label})`}
                      </option>
                    );
                  })}
                </select>
              </>
            )}

            {/* Sold out banner */}
            {(isFullySoldOut || selectedSoldOut) && (
              <div className="hd-sold-banner">
                <AlertCircle size={14} />
                {isFullySoldOut ? 'All rooms are fully booked' : 'This room type is sold out'}
              </div>
            )}

            {/* Price breakdown — shows after room selected */}
            {selectedRoom && !selectedSoldOut && (
              <div className="hd-price-breakdown">
                <div className="hd-price-row">
                  <span>NPR {Number(nightlyPrice).toLocaleString()} × per night</span>
                  <span style={{ color:'var(--muted)', fontSize:11 }}>Add dates for total</span>
                </div>
                <div className="hd-price-row">
                  <span>Taxes & fees</span>
                  <span>Included</span>
                </div>
                <div className="hd-price-row">
                  <span>Total (per night)</span>
                  <span>NPR {Number(nightlyPrice).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Reserve button */}
            <button
              className="hd-reserve-btn"
              disabled={isFullySoldOut || selectedSoldOut || hotel.isActive === false}
              onClick={handleReserve}
            >
              Reserve Now
              <ArrowRight size={16} />
            </button>

            <p className="hd-book-note">
              You won't be charged yet • Free cancellation available
            </p>

            {/* Trust signals */}
            <div className="hd-trust-row">
              <div className="hd-trust-item"><ShieldCheck size={12} color="var(--green)" /> Secure</div>
              <div className="hd-trust-item"><CheckCircle2 size={12} color="var(--green)" /> Instant confirmation</div>
              <div className="hd-trust-item"><Phone size={12} color="var(--green)" /> Local support</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
