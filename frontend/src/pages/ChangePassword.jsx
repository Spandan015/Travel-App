import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ✅ Defined OUTSIDE component to prevent cursor jumping on re-render
function PwInput({ label, value, onChange, placeholder, showVal, onToggleShow }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
        <input
          type={showVal ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '11px 40px 11px 36px',
            border: '1.5px solid #d1fae5', borderRadius: 10,
            fontSize: 14, fontFamily: 'inherit', outline: 'none',
            background: '#fff', color: '#0f172a',
          }}
          onFocus={(e) => e.target.style.borderColor = '#16a34a'}
          onBlur={(e)  => e.target.style.borderColor = '#d1fae5'}
        />
        <button
          type="button"
          onClick={onToggleShow}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af',
          }}
        >
          {showVal ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f59e0b', '#0d9488', '#16a34a'];

function getStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

export default function ChangePassword() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [current,  setCurrent]  = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showC,    setShowC]    = useState(false);
  const [showN,    setShowN]    = useState(false);
  const [showCo,   setShowCo]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const pwdStrength = getStrength(newPwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPwd.length < 8)        return setError('New password must be at least 8 characters.');
    if (newPwd !== confirm)        return setError('Passwords do not match.');
    if (newPwd === current)        return setError('New password must be different from the temporary password.');

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: current,
        newPassword:     newPwd,
      });
      setSuccess(true);
      setTimeout(() => navigate('/guide/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg,#0a2818,#1a4a2a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Roboto',sans-serif", zIndex: 9999,
    }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 420, width: '90%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={32} color="#16a34a" />
        </div>
        <h2 style={{ fontWeight: 800, color: '#0a2818', fontSize: 22, marginBottom: 8 }}>Password Changed!</h2>
        <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>Redirecting to your guide dashboard…</p>
        <div style={{ width: 40, height: 40, border: '3px solid #d1fae5', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '20px auto 0' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </div>
  );

  // ── Main screen ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ✅ Full screen overlay hides everything behind it including Navbar */}
      <style>{`
        body { overflow: hidden; }
        nav, header, footer { display: none !important; }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Roboto',sans-serif", padding: 16, zIndex: 9999,
        overflowY: 'auto',
      }}>
        <div style={{
          background: '#fff', borderRadius: 20,
          maxWidth: 440, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          margin: 'auto',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#0a2818,#1a4a2a)', padding: '32px 32px 28px', textAlign: 'center', borderRadius: '20px 20px 0 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid rgba(74,222,128,0.3)' }}>
              <ShieldCheck size={26} color="#4ade80" />
            </div>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>Set Your New Password</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '8px 0 0', lineHeight: 1.5 }}>
              You are using a temporary password. Please set a new secure password to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '14px 16px', marginBottom: 22, fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
              Welcome, <strong>{user?.firstName || user?.username}</strong>! Your guide account is active.
              Create a secure password to complete setup.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PwInput
                label="Temporary Password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter your temporary password"
                showVal={showC}
                onToggleShow={() => setShowC((v) => !v)}
              />

              <PwInput
                label="New Password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Create a secure password"
                showVal={showN}
                onToggleShow={() => setShowN((v) => !v)}
              />

              {/* Strength bar */}
              {newPwd.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map((n) => (
                      <div key={n} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: n <= pwdStrength ? strengthColor[pwdStrength] : '#e5e7eb',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: strengthColor[pwdStrength], fontWeight: 600 }}>
                    {strengthLabel[pwdStrength]} password
                  </div>
                </div>
              )}

              <PwInput
                label="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your new password"
                showVal={showCo}
                onToggleShow={() => setShowCo((v) => !v)}
              />

              {/* Requirements */}
              <div style={{ background: '#f8faf8', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#6b7280' }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Password requirements:</div>
                {[
                  { ok: newPwd.length >= 8,           text: 'At least 8 characters' },
                  { ok: /[A-Z]/.test(newPwd),         text: 'One uppercase letter' },
                  { ok: /[0-9]/.test(newPwd),         text: 'One number' },
                  { ok: /[^A-Za-z0-9]/.test(newPwd),  text: 'One special character (@#$!)' },
                ].map(({ ok, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: ok ? '#16a34a' : '#d1d5db', fontSize: 14 }}>{ok ? '✓' : '○'}</span>
                    <span style={{ color: ok ? '#166534' : '#9ca3af' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#b91c1c', fontWeight: 600, marginTop: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pwdStrength < 2}
              style={{
                width: '100%', marginTop: 20, padding: '14px',
                background: loading || pwdStrength < 2 ? '#86efac' : '#16a34a',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 800, fontSize: 15,
                cursor: loading || pwdStrength < 2 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
            >
              {loading ? 'Setting password…' : 'Set New Password & Continue →'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
