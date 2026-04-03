import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const GRADIENTS = [
  { label: 'Dark Green', value: 'linear-gradient(135deg, #0a2818 0%, #1a4a2a 100%)' },
  { label: 'Navy Blue',  value: 'linear-gradient(135deg, #0d1a3a 0%, #1a2a5a 100%)' },
  { label: 'Dark Brown', value: 'linear-gradient(135deg, #1a0d0a 0%, #3a1a10 100%)' },
  { label: 'Dark Teal',  value: 'linear-gradient(135deg, #0a1a2a 0%, #1a3a4a 100%)' },
  { label: 'Dark Purple',value: 'linear-gradient(135deg, #1a0a1a 0%, #3a1a3a 100%)' },
  { label: 'Slate',      value: 'linear-gradient(135deg, #1a1a2a 0%, #2a2a4a 100%)' },
];

const EMPTY = {
  name: '', slug: '', tagline: '', description: '',
  maxAltitude: '', bestSeason: '', difficulty: 'Moderate',
  trekDuration: '', startingPoint: '', image: '',
  coverGradient: GRADIENTS[0].value,
  packageRegionKeyword: '',
  highlights: [''], isActive: true, sortOrder: 0,
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .mr-root{font-family:'Plus Jakarta Sans',sans-serif;}
  .mr-msg{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:16px;}
  .mr-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;}
  .mr-search{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;width:280px;outline:none;font-family:inherit;transition:border 0.15s;}
  .mr-search:focus{border-color:#16a34a;}
  .mr-btn-primary{padding:10px 20px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}
  .mr-btn-primary:hover{background:#15803d;}
  .mr-btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
  .mr-btn-secondary{padding:9px 16px;background:#f8faf8;color:#374151;border:1.5px solid #e5f0e8;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.15s;}
  .mr-btn-secondary:hover{border-color:#16a34a;color:#15803d;}
  .mr-btn-edit{padding:6px 14px;background:#f0fdf4;color:#15803d;border:1px solid #d1fae5;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;}
  .mr-btn-edit:hover{background:#dcfce7;}
  .mr-btn-danger{padding:6px 14px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;}
  .mr-btn-danger:hover{background:#fee2e2;}
  .mr-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;overflow:hidden;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mr-table{width:100%;border-collapse:collapse;}
  .mr-table th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5f0e8;background:#f8faf8;}
  .mr-table td{padding:13px 16px;border-bottom:1px solid #f0fdf4;font-size:13px;color:#374151;vertical-align:middle;}
  .mr-table tr:last-child td{border-bottom:none;}
  .mr-table tr:hover td{background:#fafff8;}
  .mr-region-preview{width:40px;height:40px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;overflow:hidden;}
  .mr-form-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;padding:28px;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mr-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  @media(max-width:700px){.mr-form-grid{grid-template-columns:1fr;}}
  .mr-field{display:flex;flex-direction:column;gap:5px;}
  .mr-field-full{grid-column:1/-1;}
  .mr-label{font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;}
  .mr-hint{font-size:11px;color:#94a3b8;margin-top:2px;}
  .mr-input{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;color:#0f172a;outline:none;font-family:inherit;width:100%;transition:border 0.15s;}
  .mr-input:focus{border-color:#16a34a;}
  .mr-textarea{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;color:#0f172a;outline:none;font-family:inherit;width:100%;resize:vertical;min-height:120px;transition:border 0.15s;}
  .mr-textarea:focus{border-color:#16a34a;}
  .mr-select{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;color:#0f172a;outline:none;font-family:inherit;width:100%;background:#fff;}
  .mr-select:focus{border-color:#16a34a;}
  .mr-grad-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
  .mr-grad-opt{height:36px;border-radius:8px;cursor:pointer;border:2px solid transparent;transition:border 0.15s;display:flex;align-items:center;justify-content:center;font-size:11px;color:rgba(255,255,255,0.8);font-weight:600;}
  .mr-grad-opt.selected{border-color:#16a34a;box-shadow:0 0 0 2px #16a34a44;}
  .mr-toggle{position:relative;display:inline-flex;align-items:center;cursor:pointer;}
  .mr-toggle input{opacity:0;width:0;height:0;}
  .mr-toggle-slider{width:42px;height:24px;background:#e5f0e8;border-radius:12px;transition:background 0.2s;display:inline-block;position:relative;}
  .mr-toggle-slider::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2);}
  .mr-toggle input:checked + .mr-toggle-slider{background:#16a34a;}
  .mr-toggle input:checked + .mr-toggle-slider::after{transform:translateX(18px);}
  .mr-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
  .mr-modal{background:#fff;border-radius:20px;padding:28px;width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.2);text-align:center;}
  .mr-spinner{width:36px;height:36px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:mr-spin 0.9s linear infinite;margin:40px auto;}
  @keyframes mr-spin{to{transform:rotate(360deg);}}
`;

export default function ManageRegions() {
  const [tab,        setTab]        = useState('list');
  const [regions,    setRegions]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [search,     setSearch]     = useState('');
  const [msg,        setMsg]        = useState('');
  const [delConfirm, setDelConfirm] = useState(null);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/regions/admin/all`, { headers: { Authorization: `Bearer ${token()}` } });
      setRegions(data.regions || []);
    } catch {
      // fallback to public endpoint
      try {
        const { data } = await axios.get(`${API}/regions`);
        setRegions(data.regions || []);
      } catch { setRegions([]); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRegions(); }, []);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const startNew = () => { setForm(EMPTY); setEditId(null); setTab('form'); };
  const startEdit = (r) => {
    setForm({ ...EMPTY, ...r, highlights: r.highlights?.length ? r.highlights : [''] });
    setEditId(r._id); setTab('form');
  };

  const sf = (field) => (e) => {
    const val = e.target.value;
    setForm(f => {
      const next = { ...f, [field]: val };
      if (field === 'name' && !editId) next.slug = autoSlug(val);
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return notify('⚠️ Region name is required');
    if (!form.slug.trim()) return notify('⚠️ Slug is required');
    if (!form.description.trim()) return notify('⚠️ Description is required');
    setSaving(true);
    const payload = {
      ...form,
      highlights: form.highlights.filter(h => h.trim()),
      maxAltitude: form.maxAltitude ? Number(form.maxAltitude) : undefined,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editId) {
        await axios.put(`${API}/regions/${editId}`, payload, { headers: { Authorization: `Bearer ${token()}` } });
        notify('✓ Region updated successfully');
      } else {
        await axios.post(`${API}/regions`, payload, { headers: { Authorization: `Bearer ${token()}` } });
        notify('✓ Region created successfully');
      }
      fetchRegions(); setTab('list');
    } catch (err) {
      notify(`⚠️ ${err.response?.data?.message || 'Failed to save'}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/regions/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      notify('✓ Region deleted'); fetchRegions();
    } catch { notify('⚠️ Failed to delete'); }
    setDelConfirm(null);
  };

  const handleToggle = async (region) => {
    try {
      await axios.put(`${API}/regions/${region._id}/toggle-status`, {}, { headers: { Authorization: `Bearer ${token()}` } });
      fetchRegions();
    } catch { notify('⚠️ Failed to update status'); }
  };

  const filtered = regions.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Trekking Regions" subtitle="Create and manage Nepal's trekking regions for the destinations page">
      <style>{STYLES}</style>
      <div className="mr-root">
        {msg && <div className="mr-msg" style={{ background: msg.startsWith('✓') ? '#f0fdf4' : '#fef2f2', color: msg.startsWith('✓') ? '#16a34a' : '#dc2626', border: `1px solid ${msg.startsWith('✓') ? '#d1fae5' : '#fecaca'}` }}>{msg}</div>}

        {delConfirm && (
          <div className="mr-modal-overlay">
            <div className="mr-modal">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Delete Region?</h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>This cannot be undone. Packages won't be affected.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="mr-btn-secondary" style={{ flex: 1 }} onClick={() => setDelConfirm(null)}>Cancel</button>
                <button style={{ flex: 1, padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDelete(delConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'list' ? (
          <>
            <div className="mr-topbar">
              <input className="mr-search" placeholder="🔍 Search regions…" value={search} onChange={e => setSearch(e.target.value)} />
              <button className="mr-btn-primary" onClick={startNew}>+ Add Region</button>
            </div>

            {/* Info banner */}
            <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 12, padding: '14px 18px', marginBottom: 18, fontSize: 13, color: '#15803d', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
              <div>
                <strong>How it works:</strong> Regions you create here appear as cards on the public <strong>/browse-destinations</strong> page. Each region page shows its description + all packages matching the <strong>Package Region Keyword</strong>.
              </div>
            </div>

            <div className="mr-card">
              {loading ? (
                <div><div className="mr-spinner" /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏔</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0a2818', marginBottom: 6 }}>No regions yet</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Create your first trekking region</div>
                  <button className="mr-btn-primary" onClick={startNew}>+ Add Region</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="mr-table">
                    <thead>
                      <tr><th>Region</th><th>Slug / URL</th><th>Altitude</th><th>Difficulty</th><th>Order</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filtered.map(r => (
                        <tr key={r._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="mr-region-preview" style={{ background: r.image ? `url(${r.image}) center/cover` : r.coverGradient }}>
                                {!r.image && '🏔'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0a2818' }}>{r.name}</div>
                                {r.tagline && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{r.tagline.slice(0, 40)}…</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <code style={{ background: '#f0fdf4', padding: '2px 8px', borderRadius: 5, fontSize: 11, color: '#15803d' }}>/destinations/{r.slug}</code>
                          </td>
                          <td>{r.maxAltitude ? `${r.maxAltitude.toLocaleString()}m` : '—'}</td>
                          <td>
                            {r.difficulty && (
                              <span style={{ background: '#f0fdf4', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#15803d' }}>{r.difficulty}</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>{r.sortOrder ?? 0}</td>
                          <td>
                            <button onClick={() => handleToggle(r)} style={{ background: r.isActive ? '#f0fdf4' : '#fef2f2', color: r.isActive ? '#16a34a' : '#dc2626', border: `1px solid ${r.isActive ? '#d1fae5' : '#fecaca'}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              {r.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="mr-btn-edit" onClick={() => startEdit(r)}>Edit</button>
                              <button className="mr-btn-danger" onClick={() => setDelConfirm(r._id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0a2818' }}>{editId ? 'Edit Region' : 'Add New Region'}</h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>This region will appear as a card on the destinations page</p>
              </div>
              <button className="mr-btn-secondary" onClick={() => setTab('list')}>← Back</button>
            </div>

            <div className="mr-form-card">
              <div className="mr-form-grid">

                <div className="mr-field">
                  <label className="mr-label">Region Name *</label>
                  <input className="mr-input" placeholder="e.g. Everest Region" value={form.name} onChange={sf('name')} autoFocus />
                </div>

                <div className="mr-field">
                  <label className="mr-label">URL Slug *</label>
                  <input className="mr-input" placeholder="e.g. everest-region" value={form.slug} onChange={sf('slug')} />
                  <span className="mr-hint">URL: /destinations/{form.slug || 'your-slug'}</span>
                </div>

                <div className="mr-field mr-field-full">
                  <label className="mr-label">Tagline</label>
                  <input className="mr-input" placeholder="e.g. Journey to the Roof of the World" value={form.tagline} onChange={sf('tagline')} />
                </div>

                <div className="mr-field mr-field-full">
                  <label className="mr-label">Description *</label>
                  <textarea className="mr-textarea" placeholder="Describe this trekking region — its beauty, culture, what makes it special, what trekkers can expect…" value={form.description} onChange={sf('description')} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Max Altitude (m)</label>
                  <input className="mr-input" type="number" placeholder="e.g. 8848" value={form.maxAltitude} onChange={sf('maxAltitude')} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Best Season</label>
                  <input className="mr-input" placeholder="e.g. Mar-May, Sep-Nov" value={form.bestSeason} onChange={sf('bestSeason')} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Difficulty</label>
                  <select className="mr-select" value={form.difficulty} onChange={sf('difficulty')}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="mr-field">
                  <label className="mr-label">Trek Duration</label>
                  <input className="mr-input" placeholder="e.g. 12-16 days" value={form.trekDuration} onChange={sf('trekDuration')} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Starting Point</label>
                  <input className="mr-input" placeholder="e.g. Lukla (fly from Kathmandu)" value={form.startingPoint} onChange={sf('startingPoint')} />
                </div>

                <div className="mr-field">
                  <label className="mr-label">Package Region Keyword</label>
                  <input className="mr-input" placeholder="e.g. Everest" value={form.packageRegionKeyword} onChange={sf('packageRegionKeyword')} />
                  <span className="mr-hint">Packages matching this keyword will show on the region page</span>
                </div>

                <div className="mr-field">
                  <label className="mr-label">Sort Order</label>
                  <input className="mr-input" type="number" placeholder="0" value={form.sortOrder} onChange={sf('sortOrder')} />
                  <span className="mr-hint">Lower number = shown first</span>
                </div>

                <div className="mr-field">
                  <label className="mr-label">Cover Image URL</label>
                  <input className="mr-input" placeholder="https://… (optional, uses gradient if empty)" value={form.image} onChange={sf('image')} />
                </div>

                <div className="mr-field mr-field-full">
                  <label className="mr-label">Cover Gradient (used when no image)</label>
                  <div className="mr-grad-grid">
                    {GRADIENTS.map(g => (
                      <div key={g.value} className={`mr-grad-opt${form.coverGradient === g.value ? ' selected' : ''}`}
                        style={{ background: g.value }} onClick={() => setForm(f => ({ ...f, coverGradient: g.value }))}>
                        {g.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mr-field mr-field-full">
                  <label className="mr-label">Highlights</label>
                  {form.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input className="mr-input" placeholder={`e.g. Mount Everest 8,848m`} value={h}
                        onChange={e => { const a = [...form.highlights]; a[i] = e.target.value; setForm(f => ({ ...f, highlights: a })); }} />
                      {form.highlights.length > 1 && (
                        <button className="mr-btn-danger" onClick={() => setForm(f => ({ ...f, highlights: f.highlights.filter((_, j) => j !== i) }))}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="mr-btn-secondary" style={{ width: 'fit-content' }}
                    onClick={() => setForm(f => ({ ...f, highlights: [...f.highlights, ''] }))}>+ Add Highlight</button>
                </div>

                <div className="mr-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <label className="mr-label">Active (visible to users)</label>
                  <label className="mr-toggle">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                    <span className="mr-toggle-slider" />
                  </label>
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="mr-btn-secondary" onClick={() => setTab('list')}>Cancel</button>
              <button className="mr-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving…' : editId ? '✓ Update Region' : '+ Create Region'}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
