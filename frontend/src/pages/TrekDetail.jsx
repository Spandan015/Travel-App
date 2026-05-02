import { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import GuidePicker from '../components/GuidePicker';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DIFF_COLORS = {
  Easy:        { bg:'#dcfce7', color:'#15803d' },
  Moderate:    { bg:'#fef9c3', color:'#854d0e' },
  Challenging: { bg:'#fee2e2', color:'#991b1b' },
  Expert:      { bg:'#ede9fe', color:'#5b21b6' },
};

const S = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.td-root{font-family:'Roboto',sans-serif;background:#f8faf8;min-height:100vh;padding-top:68px;}
.td-hero{position:relative;min-height:60vh;display:flex;align-items:flex-end;overflow:hidden;}
.td-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform 0.6s;}
.td-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.75) 100%);}
.td-hero-content{position:relative;z-index:2;padding:40px 24px 48px;max-width:1100px;margin:0 auto;width:100%;}
.td-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:16px;flex-wrap:wrap;}
.td-breadcrumb a{color:rgba(255,255,255,0.7);text-decoration:none;}
.td-breadcrumb a:hover{color:#4ade80;}
.td-hero h1{font-size:clamp(2rem,5vw,3.2rem);font-weight:700;color:#fff;margin:0 0 12px;line-height:1.15;letter-spacing:-0.02em;}
.td-hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;}
.td-meta-pill{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.15);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.2);border-radius:100px;padding:5px 14px;font-size:12px;color:#fff;font-weight:500;}
.td-diff-pill{border-radius:100px;padding:5px 14px;font-size:12px;font-weight:700;}
.td-body{max-width:1100px;margin:0 auto;padding:40px 24px;display:grid;grid-template-columns:1fr 320px;gap:32px;}
@media(max-width:960px){.td-body{grid-template-columns:1fr;}}
.td-glance{background:#fff;border-radius:16px;border:1px solid #e5f0e8;padding:20px 24px;margin-bottom:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;}
.td-glance-item{display:flex;align-items:flex-start;gap:10px;}
.td-glance-icon{width:34px;height:34px;border-radius:8px;background:#f0fdf4;border:1px solid #d1fae5;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
.td-glance-label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;}
.td-glance-val{font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;}
.td-section{background:#fff;border-radius:16px;border:1px solid #e5f0e8;padding:24px;margin-bottom:20px;}
.td-section-title{font-size:1.2rem;font-weight:700;color:#0f172a;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
.td-section-title::after{content:'';flex:1;height:1px;background:#f0fdf4;margin-left:8px;}
.td-overview{font-size:14px;color:#374151;line-height:1.85;white-space:pre-line;}
.td-day{border:1px solid #f0fdf4;border-radius:12px;margin-bottom:10px;overflow:hidden;}
.td-day-head{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;background:#fafff8;transition:background 0.15s;}
.td-day-head:hover{background:#f0fdf4;}
.td-day-num{background:#16a34a;color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;flex-shrink:0;}
.td-day-title{font-size:13px;font-weight:700;color:#0f172a;flex:1;}
.td-day-chevron{font-size:11px;color:#64748b;transition:transform 0.2s;flex-shrink:0;}
.td-day-chevron.open{transform:rotate(180deg);}
.td-day-body{padding:16px;border-top:1px solid #f0fdf4;}
.td-day-desc{font-size:13px;color:#374151;line-height:1.75;margin-bottom:14px;}
.td-day-facts{display:flex;flex-wrap:wrap;gap:8px;}
.td-day-fact{display:flex;align-items:center;gap:5px;font-size:11px;color:#64748b;background:#f8faf8;border:1px solid #e5f0e8;padding:4px 10px;border-radius:20px;}
.td-inc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:640px){.td-inc-grid{grid-template-columns:1fr;}}
.td-inc-list{list-style:none;display:flex;flex-direction:column;gap:8px;}
.td-inc-item{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:#374151;line-height:1.5;}
.td-inc-dot{flex-shrink:0;margin-top:2px;font-size:13px;}
.td-alt-chart{width:100%;height:160px;position:relative;margin-top:8px;}
.td-alt-svg{width:100%;height:100%;}
.td-gear-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
@media(max-width:500px){.td-gear-grid{grid-template-columns:1fr;}}
.td-gear-item{display:flex;align-items:center;gap:8px;font-size:13px;color:#374151;padding:6px 0;}
.td-faq{border:1px solid #f0fdf4;border-radius:10px;margin-bottom:8px;overflow:hidden;}
.td-faq-q{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;cursor:pointer;font-size:13px;font-weight:600;color:#0f172a;background:#fafff8;}
.td-faq-q:hover{background:#f0fdf4;}
.td-faq-a{padding:12px 16px;font-size:13px;color:#374151;line-height:1.7;border-top:1px solid #f0fdf4;}
.td-sidebar{display:flex;flex-direction:column;gap:16px;}
.td-price-card{background:linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%);border-radius:16px;padding:24px;}
.td-price-from{font-size:12px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.05em;}
.td-price-val{font-size:2.2rem;font-weight:700;color:#fff;line-height:1;margin:6px 0 4px;}
.td-price-per{font-size:12px;color:rgba(255,255,255,0.5);}
.td-price-usd{font-size:13px;color:#4ade80;margin-top:6px;font-weight:500;}
.td-book-btn{display:block;background:#16a34a;color:#fff;text-align:center;padding:13px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;margin-top:18px;transition:background 0.2s;border:none;cursor:pointer;width:100%;font-family:'Roboto',sans-serif;}
.td-book-btn:hover{background:#15803d;}
.td-book-btn:disabled{background:#6b7280;cursor:not-allowed;}
.td-enquire-btn{display:block;background:rgba(255,255,255,0.1);color:#fff;text-align:center;padding:11px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;margin-top:8px;border:1px solid rgba(255,255,255,0.2);}
.td-info-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;padding:20px;}
.td-info-title{font-size:1rem;font-weight:700;color:#0f172a;margin-bottom:14px;}
.td-info-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0fdf4;font-size:13px;}
.td-info-row:last-child{border-bottom:none;}
.td-info-key{color:#64748b;}
.td-info-val{font-weight:700;color:#0f172a;text-align:right;}
.td-permit-tag{display:inline-block;background:#f0fdf4;color:#15803d;border:1px solid #d1fae5;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;margin:3px;}
.td-similar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-top:16px;}
.td-sim-card{background:#fff;border-radius:14px;border:1px solid #e5f0e8;overflow:hidden;text-decoration:none;display:block;transition:all 0.25s;}
.td-sim-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(22,163,74,0.1);}
.td-sim-img{height:140px;overflow:hidden;background:#f1f5f9;position:relative;}
.td-sim-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s;}
.td-sim-card:hover .td-sim-img img{transform:scale(1.05);}
.td-sim-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;}
.td-sim-body{padding:12px 14px;}
.td-sim-name{font-size:0.95rem;font-weight:700;color:#0f172a;margin-bottom:4px;}
.td-sim-meta{font-size:11px;color:#94a3b8;display:flex;gap:8px;}
.td-sim-price{font-weight:700;color:#16a34a;font-size:12px;margin-top:6px;}
.td-spinner{width:48px;height:48px;border:4px solid #d1fae5;border-top:4px solid #16a34a;border-radius:50%;animation:td-spin 0.9s linear infinite;margin:80px auto;}
@keyframes td-spin{to{transform:rotate(360deg);}}
.td-not-found{text-align:center;padding:80px 24px;}
.td-guide-picker-wrap{background:rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-top:16px;}
.td-guide-picker-title{font-size:12px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.05em;font-weight:700;margin-bottom:10px;}
.td-price-breakdown{background:rgba(255,255,255,0.08);border-radius:10px;padding:12px;margin-top:14px;font-size:12px;}
.td-price-breakdown-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;color:rgba(255,255,255,0.7);}
.td-price-breakdown-row.total{color:#fff;font-weight:800;font-size:14px;border-top:1px solid rgba(255,255,255,0.2);margin-top:4px;padding-top:8px;}
`;

function AltitudeChart({ itinerary }) {
  if (!itinerary?.length) return null;
  const points = itinerary.filter(d => d.elevation).map(d => ({ day:d.day, el:Number(d.elevation) }));
  if (points.length < 2) return null;
  const maxEl = Math.max(...points.map(p=>p.el));
  const minEl = Math.min(...points.map(p=>p.el));
  const W=600, H=120, PAD=20;
  const xScale = (day) => PAD + ((day-1)/(points.length-1))*(W-PAD*2);
  const yScale = (el)  => H - PAD - ((el-minEl)/(maxEl-minEl||1))*(H-PAD*2);
  const pathD  = points.map((p,i)=>`${i===0?'M':'L'} ${xScale(p.day)} ${yScale(p.el)}`).join(' ');
  const areaD  = pathD + ` L ${xScale(points[points.length-1].day)} ${H} L ${xScale(points[0].day)} ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="td-alt-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#altGrad)" />
      <path d={pathD} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p,i) => <circle key={i} cx={xScale(p.day)} cy={yScale(p.el)} r="4" fill="#16a34a" stroke="#fff" strokeWidth="1.5" />)}
      {points.map((p,i) => <text key={i} x={xScale(p.day)} y={H-4} textAnchor="middle" fontSize="9" fill="#94a3b8">Day {p.day}</text>)}
    </svg>
  );
}

export default function TrekDetail() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { user }   = useContext(AuthContext);
  const [trek,     setTrek]     = useState(null);
  const [similar,  setSimilar]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [openDays, setOpenDays] = useState({ 0:true });
  const [openFaqs, setOpenFaqs] = useState({});
  const [activeImg, setActiveImg] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // ── Phase 2: Guide state ──────────────────────────────────────────────────
  const [selectedGuide,  setSelectedGuide]  = useState(null);
  const [guideRequested, setGuideRequested] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0);
    setLoading(true);
    axios.get(`${API}/treks/${slug}`)
      .then(({ data }) => {
        setTrek(data.trek);
        if (data.trek?.region?._id) {
          axios.get(`${API}/treks/region/${data.trek.region._id}`)
            .then(r => setSimilar((r.data.treks||[]).filter(t=>t.slug!==slug).slice(0,3)))
            .catch(()=>{});
        }
      })
      .catch(()=>setTrek(null))
      .finally(()=>setLoading(false));
  }, [slug]);

  const toggleDay = (i) => setOpenDays(p=>({...p,[i]:!p[i]}));
  const toggleFaq = (i) => setOpenFaqs(p=>({...p,[i]:!p[i]}));

  const getImg = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API.replace('/api','')}/uploads/${img}`;
  };

  const handleGuideSelect = (guide, requested) => {
    setSelectedGuide(guide);
    setGuideRequested(requested);
  };

  const basePrice      = trek?.price || 0;
  const guideFeeTotal  = selectedGuide ? (selectedGuide.guideProfile?.dailyRate || 0) * (trek?.duration || 1) : 0;
  const totalPrice     = basePrice + guideFeeTotal;
  const canBook        = !guideRequested || (guideRequested && selectedGuide);

  if (loading) return <><style>{S}</style><div className="td-root"><div className="td-spinner" /></div></>;

  if (!trek) return (
    <><style>{S}</style>
      <div className="td-root">
        <div className="td-not-found">
          <div style={{ fontSize:'3rem', marginBottom:16 }}>🏔</div>
          <h2 style={{ fontSize:'1.5rem', color:'#0f172a', marginBottom:8 }}>Trek not found</h2>
          <p style={{ color:'#64748b', marginBottom:20 }}>This trek doesn't exist or has been removed.</p>
          <Link to="/browse-destinations" style={{ background:'#16a34a', color:'#fff', padding:'10px 24px', borderRadius:10, textDecoration:'none', fontWeight:600 }}>← Browse Destinations</Link>
        </div>
      </div>
    </>
  );

  const diff    = DIFF_COLORS[trek.difficulty] || DIFF_COLORS.Moderate;
  const allImgs = [trek.coverImage, ...(trek.images||[])].filter(Boolean);
  const heroImg = allImgs[activeImg] || allImgs[0];

  return (
    <><style>{S}</style>
      <div className="td-root">

        {/* HERO */}
        <section className="td-hero">
          <div className="td-hero-bg" style={{ backgroundImage:heroImg?`url(${getImg(heroImg)})`:undefined, background:!heroImg?'linear-gradient(135deg,#0a2818,#1a4a2a)':undefined }} />
          <div className="td-hero-overlay" />
          <div className="td-hero-content">
            <div className="td-breadcrumb">
              <Link to="/">Home</Link> /
              <Link to="/browse-destinations">Regions</Link> /
              {trek.region && <Link to={`/destinations/${trek.region.slug}`}>{trek.region.name}</Link>}
              / {trek.name}
            </div>
            <h1>{trek.name}</h1>
            <div className="td-hero-meta">
              {trek.duration    && <div className="td-meta-pill">📅 {trek.duration} Days</div>}
              {trek.maxAltitude && <div className="td-meta-pill">⛰ {trek.maxAltitude.toLocaleString()}m</div>}
              {trek.bestSeason  && <div className="td-meta-pill">🌤 {trek.bestSeason}</div>}
              {trek.startPoint  && <div className="td-meta-pill">✈ Starts: {trek.startPoint}</div>}
              {trek.difficulty  && <span className="td-diff-pill" style={{ background:diff.bg, color:diff.color }}>{trek.difficulty}</span>}
            </div>
          </div>
        </section>

        {/* GLANCE */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
          <div className="td-glance">
            {[
              { icon:'📅', label:'Duration',       val:trek.duration      ?`${trek.duration} Days`:'—' },
              { icon:'⛰', label:'Max Altitude',   val:trek.maxAltitude   ?`${trek.maxAltitude.toLocaleString()}m`:'—' },
              { icon:'🌤', label:'Best Season',    val:trek.bestSeason    ||'—' },
              { icon:'🧭', label:'Trip Type',      val:trek.tripType      ||'—' },
              { icon:'🚌', label:'Transportation', val:trek.transportation||'—' },
              { icon:'🏕', label:'Accommodation',  val:trek.accommodation ||'—' },
              { icon:'👥', label:'Group Size',     val:trek.groupSize     ||'—' },
            ].map((g,i) => (
              <div key={i} className="td-glance-item">
                <div className="td-glance-icon">{g.icon}</div>
                <div><div className="td-glance-label">{g.label}</div><div className="td-glance-val">{g.val}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="td-body">
          <div>
            {/* Thumbnail strip */}
            {allImgs.length > 1 && (
              <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                {allImgs.slice(0,6).map((img,i) => (
                  <div key={i} onClick={()=>setActiveImg(i)} style={{ width:72, height:56, borderRadius:8, overflow:'hidden', cursor:'pointer', border:`2px solid ${activeImg===i?'#16a34a':'transparent'}`, flexShrink:0 }}>
                    <img src={getImg(img)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                  </div>
                ))}
              </div>
            )}

            {trek.overview && (
              <div className="td-section">
                <div className="td-section-title">🗺 Overview and Highlights</div>
                <p className="td-overview">{trek.overview}</p>
                {trek.highlights?.filter(Boolean).length > 0 && (
                  <ul style={{ marginTop:16, listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                    {trek.highlights.filter(Boolean).map((h,i) => (
                      <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#374151' }}>
                        <span style={{ color:'#16a34a', fontWeight:700, flexShrink:0 }}>✓</span>{h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {trek.itinerary?.length > 0 && (
              <div className="td-section">
                <div className="td-section-title">📋 Day to Day Itinerary</div>
                {trek.itinerary.map((day,i) => (
                  <div key={i} className="td-day">
                    <div className="td-day-head" onClick={()=>toggleDay(i)}>
                      <span className="td-day-num">Day {day.day}</span>
                      <span className="td-day-title">{day.title}</span>
                      {day.distance && <span style={{ fontSize:11, color:'#94a3b8', marginRight:4 }}>{day.distance}</span>}
                      <span className={`td-day-chevron${openDays[i]?' open':''}`}>▾</span>
                    </div>
                    {openDays[i] && (
                      <div className="td-day-body">
                        {day.description && <p className="td-day-desc">{day.description}</p>}
                        <div className="td-day-facts">
                          {day.meals         && <span className="td-day-fact">🍽 {day.meals}</span>}
                          {day.accommodation && <span className="td-day-fact">🏕 {day.accommodation}</span>}
                          {day.elevation     && <span className="td-day-fact">⛰ {Number(day.elevation).toLocaleString()}m</span>}
                          {day.walkingHours  && <span className="td-day-fact">🚶 {day.walkingHours}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {trek.itinerary?.some(d=>d.elevation) && (
              <div className="td-section">
                <div className="td-section-title">📈 Altitude Graph</div>
                <div className="td-alt-chart"><AltitudeChart itinerary={trek.itinerary} /></div>
              </div>
            )}

            {(trek.priceIncludes?.length > 0 || trek.priceExcludes?.length > 0) && (
              <div className="td-section">
                <div className="td-section-title">✅ What's Included / Excluded</div>
                <div className="td-inc-grid">
                  {trek.priceIncludes?.filter(Boolean).length > 0 && (
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#15803d', marginBottom:10 }}>✅ Included</div>
                      <ul className="td-inc-list">
                        {trek.priceIncludes.filter(Boolean).map((item,i) => <li key={i} className="td-inc-item"><span className="td-inc-dot">✓</span>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {trek.priceExcludes?.filter(Boolean).length > 0 && (
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#dc2626', marginBottom:10 }}>❌ Excluded</div>
                      <ul className="td-inc-list">
                        {trek.priceExcludes.filter(Boolean).map((item,i) => <li key={i} className="td-inc-item"><span className="td-inc-dot" style={{ color:'#dc2626' }}>✗</span>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {trek.gearList?.filter(Boolean).length > 0 && (
              <div className="td-section">
                <div className="td-section-title">🎒 Recommended Gear</div>
                <div className="td-gear-grid">
                  {trek.gearList.filter(Boolean).map((item,i) => (
                    <div key={i} className="td-gear-item">
                      <span style={{ color:'#16a34a', flexShrink:0 }}>({i+1})</span>
                      <span style={{ fontSize:13, color:'#374151' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trek.permits?.filter(Boolean).length > 0 && (
              <div className="td-section">
                <div className="td-section-title">📄 Permits Required</div>
                <div>{trek.permits.filter(Boolean).map((p,i) => <span key={i} className="td-permit-tag">✓ {p}</span>)}</div>
              </div>
            )}

            {trek.faqs?.filter(f=>f.question).length > 0 && (
              <div className="td-section">
                <div className="td-section-title">❓ FAQs</div>
                {trek.faqs.filter(f=>f.question).map((faq,i) => (
                  <div key={i} className="td-faq">
                    <div className="td-faq-q" onClick={()=>toggleFaq(i)}>
                      <span>{faq.question}</span><span>{openFaqs[i]?'▲':'▼'}</span>
                    </div>
                    {openFaqs[i] && <div className="td-faq-a">{faq.answer}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="td-sidebar">
            <div className="td-price-card">
              <div className="td-price-from">From</div>
              <div className="td-price-val">NPR {basePrice.toLocaleString()}</div>
              <div className="td-price-per">per person</div>
              {trek.priceUSD && <div className="td-price-usd">≈ USD {trek.priceUSD.toLocaleString()}</div>}

              {/* ── Phase 2: Guide Picker ── */}
              <div className="td-guide-picker-wrap">
                <div className="td-guide-picker-title">🧭 Add a Guide</div>
                <GuidePicker
                  duration={trek.duration || 1}
                  onGuideSelect={handleGuideSelect}
                />
              </div>

              {/* Price breakdown */}
              {selectedGuide && (
                <div className="td-price-breakdown">
                  <div className="td-price-breakdown-row">
                    <span>Trek</span>
                    <span>NPR {basePrice.toLocaleString()}</span>
                  </div>
                  <div className="td-price-breakdown-row">
                    <span>Guide ({trek.duration} days)</span>
                    <span>+NPR {guideFeeTotal.toLocaleString()}</span>
                  </div>
                  <div className="td-price-breakdown-row total">
                    <span>Total</span>
                    <span>NPR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button
                className="td-book-btn"
                disabled={!canBook}
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  setShowBookingModal(true);
                }}
              >
                {!canBook ? '⚠️ Select a guide first' : `Book · NPR ${totalPrice.toLocaleString()}`}
              </button>

              <Link to="/contact" className="td-enquire-btn">Make an Enquiry</Link>
            </div>

            <div className="td-info-card">
              <div className="td-info-title">Trip Details</div>
              {[
                { key:'Duration',     val:trek.duration    ?`${trek.duration} Days`:null },
                { key:'Max Altitude', val:trek.maxAltitude ?`${trek.maxAltitude.toLocaleString()}m`:null },
                { key:'Difficulty',   val:trek.difficulty },
                { key:'Best Season',  val:trek.bestSeason },
                { key:'Trip Type',    val:trek.tripType },
                { key:'Start',        val:trek.startPoint },
                { key:'End',          val:trek.endPoint },
                { key:'Group Size',   val:trek.groupSize },
              ].filter(r=>r.val).map((r,i) => (
                <div key={i} className="td-info-row">
                  <span className="td-info-key">{r.key}</span>
                  <span className="td-info-val">{r.val}</span>
                </div>
              ))}
            </div>

            {trek.region && (
              <Link to={`/destinations/${trek.region.slug}`} style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #e5f0e8', borderRadius:12, padding:'14px 16px', textDecoration:'none', color:'#0f172a', fontSize:13, fontWeight:600 }}>
                <span>🗺</span>
                <div>
                  <div>More treks in</div>
                  <div style={{ color:'#16a34a' }}>{trek.region.name} →</div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* SIMILAR TREKS */}
        {similar.length > 0 && (
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 48px' }}>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'#0f172a', marginBottom:4 }}>Similar Trips</h2>
            <div className="td-similar-grid">
              {similar.map(t => {
                const img = getImg(t.coverImage||t.images?.[0]);
                return (
                  <Link key={t._id} to={`/treks/${t.slug}`} className="td-sim-card">
                    <div className="td-sim-img">
                      {img ? <img src={img} alt={t.name} onError={e=>e.target.style.display='none'} /> : null}
                      <div className="td-sim-placeholder" style={{ display:img?'none':'flex' }}>🏔</div>
                    </div>
                    <div className="td-sim-body">
                      <div className="td-sim-name">{t.name}</div>
                      <div className="td-sim-meta">
                        {t.duration   && <span>{t.duration} days</span>}
                        {t.difficulty && <span>{t.difficulty}</span>}
                      </div>
                      {t.price && <div className="td-sim-price">NPR {t.price.toLocaleString()}/person</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showBookingModal && (
        <BookingModal
          type="trek"
          item={trek}
          guideId={selectedGuide?._id || null}
          guideRequested={guideRequested}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
}
