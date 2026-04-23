import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Clock, Globe, Award, CheckCircle,
  Calendar, Users, DollarSign, ArrowLeft, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import guideService from '../services/guideService';
import guideDashboardService from '../services/guideDashboardService';
import Loading from '../components/Loading';

// Helper — guide data comes as a flat object from getAllGuides
// but getGuideById may return nested. Normalise both shapes.
function normalise(raw) {
  if (!raw) return null;
  const gp = raw.guideProfile || {};
  return {
    _id:             raw._id,
    userId:          raw.userId || raw._id,
    firstName:       raw.firstName  || gp.firstName  || '',
    lastName:        raw.lastName   || gp.lastName   || '',
    username:        raw.username   || '',
    email:           raw.email      || '',
    phone:           raw.phone      || '',
    profileImage:    raw.profileImage || gp.profileImage || '',
    bio:             raw.bio         || gp.bio         || '',
    yearsExperience: raw.yearsExperience ?? gp.experience ?? 0,
    specializations: raw.specializations || gp.specialties || [],
    languages:       raw.languages   || gp.languages   || [],
    hourlyRate:      raw.hourlyRate  ?? gp.hourlyRate  ?? 0,
    dailyRate:       raw.dailyRate   ?? gp.dailyRate   ?? 0,
    availability:    raw.availability ?? gp.availability ?? true,
    rating:          raw.rating      ?? gp.rating      ?? 0,
    totalReviews:    raw.totalReviews ?? gp.totalReviews ?? 0,
    licenseNumber:   raw.licenseNumber || '',
    createdAt:       raw.createdAt,
  };
}

