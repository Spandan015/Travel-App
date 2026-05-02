import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, CalendarDays,
  User, MapPin, DollarSign, Package, Mountain
} from 'lucide-react';
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

const fmt = (n) => Number(n || 0).toLocaleString();

// ── Direct Guide Booking Card (existing functionality) ────────────────────────
function GuideBookingCard({ booking, onAccept, onReject, onComplete, onCancel }) {
  const st      = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const tourist = booking.user;
  const [expanded, setExpanded] = useState(false);
  const [msgInput, setMsgInput] = useState('');

  return (
    <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${st.border}`, padding:'20px', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16, flexShrink:0 }}>
            {(tourist?.firstName?.[0] || tourist?.username?.[0] || 'T').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:700, color:'#0a2818', fontSize:15 }}>{tourist?.firstName || tourist?.username || 'Tourist'}</div>
            <div style={{ fontSize:12, color:'#6b7280' }}>{tourist?.email}</div>
            {tourist?.phone && <div style={{ fontSize:12, color:'#6b7280' }}>{tourist?.phone}</div>}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:20, background:st.bg, color:st.color, fontSize:12, fontWeight:700, border:`1px solid ${st.border}`, marginBottom:6 }}>
            {st.label}
          </span>
          <div style={{ fontSize:18, fontWeight:800, color:'#16a34a' }}>NPR {fmt(booking.totalPrice)}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10, margin:'14px 0', padding:'14px 0', borderTop:'1px solid #f0fdf4', borderBottom:'1px solid #f0fdf4' }}>
        {[
          { icon:Clock,      label:'Duration',    val:`${booking.duration} ${booking.durationType==='hourly'?'hour(s)':'day(s)'}` },
          { icon:User,       label:'People',      val:`${booking.numberOfPeople} person${booking.numberOfPeople>1?'s':''}` },
          { icon:DollarSign, label:'Rate',        val:`NPR ${fmt(booking.pricePerUnit)}/${booking.durationType==='hourly'?'hr':'day'}` },
          { icon:CalendarDays,label:'Start',      val:new Date(booking.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) },
          ...(booking.tourType    ? [{ icon:MapPin, label:'Tour Type',   val:booking.tourType }] : []),
          ...(booking.destination ? [{ icon:MapPin, label:'Destination', val:booking.destination?.name }] : []),
        ].map(({ icon:Icon, label, val }) => (
          <div key={label}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#9ca3af', marginBottom:2 }}>
              <Icon size={12} />{label}
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:'#0a2818' }}>{val}</div>
          </div>
        ))}
      </div>

      {booking.specialRequests && (
        <div style={{ background:'#f8faf8', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#374151' }}>
          <strong style={{ color:'#0a2818' }}>Special requests:</strong> {booking.specialRequests}
        </div>
      )}

      {booking.status === 'pending' && (
        <div>
          <button onClick={() => setExpanded(v=>!v)} style={{ fontSize:12, color:'#6b7280', background:'none', border:'none', cursor:'pointer', marginBottom:8, padding:0 }}>
            {expanded ? '▲ Hide message' : '▼ Add a message (optional)'}
          </button>
          {expanded && (
            <textarea value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Add a message to the tourist..." style={{ width:'100%', boxSizing:'border-box', padding:'10px 14px', border:'1.5px solid #d1fae5', borderRadius:10, fontSize:13, fontFamily:'inherit', resize:'vertical', outline:'none', marginBottom:10 }} rows={2} />
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => onAccept(booking._id, msgInput)} style={{ flex:1, padding:'11px', background:'#16a34a', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <CheckCircle size={16} /> Accept Booking
            </button>
            <button onClick={() => onReject(booking._id, msgInput)} style={{ flex:1, padding:'11px', background:'#fef2f2', color:'#b91c1c', border:'1.5px solid #fca5a5', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>
      )}

      {booking.status === 'accepted' && (
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => onComplete(booking._id)} style={{ flex:1, padding:'11px', background:'#eff6ff', color:'#1d4ed8', border:'1.5px solid #93c5fd', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <CheckCircle size={16} /> Mark as Completed
          </button>
          <button onClick={() => onCancel(booking._id)} style={{ padding:'11px 16px', background:'#f9fafb', color:'#6b7280', border:'1.5px solid #d1d5db', borderRadius:10, fontWeight:600, fontSize:14, cursor:'pointer' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ── Assigned Package/Trek Card ────────────────────────────────────────────────
function AssignedBookingCard({ booking, type }) {
  const st      = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const tourist = booking.user;
  const item    = type === 'package' ? booking.package : booking.trek;
  const icon    = type === 'package' ? '📦' : '🥾';
  const label   = type === 'package' ? 'Package' : 'Trek';
  const guideFee = booking.guidePayment?.guideFee || 0;

  return (
    <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${st.border}`, padding:'20px', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'#EEF4FB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight:800, color:'#0a2818', fontSize:14 }}>{item?.name || `${label} Booking`}</div>
            <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>
              <span style={{ background:'#EEF4FB', color:'#1B4F8A', padding:'2px 8px', borderRadius:20, fontWeight:700, marginRight:6 }}>{label}</span>
              #{String(booking._id).slice(-8).toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:20, background:st.bg, color:st.color, fontSize:12, fontWeight:700, border:`1px solid ${st.border}`, marginBottom:6 }}>
            {st.label}
          </span>
          {guideFee > 0 && (
            <div style={{ fontSize:13, fontWeight:800, color:'#16a34a' }}>
              Your fee: NPR {fmt(guideFee)}
            </div>
          )}
        </div>
      </div>

      {/* Tourist info */}
      <div style={{ background:'#f8faf8', borderRadius:10, padding:'12px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#4ade80)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>
          {(tourist?.firstName?.[0] || tourist?.username?.[0] || 'T').toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight:700, color:'#0a2818', fontSize:13 }}>{tourist?.firstName || tourist?.username || 'Tourist'}</div>
          <div style={{ fontSize:12, color:'#6b7280' }}>{tourist?.email}</div>
          {tourist?.phone && <div style={{ fontSize:12, color:'#6b7280' }}>{tourist?.phone}</div>}
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
        {[
          { label:'Start Date', val: booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'TBD' },
          { label:'Guests',     val:`${booking.numberOfGuests} person${booking.numberOfGuests>1?'s':''}` },
          { label:'Duration',   val:`${item?.duration || '?'} days` },
          { label:'Revenue Split', val:'75% / 25%' },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ fontSize:11, color:'#9ca3af', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.04em', fontWeight:600 }}>{label}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#0a2818' }}>{val}</div>
          </div>
        ))}
      </div>

      {booking.specialRequests && (
        <div style={{ background:'#f0fdf4', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#374151', marginBottom:10 }}>
          <strong>Special requests:</strong> {booking.specialRequests}
        </div>
      )}

      {booking.guideNotes && (
        <div style={{ background:'#FFFAEB', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#B54708', border:'1px solid #fcd34d' }}>
          <strong>Admin note:</strong> {booking.guideNotes}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function GuideBookings() {
  // Direct guide bookings (tourist books guide directly)
  const [bookings,    setBookings]    = useState([]);
  const [loadingDirect, setLoadingDirect] = useState(true);
  const [tab,         setTab]         = useState('all');

  // Assigned package/trek bookings (admin assigns guide to booking)
  const [pkgBookings,  setPkgBookings]  = useState([]);
  const [trekBookings, setTrekBookings] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [assignedTab,  setAssignedTab]  = useState('all');

  // UI
  const [activeSection, setActiveSection] = useState('direct'); // 'direct' | 'assigned'
  const [toast,         setToast]         = useState('');

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchDirect = async () => {
    setLoadingDirect(true);
    try {
      const data = await guideDashboardService.getBookings(tab);
      setBookings(data.bookings || []);
    } catch { notify('Error loading bookings'); }
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

  const handleAccept = async (id, msg) => {
    try { await guideDashboardService.acceptBooking(id, msg); notify('✅ Booking accepted!'); fetchDirect(); }
    catch (e) { notify(e.response?.data?.message || 'Error accepting booking'); }
  };
  const handleReject = async (id, msg) => {
    if (!window.confirm('Reject this booking request?')) return;
    try { await guideDashboardService.rejectBooking(id, msg); notify('Booking rejected.'); fetchDirect(); }
    catch (e) { notify(e.response?.data?.message || 'Error rejecting booking'); }
  };
  const handleComplete = async (id) => {
    if (!window.confirm('Mark this tour as completed?')) return;
    try { await guideDashboardService.completeBooking(id); notify('✅ Tour marked as completed!'); fetchDirect(); }
    catch (e) { notify(e.response?.data?.message || 'Error'); }
  };
  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    try { await guideDashboardService.cancelBooking(id, reason); notify('Booking cancelled.'); fetchDirect(); }
    catch (e) { notify(e.response?.data?.message || 'Error cancelling booking'); }
  };

  // Filter assigned bookings by tab
  const allAssigned = [
    ...pkgBookings.map(b => ({ ...b, _assignedType:'package' })),
    ...trekBookings.map(b => ({ ...b, _assignedType:'trek' })),
  ].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredAssigned = assignedTab === 'all'
    ? allAssigned
    : allAssigned.filter(b => b.status === assignedTab);

  const assignedCount = allAssigned.length;
  const directCount   = bookings.length;

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:'#0a2818', margin:0 }}>Booking Management</h2>
        <p style={{ color:'#6b7280', fontSize:13, margin:'4px 0 0' }}>Manage your direct bookings and assigned trips.</p>
      </div>

      {toast && (
        <div style={{ background:'#0a2818', color:'#fff', borderRadius:10, padding:'12px 18px', fontSize:13, fontWeight:600, marginBottom:16 }}>
          {toast}
        </div>
      )}

      {/* Section switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button
          onClick={() => setActiveSection('direct')}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'1.5px solid', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
            background: activeSection==='direct' ? '#0a2818' : '#fff',
            borderColor: activeSection==='direct' ? '#0a2818' : '#e5f0e8',
            color:        activeSection==='direct' ? '#fff'    : '#374151',
          }}
        >
          🧭 Direct Bookings
          <span style={{ background: activeSection==='direct'?'rgba(255,255,255,0.2)':'#f0fdf4', color: activeSection==='direct'?'#fff':'#16a34a', borderRadius:20, padding:'1px 8px', fontSize:11 }}>
            {directCount}
          </span>
        </button>
        <button
          onClick={() => setActiveSection('assigned')}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'1.5px solid', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
            background: activeSection==='assigned' ? '#1B4F8A' : '#fff',
            borderColor: activeSection==='assigned' ? '#1B4F8A' : '#e5f0e8',
            color:        activeSection==='assigned' ? '#fff'    : '#374151',
          }}
        >
          📦🥾 Assigned Trips
          <span style={{ background: activeSection==='assigned'?'rgba(255,255,255,0.2)':'#EEF4FB', color: activeSection==='assigned'?'#fff':'#1B4F8A', borderRadius:20, padding:'1px 8px', fontSize:11 }}>
            {assignedCount}
          </span>
        </button>
      </div>

      {/* ── SECTION: Direct bookings ── */}
      {activeSection === 'direct' && (
        <>
          <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
            {GUIDE_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 16px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', fontFamily:'inherit', background:tab===t?'#16a34a':'#fff', borderColor:tab===t?'#16a34a':'#d1fae5', color:tab===t?'#fff':'#374151', transition:'all 0.15s' }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          {loadingDirect ? (
            <div style={{ textAlign:'center', padding:'48px', color:'#6b7280' }}>
              <div style={{ width:36, height:36, border:'3px solid #d1fae5', borderTop:'3px solid #16a34a', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 12px' }} />
              Loading bookings…
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 24px', background:'#fff', borderRadius:16, border:'1px solid #e5f0e8' }}>
              <CalendarDays size={40} color="#d1fae5" style={{ margin:'0 auto 12px', display:'block' }} />
              <div style={{ fontWeight:700, fontSize:15, color:'#0a2818', marginBottom:6 }}>No {tab==='all'?'':tab} bookings</div>
              <div style={{ color:'#6b7280', fontSize:13 }}>
                {tab==='pending' ? 'New booking requests will appear here.' : 'No bookings found for this filter.'}
              </div>
            </div>
          ) : (
            bookings.map(b => (
              <GuideBookingCard key={b._id} booking={b} onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} onCancel={handleCancel} />
            ))
          )}
        </>
      )}

      {/* ── SECTION: Assigned trips ── */}
      {activeSection === 'assigned' && (
        <>
          <div style={{ background:'#EEF4FB', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#1B4F8A', border:'1px solid #93c5fd' }}>
            📋 These are packages and treks that an admin has assigned you to guide. Contact the tourist to plan ahead.
          </div>

          <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
            {ASSIGNED_TABS.map(t => (
              <button key={t} onClick={() => setAssignedTab(t)} style={{ padding:'7px 16px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', fontFamily:'inherit', background:assignedTab===t?'#1B4F8A':'#fff', borderColor:assignedTab===t?'#1B4F8A':'#93c5fd', color:assignedTab===t?'#fff':'#374151', transition:'all 0.15s' }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          {loadingAssigned ? (
            <div style={{ textAlign:'center', padding:'48px', color:'#6b7280' }}>
              <div style={{ width:36, height:36, border:'3px solid #93c5fd', borderTop:'3px solid #1B4F8A', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 12px' }} />
              Loading assigned trips…
            </div>
          ) : filteredAssigned.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 24px', background:'#fff', borderRadius:16, border:'1px solid #e5f0e8' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📦</div>
              <div style={{ fontWeight:700, fontSize:15, color:'#0a2818', marginBottom:6 }}>No assigned trips</div>
              <div style={{ color:'#6b7280', fontSize:13 }}>When an admin assigns you to a package or trek, it will appear here.</div>
            </div>
          ) : (
            filteredAssigned.map(b => (
              <AssignedBookingCard key={b._id} booking={b} type={b._assignedType} />
            ))
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
