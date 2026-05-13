import { useState, useRef } from 'react';
import {
  X, User, Camera, Upload, Link, Lock, Eye, EyeOff,
  Save, CheckCircle, AlertCircle, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE}${url}`;
};

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16,
      background: type === 'error' ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${type === 'error' ? '#fca5a5' : '#86efac'}`,
      color: type === 'error' ? '#b91c1c' : '#166534',
    }}>
      {type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {msg}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
        borderBottom: active ? '2px solid #16a34a' : '2px solid transparent',
        background: 'none', color: active ? '#16a34a' : '#6b7280',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

export default function UserProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('profile'); // 'profile' | 'password'

  // Profile form
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    profileImage: user?.profileImage || '',
  });
  const [imageMode,    setImageMode]    = useState('url');
  const [imagePreview, setImagePreview] = useState(getImageUrl(user?.profileImage || ''));
  const [imageFile,    setImageFile]    = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState({ msg: '', type: 'success' });

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwToast,  setPwToast]    = useState({ msg: '', type: 'success' });

  const notify   = (msg, type = 'success') => { setToast({ msg, type });   setTimeout(() => setToast({ msg: '' }), 4000); };
  const notifyPw = (msg, type = 'success') => { setPwToast({ msg, type }); setTimeout(() => setPwToast({ msg: '' }), 4000); };

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Only image files allowed.', 'error');
    if (file.size > 5 * 1024 * 1024)     return notify('Image must be under 5MB.', 'error');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => { setImagePreview(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e) => {
    setForm((p) => ({ ...p, profileImage: e.target.value }));
    setImagePreview(e.target.value);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm((p) => ({ ...p, profileImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) return notify('First name is required.', 'error');
    setSaving(true);
    try {
      let result;
      if (imageFile) {
        const fd = new FormData();
        fd.append('profileImage', imageFile);
        fd.append('firstName', form.firstName);
        fd.append('lastName',  form.lastName);
        fd.append('phone',     form.phone);
        const res = await api.put('/auth/profile', fd, { headers: { 'Content-Type': undefined } });
        result = res.data;
      } else {
        const res = await api.put('/auth/profile', {
          firstName: form.firstName,
          lastName:  form.lastName,
          phone:     form.phone,
          profileImage: form.profileImage,
        });
        result = res.data;
      }
      if (result?.user) {
        updateUser(result.user);
        const saved = result.user?.profileImage;
        if (saved) setImagePreview(getImageUrl(saved));
        setImageFile(null);
      }
      notify('✅ Profile updated successfully!');
    } catch (err) {
      notify(err.response?.data?.message || 'Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword)
      return notifyPw('All fields are required.', 'error');
    if (pwForm.newPassword.length < 8)
      return notifyPw('New password must be at least 8 characters.', 'error');
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return notifyPw('New passwords do not match.', 'error');
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      notifyPw('✅ Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      notifyPw(err.response?.data?.message || 'Error changing password.', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px', border: '1.5px solid #d1fae5',
    borderRadius: 10, fontSize: 14, color: '#0f172a',
    fontFamily: 'inherit', outline: 'none', background: '#fff',
    transition: 'border 0.15s',
  };
  const onFocus = (e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.08)'; };
  const onBlur  = (e) => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 1100, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto',
        zIndex: 1101,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        fontFamily: "'Roboto', sans-serif",
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f0fdf4',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#0a2818' }}>My Profile</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Manage your account details</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: 32, height: 32, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={16} color="#374151" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0fdf4' }}>
          <TabBtn active={tab === 'profile'}  onClick={() => setTab('profile')}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <User size={14} /> Profile
            </span>
          </TabBtn>
          <TabBtn active={tab === 'password'} onClick={() => setTab('password')}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Lock size={14} /> Password
            </span>
          </TabBtn>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <Toast msg={toast.msg} type={toast.type} />

              {/* Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#16a34a,#4ade80)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, color: '#fff', fontWeight: 700,
                  overflow: 'hidden', border: '3px solid #d1fae5', marginBottom: 10,
                }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImagePreview('')} />
                    : (user?.firstName?.[0] || 'U').toUpperCase()
                  }
                </div>
                {imagePreview && (
                  <button type="button" onClick={clearImage} style={{
                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                    background: 'none', border: '1px solid #fca5a5', color: '#ef4444',
                    borderRadius: 8, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  }}>
                    <Trash2 size={11} /> Remove
                  </button>
                )}
              </div>

              {/* Photo section */}
              <div style={{ background: '#f8faf8', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#0a2818', marginBottom: 12 }}>
                  <Camera size={14} color="#16a34a" /> Profile Photo
                </div>

                {/* Toggle */}
                <div style={{ display: 'flex', borderRadius: 8, border: '1.5px solid #d1fae5', overflow: 'hidden', marginBottom: 10 }}>
                  {[
                    { key: 'upload', icon: <Upload size={12} />, label: 'Upload' },
                    { key: 'url',    icon: <Link   size={12} />, label: 'URL'    },
                  ].map(({ key, icon, label }) => (
                    <button key={key} type="button" onClick={() => setImageMode(key)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: 'none', fontFamily: 'inherit',
                      background: imageMode === key ? '#16a34a' : '#fff',
                      color:      imageMode === key ? '#fff'    : '#374151',
                      transition: 'all 0.15s',
                    }}>
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {imageMode === 'upload' && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                      width: '100%', padding: '9px 14px',
                      border: '2px dashed #86efac', borderRadius: 8,
                      background: '#f0fdf4', color: '#16a34a',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 7,
                    }}>
                      <Upload size={14} />
                      {imageFile ? imageFile.name : 'Choose from device'}
                    </button>
                    <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 5 }}>JPG, PNG, WEBP — max 5MB</div>
                  </>
                )}

                {imageMode === 'url' && (
                  <input
                    type="url" value={form.profileImage}
                    onChange={handleUrlChange} onFocus={onFocus} onBlur={onBlur}
                    placeholder="https://example.com/photo.jpg"
                    style={inputStyle}
                  />
                )}
              </div>

              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#0a2818', marginBottom: 10 }}>
                <User size={14} color="#16a34a" /> Personal Info
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                    First Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} onFocus={onFocus} onBlur={onBlur} placeholder="First name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Last Name</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} onFocus={onFocus} onBlur={onBlur} placeholder="Last name" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={set('phone')} onFocus={onFocus} onBlur={onBlur} placeholder="+977-98XXXXXXXX" style={inputStyle} />
              </div>

              {/* Read-only email */}
              <div style={{ background: '#f8faf8', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
                <span style={{ fontWeight: 600 }}>Email: </span>{user?.email}
                <span style={{ fontSize: 11, marginLeft: 6, color: '#9ca3af' }}>(cannot be changed)</span>
              </div>

              <button type="submit" disabled={saving} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px', background: saving ? '#86efac' : 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: saving ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
              }}>
                <Save size={16} /> {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          )}

          {/* ── PASSWORD TAB ── */}
          {tab === 'password' && (
            <form onSubmit={handleChangePassword}>
              <Toast msg={pwToast.msg} type={pwToast.type} />

              {[
                { field: 'currentPassword', label: 'Current Password', key: 'current' },
                { field: 'newPassword',     label: 'New Password',     key: 'new'     },
                { field: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' },
              ].map(({ field, label, key }) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                      onFocus={onFocus} onBlur={onBlur}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af',
                      }}
                    >
                      {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                💡 Password must be at least 8 characters long.
              </div>

              <button type="submit" disabled={pwSaving} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px', background: pwSaving ? '#86efac' : 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 15, cursor: pwSaving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: pwSaving ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
              }}>
                <Lock size={16} /> {pwSaving ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
