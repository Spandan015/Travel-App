// src/components/BookingModal.jsx
// Generic booking modal with eSewa payment integration.
// Props:
//   type             — 'hotel' | 'package' | 'trek'
//   item             — the hotel / package / trek object
//   onClose          — close handler
//   selectedRoomType — (hotel only) room type name selected on HotelDetail page
import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { redirectToEsewa } from '../utils/esewaPayment';

const API      = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const getToken = () => localStorage.getItem('nt_token');

const INITIAL = {
  checkInDate: '', checkOutDate: '',
  startDate: '',
  adults: 2, children: 0, rooms: 1,
  specialRequests: '',
};

// ── helpers ──────────────────────────────────────────────────────────────────
const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86_400_000));
};

// ── NEW: get price for a specific room type (falls back to hotel base price) ─
const getRoomTypePrice = (item, roomTypeName) => {
  if (!roomTypeName || !item?.roomTypes?.length) return null;
  const rt = item.roomTypes.find(
    r => r.type && r.type.toLowerCase() === roomTypeName.toLowerCase()
  );
  return rt?.price || null;
};

const getItemPrice = (type, item, selectedRoomType) => {
  if (type === 'hotel') {
    // Use selected room type price if available, else base price
    const rtPrice = getRoomTypePrice(item, selectedRoomType);
    return rtPrice || item?.pricePerNight || 0;
  }
  if (type === 'package') return (typeof item?.price === 'object' ? item.price?.amount : item?.price) || 0;
  if (type === 'trek')    return item?.price || 0;
  return 0;
};

const getItemName     = (type, item) => item?.name || '';
const getItemImage    = (type, item) =>
  item?.mainImage || item?.images?.[0] || item?.coverImage ||
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=60';
const getItemLocation = (type, item) => {
  if (type === 'hotel')   return item?.location || '';
  if (type === 'package') return item?.destinations?.[0]?.name || item?.startLocation || '';
  if (type === 'trek')    return item?.startPoint || item?.region?.name || '';
  return '';
};

