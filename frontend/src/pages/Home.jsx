import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const STATIC_DESTINATIONS = [
  { name: 'Everest Region', region: 'Khumbu', tag: 'High Altitude', color: '#1a4a3a' },
  { name: 'Annapurna Circuit', region: 'Gandaki', tag: 'Most Popular', color: '#2d3a5a' },
  { name: 'Langtang Valley', region: 'Bagmati', tag: 'Hidden Gem', color: '#3a2a1a' },
  { name: 'Mustang Region', region: 'Gandaki', tag: 'Restricted', color: '#1a3a4a' },
  { name: 'Pokhara', region: 'Gandaki', tag: 'City Base', color: '#2a4a2a' },
  { name: 'Chitwan', region: 'Bagmati', tag: 'Wildlife', color: '#3a1a2a' },
];

const TOOLS = [
  { icon: '🗺️', title: 'Itinerary Planner', desc: 'Build your day-by-day Nepal trip plan', link: '/itinerary-planner' },
  { icon: '💰', title: 'Budget Calculator', desc: 'Estimate costs for your journey', link: '/budget-planner' },
  { icon: '💱', title: 'Currency Exchanger', desc: 'Live NPR exchange rates', link: '/currency-exchanger' },
  { icon: '🧭', title: 'Trail Maps', desc: 'Explore Nepal offline maps', link: '/browse-destinations' },
];

