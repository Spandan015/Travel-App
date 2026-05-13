import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import guideService from '../services/guideService';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.gp-root * { box-sizing: border-box; }
.gp-root { font-family: 'Inter', sans-serif; }

/* ── Banner ── */
.gp-banner {
  background: linear-gradient(135deg, #052e16 0%, #14532d 100%);
  border-radius: 14px; padding: 16px; cursor: pointer;
  position: relative; overflow: hidden; transition: box-shadow 0.2s;
}
.gp-banner.open { border-radius: 14px 14px 0 0; }
.gp-banner::after {
  content: ''; position: absolute; width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(74,222,128,0.12), transparent 70%);
  top: -30px; right: -30px; pointer-events: none;
}
.gp-banner-row1 { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.gp-chip { font-size:9px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#4ade80; background:rgba(74,222,128,0.12); border:1px solid rgba(74,222,128,0.25); padding:3px 8px; border-radius:20px; }
.gp-sw { width:40px; height:22px; background:rgba(255,255,255,0.15); border-radius:11px; position:relative; transition:background 0.2s; flex-shrink:0; }
.gp-sw.on { background:#16a34a; }
.gp-sw::after { content:''; position:absolute; width:16px; height:16px; background:#fff; border-radius:50%; top:3px; left:3px; transition:transform 0.2s; box-shadow:0 1px 4px rgba(0,0,0,0.25); }
.gp-sw.on::after { transform:translateX(18px); }
.gp-banner-title { font-size:15px; font-weight:700; color:#fff; margin-bottom:3px; }
.gp-banner-sub { font-size:11px; color:rgba(255,255,255,0.55); line-height:1.4; }
.gp-perks { display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }
.gp-perk { font-size:10px; color:rgba(255,255,255,0.6); display:flex; align-items:center; gap:4px; }
.gp-perk::before { content:'✓'; color:#4ade80; font-weight:700; }

/* ── Panel ── */
.gp-panel { background:#fff; border:1.5px solid #e2e8f0; border-top:none; border-radius:0 0 14px 14px; overflow:hidden; }
.gp-search-bar { display:flex; align-items:center; gap:8px; padding:10px 12px; background:#f8fafc; border-bottom:1px solid #f1f5f9; }
.gp-search-bar input { flex:1; border:none; outline:none; background:transparent; font-size:12px; font-family:'Inter',sans-serif; color:#0f172a; min-width:0; }
.gp-search-bar input::placeholder { color:#94a3b8; }
.gp-count-pill { font-size:10px; color:#64748b; background:#e2e8f0; padding:2px 7px; border-radius:10px; white-space:nowrap; flex-shrink:0; font-weight:600; }

/* ── Guide list ── */
.gp-list { max-height:340px; overflow-y:auto; padding:8px; display:flex; flex-direction:column; gap:6px; }
.gp-list::-webkit-scrollbar { width:3px; }
.gp-list::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:2px; }

/* ── Guide card ── */
.gp-card {
  display:grid; grid-template-columns:40px 1fr auto;
  gap:10px; align-items:center;
  padding:10px; border-radius:10px;
  border:1.5px solid #f1f5f9; cursor:pointer;
  transition:all 0.15s; background:#fff; position:relative;
}
.gp-card:hover { border-color:#bbf7d0; background:#f0fdf4; }
.gp-card.sel { border-color:#16a34a; background:#f0fdf4; box-shadow:0 0 0 3px rgba(22,163,74,0.08); }
.gp-card.top { border-color:#fde68a; }
.gp-card.top.sel { border-color:#16a34a; }
.gp-ribbon { position:absolute; top:-1px; right:8px; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-size:8px; font-weight:800; padding:2px 7px; border-radius:0 0 6px 6px; letter-spacing:0.06em; text-transform:uppercase; }
.gp-av { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#052e16,#16a34a); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:15px; overflow:hidden; flex-shrink:0; border:2px solid #e2e8f0; }
.gp-card.sel .gp-av { border-color:#16a34a; }
.gp-av img { width:100%; height:100%; object-fit:cover; display:block; }
.gp-info { min-width:0; }
.gp-gname { font-size:13px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
.gp-row2 { display:flex; align-items:center; gap:4px; flex-wrap:nowrap; overflow:hidden; margin-bottom:3px; }
.gp-tag { font-size:9px; font-weight:600; padding:1px 5px; border-radius:4px; background:#f0fdf4; color:#15803d; border:1px solid #d1fae5; white-space:nowrap; flex-shrink:0; }
.gp-tag.lg { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }
.gp-row3 { display:flex; align-items:center; gap:6px; }
.gp-stars { color:#f59e0b; font-size:10px; }
.gp-rcount { font-size:10px; color:#94a3b8; }
.gp-exp { font-size:10px; color:#94a3b8; }
.gp-right { text-align:right; flex-shrink:0; }
.gp-price-amt { font-size:13px; font-weight:800; color:#0f172a; white-space:nowrap; }
.gp-price-unit { font-size:9px; color:#94a3b8; margin-bottom:3px; }
.gp-btn { display:block; padding:4px 10px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer; border:1.5px solid #e2e8f0; background:#fff; color:#374151; font-family:'Inter',sans-serif; transition:all 0.15s; white-space:nowrap; margin-bottom:3px; }
.gp-card.sel .gp-btn { background:#16a34a; border-color:#16a34a; color:#fff; }
.gp-card:hover:not(.sel) .gp-btn { border-color:#16a34a; color:#16a34a; }
.gp-view-btn { display:block; font-size:9px; font-weight:600; color:#6b7280; background:none; border:none; cursor:pointer; font-family:'Inter',sans-serif; text-decoration:underline; text-align:right; padding:0; }
.gp-view-btn:hover { color:#16a34a; }

/* ── Selected preview ── */
.gp-preview { padding:12px; border-bottom:1px solid #f1f5f9; }
.gp-preview-card { display:flex; align-items:center; gap:10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 12px; }
.gp-preview-av { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#052e16,#16a34a); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; overflow:hidden; }
.gp-preview-av img { width:100%; height:100%; object-fit:cover; }
.gp-preview-info { flex:1; min-width:0; }
.gp-preview-name { font-size:13px; font-weight:700; color:#052e16; }
.gp-preview-sub { font-size:11px; color:#16a34a; margin-top:1px; }
.gp-change { font-size:11px; font-weight:600; color:#16a34a; background:none; border:none; cursor:pointer; font-family:'Inter',sans-serif; padding:0; text-decoration:underline; flex-shrink:0; }

/* ── Breakdown ── */
.gp-breakdown { padding:12px; background:#f8fafc; border-top:1px solid #f1f5f9; }
.gp-bd-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:8px; }
.gp-bd-row { display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#374151; padding:3px 0; }
.gp-bd-row .v { font-weight:600; }
.gp-bd-row.hi { color:#16a34a; }
.gp-bd-row.dim { color:#94a3b8; font-size:10px; }
.gp-bd-divider { border:none; border-top:1px dashed #e2e8f0; margin:6px 0; }
.gp-bd-total { display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:800; color:#0f172a; padding:6px 0 0; }
.gp-bd-total .v { color:#16a34a; }

/* ── States ── */
.gp-loading { padding:32px 16px; text-align:center; }
.gp-spin { width:28px; height:28px; border:3px solid #d1fae5; border-top-color:#16a34a; border-radius:50%; animation:gpspin 0.8s linear infinite; margin:0 auto 8px; }
@keyframes gpspin { to { transform:rotate(360deg); } }
.gp-spin-txt { font-size:11px; color:#94a3b8; }
.gp-empty { padding:32px 16px; text-align:center; font-size:12px; color:#94a3b8; }
.gp-warn { padding:9px 12px; background:#fffbeb; border-top:1px solid #fde68a; font-size:11px; color:#92400e; display:flex; align-items:center; gap:6px; }

/* ══════════════════════════════════════════════
   GUIDE PROFILE DRAWER
══════════════════════════════════════════════ */
.gpd-overlay {
  position:fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0.55);
  z-index:99999;
  display:flex; align-items:stretch; justify-content:flex-end;
  animation:gpd-fade 0.2s ease;
}
@keyframes gpd-fade { from{opacity:0} to{opacity:1} }
.gpd-drawer {
  position:relative;
  width:460px; max-width:100vw; height:100%;
  background:#fff; display:flex; flex-direction:column;
  box-shadow:-8px 0 40px rgba(0,0,0,0.2);
  animation:gpd-slide 0.28s cubic-bezier(0.25,0.46,0.45,0.94);
  overflow:hidden; flex-shrink:0;
}
@keyframes gpd-slide { from{transform:translateX(100%)} to{transform:translateX(0)} }
@media(max-width:520px){
  .gpd-overlay { align-items:flex-end; justify-content:center; }
  .gpd-drawer { width:100%; height:92vh; border-radius:20px 20px 0 0; animation:gpd-slide-up 0.28s cubic-bezier(0.25,0.46,0.45,0.94); }
  @keyframes gpd-slide-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
}

/* Drawer hero */
.gpd-hero {
  background:linear-gradient(135deg,#052e16 0%,#1a4a2e 100%);
  padding:24px 20px 20px; position:relative; flex-shrink:0;
}
.gpd-close {
  position:absolute; top:16px; right:16px;
  width:32px; height:32px; border-radius:50%;
  background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.2);
  color:#fff; font-size:16px; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:background 0.15s;
}
.gpd-close:hover { background:rgba(255,255,255,0.25); }
.gpd-av-wrap { display:flex; align-items:center; gap:14px; margin-bottom:14px; }
.gpd-av {
  width:68px; height:68px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#16a34a,#4ade80);
  display:flex; align-items:center; justify-content:center;
  color:#fff; font-weight:800; font-size:26px;
  border:3px solid rgba(255,255,255,0.3); overflow:hidden;
}
.gpd-av img { width:100%; height:100%; object-fit:cover; }
.gpd-hero-name { font-size:20px; font-weight:800; color:#fff; margin-bottom:3px; }
.gpd-hero-sub { font-size:12px; color:rgba(255,255,255,0.6); }
.gpd-hero-rating { display:flex; align-items:center; gap:6px; margin-top:6px; }
.gpd-stars-lg { color:#f59e0b; font-size:14px; }
.gpd-rating-val { font-size:13px; font-weight:700; color:#fff; }
.gpd-rating-count { font-size:11px; color:rgba(255,255,255,0.5); }
.gpd-badges { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
.gpd-badge {
  font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px;
  background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.85);
  border:1px solid rgba(255,255,255,0.15);
}
.gpd-badge.green { background:rgba(74,222,128,0.2); color:#4ade80; border-color:rgba(74,222,128,0.3); }

/* Drawer body */
.gpd-body { flex:1; overflow-y:auto; overflow-x:hidden; padding:0; min-height:0; }
.gpd-body::-webkit-scrollbar { width:4px; }
.gpd-body::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:2px; }

.gpd-section { padding:18px 20px; border-bottom:1px solid #f1f5f9; }
.gpd-section:last-child { border-bottom:none; }
.gpd-section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:12px; }

/* Stat grid */
.gpd-stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.gpd-stat { background:#f8fafc; border-radius:10px; padding:12px 14px; border:1px solid #f1f5f9; }
.gpd-stat-val { font-size:18px; font-weight:800; color:#0f172a; margin-bottom:2px; }
.gpd-stat-label { font-size:10px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }

/* Tags */
.gpd-tags { display:flex; flex-wrap:wrap; gap:6px; }
.gpd-tag { font-size:11px; font-weight:600; padding:4px 10px; border-radius:20px; background:#f0fdf4; color:#15803d; border:1px solid #d1fae5; }
.gpd-tag.lang { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }

/* Bio */
.gpd-bio { font-size:13px; color:#374151; line-height:1.7; }

/* Rates */
.gpd-rates { display:flex; gap:10px; }
.gpd-rate-box { flex:1; background:#f0fdf4; border:1.5px solid #d1fae5; border-radius:10px; padding:14px; text-align:center; }
.gpd-rate-amt { font-size:18px; font-weight:800; color:#052e16; }
.gpd-rate-unit { font-size:10px; color:#6b7280; margin-top:2px; }

/* Drawer footer */
.gpd-footer { padding:16px 20px; border-top:1px solid #f1f5f9; display:flex; gap:10px; flex-shrink:0; background:#fff; }
.gpd-select-btn {
  flex:1; padding:13px; background:#16a34a; color:#fff;
  border:none; border-radius:10px; font-size:14px; font-weight:700;
  cursor:pointer; font-family:'Inter',sans-serif; transition:background 0.15s;
}
.gpd-select-btn:hover { background:#15803d; }
.gpd-select-btn.selected { background:#052e16; }
.gpd-deselect-btn {
  padding:13px 16px; background:#fef2f2; color:#b91c1c;
  border:1.5px solid #fecaca; border-radius:10px; font-size:13px; font-weight:700;
  cursor:pointer; font-family:'Inter',sans-serif;
}
`;

// ── Guide Profile Drawer ──────────────────────────────────────────────────────
function GuideDrawer({ guide, isSelected, onSelect, onDeselect, onClose }) {
  const name    = `${guide.firstName||''} ${guide.lastName||''}`.trim() || guide.username || 'Guide';
  const gp      = guide.guideProfile || {};
  // Support both flat fields (from /guides) and nested guideProfile
  const rating      = guide.rating      || gp.rating      || 0;
  const dailyRate   = guide.dailyRate   || gp.dailyRate   || 0;
  const hourlyRate  = guide.hourlyRate  || gp.hourlyRate  || 0;
  const bio         = guide.bio         || gp.bio         || '';
  const experience  = guide.yearsExperience || gp.experience || 0;
  const specs       = guide.specializations || gp.specialties || gp.specializations || [];
  const langs       = guide.languages   || gp.languages   || [];
  const profileImg  = guide.profileImage || gp.profileImage || null;
  const reviews     = guide.totalReviews || gp.totalReviews || 0;
  const license     = guide.licenseNumber || gp.licenseNumber || null;

  const drawer = (
    <div className="gpd-overlay" onClick={onClose}>
      <div className="gpd-drawer" onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div className="gpd-hero">
          <button className="gpd-close" onClick={onClose}>✕</button>
          <div className="gpd-av-wrap">
            <div className="gpd-av">
              {profileImg
                ? <img src={profileImg} alt={name} onError={e => e.target.style.display='none'} />
                : name.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <div className="gpd-hero-name">{name}</div>
              <div className="gpd-hero-sub">
                {experience > 0 ? `${experience} years experience` : 'Certified Guide'}
              </div>
              {rating > 0 && (
                <div className="gpd-hero-rating">
                  <span className="gpd-stars-lg">{'★'.repeat(Math.round(rating))}</span>
                  <span className="gpd-rating-val">{Number(rating).toFixed(1)}</span>
                  {reviews > 0 && <span className="gpd-rating-count">({reviews} reviews)</span>}
                </div>
              )}
            </div>
          </div>
          <div className="gpd-badges">
            {license && <span className="gpd-badge green">✓ Licensed</span>}
            {guide.applicationStatus === 'approved' && <span className="gpd-badge green">✓ Verified</span>}
            {specs.slice(0, 3).map(s => <span key={s} className="gpd-badge">{s}</span>)}
          </div>
        </div>

        {/* Body */}
        <div className="gpd-body">

          {/* Rates */}
          <div className="gpd-section">
            <div className="gpd-section-title">Pricing</div>
            <div className="gpd-rates">
              {dailyRate > 0 && (
                <div className="gpd-rate-box">
                  <div className="gpd-rate-amt">NPR {Number(dailyRate).toLocaleString()}</div>
                  <div className="gpd-rate-unit">per day</div>
                </div>
              )}
              {hourlyRate > 0 && (
                <div className="gpd-rate-box">
                  <div className="gpd-rate-amt">NPR {Number(hourlyRate).toLocaleString()}</div>
                  <div className="gpd-rate-unit">per hour</div>
                </div>
              )}
              {!dailyRate && !hourlyRate && (
                <div style={{ fontSize:13, color:'#94a3b8' }}>Rate on request</div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="gpd-section">
            <div className="gpd-section-title">At a Glance</div>
            <div className="gpd-stats">
              {experience > 0 && (
                <div className="gpd-stat">
                  <div className="gpd-stat-val">{experience}+</div>
                  <div className="gpd-stat-label">Years Experience</div>
                </div>
              )}
              {reviews > 0 && (
                <div className="gpd-stat">
                  <div className="gpd-stat-val">{reviews}</div>
                  <div className="gpd-stat-label">Reviews</div>
                </div>
              )}
              {rating > 0 && (
                <div className="gpd-stat">
                  <div className="gpd-stat-val">⭐ {Number(rating).toFixed(1)}</div>
                  <div className="gpd-stat-label">Rating</div>
                </div>
              )}
              {langs.length > 0 && (
                <div className="gpd-stat">
                  <div className="gpd-stat-val">{langs.length}</div>
                  <div className="gpd-stat-label">Language{langs.length > 1 ? 's' : ''}</div>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div className="gpd-section">
              <div className="gpd-section-title">About</div>
              <p className="gpd-bio">{bio}</p>
            </div>
          )}

          {/* Specialties */}
          {specs.length > 0 && (
            <div className="gpd-section">
              <div className="gpd-section-title">Specialties</div>
              <div className="gpd-tags">
                {specs.map(s => <span key={s} className="gpd-tag">{s}</span>)}
              </div>
            </div>
          )}

          {/* Languages */}
          {langs.length > 0 && (
            <div className="gpd-section">
              <div className="gpd-section-title">Languages</div>
              <div className="gpd-tags">
                {langs.map(l => <span key={l} className="gpd-tag lang">🌐 {l}</span>)}
              </div>
            </div>
          )}

          {/* Revenue split info */}
          <div className="gpd-section">
            <div className="gpd-section-title">Revenue Split</div>
            <div style={{ background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12, color:'#374151' }}>
                <span>Guide earns</span><span style={{ fontWeight:700, color:'#16a34a' }}>75%</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#374151' }}>
                <span>Platform fee</span><span style={{ fontWeight:700 }}>25%</span>
              </div>
              <div style={{ marginTop:8, fontSize:11, color:'#6b7280', lineHeight:1.5 }}>
                Payment is processed after the trip is marked as completed.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="gpd-footer">
          {isSelected ? (
            <>
              <button className="gpd-deselect-btn" onClick={() => { onDeselect(); onClose(); }}>
                ✕ Remove
              </button>
              <button className="gpd-select-btn selected" onClick={onClose}>
                ✓ Guide Selected
              </button>
            </>
          ) : (
            <button className="gpd-select-btn" onClick={() => { onSelect(guide); onClose(); }}>
              🧭 Book {name.split(' ')[0]} as My Guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
  return createPortal(drawer, document.body);
}

// ── Star renderer ─────────────────────────────────────────────────────────────
function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span className="gp-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

// ── Main GuidePicker ──────────────────────────────────────────────────────────
export default function GuidePicker({ duration = 1, onGuideSelect, preloadedGuides = null }) {
  const [open,      setOpen]      = useState(false);
  const [guides,    setGuides]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [selId,     setSelId]     = useState(null);
  const [showList,  setShowList]  = useState(true);
  const [drawerGuide, setDrawerGuide] = useState(null); // guide to show in drawer
  const inputRef = useRef(null);

  // When preloadedGuides changes, update list immediately
  useEffect(() => {
    if (preloadedGuides !== null) {
      setGuides(preloadedGuides);
      setLoading(false);
    }
  }, [JSON.stringify(preloadedGuides)]);

  useEffect(() => {
    if (!open) return;
    if (preloadedGuides !== null) {
      setGuides(preloadedGuides);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
      return;
    }
    if (guides.length) return;
    setLoading(true);
    guideService.getAvailableGuides().then(g => {
      setGuides(g);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    });
  }, [open]);

  const filtered = guides.filter(g => {
    if (!search) return true;
    const name  = `${g.firstName||''} ${g.lastName||''}`.toLowerCase();
    const specs = (g.specializations||[]).join(' ').toLowerCase();
    const langs = (g.languages||[]).join(' ').toLowerCase();
    return name.includes(search.toLowerCase()) || specs.includes(search.toLowerCase()) || langs.includes(search.toLowerCase());
  });

  const sorted      = [...filtered].sort((a,b) => (b.rating||0) - (a.rating||0));
  const topId       = sorted[0]?._id;
  const selGuide    = selId ? guides.find(g => g._id === selId) : null;
  const selName     = selGuide ? `${selGuide.firstName||''} ${selGuide.lastName||''}`.trim() : '';
  const dailyRate   = selGuide?.dailyRate || selGuide?.guideProfile?.dailyRate || 0;
  const guideFee    = dailyRate * duration;
  const guideEarns  = Math.round(guideFee * 0.75);
  const platFee     = Math.round(guideFee * 0.25);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) { setSelId(null); setShowList(true); onGuideSelect(null, false); }
  };

  const pick = (g) => {
    setSelId(g._id);
    setShowList(false);
    onGuideSelect(g, true);
  };

  const deselect = () => {
    setSelId(null);
    setShowList(true);
    onGuideSelect(null, true);
  };

  const change = () => {
    setShowList(true);
    setSelId(null);
    onGuideSelect(null, true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  return (
    <div className="gp-root">
      <style>{S}</style>

      {/* Banner */}
      <div className={`gp-banner${open ? ' open' : ''}`} onClick={toggle}>
        <div className="gp-banner-row1">
          <span className="gp-chip">✦ Enhance Your Trek</span>
          <div className={`gp-sw${open ? ' on' : ''}`} onClick={e => { e.stopPropagation(); toggle(); }} />
        </div>
        <div className="gp-banner-title">{open ? 'Choose Your Guide' : 'Add a Local Guide?'}</div>
        <div className="gp-banner-sub">
          {open
            ? 'Certified experts who know every trail and viewpoint.'
            : 'Trek with a certified local — safer, richer, unforgettable.'}
        </div>
        {!open && (
          <div className="gp-perks">
            <span className="gp-perk">Certified guides</span>
            <span className="gp-perk">75% goes to guide</span>
            <span className="gp-perk">Instant confirm</span>
          </div>
        )}
      </div>

      {/* Panel */}
      {open && (
        <div className="gp-panel">

          {/* Selected state */}
          {selGuide && !showList ? (
            <>
              <div className="gp-preview">
                <div className="gp-preview-card">
                  <div className="gp-preview-av">
                    {(selGuide.profileImage || selGuide.guideProfile?.profileImage)
                      ? <img src={selGuide.profileImage || selGuide.guideProfile?.profileImage} alt="" onError={e => e.target.style.display='none'} />
                      : selName.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="gp-preview-info">
                    <div className="gp-preview-name">🧭 {selName}</div>
                    <div className="gp-preview-sub">
                      {(selGuide.specializations||[]).slice(0,2).join(' · ')}
                      {selGuide.rating > 0 && ` · ⭐ ${Number(selGuide.rating).toFixed(1)}`}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end', flexShrink:0 }}>
                    <button className="gp-change" onClick={() => setDrawerGuide(selGuide)}>View Profile</button>
                    <button className="gp-change" onClick={change}>Change</button>
                  </div>
                </div>
              </div>

              {dailyRate > 0 && (
                <div className="gp-breakdown">
                  <div className="gp-bd-title">Pricing Breakdown</div>
                  <div className="gp-bd-row"><span>Daily rate</span><span className="v">NPR {Number(dailyRate).toLocaleString()}</span></div>
                  <div className="gp-bd-row"><span>Duration</span><span className="v">× {duration} day{duration!==1?'s':''}</span></div>
                  <hr className="gp-bd-divider" />
                  <div className="gp-bd-row hi"><span>Guide earns (75%)</span><span className="v">NPR {Number(guideEarns).toLocaleString()}</span></div>
                  <div className="gp-bd-row dim"><span>Platform fee (25%)</span><span className="v">NPR {Number(platFee).toLocaleString()}</span></div>
                  <div className="gp-bd-total"><span>Guide fee</span><span className="v">+NPR {Number(guideFee).toLocaleString()}</span></div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Search */}
              <div className="gp-search-bar">
                <span style={{ color:'#94a3b8', fontSize:13 }}>🔍</span>
                <input ref={inputRef} placeholder="Search name, specialty, language…" value={search} onChange={e => setSearch(e.target.value)} />
                {!loading && <span className="gp-count-pill">{sorted.length} guide{sorted.length!==1?'s':''}</span>}
              </div>

              {/* List */}
              <div className="gp-list">
                {loading && (
                  <div className="gp-loading"><div className="gp-spin" /><div className="gp-spin-txt">Finding guides…</div></div>
                )}
                {!loading && sorted.length === 0 && (
                  <div className="gp-empty">{search ? `No guides match "${search}"` : 'No available guides.'}</div>
                )}

                {!loading && sorted.map(g => {
                  const name   = `${g.firstName||''} ${g.lastName||''}`.trim() || 'Guide';
                  const isSel  = selId === g._id;
                  const isTop  = g._id === topId && sorted.length > 1;
                  const specs  = (g.specializations||[]).slice(0,2);
                  const langs  = (g.languages||[]).slice(0,1);

                  return (
                    <div key={g._id} className={`gp-card${isSel?' sel':''}${isTop?' top':''}`}>
                      {isTop && <div className="gp-ribbon">⭐ Top</div>}

                      {/* Avatar — click opens drawer */}
                      <div
                        className="gp-av"
                        onClick={() => setDrawerGuide(g)}
                        style={{ cursor:'pointer' }}
                        title="View profile"
                      >
                        {g.profileImage
                          ? <img src={g.profileImage} alt="" onError={e => e.target.style.display='none'} />
                          : name.charAt(0).toUpperCase()
                        }
                      </div>

                      {/* Info — click opens drawer */}
                      <div className="gp-info" onClick={() => setDrawerGuide(g)} style={{ cursor:'pointer' }}>
                        <div className="gp-gname">{name}</div>
                        <div className="gp-row2">
                          {specs.map(s => <span key={s} className="gp-tag">{s}</span>)}
                          {langs.map(l => <span key={l} className="gp-tag lg">🌐{l}</span>)}
                        </div>
                        <div className="gp-row3">
                          {g.rating > 0 ? <><Stars rating={g.rating} /><span className="gp-rcount">{Number(g.rating).toFixed(1)}</span></> : <span className="gp-rcount">No reviews</span>}
                          {g.yearsExperience > 0 && <span className="gp-exp">· {g.yearsExperience}yr</span>}
                        </div>
                      </div>

                      {/* Price + buttons */}
                      <div className="gp-right">
                        <div className="gp-price-amt">{g.dailyRate ? `NPR ${Number(g.dailyRate).toLocaleString()}` : '—'}</div>
                        <div className="gp-price-unit">per day</div>
                        <button className="gp-btn" onClick={() => isSel ? deselect() : pick(g)}>
                          {isSel ? '✓ Selected' : 'Select'}
                        </button>
                        <button className="gp-view-btn" onClick={e => { e.stopPropagation(); setDrawerGuide(g); }}>
                          View profile →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!selGuide && (
                <div className="gp-warn"><span>⚠️</span><span>Select a guide or toggle off to skip.</span></div>
              )}
            </>
          )}
        </div>
      )}

      {/* Guide Profile Drawer */}
      {drawerGuide && (
        <GuideDrawer
          guide={drawerGuide}
          isSelected={selId === drawerGuide._id}
          onSelect={pick}
          onDeselect={deselect}
          onClose={() => setDrawerGuide(null)}
        />
      )}
    </div>
  );
}
