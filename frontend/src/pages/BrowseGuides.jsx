import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const BrowseGuides = () => {
  const [allGuides, setAllGuides] = useState([]);
  const [guides, setGuides]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [viewMode, setViewMode]   = useState('grid');
  const [filters, setFilters]     = useState({
    name: '', specialty: '', language: '', minRating: 0, maxPrice: '',
  });

  useEffect(() => { fetchGuides(); }, []);
  useEffect(() => { applyFilters(allGuides); }, [allGuides, filters]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API}/guides`);
      const raw = res.data?.guides || res.data || [];
      setAllGuides(raw);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Failed to load guides. Please try again.');
      setAllGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (raw) => {
    const filtered = raw.filter(g => {
      const fullName = `${g.firstName || ''} ${g.lastName || ''}`.toLowerCase();
      const matchesName      = !filters.name      || fullName.includes(filters.name.toLowerCase());
      const matchesSpecialty = !filters.specialty || (g.specializations || []).some(s => s.toLowerCase().includes(filters.specialty.toLowerCase()));
      const matchesLanguage  = !filters.language  || (g.languages || []).some(l => l.toLowerCase().includes(filters.language.toLowerCase()));
      const matchesRating    = !filters.minRating || (g.rating || 0) >= Number(filters.minRating);
      const matchesPrice     = !filters.maxPrice  || !g.hourlyRate || g.hourlyRate <= Number(filters.maxPrice);
      return matchesName && matchesSpecialty && matchesLanguage && matchesRating && matchesPrice;
    });
    setGuides(filtered);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () =>
    setFilters({ name: '', specialty: '', language: '', minRating: 0, maxPrice: '' });

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

        .bg-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg-page);
          min-height: 100vh;
          padding-top: 68px;
        }

        /* ── HERO ── */
        .bg-hero {
          background: linear-gradient(135deg, #052e16 0%, #064e23 50%, #0a4a1e 100%);
          padding: 48px 28px 36px;
          position: relative;
          overflow: hidden;
        }
        .bg-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1554274311-5efce2b2ea3c?w=1600&q=30') center/cover;
          opacity: 0.08;
        }
        .bg-hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .bg-hero h1 {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .bg-hero h1 em { font-style: normal; color: #4ade80; }
        .bg-hero-sub {
          color: rgba(255,255,255,0.55);
          font-size: 0.9rem;
          font-weight: 400;
          margin-bottom: 24px;
        }

        /* Search bar */
        .bg-searchbar {
          background: #fff;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          overflow: hidden;
          box-shadow: 0 8px 48px rgba(0,0,0,0.25);
          width: 100%;
          max-width: 100%;
        }
        .bg-search-seg {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          flex: 1;
          border-right: 1px solid var(--border);
          min-width: 0;
        }
        .bg-search-seg svg { color: var(--text-muted); flex-shrink: 0; }
        .bg-search-input {
          border: none;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          color: var(--text-primary);
          background: transparent;
          width: 100%;
        }
        .bg-search-input::placeholder { color: var(--text-muted); }
        .bg-search-seg-select {
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
        .bg-search-btn {
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
        .bg-search-btn:hover { background: var(--green-mid); }

        /* ── LAYOUT ── */
        .bg-layout {
          max-width: 1280px;
          margin: 28px auto;
          padding: 0 24px 48px;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 22px;
          align-items: start;
        }
        @media(max-width:960px) {
          .bg-layout { grid-template-columns: 1fr; }
          .bg-sidebar { display: none; }
        }

        /* ── SIDEBAR ── */
        .bg-sidebar {
          position: sticky;
          top: 84px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bg-filter-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }
        .bg-filter-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .bg-filter-head h3 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .bg-reset-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--green-primary);
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .bg-filter-section { margin-bottom: 20px; }
        .bg-filter-section:last-child { margin-bottom: 0; }
        .bg-filter-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: block;
          margin-bottom: 10px;
        }
        .bg-filter-input, .bg-filter-select {
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
        .bg-filter-input:focus, .bg-filter-select:focus { border-color: var(--green-primary); }

        /* ── RESULTS ── */
        .bg-results { min-width: 0; }
        .bg-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .bg-results-count {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .bg-results-count span {
          font-weight: 500;
          color: var(--text-muted);
          font-size: 13px;
        }
        .bg-header-right { display: flex; align-items: center; gap: 10px; }
        .bg-sort-select {
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
        .bg-view-toggle {
          display: flex;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .bg-vtoggle-btn {
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
        .bg-vtoggle-btn.active { background: var(--green-light); color: var(--green-primary); }

        /* ── GRID CARDS ── */
        .bg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 18px;
        }
        .bg-card {
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
        .bg-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--green-border);
        }
        .bg-card-img {
          position: relative;
          height: 210px;
          overflow: hidden;
        }
        .bg-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .bg-card:hover .bg-card-img img { transform: scale(1.06); }

        .bg-card-avail {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .bg-card-avail.available { background: rgba(22,163,74,0.85); color: #fff; }
        .bg-card-avail.unavailable { background: rgba(100,116,139,0.8); color: #fff; }

        .bg-card-rating {
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
        .bg-card-save {
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
        .bg-card-save:hover { background: #fff; color: #ef4444; transform: scale(1.1); }

        .bg-card-loc-pill {
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
        .bg-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .bg-card-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .bg-card-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .bg-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 12px;
        }
        .bg-card-tag {
          font-size: 10.5px;
          background: var(--green-light);
          color: var(--green-mid);
          padding: 3px 9px;
          border-radius: 20px;
          font-weight: 600;
          border: 1px solid var(--green-border);
        }
        .bg-card-footer {
          margin-top: auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .bg-card-price {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .bg-card-price-note { font-size: 10.5px; color: var(--text-muted); margin-top: 2px; }
        .bg-card-view-btn {
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
          text-decoration: none;
          display: inline-block;
        }
        .bg-card-view-btn:hover { background: var(--green-mid); transform: translateY(-1px); }

        /* ── LIST VIEW ── */
        .bg-list { display: flex; flex-direction: column; gap: 14px; }
        .bg-list-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.25s;
        }
        .bg-list-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--green-border); }
        .bg-list-img {
          width: 240px;
          min-height: 200px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .bg-list-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .bg-list-card:hover .bg-list-img img { transform: scale(1.04); }
        @media(max-width:700px) { .bg-list-img { width: 120px; min-height: 160px; } }

        .bg-list-avail {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .bg-list-avail.available { background: rgba(22,163,74,0.85); color: #fff; }
        .bg-list-avail.unavailable { background: rgba(100,116,139,0.8); color: #fff; }

        .bg-list-save {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #94a3b8;
          transition: all 0.2s;
        }
        .bg-list-save:hover { background: #fff; color: #ef4444; }

        .bg-list-body { flex: 1; padding: 18px 20px; display: flex; flex-direction: column; min-width: 0; }
        .bg-list-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
        .bg-list-name { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
        .bg-list-rating-badge {
          background: var(--green-primary);
          color: #fff;
          border-radius: 8px 8px 8px 0;
          padding: 5px 10px;
          font-size: 13px;
          font-weight: 800;
          flex-shrink: 0;
          min-width: 38px;
          text-align: center;
        }
        .bg-list-sub { font-size: 12.5px; color: var(--text-muted); margin-bottom: 8px; }
        .bg-list-bio {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .bg-list-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
        .bg-list-tag {
          background: var(--green-light);
          color: var(--green-mid);
          border: 1px solid var(--green-border);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .bg-list-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
          gap: 10px;
          flex-wrap: wrap;
        }
        .bg-list-price-note { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
        .bg-list-price { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1; }
        .bg-list-price-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .bg-list-actions { display: flex; gap: 8px; }
        .bg-detail-btn {
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1.5px solid var(--border);
          background: #fff;
          color: var(--text-secondary);
        }
        .bg-detail-btn:hover { border-color: var(--green-primary); color: var(--green-primary); }
        .bg-book-btn2 {
          padding: 9px 20px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          background: var(--green-primary);
          color: #fff;
          border: none;
        }
        .bg-book-btn2:hover { background: var(--green-mid); transform: translateY(-1px); }

        /* Loading / empty */
        .bg-loading { display: flex; flex-direction: column; align-items: center; padding: 80px 24px; gap: 14px; }
        .bg-spinner { width: 40px; height: 40px; border: 3px solid var(--green-soft); border-top: 3px solid var(--green-primary); border-radius: 50%; animation: bg-spin 0.9s linear infinite; }
        @keyframes bg-spin { to { transform: rotate(360deg); } }
        .bg-empty { text-align: center; padding: 80px 24px; }
        .bg-empty-icon { font-size: 3rem; margin-bottom: 14px; }
        .bg-empty h3 { font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 700; }
        .bg-empty p { color: var(--text-muted); font-size: 14px; }

        /* ── CTA ── */
        .bg-cta {
          background: linear-gradient(135deg, #052e16 0%, #064e23 100%);
          text-align: center;
          padding: 64px 24px;
          position: relative;
          overflow: hidden;
        }
        .bg-cta h2 { font-size: 1.9rem; font-weight: 800; color: #fff; margin-bottom: 10px; position: relative; letter-spacing: -0.03em; }
        .bg-cta p { color: rgba(255,255,255,0.55); font-size: 0.95rem; margin-bottom: 28px; position: relative; }
        .bg-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; }
        .bg-cta-primary {
          background: var(--green-primary);
          color: #fff;
          text-decoration: none;
          padding: 13px 30px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          transition: background 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .bg-cta-primary:hover { background: var(--green-mid); }
        .bg-cta-secondary {
          background: rgba(255,255,255,0.08);
          color: #fff;
          text-decoration: none;
          padding: 13px 30px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.15);
          transition: background 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .bg-cta-secondary:hover { background: rgba(255,255,255,0.15); }

        @media(max-width:600px) {
          .bg-searchbar { flex-direction: column; }
          .bg-search-seg { border-right: none; border-bottom: 1px solid var(--border); width: 100%; }
          .bg-search-seg-select { border-right: none; border-bottom: 1px solid var(--border); width: 100%; }
          .bg-search-btn { width: 100%; justify-content: center; }
          .bg-list-img { width: 120px; }
        }
      `}</style>

      <div className="bg-root">

        {/* ── HERO ── */}
        <section className="bg-hero">
          <div className="bg-hero-inner">
            <h1>Find Your Perfect <em>Local Guide</em></h1>
            <p className="bg-hero-sub">Connect with certified local guides who know Nepal's best spots, hidden gems, and secret trails</p>

            <div className="bg-searchbar">
              <div className="bg-search-seg">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="bg-search-input"
                  placeholder="Guide name or specialty…"
                  value={filters.name}
                  onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <select
                className="bg-search-seg-select"
                value={filters.specialty}
                onChange={e => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
              >
                <option value="">All Specialties</option>
                <option value="Hiking">Hiking</option>
                <option value="Cultural">Cultural Tours</option>
                <option value="Trekking">Trekking</option>
                <option value="Adventure">Adventure</option>
                <option value="Photography">Photography</option>
                <option value="History">History</option>
              </select>
              <select
                className="bg-search-seg-select"
                value={filters.minRating}
                onChange={e => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
              <button className="bg-search-btn">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Search
              </button>
            </div>
          </div>
        </section>

        {/* ── MAIN LAYOUT ── */}
        <div className="bg-layout">

          {/* ── SIDEBAR ── */}
          <aside className="bg-sidebar">
            <div className="bg-filter-card">
              <div className="bg-filter-head">
                <h3>Filters</h3>
                <button className="bg-reset-link" onClick={resetFilters}>Reset all</button>
              </div>

              <div className="bg-filter-section">
                <span className="bg-filter-label">Name</span>
                <input
                  type="text"
                  name="name"
                  className="bg-filter-input"
                  placeholder="e.g. Ram, Sita"
                  value={filters.name}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="bg-filter-section">
                <span className="bg-filter-label">Specialty</span>
                <select name="specialty" className="bg-filter-select" value={filters.specialty} onChange={handleFilterChange}>
                  <option value="">All Specialties</option>
                  <option value="Hiking">Hiking</option>
                  <option value="Cultural">Cultural Tours</option>
                  <option value="Trekking">Trekking</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Photography">Photography</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div className="bg-filter-section">
                <span className="bg-filter-label">Language</span>
                <select name="language" className="bg-filter-select" value={filters.language} onChange={handleFilterChange}>
                  <option value="">All Languages</option>
                  <option value="English">English</option>
                  <option value="Nepali">Nepali</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>

              <div className="bg-filter-section">
                <span className="bg-filter-label">Min Rating</span>
                <select name="minRating" className="bg-filter-select" value={filters.minRating} onChange={handleFilterChange}>
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>

              <div className="bg-filter-section">
                <span className="bg-filter-label">Max Rate ($/hr)</span>
                <input
                  type="number"
                  name="maxPrice"
                  className="bg-filter-input"
                  placeholder="Any price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </aside>

          {/* ── RESULTS ── */}
          <div className="bg-results">

            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fecaca' }}>
                {error}{' '}
                <button onClick={fetchGuides} style={{ marginLeft: 8, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Retry
                </button>
              </div>
            )}

            <div className="bg-results-header">
              <div className="bg-results-count">
                {guides.length} {guides.length === 1 ? 'guide' : 'guides'}
                <span> found</span>
              </div>
              <div className="bg-header-right">
                <div className="bg-view-toggle">
                  <button
                    className={`bg-vtoggle-btn${viewMode === 'grid' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </button>
                  <button
                    className={`bg-vtoggle-btn${viewMode === 'list' ? ' active' : ''}`}
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
              <div className="bg-loading">
                <div className="bg-spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading guides…</p>
              </div>
            ) : guides.length === 0 ? (
              <div className="bg-empty">
                <div className="bg-empty-icon">🧭</div>
                <h3>No guides found</h3>
                <p>
                  {allGuides.length === 0
                    ? 'No approved guides yet. Guides appear here once an admin approves their application.'
                    : <>Try adjusting your filters or <button onClick={resetFilters} style={{ color: 'var(--green-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>reset all</button></>
                  }
                </p>
              </div>
            ) : viewMode === 'grid' ? (

              /* ── GRID VIEW ── */
              <div className="bg-grid">
                {guides.map(guide => {
                  const name    = `${guide.firstName || ''} ${guide.lastName || ''}`.trim() || 'Guide';
                  const score   = guide.rating ? Number(guide.rating).toFixed(1) : null;
                  const imgSrc  = guide.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=400`;

                  return (
                    <div key={guide._id} className="bg-card">
                      <div className="bg-card-img">
                        <img
                          src={imgSrc}
                          alt={name}
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=400`; }}
                        />
                        <div className={`bg-card-avail ${guide.availability ? 'available' : 'unavailable'}`}>
                          {guide.availability ? '● Available' : '● Unavailable'}
                        </div>
                        {score && <div className="bg-card-rating">♥ {score}</div>}
                        <button className="bg-card-save" onClick={e => e.stopPropagation()}>♡</button>
                        {(guide.city || guide.location) && (
                          <div className="bg-card-loc-pill">
                            <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            </svg>
                            {guide.city || guide.location}
                          </div>
                        )}
                      </div>
                      <div className="bg-card-body">
                        <div className="bg-card-name">{name}</div>
                        <div className="bg-card-meta">
                          {guide.yearsExperience > 0 && `🗓 ${guide.yearsExperience} yrs`}
                          {guide.yearsExperience > 0 && guide.licenseNumber && ' · '}
                          {guide.licenseNumber && '🪪 Licensed'}
                        </div>
                        {guide.specializations?.length > 0 && (
                          <div className="bg-card-tags">
                            {guide.specializations.slice(0, 3).map((s, i) => (
                              <span key={i} className="bg-card-tag">{s}</span>
                            ))}
                            {guide.specializations.length > 3 && (
                              <span className="bg-card-tag">+{guide.specializations.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="bg-card-footer">
                          <div>
                            {guide.hourlyRate > 0 && (
                              <div className="bg-card-price">
                                ${guide.hourlyRate}
                                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>/hr</span>
                              </div>
                            )}
                            {guide.dailyRate > 0 && (
                              <div className="bg-card-price-note">${guide.dailyRate} daily · taxes extra</div>
                            )}
                          </div>
                          <Link to={`/guides/${guide._id}`} className="bg-card-view-btn">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : (

              /* ── LIST VIEW ── */
              <div className="bg-list">
                {guides.map(guide => {
                  const name   = `${guide.firstName || ''} ${guide.lastName || ''}`.trim() || 'Guide';
                  const score  = guide.rating ? Number(guide.rating).toFixed(1) : null;
                  const imgSrc = guide.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=400`;

                  return (
                    <div key={guide._id} className="bg-list-card">
                      <div className="bg-list-img">
                        <img
                          src={imgSrc}
                          alt={name}
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=400`; }}
                        />
                        <div className={`bg-list-avail ${guide.availability ? 'available' : 'unavailable'}`}>
                          {guide.availability ? '● Available' : '● Unavailable'}
                        </div>
                        <button className="bg-list-save" onClick={e => e.stopPropagation()}>♡</button>
                      </div>
                      <div className="bg-list-body">
                        <div className="bg-list-top">
                          <h3 className="bg-list-name">{name}</h3>
                          {score && <div className="bg-list-rating-badge">{score}</div>}
                        </div>
                        <div className="bg-list-sub">
                          {(guide.city || guide.location) && `📍 ${guide.city || guide.location}`}
                          {(guide.city || guide.location) && guide.yearsExperience > 0 && ' · '}
                          {guide.yearsExperience > 0 && `🗓 ${guide.yearsExperience} yrs`}
                          {guide.licenseNumber && ' · 🪪 Licensed'}
                        </div>
                        {guide.bio && <p className="bg-list-bio">{guide.bio}</p>}
                        <div className="bg-list-tags">
                          {guide.specializations?.slice(0, 3).map((s, i) => (
                            <span key={i} className="bg-list-tag">✓ {s}</span>
                          ))}
                          {guide.languages?.slice(0, 2).map((l, i) => (
                            <span key={i} className="bg-list-tag">✓ {l}</span>
                          ))}
                        </div>
                        <div className="bg-list-footer">
                          <div>
                            <div className="bg-list-price-note">Hourly rate</div>
                            {guide.hourlyRate > 0 ? (
                              <div className="bg-list-price">
                                ${guide.hourlyRate}
                                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/hr</span>
                              </div>
                            ) : (
                              <div className="bg-list-price" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>On request</div>
                            )}
                            {guide.dailyRate > 0 && (
                              <div className="bg-list-price-sub">${guide.dailyRate} daily · taxes extra</div>
                            )}
                          </div>
                          <div className="bg-list-actions">
                            <Link to={`/guides/${guide._id}`} className="bg-detail-btn">See profile</Link>
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
        <section className="bg-cta">
          <h2>Want to Become a Guide?</h2>
          <p>Share your expertise and earn while exploring Nepal's beautiful landscapes</p>
          <div className="bg-cta-btns">
            <Link to="/apply-guide" className="bg-cta-primary">Apply as a Guide</Link>
            <Link to="/browse-packages" className="bg-cta-secondary">Browse Packages</Link>
          </div>
        </section>

      </div>
    </>
  );
};

export default BrowseGuides;