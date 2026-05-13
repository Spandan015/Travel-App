import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import guideService from '../../services/guideService';
import {
  Hotel,
  Compass,
  Package,
  Footprints,
  ClipboardList,
  CheckCircle2,
  Clock,
  Banknote,
  Search,
  X,
  UserCircle,
  Ban,
  UserCheck,
  UserPlus,
  Star,
  AlertTriangle,
  Loader2,
  ChevronDown,
  MapPin,
  Briefcase,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';

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
  hotel:   { bg:'#f0fdf4', color:'#15803d', label:'Hotel'   },
  guide:   { bg:'#FFF4ED', color:'#EA580C', label:'Guide'   },
  package: { bg:'#F5F3FF', color:'#7C3AED', label:'Package' },
  trek:    { bg:'#EEF4FB', color:'#1B4F8A', label:'Trek'    },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  .mb-root{font-family:'Roboto',sans-serif;}
  .mb-msg{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
  .mb-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
  @media(max-width:800px){.mb-stats{grid-template-columns:repeat(2,1fr);}}
  .mb-stat{background:#fff;border-radius:14px;border:1px solid #e5f0e8;padding:18px 20px;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mb-stat-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;}
  .mb-stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;}
  .mb-stat-trend{font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;display:flex;align-items:center;gap:3px;}
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
  .mb-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;text-transform:capitalize;display:inline-flex;align-items:center;gap:4px;}
  .mb-type-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;}
  .mb-loading{display:flex;flex-direction:column;align-items:center;padding:56px 24px;gap:12px;}
  .mb-spinner{width:36px;height:36px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:mb-spin 0.9s linear infinite;}
  @keyframes mb-spin{to{transform:rotate(360deg);}}
  .mb-empty{text-align:center;padding:56px 24px;color:#9ca3af;}
  .mb-guide-btn{padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid;font-family:inherit;transition:all 0.15s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;}
  .mb-guide-btn.assign{background:#EEF4FB;color:#1B4F8A;border-color:#93c5fd;}
  .mb-guide-btn.assign:hover{background:#1B4F8A;color:#fff;}
  .mb-guide-btn.assigned{background:#f0fdf4;color:#16a34a;border-color:#86efac;}
  .mb-guide-btn.assigned:hover{background:#fef2f2;color:#b91c1c;border-color:#fca5a5;}

  /* Modal */
  .ag-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;}
  .ag-modal{background:#fff;border-radius:20px;width:100%;max-width:500px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.2);}
  .ag-header{padding:20px 24px 14px;border-bottom:1px solid #e5f0e8;display:flex;align-items:center;justify-content:space-between;}
  .ag-title{font-size:17px;font-weight:800;color:#0a2818;display:flex;align-items:center;gap:8px;}
  .ag-sub{font-size:12px;color:#6b7280;margin-top:4px;display:flex;align-items:center;gap:5px;}
  .ag-close{width:32px;height:32px;border-radius:50%;border:1px solid #e5f0e8;background:#f8faf8;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;flex-shrink:0;}
  .ag-close:hover{background:#fee2e2;color:#b91c1c;border-color:#fca5a5;}
  .ag-body{padding:16px 20px;overflow-y:auto;flex:1;}
  .ag-search-wrap{display:flex;align-items:center;gap:8px;border:1.5px solid #e5f0e8;border-radius:10px;padding:9px 13px;margin-bottom:12px;transition:border 0.15s;}
  .ag-search-wrap:focus-within{border-color:#16a34a;}
  .ag-search{width:100%;border:none;outline:none;font-size:13px;font-family:inherit;background:transparent;color:#0f172a;}
  .ag-search::placeholder{color:#9ca3af;}
  .ag-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}

  .ag-item{
    display:grid;
    grid-template-columns:36px 1fr auto;
    gap:10px;
    align-items:center;
    padding:11px 12px;
    border:1.5px solid #e5f0e8;
    border-radius:12px;
    cursor:pointer;
    transition:all 0.15s;
    background:#fff;
  }
  .ag-item:hover{border-color:#16a34a;background:#fafff8;}
  .ag-item.sel{border-color:#16a34a;background:#f0fdf4;box-shadow:0 0 0 3px rgba(22,163,74,0.08);}
  .ag-item.none-item{grid-template-columns:24px 1fr auto;border-style:dashed;color:#6b7280;}
  .ag-item.none-item:hover{border-color:#fca5a5;background:#fef2f2;color:#b91c1c;}
  .ag-item.none-item.sel{border-color:#fca5a5;background:#fef2f2;color:#b91c1c;}

  .ag-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0a2818,#16a34a);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;overflow:hidden;flex-shrink:0;}
  .ag-item.sel .ag-av{border:2px solid #16a34a;}
  .ag-av img{width:100%;height:100%;object-fit:cover;display:block;}

  .ag-info{min-width:0;}
  .ag-name{font-size:13px;font-weight:700;color:#0a2818;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;}
  .ag-meta{font-size:11px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:4px;}

  .ag-rate-col{text-align:right;flex-shrink:0;}
  .ag-rate{font-size:12px;font-weight:800;color:#16a34a;white-space:nowrap;}
  .ag-rate-label{font-size:10px;color:#9ca3af;}
  .ag-check{font-size:10px;color:#16a34a;font-weight:700;margin-top:2px;display:flex;align-items:center;justify-content:flex-end;gap:2px;}

  .ag-fee-box{background:#f0fdf4;border:1px solid #d1fae5;border-radius:10px;padding:12px 14px;margin-bottom:14px;}
  .ag-fee-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#16a34a;margin-bottom:8px;display:flex;align-items:center;gap:5px;}
  .ag-fee-row{display:flex;justify-content:space-between;font-size:12px;color:#374151;padding:3px 0;}
  .ag-fee-row.total{font-weight:800;font-size:13px;color:#0a2818;border-top:1px dashed #d1fae5;margin-top:4px;padding-top:8px;}
  .ag-fee-row.dim{color:#94a3b8;font-size:11px;}

  .ag-notes{width:100%;box-sizing:border-box;padding:10px 14px;border:1.5px solid #e5f0e8;border-radius:10px;font-size:13px;font-family:inherit;outline:none;resize:vertical;margin-bottom:4px;}
  .ag-notes:focus{border-color:#16a34a;}
  .ag-notes-hint{font-size:11px;color:#9ca3af;margin-bottom:14px;}
  .ag-error{background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:10px 14px;color:#b91c1c;font-size:12px;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
  .ag-footer{padding:14px 20px;border-top:1px solid #e5f0e8;display:flex;gap:10px;}
  .ag-confirm{flex:1;padding:12px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:6px;}
  .ag-confirm:hover{background:#15803d;}
  .ag-confirm:disabled{background:#9ca3af;cursor:not-allowed;}
  .ag-cancel{padding:12px 20px;background:#f9fafb;color:#374151;border:1px solid #d1d5db;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;}
`;

// ── Assign Guide Modal ────────────────────────────────────────────────────────
function AssignGuideModal({ booking, onClose, onAssigned }) {
  const [guides,    setGuides]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState('__none__');
  const [notes,     setNotes]     = useState(booking.guideNotes || '');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const bookingType = booking._type;
  const duration    = booking.package?.duration || booking.trek?.duration || 1;
  const itemName    = booking.package?.name || booking.trek?.name || 'Booking';

  useEffect(() => {
    guideService.getApprovedGuides().then(guides => {
      setGuides(guides);
      setLoading(false);
      const assignedId = booking.assignedGuide?._id || booking.assignedGuide;
      if (assignedId) {
        const match = guides.find(g =>
          (g.userId && g.userId.toString() === assignedId.toString()) ||
          g._id.toString() === assignedId.toString()
        );
        if (match) {
          setSelected(match.userId?.toString() || match._id.toString());
        }
      }
    });
  }, []);

  const filtered = guides.filter(g => {
    if (!search) return true;
    const name  = `${g.firstName||''} ${g.lastName||''}`.toLowerCase();
    const specs = (g.specializations||[]).join(' ').toLowerCase();
    const langs = (g.languages||[]).join(' ').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || specs.includes(q) || langs.includes(q);
  });

  const selectedGuide = selected !== '__none__'
    ? guides.find(g =>
        (g.userId && g.userId.toString() === selected) ||
        g._id.toString() === selected
      )
    : null;

  const dailyRate   = selectedGuide?.dailyRate || 0;
  const totalFee    = dailyRate * duration;
  const guideEarns  = Math.round(totalFee * 0.75);
  const platformFee = Math.round(totalFee * 0.25);

  const getGuideUserId = (g) => g.userId?.toString() || g._id.toString();

  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    try {
      const guideUserId = selected === '__none__' ? null : selected;
      if (bookingType === 'package') {
        await guideService.assignGuideToPackageBooking(booking._id, guideUserId, notes);
      } else {
        await guideService.assignGuideToTrekBooking(booking._id, guideUserId, notes);
      }
      onAssigned();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to assign guide. Check console for details.');
      console.error('Assign guide error:', e.response?.data || e.message);
    }
    setSaving(false);
  };

  const BookingTypeIcon = bookingType === 'package' ? Package : Footprints;

  return (
    <div className="ag-overlay" onClick={onClose}>
      <div className="ag-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ag-header">
          <div>
            <div className="ag-title">
              <Compass size={18} color="#16a34a" />
              Assign Guide
            </div>
            <div className="ag-sub">
              <BookingTypeIcon size={12} />
              {itemName} · {duration} day{duration !== 1 ? 's' : ''}
            </div>
          </div>
          <button className="ag-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="ag-body">
          <div className="ag-search-wrap">
            <Search size={14} color="#9ca3af" />
            <input
              className="ag-search"
              placeholder="Search guides by name, specialty or language…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'32px', color:'#9ca3af', fontSize:13 }}>
              <Loader2 size={28} color="#16a34a" style={{ animation:'mb-spin 0.9s linear infinite', margin:'0 auto 10px', display:'block' }} />
              Loading guides…
            </div>
          ) : (
            <div className="ag-list">
              {/* No guide option */}
              <div
                className={`ag-item none-item${selected === '__none__' ? ' sel' : ''}`}
                onClick={() => setSelected('__none__')}
              >
                <Ban size={18} />
                <span style={{ fontSize:13, fontWeight:600 }}>No guide — remove assignment</span>
                {selected === '__none__' && <CheckCircle2 size={14} color="#b91c1c" />}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:'24px', color:'#9ca3af', fontSize:13 }}>
                  {search ? `No guides match "${search}"` : 'No approved guides found.'}
                </div>
              )}

              {filtered.map(g => {
                const name  = `${g.firstName||''} ${g.lastName||''}`.trim() || 'Guide';
                const uid   = getGuideUserId(g);
                const isSel = selected === uid;
                const specs = (g.specializations||[]).slice(0, 2);
                const rate  = g.dailyRate || 0;

                return (
                  <div
                    key={g._id}
                    className={`ag-item${isSel ? ' sel' : ''}`}
                    onClick={() => setSelected(uid)}
                  >
                    <div className="ag-av">
                      {g.profileImage
                        ? <img src={g.profileImage} alt="" onError={e => e.target.style.display='none'} />
                        : name.charAt(0).toUpperCase()
                      }
                    </div>

                    <div className="ag-info">
                      <div className="ag-name">{name}</div>
                      <div className="ag-meta">
                        <MapPin size={10} />
                        {specs.length > 0 ? specs.join(' · ') : 'General guide'}
                        {g.rating > 0 && (
                          <>
                            <Star size={10} color="#f59e0b" fill="#f59e0b" />
                            {Number(g.rating).toFixed(1)}
                          </>
                        )}
                        {g.yearsExperience > 0 && ` · ${g.yearsExperience}yr`}
                      </div>
                    </div>

                    <div className="ag-rate-col">
                      <div className="ag-rate">
                        {rate > 0 ? `NPR ${Number(rate).toLocaleString()}` : '—'}
                      </div>
                      <div className="ag-rate-label">per day</div>
                      {isSel && (
                        <div className="ag-check">
                          <CheckCircle2 size={11} color="#16a34a" /> Selected
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fee breakdown */}
          {selectedGuide && dailyRate > 0 && (
            <div className="ag-fee-box">
              <div className="ag-fee-title">
                <Banknote size={13} />
                Revenue Breakdown
              </div>
              <div className="ag-fee-row">
                <span>Daily rate × {duration} day{duration!==1?'s':''}</span>
                <span>NPR {Number(totalFee).toLocaleString()}</span>
              </div>
              <div className="ag-fee-row" style={{ color:'#16a34a' }}>
                <span>Guide earns (75%)</span>
                <span>NPR {Number(guideEarns).toLocaleString()}</span>
              </div>
              <div className="ag-fee-row dim">
                <span>Platform fee (25%)</span>
                <span>NPR {Number(platformFee).toLocaleString()}</span>
              </div>
              <div className="ag-fee-row total">
                <span>Total guide fee</span>
                <span>NPR {Number(totalFee).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <textarea
            className="ag-notes"
            rows={2}
            placeholder="Admin notes (optional — internal only, not shown to tourist)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <div className="ag-notes-hint">Notes are internal only and not visible to the tourist.</div>

          {error && (
            <div className="ag-error">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ag-footer">
          <button className="ag-cancel" onClick={onClose}>Cancel</button>
          <button className="ag-confirm" onClick={handleConfirm} disabled={saving}>
            {saving ? (
              <><Loader2 size={15} style={{ animation:'mb-spin 0.9s linear infinite' }} /> Saving…</>
            ) : selected === '__none__' ? (
              <><Ban size={15} /> Remove Guide</>
            ) : (
              <><UserCheck size={15} /> Assign Guide</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ManageBookings() {
  const [activeTab,  setActiveTab]  = useState('all');
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('');
  const [msg,        setMsg]        = useState('');
  const [updating,   setUpdating]   = useState(null);
  const [assignModal,setAssignModal]= useState(null);

  const [hotelBookings,   setHotelBookings]   = useState([]);
  const [guideBookings,   setGuideBookings]   = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [trekBookings,    setTrekBookings]    = useState([]);
  const [loading,         setLoading]         = useState({ hotel:true, guide:true, package:true, trek:true });

  const notify = m => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  useEffect(() => {
    fetchHotelBookings();
    fetchGuideBookings();
    fetchPackageBookings();
    fetchTrekBookings();
  }, []);

  const fetchHotelBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/hotel-bookings/admin/all`, { headers:{ Authorization:`Bearer ${token()}` } });
      setHotelBookings((data.bookings||data||[]).map(b => ({ ...b, _type:'hotel' })));
    } catch { setHotelBookings([]); }
    setLoading(l => ({ ...l, hotel:false }));
  };

  const fetchGuideBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/guide-bookings/admin/all`, { headers:{ Authorization:`Bearer ${token()}` } });
      setGuideBookings((data.bookings||data||[]).map(b => ({ ...b, _type:'guide' })));
    } catch { setGuideBookings([]); }
    setLoading(l => ({ ...l, guide:false }));
  };

  const fetchPackageBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/package-bookings/admin/all`, { headers:{ Authorization:`Bearer ${token()}` } });
      setPackageBookings((data.bookings||data||[]).map(b => ({ ...b, _type:'package' })));
    } catch { setPackageBookings([]); }
    setLoading(l => ({ ...l, package:false }));
  };

  const fetchTrekBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/trek-bookings/admin/all`, { headers:{ Authorization:`Bearer ${token()}` } });
      setTrekBookings((data.bookings||data||[]).map(b => ({ ...b, _type:'trek' })));
    } catch { setTrekBookings([]); }
    setLoading(l => ({ ...l, trek:false }));
  };

  const refetchByType = (type) => {
    if (type === 'package') fetchPackageBookings();
    if (type === 'trek')    fetchTrekBookings();
  };

  const handleStatusUpdate = async (booking, newStatus) => {
    setUpdating(booking._id);
    try {
      let url;
      if (booking._type === 'hotel')   url = `${API}/hotel-bookings/${booking._id}/status`;
      if (booking._type === 'guide')   url = `${API}/guide-bookings/${booking._id}/${newStatus==='accepted'?'accept':newStatus==='rejected'?'reject':newStatus==='completed'?'complete':'cancel'}`;
      if (booking._type === 'package') url = `${API}/bookings/${booking._id}/status`;
      if (booking._type === 'trek')    url = `${API}/trek-bookings/${booking._id}/status`;
      await axios.put(url, { status:newStatus }, { headers:{ Authorization:`Bearer ${token()}` } });
      notify(`Status updated to ${newStatus}`);
      if (booking._type === 'hotel')   fetchHotelBookings();
      if (booking._type === 'guide')   fetchGuideBookings();
      if (booking._type === 'package') fetchPackageBookings();
      if (booking._type === 'trek')    fetchTrekBookings();
    } catch (err) {
      notify(`error:${err.response?.data?.message || 'Failed to update status'}`);
    }
    setUpdating(null);
  };

  const allBookings = [...hotelBookings, ...guideBookings, ...packageBookings, ...trekBookings]
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tabData  = { all:allBookings, hotel:hotelBookings, guide:guideBookings, package:packageBookings, trek:trekBookings };
  const isLoading = loading.hotel || loading.guide || loading.package || loading.trek;
  const totalRevenue = allBookings.reduce((s,b) => s + (b.totalPrice||0), 0);
  const confirmed    = allBookings.filter(b => b.status==='confirmed'||b.status==='accepted').length;
  const pending      = allBookings.filter(b => b.status==='pending').length;

  const filtered = (tabData[activeTab]||[]).filter(b => {
    const userName = b.user?.username || b.user?.email || '';
    const propName = b.hotel?.name || b.destination?.name || b.guide?.username || b.package?.name || b.trek?.name || '';
    const matchSearch = !search || userName.toLowerCase().includes(search.toLowerCase()) || propName.toLowerCase().includes(search.toLowerCase()) || b._id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || b.status === statusF;
    return matchSearch && matchStatus;
  });

  const getUserName = b => b.user?.username || b.user?.email?.split('@')[0] || 'Guest';
  const getUserInit = b => (b.user?.username?.[0] || b.user?.email?.[0] || 'G').toUpperCase();
  const getProperty = b => {
    if (b._type==='hotel')   return b.hotel?.name   || 'Hotel Booking';
    if (b._type==='guide')   return `Guide: ${b.guide?.username || 'Guide'}`;
    if (b._type==='package') return b.package?.name || 'Package Booking';
    if (b._type==='trek')    return b.trek?.name    || 'Trek Booking';
    return 'Booking';
  };
  const getDate = b => {
    const d = b.checkInDate || b.startDate || b.createdAt;
    return d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';
  };
  const getStatusOptions = b => {
    if (b._type==='hotel') return HOTEL_STATUSES;
    if (b._type==='guide') return GUIDE_STATUSES;
    return PACKAGE_STATUSES;
  };

  const showGuideCol = activeTab==='package' || activeTab==='trek' ||
    (activeTab==='all' && (packageBookings.length>0 || trekBookings.length>0));

  const TABS = [
    { id:'all',     label:'All',      Icon:ClipboardList, count:allBookings.length    },
    { id:'hotel',   label:'Hotels',   Icon:Hotel,         count:hotelBookings.length   },
    { id:'guide',   label:'Guides',   Icon:Compass,       count:guideBookings.length   },
    { id:'package', label:'Packages', Icon:Package,       count:packageBookings.length },
    { id:'trek',    label:'Treks',    Icon:Footprints,    count:trekBookings.length    },
  ];

  const STATS = [
    {
      Icon: ClipboardList,
      label: 'Total Bookings',
      value: allBookings.length,
      bg: '#f0fdf4', color: '#16a34a',
      trend: 'Live', TrendIcon: TrendingUp,
    },
    {
      Icon: CheckCircle2,
      label: 'Confirmed',
      value: confirmed,
      bg: '#ECFDF3', color: '#027A48',
      trend: null,
    },
    {
      Icon: Clock,
      label: 'Pending',
      value: pending,
      bg: '#FFFAEB', color: '#B54708',
      trend: pending > 0 ? 'Action needed' : null, TrendIcon: AlertTriangle,
    },
    {
      Icon: Banknote,
      label: 'Total Revenue',
      value: `NPR ${Number(totalRevenue).toLocaleString()}`,
      bg: '#F5F3FF', color: '#7C3AED',
      trend: 'Live', TrendIcon: TrendingUp,
    },
  ];

  const TYPE_ICONS = { hotel: Hotel, guide: Compass, package: Package, trek: Footprints };

  const isSuccess = !msg.startsWith('error:');
  const displayMsg = msg.startsWith('error:') ? msg.slice(6) : msg;

  const renderGuideCell = (b) => {
    if (b._type !== 'package' && b._type !== 'trek') return <td style={{ color:'#9ca3af', fontSize:12 }}>—</td>;
    const guide = b.assignedGuide;
    const name  = guide
      ? (`${guide.firstName||''} ${guide.lastName||''}`.trim() || guide.username || 'Guide')
      : null;
    return (
      <td>
        {guide ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:800, flexShrink:0, overflow:'hidden' }}>
              {guide.guideProfile?.profileImage
                ? <img src={guide.guideProfile.profileImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                : name.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#0a2818', marginBottom:2 }}>{name}</div>
              <button className="mb-guide-btn assigned" onClick={() => setAssignModal(b)}>
                <UserCheck size={11} /> Assigned · Change
              </button>
            </div>
          </div>
        ) : (
          <button className="mb-guide-btn assign" onClick={() => setAssignModal(b)}>
            <UserPlus size={11} /> Assign Guide
          </button>
        )}
      </td>
    );
  };

  return (
    <AdminLayout title="Bookings" subtitle="Manage all hotel, guide, package and trek bookings">
      <style>{STYLES}</style>
      <div className="mb-root">

        {msg && (
          <div className="mb-msg" style={{
            background: isSuccess ? '#f0fdf4' : '#FEF3F2',
            color: isSuccess ? '#16a34a' : '#B42318',
            border: `1px solid ${isSuccess ? '#d1fae5' : '#FDA29B'}`,
          }}>
            {isSuccess
              ? <CheckCircle2 size={15} />
              : <AlertTriangle size={15} />
            }
            {displayMsg}
          </div>
        )}

        {/* Stats */}
        <div className="mb-stats">
          {STATS.map(({ Icon, label, value, bg, color, trend, TrendIcon }) => (
            <div key={label} className="mb-stat">
              <div className="mb-stat-top">
                <div className="mb-stat-icon" style={{ background:bg }}>
                  <Icon size={20} color={color} />
                </div>
                {trend && TrendIcon && (
                  <span className="mb-stat-trend" style={{ background:bg, color }}>
                    <TrendIcon size={10} /> {trend}
                  </span>
                )}
              </div>
              <div className="mb-stat-num">{isLoading ? '—' : value}</div>
              <div className="mb-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-tabs">
          {TABS.map(({ id, label, Icon, count }) => (
            <button
              key={id}
              className={`mb-tab${activeTab===id?' on':''}`}
              onClick={() => { setActiveTab(id); setSearch(''); setStatusF(''); }}
            >
              <Icon size={14} />
              {label}
              <span className="mb-tab-count">{isLoading ? '…' : count}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-toolbar">
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="mb-search-wrap">
              <Search size={14} color="#9ca3af" />
              <input
                className="mb-search"
                placeholder="Search guest, booking or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="mb-filter-sel" value={statusF} onChange={e=>setStatusF(e.target.value)}>
              <option value="">All Statuses</option>
              {['pending','confirmed','accepted','completed','cancelled','rejected'].map(s =>
                <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
              )}
            </select>
            <span className="mb-count">{filtered.length} booking{filtered.length!==1?'s':''}</span>
          </div>
        </div>

        {/* Table */}
        <div className="mb-card">
          {isLoading ? (
            <div className="mb-loading">
              <div className="mb-spinner" />
              <p style={{ color:'#9ca3af', fontSize:13 }}>Loading bookings…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mb-empty">
              <ClipboardList size={48} color="#d1d5db" style={{ margin:'0 auto 12px', display:'block' }} />
              <div style={{ fontSize:15, fontWeight:700, color:'#0a2818', marginBottom:6 }}>No bookings found</div>
              <div style={{ fontSize:13 }}>{search||statusF ? 'Try adjusting your filters' : 'No bookings yet'}</div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="mb-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    {activeTab==='all' && <th>Type</th>}
                    <th>Booking</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    {showGuideCol && <th>Guide</th>}
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const sc = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                    const tc = TYPE_STYLE[b._type]    || TYPE_STYLE.hotel;
                    const TypeIcon = TYPE_ICONS[b._type] || Hotel;
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
                        {activeTab==='all' && (
                          <td>
                            <span className="mb-type-badge" style={{ background:tc.bg, color:tc.color }}>
                              <TypeIcon size={11} />
                              {tc.label}
                            </span>
                          </td>
                        )}
                        <td>
                          <div style={{ fontWeight:600, color:'#0a2818', fontSize:13 }}>{getProperty(b)}</div>
                          <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>#{String(b._id).slice(-8).toUpperCase()}</div>
                        </td>
                        <td style={{ color:'#667085', fontSize:12, whiteSpace:'nowrap' }}>{getDate(b)}</td>
                        <td style={{ fontWeight:700, color:'#0a2818', whiteSpace:'nowrap' }}>
                          {b.totalPrice ? `NPR ${Number(b.totalPrice).toLocaleString()}` : '—'}
                        </td>
                        <td>
                          <span className="mb-badge" style={{ background:sc.bg, color:sc.color }}>
                            {b.status||'pending'}
                          </span>
                        </td>
                        {showGuideCol && renderGuideCell(b)}
                        <td>
                          {updating===b._id ? (
                            <span style={{ fontSize:12, color:'#9ca3af', display:'flex', alignItems:'center', gap:5 }}>
                              <Loader2 size={13} style={{ animation:'mb-spin 0.9s linear infinite' }} />
                              Updating…
                            </span>
                          ) : (
                            <select className="mb-status-sel" value={b.status||'pending'} onChange={e=>handleStatusUpdate(b, e.target.value)}>
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

      {assignModal && (
        <AssignGuideModal
          booking={assignModal}
          onClose={() => setAssignModal(null)}
          onAssigned={() => {
            notify('Guide assigned successfully');
            refetchByType(assignModal._type);
          }}
        />
      )}
    </AdminLayout>
  );
}
