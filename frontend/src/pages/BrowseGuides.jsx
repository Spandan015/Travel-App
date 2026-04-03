import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;0,800;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}

  .bg-root { font-family:'DM Sans',sans-serif; background:#f8faf8; min-height:100vh; padding-top:68px; }

  .bg-hero {
    background:linear-gradient(135deg,#0a2818 0%,#0d3320 40%,#1a4a2a 70%,#0a1a10 100%);
    padding:72px 24px 0; text-align:center; position:relative; overflow:hidden;
  }
  .bg-hero::before {
    content:''; position:absolute; inset:0;
    background:url('https://images.unsplash.com/photo-1554274311-5efce2b2ea3c?w=1400&q=60') center/cover;
    opacity:0.08;
  }
  .bg-hero-mountains {
    position:absolute; bottom:0; left:0; right:0; height:40%;
    clip-path:polygon(0% 100%,8% 65%,15% 72%,22% 50%,30% 65%,38% 35%,45% 52%,52% 22%,60% 48%,67% 38%,74% 58%,82% 28%,90% 50%,100% 38%,100% 100%);
    background:rgba(255,255,255,0.03);
  }
  .bg-hero-content { position:relative; z-index:2; max-width:680px; margin:0 auto; padding-bottom:48px; }
  .bg-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,0.1); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.15); border-radius:100px;
    padding:6px 16px; font-size:12px; font-weight:500;
    color:rgba(255,255,255,0.85); letter-spacing:0.05em;
    text-transform:uppercase; margin-bottom:20px;
  }
  .bg-badge span { width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block; }
  .bg-hero h1 {
    font-family:'Fraunces',serif; font-size:clamp(2.2rem,5vw,3.8rem);
    font-weight:700; color:#fff; margin:0 0 16px; line-height:1.1; letter-spacing:-0.02em;
  }
  .bg-hero h1 em { font-style:italic; color:#4ade80; }
  .bg-hero p { color:rgba(255,255,255,0.65); font-size:1rem; margin:0 0 36px; font-weight:300; line-height:1.7; }

  .bg-stats {
    display:flex; justify-content:center; gap:48px; padding:20px 24px;
    background:rgba(255,255,255,0.06); border-top:1px solid rgba(255,255,255,0.08);
    position:relative; z-index:2;
  }
  .bg-stat { text-align:center; color:white; }
  .bg-stat-num { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:700; display:block; }
  .bg-stat-label { font-size:0.72rem; opacity:0.55; text-transform:uppercase; letter-spacing:0.06em; }

  .bg-body { max-width:1280px; margin:0 auto; padding:36px 24px; display:grid; grid-template-columns:260px 1fr; gap:28px; }
  @media(max-width:900px){ .bg-body{grid-template-columns:1fr;} .bg-sidebar{display:none;} }

  .bg-sidebar {
    background:white; border-radius:16px; border:1px solid #e5f0e8;
    padding:24px; height:fit-content; position:sticky; top:88px;
    box-shadow:0 2px 12px rgba(22,163,74,0.06);
  }
  .bg-sidebar-title { font-family:'Fraunces',serif; font-size:1rem; font-weight:700; color:#0a2818; margin:0 0 20px; }
  .bg-filter-section { margin-bottom:18px; }
  .bg-filter-label { font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#6b7280; margin-bottom:8px; display:block; }
  .bg-filter-input {
    width:100%; padding:9px 12px; border:1.5px solid #d1fae5;
    border-radius:9px; font-size:0.875rem; font-family:'DM Sans',sans-serif;
    color:#111827; outline:none; transition:border 0.15s;
  }
  .bg-filter-input:focus { border-color:#16a34a; }
  .bg-filter-select {
    width:100%; padding:9px 12px; border:1.5px solid #d1fae5;
    border-radius:9px; font-size:0.875rem; font-family:'DM Sans',sans-serif;
    color:#111827; outline:none; background:white; cursor:pointer;
  }
  .bg-reset {
    width:100%; padding:9px; border:1.5px solid #d1fae5; border-radius:9px;
    background:transparent; color:#6b7280; font-size:0.83rem; font-weight:500;
    cursor:pointer; font-family:'DM Sans',sans-serif; margin-top:4px; transition:all 0.15s;
  }
  .bg-reset:hover { border-color:#16a34a; color:#16a34a; }

  .bg-results { min-width:0; }
  .bg-results-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
  .bg-results-count { font-family:'Fraunces',serif; font-size:1.1rem; font-weight:700; color:#0a2818; }

  .bg-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:22px; }
  .bg-card {
    background:white; border-radius:18px; border:1px solid #e5f0e8;
    overflow:hidden; transition:all 0.3s;
    box-shadow:0 2px 8px rgba(22,163,74,0.05);
  }
  .bg-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px rgba(22,163,74,0.14); }
  .bg-card-head {
    background:linear-gradient(135deg,#0a2818,#1a4a2a);
    padding:24px; display:flex; align-items:center; gap:16px;
  }
  .bg-avatar {
    width:56px; height:56px; border-radius:50%;
    background:linear-gradient(135deg,#16a34a,#4ade80);
    display:flex; align-items:center; justify-content:center;
    font-size:1.4rem; font-weight:800; color:white; flex-shrink:0;
    border:2px solid rgba(255,255,255,0.2);
  }
  .bg-card-name { font-family:'Fraunces',serif; font-size:1rem; font-weight:700; color:white; }
  .bg-card-loc { font-size:0.78rem; color:rgba(255,255,255,0.6); margin-top:3px; }
  .bg-avail {
    margin-left:auto; font-size:0.7rem; font-weight:700; padding:4px 10px;
    border-radius:20px; flex-shrink:0; text-transform:uppercase; letter-spacing:0.04em;
  }
  .bg-avail.available { background:rgba(74,222,128,0.2); color:#4ade80; border:1px solid rgba(74,222,128,0.3); }
  .bg-avail.unavailable { background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
  .bg-card-body { padding:18px; }
  .bg-rating { display:flex; align-items:center; gap:6px; margin-bottom:10px; }
  .bg-stars { color:#fbbf24; font-size:0.85rem; }
  .bg-rating-val { font-size:0.8rem; color:#6b7280; font-weight:500; }
  .bg-bio { font-size:0.83rem; color:#6b7280; line-height:1.6; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .bg-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
  .bg-tag { background:#f0fdf4; color:#15803d; border:1px solid #d1fae5; font-size:0.7rem; font-weight:500; padding:3px 8px; border-radius:12px; }
  .bg-langs { font-size:0.78rem; color:#6b7280; margin-bottom:14px; }
  .bg-langs strong { color:#374151; }
  .bg-card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:14px; border-top:1px solid #f0fdf4; }
  .bg-rates { display:flex; gap:16px; }
  .bg-rate { text-align:center; }
  .bg-rate-label { font-size:0.68rem; color:#9ca3af; text-transform:uppercase; letter-spacing:0.04em; display:block; }
  .bg-rate-val { font-family:'Fraunces',serif; font-size:1rem; font-weight:700; color:#0a2818; }
  .bg-view-btn {
    background:#16a34a; color:white; border:none; border-radius:10px;
    padding:9px 16px; font-size:0.8rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; text-decoration:none;
    transition:all 0.2s; display:inline-block;
  }
  .bg-view-btn:hover { background:#15803d; transform:translateY(-1px); }

  .bg-empty { text-align:center; padding:64px 24px; }
  .bg-empty h3 { font-family:'Fraunces',serif; font-size:1.3rem; color:#0a2818; margin-bottom:8px; }
  .bg-empty p { color:#6b7280; font-size:0.9rem; }

  .bg-loading { display:flex; flex-direction:column; align-items:center; padding:64px 24px; gap:16px; }
  .bg-spinner { width:40px;height:40px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:bg-spin 0.9s linear infinite; }
  @keyframes bg-spin{to{transform:rotate(360deg);}}

  .bg-cta {
    background:linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%);
    text-align:center; padding:80px 24px; margin-top:40px;
  }
  .bg-cta h2 { font-family:'Fraunces',serif; font-size:2rem; font-weight:700; color:white; margin-bottom:12px; }
  .bg-cta p { color:rgba(255,255,255,0.65); margin:0 0 28px; }
  .bg-cta-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .bg-cta-a {
    background:#16a34a; color:white; padding:12px 28px; border-radius:10px;
    font-weight:700; font-size:0.875rem; text-decoration:none; transition:all 0.2s;
  }
  .bg-cta-a:hover { background:#15803d; transform:translateY(-2px); }
  .bg-cta-b {
    background:rgba(255,255,255,0.1); color:white; padding:12px 28px; border-radius:10px;
    font-weight:600; font-size:0.875rem; text-decoration:none;
    border:1px solid rgba(255,255,255,0.25); backdrop-filter:blur(8px); transition:all 0.2s;
  }
  .bg-cta-b:hover { background:rgba(255,255,255,0.18); transform:translateY(-2px); }
`;

const BrowseGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    specialty: '',
    language: '',
    minRating: 0,
    maxPrice: 500
  });

  useEffect(() => {
    fetchGuides();
  }, [filters]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      // ✅ Only use /api/guides — public endpoint, no auth needed
      const res = await axios.get(`${API}/guides`);
      const data = res.data;
      let allGuides = data.guides || data || [];

      // Apply client-side filters
      const filtered = allGuides.filter(guide => {
        const gp = guide.guideProfile || {};
        const name = guide.username || guide.firstName || '';
        const matchesLocation = !filters.location ||
          gp.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
          name.toLowerCase().includes(filters.location.toLowerCase());
        const matchesSpecialty = !filters.specialty ||
          gp.specialties?.some(s => s.toLowerCase().includes(filters.specialty.toLowerCase()));
        const matchesLanguage = !filters.language ||
          gp.languages?.some(l => l.toLowerCase().includes(filters.language.toLowerCase()));
        const matchesRating = !filters.minRating || (gp.rating || 0) >= Number(filters.minRating);
        const matchesPrice = !filters.maxPrice || (gp.hourlyRate || 0) <= Number(filters.maxPrice);
        return matchesLocation && matchesSpecialty && matchesLanguage && matchesRating && matchesPrice;
      });

      setGuides(filtered);
    } catch (error) {
      console.error('Error fetching guides:', error);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters({ location: '', specialty: '', language: '', minRating: 0, maxPrice: 500 });

  return (
    <>
      <style>{STYLES}</style>
      <div className="bg-root">

        <section className="bg-hero">
          <div className="bg-hero-mountains" />
          <div className="bg-hero-content">
            <div className="bg-badge"><span />Local Guides</div>
            <h1>Find Your <em>Perfect Guide</em></h1>
            <p>Connect with certified local guides who know Nepal's best spots, hidden gems, and secret trails</p>
          </div>
          <div className="bg-stats">
            <div className="bg-stat"><span className="bg-stat-num">200+</span><span className="bg-stat-label">Certified Guides</span></div>
            <div className="bg-stat"><span className="bg-stat-num">14</span><span className="bg-stat-label">Regions</span></div>
            <div className="bg-stat"><span className="bg-stat-num">4.9 ★</span><span className="bg-stat-label">Avg Rating</span></div>
          </div>
        </section>

        <div className="bg-body">
          <aside className="bg-sidebar">
            <h3 className="bg-sidebar-title">🎯 Filter Guides</h3>
            <div className="bg-filter-section">
              <span className="bg-filter-label">Location</span>
              <input type="text" name="location" className="bg-filter-input" placeholder="e.g. Everest, Pokhara"
                value={filters.location} onChange={handleFilterChange} />
            </div>
            <div className="bg-filter-section">
              <span className="bg-filter-label">Specialty</span>
              <select name="specialty" className="bg-filter-select" value={filters.specialty} onChange={handleFilterChange}>
                <option value="">All Specialties</option>
                <option value="Hiking">Hiking</option>
                <option value="Cultural">Cultural Tours</option>
                <option value="Trekking">Trekking</option>
                <option value="Adventure">Adventure</option>
                <option value="Photography">Photography</option>
                <option value="History">History</option>
              </select>
            </div>
            <div className="bg-filter-section">
              <span className="bg-filter-label">Language</span>
              <select name="language" className="bg-filter-select" value={filters.language} onChange={handleFilterChange}>
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
            <div className="bg-filter-section">
              <span className="bg-filter-label">Min Rating</span>
              <select name="minRating" className="bg-filter-select" value={filters.minRating} onChange={handleFilterChange}>
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
            <div className="bg-filter-section">
              <span className="bg-filter-label">Max Price/Hour ($)</span>
              <input type="number" name="maxPrice" className="bg-filter-input" placeholder="500"
                value={filters.maxPrice} onChange={handleFilterChange} />
            </div>
            <button className="bg-reset" onClick={resetFilters}>Reset All Filters</button>
          </aside>

          <div className="bg-results">
            <div className="bg-results-head">
              <span className="bg-results-count">{guides.length} guide{guides.length !== 1 ? 's' : ''} found</span>
            </div>

            {loading ? (
              <div className="bg-loading">
                <div className="bg-spinner" />
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading guides…</p>
              </div>
            ) : guides.length === 0 ? (
              <div className="bg-empty">
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🧭</div>
                <h3>No guides found</h3>
                <p>Try adjusting your filters or{' '}
                  <button onClick={resetFilters} style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    clear all filters
                  </button>
                </p>
              </div>
            ) : (
              <div className="bg-grid">
                {guides.map((guide) => {
                  const gp = guide.guideProfile || {};
                  const name = guide.username || `${guide.firstName || ''} ${guide.lastName || ''}`.trim() || 'Guide';
                  const initial = name.charAt(0).toUpperCase();
                  return (
                    <div key={guide._id} className="bg-card">
                      <div className="bg-card-head">
                        <div className="bg-avatar">{initial}</div>
                        <div>
                          <div className="bg-card-name">{name}</div>
                          {gp.location && <div className="bg-card-loc">📍 {gp.location}</div>}
                        </div>
                        <span className={`bg-avail ${gp.availability ? 'available' : 'unavailable'}`}>
                          {gp.availability ? '● Available' : '● Unavailable'}
                        </span>
                      </div>
                      <div className="bg-card-body">
                        {(gp.rating || 0) > 0 && (
                          <div className="bg-rating">
                            <span className="bg-stars">{'★'.repeat(Math.floor(gp.rating || 0))}</span>
                            <span className="bg-rating-val">({(gp.rating || 0).toFixed(1)})</span>
                          </div>
                        )}
                        {gp.bio && <p className="bg-bio">{gp.bio}</p>}
                        {gp.specialties?.length > 0 && (
                          <div className="bg-tags">
                            {gp.specialties.slice(0, 3).map((s, i) => <span key={i} className="bg-tag">{s}</span>)}
                            {gp.specialties.length > 3 && <span className="bg-tag">+{gp.specialties.length - 3}</span>}
                          </div>
                        )}
                        {gp.languages?.length > 0 && (
                          <p className="bg-langs"><strong>Languages:</strong> {gp.languages.join(', ')}</p>
                        )}
                        {gp.experience > 0 && (
                          <p className="bg-langs"><strong>Experience:</strong> {gp.experience} years</p>
                        )}
                        <div className="bg-card-footer">
                          <div className="bg-rates">
                            {gp.hourlyRate > 0 && (
                              <div className="bg-rate">
                                <span className="bg-rate-label">Hourly</span>
                                <span className="bg-rate-val">${gp.hourlyRate}</span>
                              </div>
                            )}
                            {gp.dailyRate > 0 && (
                              <div className="bg-rate">
                                <span className="bg-rate-label">Daily</span>
                                <span className="bg-rate-val">${gp.dailyRate}</span>
                              </div>
                            )}
                          </div>
                          <Link to={`/guides/${guide._id}`} className="bg-view-btn">View Profile</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <section className="bg-cta">
          <h2>Want to Become a Guide?</h2>
          <p>Share your expertise and earn while exploring Nepal's beautiful landscapes</p>
          <div className="bg-cta-btns">
            <Link to="/apply-guide" className="bg-cta-a">Apply as a Guide</Link>
            <Link to="/browse-packages" className="bg-cta-b">Browse Packages</Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default BrowseGuides;
