import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import hotelService from '../services/hotelService';
import MapView from '../components/MapView';
import BookingModal from '../components/BookingModal';

const AMENITY_ICONS = {
  'WiFi':'📶','Pool':'🏊','Gym':'🏋️','Restaurant':'🍽️','Bar':'🍸',
  'Spa':'💆','Parking':'🅿️','Room Service':'🛎️','Airport Shuttle':'🚌',
  'Laundry':'🧺','AC':'❄️','Heating':'🔥','TV':'📺','Safe':'🔒','Balcony':'🌅',
};

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
:root {
  --blue:#1B4F8A; --blue-dark:#0F3362; --blue-light:#EEF4FB;
  --text:#1E2D3D; --muted:#6b7c93; --border:#E4ECF3; --bg:#F5F9FF;
}
.hd-root { font-family:'Roboto',sans-serif; background:var(--bg); padding-top:68px; min-height:100vh; }
.hd-gallery-wrap { position:relative; max-height:400px; overflow:hidden; cursor:pointer; }
.hd-gallery { display:grid; grid-template-columns:2fr 1fr 1fr; grid-template-rows:200px 200px; gap:3px; height:400px; }
.hd-gp { overflow:hidden; position:relative; }
.hd-gp img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; display:block; }
.hd-gp:hover img { transform:scale(1.04); }
.hd-gp-main { grid-column:1; grid-row:1/3; }
.hd-gp:nth-child(2) { grid-column:2; grid-row:1; }
.hd-gp:nth-child(3) { grid-column:3; grid-row:1; }
.hd-gp:nth-child(4) { grid-column:2; grid-row:2; }
.hd-gp:nth-child(5) { grid-column:3; grid-row:2; position:relative; }
.hd-gallery-more-btn { position:absolute; bottom:12px; right:12px; background:rgba(255,255,255,0.92); color:#1E2D3D; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:700; backdrop-filter:blur(4px); border:1px solid rgba(0,0,0,0.1); cursor:pointer; }
@media(max-width:768px){
  .hd-gallery { grid-template-columns:1fr; grid-template-rows:260px; }
  .hd-gp-main { grid-column:1; grid-row:1; }
  .hd-gp:nth-child(n+2) { display:none; }
  .hd-gallery-wrap { max-height:260px; }
}
.hd-lightbox { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:1000; display:flex; align-items:center; justify-content:center; }
.hd-lightbox-img { max-width:90vw; max-height:85vh; object-fit:contain; border-radius:8px; }
.hd-lightbox-close { position:absolute; top:20px; right:24px; background:rgba(255,255,255,0.1); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.hd-lightbox-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; color:#fff; width:48px; height:48px; border-radius:50%; font-size:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
.hd-lightbox-nav:hover { background:rgba(255,255,255,0.2); }
.hd-lightbox-prev { left:20px; }
.hd-lightbox-next { right:20px; }
.hd-lightbox-count { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); color:rgba(255,255,255,0.7); font-size:13px; }
.hd-nav-tabs { background:#fff; border-bottom:1px solid var(--border); position:sticky; top:68px; z-index:40; }
.hd-nav-inner { max-width:1180px; margin:0 auto; padding:0 24px; display:flex; gap:0; }
.hd-nav-tab { padding:14px 18px; font-size:13px; font-weight:600; color:var(--muted); border-bottom:3px solid transparent; cursor:pointer; transition:all 0.15s; white-space:nowrap; background:none; border-top:none; border-left:none; border-right:none; font-family:'Roboto',sans-serif; }
.hd-nav-tab:hover { color:var(--text); }
.hd-nav-tab.active { color:var(--blue); border-bottom-color:var(--blue); }
.hd-header-wrap { max-width:1180px; margin:0 auto; padding:20px 24px 0; }
.hd-breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); margin-bottom:12px; flex-wrap:wrap; }
.hd-breadcrumb a { color:var(--blue); text-decoration:none; }
.hd-header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:6px; flex-wrap:wrap; }
.hd-name { font-size:clamp(1.4rem,3vw,1.9rem); font-weight:800; color:var(--text); margin:0; line-height:1.2; }
.hd-score-wrap { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.hd-score-label { font-size:13px; font-weight:700; color:var(--text); }
.hd-score-pill { background:var(--blue); color:#fff; font-size:17px; font-weight:800; padding:8px 13px; border-radius:8px 8px 8px 0; }
.hd-score-reviews { font-size:11px; color:var(--muted); }
.hd-meta-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:16px; }
.hd-stars { color:#F59E0B; font-size:14px; letter-spacing:1px; }
.hd-location { font-size:13px; color:var(--blue); display:flex; align-items:center; gap:4px; text-decoration:underline; cursor:pointer; }
.hd-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; background:#ECFDF3; color:#027A48; }
.hd-body { max-width:1180px; margin:0 auto; padding:24px; display:grid; grid-template-columns:1fr 340px; gap:24px; align-items:start; }
@media(max-width:960px){ .hd-body { grid-template-columns:1fr; } }
.hd-section { background:#fff; border-radius:12px; border:1px solid var(--border); padding:22px; margin-bottom:16px; }
.hd-section:last-child { margin-bottom:0; }
.hd-section-title { font-size:16px; font-weight:800; color:var(--text); margin:0 0 14px; padding-bottom:12px; border-bottom:1px solid var(--border); }
.hd-desc { font-size:14px; color:var(--muted); line-height:1.8; font-weight:400; }
.hd-read-more { color:var(--blue); font-size:13px; font-weight:600; cursor:pointer; border:none; background:none; padding:0; margin-top:8px; display:block; font-family:'Roboto',sans-serif; }
.hd-highlights { display:flex; flex-direction:column; gap:10px; }
.hd-highlight { display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--text); }
.hd-check { width:20px; height:20px; border-radius:50%; background:#ECFDF3; color:#027A48; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; margin-top:1px; }
.hd-amenities { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
@media(max-width:600px){ .hd-amenities { grid-template-columns:repeat(2,1fr); } }
.hd-amenity { display:flex; align-items:center; gap:9px; font-size:13px; color:var(--text); padding:10px 12px; background:var(--bg); border-radius:9px; border:1px solid var(--border); font-weight:500; }
.hd-policies { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
@media(max-width:600px){ .hd-policies { grid-template-columns:1fr; } }
.hd-policy { padding:14px; background:var(--bg); border-radius:10px; border:1px solid var(--border); }
.hd-policy-icon { font-size:20px; margin-bottom:8px; display:block; }
.hd-policy-label { font-size:12px; font-weight:700; color:var(--text); margin-bottom:3px; }
.hd-policy-val { font-size:12px; color:var(--muted); }
.hd-book-card { background:#fff; border-radius:12px; border:1px solid var(--border); padding:22px; position:sticky; top:120px; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
.hd-book-price { font-size:26px; font-weight:800; color:var(--text); letter-spacing:-0.5px; }
.hd-book-price span { font-size:14px; font-weight:400; color:var(--muted); }
.hd-book-rating { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); margin:6px 0 18px; }
.hd-book-score { background:var(--blue); color:#fff; padding:3px 8px; border-radius:6px; font-size:12px; font-weight:700; }
.hd-book-score-label { font-weight:600; color:var(--text); }
.hd-reserve-btn { width:100%; padding:15px; background:var(--blue); color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:800; cursor:pointer; font-family:'Roboto',sans-serif; transition:all 0.2s; margin-bottom:10px; }
.hd-reserve-btn:hover { background:var(--blue-dark); transform:translateY(-1px); box-shadow:0 6px 20px rgba(27,79,138,0.3); }
.hd-book-note { font-size:11.5px; color:var(--muted); text-align:center; margin-bottom:12px; }
.hd-trust { display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; }
.hd-trust-item { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--muted); }
.hd-prop-highlights { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:16px; }
.hd-prop-hl { background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:500; color:var(--text); }
.hd-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:16px; }
.hd-spinner { width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--blue); border-radius:50%; animation:hdSpin 0.8s linear infinite; }
@keyframes hdSpin { to{transform:rotate(360deg);} }
`;

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  // ✅ BookingModal state instead of inline form
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await hotelService.getHotelById(id);
        setHotel(res.hotel || res);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const fallback = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
  const allImages = hotel
    ? [hotel.mainImage, ...(hotel.images || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)
    : [];

  if (loading) return (
    <><style>{STYLES}</style>
      <div className="hd-root">
        <div className="hd-loading"><div className="hd-spinner" /><p style={{ color: 'var(--muted)', fontFamily: 'Roboto,sans-serif', fontSize: 14 }}>Loading hotel…</p></div>
      </div>
    </>
  );

  if (!hotel) return (
    <><style>{STYLES}</style>
      <div className="hd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 16, fontFamily: 'Roboto,sans-serif' }}>
        <div style={{ fontSize: '3rem' }}>🏨</div>
        <h2 style={{ color: 'var(--text)', fontWeight: 800 }}>Hotel Not Found</h2>
        <Link to="/browse-hotels" style={{ background: 'var(--blue)', color: '#fff', padding: '11px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>← Back to Hotels</Link>
      </div>
    </>
  );

  const TABS = ['overview', 'facilities', 'policies'];

  return (
    <><style>{STYLES}</style>
      <div className="hd-root">

        {/* ── GALLERY ── */}
        <div className="hd-gallery-wrap" onClick={() => setLightboxOpen(true)}>
          <div className="hd-gallery">
            <div className="hd-gp hd-gp-main">
              <img src={allImages[0] || fallback} alt={hotel.name} onError={e => { e.target.src = fallback; }} />
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="hd-gp" style={i >= allImages.length ? { background: '#E4ECF3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' } : {}}>
                {allImages[i]
                  ? <img src={allImages[i]} alt="" onError={e => { e.target.src = fallback; }} />
                  : <span>🏨</span>}
                {i === 4 && allImages.length > 5 && <div className="hd-gallery-more-btn">+{allImages.length - 5} photos</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="hd-lightbox" onClick={() => setLightboxOpen(false)}>
            <button className="hd-lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
            <button className="hd-lightbox-nav hd-lightbox-prev" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + allImages.length) % allImages.length); }}>‹</button>
            <img className="hd-lightbox-img" src={allImages[lightboxIdx] || fallback} alt="" onClick={e => e.stopPropagation()} onError={e => { e.target.src = fallback; }} />
            <button className="hd-lightbox-nav hd-lightbox-next" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % allImages.length); }}>›</button>
            <div className="hd-lightbox-count">{lightboxIdx + 1} / {allImages.length}</div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="hd-header-wrap">
          <div className="hd-breadcrumb">
            <Link to="/">Home</Link> › <Link to="/browse-hotels">Hotels</Link> › <span>{hotel.name}</span>
          </div>
          <div className="hd-header-row">
            <div><h1 className="hd-name">{hotel.name}</h1></div>
            {hotel.rating > 0 && (
              <div className="hd-score-wrap">
                <div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="hd-score-label">{hotel.rating >= 4.5 ? 'Exceptional' : hotel.rating >= 4 ? 'Excellent' : 'Very Good'}</span>
                    <div className="hd-score-reviews">{hotel.totalReviews || 0} reviews</div>
                  </div>
                </div>
                <div className="hd-score-pill">{Number(hotel.rating).toFixed(1)}</div>
              </div>
            )}
          </div>
          <div className="hd-meta-row">
            {(hotel.starRating || hotel.stars) > 0 && <span className="hd-stars">{'★'.repeat(Math.min(hotel.starRating || hotel.stars || 0, 5))}</span>}
            <span className="hd-location">📍 {hotel.address || hotel.location || 'Nepal'}</span>
            {hotel.isActive !== false && <span className="hd-badge">✓ Available</span>}
          </div>
        </div>

        {/* ── NAV TABS ── */}
        <div className="hd-nav-tabs">
          <div className="hd-nav-inner">
            {TABS.map(t => (
              <button key={t} className={`hd-nav-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="hd-body">
          {/* ── LEFT COLUMN ── */}
          <div>
            {hotel.amenities?.length > 0 && (
              <div className="hd-prop-highlights">
                {hotel.amenities.slice(0, 4).map(a => (
                  <div key={a} className="hd-prop-hl">
                    <span style={{ fontSize: 18 }}>{AMENITY_ICONS[a] || '✅'}</span> {a}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'overview' && (
              <>
                <div className="hd-section">
                  <h2 className="hd-section-title">About this property</h2>
                  <p className="hd-desc">
                    {showFullDesc || !hotel.description || hotel.description.length <= 300
                      ? (hotel.description || 'Experience exceptional comfort and hospitality at this beautiful property nestled in the heart of Nepal.')
                      : hotel.description.slice(0, 300) + '…'}
                  </p>
                  {hotel.description?.length > 300 && (
                    <button className="hd-read-more" onClick={() => setShowFullDesc(v => !v)}>
                      {showFullDesc ? 'Show less ▲' : 'Read more ▼'}
                    </button>
                  )}
                </div>

                <div className="hd-section">
                  <h2 className="hd-section-title">Why guests love it</h2>
                  <div className="hd-highlights">
                    {[
                      hotel.location && `Excellent location — ${hotel.location}`,
                      hotel.amenities?.includes('WiFi') && 'Free WiFi throughout the property',
                      hotel.amenities?.includes('Pool') && 'Swimming pool available',
                      hotel.amenities?.includes('Restaurant') && 'On-site restaurant',
                      hotel.amenities?.includes('Spa') && 'Full-service spa & wellness',
                      (hotel.starRating || hotel.stars) >= 4 && `${hotel.starRating || hotel.stars}-star rated property`,
                      'Verified by My Travel Buddy',
                    ].filter(Boolean).slice(0, 5).map((h, i) => (
                      <div key={i} className="hd-highlight">
                        <div className="hd-check">✓</div><span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(hotel.phone || hotel.email || hotel.website) && (
                  <div className="hd-section">
                    <h2 className="hd-section-title">Contact</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {hotel.phone   && <div style={{ fontSize: 13, color: 'var(--text)' }}>📞 {hotel.phone}</div>}
                      {hotel.email   && <div style={{ fontSize: 13, color: 'var(--text)' }}>✉️ {hotel.email}</div>}
                      {hotel.website && <a href={hotel.website} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--blue)' }}>🌐 {hotel.website}</a>}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'facilities' && (
              <div className="hd-section">
                <h2 className="hd-section-title">Facilities & Amenities</h2>
                {hotel.amenities?.length > 0 ? (
                  <div className="hd-amenities">
                    {hotel.amenities.map(a => (
                      <div key={a} className="hd-amenity">
                        <span style={{ fontSize: 16 }}>{AMENITY_ICONS[a] || '✅'}</span> {a}
                      </div>
                    ))}
                  </div>
                ) : <p style={{ fontSize: 13, color: 'var(--muted)' }}>No amenities listed yet.</p>}
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="hd-section">
                <h2 className="hd-section-title">Hotel policies</h2>
                <div className="hd-policies">
                  {[
                    { icon: '🕐', label: 'Check-in',  val: `From ${hotel.checkIn || '14:00'}` },
                    { icon: '🕛', label: 'Check-out', val: `Until ${hotel.checkOut || '12:00'}` },
                    { icon: '👶', label: 'Children',  val: hotel.policies?.childrenAllowed !== false ? 'Children welcome' : 'No children' },
                    { icon: '🐾', label: 'Pets',      val: hotel.policies?.petsAllowed ? 'Pets allowed' : 'No pets' },
                    { icon: '🚬', label: 'Smoking',   val: hotel.policies?.smokingAllowed ? 'Smoking areas available' : 'Non-smoking property' },
                    { icon: '💳', label: 'Payment',   val: 'Pay at property' },
                  ].map(p => (
                    <div key={p.label} className="hd-policy">
                      <span className="hd-policy-icon">{p.icon}</span>
                      <div className="hd-policy-label">{p.label}</div>
                      <div className="hd-policy-val">{p.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (() => {
              const lat = hotel.location?.coordinates?.lat || hotel.coordinates?.latitude || hotel.lat;
              const lng = hotel.location?.coordinates?.lng || hotel.coordinates?.longitude || hotel.lng;
              if (!lat || !lng) return null;
              return (
                <div className="hd-section">
                  <MapView title="📍 Location on Map" height="300px"
                    markers={[{ lat: Number(lat), lng: Number(lng), title: hotel.name, description: hotel.address || hotel.location || 'Nepal', primary: true }]} />
                </div>
              );
            })()}
          </div>

          {/* ── BOOKING CARD ── */}
          <div>
            <div className="hd-book-card">
              <div className="hd-book-price">
                NPR {Number(hotel.pricePerNight || 0).toLocaleString()} <span>/ night</span>
              </div>
              {hotel.rating > 0 && (
                <div className="hd-book-rating">
                  <span className="hd-book-score">{Number(hotel.rating).toFixed(1)}</span>
                  <span className="hd-book-score-label">{hotel.rating >= 4.5 ? 'Exceptional' : 'Excellent'}</span>
                  <span>· {hotel.totalReviews || 0} reviews</span>
                </div>
              )}

              {/* ✅ Single button that opens BookingModal with eSewa */}
              <button
                className="hd-reserve-btn"
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  setShowBookingModal(true);
                }}
              >
                Reserve Now
              </button>

              <p className="hd-book-note">Pay securely with eSewa · Free cancellation available</p>
              <div className="hd-trust">
                <div className="hd-trust-item">🔒 Secure</div>
                <div className="hd-trust-item">✅ Instant confirmation</div>
                <div className="hd-trust-item">🇳🇵 Local support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ BookingModal — handles all booking + eSewa redirect */}
      {showBookingModal && (
        <BookingModal
          type="hotel"
          item={hotel}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
}
