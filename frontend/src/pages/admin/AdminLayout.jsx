import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Icons = {
  Overview:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Hotels:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Packages:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Guides:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Destinations: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 018 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 018-8z"/></svg>,
  Regions:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  Treks:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-8 4 4 4-6 4 6"/><path d="M21 21H3"/></svg>,
  Users:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bookings:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  ChevronLeft:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Menu:         () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  LogOut:       () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Globe:        () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  EditProfile:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { key:'Overview',  label:'Overview',  to:'/admin/dashboard'    },
      { key:'Hotels',    label:'Hotels',    to:'/admin/hotels'       },
      { key:'Packages',  label:'Packages',  to:'/admin/packages'     },
      { key:'Bookings',  label:'Bookings',  to:'/admin/bookings'     },
    ]
  },
  {
    label: 'Destinations',
    items: [
      { key:'Regions',      label:'Regions',      to:'/admin/regions'      },
      { key:'Treks',        label:'Treks',         to:'/admin/treks'        },
      { key:'Destinations', label:'Destinations',  to:'/admin/destinations' },
    ]
  },
  {
    label: 'People',
    items: [
      { key:'Guides', label:'Guides', to:'/admin/applications' },
      { key:'Users',  label:'Users',  to:'/admin/users'        },
    ]
  },
];

