import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const PROVINCES  = ['Province 1', 'Province 2', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
const CATEGORIES = ['City', 'Mountain', 'Lake', 'Temple', 'National Park', 'Cultural Site', 'Adventure Spot'];

const EMPTY = {
  name: '',
  location: '',
  district: '',
  province: 'Bagmati',
  category: 'Mountain',
  description: '',
  shortDescription: '',
  altitude: '',
  bestTimeToVisit: '',
  mainImage: '',
  images: [''],
  coordinates: { latitude: '', longitude: '' },
  isPopular: false,
  isActive: true,
  featured: false,
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  .mdt-root{font-family:'Roboto',sans-serif;}
  .mdt-msg{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:16px;}
  .mdt-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;}
  .mdt-search{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;width:280px;outline:none;font-family:'Roboto',sans-serif;transition:border 0.15s;}
  .mdt-search:focus{border-color:#16a34a;}
  .mdt-btn-primary{padding:10px 20px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Roboto',sans-serif;transition:background 0.15s;}
  .mdt-btn-primary:hover{background:#15803d;}
  .mdt-btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
  .mdt-btn-secondary{padding:9px 16px;background:#f8faf8;color:#374151;border:1.5px solid #e5f0e8;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.15s;}
  .mdt-btn-secondary:hover{border-color:#16a34a;color:#15803d;}
  .mdt-btn-edit{padding:6px 14px;background:#f0fdf4;color:#15803d;border:1px solid #d1fae5;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.15s;}
  .mdt-btn-edit:hover{background:#dcfce7;}
  .mdt-btn-danger{padding:6px 14px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.15s;}
  .mdt-btn-danger:hover{background:#fee2e2;}
  .mdt-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;overflow:hidden;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mdt-table{width:100%;border-collapse:collapse;}
  .mdt-table th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5f0e8;background:#f8faf8;}
  .mdt-table td{padding:13px 16px;border-bottom:1px solid #f0fdf4;font-size:13px;color:#374151;vertical-align:middle;}
  .mdt-table tr:last-child td{border-bottom:none;}
  .mdt-table tr:hover td{background:#fafff8;}
  .mdt-form-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;padding:28px;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mdt-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  @media(max-width:700px){.mdt-form-grid{grid-template-columns:1fr;}}
  .mdt-field{display:flex;flex-direction:column;gap:5px;}
  .mdt-field-full{grid-column:1/-1;}
  .mdt-label{font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;}
  .mdt-input{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;color:#0f172a;outline:none;font-family:'Roboto',sans-serif;width:100%;box-sizing:border-box;transition:border 0.15s;}
  .mdt-input:focus{border-color:#16a34a;}
  .mdt-textarea{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;color:#0f172a;outline:none;font-family:'Roboto',sans-serif;width:100%;box-sizing:border-box;resize:vertical;min-height:90px;transition:border 0.15s;}
  .mdt-textarea:focus{border-color:#16a34a;}
  .mdt-select{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;color:#0f172a;outline:none;font-family:'Roboto',sans-serif;width:100%;background:#fff;transition:border 0.15s;}
  .mdt-select:focus{border-color:#16a34a;}
  .mdt-toggle{position:relative;display:inline-flex;align-items:center;cursor:pointer;}
  .mdt-toggle input{opacity:0;width:0;height:0;}
  .mdt-toggle-slider{width:42px;height:24px;background:#e5f0e8;border-radius:12px;transition:background 0.2s;display:inline-block;position:relative;}
  .mdt-toggle-slider::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2);}
  .mdt-toggle input:checked + .mdt-toggle-slider{background:#16a34a;}
  .mdt-toggle input:checked + .mdt-toggle-slider::after{transform:translateX(18px);}
  .mdt-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
  .mdt-modal{background:#fff;border-radius:20px;padding:28px;width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.2);text-align:center;}
  .mdt-spinner{width:36px;height:36px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:mdt-spin 0.9s linear infinite;margin:0 auto;}
  @keyframes mdt-spin{to{transform:rotate(360deg);}}
  .mdt-section-title{font-size:13px;font-weight:700;color:#0a2818;margin:20px 0 12px;padding-bottom:6px;border-bottom:1px solid #e5f0e8;grid-column:1/-1;}
`;

export default function ManageDestinations() {
  const [tab,        setTab]        = useState('list');
  const [dests,      setDests]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [search,     setSearch]     = useState('');
  const [msg,        setMsg]        = useState('');
  const [delConfirm, setDelConfirm] = useState(null);

  const fetchDests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/destinations`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setDests(data.destinations || data || []);
    } catch { setDests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDests(); }, []);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const startNew  = () => { setForm(EMPTY); setEditId(null); setTab('form'); };
  const startEdit = (d) => {
    setForm({
      ...EMPTY,
      ...d,
      altitude:    d.altitude    ?? '',
      coordinates: { latitude: d.coordinates?.latitude ?? '', longitude: d.coordinates?.longitude ?? '' },
      images:      d.images?.length ? d.images : [''],
    });
    setEditId(d._id);
    setTab('form');
  };

  const handleSave = async () => {
    // ── Validation ──────────────────────────────────────────────
    if (!form.name.trim())        return notify('⚠️ Destination name is required');
    if (!form.location.trim())    return notify('⚠️ Location is required');
    if (!form.district.trim())    return notify('⚠️ District is required');
    if (!form.description.trim()) return notify('⚠️ Description is required');

    setSaving(true);
    try {
      // ── Clean payload to match schema exactly ───────────────
      const payload = {
        name:             form.name.trim(),
        location:         form.location.trim(),
        district:         form.district.trim(),
        province:         form.province,
        category:         form.category,
        description:      form.description.trim(),
        shortDescription: form.shortDescription?.trim() || undefined,
        mainImage:        form.mainImage?.trim()        || undefined,
        bestTimeToVisit:  form.bestTimeToVisit?.trim()  || undefined,
        isPopular:        form.isPopular,
        isActive:         form.isActive,
        featured:         form.featured,

        // Numbers — only send if filled
        altitude: form.altitude !== '' ? Number(form.altitude) : undefined,

        // Coordinates — only send if both filled
        coordinates: (form.coordinates.latitude !== '' && form.coordinates.longitude !== '')
          ? { latitude: Number(form.coordinates.latitude), longitude: Number(form.coordinates.longitude) }
          : undefined,

        // Arrays — filter empty strings
        images: form.images.filter(i => i.trim() !== ''),
      };

      if (editId) {
        await axios.put(`${API}/destinations/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token()}` }
        });
        notify('✓ Destination updated');
      } else {
        await axios.post(`${API}/destinations`, payload, {
          headers: { Authorization: `Bearer ${token()}` }
        });
        notify('✓ Destination created');
      }

      fetchDests();
      setTab('list');
    } catch (err) {
      // Show the actual server error message so you can debug easily
      const serverMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to save';
      notify(`⚠️ ${serverMsg}`);
      console.error('Save error:', err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/destinations/${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      notify('✓ Destination deleted');
      fetchDests();
    } catch { notify('⚠️ Failed to delete'); }
    setDelConfirm(null);
  };

  const sf  = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const sfb = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.checked }));

  const filtered = dests.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.province?.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Destinations" subtitle="Add and manage Nepal travel destinations">
      <style>{STYLES}</style>
      <div className="mdt-root">

        {msg && (
          <div className="mdt-msg" style={{
            background: msg.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
            color:      msg.startsWith('✓') ? '#16a34a' : '#dc2626',
            border:     `1px solid ${msg.startsWith('✓') ? '#d1fae5' : '#fecaca'}`
          }}>{msg}</div>
        )}

        {delConfirm && (
          <div className="mdt-modal-overlay">
            <div className="mdt-modal">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Delete Destination?</h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="mdt-btn-secondary" style={{ flex: 1 }} onClick={() => setDelConfirm(null)}>Cancel</button>
                <button style={{ flex: 1, padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => handleDelete(delConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {tab === 'list' ? (
          <>
            <div className="mdt-topbar">
              <input className="mdt-search" placeholder="🔍 Search by name, province, category…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <button className="mdt-btn-primary" onClick={startNew}>+ Add Destination</button>
            </div>

            <div className="mdt-card">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><div className="mdt-spinner" /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0a2818', marginBottom: 6 }}>No destinations yet</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Add Nepal's beautiful destinations</div>
                  <button className="mdt-btn-primary" onClick={startNew}>+ Add Destination</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="mdt-table">
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Province</th>
                        <th>Category</th>
                        <th>Altitude</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(d => (
                        <tr key={d._id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0a2818' }}>{d.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.location}</div>
                            {d.isPopular && (
                              <span style={{ fontSize: 11, background: '#fef9c3', color: '#a16207', padding: '2px 8px', borderRadius: 10, fontWeight: 600, display: 'inline-block', marginTop: 3 }}>
                                🔥 Popular
                              </span>
                            )}
                          </td>
                          <td>{d.province}</td>
                          <td>
                            <span style={{ background: '#f0fdf4', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#15803d' }}>
                              {d.category}
                            </span>
                          </td>
                          <td>{d.altitude ? `${d.altitude}m` : '—'}</td>
                          <td>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: d.isActive ? '#f0fdf4' : '#fef2f2', color: d.isActive ? '#16a34a' : '#dc2626' }}>
                              {d.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="mdt-btn-edit" onClick={() => startEdit(d)}>Edit</button>
                              <button className="mdt-btn-danger" onClick={() => setDelConfirm(d._id)}>Delete</button>
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
          /* ── FORM VIEW ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0a2818' }}>
                  {editId ? 'Edit Destination' : 'Add New Destination'}
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Fill in destination details</p>
              </div>
              <button className="mdt-btn-secondary" onClick={() => setTab('list')}>← Back</button>
            </div>

            <div className="mdt-form-card">
              <div className="mdt-form-grid">

                {/* ── Basic Info ── */}
                <div className="mdt-section-title">📍 Basic Information</div>

                <div className="mdt-field mdt-field-full">
                  <label className="mdt-label">Destination Name *</label>
                  <input className="mdt-input" placeholder="e.g. Everest Base Camp" value={form.name} onChange={sf('name')} />
                </div>

                <div className="mdt-field">
                  <label className="mdt-label">Location *</label>
                  <input className="mdt-input" placeholder="e.g. Khumbu, Solukhumbu" value={form.location} onChange={sf('location')} />
                </div>

                <div className="mdt-field">
                  <label className="mdt-label">District *</label>
                  <input className="mdt-input" placeholder="e.g. Solukhumbu" value={form.district} onChange={sf('district')} />
                </div>

                <div className="mdt-field">
                  <label className="mdt-label">Province *</label>
                  <select className="mdt-select" value={form.province} onChange={sf('province')}>
                    {PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div className="mdt-field">
                  <label className="mdt-label">Category *</label>
                  <select className="mdt-select" value={form.category} onChange={sf('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="mdt-field mdt-field-full">
                  <label className="mdt-label">Description *</label>
                  <textarea className="mdt-textarea"
                    placeholder="Describe this destination — its beauty, what to expect, why travelers love it…"
                    value={form.description} onChange={sf('description')} />
                </div>

                <div className="mdt-field mdt-field-full">
                  <label className="mdt-label">Short Description (for cards)</label>
                  <input className="mdt-input" placeholder="Brief one-liner for destination cards"
                    value={form.shortDescription} onChange={sf('shortDescription')} />
                </div>

                {/* ── Nepal Details ── */}
                <div className="mdt-section-title">🏔️ Nepal-specific Details</div>

                <div className="mdt-field">
                  <label className="mdt-label">Altitude (meters)</label>
                  <input className="mdt-input" type="number" placeholder="e.g. 5364"
                    value={form.altitude} onChange={sf('altitude')} />
                </div>

                <div className="mdt-field">
                  <label className="mdt-label">Best Time to Visit</label>
                  <input className="mdt-input" placeholder="e.g. March-May, Sep-Nov"
                    value={form.bestTimeToVisit} onChange={sf('bestTimeToVisit')} />
                </div>

                {/* ── Coordinates ── */}
                <div className="mdt-section-title">🗺️ Coordinates</div>

                <div className="mdt-field">
                  <label className="mdt-label">Latitude</label>
                  <input className="mdt-input" type="number" step="any" placeholder="e.g. 28.0026"
                    value={form.coordinates?.latitude}
                    onChange={e => setForm(f => ({ ...f, coordinates: { ...f.coordinates, latitude: e.target.value } }))} />
                </div>

                <div className="mdt-field">
                  <label className="mdt-label">Longitude</label>
                  <input className="mdt-input" type="number" step="any" placeholder="e.g. 86.8528"
                    value={form.coordinates?.longitude}
                    onChange={e => setForm(f => ({ ...f, coordinates: { ...f.coordinates, longitude: e.target.value } }))} />
                </div>

                {/* ── Images ── */}
                <div className="mdt-section-title">🖼️ Images</div>

                <div className="mdt-field mdt-field-full">
                  <label className="mdt-label">Main Image URL</label>
                  <input className="mdt-input" placeholder="https://…/main.jpg"
                    value={form.mainImage} onChange={sf('mainImage')} />
                </div>

                <div className="mdt-field mdt-field-full">
                  <label className="mdt-label">Gallery Images (URLs)</label>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input className="mdt-input" placeholder={`Image URL ${i + 1}`} value={img}
                        onChange={e => { const a = [...form.images]; a[i] = e.target.value; setForm(f => ({ ...f, images: a })); }} />
                      {form.images.length > 1 && (
                        <button className="mdt-btn-danger"
                          onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="mdt-btn-secondary" style={{ width: 'fit-content' }}
                    onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}>+ Add Image</button>
                </div>

                {/* ── Flags ── */}
                <div className="mdt-section-title">⚙️ Settings</div>

                <div className="mdt-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <label className="mdt-label">Mark as Popular</label>
                  <label className="mdt-toggle">
                    <input type="checkbox" checked={form.isPopular} onChange={sfb('isPopular')} />
                    <span className="mdt-toggle-slider" />
                  </label>
                </div>

                <div className="mdt-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <label className="mdt-label">Featured</label>
                  <label className="mdt-toggle">
                    <input type="checkbox" checked={form.featured} onChange={sfb('featured')} />
                    <span className="mdt-toggle-slider" />
                  </label>
                </div>

                <div className="mdt-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <label className="mdt-label">Active</label>
                  <label className="mdt-toggle">
                    <input type="checkbox" checked={form.isActive} onChange={sfb('isActive')} />
                    <span className="mdt-toggle-slider" />
                  </label>
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="mdt-btn-secondary" onClick={() => setTab('list')}>Cancel</button>
              <button className="mdt-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving…' : editId ? '✓ Update Destination' : '+ Create Destination'}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
