import { useState, useRef } from 'react';
import { User, DollarSign, Globe, Tag, Camera, Save, Upload, Link, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import guideService from '../../services/guideService';

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
              background:   active ? bg       : '#fff',
              color:        active ? color    : '#374151',
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

function Toast({ msg, type }) {
  if (!msg) return null;
  const isError = type === 'error';
  return (
    <div style={{
      background: isError ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${isError ? '#fca5a5' : '#86efac'}`,
      color: isError ? '#b91c1c' : '#166534',
      borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600,
      marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {msg}
    </div>
  );
}

// Resolve relative backend URLs to full URLs for display
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE}${url}`;
};

export default function GuideProfileEdit() {
  const { user, updateUser } = useAuth();
  const gp = user?.guideProfile || {};
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName:    user?.firstName    || '',
    lastName:     user?.lastName     || '',
    phone:        user?.phone        || '',
    bio:          gp.bio             || '',
    hourlyRate:   gp.hourlyRate      || '',
    dailyRate:    gp.dailyRate       || '',
    languages:    gp.languages       || [],
    specialties:  gp.specialties     || [],
    profileImage: gp.profileImage    || user?.profileImage || '',
  });

  const [imageMode,    setImageMode]    = useState('url'); // 'url' | 'upload'
  const [imagePreview, setImagePreview] = useState(getImageUrl(form.profileImage));
  const [imageFile,    setImageFile]    = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState({ msg: '', type: 'success' });

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const tog = (field, val) =>
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(val)
        ? p[field].filter((v) => v !== val)
        : [...p[field], val],
    }));

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
  };

  // Handle device file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Only image files are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify('Image must be under 5MB.', 'error');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setForm((p) => ({ ...p, profileImage: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setForm((p) => ({ ...p, profileImage: url }));
    setImagePreview(url);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm((p) => ({ ...p, profileImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) return notify('First name is required.', 'error');
    if (!form.bio || form.bio.length < 50)
      return notify('Bio must be at least 50 characters.', 'error');
    if (form.languages.length === 0)
      return notify('Select at least one language.', 'error');
    if (form.specialties.length === 0)
      return notify('Select at least one specialization.', 'error');

    setSaving(true);
    try {
      // If uploading a file, use FormData; otherwise send JSON
      let result;
      if (imageFile) {
        const fd = new FormData();
        fd.append('profileImage', imageFile);
        fd.append('firstName',  form.firstName);
        fd.append('lastName',   form.lastName);
        fd.append('phone',      form.phone);
        fd.append('bio',        form.bio);
        fd.append('hourlyRate', form.hourlyRate);
        fd.append('dailyRate',  form.dailyRate);
        fd.append('languages',  JSON.stringify(form.languages));
        fd.append('specialties', JSON.stringify(form.specialties));
        result = await guideService.updateMyProfile(fd, true); // true = multipart
      } else {
        result = await guideService.updateMyProfile(form, false);
      }

      // Update auth context + localStorage so sidebar/topbar reflect changes immediately
      if (result?.user) {
        updateUser(result.user);
        // Update preview to the saved image (convert relative → full URL)
        const savedImg = result.user?.profileImage || result.user?.guideProfile?.profileImage;
        if (savedImg) setImagePreview(getImageUrl(savedImg));
        setImageFile(null); // clear file state
      }

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
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
          Keep your profile complete to attract more bookings.
        </p>
      </div>

      <Toast msg={toast.msg} type={toast.type} />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Personal Info */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <User size={18} color="#16a34a" /> Personal Info
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    First Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text" value={form.firstName} onChange={set('firstName')}
                    onFocus={onFocus} onBlur={onBlur}
                    placeholder="First name" style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Last Name
                  </label>
                  <input
                    type="text" value={form.lastName} onChange={set('lastName')}
                    onFocus={onFocus} onBlur={onBlur}
                    placeholder="Last name" style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Phone Number
                </label>
                <input
                  type="tel" value={form.phone} onChange={set('phone')}
                  onFocus={onFocus} onBlur={onBlur}
                  placeholder="e.g. +977-98XXXXXXXX" style={inputStyle}
                />
              </div>
            </div>

            {/* Bio */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <User size={18} color="#16a34a" /> About You
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Bio <span style={{ fontWeight: 400, color: '#9ca3af' }}>(50–500 characters)</span>
              </label>
              <textarea
                value={form.bio} onChange={set('bio')}
                onFocus={onFocus} onBlur={onBlur}
                rows={5} maxLength={500}
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
                color="#0d9488" bg="#f0fdf9" borderSel="#5eead4"
              />
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Profile Photo */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <Camera size={18} color="#16a34a" /> Profile Photo
              </div>

              {/* Avatar preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0,
                  border: '3px solid #d1fae5', position: 'relative',
                }}>
                  {imagePreview
                    ? <img src={getImageUrl(imagePreview)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImagePreview('')} />
                    : (user?.firstName?.[0] || 'G').toUpperCase()
                  }
                </div>
                {imagePreview && (
                  <button type="button" onClick={clearImage} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'none', border: '1px solid #fca5a5', color: '#ef4444',
                    borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <X size={12} /> Remove photo
                  </button>
                )}
              </div>

              {/* Mode toggle */}
              <div style={{ display: 'flex', borderRadius: 10, border: '1.5px solid #d1fae5', overflow: 'hidden', marginTop: 14, marginBottom: 12 }}>
                {[
                  { key: 'upload', icon: <Upload size={13} />, label: 'Upload' },
                  { key: 'url',    icon: <Link size={13} />,    label: 'URL'    },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key} type="button"
                    onClick={() => setImageMode(key)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: 'none', fontFamily: 'inherit',
                      background: imageMode === key ? '#16a34a' : '#fff',
                      color:      imageMode === key ? '#fff'    : '#374151',
                      transition: 'all 0.15s',
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* Upload from device */}
              {imageMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '2px dashed #86efac', borderRadius: 10,
                      background: '#f0fdf4', color: '#16a34a',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
                  >
                    <Upload size={15} />
                    {imageFile ? imageFile.name : 'Choose from device'}
                  </button>
                  <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 6 }}>
                    JPG, PNG, WEBP — max 5MB
                  </div>
                </div>
              )}

              {/* URL input */}
              {imageMode === 'url' && (
                <div>
                  <input
                    type="url"
                    value={imageMode === 'url' ? form.profileImage : ''}
                    onChange={handleUrlChange}
                    onFocus={onFocus} onBlur={onBlur}
                    placeholder="https://example.com/photo.jpg"
                    style={inputStyle}
                  />
                  <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
                    Paste a direct image URL (jpg, png, webp)
                  </div>
                </div>
              )}
            </div>

            {/* Rates */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>
                <DollarSign size={18} color="#16a34a" /> Your Rates
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Hourly Rate (NPR)
                </label>
                <input
                  type="number" min="0" value={form.hourlyRate} onChange={set('hourlyRate')}
                  onFocus={onFocus} onBlur={onBlur}
                  placeholder="e.g. 1500" style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Daily Rate (NPR)
                </label>
                <input
                  type="number" min="0" value={form.dailyRate} onChange={set('dailyRate')}
                  onFocus={onFocus} onBlur={onBlur}
                  placeholder="e.g. 8000" style={inputStyle}
                />
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginTop: 12, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                💡 Set competitive rates to attract more bookings.
              </div>
            </div>

            {/* Account info (read-only) */}
            <div style={{ background: '#f8faf8', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2818', marginBottom: 12 }}>Account Info</div>
              {[
                { label: 'Email', val: user?.email },
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

        {/* Save button */}
        <div style={{ marginTop: 20 }}>
          <button
            type="submit" disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 32px',
              background: saving ? '#86efac' : 'linear-gradient(135deg,#16a34a,#15803d)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
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
