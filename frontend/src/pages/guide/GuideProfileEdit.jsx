import { useState } from 'react';
import { User, DollarSign, Globe, Tag, Camera, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import guideDashboardService from '../../services/guideDashboardService';

const SPECIALIZATIONS = [
  'Trekking','Cultural Tours','Photography','Wildlife','Mountaineering',
  'Rafting','Cycling','Yoga & Wellness','Food Tours','Historical Sites',
  'City Tours','Adventure Sports',
];
const LANGUAGES = [
  'Nepali','English','Hindi','Chinese','Japanese',
  'French','German','Spanish','Italian','Korean','Arabic','Russian',
];

function TagSelect({ options, selected, onToggle, color = '#16a34a', bg = '#f0fdf4', borderSel = '#86efac' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: active ? borderSel : '#d1fae5',
              background:   active ? bg        : '#fff',
              color:         active ? color     : '#374151',
              fontFamily: 'inherit', transition: 'all 0.12s',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function GuideProfileEdit() {
  const { user } = useAuth();
  const gp       = user?.guideProfile || {};

  const [form, setForm] = useState({
    bio:          gp.bio           || '',
    hourlyRate:   gp.hourlyRate    || '',
    dailyRate:    gp.dailyRate     || '',
    languages:    gp.languages     || [],
    specialties:  gp.specialties   || [],
    profileImage: gp.profileImage  || user?.profileImage || '',
  });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState({ msg: '', type: 'success' });

  const set  = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const tog  = (field, val) =>
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter((v) => v !== val) : [...p[field], val],
    }));

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bio || form.bio.length < 50)
      return notify('Bio must be at least 50 characters.', 'error');
    if (form.languages.length === 0)
      return notify('Select at least one language.', 'error');
    if (form.specialties.length === 0)
      return notify('Select at least one specialization.', 'error');

    setSaving(true);
    try {
      await guideDashboardService.updateProfile(form);
      notify('✅ Profile updated successfully!');
    } catch (err) {
      notify(err.response?.data?.message || 'Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', border: '1.5px solid #d1fae5',
    borderRadius: 10, fontSize: 14, color: '#0f172a',
    fontFamily: 'inherit', outline: 'none', background: '#fff',
    transition: 'border 0.15s',
  };

  const onFocus = (e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.08)'; };
  const onBlur  = (e) => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a2818', margin: 0 }}>Edit Profile</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Keep your profile complete to attract more bookings.</p>
      </div>

      {toast.msg && (
        <div style={{
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#b91c1c' : '#166534',
          borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600,
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Bio */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <User size={18} color="#16a34a" /> About You
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Bio <span style={{ fontWeight: 400, color: '#9ca3af' }}>(50–500 characters)</span>
              </label>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                onFocus={onFocus}
                onBlur={onBlur}
                rows={5}
                maxLength={500}
                placeholder="Tell tourists about your experience, personality, and what makes you a great guide…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, paddingTop: 12 }}
              />
              <div style={{ fontSize: 12, color: form.bio.length < 50 ? '#ef4444' : '#9ca3af', textAlign: 'right', marginTop: 4 }}>
                {form.bio.length}/500
              </div>
            </div>

            {/* Specializations */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <Tag size={18} color="#16a34a" /> Areas of Expertise
              </div>
              <TagSelect
                options={SPECIALIZATIONS}
                selected={form.specialties}
                onToggle={(v) => tog('specialties', v)}
              />
            </div>

            {/* Languages */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <Globe size={18} color="#16a34a" /> Languages Spoken
              </div>
              <TagSelect
                options={LANGUAGES}
                selected={form.languages}
                onToggle={(v) => tog('languages', v)}
                color="#0d9488"
                bg="#f0fdf9"
                borderSel="#5eead4"
              />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Profile photo */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <Camera size={18} color="#16a34a" /> Profile Photo
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0,
                }}>
                  {form.profileImage
                    ? <img src={form.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    : (user?.firstName?.[0] || 'G').toUpperCase()
                  }
                </div>
                <input
                  type="url"
                  value={form.profileImage}
                  onChange={set('profileImage')}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Profile image URL"
                  style={inputStyle}
                />
                <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
                  Paste a direct image URL.<br />Supported: jpg, png, webp
                </div>
              </div>
            </div>

            {/* Rates */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <DollarSign size={18} color="#16a34a" /> Your Rates
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Hourly Rate (NPR)</label>
                <input
                  type="number" min="0"
                  value={form.hourlyRate}
                  onChange={set('hourlyRate')}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="e.g. 1500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Daily Rate (NPR)</label>
                <input
                  type="number" min="0"
                  value={form.dailyRate}
                  onChange={set('dailyRate')}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="e.g. 8000"
                  style={inputStyle}
                />
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginTop: 12, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                💡 Set competitive rates to attract more bookings. You can update these anytime.
              </div>
            </div>

            {/* User info (read-only) */}
            <div style={{ background: '#f8faf8', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2818', marginBottom: 12 }}>Account Info</div>
              {[
                { label: 'Name',  val: `${user?.firstName || ''} ${user?.lastName || user?.username || ''}`.trim() },
                { label: 'Email', val: user?.email },
                { label: 'Phone', val: user?.phone || '—' },
                { label: 'Role',  val: 'Verified Guide ✓' },
              ].map(({ label, val }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ marginTop: 20 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 32px', background: saving ? '#86efac' : '#16a34a',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            <Save size={18} />
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