// ── booking endpoint by type ──────────────────────────────────────────────────
const BOOKING_ENDPOINT = {
  hotel:   '/hotel-bookings',
  package: '/package-bookings',
  trek:    '/trek-bookings',
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW: accept selectedRoomType prop
export default function BookingModal({ type = 'hotel', item, onClose, selectedRoomType }) {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();
  const today      = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState(INITIAL);

  // ── NEW: allow room type to be changed from inside the modal too ──────────
  const [roomType, setRoomType] = useState(selectedRoomType || null);

  const [step, setStep]     = useState('details'); // 'details' | 'summary' | 'paying'
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) { navigate('/login'); return null; }
  if (!item)  return null;

  const nights   = nightsBetween(form.checkInDate, form.checkOutDate);

  // ── NEW: use room-type price if one is selected ───────────────────────────
  const baseRate = getItemPrice(type, item, roomType);

  // Price calculation
  const baseAmount  = type === 'hotel' ? baseRate * nights * form.rooms : baseRate;
  const serviceFee  = Math.round(baseAmount * 0.10);
  const tax         = Math.round(baseAmount * 0.13);
  const total       = baseAmount + serviceFee + tax;

  // ── NEW: availability check for selected room type ────────────────────────
  const selectedRt = roomType && item?.roomTypes?.length
    ? item.roomTypes.find(r => r.type?.toLowerCase() === roomType.toLowerCase())
    : null;
  const selectedRtAvailable = selectedRt
    ? (selectedRt.availableRooms != null ? selectedRt.availableRooms : selectedRt.totalRooms || 0)
    : Infinity; // no room types = no limit
  // ─────────────────────────────────────────────────────────────────────────

  // ── Step 1: validate & proceed ───────────────────────────────────────────
  const handleProceed = () => {
    setError('');
    if (type === 'hotel') {
      if (!form.checkInDate || !form.checkOutDate) return setError('Please select check-in and check-out dates.');
      if (nights <= 0) return setError('Check-out must be after check-in.');
      // NEW: check room availability before proceeding
      if (item?.roomTypes?.length > 0 && !roomType)
        return setError('Please select a room type.');
      if (selectedRtAvailable <= 0)
        return setError(`The selected room type (${roomType}) is sold out. Please go back and choose another.`);
      if (form.rooms > selectedRtAvailable)
        return setError(`Only ${selectedRtAvailable} room(s) of type "${roomType}" are available.`);
    }
    if ((type === 'package' || type === 'trek') && !form.startDate)
      return setError('Please select a start date.');
    setStep('summary');
  };

  // ── Step 2: create booking → eSewa ───────────────────────────────────────
  const handlePayWithEsewa = async () => {
    setLoading(true);
    setError('');
    try {
      // 1️⃣ Build payload per type
      let bookingPayload;
      if (type === 'hotel') {
        bookingPayload = {
          hotelId:        item._id,
          checkInDate:    form.checkInDate,
          checkOutDate:   form.checkOutDate,
          numberOfGuests: form.adults + form.children,
          numberOfRooms:  form.rooms,
          specialRequests: form.specialRequests,
          // ── NEW: send selected room type to the API ──────────────────────
          roomType:       roomType || undefined,
          // ─────────────────────────────────────────────────────────────────
        };
      } else if (type === 'package') {
        bookingPayload = {
          packageId:      item._id,
          startDate:      form.startDate,
          numberOfGuests: form.adults + form.children,
          specialRequests: form.specialRequests,
        };
      } else if (type === 'trek') {
        bookingPayload = {
          trekId:         item._id,
          startDate:      form.startDate,
          numberOfGuests: form.adults + form.children,
          specialRequests: form.specialRequests,
        };
      }

      // 2️⃣ Create booking
      const { data: bookingRes } = await axios.post(
        `${API}${BOOKING_ENDPOINT[type]}`,
        bookingPayload,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const bookingId = bookingRes.booking._id;

      // 3️⃣ Initiate eSewa payment
      const { data: esewaRes } = await axios.post(
        `${API}/esewa/initiate`,
        { bookingId, bookingType: type },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      // 4️⃣ Redirect to eSewa sandbox
      setStep('paying');
      setTimeout(() => redirectToEsewa(esewaRes), 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setStep('summary');
    } finally {
      setLoading(false);
    }
  };

  const set     = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const counter = (key, min, max) => (
    <div style={S.counterRow}>
      <button style={S.cBtn} disabled={form[key] <= min} onClick={() => set(key, form[key] - 1)}>−</button>
      <span style={S.cVal}>{form[key]}</span>
      <button style={S.cBtn} disabled={form[key] >= max} onClick={() => set(key, form[key] + 1)}>+</button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={S.headerTitle}>
              {step === 'details' && 'Complete Your Booking'}
              {step === 'summary' && 'Review & Pay'}
              {step === 'paying'  && 'Redirecting to eSewa…'}
            </div>
            <div style={S.headerSub}>
              {step === 'details' && 'Fill in your details below'}
              {step === 'summary' && 'Review your booking before paying'}
              {step === 'paying'  && 'Please wait, do not close this tab'}
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Item preview strip */}
        <div style={S.itemStrip}>
          <img
            src={getItemImage(type, item)}
            alt={getItemName(type, item)}
            style={S.itemImg}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=60'; }}
          />
          <div>
            <div style={S.itemName}>{getItemName(type, item)}</div>
            <div style={S.itemLoc}>📍 {getItemLocation(type, item)}</div>
            <div style={S.itemPrice}>
              NPR {baseRate.toLocaleString()}
              {type === 'hotel' ? ' / night' : ' / person'}
              {/* NEW: show which room type price is being used */}
              {type === 'hotel' && roomType && (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#15803d', marginLeft: 6 }}>
                  ({roomType})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div style={S.errorBox}>⚠️ {error}</div>}

        {/* ── STEP: details ── */}
        {step === 'details' && (
          <div style={S.body}>
            {/* Hotel: check-in/out dates */}
            {type === 'hotel' && (
              <section style={S.section}>
                <div style={S.sectionTitle}>SELECT DATES</div>
                <div style={S.row2}>
                  <div style={S.field}>
                    <label style={S.label}>Check-in *</label>
                    <input style={S.input} type="date" min={today} value={form.checkInDate}
                      onChange={e => { set('checkInDate', e.target.value); if (form.checkOutDate && form.checkOutDate <= e.target.value) set('checkOutDate', ''); }} />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Check-out *</label>
                    <input style={S.input} type="date" min={form.checkInDate || today} value={form.checkOutDate}
                      onChange={e => set('checkOutDate', e.target.value)} />
                  </div>
                </div>
                {nights > 0 && (
                  <div style={S.nightBadge}>🌙 {nights} night{nights > 1 ? 's' : ''}</div>
                )}
              </section>
            )}

            {/* Package / Trek: start date */}
            {(type === 'package' || type === 'trek') && (
              <section style={S.section}>
                <div style={S.sectionTitle}>SELECT START DATE</div>
                <input style={S.input} type="date" min={today} value={form.startDate}
                  onChange={e => set('startDate', e.target.value)} />
                {item?.duration && form.startDate && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                    Duration: {item.duration} days
                  </div>
                )}
              </section>
            )}

            {/* ── NEW: Room type selector inside modal (for hotel) ─────────── */}
            {type === 'hotel' && item?.roomTypes?.length > 0 && (
              <section style={S.section}>
                <div style={S.sectionTitle}>ROOM TYPE *</div>
                <select
                  style={{ ...S.input, cursor: 'pointer' }}
                  value={roomType || ''}
                  onChange={e => setRoomType(e.target.value || null)}
                >
                  {!roomType && <option value="">— Select a room type —</option>}
                  {item.roomTypes.map((rt, i) => {
                    const avail = rt.availableRooms != null ? rt.availableRooms : (rt.totalRooms || 0);
                    const soldOut = avail <= 0;
                    return (
                      <option key={i} value={rt.type} disabled={soldOut}>
                        {rt.type}
                        {rt.price ? ` — NPR ${Number(rt.price).toLocaleString()}` : ''}
                        {soldOut ? ' (Sold out)' : ` (${avail} left)`}
                      </option>
                    );
                  })}
                </select>
                {/* Availability hint for selected room type */}
                {selectedRt && selectedRtAvailable > 0 && selectedRtAvailable <= 3 && (
                  <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginTop: 6 }}>
                    ⚠️ Only {selectedRtAvailable} room(s) left for this type!
                  </div>
                )}
              </section>
            )}
            {/* ─────────────────────────────────────────────────────────────── */}

            {/* Guests & Rooms */}
            <section style={S.section}>
              <div style={S.sectionTitle}>GUESTS {type === 'hotel' ? '& ROOMS' : ''}</div>
              <div style={S.counterItem}>
                <div><div style={S.counterLabel}>Adults</div><div style={S.counterSub}>Age 13+</div></div>
                {counter('adults', 1, 10)}
              </div>
              <div style={S.counterItem}>
                <div><div style={S.counterLabel}>Children</div><div style={S.counterSub}>Age 0–12</div></div>
                {counter('children', 0, 6)}
              </div>
              {type === 'hotel' && (
                <div style={S.counterItem}>
                  <div>
                    <div style={S.counterLabel}>Rooms</div>
                    {/* NEW: show max available for this room type */}
                    {selectedRt && (
                      <div style={S.counterSub}>Max {selectedRtAvailable} available</div>
                    )}
                  </div>
                  {counter('rooms', 1, Math.min(5, selectedRtAvailable || 5))}
                </div>
              )}
            </section>

            {/* Special requests */}
            <section style={S.section}>
              <div style={S.sectionTitle}>SPECIAL REQUESTS (OPTIONAL)</div>
              <textarea
                style={{ ...S.input, resize: 'vertical', minHeight: 72, paddingTop: 10 }}
                placeholder="e.g. Early check-in, dietary requirements…"
                value={form.specialRequests}
                onChange={e => set('specialRequests', e.target.value)}
              />
            </section>

            <button style={S.primaryBtn} onClick={handleProceed}>
              Continue to Summary →
            </button>
          </div>
        )}

        {/* ── STEP: summary ── */}
        {step === 'summary' && (
          <div style={S.body}>
            <section style={S.section}>
              <div style={S.sectionTitle}>BOOKING SUMMARY</div>
              {type === 'hotel' && (
                <>
                  <div style={S.summaryRow}><span>Check-in</span><strong>{form.checkInDate}</strong></div>
                  <div style={S.summaryRow}><span>Check-out</span><strong>{form.checkOutDate}</strong></div>
                  <div style={S.summaryRow}><span>Nights</span><strong>{nights}</strong></div>
                  <div style={S.summaryRow}><span>Rooms</span><strong>{form.rooms}</strong></div>
                  {/* NEW: show selected room type in summary */}
                  {roomType && (
                    <div style={S.summaryRow}><span>Room Type</span><strong>{roomType}</strong></div>
                  )}
                </>
              )}
              {(type === 'package' || type === 'trek') && (
                <div style={S.summaryRow}><span>Start Date</span><strong>{form.startDate}</strong></div>
              )}
              <div style={S.summaryRow}><span>Guests</span><strong>{form.adults + form.children}</strong></div>
              {form.specialRequests && (
                <div style={S.summaryRow}><span>Requests</span><strong style={{ maxWidth: 200, textAlign: 'right', fontSize: 12 }}>{form.specialRequests}</strong></div>
              )}
            </section>

            {/* Price breakdown */}
            <div style={S.priceBox}>
              <div style={S.sectionTitle}>PRICE BREAKDOWN</div>
              <div style={S.priceRow}>
                <span>
                  {type === 'hotel'
                    ? `NPR ${baseRate.toLocaleString()} × ${nights} nights × ${form.rooms} room${form.rooms > 1 ? 's' : ''}`
                    : `NPR ${baseRate.toLocaleString()} × ${form.adults + form.children} person${(form.adults + form.children) > 1 ? 's' : ''}`}
                </span>
                <span>NPR {baseAmount.toLocaleString()}</span>
              </div>
              <div style={S.priceRow}><span>Service fee (10%)</span><span>NPR {serviceFee.toLocaleString()}</span></div>
              <div style={S.priceRow}><span>Tax (13%)</span><span>NPR {tax.toLocaleString()}</span></div>
              <div style={S.totalRow}>
                <span>Total</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>
            </div>

            {/* eSewa pay button */}
            <button
              style={{ ...S.esewaBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handlePayWithEsewa}
              disabled={loading}
            >
              {loading ? (
                <span>Processing…</span>
              ) : (
                <>
                  <img
                    src="https://esewa.com.np/common/images/esewa_logo.png"
                    alt="eSewa"
                    style={{ height: 22, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  Pay NPR {total.toLocaleString()} with eSewa
                </>
              )}
            </button>
            <button style={S.backBtn} onClick={() => setStep('details')}>← Edit Details</button>
          </div>
        )}

        {/* ── STEP: paying ── */}
        {step === 'paying' && (
          <div style={{ ...S.body, textAlign: 'center', padding: '40px 24px' }}>
            <div style={S.spinner} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Redirecting to eSewa…
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              You'll be taken to the eSewa sandbox to complete your payment.
              <br />Please do not close or refresh this page.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16, backdropFilter: 'blur(6px)' },
  modal:       { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', fontFamily: "'Plus Jakarta Sans', 'Roboto', sans-serif" },
  header:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 22px 16px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 2, borderRadius: '20px 20px 0 0' },
  headerTitle: { fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' },
  headerSub:   { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  closeBtn:    { width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: 'none', cursor: 'pointer', fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemStrip:   { display: 'flex', gap: 14, padding: '14px 22px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', alignItems: 'center' },
  itemImg:     { width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  itemName:    { fontWeight: 700, fontSize: 14, color: '#0f172a' },
  itemLoc:     { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemPrice:   { fontSize: 14, fontWeight: 800, color: '#16a34a', marginTop: 4 },
  errorBox:    { margin: '12px 22px 0', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13 },
  body:        { padding: '18px 22px 22px' },
  section:     { marginBottom: 20 },
  sectionTitle:{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 },
  row2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field:       { display: 'flex', flexDirection: 'column', gap: 4 },
  label:       { fontSize: 11, fontWeight: 700, color: '#64748b' },
  input:       { padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  nightBadge:  { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginTop: 10 },
  counterItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' },
  counterLabel:{ fontSize: 13, fontWeight: 600, color: '#0f172a' },
  counterSub:  { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  counterRow:  { display: 'flex', alignItems: 'center', gap: 12 },
  cBtn:        { width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' },
  cVal:        { fontWeight: 800, fontSize: 14, color: '#0f172a', minWidth: 22, textAlign: 'center' },
  summaryRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc', fontSize: 13, color: '#64748b' },
  priceBox:    { background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 16 },
  priceRow:    { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 7 },
  totalRow:    { display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: 10, marginTop: 4, letterSpacing: '-0.02em' },
  esewaBtn:    { width: '100%', padding: '14px', background: '#60bb46', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(96,187,70,0.35)', transition: 'all 0.2s' },
  backBtn:     { width: '100%', padding: '11px', background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  primaryBtn:  { width: '100%', padding: 14, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  spinner:     { width: 40, height: 40, border: '3px solid #dcfce7', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'bm-spin 0.9s linear infinite', margin: '0 auto 20px' },
};

if (typeof document !== 'undefined' && !document.getElementById('bm-spin-style')) {
  const s = document.createElement('style');
  s.id = 'bm-spin-style';
  s.textContent = '@keyframes bm-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}
