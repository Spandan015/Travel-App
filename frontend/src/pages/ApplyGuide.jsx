import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SPECIALIZATIONS = ['Trekking','Cultural Tours','Photography','Wildlife','Mountaineering','Rafting','Cycling','Yoga & Wellness','Food Tours','Historical Sites'];
const LANGUAGES = ['Nepali','English','Hindi','Chinese','Japanese','French','German','Spanish','Italian','Korean'];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .ag-page{min-height:100vh;display:flex;font-family:'DM Sans',sans-serif;background:#f8faf8;}
  .ag-left{
    display:none;position:relative;flex:0 0 44%;overflow:hidden;flex-direction:column;
  }
  @media(min-width:900px){.ag-left{display:flex;}}
  .ag-left-bg{position:absolute;inset:0;background:linear-gradient(160deg,#0a2818 0%,#0d3320 50%,#1a4a2a 100%);}
  .ag-left-bg::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
  .ag-left-mountains{position:absolute;bottom:0;left:0;right:0;height:35%;clip-path:polygon(0% 100%,8% 65%,15% 72%,22% 50%,30% 65%,38% 35%,45% 52%,52% 22%,60% 48%,67% 38%,74% 58%,82% 28%,90% 50%,100% 38%,100% 100%);background:rgba(255,255,255,0.04);}
  .ag-left-content{position:relative;z-index:10;padding:56px 48px;flex:1;color:#fff;display:flex;flex-direction:column;justify-content:center;}
  .ag-brand{display:flex;align-items:center;gap:10px;margin-bottom:24px;font-size:18px;}
  .ag-brand-logo{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#16a34a,#4ade80);display:flex;align-items:center;justify-content:center;font-size:18px;}
  .ag-brand-name{font-weight:700;}
  .ag-guide-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);border-radius:20px;padding:6px 14px;font-size:13px;font-weight:600;width:fit-content;margin-bottom:20px;border:1px solid rgba(255,255,255,0.15);}
  .ag-headline{font-family:'Fraunces',serif;font-size:2.2rem;font-weight:800;line-height:1.2;margin-bottom:14px;letter-spacing:-0.6px;}
  .ag-headline em{font-style:italic;color:#4ade80;}
  .ag-sub{font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin-bottom:32px;max-width:340px;}
  .ag-perks{display:flex;flex-direction:column;gap:12px;}
  .ag-perk{display:flex;align-items:center;gap:10px;font-size:14px;color:rgba(255,255,255,0.85);}
  .ag-perk-check{width:22px;height:22px;border-radius:50%;background:rgba(74,222,128,0.2);border:1px solid rgba(74,222,128,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:#4ade80;}
  .ag-left-footer{position:relative;z-index:10;padding:20px 48px;font-size:14px;}
  .ag-left-link{color:rgba(255,255,255,0.7);font-weight:600;text-decoration:none;}
  .ag-left-link:hover{color:#fff;}

  .ag-right{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 24px;}
  .ag-card{width:100%;max-width:500px;background:#fff;border-radius:20px;border:1px solid #e5f0e8;box-shadow:0 4px 32px rgba(22,163,74,0.08);padding:32px 36px;}
  @media(max-width:600px){.ag-card{padding:24px 20px;}}

  .ag-steps{display:flex;align-items:center;margin-bottom:24px;}
  .ag-step-item{display:flex;align-items:center;gap:6px;flex:1;}
  .ag-step-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
  .ag-step-active{background:#16a34a;color:#fff;}
  .ag-step-done{background:#16a34a;color:#fff;}
  .ag-step-pending{background:#f1f5f9;color:#94a3b8;border:1.5px solid #e2e8f0;}
  .ag-step-line{flex:1;height:2px;border-radius:1px;margin:0 6px;}

  .ag-title{font-family:'Fraunces',serif;font-size:1.4rem;font-weight:800;color:#0a2818;margin:0 0 4px;}
  .ag-title-sub{font-size:13px;color:#6b7280;margin:0 0 20px;}

  .ag-error{display:flex;align-items:center;gap:8px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:16px;}
  .ag-success{display:flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:16px;}

  .ag-form{display:flex;flex-direction:column;gap:16px;}
  .ag-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  @media(max-width:480px){.ag-row{grid-template-columns:1fr;}}
  .ag-field{display:flex;flex-direction:column;gap:4px;}
  .ag-label{font-size:13px;font-weight:600;color:#374151;}
  .ag-hint{font-weight:400;color:#9ca3af;font-size:12px;}
  .ag-input-wrap{position:relative;}
  .ag-input{width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:14px;color:#0f172a;background:#fff;outline:none;font-family:inherit;transition:border 0.15s;}
  .ag-input:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.08);}
  .ag-eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:2px;display:flex;}

  .ag-tag-grid{display:flex;flex-wrap:wrap;gap:8px;}
  .ag-tag{padding:7px 14px;border-radius:20px;border:1.5px solid #d1fae5;background:#fff;font-size:13px;font-weight:500;cursor:pointer;color:#374151;font-family:inherit;transition:all 0.15s;}
  .ag-tag:hover{border-color:#16a34a;color:#15803d;}
  .ag-tag.active{background:#f0fdf4;border-color:#16a34a;color:#15803d;font-weight:600;}

  .ag-btn{width:100%;padding:14px;background:#16a34a;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;letter-spacing:-0.2px;}
  .ag-btn:hover:not(:disabled){background:#15803d;transform:translateY(-1px);}
  .ag-btn:disabled{opacity:0.65;cursor:not-allowed;transform:none;}
  .ag-btn-back{flex:0 0 auto;padding:14px 20px;background:#f1f5f9;color:#374151;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}
  .ag-btn-back:hover{background:#e2e8f0;}

  .ag-footer{text-align:center;margin-top:16px;font-size:14px;color:#6b7280;}
  .ag-footer-link{color:#16a34a;font-weight:600;text-decoration:none;}

  .ag-success-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8faf8;font-family:'DM Sans',sans-serif;padding:24px;}
  .ag-success-card{text-align:center;max-width:460px;background:#fff;border-radius:20px;padding:48px 36px;border:1px solid #e5f0e8;box-shadow:0 4px 32px rgba(22,163,74,0.08);}
  .ag-success-icon{font-size:56px;margin-bottom:16px;}
  .ag-success-title{font-family:'Fraunces',serif;font-size:1.6rem;color:#0a2818;margin-bottom:12px;}
  .ag-success-text{font-size:15px;color:#6b7280;line-height:1.7;margin-bottom:28px;}
  .ag-next-steps{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:28px;text-align:left;}
  .ag-next-label{font-weight:700;color:#166534;margin-bottom:8px;font-size:14px;}
  .ag-next-item{display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;font-size:13px;color:#166534;}
`;

export default function ApplyGuide() {
  const { sendGuideRegistrationOTP, verifyGuideRegistrationOTP } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp]         = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    password:'', confirmPassword:'',
    yearsExperience:'', bio:'',
    specializations:[], languages:[],
    guideLicense:'',
  });

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setError(''); };

  const toggleArr = (field, val) => {
    setForm(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val] }));
    setError('');
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const validateStep1 = () => {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) return 'Valid email is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const validateStep2 = () => {
    if (!form.yearsExperience || isNaN(form.yearsExperience)) return 'Years of experience is required';
    if (form.specializations.length < 1) return 'Select at least 1 specialization';
    if (form.languages.length < 2) return 'Select at least 2 languages you speak';
    if (!form.bio.trim() || form.bio.length < 100) return 'Bio must be at least 100 characters';
    if (form.bio.length > 500) return 'Bio must be 500 characters or less';
    return null;
  };

  const handleStep1 = (e) => { e.preventDefault(); const err = validateStep1(); if (err) return setError(err); setError(''); setStep(2); };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) return setError(err);
    setLoading(true); setError('');
    try {
      await sendGuideRegistrationOTP({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim() });
      setStep(3); setCountdown(60); setSuccess(`Verification code sent to ${form.email}`);
    } catch (err) { setError(err.response?.data?.message || 'Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit OTP');
    setLoading(true); setError('');
    try {
      await verifyGuideRegistrationOTP({
        email: form.email.trim(), otp: otp.trim(), password: form.password,
        yearsExperience: Number(form.yearsExperience), specializations: form.specializations,
        languages: form.languages, bio: form.bio.trim(), guideLicense: form.guideLicense.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) { setError(err.response?.data?.message || 'Verification failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <>
      <style>{STYLES}</style>
      <div className="ag-success-page">
        <div className="ag-success-card">
          <div className="ag-success-icon">✅</div>
          <h2 className="ag-success-title">Application Submitted!</h2>
          <p className="ag-success-text">Your guide application is under review. Our team will verify your credentials and get back to you within <strong>2–3 business days</strong> via email.</p>
          <div className="ag-next-steps">
            <div className="ag-next-label">What happens next?</div>
            {['Admin reviews your profile and credentials','You receive an email with the decision','If approved, your guide dashboard becomes active','You can start accepting bookings immediately'].map(s => (
              <div key={s} className="ag-next-item"><span>✓</span><span>{s}</span></div>
            ))}
          </div>
          <Link to="/login" style={{ display:'inline-block',background:'#16a34a',color:'#fff',padding:'12px 28px',borderRadius:10,fontWeight:700,fontSize:15,textDecoration:'none' }}>
            Go to sign in
          </Link>
        </div>
      </div>
    </>
  );

  const STEPS = ['Personal info', 'Guide profile', 'Verify email'];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ag-page">
        <div className="ag-left">
          <div className="ag-left-bg" />
          <div className="ag-left-mountains" />
          <div className="ag-left-content">
            <div className="ag-brand">
              <div className="ag-brand-logo">🏔</div>
              <span className="ag-brand-name">NepalTrails</span>
            </div>
            <div className="ag-guide-badge">🧭 Guide Portal</div>
            <h1 className="ag-headline">Share your <em>expertise</em> with the world</h1>
            <p className="ag-sub">Join our certified guide network and connect with travelers from around the globe who want to explore Nepal authentically.</p>
            <div className="ag-perks">
              {['Set your own schedule and pricing','Get bookings from global travelers','Build your professional guide profile','Earn in USD, NPR or preferred currency','Dedicated support from our team'].map(p => (
                <div key={p} className="ag-perk">
                  <span className="ag-perk-check">✓</span>{p}
                </div>
              ))}
            </div>
          </div>
          <div className="ag-left-footer">
            <Link to="/login" className="ag-left-link">← Back to sign in</Link>
          </div>
        </div>

        <div className="ag-right">
          <div className="ag-card">
            <div className="ag-steps">
              {STEPS.map((s, i) => (
                <div key={i} className="ag-step-item">
                  <div className={`ag-step-num ${step > i + 1 ? 'ag-step-done' : step === i + 1 ? 'ag-step-active' : 'ag-step-pending'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: step === i + 1 ? '#16a34a' : '#94a3b8', whiteSpace: 'nowrap' }}>{s}</span>
                  {i < 2 && <div className="ag-step-line" style={{ background: step > i + 1 ? '#16a34a' : '#e2e8f0' }} />}
                </div>
              ))}
            </div>

            <h2 className="ag-title">{step === 1 ? 'Personal information' : step === 2 ? 'Your guide profile' : 'Verify your email'}</h2>
            <p className="ag-title-sub">{step === 1 ? 'Tell us about yourself.' : step === 2 ? 'Share your expertise and experience.' : `Enter the 6-digit code sent to ${form.email}`}</p>

            {error && <div className="ag-error"><span>⚠️</span>{error}</div>}
            {success && !error && <div className="ag-success"><span>✉️</span>{success}</div>}

            {step === 1 && (
              <form onSubmit={handleStep1} className="ag-form" noValidate>
                <div className="ag-row">
                  <div className="ag-field"><label className="ag-label">First name</label><input className="ag-input" type="text" placeholder="Ram" value={form.firstName} onChange={set('firstName')} autoFocus /></div>
                  <div className="ag-field"><label className="ag-label">Last name</label><input className="ag-input" type="text" placeholder="Sherpa" value={form.lastName} onChange={set('lastName')} /></div>
                </div>
                <div className="ag-field"><label className="ag-label">Email address</label><input className="ag-input" type="email" placeholder="guide@example.com" value={form.email} onChange={set('email')} /></div>
                <div className="ag-field"><label className="ag-label">Phone number</label><input className="ag-input" type="tel" placeholder="+977 98XXXXXXXX" value={form.phone} onChange={set('phone')} /></div>
                <div className="ag-field">
                  <label className="ag-label">Password</label>
                  <div className="ag-input-wrap">
                    <input className="ag-input" style={{ paddingRight: 44 }} type={showPw ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password} onChange={set('password')} />
                    <button type="button" className="ag-eye-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="ag-field"><label className="ag-label">Confirm password</label><input className="ag-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} /></div>
                <button type="submit" className="ag-btn">Continue →</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSendOTP} className="ag-form" noValidate>
                <div className="ag-field">
                  <label className="ag-label">Years of experience</label>
                  <input className="ag-input" type="number" min="0" max="50" placeholder="e.g. 5" value={form.yearsExperience} onChange={set('yearsExperience')} />
                </div>
                <div className="ag-field">
                  <label className="ag-label">Specializations <span className="ag-hint">(select at least 1)</span></label>
                  <div className="ag-tag-grid">
                    {SPECIALIZATIONS.map(sp => (
                      <button key={sp} type="button" className={`ag-tag${form.specializations.includes(sp) ? ' active' : ''}`} onClick={() => toggleArr('specializations', sp)}>{sp}</button>
                    ))}
                  </div>
                </div>
                <div className="ag-field">
                  <label className="ag-label">Languages spoken <span className="ag-hint">(select at least 2)</span></label>
                  <div className="ag-tag-grid">
                    {LANGUAGES.map(lg => (
                      <button key={lg} type="button" className={`ag-tag${form.languages.includes(lg) ? ' active' : ''}`} onClick={() => toggleArr('languages', lg)}>{lg}</button>
                    ))}
                  </div>
                </div>
                <div className="ag-field">
                  <label className="ag-label">Bio <span className="ag-hint">(100–500 chars)</span></label>
                  <textarea className="ag-input" style={{ minHeight: 100, resize: 'vertical', lineHeight: 1.6, paddingTop: 12 }}
                    placeholder="Tell travelers about your experience, personality, and what makes you a great guide…"
                    value={form.bio} onChange={set('bio')} maxLength={500} />
                  <span style={{ fontSize: 12, color: form.bio.length < 100 ? '#ef4444' : '#9ca3af', textAlign: 'right' }}>{form.bio.length}/500</span>
                </div>
                <div className="ag-field">
                  <label className="ag-label">Guide license number <span className="ag-hint">(optional)</span></label>
                  <input className="ag-input" type="text" placeholder="e.g. NTB-XXXXX" value={form.guideLicense} onChange={set('guideLicense')} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="ag-btn-back" onClick={() => { setStep(1); setError(''); }}>← Back</button>
                  <button type="submit" disabled={loading} className="ag-btn" style={{ flex: 1 }}>{loading ? 'Sending OTP…' : 'Send verification code →'}</button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleVerifyOTP} className="ag-form" noValidate>
                <div className="ag-field">
                  <label className="ag-label">6-digit verification code</label>
                  <input className="ag-input" style={{ fontSize: 24, letterSpacing: 12, textAlign: 'center', fontWeight: 700 }}
                    type="text" inputMode="numeric" maxLength={6}
                    placeholder="• • • • • •" value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    autoFocus />
                </div>
                <button type="submit" disabled={loading} className="ag-btn">{loading ? 'Submitting application…' : 'Verify & submit application'}</button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>Didn't receive it?</span>
                  <button type="button" style={{ fontSize: 14, fontWeight: 600, color: countdown > 0 ? '#94a3b8' : '#16a34a', background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'inherit' }}
                    onClick={async () => {
                      if (countdown > 0 || loading) return;
                      setLoading(true);
                      try { await sendGuideRegistrationOTP({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone }); setCountdown(60); }
                      catch (err) { setError(err.response?.data?.message || 'Failed.'); }
                      finally { setLoading(false); }
                    }} disabled={countdown > 0 || loading}>
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', textAlign: 'center', padding: '4px 0' }}
                  onClick={() => { setStep(2); setError(''); setOtp(''); setSuccess(''); }}>
                  ← Edit guide profile
                </button>
              </form>
            )}

            <p className="ag-footer">Already have an account? <Link to="/login" className="ag-footer-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
