import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DIFF_COLOR = {
  Easy:        { bg: '#f0fdf4', color: '#16a34a' },
  Moderate:    { bg: '#fef9c3', color: '#a16207' },
  Challenging: { bg: '#fff7ed', color: '#ea580c' },
  Expert:      { bg: '#fef2f2', color: '#dc2626' },
};

export default function BrowseDestinations() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { data } = await axios.get(`${API}/regions`);
        setRegions(data.regions || data || []);
      } catch (err) {
        setError('Failed to load regions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');

        :root {
          --green-primary: #16a34a;
          --green-dark:    #14532d;
          --green-mid:     #15803d;
          --green-light:   #f0fdf4;
          --green-border:  #bbf7d0;
          --green-soft:    #dcfce7;
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
          --bg-page:   #eef2f7;
          --bg-card:   #ffffff;
          --border:    #e2e8f0;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.07);
          --shadow-md: 0 4px 20px rgba(0,0,0,0.09);
          --shadow-lg: 0 12px 48px rgba(0,0,0,0.14);
          --radius:    16px;
          --radius-sm: 10px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bd-root {
          font-family: 'Roboto', sans-serif;
          background: var(--bg-page);
          min-height: 100vh;
          padding-top: 68px;
        }

        /* ── HERO ── */
        .bd-hero {
          background: linear-gradient(135deg, #052e16 0%, #064e23 50%, #0a4a1e 100%);
          padding: 48px 28px 36px;
          position: relative;
          overflow: hidden;
        }
        .bd-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=30') center/cover;
          opacity: 0.08;
        }
        .bd-hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .bd-hero h1 {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .bd-hero h1 em { font-style: normal; color: #4ade80; }
        .bd-hero-sub {
          color: rgba(255,255,255,0.55);
          font-size: 0.9rem;
          font-weight: 400;
          margin-bottom: 0;
        }

        /* ── LAYOUT ── */
        .bd-layout {
          max-width: 1280px;
          margin: 28px auto;
          padding: 0 24px 48px;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 22px;
          align-items: start;
        }
        @media(max-width: 960px) {
          .bd-layout { grid-template-columns: 1fr; }
          .bd-sidebar  { display: none; }
        }

        /* ── SIDEBAR ── */
        .bd-sidebar {
          position: sticky;
          top: 84px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bd-filter-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }
        .bd-filter-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .bd-filter-head h3 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .bd-filter-section { margin-bottom: 20px; }
        .bd-filter-section:last-child { margin-bottom: 0; }
        .bd-filter-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: block;
          margin-bottom: 10px;
        }
        .bd-filter-select {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-family: ' Roboto', sans-serif;
          color: var(--text-primary);
          outline: none;
          background: #fff;
          transition: border-color 0.15s;
          cursor: pointer;
        }
        .bd-filter-select:focus { border-color: var(--green-primary); }

        /* Difficulty chips */
        .bd-diff-chips { display: flex; flex-direction: column; gap: 6px; }
        .bd-diff-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1.5px solid transparent;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          background: none;
          font-family: 'Roboto', sans-serif;
          width: 100%;
          text-align: left;
        }
        .bd-diff-chip:hover { background: var(--green-light); }
        .bd-diff-chip.active {
          background: var(--green-light);
          border-color: var(--green-border);
        }
        .bd-diff-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Info card */
        .bd-info-card {
          background: linear-gradient(135deg, #052e16 0%, #064e23 100%);
          border-radius: var(--radius);
          padding: 20px;
          color: #fff;
        }
        .bd-info-card h4 {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .bd-info-card p {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 14px;
        }
        .bd-info-btn {
          display: block;
          text-align: center;
          padding: 9px 16px;
          background: var(--green-primary);
          color: #fff;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
          font-family: ' Roboto', sans-serif;
        }
        .bd-info-btn:hover { background: var(--green-mid); }

        /* ── RESULTS ── */
        .bd-results { min-width: 0; }
        .bd-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .bd-results-count {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .bd-results-count span {
          font-weight: 500;
          color: var(--text-muted);
          font-size: 13px;
        }
        .bd-sort-select {
          padding: 9px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          font-family: 'Roboto', sans-serif;
          color: var(--text-secondary);
          outline: none;
          background: #fff;
          cursor: pointer;
          font-weight: 500;
        }

        /* ── GRID ── */
        .bd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 18px;
        }
        @media(max-width: 580px) { .bd-grid { grid-template-columns: 1fr; } }

        /* ── CARD ── */
        .bd-card {
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
        .bd-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--green-border);
        }

        .bd-card-img {
          position: relative;
          height: 210px;
          overflow: hidden;
          background: linear-gradient(135deg, #0a2818 0%, #1a4a2a 100%);
        }
        .bd-card-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .bd-card:hover .bd-card-img img { transform: scale(1.06); }

        .bd-card-img-placeholder {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
        }
        .bd-card-diff-pill {
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
        }
        .bd-card-season-pill {
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
        .bd-card-alt-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .bd-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .bd-card-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .bd-card-tagline {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .bd-card-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 12px;
        }
        .bd-card-hl {
          font-size: 10.5px;
          background: var(--green-light);
          color: var(--green-mid);
          padding: 3px 9px;
          border-radius: 20px;
          font-weight: 600;
          border: 1px solid var(--green-border);
        }
        .bd-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .bd-card-footer-note {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .bd-explore-btn {
          background: var(--green-primary);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 9px 16px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Roboto', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .bd-explore-btn:hover { background: var(--green-mid); transform: translateY(-1px); }

        /* Loading / empty */
        .bd-loading { display: flex; flex-direction: column; align-items: center; padding: 80px 24px; gap: 14px; }
        .bd-spinner { width: 40px; height: 40px; border: 3px solid var(--green-soft); border-top: 3px solid var(--green-primary); border-radius: 50%; animation: bd-spin 0.9s linear infinite; }
        @keyframes bd-spin { to { transform: rotate(360deg); } }
        .bd-empty { text-align: center; padding: 80px 24px; }
        .bd-empty-icon { font-size: 3rem; margin-bottom: 14px; }
        .bd-empty h3 { font-size: 1.2rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 700; }
        .bd-empty p  { color: var(--text-muted); font-size: 14px; }

        /* ── CTA ── */
        .bd-cta {
          background: linear-gradient(135deg, #052e16 0%, #064e23 100%);
          text-align: center;
          padding: 64px 24px;
          position: relative;
          overflow: hidden;
        }
        .bd-cta h2 { font-size: 1.9rem; font-weight: 800; color: #fff; margin-bottom: 10px; letter-spacing: -0.03em; }
        .bd-cta p  { color: rgba(255,255,255,0.55); font-size: 0.95rem; margin-bottom: 28px; }
        .bd-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .bd-cta-primary {
          background: var(--green-primary);
          color: #fff;
          text-decoration: none;
          padding: 13px 30px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          transition: background 0.2s;
          font-family: 'Roboto', sans-serif;
        }
        .bd-cta-primary:hover { background: var(--green-mid); }
        .bd-cta-secondary {
          background: rgba(255,255,255,0.08);
          color: #fff;
          text-decoration: none;
          padding: 13px 30px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.15);
          transition: background 0.2s;
          font-family: 'Roboto', sans-serif;
        }
        .bd-cta-secondary:hover { background: rgba(255,255,255,0.15); }

        @media(max-width: 600px) {
          .bd-hero { padding: 36px 20px 28px; }
        }
      `}</style>

      <div className="bd-root">

        {/* ── HERO ── */}
        <section className="bd-hero">
          <div className="bd-hero-inner">
            <h1>Explore Nepal's <em>Trekking Regions</em></h1>
            <p className="bd-hero-sub">
              From the world's highest peaks to hidden valleys — discover Nepal's most breathtaking trekking destinations
            </p>
          </div>
        </section>

        {/* ── MAIN LAYOUT ── */}
        <div className="bd-layout">

          {/* ── SIDEBAR ── */}
          <aside className="bd-sidebar">

            {/* Difficulty filter
            <div className="bd-filter-card">
              <div className="bd-filter-head">
                <h3>Filters</h3>
              </div>

              <div className="bd-filter-section">
                <span className="bd-filter-label">Best Season</span>
                <select className="bd-filter-select" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  <option>All Seasons</option>
                  <option>Spring (Mar–May)</option>
                  <option>Autumn (Sep–Nov)</option>
                  <option>Winter (Dec–Feb)</option>
                  <option>Summer (Jun–Aug)</option>
                </select>
              </div>

              <div className="bd-filter-section">
                <span className="bd-filter-label">Difficulty</span>
                <div className="bd-diff-chips">
                  {Object.entries(DIFF_COLOR).map(([level, dc]) => (
                    <button key={level} className="bd-diff-chip">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="bd-diff-dot" style={{ background: dc.color }} />
                        {level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bd-filter-section">
                <span className="bd-filter-label">Max Altitude</span>
                <select className="bd-filter-select" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  <option>Any Altitude</option>
                  <option>Under 3,000m</option>
                  <option>3,000m – 5,000m</option>
                  <option>5,000m+</option>
                </select>
              </div>
            </div> */}

            {/* Info / CTA card */}
            <div className="bd-info-card">
              <h4>Not sure where to start?</h4>
              <p>Our local guides can help you pick the perfect region based on your fitness level and experience.</p>
              <Link to="/browse-guides" className="bd-info-btn">Find a Guide</Link>
            </div>

          </aside>

          {/* ── RESULTS ── */}
          <div className="bd-results">

            <div className="bd-results-header">
              <div className="bd-results-count">
                {loading ? '…' : regions.length}{' '}
                {regions.length === 1 ? 'region' : 'regions'}
                <span> available</span>
              </div>
              
            </div>

            {loading ? (
              <div className="bd-loading">
                <div className="bd-spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading regions…</p>
              </div>
            ) : error ? (
              <div className="bd-empty">
                <div className="bd-empty-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
              </div>
            ) : regions.length === 0 ? (
              <div className="bd-empty">
                <div className="bd-empty-icon">🏔️</div>
                <h3>No regions available yet</h3>
                <p>The admin is adding trekking regions. Check back soon!</p>
              </div>
            ) : (
              <div className="bd-grid">
                {regions.map(region => {
                  const dc = DIFF_COLOR[region.difficulty] || DIFF_COLOR.Moderate;
                  return (
                    <div className="bd-card" key={region._id}>

                      <div className="bd-card-img">
                        {region.image
                          ? <img src={region.image} alt={region.name} onError={e => { e.target.style.display = 'none'; }} />
                          : <div className="bd-card-img-placeholder">🏔️</div>
                        }
                        {region.difficulty && (
                          <div
                            className="bd-card-diff-pill"
                            style={{ background: dc.bg, color: dc.color }}
                          >
                            {region.difficulty}
                          </div>
                        )}
                        {region.maxAltitude && (
                          <div className="bd-card-alt-badge">
                            ⛰ {Number(region.maxAltitude).toLocaleString()}m
                          </div>
                        )}
                        {region.bestSeason && (
                          <div className="bd-card-season-pill">
                            📅 {region.bestSeason}
                          </div>
                        )}
                      </div>

                      <div className="bd-card-body">
                        <div className="bd-card-name">{region.name}</div>
                        {region.tagline && (
                          <div className="bd-card-tagline">{region.tagline}</div>
                        )}
                        {region.highlights?.length > 0 && (
                          <div className="bd-card-highlights">
                            {region.highlights.slice(0, 4).map((h, i) => (
                              <span className="bd-card-hl" key={i}>{h}</span>
                            ))}
                          </div>
                        )}
                        <div className="bd-card-footer">
                          <span className="bd-card-footer-note">View all treks in this region</span>
                          <Link className="bd-explore-btn" to={`/destinations/${region.slug}`}>
                            Explore →
                          </Link>
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
        <section className="bd-cta">
          <h2>Can't Decide?</h2>
          <p>Browse all our curated travel packages across every region of Nepal</p>
          <div className="bd-cta-btns">
            <Link className="bd-cta-primary" to="/browse-packages">Browse All Packages</Link>
            <Link className="bd-cta-secondary" to="/browse-guides">Find a Guide</Link>
          </div>
        </section>

      </div>
    </>
  );
}