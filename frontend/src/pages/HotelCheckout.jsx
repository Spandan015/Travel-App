import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MapPin, BedDouble, Users, CalendarDays, ChevronRight, ChevronLeft,
  ShieldCheck, CheckCircle2, Phone, CreditCard, Clock, AlertCircle,
  Star, BadgeCheck, ArrowLeft, Loader2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import hotelService from '../services/hotelService';
import hotelBookingService from '../services/hotelBookingService';
import { redirectToEsewa } from '../utils/esewaPayment';
import axios from 'axios';

// ✅ FIXED: port 3000 to match your backend
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --green: #16a34a;
  --green-dark: #0f7a35;
  --green-light: #f0fdf4;
  --green-mid: #dcfce7;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --bg: #f8fafc;
  --card: #ffffff;
  --amber: #f59e0b;
  --red: #dc2626;
}

.co-root { font-family: 'DM Sans', sans-serif; background: var(--bg); padding-top: 68px; min-height: 100vh; color: var(--text); }

/* ── Top bar ── */
.co-topbar { background: var(--card); border-bottom: 1px solid var(--border); padding: 14px 0; }
.co-topbar-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
.co-back-btn { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--muted); text-decoration: none; transition: color 0.15s; background: none; border: none; cursor: pointer; font-family: inherit; padding: 0; }
.co-back-btn:hover { color: var(--green); }
.co-steps { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
.co-step { display: flex; align-items: center; gap: 5px; }
.co-step.active { color: var(--green); font-weight: 700; }
.co-step.done { color: var(--green); }
.co-step-dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; background: var(--border); color: var(--muted); }
.co-step.active .co-step-dot { background: var(--green); color: #fff; }
.co-step.done .co-step-dot { background: var(--green-mid); color: var(--green); }
.co-step-sep { width: 24px; height: 1px; background: var(--border); }
@media(max-width:600px) { .co-steps { display: none; } }

/* ── Layout ── */
.co-body { max-width: 1100px; margin: 0 auto; padding: 32px 24px; display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
@media(max-width: 900px) { .co-body { grid-template-columns: 1fr; } .co-sidebar { order: -1; } }

/* ── Form card ── */
.co-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 20px; }
.co-card:last-child { margin-bottom: 0; }
.co-card-title { font-size: 16px; font-weight: 700; color: var(--text); margin: 0 0 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
.co-card-title-icon { color: var(--green); }

/* ── Form fields ── */
.co-field { margin-bottom: 18px; }
.co-field:last-child { margin-bottom: 0; }
.co-label { display: block; font-size: 12px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 7px; }
.co-label span { color: var(--red); margin-left: 2px; }
.co-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; background: #fff; transition: border 0.15s; box-sizing: border-box; }
.co-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(22,163,74,0.08); }
.co-input::placeholder { color: #94a3b8; }
.co-input::-webkit-calendar-picker-indicator { opacity: 0.6; }
.co-textarea { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; background: #fff; transition: border 0.15s; resize: vertical; min-height: 90px; box-sizing: border-box; }
.co-textarea:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(22,163,74,0.08); }
.co-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media(max-width:500px) { .co-row { grid-template-columns: 1fr; } }
.co-select { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; background: #fff; transition: border 0.15s; cursor: pointer; -webkit-appearance: none; box-sizing: border-box; }
.co-select:focus { border-color: var(--green); }

/* ── Counter input ── */
.co-counter-row { display: flex; align-items: center; justify-content: space-between; }
.co-counter-label { font-size: 13px; color: var(--text); font-weight: 500; }
.co-counter-sub { font-size: 11px; color: var(--muted); font-weight: 400; display: block; }
.co-counter { display: flex; align-items: center; gap: 0; border: 1.5px solid var(--border); border-radius: 10px; overflow: hidden; }
.co-counter-btn { width: 36px; height: 36px; background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text); display: flex; align-items: center; justify-content: center; transition: background 0.1s; font-family: inherit; }
.co-counter-btn:hover { background: var(--bg); }
.co-counter-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.co-counter-val { width: 36px; text-align: center; font-size: 14px; font-weight: 600; color: var(--text); }

/* ── Error / helper text ── */
.co-error { font-size: 11.5px; color: var(--red); margin-top: 5px; display: flex; align-items: center; gap: 4px; font-weight: 500; }
.co-helper { font-size: 11.5px; color: var(--muted); margin-top: 5px; }

/* ── Sidebar summary ── */
.co-summary-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); position: sticky; top: 100px; }
.co-summary-img { width: 100%; height: 180px; object-fit: cover; display: block; background: #e2e8f0; }
.co-summary-body { padding: 22px; }
.co-summary-name { font-size: 17px; font-weight: 700; color: var(--text); margin: 0 0 6px; line-height: 1.3; }
.co-summary-location { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.co-summary-verified { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--green); font-weight: 600; margin-bottom: 16px; }
.co-summary-divider { height: 1px; background: var(--border); margin: 14px 0; }
.co-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 8px; }
.co-summary-row:last-child { margin-bottom: 0; }
.co-summary-row-label { color: var(--muted); }
.co-summary-row-val { color: var(--text); font-weight: 600; }
.co-summary-total { display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 700; color: var(--text); border-top: 2px solid var(--border); padding-top: 14px; margin-top: 10px; }
.co-room-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--green-light); border: 1px solid var(--green-mid); color: var(--green-dark); font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; }

