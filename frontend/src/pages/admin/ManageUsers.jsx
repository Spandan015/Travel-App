import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const token = () => localStorage.getItem('nt_token');

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .mu-root{font-family:'Plus Jakarta Sans',sans-serif;}
  .mu-msg{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:16px;}
  .mu-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
  @media(max-width:700px){.mu-stats{grid-template-columns:repeat(2,1fr);}}
  .mu-stat{background:#fff;border-radius:14px;border:1px solid #e5f0e8;padding:18px 20px;text-align:center;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mu-stat-icon{font-size:1.3rem;display:block;margin-bottom:6px;}
  .mu-stat-num{font-size:24px;font-weight:800;color:#0a2818;display:block;letter-spacing:-0.5px;}
  .mu-stat-label{font-size:12px;color:#6b7280;margin-top:3px;font-weight:500;}
  .mu-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;}
  .mu-search-wrap{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #e5f0e8;border-radius:10px;padding:8px 13px;flex:1;max-width:320px;transition:border 0.15s;}
  .mu-search-wrap:focus-within{border-color:#16a34a;}
  .mu-search{border:none;outline:none;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#0f172a;background:transparent;flex:1;}
  .mu-search::placeholder{color:#9ca3af;}
  .mu-filter-sel{padding:8px 13px;border:1.5px solid #e5f0e8;border-radius:10px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#374151;outline:none;background:#fff;cursor:pointer;}
  .mu-count{font-size:12px;color:#9ca3af;font-weight:500;}
  .mu-card{background:#fff;border-radius:16px;border:1px solid #e5f0e8;overflow:hidden;box-shadow:0 2px 8px rgba(22,163,74,0.04);}
  .mu-table{width:100%;border-collapse:collapse;font-size:13px;}
  .mu-table th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#9ca3af;background:#f8faf8;border-bottom:1px solid #e5f0e8;}
  .mu-table td{padding:13px 16px;border-bottom:1px solid #f0fdf4;vertical-align:middle;}
  .mu-table tr:last-child td{border-bottom:none;}
  .mu-table tr:hover td{background:#fafff8;}
  .mu-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#4ade80);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;}
  .mu-name{font-weight:600;color:#0a2818;font-size:13px;}
  .mu-email{font-size:11px;color:#9ca3af;margin-top:1px;}
  .mu-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;}
  .mu-action-btn{padding:6px 14px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;border:none;transition:all 0.15s;}
  .mu-deactivate{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
  .mu-deactivate:hover{background:#fee2e2;}
  .mu-activate{background:#f0fdf4;color:#16a34a;border:1px solid #d1fae5;}
  .mu-activate:hover{background:#dcfce7;}
  .mu-action-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .mu-spinner{width:36px;height:36px;border:3px solid #d1fae5;border-top:3px solid #16a34a;border-radius:50%;animation:mu-spin 0.9s linear infinite;margin:0 auto 12px;}
  @keyframes mu-spin{to{transform:rotate(360deg);}}
  .mu-empty{text-align:center;padding:56px 24px;color:#9ca3af;}
`;

export default function ManageUsers() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [msg,        setMsg]        = useState('');
  const [toggling,   setToggling]   = useState(null);

  const notify = m => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token()}` } });
      setUsers(data.users || data || []);
    } catch { notify('Failed to load users'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async u => {
    setToggling(u._id);
    try {
      await axios.put(`${API}/admin/users/${u._id}/status`, { isActive: !u.isActive }, { headers: { Authorization: `Bearer ${token()}` } });
      notify(`${u.username || u.email} ${!u.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) { notify(err.response?.data?.message || 'Failed to update'); }
    finally { setToggling(null); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || `${u.firstName||''} ${u.lastName||''}`.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all: users.length,
    user: users.filter(u => u.role === 'user').length,
    guide: users.filter(u => u.role === 'guide').length,
    active: users.filter(u => u.isActive !== false).length,
  };

  const displayName = u => {
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    return u.username || u.name || u.email?.split('@')[0] || 'Unknown';
  };
  const initials = u => (u.firstName?.[0] || u.username?.[0] || u.email?.[0] || '?').toUpperCase();
  const joined   = u => u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—';

  return (
    <AdminLayout title="Users" subtitle="Manage registered travelers and guides">
      <style>{STYLES}</style>
      <div className="mu-root">
        {msg && <div className="mu-msg" style={{ background: msg.includes('deactivat') ? '#FEF3F2' : '#ECFDF3', color: msg.includes('deactivat') ? '#B42318' : '#027A48', border: `1px solid ${msg.includes('deactivat') ? '#FDA29B' : '#6CE9A6'}` }}>{msg}</div>}

        <div className="mu-stats">
          {[
            { icon: '👥', label: 'Total Accounts', num: counts.all    },
            { icon: '✈️', label: 'Travelers',       num: counts.user   },
            { icon: '🧭', label: 'Guides',           num: counts.guide  },
            { icon: '✅', label: 'Active',           num: counts.active },
          ].map(s => (
            <div key={s.label} className="mu-stat">
              <span className="mu-stat-icon">{s.icon}</span>
              <span className="mu-stat-num">{loading ? '—' : s.num}</span>
              <div className="mu-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mu-topbar">
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="mu-search-wrap">
              <span style={{ color:'#9ca3af' }}>🔍</span>
              <input className="mu-search" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="mu-filter-sel" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="user">Travelers</option>
              <option value="guide">Guides</option>
            </select>
            <span className="mu-count">{filtered.length} of {users.length}</span>
          </div>
        </div>

        <div className="mu-card">
          {loading ? (
            <div style={{ textAlign:'center', padding:56 }}>
              <div className="mu-spinner" />
              <p style={{ color:'#9ca3af', fontSize:13 }}>Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mu-empty">
              <div style={{ fontSize:48, marginBottom:12 }}>👤</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#0a2818', marginBottom:6 }}>No users found</div>
              <div style={{ fontSize:13 }}>{search || roleFilter ? 'Try adjusting your filters' : 'No registered users yet'}</div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="mu-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                          <div className="mu-avatar">{initials(u)}</div>
                          <div>
                            <div className="mu-name">{displayName(u)}</div>
                            {u.phone && <div className="mu-email">📱 {u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color:'#667085', fontSize:13 }}>{u.email}</td>
                      <td>
                        <span className="mu-badge" style={{ background: u.role === 'guide' ? '#FFFAEB' : '#f0fdf4', color: u.role === 'guide' ? '#B54708' : '#16a34a' }}>
                          {u.role === 'user' ? '✈️ Traveler' : '🧭 Guide'}
                        </span>
                      </td>
                      <td>
                        <span className="mu-badge" style={{ background: u.isActive !== false ? '#ECFDF3' : '#FEF3F2', color: u.isActive !== false ? '#027A48' : '#B42318' }}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color:'#667085', fontSize:12, whiteSpace:'nowrap' }}>{joined(u)}</td>
                      <td>
                        <button
                          className={`mu-action-btn ${u.isActive !== false ? 'mu-deactivate' : 'mu-activate'}`}
                          disabled={toggling === u._id}
                          onClick={() => handleToggle(u)}>
                          {toggling === u._id ? '⏳' : u.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
