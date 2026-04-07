import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const HOTEL_STATUSES   = ['pending','confirmed','cancelled','completed'];
const GUIDE_STATUSES   = ['pending','accepted','rejected','completed','cancelled'];
const PACKAGE_STATUSES = ['pending','confirmed','cancelled','completed'];

const STATUS_STYLE = {
  pending:   { bg:'#FFFAEB', color:'#B54708' },
  confirmed: { bg:'#f0fdf4', color:'#16a34a' },
  accepted:  { bg:'#f0fdf4', color:'#16a34a' },
  completed: { bg:'#EEF4FB', color:'#1B4F8A' },
  cancelled: { bg:'#FEF3F2', color:'#B42318' },
  rejected:  { bg:'#FEF3F2', color:'#B42318' },
};
const TYPE_STYLE = {
  hotel:   { bg:'#f0fdf4', color:'#15803d', label:'🏨 Hotel'   },
  guide:   { bg:'#FFF4ED', color:'#EA580C', label:'🧭 Guide'   },
  package: { bg:'#F5F3FF', color:'#7C3AED', label:'📦 Package' },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  .mb-root{font-family:'Roboto',sans-serif;}
  .mb-msg{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:16px;}
  .mb-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
  @media(max-width:800px){.mb-stats{grid-template-columns:repeat(2,1fr);}}
  .mb-stat{background:#fff;border-radius:14px;border:1px solid #e5f0e8;padding:18px 20px;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mb-stat-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;}
  .mb-stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
  .mb-stat-trend{font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;}
  .mb-stat-num{font-size:26px;font-weight:800;color:#0a2818;letter-spacing:-0.5px;margin-bottom:4px;}
  .mb-stat-label{font-size:12px;color:#6b7280;font-weight:500;}
  .mb-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
  .mb-tab{padding:8px 16px;border-radius:20px;border:1.5px solid #e5f0e8;background:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;color:#6b7280;transition:all 0.15s;display:flex;align-items:center;gap:6px;}
  .mb-tab.on{background:#16a34a;border-color:#16a34a;color:#fff;}
  .mb-tab:hover:not(.on){border-color:#16a34a;color:#16a34a;}
  .mb-tab-count{background:rgba(0,0,0,0.1);border-radius:10px;padding:2px 7px;font-size:11px;}
  .mb-tab.on .mb-tab-count{background:rgba(255,255,255,0.25);}
  .mb-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:10px;flex-wrap:wrap;}
  .mb-search-wrap{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #e5f0e8;border-radius:10px;padding:8px 13px;flex:1;max-width:320px;transition:border 0.15s;}
  .mb-search-wrap:focus-within{border-color:#16a34a;}
  .mb-search{border:none;outline:none;font-size:13px;font-family:'Roboto',sans-serif;color:#0f172a;background:transparent;flex:1;}
  .mb-search::placeholder{color:#9ca3af;}
  .mb-filter-sel,.mb-status-sel{padding:7px 12px;border:1.5px solid #e5f0e8;border-radius:10px;font-size:13px;font-family:'Roboto',sans-serif;color:#374151;outline:none;background:#fff;cursor:pointer;}
  .mb-count{font-size:12px;color:#9ca3af;font-weight:500;}
  .mb-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;overflow:hidden;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mb-table{width:100%;border-collapse:collapse;font-size:13px;}
  .mb-table th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#9ca3af;background:#f8faf8;border-bottom:1px solid #e5f0e8;}
  .mb-table td{padding:12px 16px;border-bottom:1px solid #f0fdf4;vertical-align:middle;}
  .mb-table tr:last-child td{border-bottom:none;}
  .mb-table tr:hover td{background:#fafff8;}
  .mb-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#4ade80);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;}
  .mb-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;text-transform:capitalize;}
  .mb-type-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;}
  .mb-loading{display:flex;flex-direction:column;align-items:center;padding:56px 24px;gap:12px;}
  .mb-spinner{width:36px;height:36px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:mb-spin 0.9s linear infinite;}
  @keyframes mb-spin{to{transform:rotate(360deg);}}
  .mb-empty{text-align:center;padding:56px 24px;color:#9ca3af;}
`;

export default function ManageBookings() {
  const [activeTab, setActiveTab] = useState('all');
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [msg,       setMsg]       = useState('');
  const [updating,  setUpdating]  = useState(null);

  const [hotelBookings,   setHotelBookings]   = useState([]);
  const [guideBookings,   setGuideBookings]   = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [loading,         setLoading]         = useState({ hotel:true, guide:true, package:true });

  const notify = m => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  useEffect(() => { fetchHotelBookings(); fetchGuideBookings(); fetchPackageBookings(); }, []);

  const fetchHotelBookings = async () => {
    try { const { data } = await axios.get(`${API}/hotel-bookings/admin/all`, { headers:{ Authorization:`Bearer ${token()}` } }); setHotelBookings((data.bookings||data||[]).map(b=>({...b,_type:'hotel'}))); }
    catch { setHotelBookings([]); }
    setLoading(l => ({...l, hotel:false}));
  };
  const fetchGuideBookings = async () => {
    try { const { data } = await axios.get(`${API}/guide-bookings/admin/all`, { headers:{ Authorization:`Bearer ${token()}` } }); setGuideBookings((data.bookings||data||[]).map(b=>({...b,_type:'guide'}))); }
    catch { setGuideBookings([]); }
    setLoading(l => ({...l, guide:false}));
  };
  const fetchPackageBookings = async () => {
    try { const { data } = await axios.get(`${API}/bookings`, { headers:{ Authorization:`Bearer ${token()}` } }); setPackageBookings((data.bookings||data||[]).map(b=>({...b,_type:'package'}))); }
    catch { setPackageBookings([]); }
    setLoading(l => ({...l, package:false}));
  };

  const handleStatusUpdate = async (booking, newStatus) => {
    setUpdating(booking._id);
    try {
      let url;
      if (booking._type === 'hotel')   url = `${API}/hotel-bookings/${booking._id}/status`;
      if (booking._type === 'guide')   url = `${API}/guide-bookings/${booking._id}/${newStatus==='accepted'?'accept':newStatus==='rejected'?'reject':newStatus==='completed'?'complete':'cancel'}`;
      if (booking._type === 'package') url = `${API}/bookings/${booking._id}`;
      await axios.put(url, { status: newStatus }, { headers:{ Authorization:`Bearer ${token()}` } });
      notify(`✓ Status updated to ${newStatus}`);
      if (booking._type === 'hotel')   fetchHotelBookings();
      if (booking._type === 'guide')   fetchGuideBookings();
      if (booking._type === 'package') fetchPackageBookings();
    } catch (err) { notify(`⚠️ ${err.response?.data?.message || 'Failed to update status'}`); }
    setUpdating(null);
  };

  const allBookings = [...hotelBookings, ...guideBookings, ...packageBookings].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const tabData = { all:allBookings, hotel:hotelBookings, guide:guideBookings, package:packageBookings };
  const isLoading = loading.hotel || loading.guide || loading.package;
  const totalRevenue = allBookings.reduce((s,b) => s+(b.totalPrice||0), 0);
  const confirmed    = allBookings.filter(b => b.status==='confirmed'||b.status==='accepted').length;
  const pending      = allBookings.filter(b => b.status==='pending').length;

  const filtered = tabData[activeTab].filter(b => {
    const userName  = b.user?.username || b.user?.email || '';
    const propName  = b.hotel?.name || b.destination?.name || b.guide?.username || '';
    const matchSearch = !search || userName.toLowerCase().includes(search.toLowerCase()) || propName.toLowerCase().includes(search.toLowerCase()) || b._id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || b.status === statusF;
    return matchSearch && matchStatus;
  });

  const getUserName  = b => b.user?.username || b.user?.email?.split('@')[0] || 'Guest';
  const getUserInit  = b => (b.user?.username?.[0] || b.user?.email?.[0] || 'G').toUpperCase();
  const getProperty  = b => {
    if (b._type==='hotel')   return b.hotel?.name || 'Hotel Booking';
    if (b._type==='guide')   return `Guide: ${b.guide?.username || b.guide?.email || 'Guide'}`;
    if (b._type==='package') return b.destination?.name || 'Package Booking';
    return 'Booking';
  };
  const getDate = b => { const d = b.checkInDate||b.startDate||b.createdAt; return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'; };
  const getStatusOptions = b => { if (b._type==='hotel') return HOTEL_STATUSES; if (b._type==='guide') return GUIDE_STATUSES; return PACKAGE_STATUSES; };

  const TABS = [
    { id:'all',     label:'All Bookings', icon:'📋', count:allBookings.length    },
    { id:'hotel',   label:'Hotels',       icon:'🏨', count:hotelBookings.length   },
    { id:'guide',   label:'Guides',       icon:'🧭', count:guideBookings.length   },
    { id:'package', label:'Packages',     icon:'📦', count:packageBookings.length },
  ];

  return (
    <AdminLayout title="Bookings" subtitle="Manage all hotel, guide and package bookings">
      <style>{STYLES}</style>
      <div className="mb-root">
        {msg && <div className="mb-msg" style={{ background:msg.startsWith('✓')?'#f0fdf4':'#FEF3F2', color:msg.startsWith('✓')?'#16a34a':'#B42318', border:`1px solid ${msg.startsWith('✓')?'#d1fae5':'#FDA29B'}` }}>{msg}</div>}

        <div className="mb-stats">
          {[
            { icon:'📋', label:'Total Bookings', value:allBookings.length,              bg:'#f0fdf4', color:'#16a34a', trend:'Live' },
            { icon:'✅', label:'Confirmed',       value:confirmed,                       bg:'#ECFDF3', color:'#027A48', trend:null },
            { icon:'⏳', label:'Pending',         value:pending,                         bg:'#FFFAEB', color:'#B54708', trend:pending>0?'Needs action':null },
            { icon:'💰', label:'Total Revenue',   value:`NPR ${Number(totalRevenue).toLocaleString()}`, bg:'#F5F3FF', color:'#7C3AED', trend:'Live' },
          ].map(s => (
            <div key={s.label} className="mb-stat">
              <div className="mb-stat-top">
                <div className="mb-stat-icon" style={{ background:s.bg }}>{s.icon}</div>
                {s.trend && <span className="mb-stat-trend" style={{ background:s.bg, color:s.color }}>{s.trend}</span>}
              </div>
              <div className="mb-stat-num">{isLoading ? '—' : s.value}</div>
              <div className="mb-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`mb-tab${activeTab===t.id?' on':''}`} onClick={() => { setActiveTab(t.id); setSearch(''); setStatusF(''); }}>
              {t.icon} {t.label}<span className="mb-tab-count">{isLoading?'…':t.count}</span>
            </button>
          ))}
        </div>

        <div className="mb-toolbar">
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="mb-search-wrap">
              <span style={{ color:'#9ca3af' }}>🔍</span>
              <input className="mb-search" placeholder="Search by guest, property or ID…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="mb-filter-sel" value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="">All Statuses</option>
              {['pending','confirmed','accepted','completed','cancelled','rejected'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <span className="mb-count">{filtered.length} booking{filtered.length!==1?'s':''}</span>
          </div>
        </div>

        <div className="mb-card">
          {isLoading ? (
            <div className="mb-loading"><div className="mb-spinner" /><p style={{ color:'#9ca3af', fontSize:13 }}>Loading bookings…</p></div>
          ) : filtered.length === 0 ? (
            <div className="mb-empty">
              <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#0a2818', marginBottom:6 }}>No bookings found</div>
              <div style={{ fontSize:13 }}>{search||statusF ? 'Try adjusting your filters' : 'No bookings yet'}</div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="mb-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    {activeTab === 'all' && <th>Type</th>}
                    <th>Booking</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const sc = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                    const tc = TYPE_STYLE[b._type]    || TYPE_STYLE.hotel;
                    return (
                      <tr key={`${b._type}-${b._id}`}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div className="mb-avatar">{getUserInit(b)}</div>
                            <div>
                              <div style={{ fontWeight:700, color:'#0a2818', fontSize:13 }}>{getUserName(b)}</div>
                              <div style={{ fontSize:11, color:'#9ca3af' }}>{b.user?.email||''}</div>
                            </div>
                          </div>
                        </td>
                        {activeTab === 'all' && <td><span className="mb-type-badge" style={{ background:tc.bg, color:tc.color }}>{tc.label}</span></td>}
                        <td>
                          <div style={{ fontWeight:600, color:'#0a2818', fontSize:13 }}>{getProperty(b)}</div>
                          <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>#{String(b._id).slice(-8).toUpperCase()}</div>
                        </td>
                        <td style={{ color:'#667085', fontSize:12, whiteSpace:'nowrap' }}>{getDate(b)}</td>
                        <td style={{ fontWeight:700, color:'#0a2818', whiteSpace:'nowrap' }}>{b.totalPrice ? `NPR ${Number(b.totalPrice).toLocaleString()}` : '—'}</td>
                        <td><span className="mb-badge" style={{ background:sc.bg, color:sc.color }}>{b.status||'pending'}</span></td>
                        <td>
                          {updating === b._id ? (
                            <span style={{ fontSize:12, color:'#9ca3af' }}>⏳ Updating…</span>
                          ) : (
                            <select className="mb-status-sel" value={b.status||'pending'} onChange={e => handleStatusUpdate(b, e.target.value)}>
                              {getStatusOptions(b).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
