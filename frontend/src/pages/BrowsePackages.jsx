import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import packageService from '../services/packageService';

const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Expert'];

const DIFF_COLORS = {
  Easy: { bg: '#dcfce7', color: '#166534' },
  Moderate: { bg: '#fef9c3', color: '#854d0e' },
  Challenging: { bg: '#fee2e2', color: '#991b1b' },
  Expert: { bg: '#ede9fe', color: '#5b21b6' },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;0,800;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}

  .bp-root { font-family:'DM Sans',sans-serif; background:#f8faf8; min-height:100vh; padding-top:68px; }

  /* Hero */
  .bp-hero {
    background:linear-gradient(135deg,#0a2818 0%,#0d3320 40%,#1a4a2a 70%,#0a1a10 100%);
    padding:72px 24px 48px; text-align:center; position:relative; overflow:hidden;
  }
  .bp-hero::before {
    content:''; position:absolute; inset:0;
    background:url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=60') center/cover;
    opacity:0.08;
  }
  .bp-hero-mountains {
    position:absolute; bottom:0; left:0; right:0; height:40%;
    clip-path:polygon(0% 100%,8% 65%,15% 72%,22% 50%,30% 65%,38% 35%,45% 52%,52% 22%,60% 48%,67% 38%,74% 58%,82% 28%,90% 50%,100% 38%,100% 100%);
    background:rgba(255,255,255,0.03);
  }
  .bp-hero-inner { position:relative; z-index:2; max-width:680px; margin:0 auto; }
  .bp-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,0.1); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.15); border-radius:100px;
    padding:6px 16px; font-size:12px; font-weight:500;
    color:rgba(255,255,255,0.85); letter-spacing:0.05em;
    text-transform:uppercase; margin-bottom:20px;
  }
  .bp-badge span { width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block; }
  .bp-hero h1 {
    font-family:'Fraunces',serif; font-size:clamp(2.2rem,5vw,3.8rem);
    font-weight:700; color:#fff; margin:0 0 16px; line-height:1.1; letter-spacing:-0.02em;
  }
  .bp-hero h1 em { font-style:italic; color:#4ade80; }
  .bp-hero p { color:rgba(255,255,255,0.65); font-size:1rem; margin:0 0 32px; font-weight:300; line-height:1.7; }
  .bp-hero-search {
    background:white; border-radius:14px; padding:5px;
    display:flex; align-items:center; max-width:560px; margin:0 auto;
    box-shadow:0 20px 60px rgba(0,0,0,0.35);
  }
  .bp-hero-input {
    flex:1; border:none; outline:none; padding:12px 16px;
    font-size:0.9rem; font-family:'DM Sans',sans-serif; color:#111; background:transparent;
  }
  .bp-hero-input::placeholder { color:#9ca3af; }
  .bp-hero-btn {
    background:#16a34a; color:white; border:none; border-radius:10px;
    padding:12px 24px; font-size:0.875rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:background 0.2s; white-space:nowrap;
  }
  .bp-hero-btn:hover { background:#15803d; }

  /* Stats */
  .bp-stats {
    display:flex; justify-content:center; gap:48px; padding:20px 24px;
    background:rgba(255,255,255,0.06); border-top:1px solid rgba(255,255,255,0.08);
    position:relative; z-index:2;
  }
  .bp-stat { text-align:center; color:white; }
  .bp-stat-num { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:700; display:block; }
  .bp-stat-label { font-size:0.72rem; opacity:0.55; text-transform:uppercase; letter-spacing:0.06em; }

  /* Body */
  .bp-body { max-width:1280px; margin:0 auto; padding:36px 24px; display:grid; grid-template-columns:260px 1fr; gap:28px; }
  @media(max-width:900px){ .bp-body{grid-template-columns:1fr;} .bp-sidebar{display:none;} }

  /* Sidebar */
  .bp-sidebar {
    background:white; border-radius:16px; border:1px solid #e5f0e8;
    padding:24px; height:fit-content; position:sticky; top:88px;
    box-shadow:0 2px 12px rgba(22,163,74,0.06);
  }
  .bp-sidebar-title { font-family:'Fraunces',serif; font-size:1rem; font-weight:700; color:#0a2818; margin:0 0 20px; }
  .bp-filter-section { margin-bottom:20px; }
  .bp-filter-label { font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#6b7280; margin-bottom:8px; display:block; }
  .bp-filter-input {
    width:100%; padding:9px 12px; border:1.5px solid #d1fae5;
    border-radius:9px; font-size:0.875rem; font-family:'DM Sans',sans-serif;
    color:#111827; outline:none; transition:border 0.15s;
  }
  .bp-filter-input:focus { border-color:#16a34a; }
  .bp-filter-select {
    width:100%; padding:9px 12px; border:1.5px solid #d1fae5;
    border-radius:9px; font-size:0.875rem; font-family:'DM Sans',sans-serif;
    color:#111827; outline:none; background:white; cursor:pointer;
  }
  .bp-price-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .bp-diff-tags { display:flex; flex-wrap:wrap; gap:6px; }
  .bp-diff-tag {
    padding:5px 12px; border-radius:20px; border:1.5px solid #d1fae5;
    font-size:0.78rem; font-weight:500; cursor:pointer; background:white;
    color:#6b7280; font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .bp-diff-tag.active { background:#f0fdf4; border-color:#16a34a; color:#15803d; font-weight:600; }
  .bp-check-row { display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom:8px; }
  .bp-check-row input { accent-color:#16a34a; width:16px; height:16px; cursor:pointer; }
  .bp-check-label { font-size:0.83rem; color:#374151; font-weight:500; }
  .bp-reset {
    width:100%; padding:9px; border:1.5px solid #d1fae5; border-radius:9px;
    background:transparent; color:#6b7280; font-size:0.83rem; font-weight:500;
    cursor:pointer; font-family:'DM Sans',sans-serif; margin-top:4px; transition:all 0.15s;
  }
  .bp-reset:hover { border-color:#16a34a; color:#16a34a; }

  /* Results */
  .bp-results { min-width:0; }
  .bp-results-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
  .bp-results-count { font-family:'Fraunces',serif; font-size:1.1rem; font-weight:700; color:#0a2818; }
  .bp-sort {
    padding:8px 14px; border:1.5px solid #d1fae5; border-radius:9px;
    font-size:0.83rem; font-family:'DM Sans',sans-serif; color:#374151;
    outline:none; background:white; cursor:pointer;
  }

  /* Package card */
  .bp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:22px; }
  .bp-card {
    background:white; border-radius:18px; border:1px solid #e5f0e8;
    overflow:hidden; transition:all 0.3s; display:flex; flex-direction:column;
    box-shadow:0 2px 8px rgba(22,163,74,0.05);
  }
  .bp-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px rgba(22,163,74,0.14); }
  .bp-card-img {
    height:200px; background:linear-gradient(135deg,#0a2818,#1a4a2a);
    position:relative; overflow:hidden;
  }
  .bp-card-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; }
  .bp-card:hover .bp-card-img img { transform:scale(1.05); }
  .bp-card-diff {
    position:absolute; top:12px; left:12px;
    font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:20px;
  }
  .bp-card-body { padding:18px; display:flex; flex-direction:column; flex:1; }
  .bp-card-name { font-family:'Fraunces',serif; font-size:1.05rem; font-weight:700; color:#0a2818; margin:0 0 8px; }
  .bp-card-meta { display:flex; gap:12px; margin-bottom:10px; flex-wrap:wrap; }
  .bp-card-meta span { font-size:0.78rem; color:#6b7280; font-weight:500; }
  .bp-card-desc { font-size:0.83rem; color:#6b7280; margin:0 0 12px; line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .bp-includes { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
  .bp-inc-tag { font-size:0.7rem; font-weight:500; padding:3px 8px; border-radius:12px; }
  .bp-inc-guide { background:#f0fdf4; color:#15803d; border:1px solid #d1fae5; }
  .bp-inc-hotel { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
  .bp-inc-transport { background:#fefce8; color:#854d0e; border:1px solid #fef08a; }
  .bp-inc-meals { background:#fdf4ff; color:#7e22ce; border:1px solid #e9d5ff; }
  .bp-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:14px; border-top:1px solid #f0fdf4; }
  .bp-price { display:flex; flex-direction:column; }
  .bp-price-label { font-size:0.7rem; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; }
  .bp-price-val { font-family:'Fraunces',serif; font-size:1.2rem; font-weight:700; color:#0a2818; }
  .bp-price-per { font-size:0.7rem; color:#9ca3af; }
  .bp-view-btn {
    background:#16a34a; color:white; border:none; border-radius:10px;
    padding:9px 18px; font-size:0.83rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; text-decoration:none;
    transition:all 0.2s; display:inline-block;
  }
  .bp-view-btn:hover { background:#15803d; transform:translateY(-1px); }

  /* Loading/Empty */
  .bp-loading { display:flex; flex-direction:column; align-items:center; padding:64px 24px; gap:16px; }
  .bp-spinner { width:40px;height:40px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:bp-spin 0.9s linear infinite; }
  @keyframes bp-spin{to{transform:rotate(360deg);}}
  .bp-empty { text-align:center; padding:64px 24px; }

  /* CTA */
  .bp-cta {
    background:linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%);
    text-align:center; padding:80px 24px; margin-top:40px; position:relative; overflow:hidden;
  }
  .bp-cta h2 { font-family:'Fraunces',serif; font-size:2rem; font-weight:700; color:white; margin-bottom:12px; position:relative; }
  .bp-cta p { color:rgba(255,255,255,0.65); margin:0 0 28px; font-weight:300; position:relative; }
  .bp-cta-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; position:relative; }
  .bp-cta-a {
    background:white; color:#15803d; padding:12px 28px; border-radius:10px;
    font-weight:700; font-size:0.875rem; text-decoration:none; transition:all 0.2s;
  }
  .bp-cta-a:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
  .bp-cta-b {
    background:rgba(255,255,255,0.1); color:white; padding:12px 28px; border-radius:10px;
    font-weight:600; font-size:0.875rem; text-decoration:none;
    border:1px solid rgba(255,255,255,0.25); backdrop-filter:blur(8px); transition:all 0.2s;
  }
  .bp-cta-b:hover { background:rgba(255,255,255,0.18); transform:translateY(-2px); }
`;

export default function BrowsePackages() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [inclGuide, setInclGuide] = useState(false);
  const [inclHotel, setInclHotel] = useState(false);
  const [sort, setSort] = useState('default');

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packageService.getAllPackages();
      setPackages(data.packages || data || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch(''); setMinPrice(''); setMaxPrice('');
    setDuration(''); setDifficulty(''); setInclGuide(false); setInclHotel(false); setSort('default');
  };

  let filtered = packages.filter(pkg => {
    const name = pkg.name || pkg.title || '';
    const matchSearch   = !search || name.toLowerCase().includes(search.toLowerCase());
    const matchMinPrice = !minPrice || pkg.price >= Number(minPrice);
    const matchMaxPrice = !maxPrice || pkg.price <= Number(maxPrice);
    const matchDuration = !duration || pkg.duration === Number(duration);
    const matchDiff     = !difficulty || pkg.difficulty === difficulty;
    const matchGuide    = !inclGuide || pkg.includes?.guide;
    const matchHotel    = !inclHotel || pkg.includes?.accommodation;
    return matchSearch && matchMinPrice && matchMaxPrice && matchDuration && matchDiff && matchGuide && matchHotel;
  });

  if (sort === 'price-asc')  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === 'duration')   filtered = [...filtered].sort((a, b) => a.duration - b.duration);
  if (sort === 'rating')     filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <>
      <style>{STYLES}</style>
      <div className="bp-root">

        {/* Hero */}
        <section className="bp-hero">
          <div className="bp-hero-mountains" />
          <div className="bp-hero-inner">
            <div className="bp-badge"><span />Travel Packages</div>
            <h1>Discover Nepal's Most<br /><em>Incredible Journeys</em></h1>
            <p>Curated tours, treks and cultural experiences crafted by Nepal travel experts</p>
            <div className="bp-hero-search">
              <input className="bp-hero-input" placeholder="Search packages…" value={search} onChange={e => setSearch(e.target.value)} />
              <button className="bp-hero-btn">🔍 Search</button>
            </div>
          </div>
        </section>

        <div className="bp-stats">
          <div className="bp-stat"><span className="bp-stat-num">{packages.length}+</span><span className="bp-stat-label">Packages</span></div>
          <div className="bp-stat"><span className="bp-stat-num">14</span><span className="bp-stat-label">Regions</span></div>
          <div className="bp-stat"><span className="bp-stat-num">4.9 ★</span><span className="bp-stat-label">Avg Rating</span></div>
        </div>

        {/* Body */}
        <div className="bp-body">
          {/* Sidebar */}
          <aside className="bp-sidebar">
            <h3 className="bp-sidebar-title">🎯 Filters</h3>
            <div className="bp-filter-section">
              <span className="bp-filter-label">Search</span>
              <input className="bp-filter-input" placeholder="Package name…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="bp-filter-section">
              <span className="bp-filter-label">Price per person (NPR)</span>
              <div className="bp-price-row">
                <input className="bp-filter-input" type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <input className="bp-filter-input" type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>
            <div className="bp-filter-section">
              <span className="bp-filter-label">Duration</span>
              <select className="bp-filter-select" value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="">Any Duration</option>
                {[1,2,3,4,5,6,7,8,10,12,14].map(d => <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="bp-filter-section">
              <span className="bp-filter-label">Difficulty</span>
              <div className="bp-diff-tags">
                {DIFFICULTIES.map(d => (
                  <button key={d} className={`bp-diff-tag${difficulty === d ? ' active' : ''}`} onClick={() => setDifficulty(difficulty === d ? '' : d)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="bp-filter-section">
              <span className="bp-filter-label">Includes</span>
              <label className="bp-check-row">
                <input type="checkbox" checked={inclGuide} onChange={e => setInclGuide(e.target.checked)} />
                <span className="bp-check-label">Guide Included</span>
              </label>
              <label className="bp-check-row">
                <input type="checkbox" checked={inclHotel} onChange={e => setInclHotel(e.target.checked)} />
                <span className="bp-check-label">Accommodation Included</span>
              </label>
            </div>
            <button className="bp-reset" onClick={resetFilters}>Reset All Filters</button>
          </aside>

          {/* Results */}
          <div className="bp-results">
            <div className="bp-results-head">
              <span className="bp-results-count">{filtered.length} package{filtered.length !== 1 ? 's' : ''} found</span>
              <select className="bp-sort" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="duration">Duration</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {loading ? (
              <div className="bp-loading"><div className="bp-spinner" /><p style={{color:'#6b7280',fontSize:'0.875rem'}}>Loading packages…</p></div>
            ) : filtered.length === 0 ? (
              <div className="bp-empty">
                <div style={{fontSize:'3rem',marginBottom:12}}>🗺️</div>
                <h3 style={{fontFamily:'Fraunces,serif',fontSize:'1.2rem',color:'#0a2818',margin:'0 0 8px'}}>No packages found</h3>
                <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:16}}>Try adjusting your filters</p>
                <button onClick={resetFilters} style={{background:'#16a34a',color:'white',border:'none',borderRadius:'9px',padding:'10px 22px',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Clear Filters</button>
              </div>
            ) : (
              <div className="bp-grid">
                {filtered.map(pkg => {
                  const name = pkg.name || pkg.title || 'Untitled Package';
                  const diffStyle = DIFF_COLORS[pkg.difficulty] || DIFF_COLORS.Moderate;
                  return (
                    <div key={pkg._id} className="bp-card">
                      <div className="bp-card-img">
                        {pkg.mainImage || pkg.images?.[0] ? (
                          <img src={pkg.mainImage || pkg.images[0]} alt={name}
                            onError={e => { e.target.style.display = 'none'; }} />
                        ) : null}
                        {pkg.difficulty && (
                          <span className="bp-card-diff" style={diffStyle}>{pkg.difficulty}</span>
                        )}
                      </div>
                      <div className="bp-card-body">
                        <h3 className="bp-card-name">{name}</h3>
                        <div className="bp-card-meta">
                          <span>🕐 {pkg.duration} day{pkg.duration !== 1 ? 's' : ''}</span>
                          {pkg.maxGroupSize && <span>👥 Max {pkg.maxGroupSize}</span>}
                          {pkg.rating > 0 && <span>⭐ {pkg.rating.toFixed(1)}</span>}
                        </div>
                        <p className="bp-card-desc">{pkg.description || 'An incredible Nepal adventure awaits.'}</p>
                        <div className="bp-includes">
                          {pkg.includes?.guide         && <span className="bp-inc-tag bp-inc-guide">🧭 Guide</span>}
                          {pkg.includes?.accommodation && <span className="bp-inc-tag bp-inc-hotel">🏨 Hotel</span>}
                          {pkg.includes?.transport     && <span className="bp-inc-tag bp-inc-transport">🚌 Transport</span>}
                          {pkg.includes?.meals         && <span className="bp-inc-tag bp-inc-meals">🍽️ Meals</span>}
                        </div>
                        <div className="bp-card-footer">
                          <div className="bp-price">
                            <span className="bp-price-label">From</span>
                            <span className="bp-price-val">NPR {Number(pkg.price || 0).toLocaleString()}</span>
                            <span className="bp-price-per">per person</span>
                          </div>
                          <Link to={`/packages/${pkg._id}`} className="bp-view-btn">View Details</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <section className="bp-cta">
          <h2>Need Help Planning Your Trip?</h2>
          <p>Our local guides can craft a personalized itinerary just for you</p>
          <div className="bp-cta-btns">
            <Link to="/browse-guides" className="bp-cta-a">Find a Local Guide</Link>
            <Link to="/browse-hotels" className="bp-cta-b">Browse Hotels</Link>
          </div>
        </section>
      </div>
    </>
  );
}
