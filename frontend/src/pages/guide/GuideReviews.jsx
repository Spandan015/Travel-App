import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import guideDashboardService from '../../services/guideDashboardService';

function StarRating({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= rating ? '#f59e0b' : 'none'}
          color={n <= rating ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  );
}

export default function GuideReviews() {
  const [data, setData]       = useState({ reviews: [], avgRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guideDashboardService.getReviews()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { reviews, avgRating, total } = data;

  // Distribution count
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a2818', margin: 0 }}>Reviews & Ratings</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>See what tourists are saying about your tours.</p>
      </div>

      {/* Rating overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f0fdf4', paddingRight: 20 }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: '#0a2818', lineHeight: 1 }}>{avgRating || '0.0'}</div>
          <StarRating rating={Math.round(avgRating)} size={20} />
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>{total} review{total !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          {dist.map(({ star, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', width: 20 }}>{star}</span>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <div style={{ flex: 1, height: 8, background: '#f0fdf4', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#16a34a', borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af', width: 24, textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2818', marginBottom: 16 }}>All Reviews</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
            <MessageSquare size={36} color="#d1fae5" style={{ margin: '0 auto 10px', display: 'block' }} />
            <div style={{ fontWeight: 700, color: '#0a2818', marginBottom: 4 }}>No reviews yet</div>
            <div style={{ fontSize: 13 }}>Reviews from completed tours will appear here.</div>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} style={{ padding: '18px 0', borderBottom: '1px solid #f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: '#16a34a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0, overflow: 'hidden',
                }}>
                  {r.tourist?.profileImage
                    ? <img src={r.tourist.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (r.tourist?.firstName?.[0] || 'T').toUpperCase()
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0a2818', fontSize: 14 }}>
                        {r.tourist?.firstName || r.tourist?.username || 'Tourist'}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                        {r.tourType && ` · ${r.tourType}`}
                      </div>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
