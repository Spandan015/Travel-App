import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, CreditCard,
  CheckCircle2, XCircle, AlertCircle, Star, Package,
  Hotel, Mountain, User, Phone, Mail, Hash,
  Banknote, Receipt, ChevronRight, MessageSquare, Send, RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE}${url}`;
};

const STATUS_CFG = {
  confirmed: { bg: '#dcfce7', color: '#15803d', Icon: CheckCircle2, label: 'Confirmed' },
  pending:   { bg: '#fef9c3', color: '#854d0e', Icon: AlertCircle,  label: 'Pending'   },
  cancelled: { bg: '#fee2e2', color: '#991b1b', Icon: XCircle,      label: 'Cancelled' },
  completed: { bg: '#ede9fe', color: '#5b21b6', Icon: Star,         label: 'Completed' },
};

const fmtPrice = (n) => `NPR ${Number(n || 0).toLocaleString('en-NP')}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function InfoRow({ icon: Icon, label, value, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color="#16a34a" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: highlight ? 700 : 500, color: highlight ? '#0f172a' : '#374151' }}>{value}</div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8f5ee', padding: 24, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#0a2818', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #f0fdf4' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function BookingDetail() {
  const { type, id } = useParams(); // /bookings/:type/:id
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [review,     setReview]     = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewToast, setReviewToast] = useState({ msg: '', type: '' });

  useEffect(() => {
    fetchBooking();
  }, [type, id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError('');
      let endpoint = '';
      if (type === 'hotel')   endpoint = `/hotel-bookings/${id}`;
      if (type === 'package') endpoint = `/bookings/${id}`;
      if (type === 'trek')    endpoint = `/trek-bookings/${id}`;
      if (!endpoint) throw new Error('Invalid booking type');
      const res = await api.get(endpoint);
      const bk = res.data.booking || res.data;
      setBooking(bk);
      // Check if already reviewed
      try {
        const rv = await api.get(`/reviews/check/${bk._id}`);
        if (rv.data.hasReviewed) {
          setReviewDone(true);
          if (rv.data.review) setReview({ rating: rv.data.review.rating, comment: rv.data.review.comment });
        }
      } catch (_) {}
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const notifyReview = (msg, type = 'success') => {
    setReviewToast({ msg, type });
    setTimeout(() => setReviewToast({ msg: '', type: '' }), 4000);
  };

  const handleSubmitReview = async () => {
    if (!review.rating) return notifyReview('Please select a star rating.', 'error');
    if (!review.comment.trim()) return notifyReview('Please write a comment.', 'error');
    setSubmittingReview(true);
    try {
      // Save to Review model
      await api.post('/reviews', {
        reviewType: type === 'hotel' ? 'hotel' : type === 'trek' ? 'package' : 'package',
        guideId:    booking.assignedGuide?._id,
        bookingId:  booking._id,
        bookingType: type,
        rating:     review.rating,
        comment:    review.comment,
        ...(type === 'hotel'   && { hotel:   item?._id }),
        ...(type === 'package' && { package: item?._id }),
        ...(type === 'trek'    && { package: item?._id }),
      });
      setReviewDone(true);
      notifyReview('✅ Review submitted! Thank you.');
    } catch (err) {
      notifyReview(err.response?.data?.message || 'Error submitting review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      let endpoint = '';
      if (type === 'hotel')   endpoint = `/hotel-bookings/${id}/cancel`;
      if (type === 'package') endpoint = `/bookings/${id}/cancel`;
      if (type === 'trek')    endpoint = `/trek-bookings/${id}/cancel`;
      await api.put(endpoint);
      await fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loading />;

  if (error) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto, sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Booking not found</div>
      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{error}</div>
      <button onClick={() => navigate('/my-bookings')} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
        Back to My Bookings
      </button>
    </div>
  );

  if (!booking) return null;

  const status = (booking.status || 'pending').toLowerCase();
  const sc = STATUS_CFG[status] || STATUS_CFG.pending;
  const StatusIcon = sc.Icon;

  // Extract item details based on type
  const item     = type === 'hotel' ? booking.hotel : type === 'trek' ? booking.trek : booking.package;
  const itemName = item?.name || (type === 'hotel' ? 'Hotel Booking' : type === 'trek' ? 'Trek Booking' : 'Package Booking');
  const itemImg  = getImageUrl(item?.mainImage || item?.coverImage || item?.images?.[0]);

  const typeIcon = type === 'hotel' ? Hotel : type === 'trek' ? Mountain : Package;
  const TypeIcon = typeIcon;

  // Allow cancellation for any booking that isn't already cancelled or completed
  const canCancel = !['cancelled', 'completed'].includes(status);

  const nights = type === 'hotel' && booking.checkInDate && booking.checkOutDate
    ? Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 3600 * 24))
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f4', fontFamily: "'Roboto', sans-serif", paddingTop: 80, paddingBottom: 60 }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 16px' }}>

        {/* Back button + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: '#6b7280' }}>
          <button onClick={() => navigate('/my-bookings')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5f0e8', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            <ArrowLeft size={14} /> My Bookings
          </button>
          <ChevronRight size={14} />
          <span style={{ fontWeight: 600, color: '#0a2818' }}>Booking Details</span>
        </div>

        {/* Header card */}
        <div style={{ background: '#0a2818', borderRadius: 20, overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
          {itemImg && (
            <div style={{ position: 'absolute', inset: 0 }}>
              <img src={itemImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
            </div>
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TypeIcon size={18} color="#4ade80" />
              </div>
              <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {type === 'hotel' ? 'Hotel Booking' : type === 'trek' ? 'Trek Booking' : 'Package Booking'}
              </span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.3 }}>{itemName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: sc.bg, color: sc.color, borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>
                <StatusIcon size={13} /> {sc.label}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>
                <Receipt size={13} /> {booking.paymentStatus === 'paid' ? '✓ Paid' : booking.paymentStatus === 'pending' ? '⏳ Payment Pending' : 'Unpaid'}
              </span>
              {booking.paymentMethod && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>
                  {booking.paymentMethod?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

          {/* LEFT */}
          <div>
            {/* Booking dates / details */}
            <Section title={type === 'hotel' ? '🏨 Stay Details' : type === 'trek' ? '🏔 Trek Details' : '📦 Package Details'}>
              {type === 'hotel' && (
                <>
                  <InfoRow icon={Calendar} label="Check-in"       value={fmtDate(booking.checkInDate)}  highlight />
                  <InfoRow icon={Calendar} label="Check-out"      value={fmtDate(booking.checkOutDate)} highlight />
                  <InfoRow icon={Clock}    label="Duration"        value={nights ? `${nights} night${nights > 1 ? 's' : ''}` : '—'} />
                  <InfoRow icon={Users}    label="Guests"          value={booking.numberOfGuests} />
                  <InfoRow icon={Hotel}    label="Rooms"           value={`${booking.numberOfRooms || 1}${booking.roomType ? ` × ${booking.roomType}` : ''}`} />
                  <InfoRow icon={MapPin}   label="Location"        value={item?.location} />
                  <InfoRow icon={Star}     label="Star Rating"     value={item?.starRating ? `${'★'.repeat(item.starRating)} (${item.starRating} stars)` : null} />
                </>
              )}
              {(type === 'package' || type === 'trek') && (
                <>
                  <InfoRow icon={Calendar} label="Start Date"     value={fmtDate(booking.startDate)}    highlight />
                  {booking.endDate && <InfoRow icon={Calendar} label="End Date" value={fmtDate(booking.endDate)} />}
                  <InfoRow icon={Clock}    label="Duration"        value={item?.duration ? `${item.duration} days` : '—'} />
                  <InfoRow icon={Users}    label="Guests"          value={booking.numberOfGuests} />
                </>
              )}
              {booking.specialRequests && (
                <div style={{ marginTop: 12, background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Special Requests</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{booking.specialRequests}</div>
                </div>
              )}
            </Section>

            {/* Guide info if assigned */}
            {booking.assignedGuide && (
              <Section title="🧭 Assigned Guide">
                <InfoRow icon={User}  label="Guide Name"  value={`${booking.assignedGuide.firstName || ''} ${booking.assignedGuide.lastName || booking.assignedGuide.username || ''}`.trim()} highlight />
                <InfoRow icon={Mail}  label="Email"       value={booking.assignedGuide.email} />
                <InfoRow icon={Phone} label="Phone"       value={booking.assignedGuide.phone} />
                {booking.guidePayment?.guideFee > 0 && (
                  <InfoRow icon={Banknote} label="Guide Fee" value={fmtPrice(booking.guidePayment.guideFee)} />
                )}
              </Section>
            )}

            {/* Contact info */}
            {booking.contactInfo && (
              <Section title="👤 Contact Info">
                <InfoRow icon={User}  label="Name"  value={booking.contactInfo.name} />
                <InfoRow icon={Mail}  label="Email" value={booking.contactInfo.email} />
                <InfoRow icon={Phone} label="Phone" value={booking.contactInfo.phone} />
              </Section>
            )}
          </div>

          {/* RIGHT */}
          <div>
            {/* Payment summary */}
            <Section title="💳 Payment Summary">
              {type === 'hotel' && (
                <>
                  <InfoRow icon={Banknote} label="Price/Night" value={fmtPrice(booking.pricePerNight)} />
                  {nights && <InfoRow icon={Clock} label="Nights" value={nights} />}
                  {booking.numberOfRooms > 1 && <InfoRow icon={Hotel} label="Rooms" value={booking.numberOfRooms} />}
                </>
              )}
              {(type === 'package' || type === 'trek') && (
                <InfoRow icon={Users} label="Guests" value={booking.numberOfGuests} />
              )}
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 16px', marginTop: 12 }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total Amount</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0a2818' }}>{fmtPrice(booking.totalPrice)}</div>
              </div>
              {booking.esewaRefId && (
                <div style={{ marginTop: 12 }}>
                  <InfoRow icon={Hash}    label="eSewa Ref ID"    value={booking.esewaRefId} />
                  <InfoRow icon={Receipt} label="Payment Method"  value={booking.paymentMethod?.toUpperCase()} />
                  <InfoRow icon={Clock}   label="Paid At"         value={fmtDateTime(booking.paidAt)} />
                </div>
              )}
            </Section>

            {/* Booking meta */}
            <Section title="📋 Booking Info">
              <InfoRow icon={Hash}  label="Booking ID" value={booking._id?.slice(-8).toUpperCase()} />
              <InfoRow icon={Clock} label="Booked On"  value={fmtDateTime(booking.createdAt)} />
              {booking.cancellationReason && (
                <div style={{ marginTop: 12, background: '#fef2f2', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#991b1b' }}>
                  <strong>Cancellation reason:</strong> {booking.cancellationReason}
                </div>
              )}
            </Section>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* View item button */}
              {item?._id && (
                <Link
                  to={type === 'hotel' ? `/hotels/${item._id}` : type === 'trek' ? `/treks/${item._id}` : `/packages/${item._id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0a2818', color: '#fff', borderRadius: 12, padding: '12px', fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'background 0.15s' }}
                >
                  <TypeIcon size={15} />
                  View {type === 'hotel' ? 'Hotel' : type === 'trek' ? 'Trek' : 'Package'}
                </Link>
              )}

              {/* Cancel button */}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 12, padding: '12px', fontWeight: 600, fontSize: 14, cursor: cancelling ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                >
                  <XCircle size={15} />
                  {cancelling ? 'Cancelling…' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEW SECTION ── full width below the grid, only for bookings with guide */}
      {booking.assignedGuide && status === 'completed' && (
        <div style={{ maxWidth: 780, margin: '16px auto 0', padding: '0 16px' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8f5ee', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16, color: '#0a2818', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #f0fdf4' }}>
              <MessageSquare size={18} color="#16a34a" /> Rate Your Guide
            </div>

            {reviewToast.msg && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16,
                background: reviewToast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${reviewToast.type === 'error' ? '#fca5a5' : '#86efac'}`,
                color: reviewToast.type === 'error' ? '#b91c1c' : '#166534',
              }}>
                {reviewToast.msg}
              </div>
            )}

            {reviewDone ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0a2818', marginBottom: 4 }}>Review submitted!</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Thank you for your feedback.</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12 }}>
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={22} fill={n <= review.rating ? '#f59e0b' : 'none'} color={n <= review.rating ? '#f59e0b' : '#d1d5db'} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: '#374151', marginTop: 8, fontStyle: 'italic' }}>"{review.comment}"</div>
              </div>
            ) : (
              <div>
                {/* Guide info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: '#f8faf8', borderRadius: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {(booking.assignedGuide.firstName?.[0] || booking.assignedGuide.username?.[0] || 'G').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2818' }}>
                      {`${booking.assignedGuide.firstName || ''} ${booking.assignedGuide.lastName || booking.assignedGuide.username || ''}`.trim()}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Your guide for this trip</div>
                  </div>
                </div>

                {/* Star rating picker */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Your Rating *</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReview(p => ({ ...p, rating: n }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Star size={32} fill={n <= review.rating ? '#f59e0b' : 'none'} color={n <= review.rating ? '#f59e0b' : '#d1d5db'} />
                      </button>
                    ))}
                    {review.rating > 0 && (
                      <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center', marginLeft: 8 }}>
                        {['','Terrible','Poor','Average','Good','Excellent'][review.rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Your Review *
                  </label>
                  <textarea
                    rows={4}
                    value={review.comment}
                    onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
                    placeholder="Share your experience with this guide — what did you enjoy? Would you recommend them?"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '11px 14px', border: '1.5px solid #d1fae5',
                      borderRadius: 10, fontSize: 14, color: '#0f172a',
                      fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                      lineHeight: 1.6,
                    }}
                    onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.08)'; }}
                    onBlur={e =>  { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; }}
                  />
                  <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 4 }}>
                    {review.comment.length} characters
                  </div>
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 28px',
                    background: submittingReview ? '#86efac' : 'linear-gradient(135deg,#16a34a,#15803d)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontWeight: 700, fontSize: 15, cursor: submittingReview ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: submittingReview ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
                  }}
                >
                  {submittingReview ? <RefreshCw size={16} /> : <Send size={16} />}
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
