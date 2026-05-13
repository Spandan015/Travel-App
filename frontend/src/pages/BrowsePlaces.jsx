import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CATEGORIES = ['City', 'Mountain', 'Lake', 'Temple', 'National Park', 'Cultural Site', 'Adventure Spot'];
const PROVINCES  = ['Province 1', 'Province 2', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

export default function BrowsePlaces() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [catFilter,    setCatFilter]    = useState('');
  const [provFilter,   setProvFilter]   = useState('');
  const [sort,         setSort]         = useState('default');
  const [viewMode,     setViewMode]     = useState('grid');

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/destinations`)
      .then(r => setDestinations(r.data.destinations || r.data || []))
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, []);

  const resetFilters = () => { setSearch(''); setSearchInput(''); setCatFilter(''); setProvFilter(''); setSort('default'); };

  let filtered = destinations.filter(d => {
    const s = !search    || d.name?.toLowerCase().includes(search.toLowerCase()) || d.district?.toLowerCase().includes(search.toLowerCase());
    const c = !catFilter  || d.category === catFilter;
    const p = !provFilter || d.province === provFilter;
    return s && c && p;
  });
  if (sort === 'rating') filtered = [...filtered].sort((a,b) => (b.rating||0) - (a.rating||0));
  if (sort === 'name')   filtered = [...filtered].sort((a,b) => a.name.localeCompare(b.name));

  const CAT_COUNTS = CATEGORIES.map(c => ({ c, count: destinations.filter(d => d.category === c).length }));

  const getImg = (d) => d.mainImage || d.images?.[0] || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80';

  const CATEGORY_COLORS = {
    City: '#1d4ed8', Mountain: '#15803d', Lake: '#0e7490', Temple: '#7e22ce',
    'National Park': '#166534', 'Cultural Site': '#c2410c', 'Adventure Spot': '#b91c1c',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
        :root {
          --green-primary:#16a34a;--green-mid:#15803d;--green-light:#f0fdf4;--green-border:#bbf7d0;--green-soft:#dcfce7;
          --text-primary:#0f172a;--text-secondary:#64748b;--text-muted:#94a3b8;
          --bg-page:#eef2f7;--bg-card:#ffffff;--border:#e2e8f0;
          --shadow-sm:0 1px 3px rgba(0,0,0,0.07);--shadow-md:0 4px 20px rgba(0,0,0,0.09);--shadow-lg:0 12px 48px rgba(0,0,0,0.14);
          --radius:16px;--radius-sm:10px;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .bp-root{font-family:'Roboto',sans-serif;background:var(--bg-page);min-height:100vh;padding-top:68px;}
        .bp-hero{background:linear-gradient(135deg,#052e16 0%,#064e23 50%,#0a4a1e 100%);padding:48px 28px 36px;position:relative;overflow:hidden;}
        .bp-hero::before{content:'';position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=30') center/cover;opacity:0.08;}
        .bp-hero-inner{max-width:1280px;margin:0 auto;position:relative;z-index:2;}
        .bp-hero h1{font-size:clamp(1.6rem,3.5vw,2.5rem);font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-0.03em;line-height:1.1;}
        .bp-hero h1 em{font-style:normal;color:#4ade80;}
        .bp-hero-sub{color:rgba(255,255,255,0.55);font-size:0.9rem;margin-bottom:24px;}
        .bp-searchbar{background:#fff;border-radius:var(--radius);display:flex;align-items:center;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,0.25);width:100%;}
        .bp-search-seg{display:flex;align-items:center;gap:8px;padding:14px 18px;flex:1;border-right:1px solid var(--border);min-width:0;}
        .bp-search-seg svg{color:var(--text-muted);flex-shrink:0;}
        .bp-search-input{border:none;outline:none;font-family:' Roboto',sans-serif;font-size:13.5px;color:var(--text-primary);background:transparent;width:100%;}
        .bp-search-input::placeholder{color:var(--text-muted);}
        .bp-search-seg-select{border:none;outline:none;font-family:'Roboto',sans-serif;font-size:13px;color:var(--text-secondary);background:transparent;cursor:pointer;padding:14px 18px;border-right:1px solid var(--border);flex-shrink:0;}
        .bp-search-btn{background:var(--green-primary);color:#fff;border:none;font-family:'Roboto',sans-serif;font-size:14px;font-weight:700;padding:14px 32px;cursor:pointer;transition:background 0.2s;flex-shrink:0;display:flex;align-items:center;gap:8px;}
        .bp-search-btn:hover{background:var(--green-mid);}
        .bp-layout{max-width:1280px;margin:28px auto;padding:0 24px 48px;display:grid;grid-template-columns:300px 1fr;gap:22px;align-items:start;}
        @media(max-width:960px){.bp-layout{grid-template-columns:1fr;}.bp-sidebar{display:none;}}
        .bp-sidebar{position:sticky;top:84px;display:flex;flex-direction:column;gap:14px;}
        .bp-filter-card{background:var(--bg-card);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow-sm);border:1px solid var(--border);}
        .bp-filter-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .bp-filter-head h3{font-size:14px;font-weight:800;color:var(--text-primary);}
        .bp-reset-link{font-size:12px;font-weight:600;color:var(--green-primary);background:none;border:none;cursor:pointer;font-family:' Roboto',sans-serif;}
        .bp-filter-section{margin-bottom:20px;}
        .bp-filter-section:last-child{margin-bottom:0;}
        .bp-filter-label{font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;display:block;margin-bottom:10px;}
        .bp-filter-input{width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-family:'Roboto',sans-serif;color:var(--text-primary);outline:none;background:#fff;transition:border-color 0.15s;}
        .bp-filter-input:focus{border-color:var(--green-primary);}
        .bp-cat-rows{display:flex;flex-direction:column;gap:6px;}
        .bp-cat-row{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:8px;cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;}
        .bp-cat-row:hover{background:var(--green-light);}
        .bp-cat-row.active{background:var(--green-light);border-color:var(--green-border);}
        .bp-cat-row-label{font-size:13px;color:var(--text-primary);font-weight:500;}
        .bp-cat-row-count{font-size:11px;color:var(--text-muted);background:#f1f5f9;padding:2px 8px;border-radius:20px;font-weight:600;}
        .bp-prov-chips{display:flex;flex-wrap:wrap;gap:6px;}
        .bp-prov-chip{padding:5px 12px;border:1.5px solid var(--border);border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;background:#fff;color:var(--text-secondary);font-family:'Roboto',sans-serif;transition:all 0.15s;}
        .bp-prov-chip.active{background:var(--green-light);border-color:var(--green-primary);color:var(--green-primary);}
        .bp-prov-chip:hover{border-color:var(--green-primary);color:var(--green-primary);}
        .bp-results{min-width:0;}
        .bp-results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;gap:12px;flex-wrap:wrap;}
        .bp-results-count{font-size:15px;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;}
        .bp-results-count span{font-weight:500;color:var(--text-muted);font-size:13px;}
        .bp-header-right{display:flex;align-items:center;gap:10px;}
        .bp-sort-select{padding:9px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:'Roboto',sans-serif;color:var(--text-secondary);outline:none;background:#fff;cursor:pointer;font-weight:500;}
        .bp-view-toggle{display:flex;border:1.5px solid var(--border);border-radius:10px;overflow:hidden;background:#fff;}
        .bp-vtoggle-btn{padding:8px 12px;border:none;background:transparent;cursor:pointer;color:var(--text-muted);font-size:14px;transition:all 0.15s;display:flex;align-items:center;}
        .bp-vtoggle-btn.active{background:var(--green-light);color:var(--green-primary);}
        .bp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px;}
        .bp-card{background:var(--bg-card);border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow-sm);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);display:flex;flex-direction:column;cursor:pointer;text-decoration:none;color:inherit;}
        .bp-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-lg);border-color:var(--green-border);}
        .bp-card-img{position:relative;height:210px;overflow:hidden;}
        .bp-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;display:block;}
        .bp-card:hover .bp-card-img img{transform:scale(1.06);}
        .bp-card-cat{position:absolute;top:12px;left:12px;font-size:11px;padding:4px 10px;border-radius:20px;font-weight:700;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);}
        .bp-card-popular{position:absolute;top:12px;right:10px;background:#fbbf24;color:#78350f;font-size:11px;font-weight:800;padding:4px 9px;border-radius:8px;}
        .bp-card-loc-pill{position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);color:rgba(255,255,255,0.9);font-size:11px;padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,0.1);font-weight:500;}
        .bp-card-body{padding:16px;flex:1;display:flex;flex-direction:column;}
        .bp-card-name{font-size:15px;font-weight:700;color:var(--text-primary);letter-spacing:-0.02em;margin-bottom:6px;line-height:1.3;}
        .bp-card-desc{font-size:12.5px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .bp-card-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;}
        .bp-card-tag{font-size:10.5px;background:var(--green-light);color:var(--green-mid);padding:3px 9px;border-radius:20px;font-weight:600;border:1px solid var(--green-border);}
        .bp-card-footer{margin-top:auto;display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid #f1f5f9;}
        .bp-card-rating{display:flex;align-items:center;gap:5px;}
        .bp-card-rating-score{font-size:14px;font-weight:800;color:var(--text-primary);}
        .bp-card-rating-stars{color:#f59e0b;font-size:11px;}
        .bp-card-rating-count{font-size:11px;color:var(--text-muted);}
        .bp-card-explore-btn{background:var(--green-primary);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.2s;}
        .bp-card-explore-btn:hover{background:var(--green-mid);}
        .bp-list{display:flex;flex-direction:column;gap:14px;}
        .bp-list-card{background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border);display:flex;overflow:hidden;box-shadow:var(--shadow-sm);transition:all 0.25s;text-decoration:none;color:inherit;}
        .bp-list-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px);border-color:var(--green-border);}
        .bp-list-img{width:260px;min-height:200px;flex-shrink:0;position:relative;overflow:hidden;}
        .bp-list-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s;}
        .bp-list-card:hover .bp-list-img img{transform:scale(1.04);}
        .bp-list-img-badge{position:absolute;top:10px;left:10px;font-size:11px;padding:4px 10px;border-radius:20px;font-weight:700;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);}
        .bp-list-body{flex:1;padding:18px 20px;display:flex;flex-direction:column;min-width:0;}
        .bp-list-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;}
        .bp-list-name{font-size:1.1rem;font-weight:700;color:var(--text-primary);letter-spacing:-0.02em;}
        .bp-list-rating{background:var(--green-primary);color:#fff;border-radius:8px 8px 8px 0;padding:5px 10px;font-size:13px;font-weight:800;flex-shrink:0;min-width:38px;text-align:center;}
        .bp-list-loc{font-size:12.5px;color:var(--green-primary);font-weight:600;display:flex;align-items:center;gap:4px;margin-bottom:10px;}
        .bp-list-desc{font-size:13px;color:var(--text-secondary);line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:12px;}
        .bp-list-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}
        .bp-list-tag{background:var(--green-light);color:var(--green-mid);border:1px solid var(--green-border);font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;}
        .bp-list-footer{display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;padding-top:12px;border-top:1px solid #f1f5f9;gap:10px;flex-wrap:wrap;}
        .bp-explore-btn2{padding:9px 20px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.2s;background:var(--green-primary);color:#fff;border:none;}
        .bp-explore-btn2:hover{background:var(--green-mid);}
        .bp-loading{display:flex;flex-direction:column;align-items:center;padding:80px 24px;gap:14px;}
        .bp-spinner{width:40px;height:40px;border:3px solid var(--green-soft);border-top:3px solid var(--green-primary);border-radius:50%;animation:spin 0.9s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .bp-empty{text-align:center;padding:80px 24px;}
        .bp-empty-icon{font-size:3rem;margin-bottom:14px;}
        .bp-empty h3{font-size:1.2rem;color:var(--text-primary);margin-bottom:8px;font-weight:700;}
        .bp-empty p{color:var(--text-muted);font-size:14px;}
        .bp-cta{background:linear-gradient(135deg,#052e16 0%,#064e23 100%);text-align:center;padding:64px 24px;position:relative;overflow:hidden;}
        .bp-cta h2{font-size:1.9rem;font-weight:800;color:#fff;margin-bottom:10px;letter-spacing:-0.03em;}
        .bp-cta p{color:rgba(255,255,255,0.55);font-size:0.95rem;margin-bottom:28px;}
        .bp-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
        .bp-cta-primary{background:var(--green-primary);color:#fff;text-decoration:none;padding:13px 30px;border-radius:12px;font-weight:700;font-size:14px;transition:background 0.2s;font-family:'Roboto',sans-serif;}
        .bp-cta-primary:hover{background:var(--green-mid);}
        .bp-cta-secondary{background:rgba(255,255,255,0.08);color:#fff;text-decoration:none;padding:13px 30px;border-radius:12px;font-weight:700;font-size:14px;border:1px solid rgba(255,255,255,0.15);font-family:'Roboto',sans-serif;}
        .bp-cta-secondary:hover{background:rgba(255,255,255,0.15);}
        @media(max-width:700px){.bp-list-img{width:120px;min-height:160px;}}
      `}</style>

      <div className="bp-root">
        <section className="bp-hero">
          <div className="bp-hero-inner">
            <h1>Explore <em>Nepal's Destinations</em></h1>
            <p className="bp-hero-sub">From ancient temple cities to mountain wilderness — discover iconic places across all of Nepal</p>
            <div className="bp-searchbar">
              <div className="bp-search-seg">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input className="bp-search-input" placeholder="Search destinations, cities, districts…" value={searchInput} onChange={e => { setSearchInput(e.target.value); setSearch(e.target.value); }} />
              </div>
              <select className="bp-search-seg-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="bp-search-seg-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Sort by</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name A–Z</option>
              </select>
              <button className="bp-search-btn" onClick={() => setSearch(searchInput.trim())}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search
              </button>
            </div>
          </div>
        </section>

        <div className="bp-layout">
          <aside className="bp-sidebar">
            <div className="bp-filter-card">
              <div className="bp-filter-head">
                <h3>Filters</h3>
                <button className="bp-reset-link" onClick={resetFilters}>Reset all</button>
              </div>
              <div className="bp-filter-section">
                <span className="bp-filter-label">Search</span>
                <input className="bp-filter-input" placeholder="Destination or city…" value={searchInput} onChange={e => { setSearchInput(e.target.value); setSearch(e.target.value); }} />
              </div>
              <div className="bp-filter-section">
                <span className="bp-filter-label">Category</span>
                <div className="bp-cat-rows">
                  <div className={`bp-cat-row${catFilter === '' ? ' active' : ''}`} onClick={() => setCatFilter('')}>
                    <span className="bp-cat-row-label">All</span>
                    <span className="bp-cat-row-count">{destinations.length}</span>
                  </div>
                  {CAT_COUNTS.map(({ c, count }) => (
                    <div key={c} className={`bp-cat-row${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(catFilter === c ? '' : c)}>
                      <span className="bp-cat-row-label">{c}</span>
                      <span className="bp-cat-row-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bp-filter-section">
                <span className="bp-filter-label">Province</span>
                <div className="bp-prov-chips">
                  {PROVINCES.map(p => (
                    <button key={p} className={`bp-prov-chip${provFilter === p ? ' active' : ''}`} onClick={() => setProvFilter(provFilter === p ? '' : p)}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="bp-results">
            <div className="bp-results-header">
              <div className="bp-results-count">
                {filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'}
                {search && <span> for "{search}"</span>}
              </div>
              <div className="bp-header-right">
                <select className="bp-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="default">Sort: Default</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">Name A–Z</option>
                </select>
                <div className="bp-view-toggle">
                  <button className={`bp-vtoggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button className={`bp-vtoggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="18" width="18" height="2" rx="1"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bp-loading"><div className="bp-spinner" /><p style={{color:'var(--text-muted)',fontSize:14}}>Finding destinations for you…</p></div>
            ) : filtered.length === 0 ? (
              <div className="bp-empty">
                <div className="bp-empty-icon">🗺️</div>
                <h3>No destinations found</h3>
                <p>Try adjusting your filters or <button onClick={resetFilters} style={{color:'var(--green-primary)',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:14}}>reset all</button></p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="bp-grid">
                {filtered.map(dest => (
                  <Link key={dest._id} to={`/places/${dest._id}`} className="bp-card">
                    <div className="bp-card-img">
                      <img src={getImg(dest)} alt={dest.name} onError={e => { e.target.src='https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'; }} />
                      <span className="bp-card-cat" style={{color: CATEGORY_COLORS[dest.category]||'#374151'}}>{dest.category}</span>
                      {dest.isPopular && <div className="bp-card-popular">⭐ Popular</div>}
                      {dest.district && <div className="bp-card-loc-pill">📍 {dest.district}</div>}
                    </div>
                    <div className="bp-card-body">
                      <div className="bp-card-name">{dest.name}</div>
                      <p className="bp-card-desc">{dest.shortDescription || dest.description}</p>
                      <div className="bp-card-tags">
                        {dest.province && <span className="bp-card-tag">{dest.province}</span>}
                        {dest.altitude && <span className="bp-card-tag">⛰️ {dest.altitude}m</span>}
                        {dest.bestTimeToVisit && <span className="bp-card-tag">📅 {dest.bestTimeToVisit}</span>}
                      </div>
                      <div className="bp-card-footer">
                        <div className="bp-card-rating">
                          {dest.rating > 0 ? (
                            <><span className="bp-card-rating-score">{Number(dest.rating).toFixed(1)}</span><span className="bp-card-rating-stars">★★★★★</span>{dest.totalReviews > 0 && <span className="bp-card-rating-count">({dest.totalReviews})</span>}</>
                          ) : (
                            <span style={{fontSize:12,color:'var(--text-muted)'}}>No reviews yet</span>
                          )}
                        </div>
                        <span className="bp-card-explore-btn">Explore →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bp-list">
                {filtered.map(dest => (
                  <Link key={dest._id} to={`/places/${dest._id}`} className="bp-list-card">
                    <div className="bp-list-img">
                      <img src={getImg(dest)} alt={dest.name} onError={e => { e.target.src='https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'; }} />
                      <span className="bp-list-img-badge" style={{color: CATEGORY_COLORS[dest.category]||'#374151'}}>{dest.category}</span>
                    </div>
                    <div className="bp-list-body">
                      <div className="bp-list-top">
                        <h3 className="bp-list-name">{dest.name}</h3>
                        {dest.rating > 0 && <div className="bp-list-rating">{Number(dest.rating).toFixed(1)}</div>}
                      </div>
                      <div className="bp-list-loc">📍 {dest.district}, {dest.province}</div>
                      <p className="bp-list-desc">{dest.shortDescription || dest.description}</p>
                      <div className="bp-list-tags">
                        {dest.altitude && <span className="bp-list-tag">⛰️ {dest.altitude}m</span>}
                        {dest.bestTimeToVisit && <span className="bp-list-tag">📅 {dest.bestTimeToVisit}</span>}
                        {dest.activities?.length > 0 && <span className="bp-list-tag">🎯 {dest.activities.length} activities</span>}
                      </div>
                      <div className="bp-list-footer">
                        <div style={{fontSize:13,color:'var(--text-secondary)'}}>
                          {dest.isPopular && <div style={{fontWeight:600}}>⭐ Popular Destination</div>}
                          <div>{dest.category}</div>
                        </div>
                        <span className="bp-explore-btn2">Explore →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="bp-cta">
          <h2>Planning a Trip to Nepal?</h2>
          <p>Browse curated packages or find a certified local guide for your adventure</p>
          <div className="bp-cta-btns">
            <Link to="/browse-packages" className="bp-cta-primary">Browse Packages</Link>
            <Link to="/browse-guides" className="bp-cta-secondary">Find a Guide</Link>
          </div>
        </section>
      </div>
    </>
  );
}
