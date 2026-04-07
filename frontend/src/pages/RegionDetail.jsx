import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DIFF_COLORS = {
  Easy: { bg: '#dcfce7', color: '#15803d' },
  Moderate: { bg: '#fef9c3', color: '#854d0e' },
  Challenging: { bg: '#fee2e2', color: '#991b1b' },
  Expert: { bg: '#ede9fe', color: '#5b21b6' },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .rd-root { font-family: 'Roboto', sans-serif; background: #f8faf8; min-height: 100vh; padding-top: 68px; }

  /* HERO */
  .rd-hero {
    position: relative; min-height: 70vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    overflow: hidden; padding: 80px 24px 100px; text-align: center;
  }
  .rd-hero-bg { position: absolute; inset: 0; transition: transform 0.6s; }
  .rd-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.85) 100%); }
  .rd-hero-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, #f8faf8, transparent); }
  .rd-hero-content { position: relative; z-index: 2; max-width: 760px; animation: rdFade 0.8s ease both; }
  @keyframes rdFade { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  .rd-breadcrumb { display:flex; align-items:center; gap:8px; justify-content:center; margin-bottom:20px; font-size:13px; color:rgba(255,255,255,0.6); }
  .rd-breadcrumb a { color:rgba(255,255,255,0.7); text-decoration:none; }
  .rd-breadcrumb a:hover { color:#4ade80; }
  .rd-hero h1 { font-family:'Roboto',serif; font-size:clamp(2.4rem,6vw,4rem); font-weight:700; color:#fff; margin:0 0 16px; line-height:1.1; letter-spacing:-0.02em; }
  .rd-hero h1 em { font-style:italic; color:#4ade80; }
  .rd-hero-tagline { font-size:1.05rem; color:rgba(255,255,255,0.75); font-weight:300; line-height:1.7; margin-bottom:32px; }
  .rd-hero-pills { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
  .rd-pill { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.2); border-radius:100px; padding:7px 16px; font-size:13px; color:#fff; font-weight:500; }

  /* BODY */
  .rd-body { max-width:1200px; margin:0 auto; padding:48px 24px; display:grid; grid-template-columns:1fr 340px; gap:32px; }
  @media(max-width:1000px) { .rd-body { grid-template-columns:1fr; } }

  /* DESCRIPTION */
  .rd-desc-card { background:#fff; border-radius:20px; border:1px solid #e5f0e8; padding:36px; box-shadow:0 2px 12px rgba(22,163,74,0.05); margin-bottom:28px; }
  .rd-desc-card h2 { font-family:'Roboto',serif; font-size:1.5rem; font-weight:700; color:#0f172a; margin-bottom:16px; }
  .rd-desc-card p { color:#64748b; line-height:1.85; font-size:0.95rem; font-weight:300; white-space:pre-line; }

  /* HIGHLIGHTS */
  .rd-highlights-card { background:#fff; border-radius:20px; border:1px solid #e5f0e8; padding:28px; box-shadow:0 2px 12px rgba(22,163,74,0.05); margin-bottom:28px; }
  .rd-highlights-card h3 { font-family:'Roboto',serif; font-size:1.1rem; font-weight:700; color:#0f172a; margin-bottom:16px; }
  .rd-hl-list { list-style:none; display:flex; flex-direction:column; gap:10px; }
  .rd-hl-item { display:flex; align-items:flex-start; gap:10px; font-size:14px; color:#374151; }
  .rd-hl-dot { width:20px; height:20px; border-radius:50%; background:#f0fdf4; border:1.5px solid #16a34a; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; font-size:10px; color:#16a34a; }

  /* PACKAGES */
  .rd-packages-title { font-family:'Roboto',serif; font-size:1.5rem; font-weight:700; color:#0f172a; margin-bottom:8px; }
  .rd-packages-sub { font-size:14px; color:#64748b; margin-bottom:24px; }
  .rd-pkg-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:18px; }

  .rd-pkg-card { background:#fff; border-radius:16px; border:1px solid #e5f0e8; overflow:hidden; text-decoration:none; display:block; transition:all 0.3s; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .rd-pkg-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(22,163,74,0.12); }
  .rd-pkg-img { position:relative; aspect-ratio:16/9; overflow:hidden; background:#f1f5f9; }
  .rd-pkg-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s; }
  .rd-pkg-card:hover .rd-pkg-img img { transform:scale(1.05); }
  .rd-pkg-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:2rem; }
  .rd-pkg-diff { position:absolute; top:10px; left:10px; font-size:10px; font-weight:700; padding:3px 10px; border-radius:100px; }
  .rd-pkg-body { padding:14px 16px 16px; }
  .rd-pkg-name { font-family:'Roboto',serif; font-size:1rem; font-weight:700; color:#0f172a; margin-bottom:6px; line-height:1.3; }
  .rd-pkg-meta { display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
  .rd-pkg-meta span { font-size:11px; color:#94a3b8; display:flex; align-items:center; gap:3px; }
  .rd-pkg-footer { display:flex; align-items:center; justify-content:space-between; }
  .rd-pkg-price { font-family:'Roboto',serif; font-size:1.1rem; font-weight:700; color:#0f172a; }
  .rd-pkg-price small { font-size:11px; color:#94a3b8; font-family:'Roboto',sans-serif; font-weight:400; }
  .rd-pkg-btn { background:#0f172a; color:#fff; border-radius:8px; padding:7px 14px; font-size:11px; font-weight:600; transition:background 0.2s; }
  .rd-pkg-card:hover .rd-pkg-btn { background:#16a34a; }

  .rd-no-pkgs { text-align:center; padding:48px 24px; background:#fff; border-radius:16px; border:1px solid #e5f0e8; }
  .rd-no-pkgs h3 { font-family:'Roboto',serif; font-size:1.2rem; color:#0f172a; margin-bottom:8px; }
  .rd-no-pkgs p { font-size:14px; color:#64748b; margin-bottom:20px; }
  .rd-no-pkgs a { display:inline-block; background:#16a34a; color:#fff; padding:10px 22px; border-radius:10px; font-size:13px; font-weight:600; text-decoration:none; }

  /* SIDEBAR */
  .rd-sidebar { display:flex; flex-direction:column; gap:20px; }
  .rd-side-card { background:#fff; border-radius:16px; border:1px solid #e5f0e8; padding:22px; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .rd-side-title { font-family:'Roboto',serif; font-size:1rem; font-weight:700; color:#0f172a; margin-bottom:16px; }
  .rd-info-row { display:flex; align-items:flex-start; gap:10px; padding:9px 0; border-bottom:1px solid #f0fdf4; }
  .rd-info-row:last-child { border-bottom:none; }
  .rd-info-icon { width:32px; height:32px; border-radius:8px; background:#f0fdf4; display:flex; align-items:center; justify-content:center; font-size:0.9rem; flex-shrink:0; }
  .rd-info-label { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; font-weight:600; }
  .rd-info-value { font-size:13px; color:#0f172a; font-weight:600; margin-top:2px; }

  .rd-cta-card { background:linear-gradient(135deg, #0a2818 0%, #1a4a2a 100%); border-radius:16px; padding:24px; text-align:center; }
  .rd-cta-card h3 { font-family:'Roboto',serif; font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:8px; }
  .rd-cta-card p { font-size:13px; color:rgba(255,255,255,0.65); line-height:1.6; margin-bottom:18px; }
  .rd-cta-btn { display:block; background:#16a34a; color:#fff; padding:11px; border-radius:10px; font-size:13px; font-weight:700; text-decoration:none; margin-bottom:8px; transition:background 0.2s; }
  .rd-cta-btn:hover { background:#15803d; }
  .rd-cta-btn2 { display:block; background:rgba(255,255,255,0.1); color:#fff; padding:11px; border-radius:10px; font-size:13px; font-weight:600; text-decoration:none; border:1px solid rgba(255,255,255,0.2); transition:background 0.2s; }
  .rd-cta-btn2:hover { background:rgba(255,255,255,0.18); }

  /* SPINNER */
  .rd-spinner { width:48px; height:48px; border:4px solid #d1fae5; border-top:4px solid #16a34a; border-radius:50%; animation:rd-spin 0.9s linear infinite; margin:80px auto; }
  @keyframes rd-spin { to { transform:rotate(360deg); } }

  /* SKEL */
  .rd-skel { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200%; animation:rdShimmer 1.4s infinite; border-radius:8px; }
  @keyframes rdShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

export default function RegionDetail() {
  const { slug } = useParams();
  const [region, setRegion] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loadingRegion, setLoadingRegion] = useState(true);
  const [loadingPkgs, setLoadingPkgs] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadRegion = async () => {
      try {
        const { data } = await axios.get(`${API}/regions/${slug}`);
        setRegion(data.region);
      } catch {
        setRegion(null);
      } finally {
        setLoadingRegion(false);
      }
    };
    loadRegion();
  }, [slug]);

  useEffect(() => {
    if (!region) return;
    const loadTreks = async () => {
      setLoadingPkgs(true);
      try {
        const { data } = await axios.get(`${API}/treks/region/${region._id}`);
        setPackages(data.treks || []);
      } catch {
        setPackages([]);
      } finally {
        setLoadingPkgs(false);
      }
    };
    loadTreks();
  }, [region]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API.replace('/api', '')}/uploads/${img}`;
  };

  if (loadingRegion) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="rd-root"><div className="rd-spinner" /></div>
      </>
    );
  }

  if (!region) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="rd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '3rem' }}>🏔</div>
          <h2 style={{ fontFamily: "'Roboto', serif", fontSize: '1.5rem', color: '#0f172a' }}>Region not found</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>This region doesn't exist or hasn't been created yet.</p>
          <Link to="/browse-destinations" style={{ background: '#16a34a', color: '#fff', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>← Back to Regions</Link>
        </div>
      </>
    );
  }

  const diff = DIFF_COLORS[region.difficulty] || DIFF_COLORS.Moderate;

  return (
    <>
      <style>{STYLES}</style>
      <div className="rd-root">

        {/* HERO */}
        <section className="rd-hero">
          <div className="rd-hero-bg" style={{
            background: region.image ? `url(${region.image}) center/cover` : (region.coverGradient || 'linear-gradient(135deg,#0a2818,#1a4a2a)')
          }} />
          <div className="rd-hero-overlay" />
          <div className="rd-hero-bottom" />
          <div className="rd-hero-content">
            <div className="rd-breadcrumb">
              <Link to="/">Home</Link> / <Link to="/browse-destinations">Regions</Link> / {region.name}
            </div>
            <h1>{region.name.includes('Region') ? <><em>{region.name.replace(' Region', '')}</em> Region</> : <em>{region.name}</em>}</h1>
            {region.tagline && <p className="rd-hero-tagline">{region.tagline}</p>}
            <div className="rd-hero-pills">
              {region.maxAltitude && <div className="rd-pill">⛰ {region.maxAltitude.toLocaleString()}m Max Altitude</div>}
              {region.bestSeason && <div className="rd-pill">📅 {region.bestSeason}</div>}
              {region.difficulty && <div className="rd-pill" style={{ background: diff.bg + '33', borderColor: diff.color + '55', color: diff.color }}>{region.difficulty}</div>}
              {region.trekDuration && <div className="rd-pill">🕐 {region.trekDuration}</div>}
            </div>
          </div>
        </section>

        {/* MAIN BODY */}
        <div className="rd-body">
          {/* LEFT */}
          <div>
            {/* Description */}
            {region.description && (
              <div className="rd-desc-card">
                <h2>About {region.name}</h2>
                <p>{region.description}</p>
              </div>
            )}

            {/* Highlights */}
            {region.highlights?.filter(Boolean).length > 0 && (
              <div className="rd-highlights-card">
                <h3>Region Highlights</h3>
                <ul className="rd-hl-list">
                  {region.highlights.filter(Boolean).map((h, i) => (
                    <li key={i} className="rd-hl-item">
                      <div className="rd-hl-dot">✓</div>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Packages */}
            <div className="rd-packages-title">Related Trips</div>
            <p className="rd-packages-sub">Explore curated trekking packages in the {region.name}</p>

            {loadingPkgs ? (
              <div className="rd-pkg-grid">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e5f0e8', background: '#fff' }}>
                    <div className="rd-skel" style={{ height: 140 }} />
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div className="rd-skel" style={{ height: 14, marginBottom: 8 }} />
                      <div className="rd-skel" style={{ height: 11, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : packages.length === 0 ? (
              <div className="rd-no-pkgs">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏔</div>
                <h3>No treks listed yet</h3>
                <p>Check back soon or browse all available packages</p>
                <Link to="/browse-destinations">Browse All Treks</Link>
              </div>
            ) : (
              <div className="rd-pkg-grid">
                {packages.map(pkg => {
                  const imgUrl = getImageUrl(pkg.coverImage || pkg.images?.[0]);
                  const dc = DIFF_COLORS[pkg.difficulty] || DIFF_COLORS.Moderate;
                  return (
                    <Link key={pkg._id} to={`/treks/${pkg.slug || pkg._id}`} className="rd-pkg-card">
                      <div className="rd-pkg-img">
                        {imgUrl ? <img src={imgUrl} alt={pkg.name} onError={e => e.target.style.display = 'none'} /> : null}
                        <div className="rd-pkg-placeholder" style={{ display: imgUrl ? 'none' : 'flex' }}>🏔</div>
                        {pkg.difficulty && <span className="rd-pkg-diff" style={{ background: dc.bg, color: dc.color }}>{pkg.difficulty}</span>}
                      </div>
                      <div className="rd-pkg-body">
                        <div className="rd-pkg-name">{pkg.name}</div>
                        <div className="rd-pkg-meta">
                          {pkg.duration && <span>🕐 {pkg.duration} days</span>}
                          {pkg.maxAltitude && <span>⛰ {pkg.maxAltitude}m</span>}
                          {pkg.region && <span>📍 {pkg.region.name}</span>}
                        </div>
                        <div className="rd-pkg-footer">
                          <div className="rd-pkg-price">
                            NPR {(pkg.price || 0).toLocaleString()}
                            <small> /person</small>
                          </div>
                          <div className="rd-pkg-btn">View Details</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="rd-sidebar">
            {/* Quick Info */}
            <div className="rd-side-card">
              <div className="rd-side-title">Region Info</div>
              {[
                region.maxAltitude && { icon: '⛰', label: 'Max Altitude', value: `${region.maxAltitude.toLocaleString()}m` },
                region.bestSeason && { icon: '📅', label: 'Best Season', value: region.bestSeason },
                region.difficulty && { icon: '💪', label: 'Difficulty', value: region.difficulty },
                region.trekDuration && { icon: '🕐', label: 'Duration', value: region.trekDuration },
                region.startingPoint && { icon: '✈', label: 'Starting Point', value: region.startingPoint },
              ].filter(Boolean).map((info, i) => (
                <div key={i} className="rd-info-row">
                  <div className="rd-info-icon">{info.icon}</div>
                  <div>
                    <div className="rd-info-label">{info.label}</div>
                    <div className="rd-info-value">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="rd-cta-card">
              <h3>Ready to Trek?</h3>
              <p>Find your perfect guide and package for the {region.name}</p>
              <Link to="/browse-destinations" className="rd-cta-btn">Browse All Treks</Link>
              <Link to="/browse-guides" className="rd-cta-btn2">Find a Local Guide</Link>
            </div>

            {/* Back */}
            <Link to="/browse-destinations" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              ← Back to all regions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
