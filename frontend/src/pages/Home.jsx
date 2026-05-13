import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Clock, MapPin, Star, Search, ArrowRight,
  Calendar, Users, Heart,
  Map, DollarSign, RefreshCw, Compass,
  ShieldCheck, UserCheck, FileText, CloudSun, Headphones, MessageSquare,
  Mountain, Hotel, TreePine, Globe, Tent, Binoculars,
  Navigation, Landmark, Waves, Leaf
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const tok = () => localStorage.getItem('nt_token');

// Fallback icons per region difficulty / tag (used when no image available)
const REGION_ICON_MAP = {
  // difficulty-based
  'Easy':          TreePine,
  'Moderate':      Mountain,
  'Challenging':   Mountain,
  'Expert':        Mountain,
  // tag-based
  'High Altitude': Mountain,
  'Most Popular':  Compass,
  'Hidden Gem':    TreePine,
  'Restricted':    Landmark,
  'City Base':     Globe,
  'Wildlife':      Binoculars,
  'default':       Navigation,
};

// Gradient palettes cycling per card
const DEST_GRADIENTS = [
  'linear-gradient(135deg, #0d3320 0%, #16a34a 100%)',
  'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
  'linear-gradient(135deg, #3b1f00 0%, #d97706 100%)',
  'linear-gradient(135deg, #2d0a3f 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #1a0a00 0%, #c2410c 100%)',
];

const TOOLS = [
  { icon: Map,         title: 'Itinerary Planner', desc: 'Build your day-by-day Nepal trip plan', link: '/itinerary-planner' },
  { icon: DollarSign,  title: 'Budget Calculator',  desc: 'Estimate costs for your journey',      link: '/budget-planner' },
  { icon: RefreshCw,   title: 'Currency Exchanger', desc: 'Live NPR exchange rates',              link: '/currency-exchanger' },
  // { icon: Compass,     title: 'Trail Maps',          desc: 'Explore Nepal offline maps',          link: '/browse-destinations' },
];

const WHY_ITEMS = [
  { icon: ShieldCheck,    title: 'Verified Hotels & Packages',  desc: 'Every listing is reviewed and quality-checked by our local team in Nepal.' },
  { icon: UserCheck,      title: 'Certified Local Guides',      desc: 'Connect with 200+ government-verified trekking guides across all regions.' },
  { icon: FileText,       title: 'Permit Guidance',             desc: 'Complete permit requirements and application process, all in one place.' },
  // { icon: CloudSun,       title: 'Real-time Trail Info',        desc: 'Up-to-date trail conditions, weather forecasts, and seasonal alerts.' },
  { icon: Headphones,     title: '24/7 Support',                desc: 'Emergency contact staffed by experienced Nepal travel coordinators.' },
  { icon: MessageSquare,  title: 'Honest Reviews',              desc: 'Real itineraries from real travelers. No sponsored content, no bias.' },
];

