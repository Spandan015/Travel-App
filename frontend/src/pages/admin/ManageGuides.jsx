import { useState, useEffect } from 'react';
import {
  Users, CheckCircle, XCircle, RefreshCw,
  Search, Star, Phone, Mail, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

export default function ManageGuides() {
  const [guides,   setGuides]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | active | suspended
  const [search,   setSearch]   = useState('');
  const [toast,    setToast]    = useState('');
  const [suspendModal, setSuspendModal] = useState({ show: false, guide: null, reason: '' });

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/guide-applications/guides?status=${filter}`);
      setGuides(res.data.guides || []);
    } catch { notify('Error loading guides'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const filtered = guides.filter((g) => {
    const name = `${g.firstName || ''} ${g.lastName || ''}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase());
  });

  const handleSuspend = async () => {
    if (!suspendModal.reason.trim()) { notify('Please provide a reason.'); return; }
    try {
      await api.put(`/guide-applications/guides/${suspendModal.guide._id}/suspend`, { reason: suspendModal.reason });
      notify('✅ Guide suspended. Email notification sent.');
      setSuspendModal({ show: false, guide: null, reason: '' });
      load();
    } catch (e) { notify(e.response?.data?.message || 'Error suspending guide'); }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm('Reactivate this guide account?')) return;
    try {
      await api.put(`/guide-applications/guides/${id}/reactivate`);
      notify('✅ Guide reactivated successfully.');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Error reactivating guide'); }
  };

  const counts = {
    all:       guides.length,
    active:    guides.filter((g) => g.status === 'active').length,
    suspended: guides.filter((g) => g.status === 'suspended').length,
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", padding: 24, background: '#f8faf8', minHeight: '100vh' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#0a2818', color: '#fff', borderRadius: 10, padding: '12px 20px', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0a2818', margin: 0 }}>Guide Management</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Manage all approved guides — suspend or reactivate accounts.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Guides',  val: counts.all,       color: '#6b7280', bg: '#f9fafb' },
          { label: 'Active',        val: counts.active,    color: '#15803d', bg: '#f0fdf4' },
          { label: 'Suspended',     val: counts.suspended, color: '#b91c1c', bg: '#fef2f2' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 12, padding: '14px 22px', minWidth: 120 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{loading ? '—' : val}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guide by name or email…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'active', 'suspended'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '1.5px solid', fontFamily: 'inherit',
              background: filter === f ? '#16a34a' : '#fff',
              borderColor: filter === f ? '#16a34a' : '#d1fae5',
              color: filter === f ? '#fff' : '#374151',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f0fdf4', border: '1.5px solid #d1fae5', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#16a34a', fontFamily: 'inherit' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Guide cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading guides…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8' }}>
          <Users size={40} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontWeight: 700, color: '#0a2818', marginBottom: 4 }}>No guides found</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Approved guides will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((g) => {
            const name      = `${g.firstName || ''} ${g.lastName || ''}`.trim() || g.username;
            const isActive  = g.status === 'active';
            const gp        = g.guideProfile || {};

            return (
              <div key={g._id} style={{ background: '#fff', borderRadius: 16, border: `1px solid ${isActive ? '#e5f0e8' : '#fecaca'}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* Card header */}
                <div style={{ background: isActive ? 'linear-gradient(135deg,#0a2818,#1a4a2a)' : 'linear-gradient(135deg,#450a0a,#7f1d1d)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                    {gp.profileImage
                      ? <img src={gp.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      : name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>{g.username}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                    background: isActive ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)',
                    color: isActive ? '#4ade80' : '#f87171',
                    border: `1px solid ${isActive ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {isActive ? '● Active' : '● Suspended'}
                  </span>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                      <Mail size={13} color="#16a34a" />{g.email}
                    </div>
                    {g.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                        <Phone size={13} color="#16a34a" />{g.phone}
                      </div>
                    )}
                    {gp.rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        {gp.rating?.toFixed(1)} ({gp.totalReviews || 0} reviews)
                      </div>
                    )}
                  </div>

                  {gp.specialties?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                      {gp.specialties.slice(0, 3).map((s) => (
                        <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #d1fae5', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    {isActive ? (
                      <button
                        onClick={() => setSuspendModal({ show: true, guide: g, reason: '' })}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, color: '#b91c1c', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <XCircle size={14} /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(g._id)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, color: '#15803d', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <CheckCircle size={14} /> Reactivate
                      </button>
                    )}
                    <a href={`/guides/${g._id}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', background: '#f8faf8', border: '1.5px solid #e5f0e8', borderRadius: 10, color: '#374151', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suspend modal */}
      {suspendModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AlertCircle size={20} color="#b91c1c" />
              <div style={{ fontWeight: 800, fontSize: 17, color: '#0a2818' }}>Suspend Guide</div>
            </div>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              Suspending <strong>{`${suspendModal.guide?.firstName} ${suspendModal.guide?.lastName}`.trim()}</strong> will disable their account and notify them by email. They will not be able to accept new bookings.
            </p>
            <textarea
              value={suspendModal.reason}
              onChange={(e) => setSuspendModal((p) => ({ ...p, reason: e.target.value }))}
              rows={3}
              placeholder="Reason for suspension (will be included in email)…"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1.5px solid #fca5a5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSuspend} style={{ flex: 1, padding: 12, background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Confirm Suspension
              </button>
              <button onClick={() => setSuspendModal({ show: false, guide: null, reason: '' })} style={{ flex: 1, padding: 12, background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
