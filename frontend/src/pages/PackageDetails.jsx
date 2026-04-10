import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import MapView from '../components/MapView';
import BookingModal from '../components/BookingModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DIFF_COLOR = { Easy:'#027A48', Moderate:'#B54708', Challenging:'#B42318', Expert:'#6B21A8' };
const DIFF_BG    = { Easy:'#ECFDF3', Moderate:'#FFFAEB', Challenging:'#FEF3F2', Expert:'#F5F3FF' };

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
:root {
  --blue:#1B4F8A; --blue-dark:#0F3362; --blue-light:#EEF4FB;
  --text:#1E2D3D; --muted:#6b7c93; --border:#E4ECF3; --bg:#F5F9FF;
}
.pd-root { font-family:'Roboto',sans-serif; background:var(--bg); padding-top:68px; min-height:100vh; }
.pd-gallery-wrap { position:relative; max-height:440px; overflow:hidden; cursor:pointer; }
.pd-gallery { display:grid; grid-template-columns:2fr 1fr 1fr; grid-template-rows:220px 220px; gap:3px; height:440px; }
.pd-gp { overflow:hidden; position:relative; background:linear-gradient(135deg,#1B4F8A,#0F3362); display:flex; align-items:center; justify-content:center; font-size:3rem; }
.pd-gp img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; display:block; }
.pd-gp:hover img { transform:scale(1.04); }
.pd-gp-main { grid-column:1; grid-row:1/3; }
.pd-gp:nth-child(2){ grid-column:2; grid-row:1; }
.pd-gp:nth-child(3){ grid-column:3; grid-row:1; }
.pd-gp:nth-child(4){ grid-column:2; grid-row:2; }
.pd-gp:nth-child(5){ grid-column:3; grid-row:2; }
.pd-gallery-more-btn { position:absolute; bottom:12px; right:12px; background:rgba(255,255,255,0.92); color:#1E2D3D; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:700; backdrop-filter:blur(4px); border:1px solid rgba(0,0,0,0.1); cursor:pointer; }
@media(max-width:768px){
  .pd-gallery { grid-template-columns:1fr; grid-template-rows:280px; }
  .pd-gp-main { grid-column:1; grid-row:1; }
  .pd-gp:nth-child(n+2){ display:none; }
  .pd-gallery-wrap { max-height:280px; }
}
.pd-lightbox { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:1000; display:flex; align-items:center; justify-content:center; }
.pd-lightbox-img { max-width:90vw; max-height:85vh; object-fit:contain; border-radius:8px; }
.pd-lightbox-close { position:absolute; top:20px; right:24px; background:rgba(255,255,255,0.1); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.pd-lightbox-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; color:#fff; width:48px; height:48px; border-radius:50%; font-size:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.pd-lightbox-nav:hover { background:rgba(255,255,255,0.2); }
.pd-lightbox-prev { left:20px; }
.pd-lightbox-next { right:20px; }
.pd-lightbox-count { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); color:rgba(255,255,255,0.7); font-size:13px; }
.pd-nav-tabs { background:#fff; border-bottom:1px solid var(--border); position:sticky; top:68px; z-index:40; }
.pd-nav-inner { max-width:1180px; margin:0 auto; padding:0 24px; display:flex; }
.pd-nav-tab { padding:14px 18px; font-size:13px; font-weight:600; color:var(--muted); border-bottom:3px solid transparent; cursor:pointer; transition:all 0.15s; white-space:nowrap; background:none; border-top:none; border-left:none; border-right:none; font-family:'Roboto',sans-serif; }
.pd-nav-tab:hover { color:var(--text); }
.pd-nav-tab.active { color:var(--blue); border-bottom-color:var(--blue); }
.pd-header-wrap { max-width:1180px; margin:0 auto; padding:20px 24px 0; }
.pd-breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); margin-bottom:12px; flex-wrap:wrap; }
.pd-breadcrumb a { color:var(--blue); text-decoration:none; }
.pd-header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:8px; flex-wrap:wrap; }
.pd-name { font-size:clamp(1.4rem,3vw,2rem); font-weight:800; color:var(--text); margin:0; line-height:1.2; }
.pd-meta-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
.pd-meta-pill { display:flex; align-items:center; gap:5px; font-size:13px; color:var(--muted); }
.pd-diff-badge { font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; }
.pd-body { max-width:1180px; margin:0 auto; padding:24px; display:grid; grid-template-columns:1fr 340px; gap:24px; align-items:start; }
@media(max-width:960px){ .pd-body { grid-template-columns:1fr; } }
.pd-section { background:#fff; border-radius:12px; border:1px solid var(--border); padding:22px; margin-bottom:16px; }
.pd-section:last-child { margin-bottom:0; }
.pd-section-title { font-size:16px; font-weight:800; color:var(--text); margin:0 0 14px; padding-bottom:12px; border-bottom:1px solid var(--border); }
.pd-desc { font-size:14px; color:var(--muted); line-height:1.8; }
.pd-read-more { color:var(--blue); font-size:13px; font-weight:600; cursor:pointer; border:none; background:none; padding:0; margin-top:8px; display:block; font-family:'Roboto',sans-serif; }
.pd-highlights { display:flex; flex-direction:column; gap:10px; }
.pd-hl { display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--text); }
.pd-check { width:20px; height:20px; border-radius:50%; background:#ECFDF3; color:#027A48; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; margin-top:1px; }
.pd-includes-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.pd-include-item { display:flex; align-items:center; gap:9px; font-size:13px; color:var(--text); padding:10px 12px; background:var(--bg); border-radius:9px; border:1px solid var(--border); font-weight:500; }
.pd-exclude-item { display:flex; align-items:center; gap:9px; font-size:13px; color:var(--muted); padding:10px 12px; }
.pd-day { display:flex; gap:16px; margin-bottom:20px; }
.pd-day-num { width:40px; height:40px; border-radius:50%; background:var(--blue); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; margin-top:2px; }
.pd-day-content { flex:1; }
.pd-day-title { font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px; }
.pd-day-desc { font-size:13px; color:var(--muted); line-height:1.7; }
.pd-day-meta { display:flex; gap:12px; margin-top:6px; }
.pd-day-meta span { font-size:11px; color:var(--muted); background:var(--bg); padding:2px 9px; border-radius:20px; border:1px solid var(--border); }
.pd-dest-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
.pd-dest-chip { background:var(--blue-light); border-radius:10px; padding:10px 16px; font-size:13px; }
.pd-dest-chip-name { font-weight:700; color:var(--text); }
.pd-dest-chip-loc { font-size:11px; color:var(--muted); margin-top:2px; }
.pd-book-card { background:#fff; border-radius:12px; border:1px solid var(--border); padding:22px; position:sticky; top:120px; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
.pd-book-price { font-size:26px; font-weight:800; color:var(--text); letter-spacing:-0.5px; }
.pd-book-price span { font-size:14px; font-weight:400; color:var(--muted); }
.pd-reserve-btn { width:100%; padding:15px; background:var(--blue); color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:800; cursor:pointer; font-family:'Roboto',sans-serif; transition:all 0.2s; margin-bottom:10px; }
.pd-reserve-btn:hover { background:var(--blue-dark); transform:translateY(-1px); box-shadow:0 6px 20px rgba(27,79,138,0.3); }
.pd-book-foot { font-size:11.5px; color:var(--muted); text-align:center; margin-bottom:12px; }
.pd-trust { display:flex; justify-content:center; gap:14px; flex-wrap:wrap; }
.pd-trust-item { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--muted); }
.pd-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:16px; }
.pd-spinner { width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--blue); border-radius:50%; animation:pdSpin 0.8s linear infinite; }
@keyframes pdSpin { to{transform:rotate(360deg);} }
`;

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  // ✅ BookingModal state
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/packages/${id}`);
        setPkg(data.package || data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const name = pkg ? (pkg.name || pkg.title || 'Package') : '';
  const allImages = pkg
    ? [pkg.mainImage, ...(pkg.images || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)
    : [];
  const fallback = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80';
  const price = pkg ? (typeof pkg.price === 'object' ? pkg.price?.amount : pkg.price) : 0;

  const TABS = ['overview', 'itinerary', 'includes', 'destinations'];

  if (loading) return (
    <><style>{STYLES}</style>
      <div className="pd-root"><div className="pd-loading"><div className="pd-spinner" /><p style={{ color: 'var(--muted)', fontFamily: 'Roboto,sans-serif', fontSize: 14 }}>Loading package…</p></div></div>
    </>
  );

  if (!pkg) return (
    <><style>{STYLES}</style>
      <div className="pd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 16, fontFamily: 'Roboto,sans-serif' }}>
        <div style={{ fontSize: '3rem' }}>🗺️</div>
        <h2 style={{ color: 'var(--text)', fontWeight: 800 }}>Package Not Found</h2>
        <Link to="/browse-packages" style={{ background: 'var(--blue)', color: '#fff', padding: '11px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>← Back to Packages</Link>
      </div>
    </>
  );

  return (
    <><style>{STYLES}</style>
      <div className="pd-root">

        {/* ── GALLERY ── */}
        <div className="pd-gallery-wrap" onClick={() => setLightboxOpen(true)}>
          <div className="pd-gallery">
            <div className="pd-gp pd-gp-main">
              {allImages[0] ? <img src={allImages[0]} alt={name} onError={e => { e.target.src = fallback; }} /> : '🏔️'}
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="pd-gp">
                {allImages[i] ? <img src={allImages[i]} alt="" onError={e => { e.target.src = fallback; }} /> : '🏔️'}
                {i === 4 && allImages.length > 5 && <div className="pd-gallery-more-btn">+{allImages.length - 5} photos</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="pd-lightbox" onClick={() => setLightboxOpen(false)}>
            <button className="pd-lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
            <button className="pd-lightbox-nav pd-lightbox-prev" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + allImages.length) % allImages.length); }}>‹</button>
            <img className="pd-lightbox-img" src={allImages[lightboxIdx] || fallback} alt="" onClick={e => e.stopPropagation()} onError={e => { e.target.src = fallback; }} />
            <button className="pd-lightbox-nav pd-lightbox-next" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % allImages.length); }}>›</button>
            <div className="pd-lightbox-count">{lightboxIdx + 1} / {allImages.length}</div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="pd-header-wrap">
          <div className="pd-breadcrumb">
            <Link to="/">Home</Link> › <Link to="/browse-packages">Packages</Link> › <span>{name}</span>
          </div>
          <div className="pd-header-row"><h1 className="pd-name">{name}</h1></div>
          <div className="pd-meta-row">
            {pkg.difficulty && <span className="pd-diff-badge" style={{ background: DIFF_BG[pkg.difficulty] || '#F1F5F9', color: DIFF_COLOR[pkg.difficulty] || '#374151' }}>{pkg.difficulty}</span>}
            {pkg.category && <span className="pd-meta-pill">🏷 {pkg.category}</span>}
            <span className="pd-meta-pill">📅 {pkg.duration} days</span>
            {pkg.maxGroupSize && <span className="pd-meta-pill">👥 Max {pkg.maxGroupSize} people</span>}
            {pkg.startLocation && <span className="pd-meta-pill">📍 {pkg.startLocation}{pkg.endLocation ? ` → ${pkg.endLocation}` : ''}</span>}
            {pkg.rating > 0 && <span className="pd-meta-pill">⭐ {pkg.rating.toFixed(1)}</span>}
          </div>
        </div>

        {/* ── NAV TABS ── */}
        <div className="pd-nav-tabs">
          <div className="pd-nav-inner">
            {TABS.map(t => (
              <button key={t} className={`pd-nav-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="pd-body">
          {/* ── LEFT ── */}
          <div>
            {activeTab === 'overview' && (
              <>
                <div className="pd-section">
                  <h2 className="pd-section-title">About this package</h2>
                  <p className="pd-desc">
                    {showFullDesc || !pkg.description || pkg.description.length <= 300
                      ? (pkg.description || "An incredible journey through Nepal's most breathtaking landscapes.")
                      : pkg.description.slice(0, 300) + '…'}
                  </p>
                  {pkg.description?.length > 300 && (
                    <button className="pd-read-more" onClick={() => setShowFullDesc(v => !v)}>
                      {showFullDesc ? 'Show less ▲' : 'Read more ▼'}
                    </button>
                  )}
                </div>
                {pkg.highlights?.filter(h => h.trim()).length > 0 && (
                  <div className="pd-section">
                    <h2 className="pd-section-title">Package highlights</h2>
                    <div className="pd-highlights">
                      {pkg.highlights.filter(h => h.trim()).map((h, i) => (
                        <div key={i} className="pd-hl"><div className="pd-check">✓</div><span>{h}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {pkg.bestSeason?.length > 0 && (
                  <div className="pd-section">
                    <h2 className="pd-section-title">Best time to visit</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {pkg.bestSeason.map(s => (
                        <span key={s} style={{ background: 'var(--blue-light)', color: 'var(--blue)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>🌤 {s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'itinerary' && (
              <div className="pd-section">
                <h2 className="pd-section-title">Day-by-day itinerary</h2>
                {pkg.itinerary?.length > 0 ? pkg.itinerary.map((day, i) => (
                  <div key={i} className="pd-day">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div className="pd-day-num">D{day.day || i + 1}</div>
                      {i < pkg.itinerary.length - 1 && <div style={{ width: 2, background: 'var(--border)', flex: 1, minHeight: 20 }} />}
                    </div>
                    <div className="pd-day-content">
                      <div className="pd-day-title">{day.title || `Day ${day.day || i + 1}`}</div>
                      {day.description && <div className="pd-day-desc">{day.description}</div>}
                      {(day.elevation || day.distance) && (
                        <div className="pd-day-meta">
                          {day.elevation && <span>⛰ {day.elevation}m</span>}
                          {day.distance  && <span>🚶 {day.distance}km</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )) : <p style={{ fontSize: 13, color: 'var(--muted)' }}>No itinerary added yet.</p>}
              </div>
            )}

            {activeTab === 'includes' && (
              <>
                <div className="pd-section">
                  <h2 className="pd-section-title">What's included</h2>
                  <div className="pd-includes-grid">
                    {pkg.includes?.accommodation && <div className="pd-include-item">🏨 Accommodation</div>}
                    {pkg.includes?.guide         && <div className="pd-include-item">🧭 Professional Guide</div>}
                    {pkg.includes?.transport     && <div className="pd-include-item">🚌 Transport</div>}
                    {pkg.includes?.meals         && <div className="pd-include-item">🍽️ {pkg.includes.meals === 'All meals' ? 'All Meals' : pkg.includes.meals}</div>}
                    {pkg.includes?.activities?.map(a => <div key={a} className="pd-include-item">✅ {a}</div>)}
                  </div>
                  {!pkg.includes?.accommodation && !pkg.includes?.guide && !pkg.includes?.transport && !pkg.includes?.meals && (
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>Includes details not specified.</p>
                  )}
                </div>
                {pkg.excludes?.filter(e => e.trim()).length > 0 && (
                  <div className="pd-section">
                    <h2 className="pd-section-title">What's not included</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {pkg.excludes.filter(e => e.trim()).map((ex, i) => (
                        <div key={i} className="pd-exclude-item">❌ {ex}</div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'destinations' && (
              <div className="pd-section">
                <h2 className="pd-section-title">Destinations</h2>
                {pkg.destinations?.length > 0 ? (
                  <>
                    <div className="pd-dest-chips">
                      {pkg.destinations.map((d, i) => (
                        <div key={i} className="pd-dest-chip">
                          <div className="pd-dest-chip-name">📍 {d.name || d}</div>
                          {d.location && <div className="pd-dest-chip-loc">{d.location}</div>}
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const mapMarkers = pkg.destinations
                        .filter(d => d.coordinates?.latitude && d.coordinates?.longitude)
                        .map((d, i) => ({ lat: Number(d.coordinates.latitude), lng: Number(d.coordinates.longitude), title: d.name || 'Destination', description: d.location || '', primary: i === 0 }));
                      return mapMarkers.length > 0
                        ? <MapView height="280px" markers={mapMarkers} />
                        : <p style={{ fontSize: 13, color: 'var(--muted)' }}>Add coordinates to destinations to show the map.</p>;
                    })()}
                  </>
                ) : (
                  <div>
                    {(pkg.region || pkg.destination || pkg.location) ? (
                      <div className="pd-dest-chip" style={{ display: 'inline-block' }}>
                        <div className="pd-dest-chip-name">📍 {pkg.destination || pkg.location || pkg.region}</div>
                        {pkg.region && pkg.destination && <div className="pd-dest-chip-loc">{pkg.region}</div>}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>No destinations assigned to this package yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── BOOKING CARD ── */}
          <div>
            <div className="pd-book-card">
              <div className="pd-book-price">
                NPR {Number(price || 0).toLocaleString()} <span>/ person</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 18px' }}>
                📅 {pkg.duration} days · {pkg.maxGroupSize ? `Max ${pkg.maxGroupSize} people` : 'Flexible group'}
              </div>

              {/* ✅ Single button → BookingModal with eSewa */}
              <button
                className="pd-reserve-btn"
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  setShowBookingModal(true);
                }}
              >
                Book Now · Pay with eSewa
              </button>

              <p className="pd-book-foot">📅 {pkg.duration} day journey · Secure payment</p>
              <div className="pd-trust">
                <div className="pd-trust-item">🔒 Secure</div>
                <div className="pd-trust-item">✅ Instant confirmation</div>
                <div className="pd-trust-item">🇳🇵 Local guides</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ BookingModal — handles booking creation + eSewa redirect */}
      {showBookingModal && (
        <BookingModal
          type="package"
          item={pkg}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
}
