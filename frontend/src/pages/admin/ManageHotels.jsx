import { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const AMENITIES  = ['WiFi','Parking','Pool','Gym','Restaurant','Bar','Spa','Room Service','Airport Shuttle','Laundry','AC','Heating','TV','Safe','Balcony'];
const CATEGORIES = ['Budget','Mid-Range','Luxury','Boutique','Resort','Hostel','Guesthouse'];
const CITIES     = ['All Cities','Kathmandu','Pokhara','Chitwan','Lalitpur','Bhaktapur','Lumbini','Nagarkot','Bandipur'];

const EMPTY = {
  name:'', category:'Mid-Range', description:'',
  location:{ city:'', district:'', address:'', coordinates:{ lat:'', lng:'' } },
  pricePerNight:'', stars:3, totalRooms:'',
  amenities:[], images:[''],
  contact:{ phone:'', email:'', website:'' },
  checkIn:'14:00', checkOut:'12:00',
  policies:{ petsAllowed:false, smokingAllowed:false, childrenAllowed:true },
  isActive:true,
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .mh-root { font-family:'Plus Jakarta Sans',sans-serif; }
  .mh-msg { padding:12px 16px; border-radius:10px; font-size:13px; font-weight:600; margin-bottom:14px; }
  .mh-toprow { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
  .mh-filterbar { background:#fff; border:1px solid #e5f0e8; border-radius:12px; padding:16px 18px; margin-bottom:16px; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .mh-filterbar-row1 { display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
  .mh-filterbar-row2 { display:flex; gap:8px; flex-wrap:wrap; }
  .mh-search-wrap { flex:1; min-width:240px; display:flex; align-items:center; gap:8px; background:#f8faf8; border:1.5px solid #d1fae5; border-radius:9px; padding:8px 13px; transition:border 0.15s; }
  .mh-search-wrap:focus-within { border-color:#16a34a; background:#fff; }
  .mh-search { border:none; outline:none; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; color:#0f172a; background:transparent; flex:1; }
  .mh-search::placeholder { color:#9ca3af; }
  .mh-add-btn { display:flex; align-items:center; gap:6px; padding:10px 18px; background:#16a34a; color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; white-space:nowrap; transition:background 0.15s; }
  .mh-add-btn:hover { background:#15803d; }
  .mh-filter-select { display:flex; align-items:center; gap:5px; padding:7px 12px; border:1.5px solid #d1fae5; border-radius:8px; font-size:12px; font-weight:500; color:#374151; background:#fff; cursor:pointer; }
  .mh-filter-select select { border:none; background:none; outline:none; font-size:12px; font-weight:500; color:#374151; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; padding:0; }
  .mh-table-card { background:#fff; border-radius:14px; border:1px solid #e5f0e8; overflow:hidden; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .mh-table { width:100%; border-collapse:collapse; }
  .mh-table th { padding:10px 16px; text-align:left; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em; background:#f8faf8; border-bottom:1px solid #e5f0e8; white-space:nowrap; }
  .mh-table td { padding:13px 16px; border-bottom:1px solid #f0fdf4; font-size:13px; color:#374151; vertical-align:middle; }
  .mh-table tr:last-child td { border-bottom:none; }
  .mh-table tr:hover td { background:#fafff8; }
  .mh-badge-active   { background:#f0fdf4; color:#16a34a; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .mh-badge-inactive { background:#F2F4F7; color:#667085; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .mh-act-btns { display:flex; gap:6px; }
  .mh-btn-edit { display:flex; align-items:center; gap:5px; padding:6px 12px; background:#f0fdf4; color:#15803d; border:1px solid #d1fae5; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s; }
  .mh-btn-edit:hover { background:#dcfce7; }
  .mh-btn-del  { display:flex; align-items:center; gap:5px; padding:6px 12px; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s; }
  .mh-btn-del:hover { background:#fee2e2; }
  .mh-back-btn { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#f8faf8; color:#374151; border:1.5px solid #e5f0e8; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s; }
  .mh-back-btn:hover { border-color:#16a34a; color:#15803d; }
  .mh-save-btn { display:flex; align-items:center; gap:6px; padding:10px 20px; background:#16a34a; color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:background 0.15s; }
  .mh-save-btn:hover { background:#15803d; }
  .mh-save-btn:disabled { opacity:.65; cursor:not-allowed; }
  .mh-ftabs { display:flex; gap:3px; background:#f0fdf4; padding:4px; border-radius:10px; flex-wrap:wrap; margin-bottom:20px; }
  .mh-ftab  { padding:7px 14px; border-radius:7px; border:none; cursor:pointer; font-size:12px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; background:transparent; color:#6b7280; transition:all .13s; }
  .mh-ftab.on { background:#fff; color:#16a34a; box-shadow:0 1px 4px rgba(22,163,74,0.15); }
  .mh-fcard { background:#fff; border-radius:14px; border:1px solid #e5f0e8; padding:24px; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .mh-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:700px) { .mh-grid2 { grid-template-columns:1fr; } }
  .mh-full  { grid-column:1/-1; }
  .mh-field { display:flex; flex-direction:column; gap:5px; }
  .mh-label { font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; }
  .mh-inp   { padding:10px 13px; border:1.5px solid #d1fae5; border-radius:9px; font-size:13px; color:#0f172a; outline:none; font-family:'Plus Jakarta Sans',sans-serif; width:100%; transition:border 0.15s; }
  .mh-inp:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.08); }
  .mh-textarea { padding:10px 13px; border:1.5px solid #d1fae5; border-radius:9px; font-size:13px; color:#0f172a; outline:none; font-family:'Plus Jakarta Sans',sans-serif; width:100%; resize:vertical; min-height:90px; transition:border 0.15s; }
  .mh-textarea:focus { border-color:#16a34a; }
  .mh-select   { padding:10px 13px; border:1.5px solid #d1fae5; border-radius:9px; font-size:13px; color:#0f172a; outline:none; font-family:'Plus Jakarta Sans',sans-serif; width:100%; background:#fff; transition:border 0.15s; }
  .mh-select:focus { border-color:#16a34a; }
  .mh-amenity-wrap { display:flex; flex-wrap:wrap; gap:7px; }
  .mh-amenity { padding:6px 13px; border-radius:20px; border:1.5px solid #d1fae5; font-size:12px; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; background:#f8faf8; color:#374151; transition:all .13s; }
  .mh-amenity.on { background:#f0fdf4; border-color:#16a34a; color:#15803d; font-weight:700; }
  .mh-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:#f8faf8; border-radius:10px; border:1px solid #e5f0e8; }
  .mh-toggle { position:relative; cursor:pointer; }
  .mh-toggle input { opacity:0; width:0; height:0; }
  .mh-toggle-sl { display:block; width:40px; height:22px; background:#d1fae5; border-radius:11px; transition:background .2s; position:relative; }
  .mh-toggle-sl::after { content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
  .mh-toggle input:checked + .mh-toggle-sl { background:#16a34a; }
  .mh-toggle input:checked + .mh-toggle-sl::after { transform:translateX(18px); }
  .mh-stars { display:flex; gap:4px; }
  .mh-star  { font-size:22px; cursor:pointer; transition:transform .1s; line-height:1; }
  .mh-star:hover { transform:scale(1.2); }
  .mh-modal-ov { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
  .mh-modal    { background:#fff; border-radius:18px; padding:28px; width:340px; box-shadow:0 20px 60px rgba(0,0,0,.2); text-align:center; }
  .mh-empty { text-align:center; padding:52px 20px; }
  .mh-upload-zone { border:2px dashed #d1fae5; border-radius:10px; padding:24px; text-align:center; cursor:pointer; transition:all .2s; background:#f0fdf4; margin-bottom:16px; }
  .mh-upload-zone:hover { border-color:#16a34a; background:#dcfce7; }
  .mh-img-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:10px; margin-bottom:14px; }
  .mh-img-thumb { position:relative; border-radius:9px; overflow:hidden; aspect-ratio:4/3; background:#f0fdf4; border:1px solid #d1fae5; }
  .mh-img-thumb img { width:100%; height:100%; object-fit:cover; }
  .mh-img-del { position:absolute; top:5px; right:5px; width:22px; height:22px; border-radius:50%; background:rgba(0,0,0,0.55); color:#fff; border:none; cursor:pointer; font-size:11px; display:flex; align-items:center; justify-content:center; }
  .mh-img-del:hover { background:#dc2626; }
  .mh-divider { display:flex; align-items:center; gap:10px; margin:14px 0; color:#9ca3af; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
  .mh-divider::before,.mh-divider::after { content:''; flex:1; height:1px; background:#e5f0e8; }
  .mh-spinner { width:32px; height:32px; border:3px solid #d1fae5; border-top:3px solid #16a34a; border-radius:50%; animation:mh-spin 0.9s linear infinite; margin:0 auto 10px; }
  @keyframes mh-spin { to { transform:rotate(360deg); } }
`;

export default function ManageHotels() {
  const fileRef = useRef(null);
  const [tab,          setTab]          = useState('list');
  const [hotels,       setHotels]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState(EMPTY);
  const [editId,       setEditId]       = useState(null);
  const [formTab,      setFormTab]      = useState('basic');
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cityFilter,   setCityFilter]   = useState('All Cities');
  const [msg,          setMsg]          = useState('');
  const [delConfirm,   setDelConfirm]   = useState(null);
  const [uploading,    setUploading]    = useState(false);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/hotels`, { headers:{ Authorization:`Bearer ${token()}` } });
      setHotels(data.hotels || data || []);
    } catch { setHotels([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHotels(); }, []);

  const startNew = () => { setForm(EMPTY); setEditId(null); setFormTab('basic'); setTab('form'); };

  const startEdit = (h) => {
    let locationObj = { ...EMPTY.location };
    if (typeof h.location === 'string') {
      const parts = h.location.split(',').map(s => s.trim());
      locationObj.city = parts[0] || ''; locationObj.district = parts[1] || ''; locationObj.address = h.address || '';
    } else if (h.location && typeof h.location === 'object') {
      locationObj = { ...EMPTY.location, ...h.location };
    }
    setForm({ ...EMPTY, ...h, location: locationObj, stars: h.starRating || h.stars || 3, contact:{ phone:h.phone||h.contact?.phone||'', email:h.email||h.contact?.email||'', website:h.website||h.contact?.website||'' }, policies:{ ...EMPTY.policies, ...(h.policies||{}) }, amenities:Array.isArray(h.amenities)?h.amenities:[], images:Array.isArray(h.images)&&h.images.length?h.images:[''] });
    setEditId(h._id); setFormTab('basic'); setTab('form');
  };

  const handleSave = async () => {
    if (!form.name.trim())          return notify('⚠️ Hotel name is required');
    if (!form.location.city.trim()) return notify('⚠️ City is required');
    if (!form.pricePerNight)        return notify('⚠️ Price per night is required');
    setSaving(true);
    try {
      const payload = { name:form.name.trim(), description:form.description, location:[form.location.city, form.location.district].filter(Boolean).join(', '), address:form.location.address, pricePerNight:Number(form.pricePerNight), starRating:Number(form.stars)||3, totalRooms:form.totalRooms?Number(form.totalRooms):undefined, amenities:form.amenities, images:form.images.filter(i=>i.trim()), phone:form.contact.phone, email:form.contact.email, website:form.contact.website, checkIn:form.checkIn, checkOut:form.checkOut, isActive:form.isActive, category:form.category };
      if (editId) { await axios.put(`${API}/hotels/${editId}`, payload, { headers:{ Authorization:`Bearer ${token()}` } }); notify('✓ Hotel updated successfully'); }
      else        { await axios.post(`${API}/hotels`, payload, { headers:{ Authorization:`Bearer ${token()}` } }); notify('✓ Hotel created successfully'); }
      fetchHotels(); setTab('list');
    } catch (err) { notify(`⚠️ ${err.response?.data?.message || 'Failed to save hotel'}`); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/hotels/${id}`, { headers:{ Authorization:`Bearer ${token()}` } }); notify('✓ Hotel deleted'); fetchHotels(); }
    catch { notify('⚠️ Failed to delete hotel'); }
    setDelConfirm(null);
  };

  const handleFileUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      fd.append('folder', 'nepal-travel/hotels');
      const { data } = await axios.post(`${API}/images/upload/multiple`, fd, { headers:{ Authorization:`Bearer ${token()}`, 'Content-Type':'multipart/form-data' } });
      const urls = (data.images||[]).map(i => i.secure_url||i.url).filter(Boolean);
      if (urls.length) { setForm(f => ({ ...f, images:[...f.images.filter(i=>i.trim()), ...urls] })); notify(`✓ ${urls.length} photo(s) uploaded`); }
    } catch { notify('⚠️ Upload failed'); }
    setUploading(false);
  };

  const toggleAmenity = (a) => setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x=>x!==a) : [...f.amenities, a] }));

  const setNested = (path, val) => {
    const keys = path.split('.');
    setForm(f => {
      const clone = { ...f };
      let cur = clone;
      for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
      cur[keys[keys.length-1]] = val;
      return clone;
    });
  };

  const locStr = h => typeof h.location === 'string' ? h.location : h.location?.city || '';

  const filtered = hotels.filter(h => {
    const matchSearch = !search || h.name?.toLowerCase().includes(search.toLowerCase()) || locStr(h).toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'All Categories' || h.category === catFilter;
    const matchStatus = statusFilter === 'All Status' || (statusFilter === 'Active' ? h.isActive !== false : h.isActive === false);
    const matchCity   = cityFilter === 'All Cities' || locStr(h).toLowerCase().includes(cityFilter.toLowerCase());
    return matchSearch && matchCat && matchStatus && matchCity;
  });

  const FORM_TABS = ['basic','location','amenities','images','policies'];
  const FORM_TAB_LABELS = { basic:'Basic Info', location:'Location', amenities:'Amenities', images:'Images', policies:'Policies' };

  return (
    <AdminLayout title="Hotels" subtitle={`${hotels.length} properties listed`}>
      <style>{STYLES}</style>
      <div className="mh-root">
        {msg && <div className="mh-msg" style={{ background:msg.startsWith('✓')?'#f0fdf4':'#fef2f2', color:msg.startsWith('✓')?'#16a34a':'#dc2626', border:`1px solid ${msg.startsWith('✓')?'#d1fae5':'#fecaca'}` }}>{msg}</div>}

        {delConfirm && (
          <div className="mh-modal-ov">
            <div className="mh-modal">
              <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:'#0f172a', marginBottom:8 }}>Delete Hotel?</h3>
              <p style={{ fontSize:13, color:'#6b7280', marginBottom:22 }}>This cannot be undone.</p>
              <div style={{ display:'flex', gap:10 }}>
                <button className="mh-back-btn" style={{ flex:1, justifyContent:'center' }} onClick={() => setDelConfirm(null)}>Cancel</button>
                <button className="mh-save-btn" style={{ flex:1, justifyContent:'center', background:'#dc2626' }} onClick={() => handleDelete(delConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'list' ? (
          <>
            <div className="mh-toprow">
              <div><h2 style={{ fontSize:19, fontWeight:800, color:'#0a2818' }}>Hotels</h2><p style={{ fontSize:13, color:'#9ca3af', marginTop:2 }}>Manage your hotel listings</p></div>
              <span style={{ fontSize:13, color:'#9ca3af', alignSelf:'center' }}>Showing {filtered.length} of {hotels.length}</span>
            </div>
            <div className="mh-filterbar">
              <div className="mh-filterbar-row1">
                <div className="mh-search-wrap">
                  <span style={{ color:'#9ca3af' }}>🔍</span>
                  <input className="mh-search" placeholder="Search by name, location…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="mh-add-btn" onClick={startNew}>+ Add Hotel</button>
              </div>
              <div className="mh-filterbar-row2">
                <div className="mh-filter-select"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All Status</option><option>Active</option><option>Inactive</option></select></div>
                <div className="mh-filter-select"><select value={catFilter} onChange={e => setCatFilter(e.target.value)}><option>All Categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div className="mh-filter-select"><select value={cityFilter} onChange={e => setCityFilter(e.target.value)}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
            </div>
            <div className="mh-table-card">
              {loading ? (
                <div style={{ textAlign:'center', padding:48 }}><div className="mh-spinner" /><p style={{ color:'#9ca3af', fontSize:13 }}>Loading hotels…</p></div>
              ) : filtered.length === 0 ? (
                <div className="mh-empty">
                  <div style={{ fontSize:40, marginBottom:12 }}>🏨</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0a2818', marginBottom:6 }}>{hotels.length===0?'No hotels yet':'No hotels match your filters'}</div>
                  <div style={{ fontSize:13, color:'#9ca3af', marginBottom:18 }}>{hotels.length===0?'Add your first hotel listing':'Try adjusting your filters'}</div>
                  {hotels.length===0 && <button className="mh-add-btn" onClick={startNew} style={{ margin:'0 auto' }}>+ Add Hotel</button>}
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="mh-table">
                    <thead><tr><th>Hotel</th><th>Location</th><th>Category</th><th>Price/Night</th><th>Stars</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {filtered.map(h => (
                        <tr key={h._id}>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              {(h.mainImage||h.images?.[0]) ? <img src={h.mainImage||h.images[0]} alt={h.name} style={{ width:40,height:40,borderRadius:8,objectFit:'cover',flexShrink:0 }} onError={e=>{e.target.style.display='none';}} /> : <div style={{ width:40,height:40,borderRadius:8,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>🏨</div>}
                              <div><div style={{ fontWeight:600, color:'#0a2818' }}>{h.name}</div><div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{h.totalRooms?`${h.totalRooms} rooms`:''}</div></div>
                            </div>
                          </td>
                          <td style={{ color:'#6b7280' }}>{locStr(h)}</td>
                          <td><span style={{ background:'#f0fdf4', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, color:'#15803d' }}>{h.category||'—'}</span></td>
                          <td style={{ fontWeight:700, color:'#0a2818' }}>NPR {Number(h.pricePerNight||0).toLocaleString()}</td>
                          <td style={{ color:'#f59e0b', fontWeight:700 }}>{'★'.repeat(h.starRating||h.stars||0)||'—'}</td>
                          <td><span className={h.isActive!==false?'mh-badge-active':'mh-badge-inactive'}>{h.isActive!==false?'Active':'Inactive'}</span></td>
                          <td><div className="mh-act-btns"><button className="mh-btn-edit" onClick={()=>startEdit(h)}>✏️ Edit</button><button className="mh-btn-del" onClick={()=>setDelConfirm(h._id)}>🗑️ Delete</button></div></td>
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
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div><h2 style={{ fontSize:18, fontWeight:800, color:'#0a2818' }}>{editId?'Edit Hotel':'Add New Hotel'}</h2><p style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>Fill in all tabs to complete the listing</p></div>
              <button className="mh-back-btn" onClick={()=>setTab('list')}>← Back to list</button>
            </div>
            <div className="mh-ftabs">
              {FORM_TABS.map(t => <button key={t} className={`mh-ftab${formTab===t?' on':''}`} onClick={()=>setFormTab(t)}>{FORM_TAB_LABELS[t]}</button>)}
            </div>
            <div className="mh-fcard">
              {formTab === 'basic' && (
                <div className="mh-grid2">
                  <div className="mh-field mh-full"><label className="mh-label">Hotel Name *</label><input className="mh-inp" placeholder="e.g. Hotel Yak & Yeti" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                  <div className="mh-field"><label className="mh-label">Category</label><select className="mh-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div className="mh-field"><label className="mh-label">Price Per Night (NPR) *</label><input className="mh-inp" type="number" placeholder="5000" value={form.pricePerNight} onChange={e=>setForm(f=>({...f,pricePerNight:e.target.value}))} /></div>
                  <div className="mh-field"><label className="mh-label">Total Rooms</label><input className="mh-inp" type="number" placeholder="50" value={form.totalRooms} onChange={e=>setForm(f=>({...f,totalRooms:e.target.value}))} /></div>
                  <div className="mh-field"><label className="mh-label">Star Rating</label><div className="mh-stars">{[1,2,3,4,5].map(n=><span key={n} className="mh-star" onClick={()=>setForm(f=>({...f,stars:n}))}>{n<=form.stars?'★':'☆'}</span>)}</div></div>
                  <div className="mh-field"><label className="mh-label">Check-in / Check-out</label><div style={{ display:'flex', gap:8 }}><input className="mh-inp" type="time" value={form.checkIn} onChange={e=>setForm(f=>({...f,checkIn:e.target.value}))} /><input className="mh-inp" type="time" value={form.checkOut} onChange={e=>setForm(f=>({...f,checkOut:e.target.value}))} /></div></div>
                  <div className="mh-field mh-full"><label className="mh-label">Description</label><textarea className="mh-textarea" placeholder="Describe the hotel…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
                  <div className="mh-field" style={{ flexDirection:'row', alignItems:'center', gap:10 }}><label className="mh-label">Active Listing</label><label className="mh-toggle"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} /><span className="mh-toggle-sl" /></label></div>
                </div>
              )}
              {formTab === 'location' && (
                <div className="mh-grid2">
                  <div className="mh-field"><label className="mh-label">City *</label><input className="mh-inp" placeholder="Kathmandu" value={form.location.city} onChange={e=>setNested('location.city',e.target.value)} /></div>
                  <div className="mh-field"><label className="mh-label">District</label><input className="mh-inp" placeholder="Bagmati" value={form.location.district} onChange={e=>setNested('location.district',e.target.value)} /></div>
                  <div className="mh-field mh-full"><label className="mh-label">Full Address</label><input className="mh-inp" placeholder="Street address, landmark" value={form.location.address} onChange={e=>setNested('location.address',e.target.value)} /></div>
                  <div className="mh-field"><label className="mh-label">Latitude</label><input className="mh-inp" type="number" step="any" placeholder="27.7172" value={form.location.coordinates?.lat} onChange={e=>setNested('location.coordinates.lat',e.target.value)} /></div>
                  <div className="mh-field"><label className="mh-label">Longitude</label><input className="mh-inp" type="number" step="any" placeholder="85.3240" value={form.location.coordinates?.lng} onChange={e=>setNested('location.coordinates.lng',e.target.value)} /></div>
                  <div className="mh-field"><label className="mh-label">Phone</label><input className="mh-inp" placeholder="+977-1-XXXXXXX" value={form.contact.phone} onChange={e=>setNested('contact.phone',e.target.value)} /></div>
                  <div className="mh-field"><label className="mh-label">Email</label><input className="mh-inp" type="email" placeholder="hotel@example.com" value={form.contact.email} onChange={e=>setNested('contact.email',e.target.value)} /></div>
                  <div className="mh-field mh-full"><label className="mh-label">Website</label><input className="mh-inp" placeholder="https://www.hotel.com" value={form.contact.website} onChange={e=>setNested('contact.website',e.target.value)} /></div>
                </div>
              )}
              {formTab === 'amenities' && (
                <div>
                  <p style={{ fontSize:13, color:'#6b7280', marginBottom:14 }}>Select all amenities available at this hotel:</p>
                  <div className="mh-amenity-wrap">{AMENITIES.map(a=><button key={a} className={`mh-amenity${form.amenities.includes(a)?' on':''}`} onClick={()=>toggleAmenity(a)}>{a}</button>)}</div>
                  <div style={{ marginTop:16, padding:'10px 14px', background:'#f0fdf4', borderRadius:8, fontSize:12, color:'#15803d', fontWeight:600 }}>{form.amenities.length} amenities selected</div>
                </div>
              )}
              {formTab === 'images' && (
                <div>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e=>handleFileUpload(e.target.files)} />
                  <div className="mh-upload-zone" onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFileUpload(e.dataTransfer.files);}}>
                    <div style={{ fontSize:28, marginBottom:8 }}>{uploading?'⏳':'📷'}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#0a2818', marginBottom:4 }}>{uploading?'Uploading…':'Upload photos from your device'}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>Drag & drop or click · JPG, PNG, WebP</div>
                    {!uploading && <button className="mh-save-btn" style={{ margin:'0 auto' }} onClick={e=>{e.stopPropagation();fileRef.current?.click();}}>📷 Choose Photos</button>}
                  </div>
                  {form.images.filter(i=>i.trim()).length > 0 && (
                    <><p style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:10 }}>🖼️ {form.images.filter(i=>i.trim()).length} photo(s) added</p>
                    <div className="mh-img-grid">{form.images.filter(i=>i.trim()).map((img,i)=><div key={i} className="mh-img-thumb"><img src={img} alt="" onError={e=>{e.target.style.display='none';}} /><button className="mh-img-del" onClick={()=>setForm(f=>({...f,images:f.images.filter(x=>x!==img)}))}>✕</button></div>)}</div></>
                  )}
                  <div className="mh-divider">or paste URL</div>
                  {form.images.map((img,i)=><div key={i} style={{ display:'flex',gap:8,marginBottom:8 }}><input className="mh-inp" placeholder={`Image URL ${i+1}`} value={img} onChange={e=>{const imgs=[...form.images];imgs[i]=e.target.value;setForm(f=>({...f,images:imgs}));}} />{form.images.length>1&&<button className="mh-btn-del" onClick={()=>setForm(f=>({...f,images:f.images.filter((_,j)=>j!==i)}))}>✕</button>}</div>)}
                  <button className="mh-back-btn" style={{ marginTop:4 }} onClick={()=>setForm(f=>({...f,images:[...f.images,'']}))}>+ Add URL</button>
                </div>
              )}
              {formTab === 'policies' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[{ key:'childrenAllowed',label:'Children Allowed',desc:'Guests may bring children',icon:'👨‍👩‍👧' },{ key:'petsAllowed',label:'Pets Allowed',desc:'Guests may bring pets',icon:'🐾' },{ key:'smokingAllowed',label:'Smoking Allowed',desc:'Smoking permitted on premises',icon:'🚬' }].map(p=>(
                    <div key={p.key} className="mh-toggle-row">
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}><span style={{ fontSize:22 }}>{p.icon}</span><div><div style={{ fontWeight:600,fontSize:13,color:'#0a2818' }}>{p.label}</div><div style={{ fontSize:12,color:'#9ca3af' }}>{p.desc}</div></div></div>
                      <label className="mh-toggle"><input type="checkbox" checked={form.policies[p.key]} onChange={e=>setNested(`policies.${p.key}`,e.target.checked)} /><span className="mh-toggle-sl" /></label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:18 }}>
              <button className="mh-back-btn" onClick={()=>setTab('list')}>Cancel</button>
              <button className="mh-save-btn" onClick={handleSave} disabled={saving}>{saving?'⏳ Saving…':editId?'✓ Update Hotel':'+ Create Hotel'}</button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