const WHY_ITEMS = [
  { icon: '✓', title: 'Verified Hotels & Packages', desc: 'Every listing is reviewed and quality-checked by our local team in Nepal.' },
  { icon: '🧭', title: 'Certified Local Guides', desc: 'Connect with 200+ government-verified trekking guides across all regions.' },
  { icon: '📋', title: 'Permit Guidance', desc: 'Complete permit requirements and application process, all in one place.' },
  { icon: '⛰️', title: 'Real-time Trail Info', desc: 'Up-to-date trail conditions, weather forecasts, and seasonal alerts.' },
  { icon: '💬', title: '24/7 Support', desc: 'Emergency contact staffed by experienced Nepal travel coordinators.' },
  { icon: '⭐', title: 'Honest Reviews', desc: 'Real itineraries from real travelers. No sponsored content, no bias.' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    setHeroLoaded(true);
    axios.get(`${API}/packages`).then(r => setPackages((r.data.packages || r.data || []).slice(0, 6))).catch(() => setPackages([])).finally(() => setLoadingPkgs(false));
    axios.get(`${API}/hotels`).then(r => setHotels((r.data.hotels || r.data || []).slice(0, 4))).catch(() => setHotels([])).finally(() => setLoadingHotels(false));
    axios.get(`${API}/guides`).then(r => setGuides((r.data.guides || r.data || []).slice(0, 4))).catch(() => setGuides([])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/browse-packages?search=${encodeURIComponent(searchQuery)}`);
    else navigate('/browse-packages');
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API.replace('/api', '')}/uploads/${img}`;
  };

  const DIFF_COLORS = {
    Easy: { bg: '#dcfce7', color: '#166534' },
    Moderate: { bg: '#fef9c3', color: '#854d0e' },
    Challenging: { bg: '#fee2e2', color: '#991b1b' },
    Expert: { bg: '#ede9fe', color: '#5b21b6' },
  };

  const tabs = ['All', 'Classic Treks', 'Off-Beat', 'High Altitude', 'Easy Hikes'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;0,800;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .mtb-home { background: #fff; }

        /* ── HERO ── */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #0a1a10;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #0a2818 0%, #0d3320 30%, #1a4a2a 60%, #0a1a10 100%);
        }
        .hero-bg::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-mountains {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.03) 100%);
          clip-path: polygon(0% 100%, 8% 60%, 15% 70%, 22% 45%, 30% 62%, 38% 30%, 45% 50%, 52% 20%, 60% 45%, 67% 35%, 74% 55%, 82% 25%, 90% 48%, 100% 35%, 100% 100%);
          background: rgba(255,255,255,0.04);
        }
        .hero-content {
          position: relative; z-index: 2;
          text-align: center;
          padding: 2rem;
          max-width: 800px;
          opacity: 0;
          transform: translateY(30px);
          animation: heroFade 1s ease forwards 0.3s;
        }
        @keyframes heroFade { to { opacity: 1; transform: translateY(0); } }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .hero-badge span { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; }

        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
        }
        .hero-title em {
          font-style: italic;
          color: #4ade80;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 2.5rem;
          font-weight: 300;
        }

        /* search bar */
        .hero-search {
          background: #fff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          max-width: 680px;
          margin: 0 auto 3rem;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .search-field {
          flex: 1;
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px;
        }
        .search-field svg { color: #9ca3af; flex-shrink: 0; }
        .search-field input {
          border: none; outline: none;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #111; width: 100%;
          padding: 18px 0;
          background: transparent;
        }
        .search-field input::placeholder { color: #9ca3af; }
        .search-divider { width: 1px; height: 30px; background: #e5e7eb; flex-shrink: 0; }
        .search-select {
          border: none; outline: none;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #374151; padding: 18px 20px;
          background: transparent; cursor: pointer;
        }
        .search-btn {
          background: #16a34a; color: #fff;
          border: none; cursor: pointer;
          padding: 0 28px;
          height: 100%;
          min-height: 56px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .search-btn:hover { background: #15803d; }

        /* stats */
        .hero-stats {
          display: flex; align-items: center; justify-content: center;
          gap: 0; flex-wrap: wrap;
        }
        .hero-stat {
          text-align: center; padding: 0 2rem;
          border-right: 1px solid rgba(255,255,255,0.15);
        }
        .hero-stat:last-child { border-right: none; }
        .hero-stat-num {
          font-family: 'Fraunces', serif;
          font-size: 1.8rem; font-weight: 700;
          color: #fff; display: block;
        }
        .hero-stat-label { font-size: 12px; color: rgba(255,255,255,0.55); font-weight: 400; }

        /* ── SECTIONS ── */
        .section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; }
        .section-eyebrow {
          font-size: 12px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: #16a34a; margin-bottom: 0.5rem;
        }
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 700; color: #0f172a;
          line-height: 1.2; margin-bottom: 0.75rem;
        }
        .section-sub { color: #64748b; font-size: 0.95rem; line-height: 1.6; max-width: 500px; }

        /* ── FEATURED TABS ── */
        .tabs-row {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          margin-bottom: 2rem;
        }
        .tabs-list { display: flex; gap: 8px; flex-wrap: wrap; }
        .tab-btn {
          border: 1px solid #e2e8f0; background: #fff;
          border-radius: 100px; padding: 7px 16px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          color: #64748b; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .tab-btn:hover { border-color: #16a34a; color: #16a34a; }
        .tab-btn.active { background: #16a34a; border-color: #16a34a; color: #fff; }
        .view-all {
          font-size: 13px; font-weight: 600; color: #16a34a;
          text-decoration: none; display: flex; align-items: center; gap: 4px;
          white-space: nowrap;
        }
        .view-all:hover { gap: 8px; }

        /* ── PACKAGE CARDS ── */
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .pkg-card {
          border-radius: 16px; overflow: hidden;
          border: 1px solid #f1f5f9;
          background: #fff;
          transition: all 0.3s; cursor: pointer;
          text-decoration: none; color: inherit;
          display: block;
        }
        .pkg-card:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.1); transform: translateY(-4px); }
        .pkg-img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #f1f5f9; }
        .pkg-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .pkg-card:hover .pkg-img { transform: scale(1.05); }
        .pkg-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
        .pkg-badges { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
        .pkg-badge {
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          color: #fff; border-radius: 6px; padding: 4px 10px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
        }
        .pkg-diff {
          border-radius: 6px; padding: 4px 10px;
          font-size: 11px; font-weight: 600;
        }
        .pkg-fav {
          position: absolute; top: 12px; right: 12px;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.9); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
        .pkg-body { padding: 1rem 1.25rem 1.25rem; }
        .pkg-tags { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
        .pkg-tag { font-size: 11px; color: #64748b; background: #f8fafc; border-radius: 4px; padding: 2px 8px; }
        .pkg-name { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 600; color: #0f172a; margin-bottom: 6px; line-height: 1.3; }
        .pkg-meta { display: flex; gap: 12px; margin-bottom: 1rem; }
        .pkg-meta span { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
        .pkg-footer { display: flex; align-items: center; justify-content: space-between; }
        .pkg-price-label { font-size: 11px; color: #94a3b8; }
        .pkg-price-val { font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 700; color: #0f172a; }
        .pkg-price-per { font-size: 11px; color: #94a3b8; }
        .pkg-btn {
          background: #0f172a; color: #fff; border: none; cursor: pointer;
          border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; transition: background 0.2s;
          text-decoration: none; display: inline-block;
        }
        .pkg-btn:hover { background: #16a34a; }

        /* ── SKELETON ── */
        .skel { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ── REGIONS ── */
        .regions-bg { background: #f8fafc; padding: 5rem 2rem; }
        .regions-inner { max-width: 1200px; margin: 0 auto; }
        .regions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 2rem; }
        .region-card {
          border-radius: 16px; overflow: hidden; position: relative;
          aspect-ratio: 4/3; cursor: pointer; text-decoration: none;
          display: block;
          transition: transform 0.3s;
        }
        .region-card:hover { transform: scale(1.02); }
        .region-card:hover .region-arrow { transform: translate(4px, -4px); }
        .region-bg { position: absolute; inset: 0; }
        .region-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%); }
        .region-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem; }
        .region-tag { display: inline-block; background: rgba(255,255,255,0.15); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 3px 10px; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.85); margin-bottom: 6px; }
        .region-name { font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 700; color: #fff; display: block; margin-bottom: 2px; }
        .region-count { font-size: 11px; color: rgba(255,255,255,0.65); display: flex; align-items: center; gap: 4px; }
        .region-arrow { display: inline-block; margin-left: auto; font-size: 18px; color: rgba(255,255,255,0.7); transition: transform 0.2s; position: absolute; right: 1.25rem; bottom: 1.25rem; }

        /* ── TOOLS ── */
        .tools-section { padding: 5rem 2rem; background: #0f172a; }
        .tools-inner { max-width: 1200px; margin: 0 auto; }
        .tools-section .section-eyebrow { color: #4ade80; }
        .tools-section .section-title { color: #fff; }
        .tools-section .section-sub { color: rgba(255,255,255,0.55); }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; }
        .tool-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 1.75rem 1.5rem;
          text-decoration: none; display: block;
          transition: all 0.3s;
        }
        .tool-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(74,222,128,0.3); transform: translateY(-3px); }
        .tool-icon { font-size: 2rem; margin-bottom: 1rem; display: block; }
        .tool-title { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 0.4rem; }
        .tool-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; margin-bottom: 1rem; }
        .tool-link { font-size: 12px; font-weight: 600; color: #4ade80; display: flex; align-items: center; gap: 4px; }

        /* ── WHY US ── */
        .why-section { padding: 5rem 2rem; }
        .why-inner { max-width: 1200px; margin: 0 auto; }
        .why-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; margin-top: 2.5rem; }
        .why-item { display: flex; gap: 1rem; }
        .why-icon { width: 40px; height: 40px; border-radius: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
        .why-title { font-size: 0.95rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
        .why-desc { font-size: 13px; color: #64748b; line-height: 1.6; }

        /* ── GUIDES ── */
        .guides-section { padding: 5rem 2rem; background: #f8fafc; }
        .guides-inner { max-width: 1200px; margin: 0 auto; }
        .guides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .guide-card { background: #fff; border-radius: 16px; padding: 1.5rem; text-align: center; border: 1px solid #f1f5f9; transition: all 0.3s; }
        .guide-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); transform: translateY(-3px); }
        .guide-avatar { width: 72px; height: 72px; border-radius: 50%; background: #0f172a; margin: 0 auto 1rem; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #fff; font-family: 'Fraunces', serif; }
        .guide-name { font-weight: 600; color: #0f172a; margin-bottom: 4px; font-size: 0.95rem; }
        .guide-specialty { font-size: 12px; color: #16a34a; margin-bottom: 8px; }
        .guide-stars { color: #f59e0b; font-size: 12px; }

        /* ── CTA ── */
        .cta-section { background: linear-gradient(135deg, #0f172a 0%, #1a3a20 100%); padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E"); }
        .cta-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .cta-title { font-family: 'Fraunces', serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; color: #fff; margin-bottom: 1rem; line-height: 1.2; }
        .cta-sub { color: rgba(255,255,255,0.6); font-size: 1rem; line-height: 1.7; margin-bottom: 2.5rem; }
        .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .cta-btn-primary { background: #16a34a; color: #fff; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: background 0.2s; }
        .cta-btn-primary:hover { background: #15803d; }
        .cta-btn-secondary { background: rgba(255,255,255,0.1); color: #fff; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; text-decoration: none; border: 1px solid rgba(255,255,255,0.2); transition: background 0.2s; }
        .cta-btn-secondary:hover { background: rgba(255,255,255,0.15); }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .hero-search { flex-direction: column; border-radius: 12px; }
          .search-field { width: 100%; }
          .search-divider { width: 100%; height: 1px; }
          .search-btn { width: 100%; justify-content: center; border-radius: 0 0 12px 12px; }
          .hero-stat { padding: 0 1rem; }
          .pkg-grid, .regions-grid, .tools-grid, .why-grid, .guides-grid { grid-template-columns: 1fr 1fr; }
          .why-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .pkg-grid, .regions-grid, .guides-grid { grid-template-columns: 1fr; }
          .tools-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="mtb-home">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-mountains" />
          <div className="hero-content">
            <div className="hero-badge">
        
            </div>
            <h1 className="hero-title">
              Your Perfect<br /><em>Nepal Adventure</em><br />Starts Here
            </h1>
            <p className="hero-subtitle">
              Discover verified hotels, curated trek packages, and certified local guides — from Everest Base Camp to hidden Mustang valleys.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <div className="search-field">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search trails, regions, packages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-divider" />
              <select className="search-select">
                <option>All Regions</option>
                <option>Khumbu</option>
                <option>Gandaki</option>
                <option>Bagmati</option>
              </select>
              <div className="search-divider" />
              <select className="search-select">
                <option>Any Duration</option>
                <option>1–3 days</option>
                <option>4–7 days</option>
                <option>8–14 days</option>
                <option>15+ days</option>
              </select>
              <button className="search-btn" type="submit">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Find Trips
              </button>
            </form>

            <div className="hero-stats">
              <div className="hero-stat"><span className="hero-stat-num">500+</span><span className="hero-stat-label">Verified Hotels</span></div>
              <div className="hero-stat"><span className="hero-stat-num">15k+</span><span className="hero-stat-label">Happy Travelers</span></div>
              <div className="hero-stat"><span className="hero-stat-num">14</span><span className="hero-stat-label">Trekking Regions</span></div>
              <div className="hero-stat"><span className="hero-stat-num">4.9</span><span className="hero-stat-label">Average Rating</span></div>
            </div>
          </div>
        </section>

        {/* ── FEATURED PACKAGES ── */}
        <section style={{ padding: '5rem 2rem', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="section-eyebrow">Featured Routes</div>
            <div className="tabs-row">
              <div>
                <h2 className="section-title">Most-loved trips in Nepal</h2>
                <p className="section-sub">Curated routes with verified permits, elevation profiles, and traveler reviews.</p>
              </div>
              <Link to="/browse-packages" className="view-all">View all packages →</Link>
            </div>

            <div className="tabs-list" style={{ marginBottom: '1.5rem' }}>
              {tabs.map(t => (
                <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>

            <div className="pkg-grid">
              {loadingPkgs
                ? Array(6).fill(0).map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <div className="skel" style={{ aspectRatio: '4/3' }} />
                    <div style={{ padding: '1.25rem' }}>
                      <div className="skel" style={{ height: 14, marginBottom: 8 }} />
                      <div className="skel" style={{ height: 18, marginBottom: 12 }} />
                      <div className="skel" style={{ height: 12, width: '60%' }} />
                    </div>
                  </div>
                ))
                : packages.map(pkg => {
                  const diff = pkg.difficulty || 'Moderate';
                  const dc = DIFF_COLORS[diff] || DIFF_COLORS.Moderate;
                  const imgUrl = getImageUrl(pkg.images?.[0]);
                  return (
                    <Link key={pkg._id} to={`/packages/${pkg._id}`} className="pkg-card">
                      <div className="pkg-img-wrap">
                        {imgUrl
                          ? <img src={imgUrl} alt={pkg.name} className="pkg-img" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          : null}
                        <div className="pkg-img-placeholder" style={{ display: imgUrl ? 'none' : 'flex' }}>🏔️</div>
                        <div className="pkg-badges">
                          {pkg.category && <span className="pkg-badge">{pkg.category}</span>}
                          <span className="pkg-diff" style={{ background: dc.bg, color: dc.color }}>{diff}</span>
                        </div>
                        <button className="pkg-fav" onClick={e => e.preventDefault()}>♡</button>
                      </div>
                      <div className="pkg-body">
                        <div className="pkg-tags">
                          {pkg.region && <span className="pkg-tag">{pkg.region}</span>}
                        </div>
                        <div className="pkg-name">{pkg.name}</div>
                        <div className="pkg-meta">
                          {pkg.duration && <span>🕐 {pkg.duration} days</span>}
                          {pkg.maxAltitude && <span>⛰ {pkg.maxAltitude}m</span>}
                        </div>
                        <div className="pkg-footer">
                          <div>
                            <div className="pkg-price-label">From</div>
                            <span className="pkg-price-val">NPR {(pkg.price || 0).toLocaleString()}</span>
                            <span className="pkg-price-per"> /person</span>
                          </div>
                          <span className="pkg-btn">View Details</span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              }
            </div>
          </div>
        </section>

        {/* ── REGIONS ── */}
        <section className="regions-bg">
          <div className="regions-inner">
            <div className="section-eyebrow">Explore by Region</div>
            <h2 className="section-title">14 distinct trekking regions</h2>
            <p className="section-sub">Each region offers unique landscapes, culture, and challenges — find your perfect match.</p>
            <div className="regions-grid">
              {STATIC_DESTINATIONS.map((dest, i) => (
                <Link key={i} to="/browse-destinations" className="region-card">
                  <div className="region-bg" style={{ background: `linear-gradient(135deg, ${dest.color} 0%, ${dest.color}cc 100%)` }} />
                  <div className="region-overlay" />
                  <div className="region-body">
                    <div className="region-tag">{dest.tag}</div>
                    <span className="region-name">{dest.name}</span>
                    <span className="region-count">📍 {dest.region}</span>
                  </div>
                  <span className="region-arrow">+</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── TOOLS ── */}
        <section className="tools-section">
          <div className="tools-inner">
            <div className="section-eyebrow">Travel Tools</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="section-title">Everything you need for your trip</h2>
                <p className="section-sub">Free tools to plan, budget, and navigate your perfect Nepal adventure.</p>
              </div>
            </div>
            <div className="tools-grid">
              {TOOLS.map((tool, i) => (
                <Link key={i} to={tool.link} className="tool-card">
                  <span className="tool-icon">{tool.icon}</span>
                  <div className="tool-title">{tool.title}</div>
                  <div className="tool-desc">{tool.desc}</div>
                  <div className="tool-link">Try it free →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY US ── */}
        <section className="why-section">
          <div className="why-inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="section-eyebrow">Why My Travel Buddy</div>
              <h2 className="section-title">Everything you need for a safe trek</h2>
              <p className="section-sub" style={{ margin: '0 auto' }}>We go beyond hotel listings — from permit preparation to emergency support, we've got you covered.</p>
            </div>
            <div className="why-grid">
              {WHY_ITEMS.map((item, i) => (
                <div key={i} className="why-item">
                  <div className="why-icon">{item.icon}</div>
                  <div>
                    <div className="why-title">{item.title}</div>
                    <div className="why-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GUIDES PREVIEW ── */}
        {guides.length > 0 && (
          <section className="guides-section">
            <div className="guides-inner">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div className="section-eyebrow">Local Experts</div>
                  <h2 className="section-title">Meet your guide</h2>
                </div>
                <Link to="/browse-guides" className="view-all">View all guides →</Link>
              </div>
              <div className="guides-grid">
                {guides.map(guide => {
                  const name = guide.name || guide.firstName || 'Guide';
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const imgUrl = getImageUrl(guide.profileImage || guide.photo);
                  return (
                    <Link key={guide._id} to={`/guides/${guide._id}`} className="guide-card" style={{ textDecoration: 'none' }}>
                      <div className="guide-avatar">
                        {imgUrl ? <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                      </div>
                      <div className="guide-name">{name}</div>
                      <div className="guide-specialty">{guide.specialization || guide.specialty || 'Nepal Trek Guide'}</div>
                      <div className="guide-stars">{'★'.repeat(5)}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-inner">
            <h2 className="cta-title">Ready to explore Nepal?</h2>
            <p className="cta-sub">Join 15,000+ travelers who've planned their perfect Himalayan adventure with My Travel Buddy.</p>
            <div className="cta-btns">
              {isAuthenticated
                ? <Link to="/dashboard" className="cta-btn-primary">Go to Dashboard</Link>
                : <Link to="/register" className="cta-btn-primary">Start Planning Free</Link>
              }
              <Link to="/browse-packages" className="cta-btn-secondary">Browse Packages</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
