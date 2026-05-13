import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, CalendarDays, User, MapPin,
  DollarSign, Clock, Package, Mountain, ArrowUpDown,
  ArrowDown, ArrowUp, MessageSquare, ChevronDown, ChevronUp,
  Filter, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import guideDashboardService from '../../services/guideDashboardService';
import guideService from '../../services/guideService';

const STATUS_STYLES = {
  pending:   { bg:'#fffaeb', color:'#b45309', border:'#fcd34d', label:'Pending'   },
  accepted:  { bg:'#f0fdf4', color:'#15803d', border:'#86efac', label:'Accepted'  },
  confirmed: { bg:'#f0fdf4', color:'#15803d', border:'#86efac', label:'Confirmed' },
  rejected:  { bg:'#fef2f2', color:'#b91c1c', border:'#fca5a5', label:'Rejected'  },
  completed: { bg:'#eff6ff', color:'#1d4ed8', border:'#93c5fd', label:'Completed' },
  cancelled: { bg:'#f9fafb', color:'#6b7280', border:'#d1d5db', label:'Cancelled' },
};

const GUIDE_TABS    = ['all','pending','accepted','completed','rejected','cancelled'];
const ASSIGNED_TABS = ['all','pending','confirmed','completed','cancelled'];
const fmt  = (n) => Number(n||0).toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'TBD';

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .gb-root * { box-sizing: border-box; }
  .gb-root { font-family: 'Inter', sans-serif; }
  .gb-table { width:100%; border-collapse:collapse; }
  .gb-table th {
    padding:10px 14px; text-align:left; font-size:11px; font-weight:700;
    color:#9ca3af; text-transform:uppercase; letter-spacing:0.06em;
    background:#f8faf8; border-bottom:1px solid #e5f0e8; white-space:nowrap;
  }
  .gb-table th.sortable { cursor:pointer; user-select:none; }
  .gb-table th.sortable:hover { color:#16a34a; }
  .gb-table td {
    padding:12px 14px; border-bottom:1px solid #f0fdf4;
    font-size:13px; color:#374151; vertical-align:middle;
  }
  .gb-table tr:last-child td { border-bottom:none; }
  .gb-table tr:hover td { background:#fafff8; }
  .gb-expand-row td { padding:0; background:#fafff8; }
  .gb-expand-body { padding:16px 14px; border-top:1px solid #f0fdf4; }
  .gb-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; text-transform:capitalize; white-space:nowrap; }
  .gb-type-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; display:inline-flex; align-items:center; gap:4px; }
  .gb-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; color:#fff; flex-shrink:0; overflow:hidden; }
  .gb-btn { padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid; font-family:inherit; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; }
  .gb-btn-green  { background:#16a34a; color:#fff; border-color:#16a34a; }
  .gb-btn-green:hover { background:#15803d; }
  .gb-btn-red    { background:#fef2f2; color:#b91c1c; border-color:#fca5a5; }
  .gb-btn-red:hover { background:#fee2e2; }
  .gb-btn-blue   { background:#eff6ff; color:#1d4ed8; border-color:#93c5fd; }
  .gb-btn-blue:hover { background:#dbeafe; }
  .gb-btn-gray   { background:#f9fafb; color:#6b7280; border-color:#d1d5db; }
  .gb-btn-chat   { background:#f0fdf4; color:#16a34a; border-color:#86efac; }
  .gb-btn-chat:hover { background:#dcfce7; }
  .gb-icon-cell  { display:flex; align-items:center; gap:10px; }
  .gb-spinner    { width:28px; height:28px; border:3px solid #d1fae5; border-top-color:#16a34a; border-radius:50%; animation:gbspin 0.8s linear infinite; margin:0 auto; }
  @keyframes gbspin { to { transform:rotate(360deg); } }
  .gb-sort-icon  { display:inline-flex; align-items:center; margin-left:4px; opacity:0.5; }
  .gb-sort-icon.active { opacity:1; color:#16a34a; }
  .gb-msg-input  { width:100%; padding:8px 12px; border:1.5px solid #d1fae5; border-radius:8px; font-size:12px; font-family:inherit; outline:none; resize:vertical; }
  .gb-msg-input:focus { border-color:#16a34a; }
`;

// ── Item icon (replaces images) ───────────────────────────────────────────────
function ItemIcon({ type, size = 32 }) {
  const style = {
    width: size, height: size, borderRadius: 8, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  if (type === 'package') return <div style={{ ...style, background: '#F5F3FF' }}><Package size={size * 0.55} color="#7C3AED" /></div>;
  if (type === 'trek')    return <div style={{ ...style, background: '#EEF4FB' }}><Mountain size={size * 0.55} color="#1B4F8A" /></div>;
  return <div style={{ ...style, background: '#f0fdf4' }}><User size={size * 0.55} color="#16a34a" /></div>;
}

// ── Sort helper ───────────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="gb-sort-icon"><ArrowUpDown size={12} /></span>;
  return <span className="gb-sort-icon active">{sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}</span>;
}

// ── Direct guide booking row ──────────────────────────────────────────────────
function DirectRow({ booking, onAccept, onReject, onComplete, onCancel, onChat }) {
  const [open, setOpen]         = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const st      = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const tourist = booking.user;

  return (
    <>
      <tr>
        {/* Tourist */}
        <td>
          <div className="gb-icon-cell">
            <div className="gb-avatar" style={{ background:'linear-gradient(135deg,#0a2818,#16a34a)' }}>
              {(tourist?.firstName?.[0] || tourist?.username?.[0] || 'T').toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, color:'#0f172a', fontSize:13 }}>{tourist?.firstName || tourist?.username || 'Tourist'}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{tourist?.email}</div>
            </div>
          </div>
        </td>
        {/* Type */}
        <td>
          <span className="gb-type-badge" style={{ background:'#FFF4ED', color:'#EA580C', border:'1px solid #fed7aa' }}>
            <User size={10} /> Direct
          </span>
        </td>
        {/* Booking info */}
        <td>
          <div style={{ fontSize:13, color:'#374151' }}>
            {booking.tourType || booking.destination?.name || 'Guide Booking'}
          </div>
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>#{String(booking._id).slice(-8).toUpperCase()}</div>
        </td>
        {/* Date */}
        <td style={{ whiteSpace:'nowrap', color:'#374151', fontSize:12 }}>{fmtDate(booking.startDate)}</td>
        {/* Guests */}
        <td style={{ textAlign:'center', fontWeight:600 }}>{booking.numberOfPeople || 1}</td>
        {/* Earnings */}
        <td style={{ fontWeight:800, color:'#16a34a', whiteSpace:'nowrap' }}>NPR {fmt(booking.totalPrice)}</td>
        {/* Status */}
        <td>
          <span className="gb-badge" style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>{st.label}</span>
        </td>
        {/* Actions */}
        <td>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button className="gb-btn gb-btn-gray" style={{ padding:'5px 8px' }} onClick={() => setOpen(v=>!v)} title="Details">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {(booking.status==='accepted'||booking.status==='completed') && (
              <button className="gb-btn gb-btn-chat" style={{ padding:'5px 8px' }} onClick={() => onChat(booking._id)} title="Chat">
                <MessageSquare size={14} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded row */}
      {open && (
        <tr className="gb-expand-row">
          <td colSpan={8}>
            <div className="gb-expand-body">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10, marginBottom:12 }}>
                <div><div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Duration</div><div style={{ fontSize:13, fontWeight:600 }}>{booking.duration} {booking.durationType==='hourly'?'hour(s)':'day(s)'}</div></div>
                <div><div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Rate</div><div style={{ fontSize:13, fontWeight:600 }}>NPR {fmt(booking.pricePerUnit)}/{booking.durationType==='hourly'?'hr':'day'}</div></div>
                {booking.destination && <div><div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Destination</div><div style={{ fontSize:13, fontWeight:600 }}>{booking.destination?.name}</div></div>}
              </div>
              {booking.specialRequests && (
                <div style={{ background:'#f0fdf4', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#374151', marginBottom:12 }}>
                  <strong>Special requests:</strong> {booking.specialRequests}
                </div>
              )}
              {booking.status === 'pending' && (
                <div>
                  <textarea className="gb-msg-input" rows={2} placeholder="Optional message to tourist…" value={msgInput} onChange={e=>setMsgInput(e.target.value)} style={{ marginBottom:8 }} />
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="gb-btn gb-btn-green" onClick={() => onAccept(booking._id, msgInput)}><CheckCircle size={13} /> Accept</button>
                    <button className="gb-btn gb-btn-red"   onClick={() => onReject(booking._id, msgInput)}><XCircle size={13} /> Reject</button>
                  </div>
                </div>
              )}
              {booking.status === 'accepted' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button className="gb-btn gb-btn-blue" onClick={() => onComplete(booking._id)}><CheckCircle size={13} /> Mark Completed</button>
                  <button className="gb-btn gb-btn-gray" onClick={() => onCancel(booking._id)}>Cancel</button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Assigned booking row ──────────────────────────────────────────────────────
function AssignedRow({ booking, type, onChat }) {
  const [open, setOpen] = useState(false);
  const st      = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const tourist = booking.user;
  const item    = type === 'package' ? booking.package : booking.trek;
  const guideFee = booking.guidePayment?.guideFee || 0;

  return (
    <>
      <tr>
        {/* Tourist */}
        <td>
          <div className="gb-icon-cell">
            <div className="gb-avatar" style={{ background:'linear-gradient(135deg,#0a2818,#4ade80)' }}>
              {(tourist?.firstName?.[0] || tourist?.username?.[0] || 'T').toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, color:'#0f172a', fontSize:13 }}>{tourist?.firstName || tourist?.username || 'Tourist'}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{tourist?.email}</div>
            </div>
          </div>
        </td>
        {/* Type */}
        <td>
          {type === 'package'
            ? <span className="gb-type-badge" style={{ background:'#F5F3FF', color:'#7C3AED', border:'1px solid #e9d5ff' }}><Package size={10} /> Package</span>
            : <span className="gb-type-badge" style={{ background:'#EEF4FB', color:'#1B4F8A', border:'1px solid #bfdbfe' }}><Mountain size={10} /> Trek</span>
          }
        </td>
        {/* Item */}
        <td>
          <div className="gb-icon-cell">
            <ItemIcon type={type} size={30} />
            <div>
              <div style={{ fontWeight:600, color:'#0f172a', fontSize:13 }}>{item?.name || `${type==='package'?'Package':'Trek'} Booking`}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>#{String(booking._id).slice(-8).toUpperCase()}</div>
            </div>
          </div>
        </td>
        {/* Date */}
        <td style={{ whiteSpace:'nowrap', color:'#374151', fontSize:12 }}>{fmtDate(booking.startDate)}</td>
        {/* Guests */}
        <td style={{ textAlign:'center', fontWeight:600 }}>{booking.numberOfGuests || 1}</td>
        {/* Earnings */}
        <td style={{ fontWeight:800, color:'#16a34a', whiteSpace:'nowrap' }}>
          {guideFee > 0 ? `NPR ${fmt(guideFee)}` : '—'}
        </td>
        {/* Status */}
        <td>
          <span className="gb-badge" style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>{st.label}</span>
        </td>
        {/* Actions */}
        <td>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button className="gb-btn gb-btn-gray" style={{ padding:'5px 8px' }} onClick={() => setOpen(v=>!v)} title="Details">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button className="gb-btn gb-btn-chat" style={{ padding:'5px 8px' }} onClick={() => onChat(booking._id)} title="Chat with tourist">
              <MessageSquare size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded */}
      {open && (
        <tr className="gb-expand-row">
          <td colSpan={8}>
            <div className="gb-expand-body">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:12 }}>
                <div><div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Duration</div><div style={{ fontSize:13, fontWeight:600 }}>{item?.duration || '?'} days</div></div>
                <div><div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Revenue Split</div><div style={{ fontSize:13, fontWeight:600, color:'#16a34a' }}>75% you / 25% platform</div></div>
                {booking.guidePayment?.platformFee > 0 && <div><div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Platform Fee</div><div style={{ fontSize:13, fontWeight:600 }}>NPR {fmt(booking.guidePayment.platformFee)}</div></div>}
                {tourist?.phone && <div><div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Phone</div><div style={{ fontSize:13, fontWeight:600 }}>{tourist.phone}</div></div>}
              </div>
              {booking.specialRequests && (
                <div style={{ background:'#f0fdf4', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#374151', marginBottom:8 }}>
                  <strong>Special requests:</strong> {booking.specialRequests}
                </div>
              )}
              {booking.guideNotes && (
                <div style={{ background:'#FFFAEB', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#B54708', border:'1px solid #fcd34d' }}>
                  <strong>Admin note:</strong> {booking.guideNotes}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function GuideBookings() {
  const navigate = useNavigate();

  const [bookings,        setBookings]        = useState([]);
  const [loadingDirect,   setLoadingDirect]   = useState(true);
  const [tab,             setTab]             = useState('all');

  const [pkgBookings,     setPkgBookings]     = useState([]);
  const [trekBookings,    setTrekBookings]    = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [assignedTab,     setAssignedTab]     = useState('all');

  const [activeSection, setActiveSection] = useState('direct');
  const [toast,         setToast]         = useState('');

  // Sort state
  const [sortField, setSortField] = useState('date');
  const [sortDir,   setSortDir]   = useState('desc');

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchDirect = async () => {
    setLoadingDirect(true);
    try { const data = await guideDashboardService.getBookings(tab); setBookings(data.bookings || []); }
    catch { notify('Error loading bookings'); }
    finally { setLoadingDirect(false); }
  };

  const fetchAssigned = async () => {
    setLoadingAssigned(true);
    try {
      const [pkgData, trekData] = await Promise.all([
        guideService.getMyAssignedPackageBookings(),
        guideService.getMyAssignedTrekBookings(),
      ]);
      setPkgBookings(pkgData.bookings  || []);
      setTrekBookings(trekData.bookings || []);
    } catch { notify('Error loading assigned trips'); }
    finally { setLoadingAssigned(false); }
  };

  useEffect(() => { fetchDirect(); },  [tab]);
  useEffect(() => { fetchAssigned(); }, []);

  const handleAccept   = async (id, msg) => { try { await guideDashboardService.acceptBooking(id, msg);   notify('✅ Booking accepted!');          fetchDirect(); } catch (e) { notify(e.response?.data?.message || 'Error'); } };
  const handleReject   = async (id, msg) => { if (!window.confirm('Reject this booking?')) return;        try { await guideDashboardService.rejectBooking(id, msg);   notify('Booking rejected.');            fetchDirect(); } catch (e) { notify(e.response?.data?.message || 'Error'); } };
  const handleComplete = async (id)      => { if (!window.confirm('Mark as completed?')) return;           try { await guideDashboardService.completeBooking(id);      notify('✅ Tour marked as completed!');  fetchDirect(); } catch (e) { notify(e.response?.data?.message || 'Error'); } };
  const handleCancel   = async (id)      => { const r = window.prompt('Reason (optional):'); if (r===null) return; try { await guideDashboardService.cancelBooking(id, r); notify('Booking cancelled.'); fetchDirect(); } catch (e) { notify(e.response?.data?.message || 'Error'); } };
  const handleChat     = (bookingId)     => navigate(`/guide/chat/${bookingId}`);
  const handleUserChat = (bookingId)     => navigate(`/guide/chat/${bookingId}`);

  // Sort function
  const applySortTo = (arr, getDate, getEarnings) => {
    return [...arr].sort((a, b) => {
      let va, vb;
      if (sortField === 'date')     { va = new Date(getDate(a)||0); vb = new Date(getDate(b)||0); }
      if (sortField === 'earnings') { va = getEarnings(a); vb = getEarnings(b); }
      if (sortField === 'status')   { va = a.status; vb = b.status; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const sortedDirect = applySortTo(bookings, b => b.startDate || b.createdAt, b => b.totalPrice || 0);

  const allAssigned = [
    ...pkgBookings.map(b  => ({ ...b, _assignedType:'package' })),
    ...trekBookings.map(b => ({ ...b, _assignedType:'trek' })),
  ];
  const filteredAssigned = (assignedTab === 'all' ? allAssigned : allAssigned.filter(b => b.status === assignedTab));
  const sortedAssigned   = applySortTo(filteredAssigned, b => b.startDate || b.createdAt, b => b.guidePayment?.guideFee || 0);

  const directCount   = bookings.length;
  const assignedCount = allAssigned.length;

  const TableHeader = ({ showEarningsLabel = 'Earnings' }) => (
    <thead>
      <tr>
        <th>Tourist</th>
        <th>Type</th>
        <th>Booking</th>
        <th className="sortable" onClick={() => toggleSort('date')}>
          Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
        </th>
        <th style={{ textAlign:'center' }}>Guests</th>
        <th className="sortable" onClick={() => toggleSort('earnings')}>
          {showEarningsLabel} <SortIcon field="earnings" sortField={sortField} sortDir={sortDir} />
        </th>
        <th className="sortable" onClick={() => toggleSort('status')}>
          Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
        </th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  return (
    <div className="gb-root">
      <style>{S}</style>

      <div style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:'#0a2818', margin:0 }}>Booking Management</h2>
          <p style={{ color:'#6b7280', fontSize:13, margin:'4px 0 0' }}>Manage your direct bookings and assigned trips.</p>
        </div>
        <button
          onClick={() => { fetchDirect(); fetchAssigned(); }}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#f0fdf4', border:'1.5px solid #d1fae5', borderRadius:10, cursor:'pointer', fontSize:12, fontWeight:700, color:'#16a34a', fontFamily:'inherit' }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {toast && (
        <div style={{ background:'#0a2818', color:'#fff', borderRadius:10, padding:'12px 18px', fontSize:13, fontWeight:600, marginBottom:16 }}>
          {toast}
        </div>
      )}

      {/* Section switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[
          { id:'direct',   label:'🧭 Direct Bookings', count:directCount,   bg:'#0a2818' },
          { id:'assigned', label:'📦🥾 Assigned Trips', count:assignedCount, bg:'#1B4F8A' },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 20px',
            borderRadius:12, border:'1.5px solid', fontFamily:'inherit',
            fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
            background: activeSection===s.id ? s.bg : '#fff',
            borderColor: activeSection===s.id ? s.bg : '#e5f0e8',
            color: activeSection===s.id ? '#fff' : '#374151',
          }}>
            {s.label}
            <span style={{ background: activeSection===s.id?'rgba(255,255,255,0.2)':'#f0fdf4', color: activeSection===s.id?'#fff':'#16a34a', borderRadius:20, padding:'1px 8px', fontSize:11 }}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── DIRECT BOOKINGS ── */}
      {activeSection === 'direct' && (
        <>
          {/* Tab filters */}
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <Filter size={13} color="#9ca3af" />
            {GUIDE_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', fontFamily:'inherit', background:tab===t?'#16a34a':'#fff', borderColor:tab===t?'#16a34a':'#d1fae5', color:tab===t?'#fff':'#374151', transition:'all 0.15s' }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5f0e8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            {loadingDirect ? (
              <div style={{ padding:48, textAlign:'center' }}><div className="gb-spinner" /><p style={{ color:'#9ca3af', fontSize:13, marginTop:12 }}>Loading bookings…</p></div>
            ) : sortedDirect.length === 0 ? (
              <div style={{ padding:'48px 24px', textAlign:'center' }}>
                <CalendarDays size={40} color="#d1fae5" style={{ margin:'0 auto 12px', display:'block' }} />
                <div style={{ fontWeight:700, color:'#0a2818', marginBottom:4 }}>No {tab==='all'?'':tab} bookings</div>
                <div style={{ fontSize:13, color:'#6b7280' }}>{tab==='pending'?'New requests will appear here.':'No bookings for this filter.'}</div>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="gb-table">
                  <TableHeader showEarningsLabel="Earnings" />
                  <tbody>
                    {sortedDirect.map(b => (
                      <DirectRow key={b._id} booking={b} onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} onCancel={handleCancel} onChat={handleChat} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ASSIGNED TRIPS ── */}
      {activeSection === 'assigned' && (
        <>
          <div style={{ background:'#EEF4FB', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#1B4F8A', border:'1px solid #93c5fd', display:'flex', alignItems:'center', gap:8 }}>
            <Package size={14} /> Packages and treks assigned to you by admin. Chat with the tourist to plan ahead.
          </div>

          {/* Tab filters */}
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <Filter size={13} color="#9ca3af" />
            {ASSIGNED_TABS.map(t => (
              <button key={t} onClick={() => setAssignedTab(t)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', fontFamily:'inherit', background:assignedTab===t?'#1B4F8A':'#fff', borderColor:assignedTab===t?'#1B4F8A':'#93c5fd', color:assignedTab===t?'#fff':'#374151', transition:'all 0.15s' }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5f0e8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            {loadingAssigned ? (
              <div style={{ padding:48, textAlign:'center' }}><div className="gb-spinner" style={{ borderTopColor:'#1B4F8A', borderColor:'#bfdbfe' }} /><p style={{ color:'#9ca3af', fontSize:13, marginTop:12 }}>Loading assigned trips…</p></div>
            ) : sortedAssigned.length === 0 ? (
              <div style={{ padding:'48px 24px', textAlign:'center' }}>
                <Package size={40} color="#d1fae5" style={{ margin:'0 auto 12px', display:'block' }} />
                <div style={{ fontWeight:700, color:'#0a2818', marginBottom:4 }}>No assigned trips</div>
                <div style={{ fontSize:13, color:'#6b7280' }}>When an admin assigns you to a package or trek, it will appear here.</div>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="gb-table">
                  <TableHeader showEarningsLabel="Your Fee" />
                  <tbody>
                    {sortedAssigned.map(b => (
                      <AssignedRow key={b._id} booking={b} type={b._assignedType} onChat={handleUserChat} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
