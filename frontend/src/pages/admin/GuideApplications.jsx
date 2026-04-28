import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, CheckCircle, XCircle, Clock, Search,
  Filter, RefreshCw, FileText, Star, Users
} from 'lucide-react';
import adminService from '../../services/adminService';
import api from '../../services/api';

const STATUS_STYLES = {
  pending:      { bg: '#fffaeb', color: '#b45309', border: '#fcd34d', label: 'Pending',      dot: '#f59e0b' },
  under_review: { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd', label: 'Under Review', dot: '#3b82f6' },
  approved:     { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: 'Approved',     dot: '#16a34a' },
  rejected:     { bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5', label: 'Rejected',     dot: '#ef4444' },
};

const TABS = ['all', 'pending', 'under_review', 'approved', 'rejected'];

export default function GuideApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState('all');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null); // detail modal
  const [toast, setToast]               = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectForm, setRejectForm]     = useState({ show: false, reason: '', id: null });

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/guide-applications?status=${tab}`);
      setApplications(data.data.applications || []);
    } catch { notify('Error loading applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const filtered = applications.filter((a) =>
    !search ||
    a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this application? A temporary password will be sent to the guide.')) return;
    setActionLoading(true);
    try {
      await api.put(`/guide-applications/${id}/approve`, {
        reviewNotes: selected?.reviewNotes || '',
        scores: selected?.scores || {},
      });
      notify('✅ Application approved! Credentials sent to guide email.');
      setSelected(null);
      load();
    } catch (e) {
      notify(e.response?.data?.message || 'Error approving application');
    } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectForm.reason.trim()) { notify('Please provide a rejection reason.'); return; }
    setActionLoading(true);
    try {
      await api.put(`/guide-applications/${rejectForm.id}/reject`, {
        rejectionReason: rejectForm.reason,
        reviewNotes: selected?.reviewNotes || '',
      });
      notify('Application rejected. Email sent to applicant.');
      setRejectForm({ show: false, reason: '', id: null });
      setSelected(null);
      load();
    } catch (e) {
      notify(e.response?.data?.message || 'Error rejecting application');
    } finally { setActionLoading(false); }
  };

  const handleMarkReview = async (id) => {
    try {
      await api.put(`/guide-applications/${id}/review`);
      notify('Marked as under review.');
      load();
    } catch {}
  };

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/guide-applications/${id}`);
      setSelected(res.data.application);
    } catch { notify('Error loading application details'); }
  };

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? applications.length : applications.filter((a) => a.status === t).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", padding: 24, background: '#f8faf8', minHeight: '100vh' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#0a2818', color: '#fff', borderRadius: 10, padding: '12px 20px', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0a2818', margin: 0 }}>Guide Applications</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Review, approve or reject guide applications.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',        val: counts.all,          color: '#6b7280', bg: '#f9fafb' },
          { label: 'Pending',      val: counts.pending,      color: '#b45309', bg: '#fffaeb' },
          { label: 'Under Review', val: counts.under_review, color: '#1d4ed8', bg: '#eff6ff' },
          { label: 'Approved',     val: counts.approved,     color: '#15803d', bg: '#f0fdf4' },
          { label: 'Rejected',     val: counts.rejected,     color: '#b91c1c', bg: '#fef2f2' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 12, padding: '12px 20px', minWidth: 100 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{loading ? '—' : val}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '1.5px solid', fontFamily: 'inherit',
              background: tab === t ? '#16a34a' : '#fff',
              borderColor: tab === t ? '#16a34a' : '#d1fae5',
              color: tab === t ? '#fff' : '#374151',
            }}>
              {t === 'under_review' ? 'In Review' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f0fdf4', border: '1.5px solid #d1fae5', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#16a34a', fontFamily: 'inherit' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading applications…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
            <FileText size={40} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontWeight: 700, color: '#0a2818', marginBottom: 4 }}>No applications found</div>
            <div style={{ fontSize: 13 }}>Try changing the filter or search term.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faf8', borderBottom: '1px solid #e5f0e8' }}>
                {['Applicant', 'Experience', 'Specializations', 'Applied', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const st = STATUS_STYLES[a.status] || STATUS_STYLES.pending;
                return (
                  <tr key={a._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0fdf4' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8faf8'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                          {a.documents?.profilePhoto
                            ? <img src={a.documents.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            : (a.fullName?.[0] || 'G').toUpperCase()
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0a2818' }}>{a.fullName}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#374151' }}>{a.yearsExperience || 0} yrs</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(a.specializations || []).slice(0, 2).map((s) => (
                          <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #d1fae5', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{s}</span>
                        ))}
                        {(a.specializations || []).length > 2 && <span style={{ fontSize: 11, color: '#9ca3af' }}>+{a.specializations.length - 2}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12 }}>
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: 11, fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openDetail(a._id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 8, color: '#15803d', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Eye size={12} /> View
                        </button>
                        {a.status === 'pending' && (
                          <button onClick={() => handleMarkReview(a._id)} style={{ padding: '6px 10px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 8, color: '#1d4ed8', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Review
                          </button>
                        )}
                        {(a.status === 'pending' || a.status === 'under_review') && (
                          <>
                            <button onClick={() => handleApprove(a._id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: '#16a34a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => setRejectForm({ show: true, reason: '', id: a._id })} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selected && <ApplicationDetailModal
        application={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={(id) => setRejectForm({ show: true, reason: '', id })}
        onMarkReview={handleMarkReview}
        actionLoading={actionLoading}
      />}

      {/* ── REJECT REASON MODAL ── */}
      {rejectForm.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#0a2818', marginBottom: 16 }}>Rejection Reason</div>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 14 }}>Provide a clear reason. This will be sent to the applicant by email.</p>
            <textarea
              value={rejectForm.reason}
              onChange={(e) => setRejectForm((p) => ({ ...p, reason: e.target.value }))}
              rows={4}
              placeholder="e.g. Missing government ID, insufficient experience details, unverifiable information…"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1.5px solid #fca5a5', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleReject} disabled={actionLoading} style={{ flex: 1, padding: 12, background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
              <button onClick={() => setRejectForm({ show: false, reason: '', id: null })} style={{ flex: 1, padding: 12, background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Application Detail Modal ──────────────────────────────────────────────────
function ApplicationDetailModal({ application: a, onClose, onApprove, onReject, onMarkReview, actionLoading }) {
  const [scores, setScores]   = useState(a.scores || {});
  const [notes,  setNotes]    = useState(a.reviewNotes || '');
  const [saving, setSaving]   = useState(false);

  const st = STATUS_STYLES[a.status] || STATUS_STYLES.pending;

  const saveScores = async () => {
    setSaving(true);
    try {
      await api.put(`/guide-applications/${a._id}/score`, { scores, reviewNotes: notes });
    } catch {} finally { setSaving(false); }
  };

  const ScoreInput = ({ field, label }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', fontWeight: 600, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#16a34a' }}>{scores[field] || '—'}/10</span>
      </div>
      <input type="range" min={1} max={10} value={scores[field] || 5}
        onChange={(e) => setScores((p) => ({ ...p, [field]: Number(e.target.value) }))}
        style={{ width: '100%', accentColor: '#16a34a' }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '20px 16px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 760, width: '100%', marginBottom: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#0a2818,#1a4a2a)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{a.fullName}</div>
            <div style={{ color: '#86efac', fontSize: 13, marginTop: 2 }}>{a.email} · {a.phone}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: 12, fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
              {st.label}
            </span>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>✕ Close</button>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

          {/* Left: full profile */}
          <div>
            {/* Personal */}
            <Section title="👤 Personal Information">
              <Row label="Date of Birth" val={a.dateOfBirth ? new Date(a.dateOfBirth).toLocaleDateString() : 'N/A'} />
              <Row label="Address" val={`${a.address?.city || ''}${a.address?.country ? ', ' + a.address.country : ''}`} />
              <Row label="Applied" val={new Date(a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} />
              {a.reapplicationCount > 0 && <Row label="Reapplications" val={`${a.reapplicationCount} previous`} />}
            </Section>

            {/* Emergency contact */}
            {a.emergencyContact?.name && (
              <Section title="🚨 Emergency Contact">
                <Row label="Name"         val={a.emergencyContact.name} />
                <Row label="Phone"        val={a.emergencyContact.phone} />
                <Row label="Relationship" val={a.emergencyContact.relationship} />
              </Section>
            )}

            {/* Professional */}
            <Section title="💼 Professional Details">
              <Row label="Experience"    val={`${a.yearsExperience || 0} years`} />
              <Row label="Hourly Rate"   val={`NPR ${a.hourlyRate || 0}`} />
              <Row label="Daily Rate"    val={`NPR ${a.dailyRate || 0}`} />
              {a.languages?.length > 0 && <Row label="Languages" val={a.languages.join(', ')} />}
              {a.specializations?.length > 0 && (
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f0fdf4' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Specializations</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {a.specializations.map((s) => (
                      <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #d1fae5', padding: '3px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {a.preferredDestinations?.length > 0 && <Row label="Covers" val={a.preferredDestinations.join(', ')} />}
            </Section>

            {/* Bio */}
            {a.bio && (
              <Section title="📝 Bio / Description">
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{a.bio}</p>
              </Section>
            )}

            {/* Documents */}
            <Section title="📎 Uploaded Documents">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'profilePhoto',  label: 'Profile Photo',    required: true  },
                  { key: 'governmentId',  label: 'Government ID',    required: true  },
                  { key: 'guideLicense',  label: 'Guide License',    required: false },
                  { key: 'cv',            label: 'CV / Portfolio',   required: false },
                ].map(({ key, label, required }) => {
                  const url = a.documents?.[key];
                  return (
                    <div key={key} style={{ background: url ? '#f0fdf4' : '#f9fafb', border: `1px solid ${url ? '#86efac' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</div>
                      {url
                        ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                            {key === 'profilePhoto' ? <img src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.target.style.display = 'none'; }} /> : '📄 View Document'}
                          </a>
                        : <span style={{ fontSize: 12, color: required ? '#ef4444' : '#9ca3af', fontWeight: 600 }}>{required ? '❌ Missing (Required)' : 'Not provided'}</span>
                      }
                    </div>
                  );
                })}
              </div>
              {a.documents?.certifications?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Certifications</div>
                  {a.documents.certifications.map((c, i) => (
                    <a key={i} href={c} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginRight: 8, color: '#16a34a', fontSize: 12, fontWeight: 700 }}>📜 Certificate {i + 1}</a>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Right: scoring + actions */}
          <div>
            {/* Scoring */}
            <div style={{ background: '#f8faf8', borderRadius: 14, border: '1px solid #e5f0e8', padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0a2818', marginBottom: 14 }}>⭐ Admin Scoring</div>
              <ScoreInput field="authenticity"         label="Authenticity" />
              <ScoreInput field="communicationQuality" label="Communication Quality" />
              <ScoreInput field="localExpertise"       label="Local Expertise" />
              <ScoreInput field="safetyConfidence"     label="Safety Confidence" />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Review Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes (not sent to applicant)…"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: '1.5px solid #d1fae5', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                />
              </div>
              <button onClick={saveScores} disabled={saving} style={{ marginTop: 8, width: '100%', padding: '9px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, color: '#15803d', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving…' : '💾 Save Notes & Scores'}
              </button>
            </div>

            {/* Actions */}
            {(a.status === 'pending' || a.status === 'under_review') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {a.status === 'pending' && (
                  <button onClick={() => onMarkReview(a._id)} style={{ padding: '11px', background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: 10, color: '#1d4ed8', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🔍 Mark Under Review
                  </button>
                )}
                <button onClick={() => onApprove(a._id)} disabled={actionLoading} style={{ padding: '11px', background: '#16a34a', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {actionLoading ? 'Processing…' : '✅ Approve & Send Credentials'}
                </button>
                <button onClick={() => onReject(a._id)} disabled={actionLoading} style={{ padding: '11px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, color: '#b91c1c', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ❌ Reject Application
                </button>
              </div>
            )}

            {/* Previous review info */}
            {a.reviewedBy && (
              <div style={{ marginTop: 16, background: '#f8faf8', borderRadius: 10, padding: '12px 14px', fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: '#0a2818', marginBottom: 6 }}>Review History</div>
                <div style={{ color: '#6b7280' }}>Reviewed by: <strong>{a.reviewedBy?.username || a.reviewedBy?.firstName}</strong></div>
                <div style={{ color: '#6b7280' }}>At: {new Date(a.reviewedAt).toLocaleDateString()}</div>
                {a.rejectionReason && <div style={{ color: '#b91c1c', marginTop: 6 }}>Reason: {a.rejectionReason}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5f0e8', padding: '16px 18px', marginBottom: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0a2818', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, val }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0fdf4', fontSize: 13 }}>
      <span style={{ color: '#9ca3af', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#0a2818', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{val || 'N/A'}</span>
    </div>
  );
}
