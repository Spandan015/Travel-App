import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, Calendar } from 'lucide-react';
import guideDashboardService from '../../services/guideDashboardService';

const fmt    = (n) => Number(n || 0).toLocaleString();
const fmtNPR = (n) => `NPR ${fmt(n)}`;

function EarningsBar({ data }) {
  const max = Math.max(...data.map((d) => d.earnings), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, padding: '0 0 28px', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, height: 1, background: '#f0fdf4' }} />
      {data.map((d, i) => {
        const h = Math.max((d.earnings / max) * 110, d.earnings > 0 ? 8 : 4);
        const isLast = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '100%', cursor: 'default' }} title={fmtNPR(d.earnings)}>
              <div style={{
                height: h, width: '100%', borderRadius: '6px 6px 0 0',
                background: isLast ? '#16a34a' : d.earnings > 0 ? '#86efac' : '#f0fdf4',
                transition: 'height 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function GuideEarnings() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guideDashboardService.getEarnings()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const e  = data?.earnings || {};
  const history   = data?.history || [];
  const breakdown = data?.breakdown || [];

  const CARDS = [
    { icon: DollarSign,   label: 'Total Earnings',   value: fmtNPR(e.total),   color: '#16a34a', bg: '#f0fdf4' },
    { icon: TrendingUp,   label: 'This Month',        value: fmtNPR(e.monthly), color: '#0d9488', bg: '#f0fdf9' },
    { icon: Calendar,     label: 'This Week',         value: fmtNPR(e.weekly),  color: '#7c3aed', bg: '#f5f3ff' },
    { icon: Clock,        label: 'Pending Payment',   value: fmtNPR(e.pending), color: '#f59e0b', bg: '#fffaeb' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a2818', margin: 0 }}>Earnings & Payments</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Track your income from completed tours.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {CARDS.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5f0e8', padding: '18px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0a2818' }}>{loading ? '—' : value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Chart + info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 4 }}>Monthly Earnings</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Last 6 months</div>
          {loading ? <div style={{ height: 140, background: '#f8faf8', borderRadius: 10 }} /> : <EarningsBar data={breakdown} />}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>Payment Info</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Payment method</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0a2818', marginBottom: 16 }}>Cash / Bank Transfer</div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 4 }}>💡 Tip</div>
            <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
              Payments are settled after the tourist confirms tour completion. Keep your profile updated to attract more bookings.
            </div>
          </div>
        </div>
      </div>

      {/* History table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>Earnings History</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>Loading…</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: '#6b7280' }}>
            <DollarSign size={36} color="#d1fae5" style={{ margin: '0 auto 10px', display: 'block' }} />
            <div style={{ fontWeight: 700, color: '#0a2818', marginBottom: 4 }}>No earnings yet</div>
            <div style={{ fontSize: 13 }}>Complete tours to see your earnings history.</div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 100px', gap: 12, padding: '8px 14px', background: '#f8faf8', borderRadius: 8, marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <span>Tourist</span><span>Date</span><span>Duration</span><span style={{ textAlign: 'right' }}>Earned</span>
            </div>
            {history.map((b) => (
              <div key={b._id} style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 120px 100px', gap: 12,
                padding: '12px 14px', borderBottom: '1px solid #f0fdf4', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {(b.user?.firstName?.[0] || 'T').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2818' }}>{b.user?.firstName || b.user?.username || 'Tourist'}</div>
                    {b.tourType && <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.tourType}</div>}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>
                  {new Date(b.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>
                  {b.duration} {b.durationType === 'hourly' ? 'hr(s)' : 'day(s)'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>+NPR {fmt(b.totalPrice)}</span>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Paid</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
