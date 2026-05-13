import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import GuideLinker from '../../components/GuideLinker';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const tok   = () => localStorage.getItem('nt_token');
const auth  = () => ({ headers: { Authorization: `Bearer ${tok()}` } });

const DIFFICULTIES = ['Easy','Moderate','Challenging','Expert'];
const EMPTY_DAY    = { day:1, title:'', description:'', elevation:'', distance:'', walkingHours:'', meals:'Breakfast, Lunch & Dinner', accommodation:'Lodge' };
const EMPTY_FAQ    = { question:'', answer:'' };
const EMPTY = {
  name:'', slug:'', region:'', tagline:'', overview:'',
  duration:'', maxAltitude:'', difficulty:'Moderate', bestSeason:'',
  tripType:'Tea House', transportation:'Flight / Drive', accommodation:'Lodge',
  groupSize:'', startPoint:'', endPoint:'',
  price:'', priceUSD:'',
  priceIncludes:[''], priceExcludes:[''],
  itinerary:[{ ...EMPTY_DAY }],
  gearList:[''], permits:[''], highlights:[''],
  faqs:[{ ...EMPTY_FAQ }],
  images:[''], coverImage:'',
  isActive:true, isPopular:false, isFeatured:false,
};

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  .mt-root{font-family:'Roboto',sans-serif;}
  .mt-msg{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:16px;}
  .mt-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;}
  .mt-search{padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:13px;width:280px;outline:none;font-family:inherit;}
  .mt-search:focus{border-color:#16a34a;}
  .mt-btn{padding:10px 20px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
  .mt-btn:hover{background:#15803d;}
  .mt-btn:disabled{opacity:0.6;cursor:not-allowed;}
  .mt-btn-sec{padding:9px 16px;background:#f8faf8;color:#374151;border:1.5px solid #e5f0e8;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;}
  .mt-btn-sec:hover{border-color:#16a34a;color:#15803d;}
  .mt-btn-sm{padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;border:1px solid;}
  .mt-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;overflow:hidden;}
  .mt-table{width:100%;border-collapse:collapse;}
  .mt-table th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5f0e8;background:#f8faf8;}
  .mt-table td{padding:12px 14px;border-bottom:1px solid #f0fdf4;font-size:13px;color:#374151;vertical-align:middle;}
  .mt-table tr:last-child td{border-bottom:none;}
  .mt-table tr:hover td{background:#fafff8;}
  .mt-form-wrap{background:#fff;border-radius:16px;border:1px solid #e5f0e8;padding:24px;}
  .mt-tabs{display:flex;gap:4px;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:24px;flex-wrap:wrap;}
  .mt-tab{flex:1;min-width:100px;padding:8px 12px;border:none;background:transparent;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;color:#64748b;transition:all 0.15s;}
  .mt-tab.on{background:#fff;color:#0f172a;box-shadow:0 1px 4px rgba(0,0,0,0.1);}
  .mt-section{margin-bottom:28px;}
  .mt-section-title{font-size:13px;font-weight:800;color:#0f172a;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #f0fdf4;}
  .mt-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .mt-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
  @media(max-width:700px){.mt-grid,.mt-grid3{grid-template-columns:1fr;}}
  .mt-field{display:flex;flex-direction:column;gap:5px;}
  .mt-full{grid-column:1/-1;}
  .mt-label{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;}
  .mt-hint{font-size:10px;color:#94a3b8;}
  .mt-input{padding:9px 12px;border:1.5px solid #d1fae5;border-radius:9px;font-size:13px;color:#0f172a;outline:none;font-family:inherit;width:100%;}
  .mt-input:focus{border-color:#16a34a;}
  .mt-textarea{padding:9px 12px;border:1.5px solid #d1fae5;border-radius:9px;font-size:13px;color:#0f172a;outline:none;font-family:inherit;width:100%;resize:vertical;min-height:80px;}
  .mt-textarea:focus{border-color:#16a34a;}
  .mt-select{padding:9px 12px;border:1.5px solid #d1fae5;border-radius:9px;font-size:13px;color:#0f172a;outline:none;font-family:inherit;width:100%;background:#fff;}
  .mt-toggle{display:flex;align-items:center;gap:8px;cursor:pointer;}
  .mt-toggle input{accent-color:#16a34a;width:16px;height:16px;}
  .mt-day-card{background:#f8faf8;border:1px solid #e5f0e8;border-radius:12px;padding:16px;margin-bottom:12px;}
  .mt-day-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
  .mt-day-num{font-size:13px;font-weight:800;color:#0a2818;background:#d1fae5;padding:3px 10px;border-radius:20px;}
  .mt-faq-card{background:#f8faf8;border:1px solid #e5f0e8;border-radius:10px;padding:14px;margin-bottom:10px;}
  .mt-list-row{display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;}
  .mt-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:200;display:flex;align-items:center;justify-content:center;}
  .mt-modal{background:#fff;border-radius:20px;padding:28px;width:360px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2);}
  .mt-spinner{width:36px;height:36px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:mt-spin 0.9s linear infinite;margin:40px auto;}
  @keyframes mt-spin{to{transform:rotate(360deg);}}
`;

export default function ManageTreks() {
  const [view,      setView]      = useState('list');
  const [formTab,   setFormTab]   = useState('basic');
  const [treks,     setTreks]     = useState([]);
  const [regions,   setRegions]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [search,    setSearch]    = useState('');
  const [msg,       setMsg]       = useState('');
  const [delId,     setDelId]     = useState(null);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };
  const autoSlug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tr, rg] = await Promise.allSettled([
        axios.get(`${API}/treks/admin/all`, auth()),
        axios.get(`${API}/regions`, auth()),
      ]);
      setTreks(tr.status==='fulfilled' ? (tr.value.data.treks||[]) : []);
      setRegions(rg.status==='fulfilled' ? (rg.value.data.regions||[]) : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const startNew  = () => { setForm({...EMPTY}); setEditId(null); setFormTab('basic'); setView('form'); };
  const startEdit = (t) => {
    setForm({
      ...EMPTY, ...t,
      region: t.region?._id || t.region || '',
      priceIncludes: t.priceIncludes?.length ? t.priceIncludes : [''],
      priceExcludes: t.priceExcludes?.length ? t.priceExcludes : [''],
      gearList:      t.gearList?.length      ? t.gearList      : [''],
      permits:       t.permits?.length       ? t.permits       : [''],
      highlights:    t.highlights?.length    ? t.highlights    : [''],
      images:        t.images?.length        ? t.images        : [''],
      itinerary:     t.itinerary?.length     ? t.itinerary     : [{ ...EMPTY_DAY }],
      faqs:          t.faqs?.length          ? t.faqs          : [{ ...EMPTY_FAQ }],
      availableGuides: t.availableGuides || [],
    });
    setEditId(t._id); setFormTab('basic'); setView('form');
  };

  const sf = (field) => (e) => {
    const val = e.target.type==='checkbox' ? e.target.checked : e.target.value;
    setForm(f => {
      const n = { ...f, [field]: val };
      if (field==='name' && !editId) n.slug = autoSlug(val);
      return n;
    });
  };

  // List field helpers
  const updateList = (field, idx, val) => setForm(f => { const a=[...f[field]]; a[idx]=val; return {...f,[field]:a}; });
  const addList    = (field, empty='') => setForm(f => ({ ...f, [field]: [...f[field], empty] }));
  const removeList = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_,i)=>i!==idx) }));

  // Itinerary helpers
  const updateDay = (idx, field, val) => setForm(f => { const a=[...f.itinerary]; a[idx]={...a[idx],[field]:val}; return {...f,itinerary:a}; });
  const addDay    = () => setForm(f => { const n=f.itinerary.length+1; return {...f, itinerary:[...f.itinerary,{...EMPTY_DAY,day:n}]}; });
  const removeDay = (idx) => setForm(f => ({ ...f, itinerary: f.itinerary.filter((_,i)=>i!==idx).map((d,i)=>({...d,day:i+1})) }));

  // FAQ helpers
  const updateFaq = (idx, field, val) => setForm(f => { const a=[...f.faqs]; a[idx]={...a[idx],[field]:val}; return {...f,faqs:a}; });

  const handleSave = async () => {
    if (!form.name.trim())     return notify('⚠️ Trek name is required');
    if (!form.region)          return notify('⚠️ Please select a region');
    if (!form.overview.trim()) return notify('⚠️ Overview is required');
    if (!form.price)           return notify('⚠️ Price is required');
    if (!form.duration)        return notify('⚠️ Duration is required');
    setSaving(true);
    const payload = {
      ...form,
      duration:    Number(form.duration)    || 0,
      maxAltitude: Number(form.maxAltitude) || undefined,
      price:       Number(form.price)       || 0,
      priceUSD:    Number(form.priceUSD)    || undefined,
      priceIncludes: form.priceIncludes.filter(s=>s.trim()),
      priceExcludes: form.priceExcludes.filter(s=>s.trim()),
      gearList:      form.gearList.filter(s=>s.trim()),
      permits:       form.permits.filter(s=>s.trim()),
      highlights:    form.highlights.filter(s=>s.trim()),
      images:        form.images.filter(s=>s.trim()),
      itinerary:     form.itinerary.map(d=>({...d, elevation:Number(d.elevation)||undefined})),
      faqs:          form.faqs.filter(f=>f.question.trim()),
    };
    try {
      if (editId) {
        await axios.put(`${API}/treks/${editId}`, payload, auth());
        notify('✓ Trek updated');
      } else {
        await axios.post(`${API}/treks`, payload, auth());
        notify('✓ Trek created');
      }
      fetchAll(); setView('list');
    } catch(err) {
      notify(`⚠️ ${err.response?.data?.message || 'Failed to save'}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/treks/${id}`, auth()); notify('✓ Trek deleted'); fetchAll(); }
    catch { notify('⚠️ Failed to delete'); }
    setDelId(null);
  };

  const handleToggle = async (trek) => {
    try { await axios.put(`${API}/treks/${trek._id}/toggle-status`, {}, auth()); fetchAll(); }
    catch { notify('⚠️ Failed to update status'); }
  };

  const filtered = treks.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.region?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const FORM_TABS = ['basic','itinerary','pricing','extras','guides'];

  return (
    <AdminLayout title="Manage Treks" subtitle="Create full trek detail pages linked to regions">
      <style>{S}</style>
      <div className="mt-root">
        {msg && <div className="mt-msg" style={{ background:msg.startsWith('✓')?'#f0fdf4':'#fef2f2', color:msg.startsWith('✓')?'#16a34a':'#dc2626', border:`1px solid ${msg.startsWith('✓')?'#d1fae5':'#fecaca'}` }}>{msg}</div>}

        {delId && (
          <div className="mt-modal-overlay">
            <div className="mt-modal">
              <div style={{fontSize:44,marginBottom:12}}>🗑️</div>
              <h3 style={{fontSize:18,fontWeight:700,color:'#0f172a',marginBottom:8}}>Delete Trek?</h3>
              <p style={{fontSize:13,color:'#6b7280',marginBottom:24}}>This action cannot be undone.</p>
              <div style={{display:'flex',gap:10}}>
                <button className="mt-btn-sec" style={{flex:1}} onClick={()=>setDelId(null)}>Cancel</button>
                <button style={{flex:1,padding:'10px',background:'#dc2626',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={()=>handleDelete(delId)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <>
            <div className="mt-topbar">
              <input className="mt-search" placeholder="🔍 Search treks or regions…" value={search} onChange={e=>setSearch(e.target.value)} />
              <button className="mt-btn" onClick={startNew}>+ Add Trek</button>
            </div>

            <div style={{background:'#f0fdf4',border:'1px solid #d1fae5',borderRadius:12,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#15803d',display:'flex',gap:10}}>
              <span style={{fontSize:18}}>💡</span>
              <span>Treks are linked to <strong>Regions</strong>. Users browse regions → click a region → see all treks in it → click a trek → full detail page.</span>
            </div>

            <div className="mt-card">
              {loading ? <div><div className="mt-spinner"/></div>
              : filtered.length === 0 ? (
                <div style={{textAlign:'center',padding:48}}>
                  <div style={{fontSize:48,marginBottom:12}}>🏔</div>
                  <div style={{fontSize:15,fontWeight:700,color:'#0a2818',marginBottom:6}}>No treks yet</div>
                  <div style={{fontSize:13,color:'#9ca3af',marginBottom:20}}>Create your first trek to get started</div>
                  <button className="mt-btn" onClick={startNew}>+ Add Trek</button>
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table className="mt-table">
                    <thead><tr><th>Trek</th><th>Region</th><th>Duration</th><th>Difficulty</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filtered.map(t => (
                        <tr key={t._id}>
                          <td>
                            <div style={{fontWeight:700,color:'#0a2818'}}>{t.name}</div>
                            <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>/{t.slug}</div>
                            {t.isPopular && <span style={{fontSize:10,background:'#fef9c3',color:'#a16207',padding:'1px 7px',borderRadius:10,fontWeight:600}}>🔥 Popular</span>}
                          </td>
                          <td><span style={{background:'#f0fdf4',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,color:'#15803d'}}>{t.region?.name||'—'}</span></td>
                          <td>{t.duration ? `${t.duration} days` : '—'}</td>
                          <td><span style={{fontSize:12,fontWeight:600,color:'#374151'}}>{t.difficulty}</span></td>
                          <td style={{fontWeight:700,color:'#0f172a'}}>NPR {(t.price||0).toLocaleString()}</td>
                          <td>
                            <button onClick={()=>handleToggle(t)} style={{background:t.isActive?'#f0fdf4':'#fef2f2',color:t.isActive?'#16a34a':'#dc2626',border:`1px solid ${t.isActive?'#d1fae5':'#fecaca'}`,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                              {t.isActive?'Active':'Inactive'}
                            </button>
                          </td>
                          <td>
                            <div style={{display:'flex',gap:6}}>
                              <button className="mt-btn-sm" style={{background:'#f0fdf4',color:'#15803d',borderColor:'#d1fae5'}} onClick={()=>startEdit(t)}>Edit</button>
                              <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca'}} onClick={()=>setDelId(t._id)}>Delete</button>
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
        )}

        {/* ── FORM VIEW ── */}
        {view === 'form' && (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
              <div>
                <h2 style={{fontSize:17,fontWeight:800,color:'#0a2818'}}>{editId?'Edit Trek':'Add New Trek'}</h2>
                <p style={{fontSize:13,color:'#6b7280',marginTop:3}}>Fill in all sections to create a complete trek detail page</p>
              </div>
              <button className="mt-btn-sec" onClick={()=>setView('list')}>← Back to list</button>
            </div>

            {/* Tab nav */}
            <div className="mt-tabs">
              {[['basic','📋 Basic Info'],['itinerary','🗓 Itinerary'],['pricing','💰 Pricing'],['extras','📦 Extras'],['guides','🧭 Guides']].map(([k,l])=>(
                <button key={k} className={`mt-tab${formTab===k?' on':''}`} onClick={()=>setFormTab(k)}>{l}</button>
              ))}
            </div>

            <div className="mt-form-wrap">

              {/* ── BASIC INFO ── */}
              {formTab==='basic' && (
                <>
                  <div className="mt-section">
                    <div className="mt-section-title">Trek Identity</div>
                    <div className="mt-grid">
                      <div className="mt-field">
                        <label className="mt-label">Trek Name *</label>
                        <input className="mt-input" placeholder="e.g. Everest Base Camp Trek - 14 Days" value={form.name} onChange={sf('name')} autoFocus />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">URL Slug *</label>
                        <input className="mt-input" placeholder="e.g. everest-base-camp-14-days" value={form.slug} onChange={sf('slug')} />
                        <span className="mt-hint">/treks/{form.slug||'your-slug'}</span>
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Region *</label>
                        <select className="mt-select" value={form.region} onChange={sf('region')}>
                          <option value="">— Select Region —</option>
                          {regions.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Tagline</label>
                        <input className="mt-input" placeholder="e.g. The Ultimate Himalayan Journey" value={form.tagline} onChange={sf('tagline')} />
                      </div>
                      <div className="mt-field mt-full">
                        <label className="mt-label">Overview *</label>
                        <textarea className="mt-textarea" style={{minHeight:120}} placeholder="Full description of the trek — what makes it special, the experience, highlights…" value={form.overview} onChange={sf('overview')} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-section">
                    <div className="mt-section-title">Trip At Glance</div>
                    <div className="mt-grid3">
                      <div className="mt-field">
                        <label className="mt-label">Duration (days) *</label>
                        <input className="mt-input" type="number" placeholder="14" value={form.duration} onChange={sf('duration')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Max Altitude (m)</label>
                        <input className="mt-input" type="number" placeholder="5364" value={form.maxAltitude} onChange={sf('maxAltitude')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Difficulty</label>
                        <select className="mt-select" value={form.difficulty} onChange={sf('difficulty')}>
                          {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Best Season</label>
                        <input className="mt-input" placeholder="Autumn & Spring" value={form.bestSeason} onChange={sf('bestSeason')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Trip Type</label>
                        <input className="mt-input" placeholder="Tea House" value={form.tripType} onChange={sf('tripType')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Transportation</label>
                        <input className="mt-input" placeholder="Flight / Private Car" value={form.transportation} onChange={sf('transportation')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Accommodation</label>
                        <input className="mt-input" placeholder="Hotel / Lodge" value={form.accommodation} onChange={sf('accommodation')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Group Size</label>
                        <input className="mt-input" placeholder="2-16 people" value={form.groupSize} onChange={sf('groupSize')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Start Point</label>
                        <input className="mt-input" placeholder="Lukla" value={form.startPoint} onChange={sf('startPoint')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">End Point</label>
                        <input className="mt-input" placeholder="Kathmandu" value={form.endPoint} onChange={sf('endPoint')} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-section">
                    <div className="mt-section-title">Highlights</div>
                    {form.highlights.map((h,i)=>(
                      <div key={i} className="mt-list-row">
                        <input className="mt-input" placeholder={`Highlight ${i+1}`} value={h} onChange={e=>updateList('highlights',i,e.target.value)} />
                        {form.highlights.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca',flexShrink:0}} onClick={()=>removeList('highlights',i)}>✕</button>}
                      </div>
                    ))}
                    <button className="mt-btn-sec" style={{marginTop:4}} onClick={()=>addList('highlights','')}>+ Add Highlight</button>
                  </div>

                  <div className="mt-section">
                    <div className="mt-section-title">Images</div>
                    <div className="mt-field" style={{marginBottom:12}}>
                      <label className="mt-label">Cover Image URL</label>
                      <input className="mt-input" placeholder="https://… main cover image" value={form.coverImage} onChange={sf('coverImage')} />
                    </div>
                    <label className="mt-label" style={{marginBottom:8,display:'block'}}>Gallery Images</label>
                    {form.images.map((img,i)=>(
                      <div key={i} className="mt-list-row">
                        <input className="mt-input" placeholder={`Image URL ${i+1}`} value={img} onChange={e=>updateList('images',i,e.target.value)} />
                        {form.images.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca',flexShrink:0}} onClick={()=>removeList('images',i)}>✕</button>}
                      </div>
                    ))}
                    <button className="mt-btn-sec" style={{marginTop:4}} onClick={()=>addList('images','')}>+ Add Image</button>
                  </div>

                  <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                    {[['isActive','Active (visible to users)'],['isPopular','Mark as Popular'],['isFeatured','Mark as Featured']].map(([k,l])=>(
                      <label key={k} className="mt-toggle">
                        <input type="checkbox" checked={form[k]} onChange={sf(k)} />
                        <span style={{fontSize:13,color:'#374151',marginLeft:4}}>{l}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* ── ITINERARY ── */}
              {formTab==='itinerary' && (
                <>
                  <div className="mt-section-title" style={{marginBottom:16}}>Day-by-Day Itinerary ({form.itinerary.length} days)</div>
                  {form.itinerary.map((day,i)=>(
                    <div key={i} className="mt-day-card">
                      <div className="mt-day-head">
                        <span className="mt-day-num">Day {day.day}</span>
                        {form.itinerary.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca'}} onClick={()=>removeDay(i)}>Remove Day</button>}
                      </div>
                      <div className="mt-grid">
                        <div className="mt-field mt-full">
                          <label className="mt-label">Day Title *</label>
                          <input className="mt-input" placeholder="e.g. KTM to Lukla Flight and Phadking" value={day.title} onChange={e=>updateDay(i,'title',e.target.value)} />
                        </div>
                        <div className="mt-field mt-full">
                          <label className="mt-label">Description</label>
                          <textarea className="mt-textarea" placeholder="What happens on this day…" value={day.description} onChange={e=>updateDay(i,'description',e.target.value)} />
                        </div>
                        <div className="mt-field">
                          <label className="mt-label">Elevation (m)</label>
                          <input className="mt-input" type="number" placeholder="2850" value={day.elevation} onChange={e=>updateDay(i,'elevation',e.target.value)} />
                        </div>
                        <div className="mt-field">
                          <label className="mt-label">Distance</label>
                          <input className="mt-input" placeholder="10-12km" value={day.distance} onChange={e=>updateDay(i,'distance',e.target.value)} />
                        </div>
                        <div className="mt-field">
                          <label className="mt-label">Walking Hours</label>
                          <input className="mt-input" placeholder="5-6 hours" value={day.walkingHours} onChange={e=>updateDay(i,'walkingHours',e.target.value)} />
                        </div>
                        <div className="mt-field">
                          <label className="mt-label">Meals</label>
                          <input className="mt-input" placeholder="Breakfast, Lunch & Dinner" value={day.meals} onChange={e=>updateDay(i,'meals',e.target.value)} />
                        </div>
                        <div className="mt-field">
                          <label className="mt-label">Accommodation</label>
                          <input className="mt-input" placeholder="Lodge / Hotel" value={day.accommodation} onChange={e=>updateDay(i,'accommodation',e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="mt-btn" onClick={addDay}>+ Add Day {form.itinerary.length+1}</button>
                </>
              )}

              {/* ── PRICING ── */}
              {formTab==='pricing' && (
                <>
                  <div className="mt-section">
                    <div className="mt-section-title">Pricing</div>
                    <div className="mt-grid">
                      <div className="mt-field">
                        <label className="mt-label">Price (NPR) *</label>
                        <input className="mt-input" type="number" placeholder="120000" value={form.price} onChange={sf('price')} />
                      </div>
                      <div className="mt-field">
                        <label className="mt-label">Price (USD)</label>
                        <input className="mt-input" type="number" placeholder="1200" value={form.priceUSD} onChange={sf('priceUSD')} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-section">
                    <div className="mt-section-title">✅ What is Included</div>
                    {form.priceIncludes.map((item,i)=>(
                      <div key={i} className="mt-list-row">
                        <input className="mt-input" placeholder="e.g. All accommodations during the trek" value={item} onChange={e=>updateList('priceIncludes',i,e.target.value)} />
                        {form.priceIncludes.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca',flexShrink:0}} onClick={()=>removeList('priceIncludes',i)}>✕</button>}
                      </div>
                    ))}
                    <button className="mt-btn-sec" style={{marginTop:4}} onClick={()=>addList('priceIncludes','')}>+ Add Included Item</button>
                  </div>

                  <div className="mt-section">
                    <div className="mt-section-title">❌ What is Excluded</div>
                    {form.priceExcludes.map((item,i)=>(
                      <div key={i} className="mt-list-row">
                        <input className="mt-input" placeholder="e.g. International airfare" value={item} onChange={e=>updateList('priceExcludes',i,e.target.value)} />
                        {form.priceExcludes.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca',flexShrink:0}} onClick={()=>removeList('priceExcludes',i)}>✕</button>}
                      </div>
                    ))}
                    <button className="mt-btn-sec" style={{marginTop:4}} onClick={()=>addList('priceExcludes','')}>+ Add Excluded Item</button>
                  </div>

                  <div className="mt-section">
                    <div className="mt-section-title">Permits Required</div>
                    {form.permits.map((p,i)=>(
                      <div key={i} className="mt-list-row">
                        <input className="mt-input" placeholder="e.g. Sagarmatha National Park Permit" value={p} onChange={e=>updateList('permits',i,e.target.value)} />
                        {form.permits.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca',flexShrink:0}} onClick={()=>removeList('permits',i)}>✕</button>}
                      </div>
                    ))}
                    <button className="mt-btn-sec" style={{marginTop:4}} onClick={()=>addList('permits','')}>+ Add Permit</button>
                  </div>
                </>
              )}

              {/* ── EXTRAS ── */}
              {formTab==='extras' && (
                <>
                  <div className="mt-section">
                    <div className="mt-section-title">🎒 Gear / Packing List</div>
                    {form.gearList.map((g,i)=>(
                      <div key={i} className="mt-list-row">
                        <input className="mt-input" placeholder="e.g. Comfortable hiking boots" value={g} onChange={e=>updateList('gearList',i,e.target.value)} />
                        {form.gearList.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca',flexShrink:0}} onClick={()=>removeList('gearList',i)}>✕</button>}
                      </div>
                    ))}
                    <button className="mt-btn-sec" style={{marginTop:4}} onClick={()=>addList('gearList','')}>+ Add Gear Item</button>
                  </div>

                  <div className="mt-section">
                    <div className="mt-section-title">❓ FAQs</div>
                    {form.faqs.map((faq,i)=>(
                      <div key={i} className="mt-faq-card">
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                          <span style={{fontSize:12,fontWeight:700,color:'#0a2818'}}>FAQ {i+1}</span>
                          {form.faqs.length>1 && <button className="mt-btn-sm" style={{background:'#fef2f2',color:'#dc2626',borderColor:'#fecaca'}} onClick={()=>setForm(f=>({...f,faqs:f.faqs.filter((_,j)=>j!==i)}))}>Remove</button>}
                        </div>
                        <div className="mt-field" style={{marginBottom:8}}>
                          <label className="mt-label">Question</label>
                          <input className="mt-input" placeholder="e.g. Can I get Nepal visa on arrival?" value={faq.question} onChange={e=>updateFaq(i,'question',e.target.value)} />
                        </div>
                        <div className="mt-field">
                          <label className="mt-label">Answer</label>
                          <textarea className="mt-textarea" placeholder="Answer…" value={faq.answer} onChange={e=>updateFaq(i,'answer',e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button className="mt-btn-sec" onClick={()=>setForm(f=>({...f,faqs:[...f.faqs,{...EMPTY_FAQ}]}))}>+ Add FAQ</button>
                  </div>
                </>
              )}
            </div>

{/* ── GUIDES ── */}
{formTab === 'guides' && (
  <GuideLinker
    itemId={editId}
    itemType="trek"
    itemName={form.name}
    initialGuides={form.availableGuides || []}
    onSave={(ids) => setForm(f => ({ ...f, availableGuides: ids }))}
  />
)}

            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:20}}>
              <button className="mt-btn-sec" onClick={()=>setView('list')}>Cancel</button>
              <button className="mt-btn" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving…' : editId ? '✓ Update Trek' : '+ Create Trek'}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
