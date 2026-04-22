import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, DollarSign, Star, Clock,
  TrendingUp, Users, ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import guideDashboardService from '../../services/guideDashboardService';

const fmt    = (n) => Number(n || 0).toLocaleString();
const fmtNPR = (n) => `NPR ${fmt(n)}`;

function StatCard({ icon: Icon, label, value, sub, color, bg, loading }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8',
      padding: '20px 22px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color, borderRadius: '16px 16px 0 0' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon size={20} color={color} />
      </div>
      {loading
        ? <div style={{ height: 28, width: '60%', background: '#f0fdf4', borderRadius: 6, marginBottom: 8 }} />
        : <div style={{ fontSize: 26, fontWeight: 800, color: '#0a2818', letterSpacing: -1 }}>{value}</div>
      }
      <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, paddingTop: 8, borderTop: '1px solid #f2f4f7' }}>{sub}</div>}
    </div>
  );
}

function EarningsBar({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.earnings), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingBottom: 24 }}>
      {data.map((d, i) => {
        const h = Math.max((d.earnings / max) * 100, 4);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div
              title={fmtNPR(d.earnings)}
              style={{
                height: h, width: '100%', borderRadius: '6px 6px 0 0',
                background: i === data.length - 1 ? '#16a34a' : '#dcfce7',
                transition: 'height 0.5s ease',
              }}
            />
            <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function GuideOverview() {
  const { user }          = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    guideDashboardService.getStats()
      .then((d) => setStats(d.stats || d))
      .catch((err) => {
        console.error('Overview error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
        <AlertCircle size={40} color="#fca5a5" />
        <div style={{ fontWeight: 700, fontSize: 16, color: '#0a2818' }}>Could not load dashboard</div>
        <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', maxWidth: 340 }}>{error}</div>
        <button
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: '#16a34a', color: '#fff',
            border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    );
  }

  const s = stats || {};

  const CARDS = [
    { icon: CalendarDays, label: 'Total Bookings',  value: fmt(s.totalBookings),    sub: `${s.pendingCount  || 0} pending review`,        color: '#16a34a', bg: '#f0fdf4' },
    { icon: Clock,        label: 'Active Tours',    value: fmt(s.acceptedCount),    sub: 'Accepted & scheduled',                          color: '#0d9488', bg: '#f0fdf9' },
    { icon: DollarSign,   label: 'Total Earnings',  value: fmtNPR(s.totalEarnings), sub: `This month: ${fmtNPR(s.monthlyEarnings)}`,       color: '#7c3aed', bg: '#f5f3ff' },
    { icon: Star,         label: 'Average Rating',  value: s.avgRating || '0.0',    sub: `${s.totalReviews || 0} reviews received`,        color: '#f59e0b', bg: '#fffaeb' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0a2818', margin: 0 }}>
          Welcome back, {user?.firstName || user?.username}! 👋
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>
          Here's what's happening with your guide business today.
        </p>
      </div>

      {/* Pending alert */}
      {!loading && (s.pendingCount || 0) > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#fffaeb', border: '1px solid #fcd34d',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
        }}>
          <AlertCircle size={18} color="#d97706" />
          <span style={{ fontSize: 14, color: '#92400e', flex: 1 }}>
            You have <strong>{s.pendingCount}</strong> pending booking request{s.pendingCount !== 1 ? 's' : ''} waiting for your response.
          </span>
          <Link to="/guide/bookings" style={{ fontSize: 13, fontWeight: 700, color: '#d97706', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            Review <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {CARDS.map((c) => <StatCard key={c.label} {...c} loading={loading} />)}
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 16 }}>

        {/* Earnings chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818' }}>Earnings Overview</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Last 6 months</div>
            </div>
            <Link to="/guide/earnings" style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textDecoration: 'none', background: '#f0fdf4', padding: '5px 12px', borderRadius: 20 }}>
              Full report →
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 28, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0a2818' }}>{loading ? '—' : fmtNPR(s.totalEarnings)}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Total earned</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0a2818' }}>{loading ? '—' : fmtNPR(s.monthlyEarnings)}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>This month</div>
            </div>
          </div>

          {loading
            ? <div style={{ height: 120, background: '#f8faf8', borderRadius: 10 }} />
            : <EarningsBar data={s.monthlyBreakdown} />
          }
        </div>

        {/* Quick actions */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 14 }}>Quick Actions</div>
          {[
            { to: '/guide/bookings',     icon: CalendarDays, label: 'Manage Bookings',  sub: `${s.pendingCount || 0} pending`,    color: '#16a34a', bg: '#f0fdf4' },
            { to: '/guide/chat',         icon: Users,        label: 'Open Messages',    sub: 'Chat with tourists',                color: '#0d9488', bg: '#f0fdf9' },
            { to: '/guide/availability', icon: Clock,        label: 'Set Availability', sub: 'Update your schedule',              color: '#7c3aed', bg: '#f5f3ff' },
            { to: '/guide/profile-edit', icon: TrendingUp,   label: 'Edit Profile',     sub: 'Update rates & bio',                color: '#f59e0b', bg: '#fffaeb' },
          ].map(({ to, icon: Icon, label, sub, color, bg }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 6, border: '1px solid #e5f0e8', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8faf8'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2818' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>
                </div>
                <ArrowRight size={14} color="#9ca3af" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming bookings */}
      {!loading && s.upcoming && s.upcoming.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818' }}>Upcoming Tours</div>
            <Link to="/guide/bookings" style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textDecoration: 'none', background: '#f0fdf4', padding: '5px 12px', borderRadius: 20 }}>
              View all →
            </Link>
          </div>
          {s.upcoming.map((b) => (
            <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#f8faf8', borderRadius: 10, border: '1px solid #e5f0e8', marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {(b.user?.firstName?.[0] || b.user?.username?.[0] || 'T').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0a2818' }}>{b.user?.firstName || b.user?.username || 'Tourist'}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {b.destination?.name && ` · ${b.destination.name}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>NPR {fmt(b.totalPrice)}</div>
                <div style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 20, marginTop: 2, fontWeight: 700 }}>
                  {b.durationType === 'hourly' ? `${b.duration}h` : `${b.duration} day${b.duration > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state when no data and not loading */}
      {!loading && !error && !stats && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8' }}>
          <CalendarDays size={40} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0a2818', marginBottom: 6 }}>No data yet</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>Start accepting bookings to see your stats here.</div>
        </div>
      )}
    </div>
  );
}
