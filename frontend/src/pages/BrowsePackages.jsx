import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import packageService from '../services/packageService';

const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const DIFF_COLORS = {
  Easy:        { bg: '#dcfce7', color: '#166534' },
  Moderate:    { bg: '#fef9c3', color: '#854d0e' },
  Challenging: { bg: '#fee2e2', color: '#991b1b' },
  Expert:      { bg: '#ede9fe', color: '#5b21b6' },
};

export default function BrowsePackages() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [packages,   setPackages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [minPrice,   setMinPrice]   = useState('');
  const [maxPrice,   setMaxPrice]   = useState('');
  const [duration,   setDuration]   = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [inclGuide,  setInclGuide]  = useState(false);
  const [inclHotel,  setInclHotel]  = useState(false);
  const [sort,       setSort]       = useState('default');
  const [viewMode,   setViewMode]   = useState('grid');

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packageService.getAllPackages();
      setPackages(data.packages || data || []);
    } catch { setPackages([]); }
    finally { setLoading(false); }
  };

  const resetFilters = () => {
    setSearch(''); setMinPrice(''); setMaxPrice('');
    setDuration(''); setDifficulty(''); setInclGuide(false); setInclHotel(false); setSort('default');
  };

  let filtered = packages.filter(pkg => {
    const name = pkg.name || pkg.title || '';
    const s  = !search     || name.toLowerCase().includes(search.toLowerCase());
    const mn = !minPrice   || pkg.price >= Number(minPrice);
    const mx = !maxPrice   || pkg.price <= Number(maxPrice);
    const du = !duration   || pkg.duration === Number(duration);
    const di = !difficulty || pkg.difficulty === difficulty;
    const g  = !inclGuide  || pkg.includes?.guide;
    const h  = !inclHotel  || pkg.includes?.accommodation;
    return s && mn && mx && du && di && g && h;
  });
  if (sort === 'price-asc')  filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') filtered = [...filtered].sort((a,b) => b.price - a.price);
  if (sort === 'duration')   filtered = [...filtered].sort((a,b) => a.duration - b.duration);
  if (sort === 'rating')     filtered = [...filtered].sort((a,b) => (b.rating||0) - (a.rating||0));

  const DIFF_COUNTS = DIFFICULTIES.map(d => ({ d, count: packages.filter(p => p.difficulty === d).length }));

  const getImg = (pkg) => pkg.mainImage || pkg.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
        :root {
          --green-primary:#16a34a;--green-mid:#15803d;--green-light:#f0fdf4;--green-border:#bbf7d0;--green-soft:#dcfce7;
          --text-primary:#0f172a;--text-secondary:#64748b;--text-muted:#94a3b8;
          --bg-page:#eef2f7;--bg-card:#ffffff;--border:#e2e8f0;
          --shadow-sm:0 1px 3px rgba(0,0,0,0.07);--shadow-md:0 4px 20px rgba(0,0,0,0.09);--shadow-lg:0 12px 48px rgba(0,0,0,0.14);
          --radius:16px;--radius-sm:10px;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .bpk-root{font-family:'Roboto',sans-serif;background:var(--bg-page);min-height:100vh;padding-top:68px;}

        /* HERO */
        .bpk-hero{background:linear-gradient(135deg,#052e16 0%,#064e23 50%,#0a4a1e 100%);padding:48px 28px 36px;position:relative;overflow:hidden;}
        .bpk-hero::before{content:'';position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=30') center/cover;opacity:0.08;}
        .bpk-hero-inner{max-width:1280px;margin:0 auto;position:relative;z-index:2;}
        .bpk-hero h1{font-size:clamp(1.6rem,3.5vw,2.5rem);font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-0.03em;line-height:1.1;}
        .bpk-hero h1 em{font-style:normal;color:#4ade80;}
        .bpk-hero-sub{color:rgba(255,255,255,0.55);font-size:0.9rem;margin-bottom:24px;}
        .bpk-searchbar{background:#fff;border-radius:var(--radius);display:flex;align-items:center;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,0.25);width:100%;}
        .bpk-search-seg{display:flex;align-items:center;gap:8px;padding:14px 18px;flex:1;border-right:1px solid var(--border);min-width:0;}
        .bpk-search-seg svg{color:var(--text-muted);flex-shrink:0;}
        .bpk-search-input{border:none;outline:none;font-family:'Roboto',sans-serif;font-size:13.5px;color:var(--text-primary);background:transparent;width:100%;}
        .bpk-search-input::placeholder{color:var(--text-muted);}
        .bpk-search-seg-select{border:none;outline:none;font-family:'Roboto',sans-serif;font-size:13px;color:var(--text-secondary);background:transparent;cursor:pointer;padding:14px 18px;border-right:1px solid var(--border);flex-shrink:0;}
        .bpk-search-btn{background:var(--green-primary);color:#fff;border:none;font-family:'Roboto',sans-serif;font-size:14px;font-weight:700;padding:14px 32px;cursor:pointer;transition:background 0.2s;flex-shrink:0;display:flex;align-items:center;gap:8px;}
        .bpk-search-btn:hover{background:var(--green-mid);}

        /* LAYOUT */
        .bpk-layout{max-width:1280px;margin:28px auto;padding:0 24px 48px;display:grid;grid-template-columns:300px 1fr;gap:22px;align-items:start;}
        @media(max-width:960px){.bpk-layout{grid-template-columns:1fr;}.bpk-sidebar{display:none;}}

        /* SIDEBAR */
        .bpk-sidebar{position:sticky;top:84px;display:flex;flex-direction:column;gap:14px;}
        .bpk-filter-card{background:var(--bg-card);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow-sm);border:1px solid var(--border);}
        .bpk-filter-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .bpk-filter-head h3{font-size:14px;font-weight:800;color:var(--text-primary);}
        .bpk-reset-link{font-size:12px;font-weight:600;color:var(--green-primary);background:none;border:none;cursor:pointer;font-family:'Roboto',sans-serif;}
        .bpk-filter-section{margin-bottom:20px;}
        .bpk-filter-section:last-child{margin-bottom:0;}
        .bpk-filter-label{font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;display:block;margin-bottom:10px;}
        .bpk-filter-input{width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-family:'Roboto',sans-serif;color:var(--text-primary);outline:none;background:#fff;transition:border-color 0.15s;}
        .bpk-filter-input:focus{border-color:var(--green-primary);}
        .bpk-filter-select{width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-family:'Roboto',sans-serif;color:var(--text-primary);outline:none;background:#fff;cursor:pointer;}
        .bpk-price-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}

        /* Difficulty rows */
        .bpk-diff-rows{display:flex;flex-direction:column;gap:6px;}
        .bpk-diff-row{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:8px;cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;}
        .bpk-diff-row:hover{background:var(--green-light);}
        .bpk-diff-row.active{background:var(--green-light);border-color:var(--green-border);}
        .bpk-diff-row-left{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-primary);font-weight:500;}
        .bpk-diff-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;}
        .bpk-diff-row-count{font-size:11px;color:var(--text-muted);background:#f1f5f9;padding:2px 8px;border-radius:20px;font-weight:600;}

        /* Includes checkboxes */
        .bpk-check-row{display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px;}
        .bpk-check-row input{accent-color:var(--green-primary);width:16px;height:16px;cursor:pointer;}
        .bpk-check-label{font-size:13px;color:var(--text-primary);font-weight:500;}

        /* RESULTS */
        .bpk-results{min-width:0;}
        .bpk-results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;gap:12px;flex-wrap:wrap;}
        .bpk-results-count{font-size:15px;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;}
        .bpk-results-count span{font-weight:500;color:var(--text-muted);font-size:13px;}
        .bpk-header-right{display:flex;align-items:center;gap:10px;}
        .bpk-sort-select{padding:9px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:'Roboto',sans-serif;color:var(--text-secondary);outline:none;background:#fff;cursor:pointer;font-weight:500;}
        .bpk-view-toggle{display:flex;border:1.5px solid var(--border);border-radius:10px;overflow:hidden;background:#fff;}
        .bpk-vtoggle-btn{padding:8px 12px;border:none;background:transparent;cursor:pointer;color:var(--text-muted);font-size:14px;transition:all 0.15s;display:flex;align-items:center;}
        .bpk-vtoggle-btn.active{background:var(--green-light);color:var(--green-primary);}

        /* GRID */
        .bpk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px;}
        .bpk-card{background:var(--bg-card);border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow-sm);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);display:flex;flex-direction:column;}
        .bpk-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-lg);border-color:var(--green-border);}
        .bpk-card-img{position:relative;height:210px;overflow:hidden;background:linear-gradient(135deg,#0a2818,#1a4a2a);}
        .bpk-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;display:block;}
        .bpk-card:hover .bpk-card-img img{transform:scale(1.06);}
        .bpk-card-diff{position:absolute;top:12px;left:12px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
        .bpk-card-rating{position:absolute;top:12px;right:10px;background:var(--green-primary);color:#fff;font-size:12px;font-weight:800;padding:4px 9px;border-radius:8px;}
        .bpk-card-loc-pill{position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);color:rgba(255,255,255,0.9);font-size:11px;padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,0.1);font-weight:500;}
        .bpk-card-body{padding:16px;flex:1;display:flex;flex-direction:column;}
        .bpk-card-name{font-size:15px;font-weight:700;color:var(--text-primary);letter-spacing:-0.02em;margin-bottom:6px;line-height:1.3;}
        .bpk-card-meta{display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap;}
        .bpk-card-meta span{font-size:12px;color:var(--text-secondary);font-weight:500;}
        .bpk-card-desc{font-size:12.5px;color:var(--text-secondary);line-height:1.6;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .bpk-includes{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;}
        .bpk-inc-tag{font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:20px;}
        .bpk-inc-guide{background:#f0fdf4;color:#15803d;border:1px solid #d1fae5;}
        .bpk-inc-hotel{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;}
        .bpk-inc-transport{background:#fefce8;color:#854d0e;border:1px solid #fef08a;}
        .bpk-inc-meals{background:#fdf4ff;color:#7e22ce;border:1px solid #e9d5ff;}
        .bpk-card-footer{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;padding-top:12px;border-top:1px solid #f1f5f9;}
        .bpk-price-label{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;}
        .bpk-price-val{font-size:18px;font-weight:800;color:var(--text-primary);line-height:1;letter-spacing:-0.03em;}
        .bpk-price-per{font-size:10.5px;color:var(--text-muted);margin-top:2px;}
        .bpk-view-btn{background:var(--green-primary);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.2s;text-decoration:none;display:inline-block;}
        .bpk-view-btn:hover{background:var(--green-mid);transform:translateY(-1px);}

        /* LIST */
        .bpk-list{display:flex;flex-direction:column;gap:14px;}
        .bpk-list-card{background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border);display:flex;overflow:hidden;box-shadow:var(--shadow-sm);transition:all 0.25s;}
        .bpk-list-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px);border-color:var(--green-border);}
        .bpk-list-img{width:260px;min-height:200px;flex-shrink:0;position:relative;overflow:hidden;background:linear-gradient(135deg,#0a2818,#1a4a2a);}
        .bpk-list-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s;}
        .bpk-list-card:hover .bpk-list-img img{transform:scale(1.04);}
        .bpk-list-img-badge{position:absolute;top:10px;left:10px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
        .bpk-list-body{flex:1;padding:18px 20px;display:flex;flex-direction:column;min-width:0;}
        .bpk-list-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;}
        .bpk-list-name{font-size:1.1rem;font-weight:700;color:var(--text-primary);letter-spacing:-0.02em;}
        .bpk-list-rating{background:var(--green-primary);color:#fff;border-radius:8px 8px 8px 0;padding:5px 10px;font-size:13px;font-weight:800;flex-shrink:0;min-width:38px;text-align:center;}
        .bpk-list-meta{display:flex;gap:12px;margin-bottom:10px;flex-wrap:wrap;}
        .bpk-list-meta span{font-size:12.5px;color:var(--green-primary);font-weight:600;}
        .bpk-list-desc{font-size:13px;color:var(--text-secondary);line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:12px;}
        .bpk-list-includes{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}
        .bpk-list-footer{display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;padding-top:12px;border-top:1px solid #f1f5f9;gap:10px;flex-wrap:wrap;}
        .bpk-list-price-note{font-size:11px;color:var(--text-muted);margin-bottom:2px;}
        .bpk-list-price{font-size:1.45rem;font-weight:800;color:var(--text-primary);letter-spacing:-0.03em;line-height:1;}
        .bpk-list-price-sub{font-size:11px;color:var(--text-muted);margin-top:2px;}

        /* STATES */
        .bpk-loading{display:flex;flex-direction:column;align-items:center;padding:80px 24px;gap:14px;}
        .bpk-spinner{width:40px;height:40px;border:3px solid var(--green-soft);border-top:3px solid var(--green-primary);border-radius:50%;animation:spin 0.9s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .bpk-empty{text-align:center;padding:80px 24px;}
        .bpk-empty-icon{font-size:3rem;margin-bottom:14px;}
        .bpk-empty h3{font-size:1.2rem;color:var(--text-primary);margin-bottom:8px;font-weight:700;}
        .bpk-empty p{color:var(--text-muted);font-size:14px;}

        /* CTA */
        .bpk-cta{background:linear-gradient(135deg,#052e16 0%,#064e23 100%);text-align:center;padding:64px 24px;position:relative;overflow:hidden;}
        .bpk-cta h2{font-size:1.9rem;font-weight:800;color:#fff;margin-bottom:10px;letter-spacing:-0.03em;}
        .bpk-cta p{color:rgba(255,255,255,0.55);font-size:0.95rem;margin-bottom:28px;}
        .bpk-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
        .bpk-cta-primary{background:var(--green-primary);color:#fff;text-decoration:none;padding:13px 30px;border-radius:12px;font-weight:700;font-size:14px;transition:background 0.2s;font-family:'Roboto',sans-serif;}
        .bpk-cta-primary:hover{background:var(--green-mid);}
        .bpk-cta-secondary{background:rgba(255,255,255,0.08);color:#fff;text-decoration:none;padding:13px 30px;border-radius:12px;font-weight:700;font-size:14px;border:1px solid rgba(255,255,255,0.15);font-family:'Roboto',sans-serif;}
        .bpk-cta-secondary:hover{background:rgba(255,255,255,0.15);}

        @media(max-width:700px){.bpk-list-img{width:120px;min-height:160px;}}
      `}</style>

      <div className="bpk-root">

        {/* HERO */}
        <section className="bpk-hero">
          <div className="bpk-hero-inner">
            <h1>Discover Nepal's <em>Best Packages</em></h1>
            <p className="bpk-hero-sub">Curated tours, treks and cultural experiences crafted by Nepal travel experts</p>
            <div className="bpk-searchbar">
              <div className="bpk-search-seg">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input className="bpk-search-input" placeholder="Search packages…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="bpk-search-seg-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="">All Difficulties</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="bpk-search-seg-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Sort by</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="duration">Duration</option>
                <option value="rating">Top Rated</option>
              </select>
              <button className="bpk-search-btn">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search
              </button>
            </div>
          </div>
        </section>

        {/* LAYOUT */}
        <div className="bpk-layout">

          {/* SIDEBAR */}
          <aside className="bpk-sidebar">
            <div className="bpk-filter-card">
              <div className="bpk-filter-head">
                <h3>Filters</h3>
                <button className="bpk-reset-link" onClick={resetFilters}>Reset all</button>
              </div>

              <div className="bpk-filter-section">
                <span className="bpk-filter-label">Search</span>
                <input className="bpk-filter-input" placeholder="Package name…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              <div className="bpk-filter-section">
                <span className="bpk-filter-label">Price per person (NPR)</span>
                <div className="bpk-price-row">
                  <input className="bpk-filter-input" type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <input className="bpk-filter-input" type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>

              <div className="bpk-filter-section">
                <span className="bpk-filter-label">Duration</span>
                <select className="bpk-filter-select" value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="">Any Duration</option>
                  {[1,2,3,4,5,6,7,8,10,12,14].map(d => <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              <div className="bpk-filter-section">
                <span className="bpk-filter-label">Difficulty</span>
                <div className="bpk-diff-rows">
                  <div className={`bpk-diff-row${difficulty === '' ? ' active' : ''}`} onClick={() => setDifficulty('')}>
                    <span className="bpk-diff-row-left">All</span>
                    <span className="bpk-diff-row-count">{packages.length}</span>
                  </div>
                  {DIFF_COUNTS.map(({ d, count }) => (
                    <div key={d} className={`bpk-diff-row${difficulty === d ? ' active' : ''}`} onClick={() => setDifficulty(difficulty === d ? '' : d)}>
                      <div className="bpk-diff-row-left">
                        <span className="bpk-diff-badge" style={DIFF_COLORS[d]}>{d}</span>
                      </div>
                      <span className="bpk-diff-row-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bpk-filter-section">
                <span className="bpk-filter-label">Includes</span>
                <label className="bpk-check-row">
                  <input type="checkbox" checked={inclGuide} onChange={e => setInclGuide(e.target.checked)} />
                  <span className="bpk-check-label">Guide Included</span>
                </label>
                <label className="bpk-check-row">
                  <input type="checkbox" checked={inclHotel} onChange={e => setInclHotel(e.target.checked)} />
                  <span className="bpk-check-label">Accommodation Included</span>
                </label>
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <div className="bpk-results">
            <div className="bpk-results-header">
              <div className="bpk-results-count">
                {filtered.length} {filtered.length === 1 ? 'package' : 'packages'}
                {search && <span> for "{search}"</span>}
              </div>
              <div className="bpk-header-right">
                <select className="bpk-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="duration">Duration</option>
                  <option value="rating">Top Rated</option>
                </select>
                <div className="bpk-view-toggle">
                  <button className={`bpk-vtoggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button className={`bpk-vtoggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="18" width="18" height="2" rx="1"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bpk-loading"><div className="bpk-spinner" /><p style={{color:'var(--text-muted)',fontSize:14}}>Loading packages…</p></div>
            ) : filtered.length === 0 ? (
              <div className="bpk-empty">
                <div className="bpk-empty-icon">🗺️</div>
                <h3>No packages found</h3>
                <p>Try adjusting your filters or <button onClick={resetFilters} style={{color:'var(--green-primary)',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:14}}>reset all</button></p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="bpk-grid">
                {filtered.map(pkg => {
                  const name = pkg.name || pkg.title || 'Untitled Package';
                  const diffStyle = DIFF_COLORS[pkg.difficulty] || DIFF_COLORS.Moderate;
                  const score = pkg.rating ? Number(pkg.rating).toFixed(1) : null;
                  return (
                    <div key={pkg._id} className="bpk-card">
                      <div className="bpk-card-img">
                        <img src={getImg(pkg)} alt={name} onError={e => { e.target.src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'; }} />
                        {pkg.difficulty && <span className="bpk-card-diff" style={diffStyle}>{pkg.difficulty}</span>}
                        {score && <div className="bpk-card-rating">⭐ {score}</div>}
                        {pkg.duration && <div className="bpk-card-loc-pill">🕐 {pkg.duration} day{pkg.duration !== 1 ? 's' : ''}</div>}
                      </div>
                      <div className="bpk-card-body">
                        <div className="bpk-card-name">{name}</div>
                        <div className="bpk-card-meta">
                          {pkg.maxGroupSize && <span>👥 Max {pkg.maxGroupSize}</span>}
                          {pkg.startLocation && <span>📍 {pkg.startLocation}</span>}
                        </div>
                        <p className="bpk-card-desc">{pkg.description || 'An incredible Nepal adventure awaits.'}</p>
                        <div className="bpk-includes">
                          {pkg.includes?.guide         && <span className="bpk-inc-tag bpk-inc-guide">🧭 Guide</span>}
                          {pkg.includes?.accommodation && <span className="bpk-inc-tag bpk-inc-hotel">🏨 Hotel</span>}
                          {pkg.includes?.transport     && <span className="bpk-inc-tag bpk-inc-transport">🚌 Transport</span>}
                          {pkg.includes?.meals         && <span className="bpk-inc-tag bpk-inc-meals">🍽️ Meals</span>}
                        </div>
                        <div className="bpk-card-footer">
                          <div>
                            <div className="bpk-price-label">From</div>
                            <div className="bpk-price-val">NPR {Number(pkg.price||0).toLocaleString()}</div>
                            <div className="bpk-price-per">per person</div>
                          </div>
                          <Link to={`/packages/${pkg._id}`} className="bpk-view-btn">View Details</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bpk-list">
                {filtered.map(pkg => {
                  const name = pkg.name || pkg.title || 'Untitled Package';
                  const diffStyle = DIFF_COLORS[pkg.difficulty] || DIFF_COLORS.Moderate;
                  const score = pkg.rating ? Number(pkg.rating).toFixed(1) : null;
                  return (
                    <div key={pkg._id} className="bpk-list-card">
                      <div className="bpk-list-img">
                        <img src={getImg(pkg)} alt={name} onError={e => { e.target.src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'; }} />
                        {pkg.difficulty && <span className="bpk-list-img-badge" style={diffStyle}>{pkg.difficulty}</span>}
                      </div>
                      <div className="bpk-list-body">
                        <div className="bpk-list-top">
                          <h3 className="bpk-list-name">{name}</h3>
                          {score && <div className="bpk-list-rating">{score}</div>}
                        </div>
                        <div className="bpk-list-meta">
                          <span>🕐 {pkg.duration} day{pkg.duration !== 1 ? 's' : ''}</span>
                          {pkg.maxGroupSize && <span>👥 Max {pkg.maxGroupSize}</span>}
                          {pkg.startLocation && <span>📍 {pkg.startLocation}</span>}
                        </div>
                        <p className="bpk-list-desc">{pkg.description || 'An incredible Nepal adventure awaits.'}</p>
                        <div className="bpk-list-includes">
                          {pkg.includes?.guide         && <span className="bpk-inc-tag bpk-inc-guide">🧭 Guide</span>}
                          {pkg.includes?.accommodation && <span className="bpk-inc-tag bpk-inc-hotel">🏨 Hotel</span>}
                          {pkg.includes?.transport     && <span className="bpk-inc-tag bpk-inc-transport">🚌 Transport</span>}
                          {pkg.includes?.meals         && <span className="bpk-inc-tag bpk-inc-meals">🍽️ Meals</span>}
                        </div>
                        <div className="bpk-list-footer">
                          <div>
                            <div className="bpk-list-price-note">From per person</div>
                            <div className="bpk-list-price">NPR {Number(pkg.price||0).toLocaleString()}</div>
                            <div className="bpk-list-price-sub">Taxes & fees extra</div>
                          </div>
                          <Link to={`/packages/${pkg._id}`} className="bpk-view-btn">View Details</Link>
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
        <section className="bpk-cta">
          <h2>Need Help Planning Your Trip?</h2>
          <p>Our local guides can craft a personalized itinerary just for you</p>
          <div className="bpk-cta-btns">
            <Link to="/browse-guides" className="bpk-cta-primary">Find a Local Guide</Link>
            <Link to="/browse-hotels" className="bpk-cta-secondary">Browse Hotels</Link>
          </div>
        </section>
      </div>
    </>
  );
}
