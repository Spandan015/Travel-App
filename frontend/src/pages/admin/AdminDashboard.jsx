import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const IcoUsers   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IcoHotel   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoPackage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IcoGuide   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 018 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 018-8z"/></svg>;
const IcoBooking = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoRevenue = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IcoCheck   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcoClock   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes shimmer{0%,100%{opacity:1;}50%{opacity:0.35;}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
  @keyframes barGrow{from{height:0;}to{height:var(--h);}}
  .ad-root{font-family:'Plus Jakarta Sans',sans-serif;animation:fadeUp 0.4s ease;}
  .ad-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px;}
  @media(max-width:1100px){.ad-grid4{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:540px){.ad-grid4{grid-template-columns:1fr;}}
  .ad-stat{background:#fff;border-radius:16px;border:1px solid #EAECF0;padding:20px 22px;position:relative;overflow:hidden;transition:transform 0.2s,box-shadow 0.2s;cursor:default;}
  .ad-stat:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.08);}
  .ad-stat-accent{position:absolute;top:0;left:0;right:0;height:4px;border-radius:16px 16px 0 0;}
  .ad-stat-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
  .ad-stat-icon-wrap{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;}
  .ad-stat-live{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
  .ad-live-dot{width:6px;height:6px;border-radius:50%;animation:shimmer 2s ease-in-out infinite;}
  .ad-stat-val{font-size:28px;font-weight:800;color:#101828;letter-spacing:-1px;line-height:1;margin-bottom:5px;}
  .ad-stat-val.loading{color:#E4E7EC;background:#F2F4F7;border-radius:6px;width:60%;}
  .ad-stat-label{font-size:13px;color:#667085;font-weight:500;}
  .ad-stat-sub{font-size:11px;color:#98A2B3;margin-top:6px;padding-top:8px;border-top:1px solid #F2F4F7;}
  .ad-mid{display:grid;grid-template-columns:1fr 320px;gap:16px;margin-bottom:16px;}
  @media(max-width:1050px){.ad-mid{grid-template-columns:1fr;}}
  .ad-bot{display:grid;grid-template-columns:1fr 300px;gap:16px;}
  @media(max-width:1050px){.ad-bot{grid-template-columns:1fr;}}
  .ad-card{background:#fff;border-radius:16px;border:1px solid #EAECF0;padding:22px;}
  .ad-card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;}
  .ad-card-title{font-size:15px;font-weight:800;color:#101828;}
  .ad-card-sub{font-size:12px;color:#98A2B3;margin-top:2px;}
  .ad-card-link{font-size:12px;color:#16a34a;text-decoration:none;font-weight:600;padding:5px 12px;border-radius:20px;background:#f0fdf4;white-space:nowrap;}
  .ad-card-link:hover{background:#dcfce7;}
  .ad-chart-nums{display:flex;gap:28px;margin-bottom:20px;}
  .ad-chart-num-val{font-size:22px;font-weight:800;color:#101828;line-height:1;}
  .ad-chart-num-label{font-size:11px;color:#98A2B3;margin-top:3px;}
  .ad-bars{display:flex;align-items:flex-end;gap:8px;height:160px;padding-bottom:24px;position:relative;}
  .ad-bars::after{content:'';position:absolute;bottom:24px;left:0;right:0;height:1px;background:#F2F4F7;}
  .ad-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end;}
  .ad-bar{width:100%;border-radius:6px 6px 0 0;transition:opacity 0.15s;position:relative;}
  .ad-bar:hover{opacity:0.85;}
  .ad-bar-tooltip{position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:#101828;color:#fff;font-size:10px;font-weight:700;padding:3px 7px;border-radius:5px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.15s;}
  .ad-bar:hover .ad-bar-tooltip{opacity:1;}
  .ad-bar-label{font-size:10px;color:#98A2B3;font-weight:500;}
  .ad-chart-legend{display:flex;gap:16px;margin-top:12px;}
  .ad-legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#667085;}
  .ad-legend-dot{width:8px;height:8px;border-radius:2px;}
  .ad-donut-wrap{display:flex;flex-direction:column;align-items:center;}
  .ad-donut-center{position:relative;margin-bottom:16px;}
  .ad-donut-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .ad-donut-val{font-size:24px;font-weight:800;color:#101828;line-height:1;}
  .ad-donut-sub{font-size:11px;color:#98A2B3;}
  .ad-donut-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;}
  .ad-donut-stat{background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;}
  .ad-donut-stat-val{font-size:15px;font-weight:800;color:#101828;}
  .ad-donut-stat-label{font-size:11px;color:#98A2B3;margin-top:2px;}
  .ad-booking-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #F2F4F7;}
  .ad-booking-row:last-child{border-bottom:none;}
  .ad-booking-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
  .ad-booking-main{flex:1;min-width:0;}
  .ad-booking-title{font-size:13px;font-weight:600;color:#101828;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .ad-booking-sub{font-size:11px;color:#98A2B3;margin-top:1px;}
  .ad-booking-right{text-align:right;flex-shrink:0;}
  .ad-booking-amt{font-size:13px;font-weight:700;color:#101828;}
  .ad-booking-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-top:3px;display:inline-block;text-transform:capitalize;}
  .ad-empty-row{text-align:center;padding:32px 20px;color:#98A2B3;font-size:13px;}
  .ad-qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .ad-qa-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px;border-radius:12px;border:1.5px solid #EAECF0;background:#fff;text-decoration:none;font-size:11.5px;font-weight:700;color:#344054;transition:all 0.15s;text-align:center;line-height:1.3;}
  .ad-qa-btn:hover{border-color:#16a34a;background:#f0fdf4;color:#15803d;transform:translateY(-2px);}
  .ad-qa-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;}
  .ad-summary-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F2F4F7;}
  .ad-summary-row:last-child{border-bottom:none;}
  .ad-summary-left{display:flex;align-items:center;gap:8px;font-size:13px;color:#667085;}
  .ad-summary-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
  .ad-summary-val{font-size:13px;font-weight:800;}
  .ad-warn{background:linear-gradient(135deg,#FFFAEB,#FEF0C7);border:1px solid #FEC84B;border-radius:12px;padding:18px;}
  .ad-skel{background:#F2F4F7;border-radius:6px;animation:shimmer 1.5s ease-in-out infinite;}
`;

function BarChart({ data, loading }) {
  const maxV = Math.max(...data.map(d => d.v), 1);
  return (
    <div className="ad-bars">
      {data.map((d, i) => {
        const h = loading ? 20 + (i * 7 % 60) : Math.max((d.v / maxV) * 130, 4);
        return (
          <div key={i} className="ad-bar-wrap">
            <div className="ad-bar" style={{ height: h, background: d.current ? '#16a34a' : loading ? '#F2F4F7' : '#dcfce7' }}>
              {!loading && d.v > 0 && <span className="ad-bar-tooltip">{d.v}</span>}
            </div>
            <span className="ad-bar-label">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutRing({ pct, size, stroke, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.max(0, Math.min(1, pct));
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F2F4F7" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  );
}

function StatCard({ icon, label, value, sub, accent, iconBg, liveBg, liveColor, loading, to }) {
  const inner = (
    <div className="ad-stat" style={{ paddingTop: 24 }}>
      <div className="ad-stat-accent" style={{ background: accent }} />
      <div className="ad-stat-top">
        <div className="ad-stat-icon-wrap" style={{ background: iconBg }}>{icon}</div>
        <div className="ad-stat-live" style={{ background: liveBg, color: liveColor }}>
          <span className="ad-live-dot" style={{ background: liveColor }} />Live
        </div>
      </div>
      <div className={`ad-stat-val${loading ? ' loading' : ''}`}>{loading ? '\u00a0' : value}</div>
      <div className="ad-stat-label">{label}</div>
      {sub && <div className="ad-stat-sub">{sub}</div>}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now    = new Date();
  const chartData = MONTHS.map((m, i) => ({ month: m, v: 0, current: i === now.getMonth() }));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = { Authorization: `Bearer ${token()}` };
        const [hotelsR, packagesR, usersR, bookingsR, guidesR] = await Promise.allSettled([
          axios.get(`${API}/hotels`,             { headers: h }),
          axios.get(`${API}/packages`,           { headers: h }),
          axios.get(`${API}/admin/users`,        { headers: h }),
          axios.get(`${API}/hotel-bookings/admin/all`, { headers: h }),
          axios.get(`${API}/guide-applications`, { headers: h }),
        ]);
        const hotels   = hotelsR.status   === 'fulfilled' ? (hotelsR.value.data?.count   || hotelsR.value.data?.hotels?.length   || 0) : 0;
        const packages = packagesR.status === 'fulfilled' ? (packagesR.value.data?.count || packagesR.value.data?.packages?.length || 0) : 0;
        const users    = usersR.status    === 'fulfilled' ? (usersR.value.data?.count    || usersR.value.data?.users?.length      || 0) : 0;
        const bList     = bookingsR.status === 'fulfilled' ? (bookingsR.value.data?.bookings || bookingsR.value.data || []) : [];
        const bookings  = Array.isArray(bList) ? bList.length : 0;
        const revenue   = Array.isArray(bList) ? bList.reduce((s, b) => s + (b.totalPrice || 0), 0) : 0;
        const confirmed = Array.isArray(bList) ? bList.filter(b => b.status === 'confirmed').length : 0;
        const pending   = Array.isArray(bList) ? bList.filter(b => b.status === 'pending').length   : 0;
        const recent    = Array.isArray(bList) ? [...bList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5) : [];
        const gList         = guidesR.status === 'fulfilled' ? (guidesR.value.data?.applications || guidesR.value.data || []) : [];
        const pendingGuides  = Array.isArray(gList) ? gList.filter(g => g.status === 'pending').length  : 0;
        const approvedGuides = Array.isArray(gList) ? gList.filter(g => g.status === 'approved').length : 0;
        setStats({ hotels, packages, users, bookings, revenue, confirmed, pending, pendingGuides, approvedGuides, recent });
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmt = n => Number(n || 0).toLocaleString();
  const s   = stats || {};
  const totalRevTarget = Math.max((s.revenue || 0) * 1.5, 1);
  const revPct         = (s.revenue || 0) / totalRevTarget;

  const STATUS_STYLE = {
    confirmed: { bg: '#ECFDF3', color: '#027A48' },
    pending:   { bg: '#FFFAEB', color: '#B54708' },
    cancelled: { bg: '#FEF3F2', color: '#B42318' },
    completed: { bg: '#f0fdf4', color: '#15803d' },
  };

  const ROW1 = [
    { icon: <IcoUsers />,   label: 'Total Users',    value: fmt(s.users),          sub: 'Registered travelers',           accent: '#16a34a', iconBg: '#f0fdf4', liveBg: '#f0fdf4', liveColor: '#15803d', to: '/admin/users'       },
    { icon: <IcoHotel />,   label: 'Hotels Listed',  value: fmt(s.hotels),         sub: 'Active properties',              accent: '#0D9488', iconBg: '#F0FDF9', liveBg: '#F0FDF9', liveColor: '#0D9488', to: '/admin/hotels'      },
    { icon: <IcoPackage />, label: 'Packages',       value: fmt(s.packages),       sub: 'Available tours',                accent: '#7C3AED', iconBg: '#F5F3FF', liveBg: '#F5F3FF', liveColor: '#7C3AED', to: '/admin/packages'    },
    { icon: <IcoGuide />,   label: 'Active Guides',  value: fmt(s.approvedGuides), sub: `${s.pendingGuides || 0} pending`, accent: '#EA580C', iconBg: '#FFF4ED', liveBg: '#FFF4ED', liveColor: '#EA580C', to: '/admin/applications' },
  ];

  const ROW2 = [
    { icon: <IcoBooking />, label: 'Total Bookings',   value: fmt(s.bookings),         sub: 'All time',             accent: '#16a34a', iconBg: '#f0fdf4', liveBg: '#f0fdf4', liveColor: '#15803d', to: '/admin/bookings' },
    { icon: <IcoRevenue />, label: 'Total Revenue',    value: `NPR ${fmt(s.revenue)}`, sub: 'From all bookings',    accent: '#16A34A', iconBg: '#ECFDF3', liveBg: '#ECFDF3', liveColor: '#16A34A' },
    { icon: <IcoCheck />,   label: 'Confirmed',        value: fmt(s.confirmed),        sub: 'Successful bookings',  accent: '#0D9488', iconBg: '#F0FDF9', liveBg: '#F0FDF9', liveColor: '#0D9488' },
    { icon: <IcoClock />,   label: 'Pending Bookings', value: fmt(s.pending),          sub: s.pending > 0 ? 'Needs attention' : 'All clear', accent: '#F59E0B', iconBg: '#FFFAEB', liveBg: '#FFFAEB', liveColor: '#B54708' },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back — here's your overview">
      <style>{STYLES}</style>
      <div className="ad-root">
        <div className="ad-grid4">{ROW1.map(c => <StatCard key={c.label} {...c} loading={loading} />)}</div>
        <div className="ad-grid4" style={{ marginBottom: 20 }}>{ROW2.map(c => <StatCard key={c.label} {...c} loading={loading} />)}</div>

        <div className="ad-mid">
          <div className="ad-card">
            <div className="ad-card-head">
              <div><div className="ad-card-title">Booking Overview</div><div className="ad-card-sub">Monthly bookings this year</div></div>
              <div className="ad-chart-legend"><div className="ad-legend-item"><div className="ad-legend-dot" style={{ background: '#16a34a' }} />Bookings</div></div>
            </div>
            <div className="ad-chart-nums">
              <div><div className="ad-chart-num-val">{loading ? '—' : fmt(s.bookings)}</div><div className="ad-chart-num-label">Total</div></div>
              <div><div className="ad-chart-num-val">{loading ? '—' : fmt(s.pending)}</div><div className="ad-chart-num-label">Pending</div></div>
              <div><div className="ad-chart-num-val">{loading ? '—' : fmt(s.confirmed)}</div><div className="ad-chart-num-label">Confirmed</div></div>
            </div>
            <BarChart data={chartData} loading={loading} />
          </div>
          <div className="ad-card ad-donut-wrap">
            <div className="ad-card-title" style={{ alignSelf: 'flex-start', marginBottom: 20 }}>Revenue Target</div>
            <div className="ad-donut-center">
              <DonutRing pct={revPct} size={148} stroke={13} color="#16a34a" />
              <div className="ad-donut-text">
                <div className="ad-donut-val">{loading ? '—' : fmt(s.bookings)}</div>
                <div className="ad-donut-sub">Bookings</div>
              </div>
            </div>
            <div className="ad-chart-legend" style={{ marginBottom: 16 }}>
              <div className="ad-legend-item"><div className="ad-legend-dot" style={{ background: '#16a34a' }} />Achieved</div>
              <div className="ad-legend-item"><div className="ad-legend-dot" style={{ background: '#dcfce7' }} />Remaining</div>
            </div>
            <div className="ad-donut-stats" style={{ width: '100%' }}>
              <div className="ad-donut-stat"><div className="ad-donut-stat-val" style={{ color: '#16a34a' }}>NPR {loading ? '—' : fmt(s.revenue)}</div><div className="ad-donut-stat-label">Revenue</div></div>
              <div className="ad-donut-stat"><div className="ad-donut-stat-val" style={{ color: '#027A48' }}>{loading ? '—' : fmt(s.confirmed)}</div><div className="ad-donut-stat-label">Confirmed</div></div>
            </div>
          </div>
        </div>

        <div className="ad-bot">
          <div className="ad-card">
            <div className="ad-card-head">
              <div><div className="ad-card-title">Recent Bookings</div><div className="ad-card-sub">Latest hotel booking activity</div></div>
              <Link to="/admin/bookings" className="ad-card-link">View all →</Link>
            </div>
            {loading ? [1,2,3,4].map(i => (
              <div key={i} className="ad-booking-row">
                <div className="ad-skel" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}><div className="ad-skel" style={{ height: 12, width: '55%', marginBottom: 6, borderRadius: 4 }} /><div className="ad-skel" style={{ height: 10, width: '35%', borderRadius: 4 }} /></div>
              </div>
            )) : s.recent?.length > 0 ? s.recent.map((b, i) => {
              const st = b.status || 'pending';
              const sc = STATUS_STYLE[st] || STATUS_STYLE.pending;
              return (
                <div key={i} className="ad-booking-row">
                  <div className="ad-booking-icon" style={{ background: '#f0fdf4' }}>🏨</div>
                  <div className="ad-booking-main">
                    <div className="ad-booking-title">{b.hotel?.name || `Booking #${String(b._id).slice(-6).toUpperCase()}`}</div>
                    <div className="ad-booking-sub">{b.user?.username || b.user?.email || 'Guest'}{b.createdAt ? ` · ${new Date(b.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : ''}</div>
                  </div>
                  <div className="ad-booking-right">
                    {b.totalPrice > 0 && <div className="ad-booking-amt">NPR {fmt(b.totalPrice)}</div>}
                    <span className="ad-booking-badge" style={{ background: sc.bg, color: sc.color }}>{st}</span>
                  </div>
                </div>
              );
            }) : <div className="ad-empty-row">🗒 No bookings yet</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="ad-card">
              <div className="ad-card-head" style={{ marginBottom: 14 }}><div className="ad-card-title">Quick Actions</div></div>
              <div className="ad-qa-grid">
                {[
                  { icon: '🏨', label: 'Add Hotel',    to: '/admin/hotels',       bg: '#f0fdf4' },
                  { icon: '📦', label: 'Add Package',  to: '/admin/packages',     bg: '#F5F3FF' },
                  { icon: '📍', label: 'Destinations', to: '/admin/destinations', bg: '#ECFDF3' },
                  { icon: '🧭', label: 'Guides',       to: '/admin/applications', bg: '#FFF4ED' },
                ].map(a => (
                  <Link key={a.label} to={a.to} className="ad-qa-btn">
                    <div className="ad-qa-icon" style={{ background: a.bg }}>{a.icon}</div>
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="ad-card">
              <div className="ad-card-title" style={{ marginBottom: 14 }}>Summary</div>
              {[
                { label: 'Hotels',   val: fmt(s.hotels),           color: '#0D9488', dot: '#0D9488' },
                { label: 'Packages', val: fmt(s.packages),         color: '#7C3AED', dot: '#7C3AED' },
                { label: 'Bookings', val: fmt(s.bookings),         color: '#16a34a', dot: '#16a34a' },
                { label: 'Revenue',  val: `NPR ${fmt(s.revenue)}`, color: '#16A34A', dot: '#16A34A' },
              ].map(item => (
                <div key={item.label} className="ad-summary-row">
                  <div className="ad-summary-left"><div className="ad-summary-dot" style={{ background: item.dot }} />{item.label}</div>
                  <span className="ad-summary-val" style={{ color: loading ? '#D0D5DD' : item.color }}>{loading ? '—' : item.val}</span>
                </div>
              ))}
            </div>
            {(!loading && s.pendingGuides > 0) && (
              <div className="ad-warn">
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#B54708' }}>Guide Approvals Pending</div>
                    <div style={{ fontSize: 12, color: '#B54708', opacity: 0.8, marginTop: 2 }}>{s.pendingGuides} application{s.pendingGuides !== 1 ? 's' : ''} waiting</div>
                  </div>
                </div>
                <Link to="/admin/applications" style={{ display: 'inline-block', background: '#fff', color: '#B54708', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #FEC84B' }}>
                  Review Now →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
