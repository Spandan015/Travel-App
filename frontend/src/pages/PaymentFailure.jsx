// src/pages/PaymentFailure.jsx
// eSewa redirects here on failure/cancellation

import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentFailure() {
  const [params] = useSearchParams();
  const type     = params.get('type') || 'hotel';

  const browseLink = { hotel: '/hotels', package: '/browse-packages', trek: '/browse-treks' }[type] || '/';

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.iconWrap}>
          <div style={S.iconCircle}>✕</div>
        </div>
        <div style={S.title}>Payment Failed</div>
        <div style={S.sub}>
          Your payment was not completed. You may have cancelled it or an error occurred.
          <br /><br />
          Your booking has been saved but is <strong>unpaid</strong>. You can try paying again from your bookings page.
        </div>

        <div style={S.infoBox}>
          <div style={S.infoRow}>
            <span>💡</span>
            <span>No money has been deducted from your eSewa account.</span>
          </div>
          <div style={S.infoRow}>
            <span>🔒</span>
            <span>Your booking details are saved. You can pay later.</span>
          </div>
        </div>

        <div style={S.btnRow}>
          <Link to="/my-bookings" style={S.primaryBtn}>Go to My Bookings</Link>
          <Link to={browseLink} style={S.outlineBtn}>Try Again</Link>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#fef2f2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
    fontFamily: "'Plus Jakarta Sans','Roboto',sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '40px 36px',
    maxWidth: 460, width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  iconWrap:   { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  iconCircle: {
    width: 72, height: 72, borderRadius: '50%',
    background: '#fef2f2', color: '#dc2626',
    fontSize: 28, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '3px solid #fecaca',
  },
  title: { fontSize: 22, fontWeight: 800, color: '#dc2626', marginBottom: 8, letterSpacing: '-0.02em' },
  sub:   { fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 20 },
  infoBox: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '14px 16px',
    marginBottom: 24, textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  infoRow: { display: 'flex', gap: 10, fontSize: 13, color: '#374151', alignItems: 'flex-start' },
  btnRow:  { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    background: '#dc2626', color: '#fff',
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
