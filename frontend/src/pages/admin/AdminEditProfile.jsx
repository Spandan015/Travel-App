import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const IcoUser   = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoLock   = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoCamera = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoTrash  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;} }
  @keyframes spin   { to{transform:rotate(360deg);} }
  @keyframes shimmer{ 0%,100%{opacity:1;}50%{opacity:0.4;} }

  .ep-root { font-family:'Roboto',sans-serif; animation:fadeUp 0.35s ease; }
  .ep-layout { display:grid; grid-template-columns:1fr 290px; gap:20px; align-items:start; }
  @media(max-width:900px){ .ep-layout{ grid-template-columns:1fr; } }

  .ep-card { background:#fff; border-radius:16px; border:1px solid #EAECF0; overflow:hidden; margin-bottom:20px; }
  .ep-card-head { padding:20px 24px 16px; border-bottom:1px solid #F2F4F7; display:flex; align-items:center; gap:13px; }
  .ep-head-icon { width:40px; height:40px; border-radius:11px; background:#f0fdf4; display:flex; align-items:center; justify-content:center; color:#16a34a; flex-shrink:0; }
  .ep-card-title { font-size:15px; font-weight:800; color:#101828; }
  .ep-card-sub   { font-size:12px; color:#98A2B3; margin-top:2px; }
  .ep-card-body  { padding:24px; }

  .ep-hero { display:flex; align-items:center; gap:18px; padding-bottom:22px; margin-bottom:22px; border-bottom:1px solid #F2F4F7; }
  .ep-hero-avatar { width:68px; height:68px; border-radius:50%; background:linear-gradient(135deg,#16a34a,#4ade80); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:800; color:#fff; flex-shrink:0; box-shadow:0 4px 14px rgba(22,163,74,0.28); overflow:hidden; }
  .ep-hero-avatar img { width:100%; height:100%; object-fit:cover; }
  .ep-hero-name  { font-size:18px; font-weight:800; color:#101828; }
  .ep-hero-badge { display:inline-block; margin-top:5px; font-size:11px; font-weight:700; background:#ECFDF3; color:#16a34a; padding:3px 10px; border-radius:20px; }

  .ep-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:600px){ .ep-grid{ grid-template-columns:1fr; } }
  .ep-full  { grid-column:1/-1; }
  .ep-field { display:flex; flex-direction:column; gap:6px; }
  .ep-label { font-size:12px; font-weight:700; color:#344054; }
  .ep-input { border:1.5px solid #D0D5DD; border-radius:9px; padding:10px 13px; font-size:13px; font-family:'Roboto',sans-serif; color:#101828; outline:none; transition:border-color 0.15s,box-shadow 0.15s; background:#fff; width:100%; }
  .ep-input:focus   { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.12); }
  .ep-input:disabled{ background:#F9FAFB; color:#98A2B3; cursor:not-allowed; }
  .ep-input::placeholder{ color:#C0C8D4; }
  .ep-hint { font-size:11px; color:#98A2B3; margin-top:3px; }

  .ep-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:22px; padding-top:18px; border-top:1px solid #F2F4F7; }
  .ep-btn { padding:10px 22px; border-radius:9px; font-size:13px; font-weight:700; font-family:'Roboto',sans-serif; cursor:pointer; border:none; transition:all 0.15s; display:flex; align-items:center; gap:7px; }
  .ep-btn-cancel{ background:#F2F4F7; color:#344054; }
  .ep-btn-cancel:hover{ background:#E4E7EC; }
  .ep-btn-save{ background:#16a34a; color:#fff; box-shadow:0 2px 8px rgba(22,163,74,0.28); }
  .ep-btn-save:hover:not(:disabled){ background:#15803d; }
  .ep-btn-save:disabled{ opacity:0.6; cursor:not-allowed; }
  .ep-spinner{ width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }

  .ep-alert{ border-radius:10px; padding:11px 15px; font-size:13px; font-weight:500; margin-bottom:16px; }
  .ep-alert.success{ background:#ECFDF3; color:#15803d; border:1px solid #BBF7D0; }
  .ep-alert.error  { background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; }

  /* Photo card */
  .ep-photo-preview { width:100%; aspect-ratio:1; border-radius:14px; overflow:hidden; background:#F2F4F7; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
  .ep-photo-preview img { width:100%; height:100%; object-fit:cover; }
  .ep-photo-initials { font-size:52px; font-weight:800; color:#fff; background:linear-gradient(135deg,#16a34a,#4ade80); width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
  .ep-photo-drop { border:2px dashed #D0D5DD; border-radius:10px; padding:22px 14px; text-align:center; cursor:pointer; transition:all 0.15s; background:#FAFAFA; }
  .ep-photo-drop:hover,.ep-photo-drop.drag{ border-color:#16a34a; background:#f0fdf4; }
  .ep-photo-drop-icon { font-size:28px; margin-bottom:7px; }
  .ep-photo-drop-text { font-size:12px; color:#344054; font-weight:600; }
  .ep-photo-drop-hint { font-size:11px; color:#98A2B3; margin-top:3px; }
  .ep-photo-remove { display:flex; align-items:center; gap:6px; padding:8px 12px; border-radius:8px; border:1.5px solid #FECACA; background:#FEF2F2; color:#DC2626; font-size:12px; font-weight:700; font-family:'Roboto',sans-serif; cursor:pointer; width:100%; justify-content:center; margin-top:10px; transition:all 0.13s; }
  .ep-photo-remove:hover{ background:#fee2e2; }

  .ep-skel{ background:#F2F4F7; border-radius:6px; animation:shimmer 1.4s ease-in-out infinite; }
`;

export default function AdminEditProfile() {
  const navigate      = useNavigate();
  const { updateUser } = useAuth();
  const fileRef       = useRef(null);

  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ firstName:'', lastName:'', username:'', email:'', phone:'', profileImage:'' });
  const [pw,       setPw]       = useState({ current:'', next:'', confirm:'' });
  const [drag,     setDrag]     = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg,      setMsg]      = useState(null);
  const [pwMsg,    setPwMsg]    = useState(null);

  // Fetch fresh data from server on mount — fixes stale data after refresh
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API}/admin/profile`, {
          headers: { Authorization: `Bearer ${token()}` }
        });
        const u = data.user;
        setForm({
          firstName:    u.firstName    || '',
          lastName:     u.lastName     || '',
          username:     u.username     || '',
          email:        u.email        || '',
          phone:        u.phone        || '',
          profileImage: u.profileImage || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Convert file to base64
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMsg({ type:'error', text:'Please select an image file.' }); return; }
    if (file.size > 5 * 1024 * 1024)    { setMsg({ type:'error', text:'Image must be under 5 MB.' });    return; }
    const reader = new FileReader();
    reader.onload = (e) => setForm(f => ({ ...f, profileImage: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // Save profile — also updates AuthContext so avatars update everywhere instantly
  const handleSave = async () => {
    setMsg(null); setSaving(true);
    try {
      const { data } = await axios.put(
        `${API}/admin/profile`,
        {
          firstName:    form.firstName,
          lastName:     form.lastName,
          username:     form.username,
          phone:        form.phone,
          profileImage: form.profileImage,
        },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      // ✅ Update AuthContext + localStorage so all avatars reflect changes immediately
      updateUser(data.user);
      setMsg({ type:'success', text:'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type:'error', text: err?.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePwSave = async () => {
    setPwMsg(null);
    if (!pw.current || !pw.next) { setPwMsg({ type:'error', text:'Please fill in all password fields.' }); return; }
    if (pw.next !== pw.confirm)  { setPwMsg({ type:'error', text:'New passwords do not match.' });          return; }
    if (pw.next.length < 6)      { setPwMsg({ type:'error', text:'Password must be at least 6 characters.' }); return; }
    setSavingPw(true);
    try {
      await axios.put(
        `${API}/admin/change-password`,
        { currentPassword: pw.current, newPassword: pw.next },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setPwMsg({ type:'success', text:'Password changed successfully!' });
      setPw({ current:'', next:'', confirm:'' });
    } catch (err) {
      setPwMsg({ type:'error', text: err?.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSavingPw(false);
    }
  };

  const initial     = (form.firstName?.[0] || form.username?.[0] || 'A').toUpperCase();
  const displayName = [form.firstName, form.lastName].filter(Boolean).join(' ') || form.username || 'Admin';

  return (
    <AdminLayout title="Edit Profile" subtitle="Manage your account details">
      <style>{STYLES}</style>
      <div className="ep-root">
        <div className="ep-layout">

          {/* ── LEFT: Profile Info + Password ── */}
          <div>
            <div className="ep-card">
              <div className="ep-card-head">
                <div className="ep-head-icon"><IcoUser /></div>
                <div>
                  <div className="ep-card-title">Personal Info</div>
                  <div className="ep-card-sub">Update your name, username and contact details</div>
                </div>
              </div>
              <div className="ep-card-body">
                {/* Hero row */}
                <div className="ep-hero">
                  <div className="ep-hero-avatar">
                    {form.profileImage
                      ? <img src={form.profileImage} alt="avatar" onError={e => { e.target.style.display='none'; }} />
                      : initial}
                  </div>
                  <div>
                    <div className="ep-hero-name">{loading ? '—' : displayName}</div>
                    <span className="ep-hero-badge">Administrator</span>
                  </div>
                </div>

                {msg && <div className={`ep-alert ${msg.type}`}>{msg.text}</div>}

                {loading ? (
                  <div className="ep-grid">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`ep-field${i===5?' ep-full':''}`}>
                        <div className="ep-skel" style={{height:12,width:'40%',marginBottom:6,borderRadius:4}}/>
                        <div className="ep-skel" style={{height:40,borderRadius:9}}/>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ep-grid">
                    <div className="ep-field">
                      <label className="ep-label">First Name</label>
                      <input className="ep-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label">Last Name</label>
                      <input className="ep-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label">Username</label>
                      <input className="ep-input" name="username" value={form.username} onChange={handleChange} placeholder="Username" />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label">Phone Number</label>
                      <input className="ep-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+977 98XXXXXXXX" />
                    </div>
                    <div className="ep-field ep-full">
                      <label className="ep-label">Email Address</label>
                      <input className="ep-input" name="email" value={form.email} disabled />
                      <span className="ep-hint">Email cannot be changed. Contact a super-admin if needed.</span>
                    </div>
                  </div>
                )}

                <div className="ep-actions">
                  <button className="ep-btn ep-btn-cancel" onClick={() => navigate('/admin/dashboard')}>Cancel</button>
                  <button className="ep-btn ep-btn-save" onClick={handleSave} disabled={saving || loading}>
                    {saving ? <><span className="ep-spinner"/>Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="ep-card">
              <div className="ep-card-head">
                <div className="ep-head-icon"><IcoLock /></div>
                <div>
                  <div className="ep-card-title">Change Password</div>
                  <div className="ep-card-sub">Keep your account secure with a strong password</div>
                </div>
              </div>
              <div className="ep-card-body">
                {pwMsg && <div className={`ep-alert ${pwMsg.type}`}>{pwMsg.text}</div>}
                <div className="ep-grid">
                  <div className="ep-field ep-full">
                    <label className="ep-label">Current Password</label>
                    <input className="ep-input" type="password" value={pw.current} onChange={e => setPw(p=>({...p,current:e.target.value}))} placeholder="Enter current password" />
                  </div>
                  <div className="ep-field">
                    <label className="ep-label">New Password</label>
                    <input className="ep-input" type="password" value={pw.next} onChange={e => setPw(p=>({...p,next:e.target.value}))} placeholder="Min. 6 characters" />
                  </div>
                  <div className="ep-field">
                    <label className="ep-label">Confirm New Password</label>
                    <input className="ep-input" type="password" value={pw.confirm} onChange={e => setPw(p=>({...p,confirm:e.target.value}))} placeholder="Repeat new password" />
                  </div>
                </div>
                <div className="ep-actions">
                  <button className="ep-btn ep-btn-save" onClick={handlePwSave} disabled={savingPw}>
                    {savingPw ? <><span className="ep-spinner"/>Updating…</> : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Photo upload ── */}
          <div>
            <div className="ep-card">
              <div className="ep-card-head">
                <div className="ep-head-icon"><IcoCamera /></div>
                <div>
                  <div className="ep-card-title">Profile Photo</div>
                  <div className="ep-card-sub">Upload a photo from your device</div>
                </div>
              </div>
              <div className="ep-card-body">
                {/* Preview */}
                <div className="ep-photo-preview">
                  {form.profileImage
                    ? <img src={form.profileImage} alt="profile preview" onError={e => { e.target.style.display='none'; }} />
                    : <div className="ep-photo-initials">{initial}</div>}
                </div>

                {/* Drop zone */}
                <div
                  className={`ep-photo-drop${drag?' drag':''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={handleDrop}
                >
                  <div className="ep-photo-drop-icon">🖼️</div>
                  <div className="ep-photo-drop-text">Click or drag & drop</div>
                  <div className="ep-photo-drop-hint">JPG, PNG, WEBP — max 5 MB</div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display:'none' }}
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </div>

                {/* Remove button */}
                {form.profileImage && (
                  <button
                    className="ep-photo-remove"
                    onClick={() => setForm(f => ({ ...f, profileImage:'' }))}
                  >
                    <IcoTrash /> Remove photo
                  </button>
                )}

                <p style={{fontSize:11,color:'#98A2B3',marginTop:12,textAlign:'center',lineHeight:1.5}}>
                  After uploading, click <strong>Save Changes</strong> to apply everywhere.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