const STATUS_CFG = {
  confirmed: { bg: '#dcfce7', color: '#15803d', dot: '#16a34a', label: 'Confirmed' },
  pending:   { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04', label: 'Pending' },
  completed: { bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed', label: 'Completed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626', label: 'Cancelled' },
};

const DIFF_COLORS = {
  Easy:        { bg: '#dcfce7', color: '#166534' },
  Moderate:    { bg: '#fef3c7', color: '#92400e' },
  Challenging: { bg: '#fee2e2', color: '#991b1b' },
  Expert:      { bg: '#ede9fe', color: '#5b21b6' },
};

/* skeleton */
const Skel = ({ w = '100%', h = 16, r = 8 }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#e8f5ee 25%,#d4eddf 50%,#e8f5ee 75%)', backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />
);

/* ── isValidListing: filter out test/dummy data ── */
const isValidListing = (item) => {
  if (!item) return false;
  const name = item.name || '';
  if (name.length < 3) return false;
  if ((item.price || 0) < 100 && (item.pricePerNight || 0) < 100) return false;
  return true;
};



/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [packages,      setPackages]      = useState([]);
  const [hotels,        setHotels]        = useState([]);
  const [guides,        setGuides]        = useState([]);
  const [destinations,  setDestinations]  = useState([]);
  const [loadingPkgs,   setLoadingPkgs]   = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingDests,  setLoadingDests]  = useState(true);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchType,    setSearchType]    = useState('hotels');
  const [checkIn,       setCheckIn]       = useState('');
  const [checkOut,      setCheckOut]      = useState('');
  const [guests,        setGuests]        = useState('2 adults');
  const [heroVisible,   setHeroVisible]   = useState(false);

  // logged-in state
  const [hotelBookings, setHotelBookings] = useState([]);
  const [pkgBookings,   setPkgBookings]   = useState([]);
  const [loadingBook,   setLoadingBook]   = useState(true);

  const firstName = user?.firstName || user?.username?.split(' ')[0] || 'Traveler';
  const hour      = new Date().getHours();

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);

    axios.get(`${API}/packages`)
      .then(r => setPackages((r.data.packages || r.data || []).filter(isValidListing).slice(0, 6)))
      .catch(() => setPackages([]))
      .finally(() => setLoadingPkgs(false));

    // Fetch real regions directly from the regions API
    axios.get(`${API}/regions`)
      .then(r => setDestinations((r.data.regions || r.data || []).slice(0, 5)))
      .catch(() => setDestinations([]))
      .finally(() => setLoadingDests(false));

    axios.get(`${API}/hotels`)
      .then(r => setHotels((r.data.hotels || r.data || []).filter(isValidListing).slice(0, 6)))
      .catch(() => setHotels([]))
      .finally(() => setLoadingHotels(false));

    axios.get(`${API}/guides`)
      .then(r => setGuides((r.data.guides || r.data || []).slice(0, 4)))
      .catch(() => setGuides([]));

    if (isAuthenticated) {
      const h = { Authorization: `Bearer ${tok()}` };
      axios.get(`${API}/hotel-bookings/my`, { headers: h })
        .then(r => setHotelBookings((r.data.bookings || r.data || []).filter(b => b.totalPrice > 100)))
        .catch(() => setHotelBookings([]))
        .finally(() => setLoadingBook(false));
      axios.get(`${API}/bookings/my`, { headers: h })
        .then(r => setPkgBookings((r.data.bookings || r.data || []).filter(b => b.totalPrice > 100)))
        .catch(() => setPkgBookings([]));
    } else {
      setLoadingBook(false);
    }
  }, [isAuthenticated]);

  const allBookings    = [
    ...hotelBookings.map(b => ({ ...b, _type: 'hotel' })),
    ...pkgBookings.map(b => ({ ...b, _type: 'package' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const activeBookings = allBookings.filter(b => ['confirmed','pending'].includes(b.status?.toLowerCase())).length;
  const totalSpent     = allBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API.replace('/api', '')}/uploads/${img}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const base = isAuthenticated ? `/browse-${searchType}` : '/browse-packages';
    const q    = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`${base}?${params.toString()}`);
  };

  const renderStatus = (s) => {
    const st = STATUS_CFG[(s || 'pending').toLowerCase()] || STATUS_CFG.pending;
    return (
      <span style={{ background: st.bg, color: st.color, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
        {st.label}
      </span>
    );
  };

  const renderRating = (rating, reviewCount) => {
    if (!rating) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>
          {parseFloat(rating).toFixed(1)}
        </span>
        <div style={{ display: 'flex', gap: 1 }}>
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />
          ))}
        </div>
        {reviewCount > 0 && <span style={{ fontSize: 11, color: '#94a3b8' }}>({reviewCount})</span>}
      </div>
    );
  };

  /* ── PKG CARD ── */
  const PkgCard = ({ pkg }) => {
    const diff   = pkg.difficulty || 'Moderate';
    const dc     = DIFF_COLORS[diff] || DIFF_COLORS.Moderate;
    const imgUrl = getImageUrl(pkg.images?.[0]);
    return (
      <Link to={`/packages/${pkg._id}`} className="pkg-card">
        <div className="pkg-img-wrap">
          {imgUrl
            ? <img src={imgUrl} alt={pkg.name} className="pkg-img" onError={e => { e.target.style.display = 'none'; }} />
            : (
              <div className="pkg-img-placeholder">
                <Mountain size={48} color="#94a3b8" />
              </div>
            )}
          <div className="pkg-gradient" />
          <div className="pkg-badges">
            {pkg.category && <span className="pkg-badge">{pkg.category}</span>}
            <span className="pkg-diff" style={{ background: dc.bg, color: dc.color }}>{diff}</span>
          </div>
          <button className="pkg-fav" onClick={e => e.preventDefault()}>
            <Heart size={14} color="#64748b" />
          </button>
        </div>
        <div className="pkg-body">
          {pkg.region && <div className="pkg-region"><MapPin size={10} />&nbsp;{pkg.region}</div>}
          <div className="pkg-name">{pkg.name}</div>
          {renderRating(pkg.rating, pkg.reviewCount)}
          <div className="pkg-meta">
            {pkg.duration && <span><Clock size={11} />&nbsp;{pkg.duration} days</span>}
            {pkg.maxAltitude && <span><Mountain size={11} />&nbsp;{(pkg.maxAltitude/1000).toFixed(1)}k m</span>}
          </div>
          <div className="pkg-footer">
            <div>
              <div className="pkg-price-from">From</div>
              <div className="pkg-price-row">
                <span className="pkg-price-val">NPR {(pkg.price || 0).toLocaleString()}</span>
                <span className="pkg-price-per">/person</span>
              </div>
            </div>
            <span className="pkg-btn">Details &nbsp;<ArrowRight size={14} /></span>
          </div>
        </div>
      </Link>
    );
  };

  /* ── HOTEL CARD ── */
  const HotelCard = ({ hotel }) => {
    const imgUrl = getImageUrl(hotel.images?.[0]);
    return (
      <Link to={`/hotels/${hotel._id}`} className="pkg-card">
        <div className="pkg-img-wrap">
          {imgUrl
            ? <img src={imgUrl} alt={hotel.name} className="pkg-img" onError={e => { e.target.style.display = 'none'; }} />
            : (
              <div className="pkg-img-placeholder">
                <Hotel size={48} color="#94a3b8" />
              </div>
            )}
          <div className="pkg-gradient" />
          <div className="pkg-badges">
            {hotel.starRating && <span className="pkg-badge">{'★'.repeat(hotel.starRating)}</span>}
          </div>
          <button className="pkg-fav" onClick={e => e.preventDefault()}>
            <Heart size={14} color="#64748b" />
          </button>
        </div>
        <div className="pkg-body">
          {(hotel.location || hotel.city) && <div className="pkg-region"><MapPin size={10} />&nbsp;{hotel.location || hotel.city}</div>}
          <div className="pkg-name">{hotel.name}</div>
          {renderRating(hotel.rating, hotel.reviewCount)}
          <div className="pkg-meta">
            {hotel.amenities?.slice(0,2).map((a, i) => <span key={i}>✓ {a}</span>)}
          </div>
          <div className="pkg-footer">
            <div>
              <div className="pkg-price-from">From</div>
              <div className="pkg-price-row">
                <span className="pkg-price-val">NPR {(hotel.pricePerNight || hotel.price || 0).toLocaleString()}</span>
                <span className="pkg-price-per">/night</span>
              </div>
            </div>
            <span className="pkg-btn">Book &nbsp;<ArrowRight size={14} /></span>
          </div>
        </div>
      </Link>
    );
  };

  /* ── DESTINATION CARD (real regions API data) ── */
  const DestCard = ({ dest, index, large }) => {
    // RegionDetail expects /destinations/:slug — use slug field, fall back to _id
    const slug     = dest.slug || dest._id;
    // Image: regions may store image as a URL string or uploads path
    const imgUrl   = getImageUrl(dest.image || dest.coverImage || dest.photo);
    const gradient = DEST_GRADIENTS[index % DEST_GRADIENTS.length];
    // Pick icon based on difficulty, or fallback
    const IconComp = REGION_ICON_MAP[dest.difficulty] || REGION_ICON_MAP[dest.tag] || REGION_ICON_MAP['default'];
    // Tag to display: difficulty or a custom label
    const tag      = dest.difficulty || dest.tag || 'Trek';
    // Subtitle: bestSeason or trekDuration
    const subtitle = dest.bestSeason || dest.trekDuration || '';

    return (
      <Link
        to={`/destinations/${slug}`}
        className={`dest-card${large ? ' large' : ' small'}`}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={dest.name}
            className="dest-img"
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="dest-icon-bg" style={{ background: gradient }}>
            <IconComp size={large ? 64 : 40} color="rgba(255,255,255,0.25)" strokeWidth={1.2} />
          </div>
        )}
        <div className="dest-overlay" />
        <div className="dest-body">
          <div className="dest-tag">{tag}</div>
          <span className="dest-name">{dest.name}</span>
          <div className="dest-count">
            {dest.maxAltitude
              ? `⛰ ${dest.maxAltitude.toLocaleString()}m${subtitle ? ` · ${subtitle}` : ''}`
              : subtitle || 'Explore region'}
          </div>
        </div>
      </Link>
    );
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mtb-home {
          font-family: 'Roboto', sans-serif;
          background: #fafaf9;
          color: #0f172a;
        }

        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes heroIn   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }

        /* ═══ HERO ═══ */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden;
          background: #071a0f;
        }

        .hero-video-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(180deg, rgba(7,26,15,0.3) 0%, rgba(7,26,15,0.65) 100%),
            url('https://images.unsplash.com/photo-1720812128574-9cd2fbe0a576?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat;
          animation: scaleIn 1.5s ease forwards;
        }

        .hero-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .hero-silhouette {
          position: absolute; bottom: 0; left: 0; right: 0; height: 220px;
          background: linear-gradient(to top, rgba(7,26,15,0.9), transparent);
          clip-path: polygon(0% 100%,5% 72%,11% 82%,17% 55%,24% 70%,31% 38%,38% 58%,44% 24%,50% 42%,56% 15%,62% 38%,68% 28%,74% 48%,81% 20%,88% 44%,94% 32%,100% 50%,100% 100%);
        }

        .hero-content {
          position: relative; z-index: 2;
          text-align: center;
          padding: 2rem;
          max-width: 860px;
          width: 100%;
          opacity: 0;
          transform: translateY(24px);
        }
        .hero-content.visible {
          animation: heroIn 1s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.2s;
        }

        .hero-title {
          font-family: 'Roboto', sans-serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 300;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }
        .hero-title em {
          font-style: italic;
          color: #4ade80;
          font-weight: 300;
        }
        .hero-title strong {
          font-weight: 700;
          font-style: normal;
          color: #fff;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          font-weight: 400;
          color: rgba(255,255,255,0.62);
          line-height: 1.75;
          max-width: 500px;
          margin: 0 auto 2.5rem;
        }

        /* ── SEARCH BAR ── */
        .hero-search-wrap {
          max-width: 780px;
          margin: 0 auto 2.5rem;
        }
        .hero-search {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1);
        }

        .search-fields {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1px 160px 1px 120px;
          align-items: stretch;
        }
        .search-divider-v {
          width: 1px; background: #f1f5f9; align-self: stretch;
        }
        .search-field {
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px; color: #94a3b8;
        }
        .search-field input, .search-field select {
          border: none; outline: none;
          font-size: 14px; color: #0f172a;
          width: 100%; padding: 20px 0;
          background: transparent;
          font-family: 'Roboto', sans-serif;
          cursor: pointer;
        }
        .search-field input::placeholder { color: #9ca3af; }
        .search-field select option { color: #0f172a; }

        .search-submit {
          background: #16a34a;
          color: #fff;
          border: none;
          cursor: pointer;
          padding: 0 28px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Roboto', sans-serif;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.2s;
          white-space: nowrap;
          letter-spacing: 0.01em;
          border-radius: 0 20px 20px 0;
        }
        .search-submit:hover { background: #15803d; }

        /* ── HERO STATS ── */
        .hero-stats {
          display: flex; align-items: center; justify-content: center;
          gap: 0; flex-wrap: wrap;
        }
        .hero-stat {
          text-align: center; padding: 0 2.5rem;
          border-right: 1px solid rgba(255,255,255,0.12);
        }
        .hero-stat:last-child { border-right: none; }
        .hero-stat-num {
          display: block;
          font-family: 'Roboto', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
          margin-bottom: 4px;
        }
        .hero-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.48);
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── SECTION COMMON ── */
        .section-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #16a34a; margin-bottom: 0.5rem;
          display: flex; align-items: center; gap: 8px;
        }
        .section-eyebrow::before {
          content: ''; display: inline-block;
          width: 20px; height: 2px; background: #16a34a;
          border-radius: 2px;
        }
        .section-title {
          font-family: 'Roboto', sans-serif;
          font-size: clamp(1.9rem, 4vw, 2.8rem);
          font-weight: 700;
          color: #0f172a;
          line-height: 1.15;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .section-sub {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.7;
          max-width: 480px;
          font-weight: 400;
        }

        .tabs-row {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          margin-bottom: 2rem;
        }

        .view-all {
          font-size: 13px; font-weight: 700; color: #16a34a;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          white-space: nowrap;
          transition: gap 0.2s;
        }
        .view-all:hover { gap: 10px; }

        /* ═══ PACKAGE / HOTEL CARDS ═══ */
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.5rem;
        }
        .pkg-card {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e8f5ee;
          background: #fff;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .pkg-card:hover {
          box-shadow: 0 20px 60px rgba(22,163,74,0.12), 0 4px 16px rgba(0,0,0,0.06);
          transform: translateY(-6px);
          border-color: #bbf7d0;
        }
        .pkg-img-wrap {
          position: relative;
          aspect-ratio: 16/10;
          overflow: hidden;
          background: #e8f5ee;
        }
        .pkg-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pkg-card:hover .pkg-img { transform: scale(1.08); }
        .pkg-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: #f0fdf4;
        }
        .pkg-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35) 100%);
        }
        .pkg-badges {
          position: absolute; top: 14px; left: 14px;
          display: flex; gap: 6px; flex-wrap: wrap;
        }
        .pkg-badge {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          color: #fff;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .pkg-diff {
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
        }
        .pkg-fav {
          position: absolute; top: 14px; right: 14px;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .pkg-fav:hover { transform: scale(1.15); }

        .pkg-body { padding: 1.1rem 1.25rem 1.35rem; }
        .pkg-region {
          font-size: 11px; color: #94a3b8;
          display: inline-flex; align-items: center; gap: 3px;
          margin-bottom: 5px; font-weight: 500;
        }
        .pkg-name {
          font-size: 1.05rem; font-weight: 700;
          color: #0f172a; margin-bottom: 6px;
          line-height: 1.3;
          font-family: 'Roboto', sans-serif;
        }
        .pkg-meta {
          display: flex; gap: 12px; margin-bottom: 1rem;
        }
        .pkg-meta span {
          font-size: 12px; color: #94a3b8;
          display: flex; align-items: center; gap: 4px;
          font-weight: 500;
        }
        .pkg-footer {
          display: flex; align-items: center;
          justify-content: space-between;
          padding-top: 0.9rem;
          border-top: 1px solid #f1f5f9;
        }
        .pkg-price-from { font-size: 10px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .pkg-price-row { display: flex; align-items: baseline; gap: 3px; }
        .pkg-price-val { font-size: 1.15rem; font-weight: 800; color: #0f172a; font-family: 'Roboto', sans-serif; }
        .pkg-price-per { font-size: 11px; color: #94a3b8; font-weight: 500; }
        .pkg-btn {
          background: #16a34a;
          color: #fff;
          border: none;
          cursor: pointer;
          border-radius: 10px;
          padding: 9px 16px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Roboto', sans-serif;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          letter-spacing: 0.01em;
        }
        .pkg-btn:hover { background: #15803d; transform: translateX(2px); }

        /* ═══ SKELETON ═══ */
        .skel {
          background: linear-gradient(90deg,#f0fdf4 25%,#dcfce7 50%,#f0fdf4 75%);
          background-size: 200%;
          animation: shimmer 1.6s infinite;
          border-radius: 8px;
        }

        /* ═══ DESTINATIONS / REGIONS ═══ */
        .dest-section { padding: 6rem 2rem; background: #fff; }
        .dest-inner { max-width: 1240px; margin: 0 auto; }
        .dest-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto auto;
          gap: 1rem;
          margin-top: 2.5rem;
        }
        .dest-card {
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          text-decoration: none;
          display: block;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .dest-card:hover { transform: scale(1.02); }
        .dest-card.large { grid-column: span 2; aspect-ratio: 2/1; }
        .dest-card.small { aspect-ratio: 4/3; }
        /* fallback icon background fills the full card */
        .dest-icon-bg {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .dest-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          position: absolute; inset: 0;
        }
        .dest-card:hover .dest-img { transform: scale(1.06); }
        .dest-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.6) 100%);
        }
        .dest-body {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 1.25rem;
        }
        .dest-tag {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 6px;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          margin-bottom: 5px;
        }
        .dest-name {
          font-family: 'Roboto', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          display: block;
          margin-bottom: 3px;
        }
        .dest-card.large .dest-name { font-size: 1.75rem; }
        .dest-count {
          font-size: 11px;
          color: rgba(255,255,255,0.65);
          font-weight: 500;
        }

        /* dest skeleton */
        .dest-skel-card {
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(90deg,#f0fdf4 25%,#dcfce7 50%,#f0fdf4 75%);
          background-size: 200%;
          animation: shimmer 1.6s infinite;
        }
        .dest-skel-card.large { grid-column: span 2; aspect-ratio: 2/1; }
        .dest-skel-card.small { aspect-ratio: 4/3; }

        /* empty state */
        .dest-empty {
          grid-column: 1/-1;
          text-align: center;
          padding: 4rem;
          color: #94a3b8;
        }

        /* ═══ TOOLS ═══ */
        .tools-section { padding: 6rem 2rem; background: #071a0f; }
        .tools-inner { max-width: 1240px; margin: 0 auto; }
        .tools-section .section-eyebrow { color: #4ade80; }
        .tools-section .section-eyebrow::before { background: #4ade80; }
        .tools-section .section-title { color: #fff; }
        .tools-section .section-sub { color: rgba(255,255,255,0.5); }
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.25rem;
          margin-top: 3rem;
        }
        .tool-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 1.75rem;
          text-decoration: none;
          display: block;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .tool-card::before {
          content: ''; position: absolute;
          inset: 0; border-radius: 18px;
          background: linear-gradient(135deg, rgba(74,222,128,0.06), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .tool-card:hover { border-color: rgba(74,222,128,0.25); transform: translateY(-4px); }
        .tool-card:hover::before { opacity: 1; }
        .tool-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }
        .tool-title { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem; }
        .tool-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; margin-bottom: 1.25rem; }
        .tool-cta { font-size: 12px; font-weight: 700; color: #4ade80; display: flex; align-items: center; gap: 4px; }

        /* ═══ WHY US ═══ */
        .why-section { padding: 6rem 2rem; background: #fafaf9; }
        .why-inner { max-width: 1240px; margin: 0 auto; }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        .why-item { display: flex; gap: 1rem; }
        .why-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .why-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
        .why-desc { font-size: 13px; color: #64748b; line-height: 1.65; }

        /* ═══ GUIDES ═══ */
        .guides-section { padding: 6rem 2rem; background: #fff; }
        .guides-inner { max-width: 1240px; margin: 0 auto; }
        .guides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-top: 2.5rem;
        }
        .guide-card {
          background: #fafaf9;
          border-radius: 18px;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid #f1f5f9;
          transition: all 0.3s;
          text-decoration: none;
          display: block;
        }
        .guide-card:hover {
          box-shadow: 0 12px 40px rgba(22,163,74,0.1);
          border-color: #bbf7d0;
          transform: translateY(-4px);
        }
        .guide-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0f172a, #16a34a);
          margin: 0 auto 1rem;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; font-weight: 700; color: #fff;
          border: 3px solid #f0fdf4;
        }
        .guide-avatar-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0f172a, #16a34a);
          margin: 0 auto 1rem;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid #f0fdf4;
        }
        .guide-name { font-weight: 700; color: #0f172a; margin-bottom: 3px; font-size: 0.9rem; }
        .guide-specialty { font-size: 11px; color: #16a34a; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .guide-stars { color: #f59e0b; font-size: 11px; }

        /* ═══ CTA ═══ */
        .cta-section {
          padding: 7rem 2rem;
          background: #071a0f;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(22,163,74,0.15), transparent);
          pointer-events: none;
        }
        .cta-inner { position: relative; z-index: 1; max-width: 580px; margin: 0 auto; }
        .cta-title {
          font-family: 'Roboto', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 300;
          color: #fff;
          margin-bottom: 1rem;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .cta-sub { color: rgba(255,255,255,0.5); font-size: 1rem; line-height: 1.75; margin-bottom: 2.5rem; }
        .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .cta-btn-primary {
          background: #16a34a; color: #fff;
          padding: 15px 36px; border-radius: 14px;
          font-weight: 700; font-size: 0.95rem;
          text-decoration: none; transition: all 0.2s;
          font-family: 'Roboto', sans-serif;
          letter-spacing: 0.01em;
        }
        .cta-btn-primary:hover { background: #15803d; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.35); }
        .cta-btn-secondary {
          background: rgba(255,255,255,0.07);
          color: #fff;
          padding: 15px 36px; border-radius: 14px;
          font-weight: 700; font-size: 0.95rem;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.2s;
          font-family: 'Roboto', sans-serif;
        }
        .cta-btn-secondary:hover { background: rgba(255,255,255,0.12); }

        /* ═══ LOGGED-IN SECTIONS ═══ */
        .logged-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
          max-width: 1240px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }
        @media (max-width: 1100px) { .logged-grid { grid-template-columns: 1fr; } }

        .db-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }
        .db-card-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f8fafc;
        }
        .db-card-title {
          font-size: 0.95rem; font-weight: 700; color: #0f172a;
        }
        .db-card-link {
          font-size: 12px; color: #16a34a; text-decoration: none;
          font-weight: 700; display: flex; align-items: center; gap: 4px;
          transition: gap 0.2s;
        }
        .db-card-link:hover { gap: 8px; }

        .booking-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 1.5rem;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.15s;
        }
        .booking-row:last-child { border-bottom: none; }
        .booking-row:hover { background: #fafaf9; }
        .booking-thumb {
          width: 52px; height: 52px;
          border-radius: 12px; background: #f8fafc;
          overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center;
          justify-content: center;
          border: 1px solid #f1f5f9;
        }
        .booking-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .booking-name { font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 3px; }
        .booking-date { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; font-weight: 500; }
        .booking-price { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px; font-family: 'Roboto', sans-serif; }

        .tool-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 1.5rem;
          text-decoration: none; color: #374151;
          transition: background 0.15s;
          border-bottom: 1px solid #f8fafc;
        }
        .tool-row:last-child { border-bottom: none; }
        .tool-row:hover { background: #f0fdf4; }
        .tool-row-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: #f0fdf4; border: 1px solid #dcfce7;
          display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .tool-row-label { font-size: 13px; font-weight: 600; color: #374151; flex: 1; }

        .hotel-explore-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 1rem 1.5rem 1.5rem;
        }
        .hotel-tile {
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          aspect-ratio: 3/2;
          display: block;
          text-decoration: none;
          background: #0f172a;
        }
        .hotel-tile:hover .hotel-tile-img { transform: scale(1.07); }
        .hotel-tile-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .hotel-tile-icon-bg {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .hotel-tile-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.72) 100%);
        }
        .hotel-tile-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 12px; }
        .hotel-tile-name { font-size: 12px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 2px; }
        .hotel-tile-loc { font-size: 10px; color: rgba(255,255,255,0.65); display: flex; align-items: center; gap: 3px; font-weight: 500; }
        .hotel-tile-price { font-size: 11px; color: #4ade80; font-weight: 700; margin-top: 2px; }

        .no-bookings { text-align: center; padding: 3rem 1rem; }
        .no-bookings-icon { margin-bottom: 0.75rem; display: flex; justify-content: center; }
        .no-bookings-text { font-size: 14px; color: #64748b; margin-bottom: 1.25rem; font-weight: 500; }
        .no-bookings-btn {
          display: inline-block; background: #0f172a; color: #fff;
          padding: 10px 24px; border-radius: 10px;
          text-decoration: none; font-size: 13px; font-weight: 700;
          transition: background 0.2s;
        }
        .no-bookings-btn:hover { background: #16a34a; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .dest-grid { grid-template-columns: 1fr 1fr; }
          .dest-card.large { grid-column: span 2; }
          .hero-search { flex-direction: column; border-radius: 16px; }
          .search-fields { grid-template-columns: 1fr; }
          .search-divider-v { display: none; }
          .search-submit { border-radius: 0 0 16px 16px; width: 100%; justify-content: center; }
          .pkg-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        }
        @media (max-width: 640px) {
          .dest-grid { grid-template-columns: 1fr; }
          .dest-card.large { grid-column: span 1; aspect-ratio: 16/9; }
          .dest-skel-card.large { grid-column: span 1; aspect-ratio: 16/9; }
          .hero-stat { padding: 0 1.25rem; }
          .hero-stat-num { font-size: 1.5rem; }
          .pkg-grid { grid-template-columns: 1fr; }
          .tools-grid { grid-template-columns: 1fr 1fr; }
          .hotel-explore-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="mtb-home">

        {/* ══════════════════ HERO ══════════════════ */}
        <section className="hero">
          <div className="hero-video-bg" />
          <div className="hero-noise" />
          <div className="hero-silhouette" />

          <div className={`hero-content${heroVisible ? ' visible' : ''}`}>

            <h1 className="hero-title">
              {isAuthenticated ? (
                <>Where to next,<br /><em>{firstName}?</em></>
              ) : (
                <>Your perfect<br /><em>Nepal adventure</em><br /><strong>starts here.</strong></>
              )}
            </h1>

            <p className="hero-subtitle">
              {isAuthenticated
                ? 'Search hotels, treks, and guides — your bookings and recommendations are waiting below.'
                : 'Verified hotels, curated trek packages, certified local guides — from Everest Base Camp to the hidden valleys of Mustang.'}
            </p>

            {/* ── SEARCH BAR ── */}
            <div className="hero-search-wrap">
              <form className="hero-search" onSubmit={handleSearch}>
                <div className="search-fields">
                  <div className="search-field">
                    <Search size={16} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder={isAuthenticated ? `Search ${searchType}...` : 'Where are you going?'}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="search-divider-v" />

                  <div className="search-field">
                    <Calendar size={14} color="#94a3b8" />
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                      placeholder="Check-in" style={{ color: checkIn ? '#0f172a' : '#9ca3af' }} />
                  </div>

                  <div className="search-divider-v" />

                  <div className="search-field">
                    <Users size={14} color="#94a3b8" />
                    <select value={guests} onChange={e => setGuests(e.target.value)}>
                      <option>1 adult</option>
                      <option>2 adults</option>
                      <option>2 adults, 1 child</option>
                      <option>2 adults, 2 children</option>
                      <option>3 adults</option>
                      <option>Group (4+)</option>
                    </select>
                  </div>
                </div>

                <button className="search-submit" type="submit">
                  <Search size={16} />
                  {isAuthenticated ? 'Search' : 'Find Trips'}
                </button>
              </form>
            </div>

            {/* ── STATS ROW ── */}
            <div className="hero-stats">
              {isAuthenticated && !loadingBook ? (
                <>
                  <div className="hero-stat">
                    <span className="hero-stat-num">{allBookings.length}</span>
                    <span className="hero-stat-label">Trips Booked</span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-num">{activeBookings}</span>
                    <span className="hero-stat-label">Active Trips</span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-num">
                      NPR {totalSpent >= 1000 ? `${Math.round(totalSpent / 1000)}k` : totalSpent.toLocaleString()}
                    </span>
                    <span className="hero-stat-label">Total Spent</span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-num">★ 4.9</span>
                    <span className="hero-stat-label">Avg Rating</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="hero-stat"><span className="hero-stat-num">500+</span><span className="hero-stat-label">Verified Hotels</span></div>
                  <div className="hero-stat"><span className="hero-stat-num">15k+</span><span className="hero-stat-label">Happy Travelers</span></div>
                  <div className="hero-stat"><span className="hero-stat-num">14</span><span className="hero-stat-label">Trekking Regions</span></div>
                  <div className="hero-stat"><span className="hero-stat-num">4.9 ★</span><span className="hero-stat-label">Average Rating</span></div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════ LOGGED-IN BODY ══════════════════ */}
        {isAuthenticated && (
          <>
            <div className="logged-grid">
              {/* LEFT: Recent Bookings */}
              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">Recent Bookings</div>
                  <Link to="/dashboard" className="db-card-link">View all <ArrowRight size={14} /></Link>
                </div>
                {loadingBook
                  ? Array(4).fill(0).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 1.5rem', borderBottom: '1px solid #f8fafc' }}>
                      <Skel w={52} h={52} r={12} />
                      <div style={{ flex: 1 }}><Skel h={13} w="60%" /><div style={{ marginTop: 6 }}><Skel h={10} w="40%" /></div></div>
                      <Skel w={72} h={22} r={100} />
                    </div>
                  ))
                  : allBookings.length === 0
                    ? (
                      <div className="no-bookings">
                        <div className="no-bookings-icon">
                          <Tent size={40} color="#cbd5e1" />
                        </div>
                        <div className="no-bookings-text">No bookings yet — start exploring Nepal!</div>
                        <Link to="/browse-packages" className="no-bookings-btn">Browse Packages</Link>
                      </div>
                    )
                    : allBookings.slice(0, 6).map((b, i) => {
                      const name   = b.hotel?.name || b.package?.name || `Booking #${b._id?.slice(-6)}`;
                      const date   = b.checkInDate || b.startDate || b.createdAt;
                      const out    = b.checkOutDate || b.endDate;
                      const imgUrl = getImageUrl(b.hotel?.images?.[0] || b.package?.images?.[0]);
                      return (
                        <div key={i} className="booking-row">
                          <div className="booking-thumb">
                            {imgUrl
                              ? <img src={imgUrl} alt="" onError={e => e.target.style.display = 'none'} />
                              : (b._type === 'hotel'
                                  ? <Hotel size={22} color="#94a3b8" />
                                  : <Mountain size={22} color="#94a3b8" />
                                )
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="booking-name">{name}</div>
                            <div className="booking-date">
                              <Clock size={11} />
                              {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              {out ? ` → ${new Date(out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {b.totalPrice > 0 && <div className="booking-price">NPR {b.totalPrice.toLocaleString()}</div>}
                            {renderStatus(b.status)}
                          </div>
                        </div>
                      );
                    })
                }
              </div>

              {/* RIGHT sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Travel Tools */}
                <div className="db-card">
                  <div className="db-card-header">
                    <div className="db-card-title">Travel Tools</div>
                  </div>
                  {TOOLS.map(t => {
                    const IconComp = t.icon;
                    return (
                      <Link key={t.title} to={t.link} className="tool-row">
                        <div className="tool-row-icon">
                          <IconComp size={16} color="#16a34a" />
                        </div>
                        <span className="tool-row-label">{t.title}</span>
                        <ArrowRight size={16} color="#94a3b8" />
                      </Link>
                    );
                  })}
                  <Link to="/browse-guides" className="tool-row">
                    <div className="tool-row-icon">
                      <UserCheck size={16} color="#16a34a" />
                    </div>
                    <span className="tool-row-label">Find a Guide</span>
                    <ArrowRight size={16} color="#94a3b8" />
                  </Link>
                </div>

                {/* Quick Explore hotels */}
                <div className="db-card">
                  <div className="db-card-header">
                    <div className="db-card-title">Quick Explore</div>
                    <Link to="/browse-hotels" className="db-card-link">View all <ArrowRight size={14} /></Link>
                  </div>
                  <div className="hotel-explore-grid">
                    {loadingHotels
                      ? Array(4).fill(0).map((_, i) => (
                        <div key={i} style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '3/2' }}>
                          <Skel h="100%" r={14} />
                        </div>
                      ))
                      : hotels.slice(0, 4).map(h => {
                        const imgUrl = getImageUrl(h.images?.[0]);
                        return (
                          <Link key={h._id} to={`/hotels/${h._id}`} className="hotel-tile">
                            {imgUrl
                              ? <img src={imgUrl} alt={h.name} className="hotel-tile-img" onError={e => e.target.style.display = 'none'} />
                              : (
                                <div className="hotel-tile-icon-bg" style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
                                  <Hotel size={28} color="rgba(255,255,255,0.3)" strokeWidth={1.2} />
                                </div>
                              )
                            }
                            <div className="hotel-tile-overlay" />
                            <div className="hotel-tile-body">
                              <div className="hotel-tile-name">{h.name}</div>
                              <div className="hotel-tile-loc"><MapPin size={10} />&nbsp;{h.location || h.city || 'Nepal'}</div>
                              {(h.pricePerNight || h.price) > 0 && (
                                <div className="hotel-tile-price">NPR {(h.pricePerNight || h.price).toLocaleString()}/night</div>
                              )}
                            </div>
                          </Link>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Packages — logged in */}
            <section style={{ padding: '0 2rem 5rem', maxWidth: 1240, margin: '0 auto' }}>
              <div className="tabs-row">
                <div>
                  <div className="section-eyebrow">Just for you</div>
                  <h2 className="section-title">Recommended Packages</h2>
                </div>
                <Link to="/browse-packages" className="view-all">View all packages <ArrowRight size={14} /></Link>
              </div>
              <div className="pkg-grid">
                {loadingPkgs
                  ? Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e8f5ee' }}>
                      <div className="skel" style={{ aspectRatio: '16/10' }} />
                      <div style={{ padding: '1.25rem' }}>
                        <Skel h={14} w="40%" />
                        <div style={{ marginTop: 8 }}><Skel h={18} w="75%" /></div>
                        <div style={{ marginTop: 12 }}><Skel h={12} w="55%" /></div>
                      </div>
                    </div>
                  ))
                  : packages.map(pkg => <PkgCard key={pkg._id} pkg={pkg} />)
                }
              </div>
            </section>
          </>
        )}

        {/* ══════════════════ GUEST BODY ══════════════════ */}
        {!isAuthenticated && (
          <>
            {/* Featured packages */}
            <section style={{ padding: '6rem 2rem', background: '#fafaf9' }}>
              <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                <div className="tabs-row">
                  <div>
                    <div className="section-eyebrow">Featured routes</div>
                    <h2 className="section-title">Most-loved trips in Nepal</h2>
                    <p className="section-sub">Curated routes with verified permits, elevation profiles, and real traveler reviews.</p>
                  </div>
                  <Link to="/browse-packages" className="view-all">View all packages <ArrowRight size={14} /></Link>
                </div>
                <div className="pkg-grid" style={{ marginTop: '1.5rem' }}>
                  {loadingPkgs
                    ? Array(6).fill(0).map((_, i) => (
                      <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e8f5ee' }}>
                        <div className="skel" style={{ aspectRatio: '16/10' }} />
                        <div style={{ padding: '1.25rem' }}>
                          <Skel h={14} w="40%" />
                          <div style={{ marginTop: 8 }}><Skel h={18} w="75%" /></div>
                          <div style={{ marginTop: 12 }}><Skel h={12} w="55%" /></div>
                        </div>
                      </div>
                    ))
                    : packages.length > 0
                      ? packages.map(pkg => <PkgCard key={pkg._id} pkg={pkg} />)
                      : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                          <Mountain size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                          <p style={{ fontWeight: 600 }}>Packages coming soon — check back shortly!</p>
                        </div>
                      )
                  }
                </div>
              </div>
            </section>

            {/* Featured hotels */}
            <section style={{ padding: '6rem 2rem', background: '#fff' }}>
              <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                <div className="tabs-row">
                  <div>
                    <div className="section-eyebrow">Stay in Nepal</div>
                    <h2 className="section-title">Top-rated hotels</h2>
                    <p className="section-sub">Hand-verified stays from boutique guesthouses to luxury mountain resorts.</p>
                  </div>
                  <Link to="/browse-hotels" className="view-all">View all hotels <ArrowRight size={14} /></Link>
                </div>
                <div className="pkg-grid">
                  {loadingHotels
                    ? Array(3).fill(0).map((_, i) => (
                      <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e8f5ee' }}>
                        <div className="skel" style={{ aspectRatio: '16/10' }} />
                        <div style={{ padding: '1.25rem' }}>
                          <Skel h={14} w="40%" />
                          <div style={{ marginTop: 8 }}><Skel h={18} w="75%" /></div>
                        </div>
                      </div>
                    ))
                    : hotels.length > 0
                      ? hotels.slice(0, 3).map(h => <HotelCard key={h._id} hotel={h} />)
                      : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                          <Hotel size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                          <p style={{ fontWeight: 600 }}>Hotels coming soon!</p>
                        </div>
                      )
                  }
                </div>
              </div>
            </section>

            {/* ══ DESTINATIONS — dynamic from packages ══ */}
            <section className="dest-section">
              <div className="dest-inner">
                <div className="tabs-row">
                  <div>
                    <div className="section-eyebrow">Explore by region</div>
                    <h2 className="section-title">Explore Distinct Trekking Regions</h2>
                    <p className="section-sub">Each region offers unique landscapes, culture, and challenges — find your perfect match.</p>
                  </div>
                  <Link to="/browse-packages" className="view-all">Explore all <ArrowRight size={14} /></Link>
                </div>

                <div className="dest-grid">
                  {loadingDests
                    ? (
                      /* skeletons in correct grid layout */
                      <>
                        <div className="dest-skel-card large" />
                        <div className="dest-skel-card small" />
                        <div className="dest-skel-card small" />
                        <div className="dest-skel-card small" />
                        <div className="dest-skel-card small" />
                      </>
                    )
                    : destinations.length === 0
                      ? (
                        <div className="dest-empty">
                          <Navigation size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                          <p style={{ fontWeight: 600 }}>Regions loading — check back shortly!</p>
                        </div>
                      )
                      : destinations.slice(0, 5).map((dest, i) => (
                        <DestCard key={dest.name} dest={dest} index={i} large={i === 0} />
                      ))
                  }
                </div>
              </div>
            </section>
          </>
        )}

        {/* ══════════════════ TOOLS — both states ══════════════════ */}
        <section className="tools-section">
          <div className="tools-inner">
            <div className="section-eyebrow">Travel tools</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="section-title">
                  {isAuthenticated ? `Plan your next adventure, ${firstName}` : 'Everything you need for your trip'}
                </h2>
                <p className="section-sub">Free tools to plan, budget, and navigate your perfect Nepal adventure.</p>
              </div>
            </div>
            <div className="tools-grid">
              {TOOLS.map((tool, i) => {
                const IconComp = tool.icon;
                return (
                  <Link key={i} to={tool.link} className="tool-card">
                    <div className="tool-icon-wrap">
                      <IconComp size={20} color="#4ade80" strokeWidth={1.8} />
                    </div>
                    <div className="tool-title">{tool.title}</div>
                    <div className="tool-desc">{tool.desc}</div>
                    <div className="tool-cta">Try it free <ArrowRight size={14} /></div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════ GUEST ONLY — Why us + Guides ══════════════════ */}
        {!isAuthenticated && (
          <>
            <section className="why-section">
              <div className="why-inner">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
                    Why My Travel Buddy
                  </div>
                  <h2 className="section-title" style={{ margin: '0 auto 0.75rem' }}>Everything for a safe, memorable trek</h2>
                  <p className="section-sub" style={{ margin: '0 auto' }}>We go beyond hotel listings — from permit prep to emergency support.</p>
                </div>
                <div className="why-grid">
                  {WHY_ITEMS.map((item, i) => {
                    const IconComp = item.icon;
                    return (
                      <div key={i} className="why-item">
                        <div className="why-icon">
                          <IconComp size={20} color="#16a34a" strokeWidth={1.8} />
                        </div>
                        <div>
                          <div className="why-title">{item.title}</div>
                          <div className="why-desc">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {guides.length > 0 && (
              <section className="guides-section">
                <div className="guides-inner">
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div className="section-eyebrow">Local experts</div>
                      <h2 className="section-title">Meet your guide</h2>
                    </div>
                    <Link to="/browse-guides" className="view-all">View all guides <ArrowRight size={14} /></Link>
                  </div>
                  <div className="guides-grid">
                    {guides.map(guide => {
                      const name    = guide.name || guide.firstName || 'Guide';
                      const initial = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      const imgUrl  = getImageUrl(guide.profileImage || guide.photo);
                      return (
                        <Link key={guide._id} to={`/guides/${guide._id}`} className="guide-card">
                          <div className="guide-avatar">
                            {imgUrl
                              ? <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
                              : <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{initial}</span>
                            }
                          </div>
                          <div className="guide-name">{name}</div>
                          <div className="guide-specialty">{guide.specialization || guide.specialty || 'Trek Guide'}</div>
                          <div className="guide-stars">★★★★★</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* ══════════════════ CTA — both states ══════════════════ */}
        <section className="cta-section">
          <div className="cta-inner">
            {isAuthenticated ? (
              <>
                <h2 className="cta-title">Ready to explore more of Nepal?</h2>
                <p className="cta-sub">Browse our full catalogue of hotels, trekking packages, and certified local guides.</p>
                <div className="cta-btns">
                  <Link to="/browse-packages" className="cta-btn-primary">Browse Packages</Link>
                  <Link to="/browse-hotels" className="cta-btn-secondary">Browse Hotels</Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="cta-title">Ready to explore Nepal?</h2>
                <p className="cta-sub">Join 15,000+ travelers who've planned their perfect Himalayan adventure with My Travel Buddy.</p>
                <div className="cta-btns">
                  <Link to="/register" className="cta-btn-primary">Start Planning Free</Link>
                  <Link to="/browse-packages" className="cta-btn-secondary">Browse Packages</Link>
                </div>
              </>
            )}
          </div>
        </section>

      </div>
    </>
  );
}
