import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECTS = { user: '/dashboard', guide: '/guide/dashboard', admin: '/admin/dashboard' };

const SLIDES = [
  { place: 'Everest Base Camp', quote: 'The mountains are calling and I must go.', region: 'Khumbu Region, 5,364m', grad: 'linear-gradient(135deg, #0a2818 0%, #1a4a2a 100%)' },
  { place: 'Annapurna Circuit', quote: 'Not all those who wander are lost.', region: 'Gandaki Province, 5,416m', grad: 'linear-gradient(135deg, #0d1a3a 0%, #1a2a5a 100%)' },
  { place: 'Langtang Valley', quote: 'Every mountain top is within reach if you just keep climbing.', region: 'Bagmati Province, 3,430m', grad: 'linear-gradient(135deg, #1a0d0a 0%, #3a1a10 100%)' },
  { place: 'Upper Mustang', quote: 'Adventure is worthwhile in itself.', region: 'Gandaki Province, 3,840m', grad: 'linear-gradient(135deg, #0a1a2a 0%, #1a3a4a 100%)' },
];

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) navigate(ROLE_REDIRECTS[user.role] || '/');
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (location.state?.message) setError(location.state.message);
  }, [location.state]);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => { setSlide(s => (s + 1) % SLIDES.length); setFading(false); }, 600);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email');
    if (!password) return setError('Please enter your password');
    setLoading(true); setError('');
    try {
      const data = await login({ email, password });
      navigate(ROLE_REDIRECTS[data.user?.role] || '/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const cur = SLIDES[slide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'Roboto', sans-serif; }
        nav, footer { display: none !important; }

        .lp-root {
          min-height: 100vh;
          display: flex;
          background: #fff;
        }

        /* LEFT PANEL */
        .lp-left {
          display: none;
          width: 55%;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .lp-left { display: block; } }

        .lp-left-bg {
          position: absolute; inset: 0;
          transition: opacity 0.6s ease;
        }
        .lp-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.75) 100%);
        }
        .lp-left-content {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          padding: 2.5rem;
        }

        /* Logo */
        .lp-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .lp-logo-mark {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .lp-logo-name { font-family: 'Roboto', serif; font-size: 1.05rem; font-weight: 700; color: #fff; }
        .lp-logo-sub { font-size: 11px; color: rgba(255,255,255,0.6); display: block; }

        .lp-center { flex: 1; display: flex; align-items: center; }
        .lp-quote-area { max-width: 420px; transition: opacity 0.6s; }

        .lp-place {
          font-family: 'Roboto', serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 700; color: #fff;
          line-height: 1.2; margin-bottom: 1rem;
        }
        .lp-quote {
          font-size: 1rem; color: rgba(255,255,255,0.75);
          font-style: italic; line-height: 1.7;
          margin-bottom: 1.25rem;
          font-weight: 300;
        }
        .lp-region {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: rgba(255,255,255,0.55);
        }

        .lp-bottom { display: flex; align-items: center; justify-content: space-between; }
        .lp-stats { display: flex; gap: 2rem; }
        .lp-stat-num { font-family: 'Roboto', serif; font-size: 1.5rem; font-weight: 700; color: #fff; display: block; }
        .lp-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.5); }
        .lp-dots { display: flex; gap: 6px; }
        .lp-dot { width: 6px; height: 6px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); background: transparent; cursor: pointer; padding: 0; transition: all 0.2s; }
        .lp-dot.on { background: #fff; border-color: #fff; width: 18px; border-radius: 3px; }

        /* RIGHT PANEL */
        .lp-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem;
        }

        .lp-card { width: 100%; max-width: 420px; }

        /* Tabs */
        .lp-tabs {
          display: flex; gap: 0;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 2rem;
        }
        .lp-tab {
          flex: 1; padding: 10px;
          border: none; background: transparent; cursor: pointer;
          font-size: 14px; font-weight: 500; color: #64748b;
          border-radius: 7px; transition: all 0.2s;
          font-family: 'Roboto', sans-serif;
        }
        .lp-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 6px rgba(0,0,0,0.1); font-weight: 600; }

        .lp-heading { font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .lp-sub { font-size: 14px; color: #64748b; margin-bottom: 1.75rem; }

        /* Google button */
        .lp-google {
          width: 100%; padding: 12px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 14px; font-weight: 500; color: #374151;
          font-family: 'Roboto', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 1.25rem;
        }
        .lp-google:hover { border-color: #94a3b8; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

        .lp-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
        .lp-div-line { flex: 1; height: 1px; background: #e2e8f0; }
        .lp-div-text { font-size: 12px; color: #94a3b8; white-space: nowrap; }

        /* Error */
        .lp-error {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #dc2626;
          margin-bottom: 1rem;
          display: flex; align-items: center; gap: 8px;
        }

        /* Fields */
        .lp-field { margin-bottom: 1rem; }
        .lp-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .lp-label { font-size: 13px; font-weight: 600; color: #374151; }
        .lp-forgot { font-size: 12px; color: #16a34a; text-decoration: none; }
        .lp-forgot:hover { text-decoration: underline; }

        .lp-input-wrap { position: relative; }
        .lp-input-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; display: flex;
        }
        .lp-input {
          width: 100%; padding: 11px 12px 11px 38px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Roboto', sans-serif; color: #0f172a;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
        }
        .lp-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
        .lp-input::placeholder { color: #94a3b8; }
        .lp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; padding: 0;
        }
        .lp-eye:hover { color: #64748b; }

        .lp-remember { display: flex; align-items: center; gap: 8px; margin-bottom: 1.25rem; }
        .lp-remember input { accent-color: #16a34a; width: 15px; height: 15px; }
        .lp-remember label { font-size: 13px; color: #64748b; cursor: pointer; }

        /* Submit */
        .lp-submit {
          width: 100%; padding: 13px;
          background: #16a34a; color: #fff; border: none; cursor: pointer;
          border-radius: 10px; font-size: 15px; font-weight: 600;
          font-family: 'Roboto', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s;
          margin-bottom: 1.5rem;
        }
        .lp-submit:hover:not(:disabled) { background: #15803d; }
        .lp-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .lp-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lp-footer-text { text-align: center; font-size: 13px; color: #64748b; }
        .lp-footer-text a { color: #16a34a; font-weight: 600; text-decoration: none; }
        .lp-footer-text a:hover { text-decoration: underline; }

        /* Mobile logo */
        .lp-mobile-logo {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 2rem; text-decoration: none;
        }
        @media (min-width: 900px) { .lp-mobile-logo { display: none; } }
        .lp-mobile-mark { width: 36px; height: 36px; background: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .lp-mobile-name { font-family: 'Roboto', serif; font-size: 1rem; font-weight: 700; color: #0f172a; }
      `}</style>

      <div className="lp-root">

        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-left-bg" style={{ background: cur.grad, opacity: fading ? 0 : 1 }} />
          <div className="lp-left-overlay" />
          <div className="lp-left-content">
            <Link to="/" className="lp-logo">
              <div className="lp-logo-mark">🏔</div>
              <div>
                <span className="lp-logo-name">My Travel Buddy</span>
                <span className="lp-logo-sub">Explore Nepal</span>
              </div>
            </Link>

            <div className="lp-center">
              <div className="lp-quote-area" style={{ opacity: fading ? 0 : 1 }}>
                <div className="lp-place">{cur.place}</div>
                <div className="lp-quote">"{cur.quote}"</div>
                <div className="lp-region">
                  <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 018 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 018-8z"/></svg>
                  {cur.region}
                </div>
              </div>
            </div>

            <div className="lp-bottom">
              <div className="lp-stats">
                <div><span className="lp-stat-num">500+</span><span className="lp-stat-lbl">Packages</span></div>
                <div><span className="lp-stat-num">200+</span><span className="lp-stat-lbl">Guides</span></div>
                <div><span className="lp-stat-num">15k+</span><span className="lp-stat-lbl">Travelers</span></div>
              </div>
              <div className="lp-dots">
                {SLIDES.map((_, i) => (
                  <button key={i} className={`lp-dot${slide === i ? ' on' : ''}`}
                    onClick={() => { setFading(true); setTimeout(() => { setSlide(i); setFading(false); }, 300); }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-card">
            <Link to="/" className="lp-mobile-logo">
              <div className="lp-mobile-mark">🏔</div>
              <span className="lp-mobile-name">My Travel Buddy</span>
            </Link>

            <div className="lp-tabs">
              <button className="lp-tab active">Sign In</button>
              <button className="lp-tab" onClick={() => navigate('/register')}>Create Account</button>
            </div>

            <h1 className="lp-heading">Welcome back</h1>
            <p className="lp-sub">Sign in to access your travel plans and bookings.</p>

            <button className="lp-google" type="button">
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2a10 10 0 00-.16-1.76H9v3.33h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92a8.78 8.78 0 002.68-6.55z" fill="#4285F4"/><path d="M9 18a8.6 8.6 0 005.96-2.18l-2.92-2.26a5.43 5.43 0 01-8.07-2.85H.97v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.97 10.71a5.4 5.4 0 010-3.42V4.96H.97a9 9 0 000 8.08l3-2.33z" fill="#FBBC05"/><path d="M9 3.58a4.86 4.86 0 013.44 1.35l2.58-2.58A8.64 8.64 0 009 0 9 9 0 00.97 4.96l3 2.33A5.37 5.37 0 019 3.58z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="lp-divider">
              <div className="lp-div-line" />
              <span className="lp-div-text">or sign in with email</span>
              <div className="lp-div-line" />
            </div>

            {error && (
              <div className="lp-error">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label">Email address</label>
                </div>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
                  </span>
                  <input type="email" autoFocus autoComplete="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} className="lp-input" />
                </div>
              </div>

              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label">Password</label>
                  <Link to="/forgot-password" className="lp-forgot">Forgot password?</Link>
                </div>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </span>
                  <input type={showPw ? 'text' : 'password'} autoComplete="current-password"
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)} className="lp-input" />
                  <button type="button" className="lp-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    {showPw
                      ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="lp-remember">
                <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <label htmlFor="remember">Remember me for 30 days</label>
              </div>

              <button type="submit" disabled={loading} className="lp-submit">
                {loading ? <><div className="lp-spin" /> Signing in...</> : <>Sign In →</>}
              </button>
            </form>

            <p className="lp-footer-text">
              New to My Travel Buddy?{' '}
              <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
