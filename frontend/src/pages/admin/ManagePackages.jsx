import { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const DIFFICULTIES  = ['Easy','Moderate','Challenging','Strenuous','Expert'];
const CATEGORIES    = ['Trekking','Cultural','Adventure','Wildlife','Spiritual','Photography','Cycling','Rafting','Family','Luxury'];
const INCLUDES_OPTS = ['Accommodation','Meals (B/L/D)','Guide','Porter','Transport','Permits','Equipment','Insurance','Airport Pickup','Welcome Dinner'];
const REGIONS       = ['Khumbu / Everest','Annapurna','Langtang','Manaslu','Mustang','Dolpo','Kanchenjunga','Makalu','Rolwaling','Kathmandu Valley','Pokhara','Chitwan','Lumbini','Other'];
const SEASONS       = ['Spring (Mar–May)','Summer (Jun–Aug)','Autumn (Sep–Nov)','Winter (Dec–Feb)'];

const DIFF_COLOR = { Easy:'#027A48', Moderate:'#B54708', Challenging:'#B42318', Strenuous:'#B42318', Expert:'#6B21A8' };
const DIFF_BG    = { Easy:'#ECFDF3', Moderate:'#FFFAEB', Challenging:'#FEF3F2', Strenuous:'#FEF3F2', Expert:'#F5F3FF' };

const EMPTY_DAY = { day:1, title:'', description:'', elevation:'', distance:'' };
const EMPTY = {
  title:'', category:'Trekking', difficulty:'Moderate', duration:'',
  groupSize:{ min:1, max:15 },
  price:{ amount:'', currency:'NPR', perPerson:true },
  description:'', highlights:[''],
  itinerary:[{ ...EMPTY_DAY }],
  includes:[], excludes:[''],
  startLocation:'', endLocation:'',
  region:'', destination:'',
  lat:'', lng:'',
  bestSeason:[], images:[''],
  isActive:true, isFeatured:false,
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  .mp-root { font-family:'Roboto',sans-serif; }
  .mp-msg { padding:12px 16px; border-radius:10px; font-size:13px; font-weight:600; margin-bottom:14px; }
  .mp-toprow { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
  .mp-filterbar { background:#fff; border:1px solid #e5f0e8; border-radius:12px; padding:16px 18px; margin-bottom:16px; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .mp-filterbar-r1 { display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
  .mp-filterbar-r2 { display:flex; gap:8px; flex-wrap:wrap; }
  .mp-search-wrap { flex:1; min-width:240px; display:flex; align-items:center; gap:8px; background:#f8faf8; border:1.5px solid #d1fae5; border-radius:9px; padding:8px 13px; transition:border 0.15s; }
  .mp-search-wrap:focus-within { border-color:#16a34a; background:#fff; }
  .mp-search { border:none; outline:none; font-size:13px; font-family:'Roboto',sans-serif; color:#0f172a; background:transparent; flex:1; }
  .mp-search::placeholder { color:#9ca3af; }
  .mp-add-btn { display:flex; align-items:center; gap:6px; padding:10px 18px; background:#16a34a; color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Roboto',sans-serif; white-space:nowrap; transition:background 0.15s; }
  .mp-add-btn:hover { background:#15803d; }
  .mp-fsel { display:flex; align-items:center; gap:5px; padding:7px 12px; border:1.5px solid #d1fae5; border-radius:8px; font-size:12px; font-weight:500; color:#374151; background:#fff; cursor:pointer; }
  .mp-fsel select { border:none; background:none; outline:none; font-size:12px; font-weight:500; color:#374151; cursor:pointer; font-family:'Roboto',sans-serif; padding:0; }
  .mp-table-card { background:#fff; border-radius:14px; border:1px solid #e5f0e8; overflow:hidden; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .mp-table { width:100%; border-collapse:collapse; }
  .mp-table th { padding:10px 16px; text-align:left; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em; background:#f8faf8; border-bottom:1px solid #e5f0e8; white-space:nowrap; }
  .mp-table td { padding:13px 16px; border-bottom:1px solid #f0fdf4; font-size:13px; color:#374151; vertical-align:middle; }
  .mp-table tr:last-child td { border-bottom:none; }
  .mp-table tr:hover td { background:#fafff8; }
  .mp-act-btns { display:flex; gap:6px; }
  .mp-btn-edit { display:flex; align-items:center; gap:5px; padding:6px 12px; background:#f0fdf4; color:#15803d; border:1px solid #d1fae5; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; font-family:'Roboto',sans-serif; transition:all 0.15s; }
  .mp-btn-edit:hover { background:#dcfce7; }
  .mp-btn-del  { display:flex; align-items:center; gap:5px; padding:6px 12px; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; font-family:'Roboto',sans-serif; transition:all 0.15s; }
  .mp-btn-del:hover { background:#fee2e2; }
  .mp-back-btn { display:flex; align-items:center; gap:6px; padding:9px 16px; background:#f8faf8; color:#374151; border:1.5px solid #e5f0e8; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Roboto',sans-serif; transition:all 0.15s; }
  .mp-back-btn:hover { border-color:#16a34a; color:#15803d; }
  .mp-save-btn { display:flex; align-items:center; gap:6px; padding:10px 20px; background:#16a34a; color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Roboto',sans-serif; transition:background 0.15s; }
  .mp-save-btn:hover { background:#15803d; }
  .mp-save-btn:disabled { opacity:.65; cursor:not-allowed; }
  .mp-ftabs { display:flex; gap:3px; background:#f0fdf4; padding:4px; border-radius:10px; flex-wrap:wrap; margin-bottom:20px; }
  .mp-ftab  { padding:7px 14px; border-radius:7px; border:none; cursor:pointer; font-size:12px; font-weight:600; font-family:'Roboto',sans-serif; background:transparent; color:#6b7280; transition:all .13s; }
  .mp-ftab.on { background:#fff; color:#16a34a; box-shadow:0 1px 4px rgba(22,163,74,0.15); }
  .mp-fcard { background:#fff; border-radius:14px; border:1px solid #e5f0e8; padding:24px; box-shadow:0 2px 8px rgba(22,163,74,0.04); }
  .mp-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:700px) { .mp-grid2 { grid-template-columns:1fr; } }
  .mp-full  { grid-column:1/-1; }
  .mp-field { display:flex; flex-direction:column; gap:5px; }
  .mp-label { font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; }
  .mp-inp   { padding:10px 13px; border:1.5px solid #d1fae5; border-radius:9px; font-size:13px; color:#0f172a; outline:none; font-family:'Roboto',sans-serif; width:100%; transition:border 0.15s; }
  .mp-inp:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.08); }
  .mp-textarea { padding:10px 13px; border:1.5px solid #d1fae5; border-radius:9px; font-size:13px; color:#0f172a; outline:none; font-family:'Roboto',sans-serif; width:100%; resize:vertical; min-height:90px; transition:border 0.15s; }
  .mp-textarea:focus { border-color:#16a34a; }
  .mp-select   { padding:10px 13px; border:1.5px solid #d1fae5; border-radius:9px; font-size:13px; color:#0f172a; outline:none; font-family:'Roboto',sans-serif; width:100%; background:#fff; transition:border 0.15s; }
  .mp-select:focus { border-color:#16a34a; }
  .mp-tag { padding:6px 13px; border-radius:20px; border:1.5px solid #d1fae5; font-size:12px; cursor:pointer; font-family:'Roboto',sans-serif; background:#f8faf8; color:#374151; transition:all .13s; }
  .mp-tag.on { background:#f0fdf4; border-color:#16a34a; color:#15803d; font-weight:700; }
  .mp-day-card { background:#f8faf8; border:1px solid #e5f0e8; border-radius:10px; padding:16px; margin-bottom:10px; }
  .mp-toggle { position:relative; cursor:pointer; display:inline-flex; }
  .mp-toggle input { opacity:0; width:0; height:0; }
  .mp-toggle-sl { display:block; width:40px; height:22px; background:#d1fae5; border-radius:11px; transition:background .2s; position:relative; }
  .mp-toggle-sl::after { content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
  .mp-toggle input:checked + .mp-toggle-sl { background:#16a34a; }
  .mp-toggle input:checked + .mp-toggle-sl::after { transform:translateX(18px); }
  .mp-modal-ov { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
  .mp-modal    { background:#fff; border-radius:18px; padding:28px; width:340px; box-shadow:0 20px 60px rgba(0,0,0,.2); text-align:center; }
  .mp-empty { text-align:center; padding:52px 20px; }
  .mp-upload-zone { border:2px dashed #d1fae5; border-radius:10px; padding:24px; text-align:center; cursor:pointer; transition:all .2s; background:#f0fdf4; margin-bottom:16px; }
  .mp-upload-zone:hover { border-color:#16a34a; background:#dcfce7; }
  .mp-img-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:10px; margin-bottom:14px; }
  .mp-img-thumb { position:relative; border-radius:9px; overflow:hidden; aspect-ratio:4/3; background:#f0fdf4; border:1px solid #d1fae5; }
  .mp-img-thumb img { width:100%; height:100%; object-fit:cover; }
  .mp-img-del { position:absolute; top:5px; right:5px; width:22px; height:22px; border-radius:50%; background:rgba(0,0,0,0.55); color:#fff; border:none; cursor:pointer; font-size:11px; display:flex; align-items:center; justify-content:center; }
  .mp-img-del:hover { background:#dc2626; }
  .mp-divider { display:flex; align-items:center; gap:10px; margin:14px 0; color:#9ca3af; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
  .mp-divider::before,.mp-divider::after { content:''; flex:1; height:1px; background:#e5f0e8; }
  .mp-spinner { width:32px; height:32px; border:3px solid #d1fae5; border-top:3px solid #16a34a; border-radius:50%; animation:mp-spin 0.9s linear infinite; margin:0 auto 10px; }
  @keyframes mp-spin { to { transform:rotate(360deg); } }
  .mp-map-picker-wrap { border-radius:12px; overflow:hidden; border:2px solid #d1fae5; position:relative; transition:border-color 0.2s; }
  .mp-map-picker-wrap:hover { border-color:#16a34a; }
  .mp-map-picker-wrap .leaflet-container { height:320px; width:100%; cursor:crosshair !important; font-family:'Roboto',sans-serif; }
  .mp-map-hint { position:absolute; top:10px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.82); color:#fff; font-size:12px; font-weight:600; padding:6px 14px; border-radius:20px; z-index:1000; pointer-events:none; white-space:nowrap; backdrop-filter:blur(4px); display:flex; align-items:center; gap:6px; }
  .mp-coords-display { display:flex; gap:10px; margin-top:10px; }
  .mp-coord-pill { flex:1; background:#f0fdf4; border:1.5px solid #d1fae5; border-radius:9px; padding:9px 13px; font-size:12px; font-weight:700; color:#15803d; display:flex; align-items:center; gap:6px; }
  .mp-coord-pill span { color:#6b7280; font-weight:400; font-size:11px; }
  .mp-map-clear-btn { position:absolute; bottom:10px; right:10px; z-index:1000; background:#fff; border:1.5px solid #fecaca; color:#dc2626; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:700; cursor:pointer; font-family:'Roboto',sans-serif; display:flex; align-items:center; gap:5px; box-shadow:0 2px 8px rgba(0,0,0,0.1); transition:all 0.15s; }
  .mp-map-clear-btn:hover { background:#fef2f2; }
`;

// ── Leaflet Map Picker (same as ManageHotels) ─────────────────────────────────
function MapPicker({ lat, lng, onChange }) {
  const leafletRef   = useRef(null);
  const markerRef    = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    };
    const initMap = () => {
      if (!containerRef.current || leafletRef.current) return;
      const L = window.L;
      const map = L.map(containerRef.current, {
        center: [lat || 27.9881, lng || 86.9250], // Default: Everest region
        zoom: lat ? 10 : 7,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      const greenIcon = L.divIcon({
        html: `<div style="width:32px;height:32px;background:#16a34a;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(22,163,74,0.5);"></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32], className: '',
      });
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { icon: greenIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', e => { const p = e.target.getLatLng(); onChange(p.lat.toFixed(6), p.lng.toFixed(6)); });
      }
      map.on('click', e => {
        const { lat: cLat, lng: cLng } = e.latlng;
        if (markerRef.current) markerRef.current.setLatLng([cLat, cLng]);
        else {
          markerRef.current = L.marker([cLat, cLng], { icon: greenIcon, draggable: true }).addTo(map);
          markerRef.current.on('dragend', ev => { const p = ev.target.getLatLng(); onChange(p.lat.toFixed(6), p.lng.toFixed(6)); });
        }
        onChange(cLat.toFixed(6), cLng.toFixed(6));
      });
      leafletRef.current = map;
    };
    loadLeaflet();
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; markerRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!leafletRef.current || !window.L) return;
    if (!lat && !lng && markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
  }, [lat, lng]);

  const handleClear = () => { if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; } onChange('', ''); };

  return (
    <div>
      <div className="mp-map-picker-wrap">
        <div ref={containerRef} style={{ height: 320 }} />
        <div className="mp-map-hint">📍 Click anywhere to pin the trekking destination</div>
        {lat && lng && <button className="mp-map-clear-btn" onClick={handleClear} type="button">✕ Clear Pin</button>}
      </div>
      <div className="mp-coords-display">
        <div className="mp-coord-pill"><span>Latitude</span>{lat || <span style={{color:'#d1d5db'}}>not set</span>}</div>
        <div className="mp-coord-pill"><span>Longitude</span>{lng || <span style={{color:'#d1d5db'}}>not set</span>}</div>
      </div>
    </div>
  );
}

export default function ManagePackages() {
  const fileRef = useRef(null);
  const [tab,          setTab]          = useState('list');
  const [packages,     setPackages]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState(EMPTY);
  const [editId,       setEditId]       = useState(null);
  const [formTab,      setFormTab]      = useState('basic');
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('All Categories');
  const [diffFilter,   setDiffFilter]   = useState('All Difficulties');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [msg,          setMsg]          = useState('');
  const [delConfirm,   setDelConfirm]   = useState(null);
  const [uploading,    setUploading]    = useState(false);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/packages`, { headers:{ Authorization:`Bearer ${token()}` } });
      setPackages(data.packages || data || []);
    } catch { setPackages([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPackages(); }, []);

  const displayName  = (p) => p.name || p.title || 'Untitled';
  const displayPrice = (p) => { if (typeof p.price === 'object') return Number(p.price?.amount || 0); return Number(p.price || 0); };

  const startNew = () => { setForm(EMPTY); setEditId(null); setFormTab('basic'); setTab('form'); };

  const startEdit = (p) => {
    const incl = [];
    if (p.includes?.accommodation) incl.push('Accommodation');
    if (p.includes?.transport)     incl.push('Transport');
    if (p.includes?.guide)         incl.push('Guide');
    if (p.includes?.meals)         incl.push('Meals (B/L/D)');
    if (p.includes?.activities?.length) incl.push(...p.includes.activities);
    setForm({
      ...EMPTY, ...p,
      title:       p.name || p.title || '',
      region:      p.region || '',
      destination: p.destination || p.location || '',
      lat:         p.lat || '',
      lng:         p.lng || '',
      price:       { amount:String(displayPrice(p)), currency:'NPR', perPerson:true },
      groupSize:   { min:1, max:p.maxGroupSize||15 },
      highlights:  p.highlights?.length ? p.highlights : [''],
      excludes:    p.excludes?.length   ? p.excludes   : [''],
      itinerary:   p.itinerary?.length  ? p.itinerary  : [{ ...EMPTY_DAY }],
      includes:    incl,
      bestSeason:  p.bestSeason || [],
      images:      Array.isArray(p.images) && p.images.length ? p.images : [''],
    });
    setEditId(p._id); setFormTab('basic'); setTab('form');
  };

  const handleSave = async () => {
    if (!form.title.trim())        return notify('⚠️ Package title is required');
    if (!form.duration)            return notify('⚠️ Duration is required');
    if (!form.price.amount)        return notify('⚠️ Price is required');
    if (!form.description?.trim()) return notify('⚠️ Description is required');
    setSaving(true);
    try {
      const payload = {
        name:          form.title.trim(),
        description:   form.description.trim(),
        duration:      Number(form.duration),
        price:         Number(form.price.amount),
        maxGroupSize:  Number(form.groupSize?.max) || 15,
        difficulty:    form.difficulty === 'Strenuous' ? 'Challenging' : form.difficulty,
        category:      form.category,
        region:        form.region,
        destination:   form.destination,
        location:      form.destination || form.region,   // ✅ also set location for compatibility
        lat:           form.lat ? parseFloat(form.lat) : null,
        lng:           form.lng ? parseFloat(form.lng) : null,
        images:        form.images.filter(i => i.trim()),
        isActive:      form.isActive,
        isFeatured:    form.isFeatured,
        startLocation: form.startLocation,
        endLocation:   form.endLocation,
        bestSeason:    form.bestSeason,
        highlights:    form.highlights.filter(h => h.trim()),
        excludes:      form.excludes.filter(e => e.trim()),
        itinerary:     form.itinerary.map(d => ({ day:d.day, title:d.title, description:d.description, elevation:d.elevation, distance:d.distance })),
        includes: {
          accommodation: form.includes.includes('Accommodation'),
          transport:     form.includes.includes('Transport'),
          guide:         form.includes.includes('Guide'),
          meals:         form.includes.includes('Meals (B/L/D)') ? 'All meals' : '',
          activities:    form.includes.filter(i => !['Accommodation','Transport','Guide','Meals (B/L/D)'].includes(i)),
        },
      };
      if (editId) {
        await axios.put(`${API}/packages/${editId}`, payload, { headers:{ Authorization:`Bearer ${token()}` } });
        notify('✓ Package updated successfully');
      } else {
        await axios.post(`${API}/packages`, payload, { headers:{ Authorization:`Bearer ${token()}` } });
        notify('✓ Package created successfully');
      }
      fetchPackages(); setTab('list');
    } catch (err) {
      notify(`⚠️ ${err.response?.data?.message || err.response?.data?.error || 'Failed to save'}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/packages/${id}`, { headers:{ Authorization:`Bearer ${token()}` } }); notify('✓ Package deleted'); fetchPackages(); }
    catch { notify('⚠️ Failed to delete'); }
    setDelConfirm(null);
  };

  const handleFileUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      fd.append('folder', 'nepal-travel/packages');
      const { data } = await axios.post(`${API}/images/upload/multiple`, fd, { headers:{ Authorization:`Bearer ${token()}`, 'Content-Type':'multipart/form-data' } });
      const urls = (data?.images||[]).map(i=>i?.secure_url||i?.url).filter(Boolean);
      if (urls.length) { setForm(f=>({...f,images:[...f.images.filter(i=>i.trim()),...urls]})); notify(`✓ ${urls.length} photo(s) uploaded`); }
    } catch (err) { notify(`⚠️ ${err.response?.data?.message||'Upload failed'}`); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleArr = (field, val) => setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x=>x!==val) : [...f[field], val] }));
  const updateDay = (i, k, v) => setForm(f => { const it=[...f.itinerary]; it[i]={...it[i],[k]:v}; return {...f,itinerary:it}; });
  const addDay    = () => setForm(f => ({ ...f, itinerary:[...f.itinerary,{...EMPTY_DAY,day:f.itinerary.length+1}] }));
  const removeDay = (i) => setForm(f => ({ ...f, itinerary:f.itinerary.filter((_,j)=>j!==i).map((d,j)=>({...d,day:j+1})) }));

  const filtered = packages.filter(p => {
    const name = displayName(p).toLowerCase();
    return (
      (!search || name.includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()) || p.region?.toLowerCase().includes(search.toLowerCase())) &&
      (catFilter==='All Categories'  || p.category===catFilter) &&
      (diffFilter==='All Difficulties' || p.difficulty===diffFilter) &&
      (statusFilter==='All Status'   || (statusFilter==='Active' ? p.isActive!==false : p.isActive===false))
    );
  });

  const FORM_TABS = ['basic','destination','itinerary','includes','images'];
  const FTAB_LABELS = { basic:'Basic Info', destination:'Destination & Map', itinerary:'Itinerary', includes:"What's Included", images:'Images' };

  return (
    <AdminLayout title="Packages" subtitle={`${packages.length} travel packages`}>
      <style>{STYLES}</style>
      <div className="mp-root">
        {msg && <div className="mp-msg" style={{ background:msg.startsWith('✓')?'#f0fdf4':'#fef2f2', color:msg.startsWith('✓')?'#16a34a':'#dc2626', border:`1px solid ${msg.startsWith('✓')?'#d1fae5':'#fecaca'}` }}>{msg}</div>}

        {delConfirm && (
          <div className="mp-modal-ov">
            <div className="mp-modal">
              <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:'#0f172a', marginBottom:8 }}>Delete Package?</h3>
              <p style={{ fontSize:13, color:'#6b7280', marginBottom:22 }}>This cannot be undone.</p>
              <div style={{ display:'flex', gap:10 }}>
                <button className="mp-back-btn" style={{ flex:1, justifyContent:'center' }} onClick={()=>setDelConfirm(null)}>Cancel</button>
                <button className="mp-save-btn" style={{ flex:1, justifyContent:'center', background:'#dc2626' }} onClick={()=>handleDelete(delConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'list' ? (
          <>
            <div className="mp-toprow">
              <div><h2 style={{ fontSize:19, fontWeight:800, color:'#0a2818' }}>Packages</h2><p style={{ fontSize:13, color:'#9ca3af', marginTop:2 }}>Manage your travel packages</p></div>
              <span style={{ fontSize:13, color:'#9ca3af', alignSelf:'center' }}>Showing {filtered.length} of {packages.length}</span>
            </div>
            <div className="mp-filterbar">
              <div className="mp-filterbar-r1">
                <div className="mp-search-wrap"><span style={{ color:'#9ca3af' }}>🔍</span><input className="mp-search" placeholder="Search by name, category, region…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
                <button className="mp-add-btn" onClick={startNew}>+ Add Package</button>
              </div>
              <div className="mp-filterbar-r2">
                <div className="mp-fsel"><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All Status</option><option>Active</option><option>Inactive</option></select></div>
                <div className="mp-fsel"><select value={catFilter} onChange={e=>setCatFilter(e.target.value)}><option>All Categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div className="mp-fsel"><select value={diffFilter} onChange={e=>setDiffFilter(e.target.value)}><option>All Difficulties</option>{DIFFICULTIES.map(d=><option key={d}>{d}</option>)}</select></div>
              </div>
            </div>
            <div className="mp-table-card">
              {loading ? (
                <div style={{ textAlign:'center', padding:48 }}><div className="mp-spinner" /><p style={{ color:'#9ca3af', fontSize:13 }}>Loading packages…</p></div>
              ) : filtered.length === 0 ? (
                <div className="mp-empty">
                  <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0a2818', marginBottom:6 }}>{packages.length===0?'No packages yet':'No packages match filters'}</div>
                  <div style={{ fontSize:13, color:'#9ca3af', marginBottom:18 }}>{packages.length===0?'Add your first travel package':'Try adjusting your filters'}</div>
                  {packages.length===0 && <button className="mp-add-btn" onClick={startNew} style={{ margin:'0 auto' }}>+ Add Package</button>}
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="mp-table">
                    <thead><tr><th>Package</th><th>Region</th><th>Category</th><th>Difficulty</th><th>Duration</th><th>Price</th><th>Map Pin</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p._id}>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              {p.images?.[0] ? <img src={p.images[0]} alt={displayName(p)} style={{ width:40,height:40,borderRadius:8,objectFit:'cover',flexShrink:0 }} onError={e=>{e.target.style.display='none';}} /> : <div style={{ width:40,height:40,borderRadius:8,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>📦</div>}
                              <div><div style={{ fontWeight:600, color:'#0a2818' }}>{displayName(p)}</div><div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{p.maxGroupSize?`Max ${p.maxGroupSize} pax`:''}</div></div>
                            </div>
                          </td>
                          <td style={{ color:'#6b7280' }}>{p.region || p.destination || '—'}</td>
                          <td><span style={{ background:'#f0fdf4', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, color:'#15803d' }}>{p.category||'—'}</span></td>
                          <td><span style={{ background:DIFF_BG[p.difficulty]||'#f0fdf4', color:DIFF_COLOR[p.difficulty]||'#15803d', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{p.difficulty||'—'}</span></td>
                          <td style={{ color:'#6b7280' }}>{p.duration?`${p.duration} days`:'—'}</td>
                          <td style={{ fontWeight:700, color:'#0a2818' }}>NPR {Number(displayPrice(p)||0).toLocaleString()}</td>
                          <td>
                            {p.lat && p.lng
                              ? <span style={{ background:'#f0fdf4', color:'#16a34a', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>📍 Pinned</span>
                              : <span style={{ background:'#f8f8f8', color:'#9ca3af', padding:'3px 10px', borderRadius:20, fontSize:11 }}>No pin</span>}
                          </td>
                          <td><span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:p.isActive!==false?'#f0fdf4':'#F2F4F7', color:p.isActive!==false?'#16a34a':'#667085' }}>{p.isActive!==false?'Active':'Inactive'}</span></td>
                          <td><div className="mp-act-btns"><button className="mp-btn-edit" onClick={()=>startEdit(p)}>✏️ Edit</button><button className="mp-btn-del" onClick={()=>setDelConfirm(p._id)}>🗑️ Delete</button></div></td>
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
              <div><h2 style={{ fontSize:18, fontWeight:800, color:'#0a2818' }}>{editId?'Edit Package':'Add New Package'}</h2><p style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>Fill in all tabs to complete the listing</p></div>
              <button className="mp-back-btn" onClick={()=>setTab('list')}>← Back to list</button>
            </div>

            <div className="mp-ftabs">
              {FORM_TABS.map(t=><button key={t} className={`mp-ftab${formTab===t?' on':''}`} onClick={()=>setFormTab(t)}>{FTAB_LABELS[t]}</button>)}
            </div>

            <div className="mp-fcard">

              {/* ── BASIC INFO ── */}
              {formTab === 'basic' && (
                <div className="mp-grid2">
                  <div className="mp-field mp-full"><label className="mp-label">Package Title *</label><input className="mp-inp" placeholder="e.g. Everest Base Camp Trek" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
                  <div className="mp-field"><label className="mp-label">Category</label><select className="mp-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div className="mp-field"><label className="mp-label">Difficulty</label><select className="mp-select" value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}>{DIFFICULTIES.map(d=><option key={d}>{d}</option>)}</select></div>
                  <div className="mp-field"><label className="mp-label">Duration (days) *</label><input className="mp-inp" type="number" placeholder="14" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} /></div>
                  <div className="mp-field"><label className="mp-label">Price (NPR) *</label><input className="mp-inp" type="number" placeholder="45000" value={form.price.amount} onChange={e=>setForm(f=>({...f,price:{...f.price,amount:e.target.value}}))} /></div>
                  <div className="mp-field"><label className="mp-label">Max Group Size</label><input className="mp-inp" type="number" placeholder="15" value={form.groupSize.max} onChange={e=>setForm(f=>({...f,groupSize:{...f.groupSize,max:e.target.value}}))} /></div>
                  <div className="mp-field"><label className="mp-label">Start Location</label><input className="mp-inp" placeholder="e.g. Kathmandu" value={form.startLocation} onChange={e=>setForm(f=>({...f,startLocation:e.target.value}))} /></div>
                  <div className="mp-field"><label className="mp-label">End Location</label><input className="mp-inp" placeholder="e.g. Kathmandu" value={form.endLocation} onChange={e=>setForm(f=>({...f,endLocation:e.target.value}))} /></div>
                  <div className="mp-field mp-full"><label className="mp-label">Description *</label><textarea className="mp-textarea" placeholder="Describe this package…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
                  <div className="mp-field mp-full">
                    <label className="mp-label">Highlights</label>
                    {form.highlights.map((h,i)=><div key={i} style={{ display:'flex',gap:8,marginBottom:8 }}><input className="mp-inp" placeholder={`Highlight ${i+1}`} value={h} onChange={e=>{const a=[...form.highlights];a[i]=e.target.value;setForm(f=>({...f,highlights:a}));}} />{form.highlights.length>1&&<button className="mp-btn-del" onClick={()=>setForm(f=>({...f,highlights:f.highlights.filter((_,j)=>j!==i)}))}>✕</button>}</div>)}
                    <button className="mp-back-btn" style={{ width:'fit-content' }} onClick={()=>setForm(f=>({...f,highlights:[...f.highlights,'']}))}>+ Add</button>
                  </div>
                  <div className="mp-field" style={{ flexDirection:'row', alignItems:'center', gap:10 }}><label className="mp-label">Active</label><label className="mp-toggle"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} /><span className="mp-toggle-sl" /></label></div>
                  <div className="mp-field" style={{ flexDirection:'row', alignItems:'center', gap:10 }}><label className="mp-label">Featured</label><label className="mp-toggle"><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))} /><span className="mp-toggle-sl" /></label></div>
                </div>
              )}

              {/* ── DESTINATION & MAP ── */}
              {formTab === 'destination' && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div className="mp-grid2">
                    <div className="mp-field">
                      <label className="mp-label">Trekking Region</label>
                      <select className="mp-select" value={form.region} onChange={e=>setForm(f=>({...f,region:e.target.value}))}>
                        <option value="">— Select region —</option>
                        {REGIONS.map(r=><option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="mp-field">
                      <label className="mp-label">Destination / Area</label>
                      <input className="mp-inp" placeholder="e.g. Everest Base Camp, Namche Bazaar" value={form.destination} onChange={e=>setForm(f=>({...f,destination:e.target.value}))} />
                    </div>
                    <div className="mp-field mp-full">
                      <label className="mp-label">Best Season</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
                        {SEASONS.map(s=>(
                          <button key={s} className={`mp-tag${form.bestSeason.includes(s)?' on':''}`} onClick={()=>toggleArr('bestSeason',s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Map Picker */}
                  <div>
                    <label className="mp-label" style={{ marginBottom:8, display:'block' }}>📍 Pin Destination on Map</label>
                    <p style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>
                      Click on the map to mark the trekking destination. This shows users exactly where the trek is located.
                    </p>
                    <MapPicker
                      lat={form.lat ? parseFloat(form.lat) : null}
                      lng={form.lng ? parseFloat(form.lng) : null}
                      onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))}
                    />
                    {(!form.lat || !form.lng) && (
                      <p style={{ fontSize:12, color:'#f59e0b', marginTop:10, fontWeight:600 }}>
                        ⚠️ No pin set — package won't appear on the browse map
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── ITINERARY ── */}
              {formTab === 'itinerary' && (
                <div>
                  {form.itinerary.map((day,i)=>(
                    <div key={i} className="mp-day-card">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:'#0a2818' }}>Day {day.day}</span>
                        {form.itinerary.length>1&&<button className="mp-btn-del" onClick={()=>removeDay(i)}>✕ Remove</button>}
                      </div>
                      <div className="mp-grid2">
                        <div className="mp-field mp-full"><label className="mp-label">Day Title</label><input className="mp-inp" placeholder="e.g. Fly to Lukla – Trek to Phakding" value={day.title} onChange={e=>updateDay(i,'title',e.target.value)} /></div>
                        <div className="mp-field"><label className="mp-label">Elevation (m)</label><input className="mp-inp" placeholder="2860" value={day.elevation} onChange={e=>updateDay(i,'elevation',e.target.value)} /></div>
                        <div className="mp-field"><label className="mp-label">Distance (km)</label><input className="mp-inp" placeholder="8" value={day.distance} onChange={e=>updateDay(i,'distance',e.target.value)} /></div>
                        <div className="mp-field mp-full"><label className="mp-label">Description</label><textarea className="mp-textarea" style={{ minHeight:70 }} placeholder="What happens on this day…" value={day.description} onChange={e=>updateDay(i,'description',e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                  <button className="mp-back-btn" onClick={addDay}>+ Add Day</button>
                </div>
              )}

              {/* ── INCLUDES ── */}
              {formTab === 'includes' && (
                <div>
                  <p style={{ fontSize:13, color:'#6b7280', marginBottom:14 }}>Select everything included in this package:</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                    {INCLUDES_OPTS.map(o=><button key={o} className={`mp-tag${form.includes.includes(o)?' on':''}`} onClick={()=>toggleArr('includes',o)}>{o}</button>)}
                  </div>
                  <div className="mp-field">
                    <label className="mp-label">What's Not Included</label>
                    {form.excludes.map((e,i)=><div key={i} style={{ display:'flex',gap:8,marginBottom:8 }}><input className="mp-inp" placeholder={`Exclusion ${i+1}`} value={e} onChange={ev=>{const a=[...form.excludes];a[i]=ev.target.value;setForm(f=>({...f,excludes:a}));}} />{form.excludes.length>1&&<button className="mp-btn-del" onClick={()=>setForm(f=>({...f,excludes:f.excludes.filter((_,j)=>j!==i)}))}>✕</button>}</div>)}
                    <button className="mp-back-btn" style={{ width:'fit-content' }} onClick={()=>setForm(f=>({...f,excludes:[...f.excludes,'']}))}>+ Add Exclusion</button>
                  </div>
                </div>
              )}

              {/* ── IMAGES ── */}
              {formTab === 'images' && (
                <div>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e=>handleFileUpload(e.target.files)} />
                  <div className="mp-upload-zone" onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFileUpload(e.dataTransfer.files);}}>
                    <div style={{ fontSize:28, marginBottom:8 }}>{uploading?'⏳':'📷'}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#0a2818', marginBottom:4 }}>{uploading?'Uploading…':'Upload photos from your device'}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>Drag & drop or click · JPG, PNG, WebP</div>
                    {!uploading&&<button className="mp-save-btn" style={{ margin:'0 auto' }} onClick={e=>{e.stopPropagation();fileRef.current?.click();}}>📷 Choose Photos</button>}
                  </div>
                  {form.images.filter(i=>i.trim()).length>0&&(
                    <><p style={{ fontSize:12,fontWeight:700,color:'#374151',marginBottom:10 }}>🖼️ {form.images.filter(i=>i.trim()).length} photo(s) added</p>
                    <div className="mp-img-grid">{form.images.filter(i=>i.trim()).map((img,i)=><div key={i} className="mp-img-thumb"><img src={img} alt="" onError={e=>{e.target.style.display='none';}} /><button className="mp-img-del" onClick={()=>setForm(f=>({...f,images:f.images.filter(x=>x!==img)}))}>✕</button></div>)}</div></>
                  )}
                  <div className="mp-divider">or paste URL</div>
                  {form.images.map((img,i)=><div key={i} style={{ display:'flex',gap:8,marginBottom:8 }}><input className="mp-inp" placeholder={`Image URL ${i+1}`} value={img} onChange={e=>{const imgs=[...form.images];imgs[i]=e.target.value;setForm(f=>({...f,images:imgs}));}} />{form.images.length>1&&<button className="mp-btn-del" onClick={()=>setForm(f=>({...f,images:f.images.filter((_,j)=>j!==i)}))}>✕</button>}</div>)}
                  <button className="mp-back-btn" style={{ marginTop:4 }} onClick={()=>setForm(f=>({...f,images:[...f.images,'']}))}>+ Add URL</button>
                </div>
              )}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:18 }}>
              <button className="mp-back-btn" onClick={()=>setTab('list')}>Cancel</button>
              <button className="mp-save-btn" onClick={handleSave} disabled={saving}>{saving?'⏳ Saving…':editId?'✓ Update Package':'+ Create Package'}</button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
