import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterAdmin() {
  const { sendAdminRegistrationOTP, verifyAdminRegistrationOTP } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp]         = useState('');
  const [showPw, setShowPw]   = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', adminSecretKey: '',
  });

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setError(''); };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email';
    if (!form.adminSecretKey.trim()) return 'Admin secret key is required';
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
      await sendAdminRegistrationOTP({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        adminSecretKey: form.adminSecretKey.trim(),
      });
      setStep(2);
      setCountdown(60);
      setSuccess(`Verification code sent to ${form.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit OTP');

    setLoading(true); setError('');
    try {
      await verifyAdminRegistrationOTP({
        email: form.email.trim(),
        otp: otp.trim(),
        password: form.password,
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.left}>
        <div style={S.leftBg} />
        <div style={S.leftContent}>
          <div style={S.brand}><span>🏔</span><span style={S.brandName}>Nepal Travel</span></div>
          <div style={S.adminBadge}>⚙️ Admin Portal</div>
          <h1 style={S.headline}>Platform administration</h1>
          <p style={S.sub}>Create an admin account to manage guides, users, hotels, packages, and all platform operations.</p>
          <div style={S.warning}>
            <span style={S.warnIcon}>🔐</span>
            <div>
              <div style={S.warnTitle}>Restricted access</div>
              <div style={S.warnText}>Admin registration requires a valid secret key issued by the platform operator. Contact your system administrator if you don't have one.</div>
            </div>
          </div>
        </div>
        <div style={S.leftFooter}>
          <Link to="/login" style={S.leftLink}>← Back to sign in</Link>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <div style={S.steps}>
            {['Admin details', 'Verify email'].map((s, i) => (
              <div key={i} style={S.stepItem}>
                <div style={{ ...S.stepNum, ...(step > i + 1 ? S.stepDone : step === i + 1 ? S.stepActive : S.stepPending) }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: step === i + 1 ? '#7c3aed' : '#94a3b8' }}>{s}</span>
                {i < 1 && <div style={{ flex: 1, height: 2, background: step > 1 ? '#7c3aed' : '#e2e8f0', margin: '0 8px', borderRadius: 1 }} />}
              </div>
            ))}
          </div>

          <h2 style={S.title}>{step === 1 ? 'Create admin account' : 'Verify your email'}</h2>
          <p style={S.titleSub}>{step === 1 ? 'Enter your details and admin secret key.' : `Code sent to ${form.email}`}</p>

          {error && <div style={S.errorBox}><span>⚠</span>{error}</div>}
          {success && !error && <div style={S.successBox}><span>✓</span>{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} style={S.form} noValidate>
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>First name</label>
                  <input style={S.input} type="text" placeholder="Admin" value={form.firstName} onChange={set('firstName')} autoFocus />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Last name</label>
                  <input style={S.input} type="text" placeholder="User" value={form.lastName} onChange={set('lastName')} />
                </div>
              </div>

              <div style={S.field}>
                <label style={S.label}>Email address</label>
                <input style={S.input} type="email" placeholder="admin@nepaltravel.com" value={form.email} onChange={set('email')} />
              </div>

              <div style={S.field}>
                <label style={S.label}>Admin secret key</label>
                <input
                  style={{ ...S.input, fontFamily: 'monospace', letterSpacing: 2 }}
                  type="password"
                  placeholder="Enter the secret key"
                  value={form.adminSecretKey}
                  onChange={set('adminSecretKey')}
                  autoComplete="off"
                />
              </div>

              <div style={S.field}>
                <label style={S.label}>Password</label>
                <div style={S.inputWrap}>
                  <input style={{ ...S.input, paddingRight: 44 }} type={showPw ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
                  <button type="button" style={S.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                    </svg>
                  </button>
                </div>
              </div>

              <div style={S.field}>
                <label style={S.label}>Confirm password</label>
                <input style={S.input} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
              </div>

              <button type="submit" disabled={loading} style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}>
                {loading ? 'Verifying key…' : 'Continue →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} style={S.form} noValidate>
              <div style={S.field}>
                <label style={S.label}>6-digit verification code</label>
                <input
                  style={{ ...S.input, fontSize: 24, letterSpacing: 12, textAlign: 'center', fontWeight: 700 }}
                  type="text" inputMode="numeric" maxLength={6}
                  placeholder="••••••" value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading} style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}>
                {loading ? 'Creating account…' : 'Verify & create admin account'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Didn't receive it?</span>
                <button type="button" style={{ ...S.resendBtn, ...(countdown > 0 ? { color: '#94a3b8', cursor: 'not-allowed' } : {}) }} onClick={async () => {
                  if (countdown > 0 || loading) return;
                  setLoading(true);
                  try {
                    await sendAdminRegistrationOTP({ firstName: form.firstName, lastName: form.lastName, email: form.email, adminSecretKey: form.adminSecretKey });
                    setCountdown(60);
                  } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
                  finally { setLoading(false); }
                }} disabled={countdown > 0 || loading}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <button type="button" style={S.backBtn} onClick={() => { setStep(1); setError(''); setOtp(''); setSuccess(''); }}>
                ← Edit details
              </button>
            </form>
          )}

          <p style={S.footer}><Link to="/login" style={S.footerLink}>← Back to sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#f8fafc' },
  left: { display: 'none', position: 'relative', flex: '0 0 44%', overflow: 'hidden', flexDirection: 'column' },
  leftBg: { position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 50%, #6d28d9 100%)' },
  leftContent: { position: 'relative', zIndex: 10, padding: '56px 48px', flex: 1, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, fontSize: 18 },
  brandName: { fontWeight: 700 },
  adminBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, width: 'fit-content', marginBottom: 20 },
  headline: { fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.6px' },
  sub: { fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', marginBottom: 36, maxWidth: 340 },
  warning: { display: 'flex', gap: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '16px 18px' },
  warnIcon: { fontSize: 22, flexShrink: 0 },
  warnTitle: { fontWeight: 700, fontSize: 14, marginBottom: 4 },
  warnText: { fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' },
  leftFooter: { position: 'relative', zIndex: 10, padding: '20px 48px', color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  leftLink: { color: '#fff', fontWeight: 600 },

  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  card: { width: '100%', maxWidth: 460, background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', padding: '36px 36px' },
  steps: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 },
  stepItem: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  stepNum: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  stepActive: { background: '#7c3aed', color: '#fff' },
  stepDone: { background: '#0d9488', color: '#fff' },
  stepPending: { background: '#f1f5f9', color: '#94a3b8', border: '1.5px solid #e2e8f0' },
  title: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.4px' },
  titleSub: { fontSize: 14, color: '#64748b', margin: '0 0 24px' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '11px 14px', fontSize: 14, marginBottom: 18 },
  successBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: 10, padding: '11px 14px', fontSize: 14, marginBottom: 18 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  inputWrap: { position: 'relative' },
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15, color: '#0f172a', background: '#fff', outline: 'none', fontFamily: 'inherit' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 },
  btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  btnDisabled: { opacity: 0.7, cursor: 'not-allowed' },
  resendBtn: { fontSize: 14, fontWeight: 600, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' },
  backBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0, textAlign: 'left' },
  footer: { fontSize: 14, textAlign: 'center', marginTop: 24 },
  footerLink: { color: '#7c3aed', fontWeight: 600, textDecoration: 'none' },
};
