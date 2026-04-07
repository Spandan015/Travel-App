// src/pages/PaymentSuccess.jsx
// eSewa redirects to /payment/success?data=<base64>
// bookingType is extracted from the decoded transaction_uuid (e.g. "hotel-<id>-<ts>")

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const API      = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const getToken = () => localStorage.getItem('nt_token');

export default function PaymentSuccess() {
  const [params]              = useSearchParams();
  const [state,   setState]   = useState('verifying');
  const [booking, setBooking] = useState(null);
  const [txn,     setTxn]     = useState(null);
  const [errMsg,  setErrMsg]  = useState('');

  useEffect(() => {
    // eSewa sometimes sends malformed URLs like ?type=hotel?data=...
    // (two question marks), so URLSearchParams alone can miss "data".
    // We use a regex fallback on the raw query string to be safe.
    let data = params.get('data');

    if (!data) {
      const match = window.location.search.match(/[?&]data=([^&]+)/);
      data = match ? decodeURIComponent(match[1]) : null;
    }

    if (!data) {
      setErrMsg('No payment data received from eSewa.');
      setState('error');
      return;
    }

    // Decode base64 to extract bookingType from transaction_uuid
    // transaction_uuid format: "hotel-<bookingId>-<timestamp>"
    let bookingType = 'hotel';
    try {
      const decoded = JSON.parse(atob(data));
      bookingType = decoded.transaction_uuid?.split('-')[0] || 'hotel';
    } catch (_) { /* keep default */ }

    axios.post(
      `${API}/esewa/verify`,
      { data, bookingType },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
      .then(res => {
        setBooking(res.data.booking);
        setTxn(res.data.transaction);
        setState('success');
      })
      .catch(err => {
        setErrMsg(err.response?.data?.message || 'Payment verification failed.');
        setState('error');
      });
  }, []);

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* Verifying */}
        {state === 'verifying' && (
          <div style={S.center}>
            <div style={S.spinner} />
            <div style={S.title}>Verifying your payment…</div>
            <div style={S.sub}>Please wait, do not close this tab.</div>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <>
            <div style={S.iconWrap}>
              <div style={S.iconCircle}>✓</div>
            </div>
            <div style={{ ...S.title, color: '#16a34a' }}>Payment Successful!</div>
            <div style={S.sub}>Your booking has been confirmed.</div>

            {txn && (
              <div style={S.txnBox}>
                <div style={S.txnRow}>
                  <span>Transaction Code</span>
                  <strong>{txn.code}</strong>
                </div>
                <div style={S.txnRow}>
                  <span>Amount Paid</span>
                  <strong>NPR {Number(txn.amount).toLocaleString()}</strong>
                </div>
                <div style={S.txnRow}>
                  <span>Status</span>
                  <strong style={{ color: '#16a34a' }}>{txn.status}</strong>
                </div>
              </div>
            )}

            {booking && (
              <div style={S.bookingBox}>
                <div style={S.bookingTitle}>
                  {booking.hotel?.name || booking.name || 'Your Booking'}
                </div>
                {booking.hotel?.location && (
                  <div style={S.bookingLoc}>📍 {booking.hotel.location}</div>
                )}
                {booking.checkInDate && (
                  <div style={S.bookingDates}>
                    {new Date(booking.checkInDate).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                    {' → '}
                    {new Date(booking.checkOutDate).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                  </div>
                )}
                <div style={S.bookingId}>Booking ID: {booking._id}</div>
              </div>
            )}

            <div style={S.btnRow}>
              <Link to="/my-bookings"   style={S.primaryBtn}>View My Bookings</Link>
              <Link to="/browse-hotels" style={S.outlineBtn}>Browse More Hotels</Link>
            </div>
          </>
        )}

        {/* Error */}
        {state === 'error' && (
          <>
            <div style={S.iconWrap}>
              <div style={{ ...S.iconCircle, background: '#fef2f2', color: '#dc2626' }}>✕</div>
            </div>
            <div style={{ ...S.title, color: '#dc2626' }}>Verification Failed</div>
            <div style={S.sub}>{errMsg}</div>
            <div style={S.btnRow}>
              <Link to="/browse-hotels" style={S.primaryBtn}>Back to Hotels</Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#f0fdf4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
    fontFamily: "'Plus Jakarta Sans','Roboto',sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '40px 36px',
    maxWidth: 480, width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    textAlign: 'center',
  },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  spinner: {
    width: 44, height: 44,
    border: '3px solid #dcfce7', borderTop: '3px solid #16a34a',
    borderRadius: '50%',
    animation: 'ps-spin 0.9s linear infinite',
    marginBottom: 8,
  },
  iconWrap:   { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  iconCircle: {
    width: 72, height: 72, borderRadius: '50%',
    background: '#f0fdf4', color: '#16a34a',
    fontSize: 28, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '3px solid #bbf7d0',
  },
  title: { fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.03em' },
  sub:   { fontSize: 14, color: '#64748b', marginBottom: 20 },
  txnBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 12, padding: '14px 16px',
    marginBottom: 16, textAlign: 'left',
  },
  txnRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 13, color: '#374151', padding: '5px 0',
    borderBottom: '1px solid #dcfce7',
  },
  bookingBox: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '14px 16px',
    marginBottom: 24, textAlign: 'left',
  },
  bookingTitle: { fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 },
  bookingLoc:   { fontSize: 12, color: '#64748b', marginBottom: 4 },
  bookingDates: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  bookingId:    { fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' },
  btnRow:    { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    background: '#16a34a', color: '#fff',
    padding: '12px 24px', borderRadius: 12,
    fontWeight: 700, fontSize: 14, textDecoration: 'none',
    display: 'inline-block',
  },
  outlineBtn: {
    background: '#fff', color: '#374151',
    border: '1.5px solid #e2e8f0',
    padding: '12px 24px', borderRadius: 12,
    fontWeight: 600, fontSize: 14, textDecoration: 'none',
    display: 'inline-block',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('ps-spin-style')) {
  const s = document.createElement('style');
  s.id = 'ps-spin-style';
  s.textContent = '@keyframes ps-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}
