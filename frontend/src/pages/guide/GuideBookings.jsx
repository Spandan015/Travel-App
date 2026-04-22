import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, AlertCircle,
  User, MapPin, Calendar, CalendarDays, DollarSign, MessageSquare, Filter
} from 'lucide-react';
import guideDashboardService from '../../services/guideDashboardService';

const STATUS_STYLES = {
  pending:   { bg: '#fffaeb', color: '#b45309', border: '#fcd34d', label: 'Pending' },
  accepted:  { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: 'Accepted' },
  rejected:  { bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5', label: 'Rejected' },
  completed: { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd', label: 'Completed' },
  cancelled: { bg: '#f9fafb', color: '#6b7280', border: '#d1d5db', label: 'Cancelled' },
};

const TABS = ['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'];
const fmt  = (n) => Number(n || 0).toLocaleString();

function BookingCard({ booking, onAccept, onReject, onComplete, onCancel }) {
  const st     = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const tourist = booking.user;
  const [expanded, setExpanded] = useState(false);
  const [msgInput, setMsgInput] = useState('');

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: `1px solid ${st.border}`,
      padding: '20px', marginBottom: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        {/* Tourist info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0, overflow: 'hidden',
          }}>
            {tourist?.profileImage
              ? <img src={tourist.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (tourist?.firstName?.[0] || tourist?.username?.[0] || 'T').toUpperCase()
            }
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0a2818', fontSize: 15 }}>
              {tourist?.firstName || tourist?.username || 'Tourist'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{tourist?.email}</div>
            {tourist?.phone && <div style={{ fontSize: 12, color: '#6b7280' }}>{tourist?.phone}</div>}
          </div>
        </div>

        {/* Status badge + price */}
        <div style={{ textAlign: 'right' }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            background: st.bg, color: st.color, fontSize: 12, fontWeight: 700,
            border: `1px solid ${st.border}`, marginBottom: 6,
          }}>
            {st.label}
          </span>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>NPR {fmt(booking.totalPrice)}</div>
        </div>
      </div>

      {/* Booking details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, margin: '14px 0', padding: '14px 0', borderTop: '1px solid #f0fdf4', borderBottom: '1px solid #f0fdf4' }}>
        {[
          { icon: Calendar,   label: 'Start Date',  val: new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          { icon: Calendar,   label: 'End Date',    val: new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          { icon: Clock,      label: 'Duration',    val: `${booking.duration} ${booking.durationType === 'hourly' ? 'hour(s)' : 'day(s)'}` },
          { icon: User,       label: 'People',      val: `${booking.numberOfPeople} person${booking.numberOfPeople > 1 ? 's' : ''}` },
          { icon: DollarSign, label: 'Rate',        val: `NPR ${fmt(booking.pricePerUnit)}/${booking.durationType === 'hourly' ? 'hr' : 'day'}` },
          ...(booking.tourType  ? [{ icon: MapPin, label: 'Tour Type', val: booking.tourType }] : []),
          ...(booking.destination ? [{ icon: MapPin, label: 'Destination', val: booking.destination?.name }] : []),
        ].map(({ icon: Icon, label, val }) => (
          <div key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>
              <Icon size={12} />{label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0a2818' }}>{val}</div>
          </div>
        ))}
      </div>

      {booking.specialRequests && (
        <div style={{ background: '#f8faf8', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#374151' }}>
          <strong style={{ color: '#0a2818' }}>Special requests:</strong> {booking.specialRequests}
        </div>
      )}

      {/* Action buttons */}
      {booking.status === 'pending' && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8, padding: 0 }}
          >
            {expanded ? '▲ Hide message' : '▼ Add a message (optional)'}
          </button>
          {expanded && (
            <textarea
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Add a message to the tourist..."
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: 10,
              }}
              rows={2}
            />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onAccept(booking._id, msgInput)}
              style={{
                flex: 1, padding: '11px', background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <CheckCircle size={16} /> Accept Booking
            </button>
            <button
              onClick={() => onReject(booking._id, msgInput)}
              style={{
                flex: 1, padding: '11px', background: '#fef2f2', color: '#b91c1c',
                border: '1.5px solid #fca5a5', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>
      )}

      {booking.status === 'accepted' && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onComplete(booking._id)}
            style={{
              flex: 1, padding: '11px', background: '#eff6ff', color: '#1d4ed8',
              border: '1.5px solid #93c5fd', borderRadius: 10, fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <CheckCircle size={16} /> Mark as Completed
          </button>
          <button
            onClick={() => onCancel(booking._id)}
            style={{
              padding: '11px 16px', background: '#f9fafb', color: '#6b7280',
              border: '1.5px solid #d1d5db', borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function GuideBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [toast, setToast]       = useState('');

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await guideDashboardService.getBookings(tab);
      setBookings(data.bookings || []);
    } catch { notify('Error loading bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [tab]);

  const handleAccept = async (id, msg) => {
    try {
      await guideDashboardService.acceptBooking(id, msg);
      notify('✅ Booking accepted! Tourist has been notified.');
      fetchBookings();
    } catch (e) { notify(e.response?.data?.message || 'Error accepting booking'); }
  };

  const handleReject = async (id, msg) => {
    if (!window.confirm('Reject this booking request?')) return;
    try {
      await guideDashboardService.rejectBooking(id, msg);
      notify('Booking rejected.');
      fetchBookings();
    } catch (e) { notify(e.response?.data?.message || 'Error rejecting booking'); }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this tour as completed?')) return;
    try {
      await guideDashboardService.completeBooking(id);
      notify('✅ Tour marked as completed!');
      fetchBookings();
    } catch (e) { notify(e.response?.data?.message || 'Error completing booking'); }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return; // user pressed Cancel
    try {
      await guideDashboardService.cancelBooking(id, reason);
      notify('Booking cancelled.');
      fetchBookings();
    } catch (e) { notify(e.response?.data?.message || 'Error cancelling booking'); }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a2818', margin: 0 }}>Booking Management</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Review and manage your tour booking requests.</p>
      </div>

      {toast && (
        <div style={{
          background: '#0a2818', color: '#fff', borderRadius: 10,
          padding: '12px 18px', fontSize: 13, fontWeight: 600,
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast}
        </div>
      )}

      {/* Tab filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: '1.5px solid',
            background: tab === t ? '#16a34a' : '#fff',
            borderColor: tab === t ? '#16a34a' : '#d1fae5',
            color: tab === t ? '#fff' : '#374151',
            transition: 'all 0.15s',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #d1fae5', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
          Loading bookings…
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8' }}>
          <CalendarDays size={40} color="#d1fae5" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0a2818', marginBottom: 6 }}>No {tab === 'all' ? '' : tab} bookings</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            {tab === 'pending' ? 'New booking requests will appear here.' : 'No bookings found for this filter.'}
          </div>
        </div>
      ) : (
        <div>
          {bookings.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              onAccept={handleAccept}
              onReject={handleReject}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
