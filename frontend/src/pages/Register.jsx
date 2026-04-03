import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SLIDES = [
  { place: 'Everest Base Camp', quote: 'The mountains are calling and I must go.', region: 'Khumbu Region, 5,364m', grad: 'linear-gradient(135deg, #0a2818 0%, #1a4a2a 100%)' },
  { place: 'Annapurna Circuit', quote: 'Not all those who wander are lost.', region: 'Gandaki Province, 5,416m', grad: 'linear-gradient(135deg, #0d1a3a 0%, #1a2a5a 100%)' },
  { place: 'Langtang Valley', quote: 'Every mountain top is within reach.', region: 'Bagmati Province, 3,430m', grad: 'linear-gradient(135deg, #1a0d0a 0%, #3a1a10 100%)' },
];

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function Register() {
  const { sendRegistrationOTP, verifyRegistrationOTP } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [otp, setOtp] = useState('');
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(''); };

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => { setSlide(s => (s + 1) % SLIDES.length); setFading(false); }, 600);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'Valid email is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setLoading(true); setError('');
    try {
      await sendRegistrationOTP({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
      setStep(2); setCountdown(60);
      setSuccess(`OTP sent to ${form.email}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit OTP');
    if (!/^\d{6}$/.test(otp)) return setError('OTP must contain only digits');
    setLoading(true); setError('');
    try {
      await verifyRegistrationOTP({ email: form.email, otp, firstName: form.firstName, lastName: form.lastName, phone: form.phone, password: form.password });
      navigate('/', { state: { message: 'Account created! Welcome to My Travel Buddy.' } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true); setError('');
    try {
      await sendRegistrationOTP({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
      setCountdown(60); setSuccess('New OTP sent!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend OTP');
    } finally { setLoading(false); }
  };

  const cur = SLIDES[slide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'DM Sans', sans-serif; }
        nav, footer { display: none !important; }

        .rp-root { min-height: 100vh; display: flex; background: #fff; }

        /* LEFT */
        .rp-left { display: none; width: 40%; position: relative; overflow: hidden; }
        @media (min-width: 900px) { .rp-left { display: block; } }
        .rp-left-bg { position: absolute; inset: 0; transition: opacity 0.6s ease; }
        .rp-left-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%); }
        .rp-left-content { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 2.5rem; }
        .rp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .rp-logo-mark { width: 38px; height: 38px; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .rp-logo-name { font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700; color: #fff; }
        .rp-logo-sub { font-size: 10px; color: rgba(255,255,255,0.55); display: block; }
        .rp-center { flex: 1; display: flex; align-items: center; }
        .rp-quote-area { transition: opacity 0.6s; }
        .rp-place { font-family: 'Fraunces', serif; font-size: clamp(1.6rem, 2.5vw, 2.2rem); font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 1rem; }
        .rp-quote { font-size: 0.95rem; color: rgba(255,255,255,0.7); font-style: italic; line-height: 1.7; margin-bottom: 1rem; font-weight: 300; }
        .rp-region { font-size: 11px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 5px; }
        .rp-bottom { display: flex; align-items: center; justify-content: space-between; }
        .rp-stats { display: flex; gap: 1.5rem; }
        .rp-stat-num { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 700; color: #fff; display: block; }
        .rp-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.5); }
        .rp-dots { display: flex; gap: 5px; }
        .rp-dot { width: 5px; height: 5px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); background: transparent; cursor: pointer; padding: 0; transition: all 0.2s; }
        .rp-dot.on { background: #fff; border-color: #fff; width: 14px; border-radius: 2px; }

        /* RIGHT */
        .rp-right { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 2.5rem 2rem; overflow-y: auto; }
        .rp-card { width: 100%; max-width: 480px; padding: 0.5rem 0; }

        /* Mobile logo */
        .rp-mobile-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 2rem; text-decoration: none; }
        @media (min-width: 900px) { .rp-mobile-logo { display: none; } }
        .rp-mobile-mark { width: 34px; height: 34px; background: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .rp-mobile-name { font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700; color: #0f172a; }

        /* Tabs */
        .rp-tabs { display: flex; background: #f1f5f9; border-radius: 10px; padding: 4px; margin-bottom: 2rem; }
        .rp-tab { flex: 1; padding: 10px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: #64748b; border-radius: 7px; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .rp-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 6px rgba(0,0,0,0.1); font-weight: 600; }

        /* Stepper */
        .rp-steps { display: flex; align-items: center; gap: 0; margin-bottom: 1.75rem; }
        .rp-step { display: flex; align-items: center; gap: 8px; }
        .rp-step-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .rp-step-num.done { background: #16a34a; color: #fff; }
        .rp-step-num.active { background: #0f172a; color: #fff; }
        .rp-step-num.future { background: #f1f5f9; color: #94a3b8; border: 1.5px solid #e2e8f0; }
        .rp-step-label { font-size: 12px; font-weight: 500; color: #64748b; }
        .rp-step-label.active { color: #0f172a; font-weight: 600; }
        .rp-step-line { flex: 1; height: 1px; background: #e2e8f0; margin: 0 8px; }

        .rp-heading { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .rp-sub { font-size: 13px; color: #64748b; margin-bottom: 1.5rem; }

        /* Google */
        .rp-google { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 14px; font-weight: 500; color: #374151; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; margin-bottom: 1.25rem; }
        .rp-google:hover { border-color: #94a3b8; }
        .rp-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
        .rp-div-line { flex: 1; height: 1px; background: #e2e8f0; }
        .rp-div-text { font-size: 12px; color: #94a3b8; white-space: nowrap; }

        /* Alerts */
        .rp-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #dc2626; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
        .rp-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #15803d; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }

        /* Fields */
        .rp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rp-field { margin-bottom: 1rem; }
        .rp-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
        .rp-optional { font-size: 11px; color: #94a3b8; font-weight: 400; }
        .rp-hint { font-size: 11px; color: #94a3b8; margin-top: 3px; }

        .rp-input-wrap { position: relative; }
        .rp-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; }
        .rp-input { width: 100%; padding: 11px 11px 11px 36px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: #fff; }
        .rp-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
        .rp-input::placeholder { color: #94a3b8; }
        .rp-input.no-icon { padding-left: 11px; }
        .rp-eye { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; padding: 0; }
        .rp-eye:hover { color: #64748b; }

        /* OTP input */
        .rp-otp { width: 100%; padding: 14px; text-align: center; letter-spacing: 0.4em; font-size: 1.5rem; font-weight: 700; border: 2px solid #e2e8f0; border-radius: 12px; font-family: 'Fraunces', serif; color: #0f172a; outline: none; transition: border-color 0.2s; }
        .rp-otp:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }

        /* Submit */
        .rp-submit { width: 100%; padding: 13px; background: #16a34a; color: #fff; border: none; cursor: pointer; border-radius: 10px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; margin-top: 0.25rem; margin-bottom: 1.5rem; }
        .rp-submit:hover:not(:disabled) { background: #15803d; }
        .rp-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .rp-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Resend */
        .rp-resend { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 1.5rem; font-size: 13px; color: #64748b; }
        .rp-resend-btn { border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 600; color: #16a34a; font-family: 'DM Sans', sans-serif; padding: 0; }
        .rp-resend-btn:disabled { color: #94a3b8; cursor: not-allowed; }

        /* Back */
        .rp-back { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font-size: 13px; color: #64748b; font-family: 'DM Sans', sans-serif; padding: 0; margin-bottom: 1.5rem; }
        .rp-back:hover { color: #0f172a; }

        .rp-footer-text { text-align: center; font-size: 13px; color: #64748b; }
        .rp-footer-text a { color: #16a34a; font-weight: 600; text-decoration: none; }
        .rp-footer-text a:hover { text-decoration: underline; }

        /* Terms */
        .rp-terms { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 1rem; }
        .rp-terms input { accent-color: #16a34a; margin-top: 2px; flex-shrink: 0; }
        .rp-terms label { font-size: 12px; color: #64748b; line-height: 1.5; }
        .rp-terms a { color: #16a34a; }

        @media (max-width: 480px) { .rp-row { grid-template-columns: 1fr; } }
      `}</style>

      <div className="rp-root">

        {/* LEFT */}
        <div className="rp-left">
          <div className="rp-left-bg" style={{ background: cur.grad, opacity: fading ? 0 : 1 }} />
          <div className="rp-left-overlay" />
          <div className="rp-left-content">
            <Link to="/" className="rp-logo">
              <div className="rp-logo-mark">🏔</div>
              <div>
                <span className="rp-logo-name">My Travel Buddy</span>
                <span className="rp-logo-sub">Explore Nepal</span>
              </div>
            </Link>
            <div className="rp-center">
              <div className="rp-quote-area" style={{ opacity: fading ? 0 : 1 }}>
                <div className="rp-place">{cur.place}</div>
                <div className="rp-quote">"{cur.quote}"</div>
                <div className="rp-region">
                  <svg width="11" height="11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 018 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 018-8z"/></svg>
                  {cur.region}
                </div>
              </div>
            </div>
            <div className="rp-bottom">
              <div className="rp-stats">
                <div><span className="rp-stat-num">500+</span><span className="rp-stat-lbl">Packages</span></div>
                <div><span className="rp-stat-num">200+</span><span className="rp-stat-lbl">Guides</span></div>
                <div><span className="rp-stat-num">15k+</span><span className="rp-stat-lbl">Travelers</span></div>
              </div>
              <div className="rp-dots">
                {SLIDES.map((_, i) => (
                  <button key={i} className={`rp-dot${slide === i ? ' on' : ''}`}
                    onClick={() => { setFading(true); setTimeout(() => { setSlide(i); setFading(false); }, 300); }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rp-right">
          <div className="rp-card">
            <Link to="/" className="rp-mobile-logo">
              <div className="rp-mobile-mark">🏔</div>
              <span className="rp-mobile-name">My Travel Buddy</span>
            </Link>

            <div className="rp-tabs">
              <button className="rp-tab" onClick={() => navigate('/login')}>Sign In</button>
              <button className="rp-tab active">Create Account</button>
            </div>

            {/* Steps */}
            <div className="rp-steps">
              {['Your details', 'Verify email'].map((label, i) => (
                <div key={i} className="rp-step" style={{ flex: i < 1 ? 1 : 'none' }}>
                  <div className={`rp-step-num ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : 'future'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`rp-step-label${step === i + 1 ? ' active' : ''}`}>{label}</span>
                  {i < 1 && <div className="rp-step-line" />}
                </div>
              ))}
            </div>

            <h1 className="rp-heading">{step === 1 ? 'Create your account' : 'Verify your email'}</h1>
            <p className="rp-sub">
              {step === 1
                ? 'Join 15,000+ trekkers planning their Nepal adventure.'
                : `Enter the 6-digit code sent to ${form.email}`}
            </p>

            {error && <div className="rp-error"><span>⚠</span>{error}</div>}
            {success && !error && <div className="rp-success"><span>✓</span>{success}</div>}

            {step === 1 ? (
              <>
                <button className="rp-google" type="button">
                  <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2a10 10 0 00-.16-1.76H9v3.33h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92a8.78 8.78 0 002.68-6.55z" fill="#4285F4"/><path d="M9 18a8.6 8.6 0 005.96-2.18l-2.92-2.26a5.43 5.43 0 01-8.07-2.85H.97v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.97 10.71a5.4 5.4 0 010-3.42V4.96H.97a9 9 0 000 8.08l3-2.33z" fill="#FBBC05"/><path d="M9 3.58a4.86 4.86 0 013.44 1.35l2.58-2.58A8.64 8.64 0 009 0 9 9 0 00.97 4.96l3 2.33A5.37 5.37 0 019 3.58z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
                <div className="rp-divider">
                  <div className="rp-div-line" />
                  <span className="rp-div-text">or register with email</span>
                  <div className="rp-div-line" />
                </div>

                <form onSubmit={handleSendOTP} noValidate>
                  <div className="rp-row">
                    <div className="rp-field">
                      <label className="rp-label">First name</label>
                      <div className="rp-input-wrap">
                        <span className="rp-icon"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                        <input className="rp-input" type="text" placeholder="Ram" value={form.firstName} onChange={set('firstName')} autoFocus />
                      </div>
                    </div>
                    <div className="rp-field">
                      <label className="rp-label">Last name</label>
                      <div className="rp-input-wrap">
                        <span className="rp-icon"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                        <input className="rp-input" type="text" placeholder="Sharma" value={form.lastName} onChange={set('lastName')} />
                      </div>
                    </div>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Email address</label>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg></span>
                      <input className="rp-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
                    </div>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Phone number <span className="rp-optional">(optional)</span></label>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.96 1.21 2 2 0 012.95 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.92 14v3z"/></svg></span>
                      <input className="rp-input" type="tel" placeholder="+977 98XXXXXXXX" value={form.phone} onChange={set('phone')} />
                    </div>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Password</label>
                    <div className="rp-hint" style={{ marginBottom: 5 }}>Minimum 8 characters</div>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
                      <input className="rp-input" type={showPw ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
                      <button type="button" className="rp-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}><EyeIcon open={showPw} /></button>
                    </div>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Confirm password</label>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
                      <input className="rp-input" type={showCPw ? 'text' : 'password'} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
                      <button type="button" className="rp-eye" onClick={() => setShowCPw(p => !p)} tabIndex={-1}><EyeIcon open={showCPw} /></button>
                    </div>
                  </div>

                  <div className="rp-terms">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">I agree to My Travel Buddy's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
                  </div>

                  <button type="submit" disabled={loading} className="rp-submit">
                    {loading ? <><div className="rp-spin" /> Sending OTP...</> : <>Create Account ✓</>}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleVerifyOTP} noValidate>
                <button type="button" className="rp-back" onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }}>
                  ← Back to details
                </button>

                <div className="rp-field">
                  <label className="rp-label">6-digit verification code</label>
                  <input
                    className="rp-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="······"
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} className="rp-submit">
                  {loading ? <><div className="rp-spin" /> Verifying...</> : <>Verify & Create Account ✓</>}
                </button>

                <div className="rp-resend">
                  <span>Didn't receive it?</span>
                  <button type="button" className="rp-resend-btn" onClick={handleResend} disabled={countdown > 0 || loading}>
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            <p className="rp-footer-text">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