export default function GuideDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [guide,   setGuide]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [form, setForm] = useState({
    startDate:      '',
    endDate:        '',
    durationType:   'daily',
    duration:       1,
    numberOfPeople: 1,
    specialRequests: '',
    tourType:       '',
  });

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await guideService.getGuideById(id);
      setGuide(normalise(data.guide || data));
    } catch (err) {
      console.error('Error fetching guide:', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const totalPrice = () => {
    if (!guide) return 0;
    const rate = form.durationType === 'hourly' ? guide.hourlyRate : guide.dailyRate;
    return (rate || 0) * (form.duration || 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!form.startDate || !form.endDate) {
      notify('Please select start and end dates.', 'error'); return;
    }

    setSubmitting(true);
    try {
      // ✅ Send to /api/guide-bookings with correct field names
      const payload = {
        guide:          guide.userId || guide._id,  // the guide's User _id
        startDate:      form.startDate,
        endDate:        form.endDate,
        durationType:   form.durationType,
        duration:       Number(form.duration),
        numberOfPeople: Number(form.numberOfPeople),
        specialRequests: form.specialRequests,
        tourType:       form.tourType,
      };

      // Use the existing /guide-bookings route (guideBookingController)
      const { default: api } = await import('../services/api');
      await api.post('/guide-bookings', payload);

      notify('✅ Booking request sent! The guide will respond soon.');
      setShowForm(false);
      setForm({ startDate: '', endDate: '', durationType: 'daily', duration: 1, numberOfPeople: 1, specialRequests: '', tourType: '' });
    } catch (err) {
      notify(err.response?.data?.message || 'Error sending booking request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  if (!guide) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faf8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <h2 style={{ fontWeight: 800, color: '#0a2818', marginBottom: 8 }}>Guide Not Found</h2>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>This guide doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/browse-guides')} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          ← Back to Guides
        </button>
      </div>
    </div>
  );

  const name = `${guide.firstName} ${guide.lastName}`.trim() || guide.username || 'Guide';

  return (
    <div style={{ minHeight: '100vh', background: '#f8faf8', fontFamily: "'Roboto', sans-serif", paddingBottom: 60 }}>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#b91c1c' : '#166534',
          padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%)', padding: '40px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button onClick={() => navigate('/browse-guides')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 28, fontFamily: 'inherit' }}>
            <ArrowLeft size={14} /> Browse Guides
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', fontWeight: 800, flexShrink: 0, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.2)' }}>
              {guide.profileImage
                ? <img src={guide.profileImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : name.charAt(0).toUpperCase()
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: 0 }}>{name}</h1>
                {guide.licenseNumber && (
                  <span style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    ✓ Licensed
                  </span>
                )}
              </div>

              {/* Rating */}
              {guide.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={14} fill={n <= Math.round(guide.rating) ? '#fbbf24' : 'none'} color={n <= Math.round(guide.rating) ? '#fbbf24' : 'rgba(255,255,255,0.3)'} />
                  ))}
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{guide.rating.toFixed(1)} ({guide.totalReviews} reviews)</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {guide.yearsExperience > 0 && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>🗓 {guide.yearsExperience} yrs experience</span>}
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: guide.availability ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)', color: guide.availability ? '#4ade80' : '#f87171', border: `1px solid ${guide.availability ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {guide.availability ? '● Available' : '● Unavailable'}
                </span>
              </div>
            </div>

            {/* Rates + Book button */}
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '20px 28px', backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                {guide.hourlyRate > 0 && (
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Per Hour</div>
                    <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 800 }}>NPR {guide.hourlyRate}</div>
                  </div>
                )}
                {guide.dailyRate > 0 && (
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Per Day</div>
                    <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 800 }}>NPR {guide.dailyRate}</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setShowForm(true); }}
                disabled={!guide.availability}
                style={{
                  width: '100%', padding: '12px 24px', borderRadius: 12,
                  background: guide.availability ? '#16a34a' : '#6b7280',
                  color: '#fff', border: 'none', fontWeight: 800, fontSize: 15,
                  cursor: guide.availability ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                }}
              >
                {guide.availability ? 'Book This Guide' : 'Currently Unavailable'}
              </button>
              {!isAuthenticated && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 6 }}>Login required to book</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: '-24px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Bio */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 24 }}>
              <h2 style={{ fontWeight: 800, fontSize: 17, color: '#0a2818', marginBottom: 14 }}>About</h2>
              <p style={{ color: '#374151', lineHeight: 1.7, fontSize: 14 }}>{guide.bio || 'No bio available.'}</p>
            </div>

            {/* Specializations */}
            {guide.specializations.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: 17, color: '#0a2818', marginBottom: 14 }}>Specializations</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {guide.specializations.map((s) => (
                    <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #d1fae5', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {guide.languages.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: 17, color: '#0a2818', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={18} color="#16a34a" /> Languages
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {guide.languages.map((l) => (
                    <span key={l} style={{ background: '#f0fdf9', color: '#0d9488', border: '1px solid #5eead4', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 14 }}>Guide Info</h3>
              {[
                { icon: Award,   label: 'Experience',  val: guide.yearsExperience ? `${guide.yearsExperience} years` : 'N/A' },
                { icon: Star,    label: 'Rating',      val: guide.rating > 0 ? `${guide.rating.toFixed(1)} / 5` : 'No reviews yet' },
                { icon: Users,   label: 'Reviews',     val: `${guide.totalReviews} total` },
                { icon: Calendar,label: 'Member since',val: guide.createdAt ? new Date(guide.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A' },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0fdf4' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2818' }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setShowForm(true); }}
              disabled={!guide.availability}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: guide.availability ? '#16a34a' : '#d1d5db',
                color: '#fff', border: 'none', fontWeight: 800, fontSize: 15,
                cursor: guide.availability ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              }}
            >
              {guide.availability ? '📅 Book This Guide' : 'Currently Unavailable'}
            </button>
          </div>
        </div>
      </div>

      {/* ── BOOKING MODAL ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

            {/* Modal header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5f0e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#0a2818' }}>Book {name}</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Duration type */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Booking Type</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['hourly', 'daily'].map((t) => (
                      <button key={t} type="button"
                        onClick={() => setForm((p) => ({ ...p, durationType: t }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                          cursor: 'pointer', border: '1.5px solid', fontFamily: 'inherit',
                          background: form.durationType === t ? '#f0fdf4' : '#fff',
                          borderColor: form.durationType === t ? '#16a34a' : '#d1fae5',
                          color: form.durationType === t ? '#15803d' : '#374151',
                        }}
                      >
                        {t === 'hourly' ? `Hourly (NPR ${guide.hourlyRate}/hr)` : `Daily (NPR ${guide.dailyRate}/day)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Start Date *</label>
                    <input type="date" required value={form.startDate} min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>End Date *</label>
                    <input type="date" required value={form.endDate} min={form.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                  </div>
                </div>

                {/* Duration + People */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                      Duration ({form.durationType === 'hourly' ? 'hours' : 'days'}) *
                    </label>
                    <input type="number" required min="1" max={form.durationType === 'hourly' ? 12 : 30}
                      value={form.duration}
                      onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Number of People *</label>
                    <input type="number" required min="1" max="20"
                      value={form.numberOfPeople}
                      onChange={(e) => setForm((p) => ({ ...p, numberOfPeople: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                  </div>
                </div>

                {/* Tour type */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Tour Type</label>
                  <select value={form.tourType} onChange={(e) => setForm((p) => ({ ...p, tourType: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
                    <option value="">Select type (optional)</option>
                    {['Trekking','Cultural Tour','City Tour','Food Tour','Adventure','Photography','Wildlife'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Special requests */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Special Requests</label>
                  <textarea rows={3} value={form.specialRequests}
                    onChange={(e) => setForm((p) => ({ ...p, specialRequests: e.target.value }))}
                    placeholder="Any special requirements…"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
                </div>

                {/* Price summary */}
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#166534', fontSize: 14 }}>Estimated Total</span>
                    <span style={{ fontWeight: 800, fontSize: 20, color: '#16a34a' }}>NPR {totalPrice().toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {form.duration} {form.durationType === 'hourly' ? 'hour(s)' : 'day(s)'} × NPR {form.durationType === 'hourly' ? guide.hourlyRate : guide.dailyRate}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={submitting}
                  style={{
                    width: '100%', padding: '14px', background: submitting ? '#86efac' : '#16a34a',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontWeight: 800, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {submitting ? 'Sending request…' : 'Send Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
