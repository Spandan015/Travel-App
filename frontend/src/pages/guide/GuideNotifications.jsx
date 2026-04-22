import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Calendar, DollarSign, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const TYPE_META = {
  booking_request:   { icon: Calendar,       color: '#f59e0b', bg: '#fffaeb' },
  booking_accepted:  { icon: CheckCheck,     color: '#16a34a', bg: '#f0fdf4' },
  booking_rejected:  { icon: AlertCircle,    color: '#b91c1c', bg: '#fef2f2' },
  booking_cancelled: { icon: AlertCircle,    color: '#6b7280', bg: '#f9fafb' },
  booking_completed: { icon: CheckCheck,     color: '#0d9488', bg: '#f0fdf9' },
  new_message:       { icon: MessageSquare,  color: '#7c3aed', bg: '#f5f3ff' },
  payment_received:  { icon: DollarSign,     color: '#16a34a', bg: '#f0fdf4' },
  review_received:   { icon: Star,           color: '#f59e0b', bg: '#fffaeb' },
};

const fmtAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function GuideNotifications() {
  const navigate = useNavigate();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    notificationService.getAll()
      .then((d) => setNotifs(d.notifications || []))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleClick = async (n) => {
    if (!n.isRead) await notificationService.markRead(n._id);
    setNotifs((prev) => prev.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
    if (n.link) navigate(n.link);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await notificationService.delete(id);
    setNotifs((prev) => prev.filter((n) => n._id !== id));
  };

  const handleMarkAll = async () => {
    await notificationService.markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a2818', margin: 0 }}>
            Notifications
            {unread > 0 && (
              <span style={{ marginLeft: 10, background: '#ef4444', color: '#fff', fontSize: 12, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                {unread} new
              </span>
            )}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Stay updated on bookings, messages, and payments.</p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: '#f0fdf4', color: '#16a34a',
              border: '1.5px solid #86efac', borderRadius: 10,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading…</div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
            <Bell size={40} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontWeight: 700, color: '#0a2818', marginBottom: 4 }}>All caught up!</div>
            <div style={{ fontSize: 13 }}>No notifications yet.</div>
          </div>
        ) : (
          notifs.map((n, i) => {
            const meta = TYPE_META[n.type] || TYPE_META.booking_request;
            const Icon = meta.icon;
            return (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px',
                  borderBottom: i < notifs.length - 1 ? '1px solid #f0fdf4' : 'none',
                  background: n.isRead ? '#fff' : '#f8faf8',
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? '#fff' : '#f8faf8'}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={18} color={meta.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontWeight: n.isRead ? 600 : 700, fontSize: 14, color: '#0a2818' }}>{n.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{fmtAgo(n.createdAt)}</span>
                      {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>{n.body}</div>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(e, n._id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#d1d5db', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
