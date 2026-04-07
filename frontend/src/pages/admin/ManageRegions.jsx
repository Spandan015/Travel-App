import { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { ImagePlus, Trash2, Pencil, X, Mountain } from 'lucide-react';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const EMPTY = {
  name: '',
  slug: '',
  description: '',
  image: '',       // will hold the URL after upload (or existing URL when editing)
  isActive: true,
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .mr-root { font-family: 'DM Sans', sans-serif; }

  /* message bar */
  .mr-msg { padding: 11px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }

  /* topbar */
  .mr-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px; }
  .mr-search { padding: 10px 14px; border: 1.5px solid #d1fae5; border-radius: 10px; font-size: 13px; width: 280px; outline: none; font-family: inherit; transition: border 0.15s; }
  .mr-search:focus { border-color: #16a34a; }

  /* buttons */
  .mr-btn-primary   { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: #16a34a; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
  .mr-btn-primary:hover { background: #15803d; }
  .mr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .mr-btn-secondary { padding: 9px 16px; background: #f8faf8; color: #374151; border: 1.5px solid #e5f0e8; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .mr-btn-secondary:hover { border-color: #16a34a; color: #15803d; }
  .mr-btn-edit  { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; background: #f0fdf4; color: #15803d; border: 1px solid #d1fae5; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .mr-btn-edit:hover { background: #dcfce7; }
  .mr-btn-danger { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; }
  .mr-btn-danger:hover { background: #fee2e2; }

  /* card / table */
  .mr-card { background: #fff; border-radius: 16px; border: 1px solid #e5f0e8; overflow: hidden; box-shadow: 0 2px 8px rgba(22,163,74,0.04); }
  .mr-table { width: 100%; border-collapse: collapse; }
  .mr-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e5f0e8; background: #f8faf8; }
  .mr-table td { padding: 13px 16px; border-bottom: 1px solid #f0fdf4; font-size: 13px; color: #374151; vertical-align: middle; }
  .mr-table tr:last-child td { border-bottom: none; }
  .mr-table tr:hover td { background: #fafff8; }
  .mr-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid #e5f0e8; flex-shrink: 0; }
  .mr-thumb-placeholder { width: 44px; height: 44px; border-radius: 8px; background: #f0fdf4; border: 1px dashed #d1fae5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* form */
  .mr-form-card { background: #fff; border-radius: 16px; border: 1px solid #e5f0e8; padding: 28px; box-shadow: 0 2px 8px rgba(22,163,74,0.04); }
  .mr-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
  .mr-label { font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #6b7280; }
  .mr-hint  { font-size: 11px; color: #94a3b8; }
  .mr-input { padding: 10px 14px; border: 1.5px solid #d1fae5; border-radius: 10px; font-size: 14px; color: #0f172a; outline: none; font-family: inherit; width: 100%; box-sizing: border-box; transition: border 0.15s; }
  .mr-input:focus { border-color: #16a34a; }
  .mr-textarea { padding: 12px 14px; border: 1.5px solid #d1fae5; border-radius: 10px; font-size: 14px; color: #0f172a; outline: none; font-family: inherit; width: 100%; box-sizing: border-box; resize: vertical; min-height: 130px; transition: border 0.15s; line-height: 1.6; }
  .mr-textarea:focus { border-color: #16a34a; }

  /* image upload zone */
  .mr-upload-zone { border: 2px dashed #d1fae5; border-radius: 12px; padding: 28px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: #f8faf8; }
  .mr-upload-zone:hover, .mr-upload-zone.drag-over { border-color: #16a34a; background: #f0fdf4; }
  .mr-upload-zone input[type="file"] { display: none; }
  .mr-image-preview { position: relative; border-radius: 12px; overflow: hidden; max-height: 200px; }
  .mr-image-preview img { width: 100%; max-height: 200px; object-fit: cover; display: block; border-radius: 12px; }
  .mr-image-remove { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.55); color: #fff; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .mr-image-remove:hover { background: #dc2626; }
  .mr-uploading { font-size: 13px; color: #16a34a; font-weight: 600; margin-top: 8px; }

  /* toggle */
  .mr-toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
  .mr-toggle input { opacity: 0; width: 0; height: 0; }
  .mr-toggle-slider { width: 42px; height: 24px; background: #e5f0e8; border-radius: 12px; transition: background 0.2s; display: inline-block; position: relative; }
  .mr-toggle-slider::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
  .mr-toggle input:checked + .mr-toggle-slider { background: #16a34a; }
  .mr-toggle input:checked + .mr-toggle-slider::after { transform: translateX(18px); }

  /* modal */
  .mr-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .mr-modal { background: #fff; border-radius: 20px; padding: 28px; width: 340px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); text-align: center; }

  /* spinner */
  .mr-spinner { width: 36px; height: 36px; border: 3px solid #d1fae5; border-top: 3px solid #16a34a; border-radius: 50%; animation: mr-spin 0.9s linear infinite; margin: 40px auto; }
  @keyframes mr-spin { to { transform: rotate(360deg); } }
`;

export default function ManageRegions() {
  const [tab,        setTab]        = useState('list');
  const [regions,    setRegions]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [search,     setSearch]     = useState('');
  const [msg,        setMsg]        = useState('');
  const [delConfirm, setDelConfirm] = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const fileInputRef = useRef(null);

  /* ── fetch ── */
  const fetchRegions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/regions/admin/all`, { headers: { Authorization: `Bearer ${token()}` } });
      setRegions(data.regions || []);
    } catch {
      try {
        const { data } = await axios.get(`${API}/regions`);
        setRegions(data.regions || []);
      } catch { setRegions([]); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRegions(); }, []);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };
  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  /* ── navigation ── */
  const startNew  = () => { setForm(EMPTY); setEditId(null); setTab('form'); };
  const startEdit = (r) => { setForm({ name: r.name || '', slug: r.slug || '', description: r.description || '', image: r.image || '', isActive: r.isActive ?? true }); setEditId(r._id); setTab('form'); };

  /* ── field change ── */
  const sf = (field) => (e) => {
    const val = e.target.value;
    setForm(f => {
      const next = { ...f, [field]: val };
      if (field === 'name' && !editId) next.slug = autoSlug(val);
      return next;
    });
  };

  /* ── image upload ── */
  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { notify('Image must be under 10 MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axios.post(`${API}/regions/upload-image`, fd, {
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, image: data.url }));
    } catch {
      notify('Image upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const onFileChange  = (e) => uploadImage(e.target.files[0]);
  const onDrop        = (e) => { e.preventDefault(); setDragOver(false); uploadImage(e.dataTransfer.files[0]); };
  const onDragOver    = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave   = () => setDragOver(false);
  const removeImage   = () => setForm(f => ({ ...f, image: '' }));

  /* ── save ── */
  const handleSave = async () => {
    if (!form.name.trim())        return notify('Region name is required');
    if (!form.description.trim()) return notify('Description is required');
    setSaving(true);
    const payload = { name: form.name.trim(), slug: form.slug.trim() || autoSlug(form.name), description: form.description.trim(), image: form.image, isActive: form.isActive };
    try {
      if (editId) {
        await axios.put(`${API}/regions/${editId}`, payload, { headers: { Authorization: `Bearer ${token()}` } });
        notify('Region updated successfully');
      } else {
        await axios.post(`${API}/regions`, payload, { headers: { Authorization: `Bearer ${token()}` } });
        notify('Region created successfully');
      }
      fetchRegions(); setTab('list');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/regions/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      notify('Region deleted'); fetchRegions();
    } catch { notify('Failed to delete'); }
    setDelConfirm(null);
  };

  /* ── toggle status ── */
  const handleToggle = async (region) => {
    try {
      await axios.put(`${API}/regions/${region._id}/toggle-status`, {}, { headers: { Authorization: `Bearer ${token()}` } });
      fetchRegions();
    } catch { notify('Failed to update status'); }
  };

  const filtered = regions.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Trekking Regions" subtitle="Create and manage Nepal's trekking regions for the destinations page">
      <style>{STYLES}</style>
      <div className="mr-root">

        {/* notification bar */}
        {msg && (
          <div className="mr-msg" style={{ background: msg.includes('successfully') || msg.includes('deleted') ? '#f0fdf4' : '#fef2f2', color: msg.includes('successfully') || msg.includes('deleted') ? '#16a34a' : '#dc2626', border: `1px solid ${msg.includes('successfully') || msg.includes('deleted') ? '#d1fae5' : '#fecaca'}` }}>
            {msg}
          </div>
        )}

        {/* delete confirm modal */}
        {delConfirm && (
          <div className="mr-modal-overlay">
            <div className="mr-modal">
              <Trash2 size={32} color="#dc2626" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Delete Region?</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>This cannot be undone. Packages will not be affected.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="mr-btn-secondary" style={{ flex: 1 }} onClick={() => setDelConfirm(null)}>Cancel</button>
                <button style={{ flex: 1, padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDelete(delConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {tab === 'list' ? (
          <>
            <div className="mr-topbar">
              <input className="mr-search" placeholder="Search regions..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="mr-btn-primary" onClick={startNew}>
                <Mountain size={15} /> Add Region
              </button>
            </div>

            <div className="mr-card">
              {loading ? (
                <div><div className="mr-spinner" /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 52 }}>
                  <Mountain size={40} color="#d1fae5" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0a2818', marginBottom: 6 }}>No regions yet</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Create your first trekking region</div>
                  <button className="mr-btn-primary" onClick={startNew}><Mountain size={14} /> Add Region</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="mr-table">
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Slug / URL</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(r => (
                        <tr key={r._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {r.image
                                ? <img src={r.image} alt={r.name} className="mr-thumb" />
                                : <div className="mr-thumb-placeholder"><Mountain size={18} color="#86efac" /></div>
                              }
                              <div>
                                <div style={{ fontWeight: 700, color: '#0a2818', fontSize: 14 }}>{r.name}</div>
                                {r.description && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{r.description.slice(0, 55)}{r.description.length > 55 ? '…' : ''}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <code style={{ background: '#f0fdf4', padding: '3px 9px', borderRadius: 5, fontSize: 11, color: '#15803d' }}>/destinations/{r.slug}</code>
                          </td>
                          <td>
                            <button onClick={() => handleToggle(r)} style={{ background: r.isActive ? '#f0fdf4' : '#fef2f2', color: r.isActive ? '#16a34a' : '#dc2626', border: `1px solid ${r.isActive ? '#d1fae5' : '#fecaca'}`, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              {r.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="mr-btn-edit"   onClick={() => startEdit(r)}><Pencil size={12} /> Edit</button>
                              <button className="mr-btn-danger" onClick={() => setDelConfirm(r._id)}><Trash2 size={12} /> Delete</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0a2818' }}>{editId ? 'Edit Region' : 'Add New Region'}</h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>This region will appear as a card on the destinations page</p>
              </div>
              <button className="mr-btn-secondary" onClick={() => setTab('list')}>Back</button>
            </div>

            <div className="mr-form-card">

              {/* Name */}
              <div className="mr-field">
                <label className="mr-label">Region Name *</label>
                <input className="mr-input" placeholder="e.g. Everest Region" value={form.name} onChange={sf('name')} autoFocus />
                {form.slug && <span className="mr-hint">URL: /destinations/{form.slug}</span>}
              </div>

              {/* Description */}
              <div className="mr-field">
                <label className="mr-label">Description *</label>
                <textarea className="mr-textarea" placeholder="Describe this trekking region — its beauty, culture, what makes it special, what trekkers can expect..." value={form.description} onChange={sf('description')} />
              </div>

              {/* Image upload */}
              <div className="mr-field">
                <label className="mr-label">Cover Image</label>
                {form.image ? (
                  <div className="mr-image-preview">
                    <img src={form.image} alt="Cover" />
                    <button className="mr-image-remove" onClick={removeImage} title="Remove image">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mr-upload-zone${dragOver ? ' drag-over' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} />
                    <ImagePlus size={28} color="#86efac" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 4 }}>
                      {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>PNG, JPG, WEBP up to 10 MB</div>
                  </div>
                )}
                {uploading && <div className="mr-uploading">Uploading image...</div>}
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label className="mr-label" style={{ margin: 0 }}>Visible to users</label>
                <label className="mr-toggle">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <span className="mr-toggle-slider" />
                </label>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="mr-btn-secondary" onClick={() => setTab('list')}>Cancel</button>
              <button className="mr-btn-primary" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Saving...' : editId ? 'Update Region' : 'Create Region'}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
