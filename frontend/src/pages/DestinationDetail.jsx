import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CATEGORY_COLORS = {
  City:            { bg: '#eff6ff', color: '#1d4ed8' },
  Mountain:        { bg: '#f0fdf4', color: '#15803d' },
  Lake:            { bg: '#ecfeff', color: '#0e7490' },
  Temple:          { bg: '#fdf4ff', color: '#7e22ce' },
  'National Park': { bg: '#f0fdf4', color: '#166534' },
  'Cultural Site': { bg: '#fff7ed', color: '#c2410c' },
  'Adventure Spot':{ bg: '#fef2f2', color: '#b91c1c' },
};

const DIFF_COLORS = {
  Easy:        { bg: '#dcfce7', color: '#166534' },
  Moderate:    { bg: '#fef3c7', color: '#92400e' },
  Challenging: { bg: '#fee2e2', color: '#991b1b' },
  Expert:      { bg: '#ede9fe', color: '#5b21b6' },
};

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dd-root { font-family: 'DM Sans', sans-serif; background: #fafaf9; min-height: 100vh; }

  /* HERO */
  .dd-hero {
    height: 500px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #071a0f, #1a4a2a);
  }
  .dd-hero img {
    width: 100%; height: 100%;
    object-fit: cover;
    position: absolute; inset: 0;
  }
  .dd-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 100%);
  }
  .dd-hero-content {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 48px;
    max-width: 860px;
  }
  .dd-hero-breadcrumb {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: rgba(255,255,255,0.6);
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .dd-hero-breadcrumb a { color: rgba(255,255,255,0.6); text-decoration: none; }
  .dd-hero-breadcrumb a:hover { color: #fff; }
  .dd-hero-cat {
    display: inline-block;
    padding: 5px 14px;
    border-radius: 100px;
    font-size: 11px; font-weight: 700;
    margin-bottom: 12px;
  }
  .dd-hero-name {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 12px;
  }
  .dd-hero-location {
    display: flex; align-items: center; gap: 6px;
    color: rgba(255,255,255,0.7);
    font-size: 14px; font-weight: 500;
  }

  /* BODY LAYOUT */
  .dd-body {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 24px 80px;
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 32px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .dd-body { grid-template-columns: 1fr; }
    .dd-hero-content { padding: 24px; }
  }

  /* STATS ROW */
  .dd-stats-row {
    display: flex; gap: 0;
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 32px;
  }
  .dd-stat {
    flex: 1; text-align: center;
    padding: 20px 12px;
    border-right: 1px solid #f1f5f9;
  }
  .dd-stat:last-child { border-right: none; }
  .dd-stat-val {
    display: block;
    font-family: 'Sora', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .dd-stat-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

  /* SECTION */
  .dd-section { margin-bottom: 36px; }
  .dd-section-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .dd-description {
    font-size: 15px;
    color: #374151;
    line-height: 1.8;
  }

  /* ATTRACTIONS */
  .dd-attraction {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 12px;
  }
  .dd-attraction-name {
    font-size: 14px; font-weight: 700;
    color: #0f172a; margin-bottom: 4px;
  }
  .dd-attraction-desc {
    font-size: 13px; color: #64748b; line-height: 1.6;
  }
  .dd-attraction-meta {
    display: flex; gap: 12px; margin-top: 8px;
    flex-wrap: wrap;
  }
  .dd-attraction-tag {
    font-size: 11px; font-weight: 600;
    padding: 3px 8px; border-radius: 6px;
    background: #f8fafc; color: #64748b;
  }

  /* ACTIVITIES */
  .dd-activities-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 600px) { .dd-activities-grid { grid-template-columns: 1fr; } }
  .dd-activity {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 16px;
  }
  .dd-activity-name {
    font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px;
  }
  .dd-activity-desc {
    font-size: 12px; color: #64748b; margin-bottom: 10px; line-height: 1.5;
  }
  .dd-activity-tags {
    display: flex; gap: 6px; flex-wrap: wrap;
  }
  .dd-activity-tag {
    font-size: 11px; font-weight: 600;
    padding: 3px 9px; border-radius: 100px;
  }

  /* TRANSPORT */
  .dd-transport-row {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .dd-transport-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    font-size: 13px; font-weight: 600; color: #374151;
  }

  /* ACCOMMODATION */
  .dd-accom-row {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .dd-accom-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    font-size: 13px; font-weight: 600; color: #166534;
  }

  /* SIDEBAR */
  .dd-sidebar-card {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .dd-sidebar-title {
    font-family: 'Sora', sans-serif;
    font-size: 1rem; font-weight: 700;
    color: #0f172a; margin-bottom: 16px;
  }
  .dd-sidebar-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid #f8fafc;
    gap: 12px;
  }
  .dd-sidebar-row:last-child { border-bottom: none; padding-bottom: 0; }
  .dd-sidebar-label { font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .dd-sidebar-value { font-size: 13px; color: #0f172a; font-weight: 600; text-align: right; max-width: 180px; }

  .dd-map-placeholder {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border-radius: 14px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    border: 1px solid #bbf7d0;
    font-size: 13px;
    color: #16a34a;
    font-weight: 600;
    margin-top: 12px;
  }

  .dd-cta-btn {
    display: block;
    width: 100%;
    padding: 14px;
    background: #16a34a;
    color: #fff;
    border-radius: 12px;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    margin-bottom: 10px;
    transition: background 0.2s;
  }
  .dd-cta-btn:hover { background: #15803d; }
  .dd-cta-btn.outline {
    background: transparent;
    color: #0f172a;
    border: 1.5px solid #e2e8f0;
  }
  .dd-cta-btn.outline:hover { border-color: #16a34a; color: #16a34a; background: transparent; }

  /* SPINNER / ERROR */
  .dd-spinner {
    width: 40px; height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #16a34a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 120px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .dd-error { text-align: center; padding: 80px 24px; }
  .dd-error h2 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
  .dd-error p { color: #64748b; margin-bottom: 20px; }

  /* GALLERY */
  .dd-gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 32px;
  }
  .dd-gallery img {
    width: 100%; height: 160px; object-fit: cover;
    border-radius: 12px;
  }
  .dd-gallery img:first-child {
    grid-column: 1 / -1;
    height: 240px;
  }

  .dd-back-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    transition: color 0.2s;
  }
  .dd-back-link:hover { color: #fff; }

  /* TAGS ROW */
  .dd-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .dd-tag {
    font-size: 12px; font-weight: 600;
    padding: 5px 12px; border-radius: 100px;
    background: #f1f5f9; color: #374151;
  }
`;

export default function DestinationDetail() {
  const { id } = useParams();
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API}/destinations/${id}`);
        setDest(data.destination || data);
      } catch {
        setError('Destination not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API.replace('/api', '')}/uploads/${img}`;
  };

  if (loading) return <div className="dd-root"><style>{S}</style><div className="dd-spinner" /></div>;

  if (error || !dest) return (
    <div className="dd-root">
      <style>{S}</style>
      <div className="dd-error">
        <h2>Destination not found</h2>
        <p>{error}</p>
        <Link to="/browse-destinations" style={{ display: 'inline-block', padding: '10px 24px', background: '#0f172a', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
          ← Back to Destinations
        </Link>
      </div>
    </div>
  );

  const catStyle = CATEGORY_COLORS[dest.category] || CATEGORY_COLORS.City;
  const heroImg = getImageUrl(dest.mainImage || dest.images?.[0]);
  const galleryImgs = (dest.galleryImages || dest.images || []).filter(Boolean).slice(0, 5).map(getImageUrl);
  const hasTransport = dest.transport && Object.values(dest.transport).some(Boolean);
  const hasAccom = dest.accommodation && Object.values(dest.accommodation).some(Boolean);

  return (
    <div className="dd-root">
      <style>{S}</style>

      {/* HERO */}
      <div className="dd-hero">
        {heroImg && <img src={heroImg} alt={dest.name} />}
        <div className="dd-hero-overlay" />
        <div className="dd-hero-content">
          <div className="dd-hero-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/browse-destinations">Destinations</Link>
            <span>›</span>
            <span style={{ color: '#fff' }}>{dest.name}</span>
          </div>
          <span className="dd-hero-cat" style={{ background: catStyle.bg, color: catStyle.color }}>
            {dest.category}
          </span>
          <div className="dd-hero-name">{dest.name}</div>
          <div className="dd-hero-location">
            📍 {dest.district}, {dest.province}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="dd-body">

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Stats */}
          <div className="dd-stats-row">
            {dest.altitude && (
              <div className="dd-stat">
                <span className="dd-stat-val">{dest.altitude.toLocaleString()}m</span>
                <span className="dd-stat-label">Altitude</span>
              </div>
            )}
            {dest.rating > 0 && (
              <div className="dd-stat">
                <span className="dd-stat-val">⭐ {dest.rating.toFixed(1)}</span>
                <span className="dd-stat-label">{dest.totalReviews} Reviews</span>
              </div>
            )}
            {dest.activities?.length > 0 && (
              <div className="dd-stat">
                <span className="dd-stat-val">{dest.activities.length}</span>
                <span className="dd-stat-label">Activities</span>
              </div>
            )}
            {dest.attractions?.length > 0 && (
              <div className="dd-stat">
                <span className="dd-stat-val">{dest.attractions.length}</span>
                <span className="dd-stat-label">Attractions</span>
              </div>
            )}
          </div>

          {/* Gallery */}
          {galleryImgs.length > 1 && (
            <div className="dd-gallery">
              {galleryImgs.map((img, i) => (
                <img key={i} src={img} alt={`${dest.name} ${i + 1}`} onError={e => e.target.parentNode.removeChild(e.target)} />
              ))}
            </div>
          )}

          {/* Description */}
          <div className="dd-section">
            <div className="dd-section-title">📖 About {dest.name}</div>
            <p className="dd-description">{dest.description}</p>
          </div>

          {/* Subcategories / tags */}
          {dest.subcategories?.length > 0 && (
            <div className="dd-section">
              <div className="dd-section-title">🏷️ Tags</div>
              <div className="dd-tags">
                {dest.subcategories.map((s, i) => <span key={i} className="dd-tag">{s}</span>)}
              </div>
            </div>
          )}

          {/* Attractions */}
          {dest.attractions?.length > 0 && (
            <div className="dd-section">
              <div className="dd-section-title">🎯 Top Attractions</div>
              {dest.attractions.map((a, i) => (
                <div key={i} className="dd-attraction">
                  <div className="dd-attraction-name">{a.name}</div>
                  {a.description && <p className="dd-attraction-desc">{a.description}</p>}
                  <div className="dd-attraction-meta">
                    {a.type && <span className="dd-attraction-tag">🏷️ {a.type}</span>}
                    {a.entryFee > 0 && <span className="dd-attraction-tag">💰 NPR {a.entryFee.toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activities */}
          {dest.activities?.length > 0 && (
            <div className="dd-section">
              <div className="dd-section-title">🧗 Activities</div>
              <div className="dd-activities-grid">
                {dest.activities.map((a, i) => {
                  const dc = DIFF_COLORS[a.difficulty] || DIFF_COLORS.Moderate;
                  return (
                    <div key={i} className="dd-activity">
                      <div className="dd-activity-name">{a.name}</div>
                      {a.description && <p className="dd-activity-desc">{a.description}</p>}
                      <div className="dd-activity-tags">
                        {a.difficulty && (
                          <span className="dd-activity-tag" style={{ background: dc.bg, color: dc.color }}>
                            {a.difficulty}
                          </span>
                        )}
                        {a.duration && <span className="dd-activity-tag" style={{ background: '#f8fafc', color: '#64748b' }}>⏱ {a.duration}</span>}
                        {a.price > 0 && <span className="dd-activity-tag" style={{ background: '#f0fdf4', color: '#166534' }}>USD {a.price}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transport */}
          {hasTransport && (
            <div className="dd-section">
              <div className="dd-section-title">🚌 How to Get There</div>
              <div className="dd-transport-row">
                {dest.transport?.bus && <span className="dd-transport-badge">🚌 Bus</span>}
                {dest.transport?.flight && <span className="dd-transport-badge">✈️ Flight</span>}
                {dest.transport?.jeep && <span className="dd-transport-badge">🚙 Jeep</span>}
                {dest.transport?.trekking && <span className="dd-transport-badge">🥾 Trekking</span>}
              </div>
              {dest.travelTime?.byRoad && (
                <p style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>🛣️ By road: {dest.travelTime.byRoad}</p>
              )}
              {dest.travelTime?.byAir && (
                <p style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>✈️ By air: {dest.travelTime.byAir}</p>
              )}
            </div>
          )}

          {/* Accommodation */}
          {hasAccom && (
            <div className="dd-section">
              <div className="dd-section-title">🏨 Accommodation Options</div>
              <div className="dd-accom-row">
                {dest.accommodation?.budget && <span className="dd-accom-badge">💚 Budget</span>}
                {dest.accommodation?.midRange && <span className="dd-accom-badge">⭐ Mid-Range</span>}
                {dest.accommodation?.luxury && <span className="dd-accom-badge">👑 Luxury</span>}
              </div>
            </div>
          )}

        </div>

        {/* ── SIDEBAR ── */}
        <div>

          {/* Quick Info */}
          <div className="dd-sidebar-card">
            <div className="dd-sidebar-title">Quick Info</div>
            <div className="dd-sidebar-row">
              <span className="dd-sidebar-label">Province</span>
              <span className="dd-sidebar-value">{dest.province}</span>
            </div>
            <div className="dd-sidebar-row">
              <span className="dd-sidebar-label">District</span>
              <span className="dd-sidebar-value">{dest.district}</span>
            </div>
            {dest.altitude && (
              <div className="dd-sidebar-row">
                <span className="dd-sidebar-label">Altitude</span>
                <span className="dd-sidebar-value">{dest.altitude.toLocaleString()} m</span>
              </div>
            )}
            {dest.area && (
              <div className="dd-sidebar-row">
                <span className="dd-sidebar-label">Area</span>
                <span className="dd-sidebar-value">{dest.area.toLocaleString()} km²</span>
              </div>
            )}
            {dest.bestTimeToVisit && (
              <div className="dd-sidebar-row">
                <span className="dd-sidebar-label">Best Time</span>
                <span className="dd-sidebar-value">{dest.bestTimeToVisit}</span>
              </div>
            )}
            {dest.entryFee > 0 && (
              <div className="dd-sidebar-row">
                <span className="dd-sidebar-label">Entry Fee</span>
                <span className="dd-sidebar-value">NPR {dest.entryFee.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Map */}
          {dest.coordinates?.latitude && dest.coordinates?.longitude && (
            <div className="dd-sidebar-card">
              <div className="dd-sidebar-title">📍 Location</div>
              <div className="dd-map-placeholder">
                <span style={{ fontSize: 28 }}>🗺️</span>
                <span>{dest.coordinates.latitude.toFixed(4)}°N, {dest.coordinates.longitude.toFixed(4)}°E</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="dd-sidebar-card">
            <div className="dd-sidebar-title">Plan Your Visit</div>
            <Link to="/browse-packages" className="dd-cta-btn">🗺️ Browse Packages</Link>
            <Link to="/browse-guides" className="dd-cta-btn outline">👤 Find a Guide</Link>
            <Link to="/itinerary-planner" className="dd-cta-btn outline">📋 Plan Itinerary</Link>
          </div>

          {/* Back */}
          <Link
            to="/browse-destinations"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#64748b',
              textDecoration: 'none', padding: '12px 0'
            }}
          >
            ← Back to all destinations
          </Link>

        </div>
      </div>
    </div>
  );
}
