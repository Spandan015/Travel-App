import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import guideDashboardService from '../../services/guideDashboardService';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function CalendarPicker({ blockedDates, onToggle }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#16a34a', padding: '4px 10px' }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#0a2818' }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#16a34a', padding: '4px 10px' }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const key     = toKey(viewYear, viewMonth, day);
          const blocked = blockedDates.includes(key);
          const isPast  = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={key}
              onClick={() => !isPast && onToggle(key)}
              disabled={isPast}
              style={{
                aspectRatio: '1', borderRadius: 8,
                border: '1.5px solid',
                borderColor: blocked ? '#fca5a5' : '#d1fae5',
                background:  blocked ? '#fef2f2' : isPast ? '#f9fafb' : '#f0fdf4',
                color:       blocked ? '#b91c1c' : isPast ? '#d1d5db' : '#15803d',
                fontWeight: 600, fontSize: 13,
                cursor: isPast ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12, color: '#6b7280' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f0fdf4', border: '1.5px solid #d1fae5' }} />
          Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#fef2f2', border: '1.5px solid #fca5a5' }} />
          Blocked
        </div>
      </div>
    </div>
  );
}

export default function GuideAvailability() {
  const { user, login } = useAuth();
  const [isAvailable, setIsAvailable] = useState(user?.guideProfile?.availability ?? true);
  const [blockedDates, setBlockedDates] = useState(user?.guideProfile?.blockedDates || []);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState('');

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleDate = (key) => {
    setBlockedDates((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await guideDashboardService.updateAvailability({ isAvailable, blockedDates });
      notify('✅ Availability saved successfully!');
    } catch {
      notify('Error saving availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a2818', margin: 0 }}>Availability Management</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Control when you're open for bookings.</p>
      </div>

      {toast && (
        <div style={{ background: '#0a2818', color: '#fff', borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

        {/* Calendar */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 4 }}>Block Unavailable Dates</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={14} color="#9ca3af" />
            Click dates to mark them as blocked. Tourists cannot book you on blocked dates.
          </div>
          <CalendarPicker blockedDates={blockedDates} onToggle={toggleDate} />

          {blockedDates.length > 0 && (
            <div style={{ marginTop: 20, padding: '14px 16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#b91c1c', marginBottom: 8 }}>
                {blockedDates.length} date{blockedDates.length !== 1 ? 's' : ''} blocked
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[...blockedDates].sort().slice(0, 10).map((d) => (
                  <span key={d} style={{ fontSize: 11, background: '#fff', border: '1px solid #fca5a5', color: '#b91c1c', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                    {d}
                  </span>
                ))}
                {blockedDates.length > 10 && <span style={{ fontSize: 11, color: '#9ca3af' }}>+{blockedDates.length - 10} more</span>}
              </div>
              <button
                onClick={() => setBlockedDates([])}
                style={{ marginTop: 10, fontSize: 12, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'inherit' }}
              >
                Clear all blocked dates
              </button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Toggle availability */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>Overall Status</div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 12,
              background: isAvailable ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${isAvailable ? '#86efac' : '#fca5a5'}`,
              marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isAvailable
                  ? <CheckCircle size={20} color="#16a34a" />
                  : <XCircle   size={20} color="#b91c1c" />
                }
                <div>
                  <div style={{ fontWeight: 700, color: '#0a2818', fontSize: 14 }}>
                    {isAvailable ? 'Currently Available' : 'Currently Unavailable'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {isAvailable ? 'Tourists can book you' : 'No new bookings allowed'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setIsAvailable(true)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  background: isAvailable ? '#16a34a' : '#f0fdf4',
                  color: isAvailable ? '#fff' : '#15803d',
                  border: '1.5px solid #16a34a',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Go Online
              </button>
              <button
                onClick={() => setIsAvailable(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  background: !isAvailable ? '#b91c1c' : '#fef2f2',
                  color: !isAvailable ? '#fff' : '#b91c1c',
                  border: '1.5px solid #fca5a5',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Go Offline
              </button>
            </div>
          </div>

          {/* Tips */}
          <div style={{ background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#166534', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} /> Tips
            </div>
            {[
              'Block dates for holidays or personal commitments.',
              'Going offline stops ALL new booking requests.',
              'Existing accepted bookings are not affected by offline status.',
              'Update availability regularly to appear in search results.',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0 }}>•</span><span>{t}</span>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: saving ? '#86efac' : '#16a34a',
              color: '#fff', border: 'none',
              fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            {saving ? 'Saving…' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
}
