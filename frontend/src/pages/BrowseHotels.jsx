import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import hotelService from '../services/hotelService';
import BookingModal from '../components/BookingModal';

// ── Live Hotel Map (sidebar) ──────────────────────────────────────────────────
function HotelMap({ hotels, onHotelClick }) {
  const containerRef = useRef(null);
  const leafletRef   = useRef(null);
  const markersRef   = useRef([]);

  const pinnedHotels = hotels.filter(h => h.lat && h.lng);

  useEffect(() => {
    if (!document.getElementById('leaflet-css-browse')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-browse';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!containerRef.current || leafletRef.current) return;
      const L = window.L;

      const map = L.map(containerRef.current, {
        center: [28.1, 84.0], // Center of Nepal
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      leafletRef.current = map;
      renderMarkers(map, pinnedHotels);
    };

    loadLeaflet();

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  // Re-render markers when filtered hotels change
  useEffect(() => {
    if (!leafletRef.current || !window.L) return;
    renderMarkers(leafletRef.current, pinnedHotels);
  }, [hotels]);

  const renderMarkers = (map, hotelList) => {
    const L = window.L;
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!hotelList.length) return;

    hotelList.forEach(hotel => {
      const icon = L.divIcon({
        html: `<div style="
          background: #16a34a;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          font-family: sans-serif;
          padding: 4px 8px;
          border-radius: 20px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(22,163,74,0.5);
          border: 2px solid #fff;
          cursor: pointer;
        ">NPR ${Number(hotel.pricePerNight || 0).toLocaleString()}</div>`,
        iconAnchor: [0, 0],
        className: '',
      });

      const marker = L.marker([hotel.lat, hotel.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px;">
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px;">${hotel.name}</div>
            <div style="font-size:11px;color:#16a34a;margin-bottom:4px;">📍 ${hotel.location || ''}</div>
            <div style="font-size:12px;font-weight:700;color:#0f172a;">NPR ${Number(hotel.pricePerNight || 0).toLocaleString()} / night</div>
          </div>
        `, { maxWidth: 200 });

      marker.on('click', () => {
        if (onHotelClick) onHotelClick(hotel);
      });

      markersRef.current.push(marker);
    });

    // Fit map to all markers
    if (hotelList.length === 1) {
      map.setView([hotelList[0].lat, hotelList[0].lng], 13);
    } else if (hotelList.length > 1) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  };

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--green-border)' }}>
      <div ref={containerRef} style={{ height: 200, width: '100%' }} />
      <div style={{
        padding: '10px 14px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
      }}>
        <span>📍 Nepal</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
          {pinnedHotels.length} of {hotels.length} pinned
        </span>
      </div>
    </div>
  );
}

export default function BrowseHotels() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hotels,         setHotels]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [minPrice,       setMinPrice]       = useState('');
  const [maxPrice,       setMaxPrice]       = useState('');
  const [starFilter,     setStarFilter]     = useState('');
  const [sort,           setSort]           = useState('default');
  const [amenityFilter,  setAmenityFilter]  = useState('');
  const [bookingHotel,   setBookingHotel]   = useState(null); // hotel for BookingModal
  const [viewMode,       setViewMode]       = useState('grid');
  const [priceMode,      setPriceMode]      = useState('night');

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await hotelService.getAllHotels();
      setHotels(response.hotels || response || []);
    } catch { setHotels([]); }
    finally { setLoading(false); }
  };

  const openBooking = (hotel) => {
    if (!user) { navigate('/login'); return; }
    setBookingHotel(hotel);
  };

  let filtered = hotels.filter(h => {
    const s = !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.location?.toLowerCase().includes(search.toLowerCase());
    const mn = !minPrice || h.pricePerNight >= Number(minPrice);
    const mx = !maxPrice || h.pricePerNight <= Number(maxPrice);
    const st = !starFilter || Math.round(h.starRating || h.stars || 0) === Number(starFilter);
    const am = !amenityFilter || h.amenities?.some(a => a.toLowerCase().includes(amenityFilter.toLowerCase()));
    return s && mn && mx && st && am;
  });
  if (sort === 'price-asc')  filtered = [...filtered].sort((a,b) => a.pricePerNight - b.pricePerNight);
  if (sort === 'price-desc') filtered = [...filtered].sort((a,b) => b.pricePerNight - a.pricePerNight);
  if (sort === 'stars')      filtered = [...filtered].sort((a,b) => (b.starRating||b.stars||0) - (a.starRating||a.stars||0));

  const resetFilters = () => { setSearch(''); setMinPrice(''); setMaxPrice(''); setStarFilter(''); setSort('default'); setAmenityFilter(''); };

  const getImg = (h) => h.mainImage || h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

  const STAR_COUNTS = [5,4,3,2,1].map(s => ({
    s,
    count: hotels.filter(h => Math.round(h.starRating||h.stars||0) === s).length
  }));

  const AMENITY_TYPES = ['Pool', 'Parking', 'Gym', 'WiFi', 'Restaurant', 'Spa'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        :root {
          --green-primary: #16a34a;
          --green-dark: #14532d;
          --green-mid: #15803d;
          --green-light: #f0fdf4;
          --green-border: #bbf7d0;
          --green-soft: #dcfce7;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --text-muted: #94a3b8;
          --bg-page: #eef2f7;
          --bg-card: #ffffff;
          --border: #e2e8f0;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.07);
          --shadow-md: 0 4px 20px rgba(0,0,0,0.09);
          --shadow-lg: 0 12px 48px rgba(0,0,0,0.14);
          --radius: 16px;
          --radius-sm: 10px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bh-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg-page);
          min-height: 100vh;
          padding-top: 68px;
        }

        /* ── HERO ── */
        .bh-hero {
          background: linear-gradient(135deg, #052e16 0%, #064e23 50%, #0a4a1e 100%);
          padding: 48px 28px 36px;
          position: relative;
          overflow: hidden;
        }
        .bh-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=30') center/cover;
          opacity: 0.08;
        }
        .bh-hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .bh-hero h1 {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .bh-hero h1 em { font-style: normal; color: #4ade80; }
        .bh-hero-sub {
          color: rgba(255,255,255,0.55);
          font-size: 0.9rem;
          font-weight: 400;
          margin-bottom: 24px;
        }

        /* Search bar */
        .bh-searchbar {
          background: #fff;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          overflow: hidden;
          box-shadow: 0 8px 48px rgba(0,0,0,0.25);
          width: 100%;
          max-width: 100%;
        }
        .bh-search-seg {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          flex: 1;
          border-right: 1px solid var(--border);
          min-width: 0;
        }
        .bh-search-seg svg { color: var(--text-muted); flex-shrink: 0; }
        .bh-search-input {
          border: none;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          color: var(--text-primary);
          background: transparent;
          width: 100%;
        }
        .bh-search-input::placeholder { color: var(--text-muted); }
        .bh-search-seg-select {
          border: none;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: var(--text-secondary);
          background: transparent;
          cursor: pointer;
          padding: 14px 18px;
          border-right: 1px solid var(--border);
          flex-shrink: 0;
        }
        .bh-search-btn {
          background: var(--green-primary);
          color: #fff;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          padding: 14px 32px;
          cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bh-search-btn:hover { background: var(--green-mid); }



        /* ── LAYOUT ── */
        .bh-layout {
          max-width: 1280px;
          margin: 28px auto;
          padding: 0 24px 48px;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 22px;
          align-items: start;
        }
        @media(max-width:960px) {
          .bh-layout { grid-template-columns: 1fr; }
          .bh-sidebar { display: none; }
        }

        /* ── SIDEBAR ── */
        .bh-sidebar {
          position: sticky;
          top: 84px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Filter card */
        .bh-filter-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }
        .bh-filter-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .bh-filter-head h3 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .bh-reset-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--green-primary);
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .bh-filter-section { margin-bottom: 20px; }
        .bh-filter-section:last-child { margin-bottom: 0; }
        .bh-filter-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: block;
          margin-bottom: 10px;
        }
        .bh-filter-input {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-primary);
          outline: none;
          background: #fff;
          transition: border-color 0.15s;
        }
        .bh-filter-input:focus { border-color: var(--green-primary); }

        /* Price toggle */
        .bh-price-toggle {
          display: flex;
          background: #f8fafc;
          border-radius: 8px;
          padding: 3px;
          margin-bottom: 10px;
        }
        .bh-price-toggle-btn {
          flex: 1;
          padding: 6px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: transparent;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .bh-price-toggle-btn.active {
          background: var(--green-primary);
          color: #fff;
        }
        .bh-price-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .bh-price-input-wrap { position: relative; }
        .bh-price-prefix {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          pointer-events: none;
        }
        .bh-price-input {
          width: 100%;
          padding: 9px 10px 9px 36px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          color: var(--text-primary);
          transition: border-color 0.15s;
        }
        .bh-price-input:focus { border-color: var(--green-primary); }

        /* Star rating filter */
        .bh-star-rows { display: flex; flex-direction: column; gap: 6px; }
        .bh-star-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1.5px solid transparent;
        }
        .bh-star-row:hover { background: var(--green-light); }
        .bh-star-row.active {
          background: var(--green-light);
          border-color: var(--green-border);
        }
        .bh-star-row input { display: none; }
        .bh-star-row-left { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-primary); font-weight: 500; }
        .bh-star-row-stars { color: #f59e0b; font-size: 12px; letter-spacing: 1px; }
        .bh-star-row-count { font-size: 11px; color: var(--text-muted); background: #f1f5f9; padding: 2px 8px; border-radius: 20px; font-weight: 600; }

        /* Amenity chips */
        .bh-amenity-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .bh-amenity-chip {
          padding: 5px 12px;
          border: 1.5px solid var(--border);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: #fff;
          color: var(--text-secondary);
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s;
        }
        .bh-amenity-chip.active {
          background: var(--green-light);
          border-color: var(--green-primary);
          color: var(--green-primary);
        }
        .bh-amenity-chip:hover { border-color: var(--green-primary); color: var(--green-primary); }

        /* ── RESULTS ── */
        .bh-results { min-width: 0; }

        .bh-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .bh-results-count {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .bh-results-count span {
          font-weight: 500;
          color: var(--text-muted);
          font-size: 13px;
        }
        .bh-header-right { display: flex; align-items: center; gap: 10px; }
        .bh-sort-select {
          padding: 9px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-secondary);
          outline: none;
          background: #fff;
          cursor: pointer;
          font-weight: 500;
        }
        .bh-view-toggle {
          display: flex;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .bh-vtoggle-btn {
          padding: 8px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 14px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
        }
        .bh-vtoggle-btn.active { background: var(--green-light); color: var(--green-primary); }

        /* ── GRID CARDS (EcoHome style) ── */
        .bh-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 18px;
        }

        .bh-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }
        .bh-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--green-border);
        }

        .bh-card-img {
          position: relative;
          height: 210px;
          overflow: hidden;
        }
        .bh-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .bh-card:hover .bh-card-img img { transform: scale(1.06); }

        .bh-card-stars {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          color: #fbbf24;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 1px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .bh-card-rating {
          position: absolute;
          top: 12px;
          right: 48px;
          background: var(--green-primary);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          padding: 4px 9px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .bh-card-save {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
          color: #94a3b8;
        }
        .bh-card-save:hover { background: #fff; color: #ef4444; transform: scale(1.1); }
        .bh-card-loc-pill {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          color: rgba(255,255,255,0.9);
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          font-weight: 500;
        }

        .bh-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .bh-card-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .bh-card-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 12px;
        }
        .bh-card-amenity {
          font-size: 10.5px;
          background: var(--green-light);
          color: var(--green-mid);
          padding: 3px 9px;
          border-radius: 20px;
          font-weight: 600;
          border: 1px solid var(--green-border);
        }

        .bh-card-footer {
          margin-top: auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .bh-card-price-old {
          font-size: 11px;
          color: var(--text-muted);
          text-decoration: line-through;
          line-height: 1;
        }
        .bh-card-price {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .bh-card-price-note { font-size: 10.5px; color: var(--text-muted); margin-top: 2px; }
        .bh-card-book-btn {
          background: var(--green-primary);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 9px 16px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .bh-card-book-btn:hover { background: var(--green-mid); transform: translateY(-1px); }

        /* ── LIST VIEW ── */
        .bh-list { display: flex; flex-direction: column; gap: 14px; }
        .bh-list-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.25s;
        }
        .bh-list-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--green-border); }
        .bh-list-img {
          width: 260px;
          min-height: 200px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .bh-list-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .bh-list-card:hover .bh-list-img img { transform: scale(1.04); }
        @media(max-width:700px){ .bh-list-img { width: 120px; min-height: 160px; } }
        .bh-list-img-badge {
          position: absolute; top: 10px; left: 10px;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
          color: #fbbf24; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600;
        }
        .bh-list-save {
          position: absolute; top: 8px; right: 8px;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.9); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #94a3b8; transition: all 0.2s;
        }
        .bh-list-save:hover { background: #fff; color: #ef4444; }
        .bh-list-body { flex: 1; padding: 18px 20px; display: flex; flex-direction: column; min-width: 0; }
        .bh-list-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
        .bh-list-name { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
        .bh-list-rating {
          background: var(--green-primary); color: #fff;
          border-radius: 8px 8px 8px 0; padding: 5px 10px;
          font-size: 13px; font-weight: 800; flex-shrink: 0; min-width: 38px; text-align: center;
        }
        .bh-list-loc { font-size: 12.5px; color: var(--green-primary); font-weight: 600; display: flex; align-items: center; gap: 4px; margin-bottom: 10px; }
        .bh-list-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; }
        .bh-list-amenities { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
        .bh-list-amenity { background: var(--green-light); color: var(--green-mid); border: 1px solid var(--green-border); font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        .bh-list-footer { display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto; padding-top: 12px; border-top: 1px solid #f1f5f9; gap: 10px; flex-wrap: wrap; }
        .bh-list-price-note { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
        .bh-list-price { font-size: 1.45rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1; }
        .bh-list-price-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .bh-list-actions { display: flex; gap: 8px; }
        .bh-detail-btn {
          padding: 9px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 5px;
          border: 1.5px solid var(--border); background: #fff; color: var(--text-secondary);
        }
        .bh-detail-btn:hover { border-color: var(--green-primary); color: var(--green-primary); }
        .bh-book-btn2 {
          padding: 9px 20px; border-radius: 10px; font-size: 12.5px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
          background: var(--green-primary); color: #fff; border: none;
        }
        .bh-book-btn2:hover { background: var(--green-mid); transform: translateY(-1px); }

        /* Loading/empty */
        .bh-loading { display: flex; flex-direction: column; align-items: center; padding: 80px 24px; gap: 14px; }
        .bh-spinner { width: 40px; height: 40px; border: 3px solid var(--green-soft); border-top: 3px solid var(--green-primary); border-radius: 50%; animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bh-empty { text-align: center; padding: 80px 24px; }
        .bh-empty-icon { font-size: 3rem; margin-bottom: 14px; }
        .bh-empty h3 { font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 700; }
        .bh-empty p { color: var(--text-muted); font-size: 14px; }

        /* ── MODAL ── */
        .bh-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px; backdrop-filter: blur(6px); }
        .bh-modal { background: #fff; border-radius: 20px; max-width: 560px; width: 100%; max-height: 92vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.3); }
        .bh-modal-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 22px 16px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: #fff; z-index: 2; }
        .bh-modal-head h2 { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
        .bh-modal-head p { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
        .bh-modal-close { width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--border); background: none; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all 0.15s; }
        .bh-modal-close:hover { background: var(--green-light); border-color: var(--green-primary); color: var(--green-primary); }
        .bh-modal-hotel { display: flex; gap: 14px; padding: 14px 22px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; align-items: center; }
        .bh-modal-hotel img { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; }
        .bh-modal-hotel-name { font-weight: 700; font-size: 14px; color: var(--text-primary); }
        .bh-modal-hotel-loc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .bh-modal-hotel-price { font-size: 14px; font-weight: 800; color: var(--green-primary); margin-top: 4px; }
        .bh-modal-body { padding: 18px 22px; }
        .bh-modal-section { margin-bottom: 20px; }
        .bh-modal-section h3 { font-size: 11px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 12px; }
        .bh-modal-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; border-radius: 10px; }
        .bh-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(max-width:480px){ .bh-form-row { grid-template-columns: 1fr; } }
        .bh-form-field { display: flex; flex-direction: column; gap: 4px; }
        .bh-form-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); }
        .bh-form-input { padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-primary); outline: none; transition: border 0.15s; }
        .bh-form-input:focus { border-color: var(--green-primary); }
        .bh-nights-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--green-light); border: 1px solid var(--green-border); color: var(--green-mid); font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 20px; margin-top: 10px; }
        .bh-counter-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #f8fafc; }
        .bh-counter-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .bh-counter-sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
        .bh-counter-btns { display: flex; align-items: center; gap: 12px; }
        .bh-counter-btn { width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--border); background: #fff; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.15s; }
        .bh-counter-btn:hover:not(:disabled) { background: var(--green-light); border-color: var(--green-primary); }
        .bh-counter-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .bh-counter-val { font-weight: 800; font-size: 14px; color: var(--text-primary); min-width: 22px; text-align: center; }
        .bh-price-summary { background: #f8fafc; border-radius: 12px; padding: 14px; margin-top: 4px; border: 1px solid var(--border); }
        .bh-price-row2 { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); margin-bottom: 7px; }
        .bh-price-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 4px; }
        .bh-confirm-btn { background: var(--green-primary); color: #fff; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; width: 100%; margin-top: 18px; letter-spacing: -0.01em; }
        .bh-confirm-btn:hover:not(:disabled) { background: var(--green-mid); }
        .bh-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .bh-success { text-align: center; padding: 36px 22px; }
        .bh-success-icon { font-size: 3.5rem; display: block; margin-bottom: 16px; }
        .bh-success h3 { font-size: 1.4rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 800; letter-spacing: -0.02em; }
        .bh-success p { color: var(--text-muted); font-size: 13px; margin-bottom: 16px; }
        .bh-success-id { background: var(--green-light); border: 1px solid var(--green-border); color: var(--green-mid); font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-bottom: 18px; }

        /* ── CTA ── */
        .bh-cta {
          background: linear-gradient(135deg, #052e16 0%, #064e23 100%);
          text-align: center;
          padding: 64px 24px;
          position: relative;
          overflow: hidden;
        }
        .bh-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .bh-cta h2 { font-size: 1.9rem; font-weight: 800; color: #fff; margin-bottom: 10px; position: relative; letter-spacing: -0.03em; }
        .bh-cta p { color: rgba(255,255,255,0.55); font-size: 0.95rem; margin-bottom: 28px; position: relative; }
        .bh-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; }
        .bh-cta-primary { background: var(--green-primary); color: #fff; text-decoration: none; padding: 13px 30px; border-radius: 12px; font-weight: 700; font-size: 14px; transition: background 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .bh-cta-primary:hover { background: var(--green-mid); }
        .bh-cta-secondary { background: rgba(255,255,255,0.08); color: #fff; text-decoration: none; padding: 13px 30px; border-radius: 12px; font-weight: 700; font-size: 14px; border: 1px solid rgba(255,255,255,0.15); transition: background 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .bh-cta-secondary:hover { background: rgba(255,255,255,0.15); }

        @media(max-width:600px) {
          .bh-searchbar { flex-direction: column; }
          .bh-search-seg { border-right: none; border-bottom: 1px solid var(--border); width: 100%; }
          .bh-search-seg-select { border-right: none; border-bottom: 1px solid var(--border); width: 100%; }
          .bh-search-btn { width: 100%; justify-content: center; }
          .bh-list-img { width: 120px; }
        }
      `}</style>

      <div className="bh-root">

        {/* ── HERO ── */}
        <section className="bh-hero">
          <div className="bh-hero-inner">
            <h1>Find Your Perfect <em>Stay in Nepal</em></h1>
            <p className="bh-hero-sub">Handpicked hotels across Nepal's most beautiful destinations — from Thamel to Everest Base</p>

            <div className="bh-searchbar">
              <div className="bh-search-seg">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="bh-search-input"
                  placeholder="City, hotel name, or destination…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="bh-search-seg-select" value={starFilter} onChange={e => setStarFilter(e.target.value)}>
                <option value="">All Stars</option>
                {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} Stars</option>)}
              </select>
              <select className="bh-search-seg-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Sort by</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="stars">Top Rated</option>
              </select>
              <button className="bh-search-btn">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Search
              </button>
            </div>


          </div>
        </section>

        {/* ── MAIN LAYOUT ── */}
        <div className="bh-layout">

          {/* ── SIDEBAR ── */}
          <aside className="bh-sidebar">

            {/* Live hotel map */}
            <HotelMap
              hotels={filtered}
              onHotelClick={(hotel) => {
                const el = document.getElementById(`hotel-card-${hotel._id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />

            {/* Filters */}
            <div className="bh-filter-card">
              <div className="bh-filter-head">
                <h3>Filters</h3>
                <button className="bh-reset-link" onClick={resetFilters}>Reset all</button>
              </div>

              {/* Search */}
              <div className="bh-filter-section">
                <span className="bh-filter-label">Search</span>
                <input
                  className="bh-filter-input"
                  placeholder="Hotel or city…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Price */}
              <div className="bh-filter-section">
                <span className="bh-filter-label">Your Budget</span>
                <div className="bh-price-toggle">
                  <button className={`bh-price-toggle-btn${priceMode==='night'?' active':''}`} onClick={()=>setPriceMode('night')}>Per Night</button>
                  <button className={`bh-price-toggle-btn${priceMode==='total'?' active':''}`} onClick={()=>setPriceMode('total')}>Total Stay</button>
                </div>
                <span className="bh-filter-label" style={{marginBottom:8}}>Price, NPR</span>
                <div className="bh-price-inputs">
                  <div className="bh-price-input-wrap">
                    <span className="bh-price-prefix">from</span>
                    <input className="bh-price-input" type="number" placeholder="1" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
                  </div>
                  <div className="bh-price-input-wrap">
                    <span className="bh-price-prefix">to</span>
                    <input className="bh-price-input" type="number" placeholder="500k" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Star rating */}
              <div className="bh-filter-section">
                <span className="bh-filter-label">Rating</span>
                <div className="bh-star-rows">
                  <label
                    className={`bh-star-row${starFilter===''?' active':''}`}
                    onClick={() => setStarFilter('')}
                  >
                    <div className="bh-star-row-left">
                      <span>All</span>
                    </div>
                    <span className="bh-star-row-count">{hotels.length}</span>
                  </label>
                  {STAR_COUNTS.map(({s, count}) => (
                    <label
                      key={s}
                      className={`bh-star-row${starFilter===String(s)?' active':''}`}
                      onClick={() => setStarFilter(starFilter===String(s)?'':String(s))}
                    >
                      <div className="bh-star-row-left">
                        <span className="bh-star-row-stars">{'★'.repeat(s)}</span>
                        <span>{s} stars</span>
                      </div>
                      <span className="bh-star-row-count">{count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="bh-filter-section">
                <span className="bh-filter-label">Amenities</span>
                <div className="bh-amenity-chips">
                  {AMENITY_TYPES.map(a => (
                    <button
                      key={a}
                      className={`bh-amenity-chip${amenityFilter===a?' active':''}`}
                      onClick={() => setAmenityFilter(amenityFilter===a?'':a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── RESULTS ── */}
          <div className="bh-results">
            <div className="bh-results-header">
              <div className="bh-results-count">
                {filtered.length} {filtered.length === 1 ? 'variant' : 'variants'}
                {search && <span> for "{search}"</span>}
              </div>
              <div className="bh-header-right">
                <select className="bh-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="stars">Top Rated</option>
                </select>
                <div className="bh-view-toggle">
                  <button
                    className={`bh-vtoggle-btn${viewMode==='grid'?' active':''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </button>
                  <button
                    className={`bh-vtoggle-btn${viewMode==='list'?' active':''}`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="4" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/>
                      <rect x="3" y="18" width="18" height="2" rx="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bh-loading">
                <div className="bh-spinner" />
                <p style={{color:'var(--text-muted)',fontSize:14}}>Finding the best hotels for you…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bh-empty">
                <div className="bh-empty-icon">🏨</div>
                <h3>No hotels found</h3>
                <p>Try adjusting your filters or <button onClick={resetFilters} style={{color:'var(--green-primary)',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:14}}>reset all</button></p>
              </div>
            ) : viewMode === 'grid' ? (

              /* ── GRID VIEW ── */
              <div className="bh-grid">
                {filtered.map(hotel => {
                  const stars = Math.min(Math.round(hotel.starRating || hotel.stars || 0), 5);
                  const score = hotel.rating ? Number(hotel.rating).toFixed(1) : null;
                  return (
                    <div key={hotel._id} id={`hotel-card-${hotel._id}`} className="bh-card" onClick={() => navigate(`/hotels/${hotel._id}`)}>

                      <div className="bh-card-img">
                        <img
                          src={getImg(hotel)}
                          alt={hotel.name}
                          onError={e => { e.target.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'; }}
                        />
                        {stars > 0 && <div className="bh-card-stars">{'★'.repeat(stars)}</div>}
                        {score && <div className="bh-card-rating">♥ {score}</div>}
                        <button className="bh-card-save" onClick={e => e.stopPropagation()}>♡</button>
                        {hotel.location && (
                          <div className="bh-card-loc-pill">
                            <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                            {hotel.location}
                          </div>
                        )}
                      </div>
                      <div className="bh-card-body">
                        <div className="bh-card-name">{hotel.name}</div>
                        {hotel.amenities?.length > 0 && (
                          <div className="bh-card-amenities">
                            {hotel.amenities.slice(0,3).map(a => (
                              <span key={a} className="bh-card-amenity">{a}</span>
                            ))}
                          </div>
                        )}
                        <div className="bh-card-footer">
                          <div>
                            <div className="bh-card-price">NPR {Number(hotel.pricePerNight||0).toLocaleString()}</div>
                            <div className="bh-card-price-note">per night · taxes extra</div>
                          </div>
                          <button
                            className="bh-card-book-btn"
                            onClick={e => { e.stopPropagation(); openBooking(hotel); }}
                          >
                            Book now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : (

              /* ── LIST VIEW ── */
              <div className="bh-list">
                {filtered.map(hotel => {
                  const stars = Math.min(Math.round(hotel.starRating || hotel.stars || 0), 5);
                  const score = hotel.rating ? Number(hotel.rating).toFixed(1) : null;
                  return (
                    <div key={hotel._id} id={`hotel-card-${hotel._id}`} className="bh-list-card">
                      <div className="bh-list-img">
                        <img
                          src={getImg(hotel)}
                          alt={hotel.name}
                          onError={e => { e.target.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'; }}
                        />
                        {stars > 0 && <div className="bh-list-img-badge">{'★'.repeat(stars)}</div>}
                        <button className="bh-list-save" onClick={e => e.stopPropagation()}>♡</button>
                      </div>
                      <div className="bh-list-body">
                        <div className="bh-list-top">
                          <h3 className="bh-list-name">{hotel.name}</h3>
                          {score && <div className="bh-list-rating">{score}</div>}
                        </div>
                        {hotel.location && <div className="bh-list-loc">📍 {hotel.location}</div>}
                        <p className="bh-list-desc">{hotel.description || 'Comfortable and well-located accommodation in Nepal.'}</p>
                        {hotel.amenities?.length > 0 && (
                          <div className="bh-list-amenities">
                            {hotel.amenities.slice(0,5).map(a=>(
                              <span key={a} className="bh-list-amenity">✓ {a}</span>
                            ))}
                          </div>
                        )}
                        <div className="bh-list-footer">
                          <div>
                            <div className="bh-list-price-note">Price per night</div>
                            <div className="bh-list-price">NPR {Number(hotel.pricePerNight||0).toLocaleString()}</div>
                            <div className="bh-list-price-sub">Taxes & fees extra</div>
                          </div>
                          <div className="bh-list-actions">
                            <Link to={`/hotels/${hotel._id}`} className="bh-detail-btn">See details</Link>
                            <button className="bh-book-btn2" onClick={() => openBooking(hotel)}>Book now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CTA ── */}
        <section className="bh-cta">
          <h2>Can't Find the Right Hotel?</h2>
          <p>Our local guides can help you find the perfect stay for your Nepal adventure</p>
          <div className="bh-cta-btns">
            <Link to="/browse-guides" className="bh-cta-primary">Find a Local Guide</Link>
            <Link to="/browse-packages" className="bh-cta-secondary">Browse Packages</Link>
          </div>
        </section>

        {/* ── BOOKING MODAL ── */}
        {bookingHotel && (
          <BookingModal
            type="hotel"
            item={bookingHotel}
            onClose={() => setBookingHotel(null)}
          />
        )}

      </div>
    </>
  );
}
