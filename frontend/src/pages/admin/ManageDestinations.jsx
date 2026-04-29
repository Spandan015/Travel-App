import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import {
  MapPin, Globe, Tag, FileText, Clock, Star, Eye, EyeOff,
  Zap, Image, Plus, Trash2, ChevronLeft, Save, Search, Pencil
} from 'lucide-react';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const PROVINCES  = ['Province 1', 'Province 2', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
const CATEGORIES = ['City', 'Mountain', 'Lake', 'Temple', 'National Park', 'Cultural Site', 'Adventure Spot'];

const EMPTY = {
  name: '', location: '', district: '', province: 'Bagmati', category: 'City',
  description: '', shortDescription: '', bestTimeToVisit: '',
  mainImage: '', images: [''],
  coordinates: { latitude: '', longitude: '' },
  isPopular: false, isActive: true, featured: false,
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .mdt-root { font-family: 'Plus Jakarta Sans', sans-serif; }
  .mdt-msg { padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .mdt-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px; }
  .mdt-search-wrap { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff; width: 280px; transition: border 0.15s; }
  .mdt-search-wrap:focus-within { border-color: #16a34a; }
  .mdt-search { border: none; outline: none; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; background: transparent; flex: 1; }
  .mdt-search::placeholder { color: #94a3b8; }
  .mdt-btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 18px; background: #16a34a; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.15s; }
  .mdt-btn-primary:hover { background: #15803d; }
  .mdt-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .mdt-btn-secondary { display: flex; align-items: center; gap: 6px; padding: 9px 16px; background: #f8fafc; color: #374151; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
  .mdt-btn-secondary:hover { border-color: #16a34a; color: #15803d; }
  .mdt-btn-edit { display: flex; align-items: center; gap: 5px; padding: 6px 12px; background: #f0fdf4; color: #15803d; border: 1px solid #d1fae5; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
  .mdt-btn-edit:hover { background: #dcfce7; }
  .mdt-btn-danger { display: flex; align-items: center; gap: 5px; padding: 6px 12px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
  .mdt-btn-danger:hover { background: #fee2e2; }
  .mdt-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .mdt-table { width: 100%; border-collapse: collapse; }
  .mdt-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
  .mdt-table td { padding: 13px 16px; border-bottom: 1px solid #f8fafc; font-size: 13px; color: #374151; vertical-align: middle; }
  .mdt-table tr:last-child td { border-bottom: none; }
  .mdt-table tr:hover td { background: #fafff8; }

  /* FORM */
  .mdt-form-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .mdt-section { margin-bottom: 28px; }
  .mdt-section-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; margin-bottom: 16px; }
  .mdt-section-header svg { color: #16a34a; }
  .mdt-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width:700px) { .mdt-form-grid { grid-template-columns: 1fr; } }
  .mdt-field { display: flex; flex-direction: column; gap: 5px; }
  .mdt-field-full { grid-column: 1 / -1; }
  .mdt-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; }
  .mdt-input { padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; color: #0f172a; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; transition: border 0.15s; }
  .mdt-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.08); }
  .mdt-textarea { padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; color: #0f172a; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; resize: vertical; min-height: 90px; transition: border 0.15s; }
  .mdt-textarea:focus { border-color: #16a34a; }
  .mdt-select { padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; color: #0f172a; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; background: #fff; transition: border 0.15s; }
  .mdt-select:focus { border-color: #16a34a; }

  /* TOGGLE */
  .mdt-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9; }
  .mdt-toggle-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #374151; }
  .mdt-toggle { position: relative; display: inline-flex; cursor: pointer; }
  .mdt-toggle input { opacity: 0; width: 0; height: 0; }
  .mdt-toggle-slider { width: 42px; height: 24px; background: #e2e8f0; border-radius: 12px; transition: background 0.2s; display: inline-block; position: relative; }
  .mdt-toggle-slider::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
  .mdt-toggle input:checked + .mdt-toggle-slider { background: #16a34a; }
  .mdt-toggle input:checked + .mdt-toggle-slider::after { transform: translateX(18px); }

  /* MODAL */
  .mdt-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .mdt-modal { background: #fff; border-radius: 20px; padding: 28px; width: 360px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); text-align: center; }
  .mdt-spinner { width: 36px; height: 36px; border: 3px solid #d1fae5; border-top: 3px solid #16a34a; border-radius: 50%; animation: mdt-spin 0.9s linear infinite; margin: 0 auto; }
  @keyframes mdt-spin { to { transform: rotate(360deg); } }

  /* IMAGE PREVIEW */
  .mdt-img-preview { width: 100%; height: 140px; object-fit: cover; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 8px; }
  .mdt-img-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  .mdt-img-row .mdt-input { flex: 1; margin-bottom: 0; }
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
      const { data } = await axios.get(`${API}/destinations`, { headers: { Authorization: `Bearer ${token()}` } });
      setDests(data.destinations || data || []);
    } catch { setDests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDests(); }, []);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const startNew  = () => { setForm(EMPTY); setEditId(null); setTab('form'); };
  const startEdit = (d) => {
    setForm({
      ...EMPTY, ...d,
      coordinates: { latitude: d.coordinates?.latitude ?? '', longitude: d.coordinates?.longitude ?? '' },
      images: d.images?.length ? d.images : [''],
    });
    setEditId(d._id);
    setTab('form');
  };

  const handleSave = async () => {
    if (!form.name.trim())        return notify('⚠️ Destination name is required');
    if (!form.location.trim())    return notify('⚠️ Location is required');
    if (!form.district.trim())    return notify('⚠️ District is required');
    if (!form.description.trim()) return notify('⚠️ Description is required');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), location: form.location.trim(),
        district: form.district.trim(), province: form.province,
        category: form.category, description: form.description.trim(),
        shortDescription: form.shortDescription?.trim() || undefined,
        mainImage: form.mainImage?.trim() || undefined,
        bestTimeToVisit: form.bestTimeToVisit?.trim() || undefined,
        isPopular: form.isPopular, isActive: form.isActive, featured: form.featured,
        coordinates: (form.coordinates.latitude !== '' && form.coordinates.longitude !== '')
          ? { latitude: Number(form.coordinates.latitude), longitude: Number(form.coordinates.longitude) }
          : undefined,
        images: form.images.filter(i => i.trim() !== ''),
      };
      if (editId) {
        await axios.put(`${API}/destinations/${editId}`, payload, { headers: { Authorization: `Bearer ${token()}` } });
        notify('✓ Destination updated');
      } else {
        await axios.post(`${API}/destinations`, payload, { headers: { Authorization: `Bearer ${token()}` } });
        notify('✓ Destination created');
      }
      fetchDests(); setTab('list');
    } catch (err) {
      notify(`⚠️ ${err.response?.data?.message || 'Failed to save'}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/destinations/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      notify('✓ Destination deleted'); fetchDests();
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
                <button className="mdt-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDelConfirm(null)}>Cancel</button>
                <button style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => handleDelete(delConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST ── */}
        {tab === 'list' ? (
          <>
            <div className="mdt-topbar">
              <div className="mdt-search-wrap">
                <Search size={14} color="#94a3b8" />
                <input className="mdt-search" placeholder="Search by name, province, category…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="mdt-btn-primary" onClick={startNew}><Plus size={14} /> Add Destination</button>
            </div>

            <div className="mdt-card">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><div className="mdt-spinner" /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <MapPin size={40} color="#d1fae5" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0a2818', marginBottom: 6 }}>No destinations yet</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Add Nepal's beautiful destinations</div>
                  <button className="mdt-btn-primary" onClick={startNew} style={{ margin: '0 auto' }}><Plus size={14} /> Add Destination</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="mdt-table">
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Province</th>
                        <th>Category</th>
                        <th>Best Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(d => (
                        <tr key={d._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {d.mainImage
                                ? <img src={d.mainImage} alt={d.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                : <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={16} color="#16a34a" /></div>
                              }
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.name}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.district}</div>
                                {d.isPopular && <span style={{ fontSize: 10, background: '#fef9c3', color: '#a16207', padding: '2px 7px', borderRadius: 10, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>⭐ Popular</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ color: '#64748b' }}>{d.province}</td>
                          <td><span style={{ background: '#f0fdf4', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#15803d' }}>{d.category}</span></td>
                          <td style={{ color: '#64748b', fontSize: 12 }}>{d.bestTimeToVisit || '—'}</td>
                          <td>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: d.isActive ? '#f0fdf4' : '#fef2f2', color: d.isActive ? '#16a34a' : '#dc2626' }}>
                              {d.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="mdt-btn-edit" onClick={() => startEdit(d)}><Pencil size={12} /> Edit</button>
                              <button className="mdt-btn-danger" onClick={() => setDelConfirm(d._id)}><Trash2 size={12} /> Delete</button>
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
          /* ── FORM ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{editId ? 'Edit Destination' : 'Add New Destination'}</h2>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>Fill in destination details for users to browse</p>
              </div>
              <button className="mdt-btn-secondary" onClick={() => setTab('list')}><ChevronLeft size={14} /> Back</button>
            </div>

            <div className="mdt-form-card">

              {/* BASIC INFO */}
              <div className="mdt-section">
                <div className="mdt-section-header"><MapPin size={15} /> Basic Information</div>
                <div className="mdt-form-grid">
                  <div className="mdt-field mdt-field-full">
                    <label className="mdt-label">Destination Name *</label>
                    <input className="mdt-input" placeholder="e.g. Pokhara" value={form.name} onChange={sf('name')} />
                  </div>
                  <div className="mdt-field">
                    <label className="mdt-label">Location *</label>
                    <input className="mdt-input" placeholder="e.g. Pokhara Valley" value={form.location} onChange={sf('location')} />
                  </div>
                  <div className="mdt-field">
                    <label className="mdt-label">District *</label>
                    <input className="mdt-input" placeholder="e.g. Kaski" value={form.district} onChange={sf('district')} />
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
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mdt-section">
                <div className="mdt-section-header"><FileText size={15} /> Description</div>
                <div className="mdt-form-grid">
                  <div className="mdt-field mdt-field-full">
                    <label className="mdt-label">Full Description *</label>
                    <textarea className="mdt-textarea" placeholder="Describe this destination — its beauty, history, what to expect…" value={form.description} onChange={sf('description')} />
                  </div>
                  <div className="mdt-field mdt-field-full">
                    <label className="mdt-label">Short Description (shown on cards)</label>
                    <input className="mdt-input" placeholder="One-liner for destination cards" value={form.shortDescription} onChange={sf('shortDescription')} />
                  </div>
                </div>
              </div>

              {/* VISIT INFO */}
              <div className="mdt-section">
                <div className="mdt-section-header"><Clock size={15} /> Visit Information</div>
                <div className="mdt-form-grid">
                  <div className="mdt-field">
                    <label className="mdt-label">Best Time to Visit</label>
                    <input className="mdt-input" placeholder="e.g. March–May, Sep–Nov" value={form.bestTimeToVisit} onChange={sf('bestTimeToVisit')} />
                  </div>
                </div>
              </div>

              {/* COORDINATES */}
              <div className="mdt-section">
                <div className="mdt-section-header"><Globe size={15} /> Coordinates</div>
                <div className="mdt-form-grid">
                  <div className="mdt-field">
                    <label className="mdt-label">Latitude</label>
                    <input className="mdt-input" type="number" step="any" placeholder="e.g. 28.2096" value={form.coordinates?.latitude}
                      onChange={e => setForm(f => ({ ...f, coordinates: { ...f.coordinates, latitude: e.target.value } }))} />
                  </div>
                  <div className="mdt-field">
                    <label className="mdt-label">Longitude</label>
                    <input className="mdt-input" type="number" step="any" placeholder="e.g. 83.9856" value={form.coordinates?.longitude}
                      onChange={e => setForm(f => ({ ...f, coordinates: { ...f.coordinates, longitude: e.target.value } }))} />
                  </div>
                </div>
              </div>

              {/* IMAGES */}
              <div className="mdt-section">
                <div className="mdt-section-header"><Image size={15} /> Images</div>
                <div className="mdt-form-grid">
                  <div className="mdt-field mdt-field-full">
                    <label className="mdt-label">Main Image URL</label>
                    <input className="mdt-input" placeholder="https://…/main.jpg" value={form.mainImage} onChange={sf('mainImage')} />
                    {form.mainImage?.trim() && <img src={form.mainImage} alt="preview" className="mdt-img-preview" onError={e => e.target.style.display = 'none'} />}
                  </div>
                  <div className="mdt-field mdt-field-full">
                    <label className="mdt-label">Gallery Images</label>
                    {form.images.map((img, i) => (
  <div key={i} style={{ marginBottom: 12 }}>
    <div className="mdt-img-row">
      <input className="mdt-input" placeholder={`Image URL ${i + 1}`} value={img}
        onChange={e => { const a = [...form.images]; a[i] = e.target.value; setForm(f => ({ ...f, images: a })); }} />
      {form.images.length > 1 && (
        <button className="mdt-btn-danger" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}><Trash2 size={12} /></button>
      )}
    </div>
    {img.trim() && (
      <img src={img} alt={`gallery ${i + 1}`} className="mdt-img-preview"
        onError={e => e.target.style.display = 'none'} />
    )}
  </div>
))}
                    <button className="mdt-btn-secondary" style={{ width: 'fit-content', marginTop: 4 }}
                      onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}><Plus size={13} /> Add Image</button>
                  </div>
                </div>
              </div>

              {/* SETTINGS */}
              <div className="mdt-section">
                <div className="mdt-section-header"><Zap size={15} /> Settings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="mdt-toggle-row">
                    <div className="mdt-toggle-label"><Star size={14} color="#f59e0b" /> Mark as Popular</div>
                    <label className="mdt-toggle"><input type="checkbox" checked={form.isPopular} onChange={sfb('isPopular')} /><span className="mdt-toggle-slider" /></label>
                  </div>
                  <div className="mdt-toggle-row">
                    <div className="mdt-toggle-label"><Zap size={14} color="#8b5cf6" /> Featured on Homepage</div>
                    <label className="mdt-toggle"><input type="checkbox" checked={form.featured} onChange={sfb('featured')} /><span className="mdt-toggle-slider" /></label>
                  </div>
                  <div className="mdt-toggle-row">
                    <div className="mdt-toggle-label">{form.isActive ? <Eye size={14} color="#16a34a" /> : <EyeOff size={14} color="#94a3b8" />} Active (visible to users)</div>
                    <label className="mdt-toggle"><input type="checkbox" checked={form.isActive} onChange={sfb('isActive')} /><span className="mdt-toggle-slider" /></label>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="mdt-btn-secondary" onClick={() => setTab('list')}><ChevronLeft size={14} /> Cancel</button>
              <button className="mdt-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving…' : <><Save size={14} /> {editId ? 'Update Destination' : 'Create Destination'}</>}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
