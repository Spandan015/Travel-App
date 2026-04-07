import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
.ga-root { font-family:'Roboto',sans-serif; }
.ga-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
.ga-filter-btn { padding:8px 18px; border-radius:20px; border:1.5px solid #e5f0e8; background:#fff; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; color:#6b7280; }
.ga-filter-btn.active { background:#16a34a; border-color:#16a34a; color:#fff; }
.ga-filter-btn:hover:not(.active) { border-color:#16a34a; color:#16a34a; }
.ga-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
.ga-card { background:#fff; border-radius:16px; border:1px solid #e5f0e8; padding:20px; box-shadow:0 2px 8px rgba(22,163,74,0.05); transition:box-shadow 0.2s; }
.ga-card:hover { box-shadow:0 8px 24px rgba(22,163,74,0.1); }
.ga-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
.ga-name { font-size:15px; font-weight:700; color:#0a2818; }
.ga-email { font-size:12px; color:#6b7280; margin-top:2px; }
.ga-badge { padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; text-transform:capitalize; }
.ga-badge.pending { background:#fef9c3; color:#a16207; }
.ga-badge.approved { background:#f0fdf4; color:#16a34a; }
.ga-badge.rejected { background:#fef2f2; color:#dc2626; }
.ga-info-row { font-size:13px; color:#374151; margin-bottom:6px; }
.ga-info-row strong { color:#0a2818; }
.ga-tags { display:flex; flex-wrap:wrap; gap:5px; margin:8px 0; }
.ga-tag { font-size:11px; padding:3px 8px; border-radius:10px; background:#f0fdf4; color:#15803d; border:1px solid #d1fae5; font-weight:500; }
.ga-btns { display:flex; gap:8px; margin-top:14px; }
.ga-btn { flex:1; padding:9px; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; border:none; transition:all 0.15s; }
.ga-btn-view { background:#f0fdf4; color:#15803d; border:1.5px solid #d1fae5; }
.ga-btn-view:hover { background:#dcfce7; }
.ga-btn-approve { background:#16a34a; color:#fff; }
.ga-btn-approve:hover { background:#15803d; }
.ga-btn-reject { background:#fef2f2; color:#dc2626; border:1.5px solid #fecaca; }
.ga-btn-reject:hover { background:#fee2e2; }
.ga-btn:disabled { opacity:0.55; cursor:not-allowed; }
.ga-empty { text-align:center; padding:60px 24px; color:#6b7280; font-size:14px; }
.ga-loading { text-align:center; padding:60px 24px; color:#6b7280; }
.ga-spinner { width:36px; height:36px; border:3px solid #d1fae5; border-top:3px solid #16a34a; border-radius:50%; animation:ga-spin 0.9s linear infinite; margin:0 auto 12px; }
@keyframes ga-spin{to{transform:rotate(360deg);}}
.ga-toast { background:#0a2818; color:#fff; border-radius:10px; padding:12px 20px; font-size:13px; font-weight:600; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
.ga-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; backdrop-filter:blur(4px); }
.ga-modal { background:#fff; border-radius:20px; max-width:540px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,0.2); }
.ga-modal-head { padding:22px 24px 16px; border-bottom:1px solid #e5f0e8; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; background:#fff; z-index:2; }
.ga-modal-title { font-size:17px; font-weight:800; color:#0a2818; }
.ga-modal-close { width:32px; height:32px; border-radius:50%; border:1.5px solid #d1fae5; background:none; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; color:#6b7280; transition:all 0.15s; }
.ga-modal-close:hover { background:#f0fdf4; color:#16a34a; }
.ga-modal-body { padding:20px 24px; }
.ga-modal-section { margin-bottom:18px; }
.ga-modal-label { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9ca3af; margin-bottom:6px; display:block; }
.ga-modal-value { font-size:14px; color:#0a2818; font-weight:500; }
.ga-note-input { width:100%; padding:10px 14px; border:1.5px solid #d1fae5; border-radius:10px; font-size:13px; font-family:inherit; color:#0f172a; outline:none; resize:vertical; transition:border 0.15s; box-sizing:border-box; }
.ga-note-input:focus { border-color:#16a34a; }
.ga-modal-btns { display:flex; gap:10px; padding:16px 24px; border-top:1px solid #e5f0e8; }
.ga-modal-approve { flex:1; padding:12px; background:#16a34a; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:background 0.15s; }
.ga-modal-approve:hover { background:#15803d; }
.ga-modal-approve:disabled { opacity:0.6; cursor:not-allowed; }
.ga-modal-reject { flex:1; padding:12px; background:#fef2f2; color:#dc2626; border:1.5px solid #fecaca; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.ga-modal-reject:hover { background:#fee2e2; }
.ga-modal-reject:disabled { opacity:0.6; cursor:not-allowed; }
`;

const STATUS = {
  pending:  { label: 'Pending Review', cls: 'pending' },
  approved: { label: 'Approved',       cls: 'approved' },
  rejected: { label: 'Rejected',       cls: 'rejected' },
};

export default function GuideApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('pending');
  const [selected, setSelected]         = useState(null);
  const [msg, setMsg]                   = useState('');
  const [actionNote, setActionNote]     = useState('');
  const [processing, setProcessing]     = useState(false);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const fetchApps = async () => {
    setLoading(true);
    try {
      // ✅ Now calls /admin/guide-applications which uses the Guide model
      const { data } = await axios.get(
        `${API}/admin/guide-applications?status=${filter}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, [filter]);

  const handleApprove = async (id) => {
    setProcessing(true);
    try {
      // ✅ Now calls /admin/guide-applications/:id/approve
      await axios.put(
        `${API}/admin/guide-applications/${id}/approve`,
        { adminNotes: actionNote },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      notify('✓ Guide approved successfully. They can now log in.');
      setSelected(null);
      fetchApps();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(false);
      setActionNote('');
    }
  };

  const handleReject = async (id) => {
    if (!actionNote.trim()) return notify('⚠️ Please provide a rejection reason');
    setProcessing(true);
    try {
      // ✅ Now calls /admin/guide-applications/:id/reject
      await axios.put(
        `${API}/admin/guide-applications/${id}/reject`,
        { rejectionReason: actionNote },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      notify('Application rejected.');
      setSelected(null);
      fetchApps();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(false);
      setActionNote('');
    }
  };

  return (
    <AdminLayout title="Guide Applications" subtitle="Review and manage guide applications">
      <style>{STYLES}</style>
      <div className="ga-root">
        {msg && <div className="ga-toast">ℹ️ {msg}</div>}

        {/* Filter tabs */}
        <div className="ga-filters">
          {['pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              className={`ga-filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'pending' ? '⏳' : f === 'approved' ? '✅' : '❌'}
              {' '}{f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="ga-loading">
            <div className="ga-spinner" />
            <p>Loading applications…</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="ga-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0a2818', marginBottom: 6 }}>
              No {filter} applications
            </div>
            <div>There are no {filter} guide applications at this time.</div>
          </div>
        ) : (
          <div className="ga-grid">
            {applications.map(app => {
              // ✅ applicationStatus is the correct field on the Guide model
              const sc = STATUS[app.applicationStatus] || STATUS.pending;
              return (
                <div key={app._id} className="ga-card">
                  <div className="ga-card-top">
                    <div>
                      <div className="ga-name">
                        {app.user?.firstName} {app.user?.lastName}
                      </div>
                      <div className="ga-email">{app.user?.email}</div>
                      {app.user?.phone && (
                        <div className="ga-email">📞 {app.user.phone}</div>
                      )}
                    </div>
                    <span className={`ga-badge ${sc.cls}`}>{sc.label}</span>
                  </div>

                  {/* ✅ yearsExperience — correct field name on Guide model */}
                  <div className="ga-info-row">
                    <strong>Experience:</strong> {app.yearsExperience ?? 'N/A'} years
                  </div>
                  <div className="ga-info-row">
                    <strong>Languages:</strong> {app.languages?.join(', ') || 'N/A'}
                  </div>

                  {/* ✅ specializations — correct field name on Guide model */}
                  {app.specializations?.length > 0 && (
                    <div className="ga-tags">
                      {app.specializations.map(s => (
                        <span key={s} className="ga-tag">{s}</span>
                      ))}
                    </div>
                  )}

                  {app.licenseNumber && (
                    <div className="ga-info-row">
                      <strong>License:</strong> {app.licenseNumber}
                    </div>
                  )}

                  <div className="ga-info-row" style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                    Applied: {new Date(app.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>

                  <div className="ga-btns">
                    <button
                      className="ga-btn ga-btn-view"
                      onClick={() => { setSelected(app); setActionNote(''); }}
                    >
                      View Details
                    </button>
                    {app.applicationStatus === 'pending' && (
                      <>
                        <button
                          className="ga-btn ga-btn-approve"
                          onClick={() => handleApprove(app._id)}
                          disabled={processing}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="ga-btn ga-btn-reject"
                          onClick={() => { setSelected(app); setActionNote(''); }}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selected && (
          <div
            className="ga-overlay"
            onClick={e => e.target === e.currentTarget && setSelected(null)}
          >
            <div className="ga-modal">
              <div className="ga-modal-head">
                <div className="ga-modal-title">
                  {selected.user?.firstName} {selected.user?.lastName}
                  <span
                    className={`ga-badge ${STATUS[selected.applicationStatus]?.cls || 'pending'}`}
                    style={{ marginLeft: 10, fontSize: 11 }}
                  >
                    {STATUS[selected.applicationStatus]?.label}
                  </span>
                </div>
                <button className="ga-modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="ga-modal-body">
                <div className="ga-modal-section">
                  <span className="ga-modal-label">Contact</span>
                  <div className="ga-modal-value">✉️ {selected.user?.email}</div>
                  {selected.user?.phone && (
                    <div className="ga-modal-value">📞 {selected.user.phone}</div>
                  )}
                </div>

                <div className="ga-modal-section">
                  <span className="ga-modal-label">Experience & Qualifications</span>
                  <div className="ga-modal-value">
                    🗓️ {selected.yearsExperience ?? 'N/A'} years of experience
                  </div>
                  {selected.licenseNumber && (
                    <div className="ga-modal-value">🪪 License: {selected.licenseNumber}</div>
                  )}
                </div>

                <div className="ga-modal-section">
                  <span className="ga-modal-label">Specializations</span>
                  <div className="ga-tags">
                    {selected.specializations?.map(s => (
                      <span key={s} className="ga-tag">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="ga-modal-section">
                  <span className="ga-modal-label">Languages</span>
                  <div className="ga-tags">
                    {selected.languages?.map(l => (
                      <span key={l} className="ga-tag">{l}</span>
                    ))}
                  </div>
                </div>

                {selected.bio && (
                  <div className="ga-modal-section">
                    <span className="ga-modal-label">Bio</span>
                    <div className="ga-modal-value" style={{ lineHeight: 1.6 }}>
                      {selected.bio}
                    </div>
                  </div>
                )}

                {selected.applicationStatus === 'rejected' && selected.rejectionReason && (
                  <div className="ga-modal-section">
                    <span className="ga-modal-label">Rejection Reason</span>
                    <div className="ga-modal-value" style={{ color: '#dc2626' }}>
                      {selected.rejectionReason}
                    </div>
                  </div>
                )}

                {selected.applicationStatus === 'pending' && (
                  <div className="ga-modal-section">
                    <span className="ga-modal-label">Note / Rejection Reason</span>
                    <textarea
                      className="ga-note-input"
                      rows={3}
                      placeholder="Optional note for approval, or required reason for rejection…"
                      value={actionNote}
                      onChange={e => setActionNote(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {selected.applicationStatus === 'pending' && (
                <div className="ga-modal-btns">
                  <button
                    className="ga-modal-approve"
                    onClick={() => handleApprove(selected._id)}
                    disabled={processing}
                  >
                    {processing ? 'Processing…' : '✓ Approve Guide'}
                  </button>
                  <button
                    className="ga-modal-reject"
                    onClick={() => handleReject(selected._id)}
                    disabled={processing}
                  >
                    {processing ? 'Processing…' : '✕ Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
