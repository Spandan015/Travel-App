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

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .bd-root{font-family:'Plus Jakarta Sans',sans-serif;background:#fafff8;min-height:100vh;}
  .bd-hero{text-align:center;padding:80px 24px 60px;background:linear-gradient(180deg,#f0fdf4 0%,#fafff8 100%);}
  .bd-hero-label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#16a34a;margin-bottom:12px;}
  .bd-hero-title{font-size:clamp(36px,6vw,64px);font-weight:900;line-height:1.1;color:#0a2818;margin-bottom:16px;}
  .bd-hero-sub{font-size:16px;color:#6b7280;max-width:540px;margin:0 auto 0;}
  .bd-container{max-width:1200px;margin:0 auto;padding:0 24px 80px;}
  .bd-section-label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#16a34a;text-align:center;margin-bottom:8px;}
  .bd-section-title{font-size:clamp(24px,4vw,36px);font-weight:800;color:#0a2818;text-align:center;margin-bottom:40px;}
  .bd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:24px;}
  @media(max-width:580px){.bd-grid{grid-template-columns:1fr;}}
  .bd-card{background:#fff;border-radius:20px;border:1px solid #e5f0e8;overflow:hidden;box-shadow:0 4px 20px rgba(22,163,74,.06);transition:transform .2s,box-shadow .2s;}
  .bd-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(22,163,74,.12);}
  .bd-card-img{height:220px;background:linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%);position:relative;overflow:hidden;}
  .bd-card-img img{width:100%;height:100%;object-fit:cover;}
  .bd-card-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;}
  .bd-card-body{padding:24px;}
  .bd-card-title{font-size:22px;font-weight:800;color:#0a2818;margin-bottom:4px;}
  .bd-card-tagline{font-size:13px;color:#6b7280;margin-bottom:16px;}
  .bd-card-stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;}
  .bd-stat{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#374151;}
  .bd-highlights{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
  .bd-hl{font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;background:#f0fdf4;color:#15803d;border:1px solid #d1fae5;}
  .bd-card-footer{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f0fdf4;padding-top:16px;}
  .bd-trek-count{font-size:12px;color:#9ca3af;font-weight:500;}
  .bd-explore-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#16a34a;color:#fff;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;transition:background .15s;}
  .bd-explore-btn:hover{background:#15803d;}
  .bd-empty{text-align:center;padding:80px 24px;color:#9ca3af;}
  .bd-spinner{width:40px;height:40px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:bd-spin .9s linear infinite;margin:60px auto;}
  @keyframes bd-spin{to{transform:rotate(360deg);}}
  .bd-cta{background:linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%);border-radius:24px;padding:60px 40px;text-align:center;margin-top:60px;color:#fff;}
  .bd-cta h2{font-size:28px;font-weight:800;margin-bottom:8px;}
  .bd-cta p{font-size:15px;color:#a7f3d0;margin-bottom:28px;}
  .bd-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
  .bd-cta-btn-primary{padding:12px 28px;background:#16a34a;color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;}
  .bd-cta-btn-secondary{padding:12px 28px;background:rgba(255,255,255,.1);color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;border:1px solid rgba(255,255,255,.2);}
`;

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
    <div className="bd-root">
      <style>{S}</style>

      {/* Hero */}
      <div className="bd-hero">
        <div className="bd-hero-label">EXPLORE NEPAL</div>
        <h1 className="bd-hero-title">
          Explore Nepal's<br />
          <em style={{ color:'#16a34a', fontStyle:'italic' }}>Trekking Regions</em>
        </h1>
        <p className="bd-hero-sub">
          From the world's highest peaks to hidden valleys — discover Nepal's most breathtaking trekking destinations
        </p>
      </div>

      <div className="bd-container">
        <div className="bd-section-label">CHOOSE YOUR ADVENTURE</div>
        <h2 className="bd-section-title">Select a Region to Explore</h2>

        {loading ? (
          <div className="bd-spinner" />
        ) : error ? (
          <div className="bd-empty">
            <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
            <p>{error}</p>
          </div>
        ) : regions.length === 0 ? (
          <div className="bd-empty">
            <div style={{ fontSize:64, marginBottom:16 }}>🏔️</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#0a2818', marginBottom:8 }}>No regions available yet</h3>
            <p style={{ fontSize:14 }}>The admin is adding trekking regions. Check back soon!</p>
          </div>
        ) : (
          <div className="bd-grid">
            {regions.map(region => {
              const dc = DIFF_COLOR[region.difficulty] || DIFF_COLOR.Moderate;
              return (
                <div className="bd-card" key={region._id}>
                  <div className="bd-card-img">
                    {region.image
                      ? <img src={region.image} alt={region.name} />
                      : <div className="bd-card-img-placeholder">🏔️</div>
                    }
                  </div>
                  <div className="bd-card-body">
                    <div className="bd-card-title">{region.name}</div>
                    {region.tagline && <div className="bd-card-tagline">{region.tagline}</div>}

                    <div className="bd-card-stats">
                      {region.maxAltitude && (
                        <span className="bd-stat">⛰ <strong>{region.maxAltitude.toLocaleString()}m</strong> max altitude</span>
                      )}
                      {region.bestSeason && (
                        <span className="bd-stat">📅 {region.bestSeason}</span>
                      )}
                      {region.difficulty && (
                        <span style={{ ...dc, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                          {region.difficulty}
                        </span>
                      )}
                    </div>

                    {region.highlights?.length > 0 && (
                      <div className="bd-highlights">
                        {region.highlights.slice(0, 4).map((h, i) => (
                          <span className="bd-hl" key={i}>{h}</span>
                        ))}
                      </div>
                    )}

                    <div className="bd-card-footer">
                      <span className="bd-trek-count">View all treks in this region</span>
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

        {/* CTA */}
        <div className="bd-cta">
          <h2>Can't Decide?</h2>
          <p>Browse all our curated travel packages across every region of Nepal</p>
          <div className="bd-cta-btns">
            <Link className="bd-cta-btn-primary" to="/browse-packages">Browse All Packages</Link>
            <Link className="bd-cta-btn-secondary" to="/browse-guides">Find a Guide</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