// Reusable avatar component — shows photo if available, else initial
function Avatar({ profileImage, initial, size, fontSize, style = {} }) {
  const base = {
    width: size, height: size, borderRadius: '50%',
    background: 'linear-gradient(135deg,#16a34a,#4ade80)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize, fontWeight: 800, color: '#fff',
    flexShrink: 0, overflow: 'hidden',
    ...style,
  };
  return (
    <div style={base}>
      {profileImage
        ? <img src={profileImage} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.target.style.display = 'none'; }} />
        : initial}
    </div>
  );
}

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location        = useLocation();
  const navigate        = useNavigate();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const c = collapsed;

  const userName     = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'Admin';
  const userEmail    = user?.email || '';
  const userInitial  = (user?.firstName?.[0] || user?.username?.[0] || 'A').toUpperCase();
  const profileImage = user?.profileImage || '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .al-root{display:flex;min-height:100vh;font-family:'Roboto',sans-serif;background:#F5F9F5;}
        .al-sidebar{width:${c?'64px':'236px'};min-height:100vh;background:linear-gradient(180deg,#0a2818 0%,#0d3320 100%);display:flex;flex-direction:column;transition:width 0.22s ease;flex-shrink:0;position:fixed;top:0;left:0;bottom:0;z-index:100;overflow:hidden;border-right:1px solid rgba(255,255,255,0.06);}
        @media(max-width:900px){
          .al-sidebar{transform:translateX(${mobileOpen?'0':'-100%'});width:236px !important;transition:transform 0.22s ease;}
          .al-overlay{display:${mobileOpen?'block':'none'} !important;}
        }
        .al-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;}
        .al-logo{display:flex;align-items:center;gap:10px;padding:${c?'16px 14px':'16px 16px'};border-bottom:1px solid rgba(255,255,255,0.07);text-decoration:none;overflow:hidden;flex-shrink:0;}
        .al-logo-box{width:34px;height:34px;border-radius:9px;flex-shrink:0;background:linear-gradient(135deg,#16a34a,#4ade80);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 8px rgba(22,163,74,0.4);}
        .al-logo-txt{overflow:hidden;white-space:nowrap;opacity:${c?0:1};transition:opacity 0.15s;}
        .al-logo-name{font-size:13.5px;font-weight:800;color:#fff;letter-spacing:-0.2px;}
        .al-logo-sub{font-size:10px;color:rgba(255,255,255,0.35);margin-top:1px;}
        .al-nav{flex:1;padding:10px 8px;overflow-y:auto;overflow-x:hidden;}
        .al-nav::-webkit-scrollbar{width:3px;}
        .al-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px;}
        .al-sec-label{font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1.2px;padding:10px 12px 5px;display:${c?'none':'block'};}
        .al-item{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:8px;margin-bottom:2px;text-decoration:none;color:rgba(255,255,255,0.45);font-size:13px;font-weight:500;transition:all 0.13s;overflow:hidden;white-space:nowrap;}
        .al-item:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.88);}
        .al-item.active{background:rgba(22,163,74,0.25);color:#4ade80;font-weight:700;border-left:3px solid #16a34a;}
        .al-item-icon{flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .al-item-txt{opacity:${c?0:1};transition:opacity 0.13s;flex:1;overflow:hidden;}
        .al-footer{border-top:1px solid rgba(255,255,255,0.07);padding:10px 8px;flex-shrink:0;}
        .al-user{display:flex;align-items:center;gap:9px;padding:9px 11px;overflow:hidden;margin-bottom:2px;}
        .al-user-info{overflow:hidden;opacity:${c?0:1};transition:opacity 0.13s;}
        .al-user-name{font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .al-user-role{font-size:10px;color:rgba(255,255,255,0.35);}
        .al-foot-btn{display:flex;align-items:center;gap:10px;padding:8px 11px;border-radius:8px;border:none;background:none;cursor:pointer;width:100%;font-size:13px;font-family:'Roboto',sans-serif;transition:all 0.13s;overflow:hidden;white-space:nowrap;color:rgba(255,255,255,0.38);text-align:left;}
        .al-foot-btn:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);}
        .al-foot-btn.danger:hover{background:rgba(239,68,68,0.1);color:#F87171;}
        .al-foot-txt{opacity:${c?0:1};transition:opacity 0.13s;}
        .al-main{flex:1;margin-left:${c?'64px':'236px'};min-height:100vh;display:flex;flex-direction:column;transition:margin-left 0.22s ease;}
        @media(max-width:900px){.al-main{margin-left:0 !important;}}
        .al-topbar{height:58px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;position:sticky;top:0;z-index:50;gap:12px;}
        .al-menu-btn{display:none;background:none;border:none;cursor:pointer;padding:5px;border-radius:7px;color:#64748B;flex-shrink:0;}
        @media(max-width:900px){.al-menu-btn{display:flex;align-items:center;}}
        .al-topbar-spacer{flex:1;}
        .al-topbar-right{display:flex;align-items:center;gap:12px;}
        .al-page-info{text-align:right;}
        .al-page-title{font-size:15px;font-weight:800;color:#0F172A;}
        .al-page-sub{font-size:11.5px;color:#94A3B8;margin-top:1px;}
        .al-profile-wrap{position:relative;}
        .al-topbar-avatar-btn{width:36px;height:36px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:border-color 0.15s,box-shadow 0.15s;padding:0;background:none;overflow:hidden;}
        .al-topbar-avatar-btn:hover,.al-topbar-avatar-btn.open{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.18);}
        .al-profile-dropdown{position:absolute;top:calc(100% + 10px);right:0;width:224px;background:#fff;border:1px solid #E2E8F0;border-radius:14px;box-shadow:0 10px 36px rgba(0,0,0,0.13);overflow:hidden;z-index:200;animation:dropIn 0.14s ease;}
        @keyframes dropIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}
        .al-pd-header{padding:14px 16px 12px;border-bottom:1px solid #F1F5F9;background:#F8FAFC;}
        .al-pd-name{font-size:13px;font-weight:700;color:#0F172A;line-height:1.2;margin-top:8px;}
        .al-pd-email{font-size:11px;color:#94A3B8;margin-top:3px;word-break:break-all;}
        .al-pd-badge{display:inline-block;margin-top:6px;font-size:10px;font-weight:700;background:#ECFDF3;color:#16a34a;padding:2px 9px;border-radius:20px;}
        .al-pd-body{padding:6px;}
        .al-pd-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;cursor:pointer;border:none;background:none;width:100%;font-family:'Roboto',sans-serif;transition:background 0.12s,color 0.12s;}
        .al-pd-item:hover{background:#F0FDF4;color:#16a34a;}
        .al-pd-item.danger{color:#DC2626;}
        .al-pd-item.danger:hover{background:#FEF2F2;color:#DC2626;}
        .al-pd-sep{height:1px;background:#F1F5F9;margin:4px 6px;}
        .al-content{flex:1;padding:22px 24px;}
        @media(max-width:640px){.al-content{padding:14px;}}
      `}</style>

      <div className="al-root">
        <div className="al-overlay" onClick={() => setMobileOpen(false)} />

        <aside className="al-sidebar">
          <Link to="/" className="al-logo">
            <div className="al-logo-box">🏔</div>
            <div className="al-logo-txt">
              <div className="al-logo-name">My Travel Buddy</div>
              <div className="al-logo-sub">Admin Panel</div>
            </div>
          </Link>

          <nav className="al-nav">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <div className="al-sec-label">{section.label}</div>
                {section.items.map(item => {
                  const Icon = Icons[item.key];
                  const isActive = location.pathname === item.to;
                  return (
                    <Link key={item.to} to={item.to}
                      className={`al-item${isActive?' active':''}`}
                      onClick={() => setMobileOpen(false)}
                      title={c ? item.label : undefined}>
                      <span className="al-item-icon"><Icon /></span>
                      <span className="al-item-txt">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="al-sec-label" style={{marginTop:8}}>General</div>
            <Link to="/" className="al-item" onClick={() => setMobileOpen(false)} title={c?'View Site':undefined}>
              <span className="al-item-icon"><Icons.Globe /></span>
              <span className="al-item-txt">View Site</span>
            </Link>
          </nav>

          <div className="al-footer">
            {/* ✅ Sidebar avatar — shows photo */}
            <div className="al-user">
              <Avatar profileImage={profileImage} initial={userInitial} size={30} fontSize="11px" />
              <div className="al-user-info">
                <div className="al-user-name">{userName}</div>
                <div className="al-user-role">Administrator</div>
              </div>
            </div>
            <button className="al-foot-btn danger" onClick={handleLogout}>
              <span className="al-item-icon"><Icons.LogOut /></span>
              <span className="al-foot-txt">Sign out</span>
            </button>
            <button className="al-foot-btn" onClick={() => setCollapsed(v => !v)}>
              <span className="al-item-icon">{c ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}</span>
              <span className="al-foot-txt">Collapse</span>
            </button>
          </div>
        </aside>

        <div className="al-main">
          <header className="al-topbar">
            <button className="al-menu-btn" onClick={() => setMobileOpen(v => !v)}>
              <Icons.Menu />
            </button>
            <div className="al-topbar-spacer" />
            <div className="al-topbar-right">
              {title && (
                <div className="al-page-info">
                  <div className="al-page-title">{title}</div>
                  {subtitle && <div className="al-page-sub">{subtitle}</div>}
                </div>
              )}

              {/* ✅ Topbar avatar — shows photo */}
              <div className="al-profile-wrap" ref={profileRef}>
                <button
                  className={`al-topbar-avatar-btn${profileOpen?' open':''}`}
                  onClick={() => setProfileOpen(v => !v)}
                >
                  <Avatar profileImage={profileImage} initial={userInitial} size={32} fontSize="12px" />
                </button>

                {profileOpen && (
                  <div className="al-profile-dropdown">
                    <div className="al-pd-header">
                      <Avatar profileImage={profileImage} initial={userInitial} size={42} fontSize="16px" />
                      <div className="al-pd-name">{userName}</div>
                      {userEmail && <div className="al-pd-email">{userEmail}</div>}
                      <span className="al-pd-badge">Administrator</span>
                    </div>
                    <div className="al-pd-body">
                      <Link
                        to="/admin/edit-profile"
                        className="al-pd-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Icons.EditProfile />
                        Edit Profile
                      </Link>
                      <div className="al-pd-sep" />
                      <button
                        className="al-pd-item danger"
                        onClick={() => { setProfileOpen(false); handleLogout(); }}
                      >
                        <Icons.LogOut />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="al-content">{children}</div>
        </div>
      </div>
    </>
  );
}