/* ── Submit area ── */
.co-submit-area { margin-top: 4px; }
.co-esewa-btn { width: 100%; padding: 16px; background: #60bb46; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 16px rgba(96,187,70,0.3); margin-bottom: 10px; }
.co-esewa-btn:hover:not(:disabled) { background: #4da535; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(96,187,70,0.4); }
.co-esewa-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.co-esewa-logo { height: 18px; filter: brightness(0) invert(1); }
.co-cancel-btn { width: 100%; padding: 12px; background: transparent; color: var(--muted); border: 1.5px solid var(--border); border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.co-cancel-btn:hover { border-color: var(--text); color: var(--text); }

/* ── Trust strip ── */
.co-trust { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; padding: 14px 0 0; }
.co-trust-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); font-weight: 500; }

/* ── Alert ── */
.co-alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 13px 16px; font-size: 13px; color: var(--red); font-weight: 600; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 8px; }
.co-alert-success { background: var(--green-light); border-color: var(--green-mid); color: var(--green-dark); }

/* ── Loading ── */
.co-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
.co-spinner { width: 42px; height: 42px; border: 3px solid var(--green-mid); border-top-color: var(--green); border-radius: 50%; animation: coSpin 0.8s linear infinite; }
@keyframes coSpin { to { transform: rotate(360deg); } }
`;

if (typeof document !== 'undefined' && !document.getElementById('co-styles')) {
  const s = document.createElement('style');
  s.id = 'co-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / 86400000));
}

function today() {
  return new Date().toISOString().split('T')[0];
}
function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HotelCheckout() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { user }     = useContext(AuthContext);

  const passedState  = location.state || {};

  const [hotel,      setHotel]      = useState(passedState.hotel || null);
  const [loading,    setLoading]    = useState(!passedState.hotel);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const [checkIn,    setCheckIn]    = useState(passedState.checkIn    || today());
  const [checkOut,   setCheckOut]   = useState(passedState.checkOut   || tomorrow());
  const [roomType,   setRoomType]   = useState(passedState.selectedRoomType || '');
  const [adults,     setAdults]     = useState(2);
  const [children,   setChildren]   = useState(0);
  const [rooms,      setRooms]      = useState(1);
  const [requests,   setRequests]   = useState('');

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (hotel) return;
    (async () => {
      try {
        const res = await hotelService.getHotelById(id);
        const h   = res.hotel || res;
        setHotel(h);
        if (h.roomTypes?.length > 0 && !roomType) {
          const first = h.roomTypes.find(rt =>
            rt.availableRooms == null || rt.availableRooms > 0
          );
          setRoomType(first?.type || '');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user]);

  const nights = calcNights(checkIn, checkOut);
  const pricePerNight = (() => {
    if (hotel?.roomTypes?.length > 0 && roomType) {
      const rt = hotel.roomTypes.find(r => r.type === roomType);
      if (rt?.price) return rt.price;
    }
    return hotel?.pricePerNight || 0;
  })();
  const totalPrice = pricePerNight * nights * rooms;
  const heroImg    = hotel ? ([hotel.mainImage, ...(hotel.images||[])].filter(Boolean)[0] || FALLBACK) : FALLBACK;

  const validate = () => {
    const errs = {};
    if (!checkIn)  errs.checkIn  = 'Check-in date is required';
    if (!checkOut) errs.checkOut = 'Check-out date is required';
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn))
      errs.checkOut = 'Check-out must be after check-in';
    if (nights <= 0) errs.checkOut = 'Must stay at least 1 night';
    if (hotel?.roomTypes?.length > 0 && !roomType) errs.roomType = 'Please select a room type';
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!user) { navigate('/login'); return; }

    setSubmitting(true);
    try {
      // 1. Create booking — ✅ FIXED: added numberOfGuests, matches controller exactly
      const bookingPayload = {
        hotelId:         id,
        checkInDate:     checkIn,
        checkOutDate:    checkOut,
        roomType:        roomType || undefined,
        numberOfRooms:   rooms,
        numberOfGuests:  adults + children,   // ✅ was missing before
        specialRequests: requests || undefined,
      };

      const bookingRes = await hotelBookingService.createHotelBooking(bookingPayload);
      const booking    = bookingRes.booking || bookingRes;

      // 2. Initiate eSewa — ✅ FIXED: uses nt_token to match AuthContext
      const { data: esewaRes } = await axios.post(
        `${API}/esewa/initiate`,
        { bookingId: booking._id, bookingType: 'hotel' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('nt_token')}` } }
      );

      // 3. Redirect to eSewa
      setTimeout(() => redirectToEsewa(esewaRes), 500);

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Booking failed. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="co-root">
      <div className="co-loading">
        <div className="co-spinner" />
        <p style={{ color:'var(--muted)', fontSize:14 }}>Loading checkout…</p>
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="co-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', flexDirection:'column', gap:16 }}>
      <AlertCircle size={48} color="#dc2626" />
      <h2 style={{ fontWeight:700, margin:0 }}>Hotel not found</h2>
      <Link to="/browse-hotels" style={{ color:'var(--green)', fontWeight:600 }}>Back to Hotels</Link>
    </div>
  );

  return (
    <div className="co-root">

      {/* ── TOP BAR ── */}
      <div className="co-topbar">
        <div className="co-topbar-inner">
          <button className="co-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back to hotel
          </button>
          <div className="co-steps">
            <div className="co-step done">
              <div className="co-step-dot"><CheckCircle2 size={10} /></div>
              Choose room
            </div>
            <div className="co-step-sep" />
            <div className="co-step active">
              <div className="co-step-dot">2</div>
              Your details
            </div>
            <div className="co-step-sep" />
            <div className="co-step">
              <div className="co-step-dot">3</div>
              Payment
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="co-body">

        <div>
          {error && (
            <div className="co-alert">
              <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }} />
              {error}
            </div>
          )}

          {/* Dates */}
          <div className="co-card">
            <div className="co-card-title">
              <CalendarDays size={18} className="co-card-title-icon" />
              Select your dates
            </div>
            <div className="co-row">
              <div className="co-field">
                <label className="co-label">Check-in <span>*</span></label>
                <input type="date" className="co-input" value={checkIn} min={today()}
                  onChange={e => { setCheckIn(e.target.value); setFieldErrors(f => ({...f, checkIn:''})); }} />
                {fieldErrors.checkIn && <div className="co-error"><AlertCircle size={11} />{fieldErrors.checkIn}</div>}
              </div>
              <div className="co-field">
                <label className="co-label">Check-out <span>*</span></label>
                <input type="date" className="co-input" value={checkOut} min={checkIn || tomorrow()}
                  onChange={e => { setCheckOut(e.target.value); setFieldErrors(f => ({...f, checkOut:''})); }} />
                {fieldErrors.checkOut && <div className="co-error"><AlertCircle size={11} />{fieldErrors.checkOut}</div>}
              </div>
            </div>
            {nights > 0 && (
              <div style={{ background:'var(--green-light)', border:'1px solid var(--green-mid)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--green-dark)', fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                <CheckCircle2 size={14} />
                {nights} night{nights > 1 ? 's' : ''} · {new Date(checkIn).toLocaleDateString('en-NP', { day:'numeric', month:'short' })} → {new Date(checkOut).toLocaleDateString('en-NP', { day:'numeric', month:'short', year:'numeric' })}
              </div>
            )}
          </div>

          {/* Room type */}
          {hotel.roomTypes?.length > 0 && (
            <div className="co-card">
              <div className="co-card-title">
                <BedDouble size={18} className="co-card-title-icon" />
                Room type
              </div>
              <div className="co-field" style={{ marginBottom:0 }}>
                <label className="co-label">Select room <span>*</span></label>
                <select className="co-select" value={roomType}
                  onChange={e => { setRoomType(e.target.value); setFieldErrors(f => ({...f, roomType:''})); }}>
                  <option value="">— Choose a room type —</option>
                  {hotel.roomTypes.map((rt, i) => {
                    const avail = rt.availableRooms != null ? rt.availableRooms : (rt.totalRooms || 999);
                    return (
                      <option key={i} value={rt.type} disabled={avail <= 0}>
                        {rt.type} — NPR {Number(rt.price || hotel.pricePerNight || 0).toLocaleString()}/night{avail <= 0 ? ' (Sold out)' : avail <= 3 ? ` (${avail} left)` : ''}
                      </option>
                    );
                  })}
                </select>
                {fieldErrors.roomType && <div className="co-error"><AlertCircle size={11} />{fieldErrors.roomType}</div>}
              </div>
            </div>
          )}

          {/* Guests & Rooms */}
          <div className="co-card">
            <div className="co-card-title">
              <Users size={18} className="co-card-title-icon" />
              Guests &amp; rooms
            </div>
            <div className="co-field">
              <div className="co-counter-row">
                <div>
                  <div className="co-counter-label">Adults</div>
                  <div className="co-counter-sub">Age 13+</div>
                </div>
                <div className="co-counter">
                  <button className="co-counter-btn" disabled={adults <= 1} onClick={() => setAdults(v => v - 1)}>−</button>
                  <span className="co-counter-val">{adults}</span>
                  <button className="co-counter-btn" disabled={adults >= 10} onClick={() => setAdults(v => v + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="co-field" style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
              <div className="co-counter-row">
                <div>
                  <div className="co-counter-label">Children</div>
                  <div className="co-counter-sub">Age 0–12</div>
                </div>
                <div className="co-counter">
                  <button className="co-counter-btn" disabled={children <= 0} onClick={() => setChildren(v => v - 1)}>−</button>
                  <span className="co-counter-val">{children}</span>
                  <button className="co-counter-btn" disabled={children >= 6} onClick={() => setChildren(v => v + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="co-field" style={{ borderTop:'1px solid var(--border)', paddingTop:16, marginBottom:0 }}>
              <div className="co-counter-row">
                <div>
                  <div className="co-counter-label">Rooms</div>
                  <div className="co-counter-sub">Number of rooms</div>
                </div>
                <div className="co-counter">
                  <button className="co-counter-btn" disabled={rooms <= 1} onClick={() => setRooms(v => v - 1)}>−</button>
                  <span className="co-counter-val">{rooms}</span>
                  <button className="co-counter-btn" disabled={rooms >= 5} onClick={() => setRooms(v => v + 1)}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Special requests */}
          <div className="co-card">
            <div className="co-card-title" style={{ marginBottom:16 }}>
              <Phone size={18} className="co-card-title-icon" />
              Special requests
              <span style={{ fontSize:12, color:'var(--muted)', fontWeight:400, marginLeft:'auto' }}>Optional</span>
            </div>
            <textarea className="co-textarea"
              placeholder="e.g. Early check-in, dietary requirements, honeymoon setup, quiet room…"
              value={requests} onChange={e => setRequests(e.target.value)} />
            <p className="co-helper">Requests are not guaranteed but the property will do their best to accommodate.</p>
          </div>

          {/* Payment & submit */}
          <div className="co-card">
            <div className="co-card-title">
              <CreditCard size={18} className="co-card-title-icon" />
              Payment
            </div>
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" style={{ height:28, objectFit:'contain' }} onError={e => e.target.style.display='none'} />
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Pay with eSewa</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>Nepal's most trusted digital wallet</div>
              </div>
              <CheckCircle2 size={18} color="var(--green)" style={{ marginLeft:'auto', flexShrink:0 }} />
            </div>
            <div className="co-submit-area">
              <button className="co-esewa-btn" onClick={handleSubmit} disabled={submitting || nights <= 0}>
                {submitting
                  ? <><Loader2 size={16} style={{ animation:'coSpin 0.8s linear infinite' }} /> Processing…</>
                  : <>
                      <img src="https://esewa.com.np/common/images/esewa_logo.png" className="co-esewa-logo" alt="" onError={e => e.target.style.display='none'} />
                      Pay NPR {totalPrice > 0 ? Number(totalPrice).toLocaleString() : '—'} with eSewa
                    </>
                }
              </button>
              <button className="co-cancel-btn" onClick={() => navigate(-1)}>← Go back</button>
            </div>
            <div className="co-trust">
              <div className="co-trust-item"><ShieldCheck size={12} color="var(--green)" /> Secure payment</div>
              <div className="co-trust-item"><CheckCircle2 size={12} color="var(--green)" /> Instant confirmation</div>
              <div className="co-trust-item"><CreditCard size={12} color="var(--green)" /> No hidden fees</div>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="co-sidebar">
          <div className="co-summary-card">
            <img src={heroImg} alt={hotel.name} className="co-summary-img" onError={e => e.target.src = FALLBACK} />
            <div className="co-summary-body">
              <h2 className="co-summary-name">{hotel.name}</h2>
              <div className="co-summary-location">
                <MapPin size={12} />
                {hotel.address || hotel.location || 'Nepal'}
              </div>
              <div className="co-summary-verified">
                <BadgeCheck size={12} />
                Verified property
              </div>
              {roomType && (
                <div style={{ marginBottom:14 }}>
                  <div className="co-room-tag"><BedDouble size={13} />{roomType}</div>
                </div>
              )}
              <div className="co-summary-divider" />
              <div className="co-summary-row">
                <span className="co-summary-row-label">Price per night</span>
                <span className="co-summary-row-val">NPR {Number(pricePerNight).toLocaleString()}</span>
              </div>
              <div className="co-summary-row">
                <span className="co-summary-row-label">Rooms</span>
                <span className="co-summary-row-val">{rooms}</span>
              </div>
              <div className="co-summary-row">
                <span className="co-summary-row-label">Guests</span>
                <span className="co-summary-row-val">{adults + children}</span>
              </div>
              <div className="co-summary-row">
                <span className="co-summary-row-label">Duration</span>
                <span className="co-summary-row-val">{nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '—'}</span>
              </div>
              {checkIn && checkOut && nights > 0 && (
                <div className="co-summary-row">
                  <span className="co-summary-row-label">Dates</span>
                  <span className="co-summary-row-val" style={{ fontSize:12 }}>
                    {new Date(checkIn).toLocaleDateString('en-NP', { day:'numeric', month:'short' })}
                    {' → '}
                    {new Date(checkOut).toLocaleDateString('en-NP', { day:'numeric', month:'short' })}
                  </span>
                </div>
              )}
              <div className="co-summary-row">
                <span className="co-summary-row-label">Taxes &amp; fees</span>
                <span className="co-summary-row-val">Included</span>
              </div>
              <div className="co-summary-total">
                <span>Total</span>
                <span style={{ color: totalPrice > 0 ? 'var(--green)' : 'var(--muted)' }}>
                  {totalPrice > 0 ? `NPR ${Number(totalPrice).toLocaleString()}` : '—'}
                </span>
              </div>
              {totalPrice === 0 && (
                <p style={{ fontSize:11, color:'var(--muted)', textAlign:'center', marginTop:8 }}>
                  Select dates to see the total price
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
