import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, Briefcase, Globe,
  FileText, Camera, Shield, ChevronRight, ChevronLeft,
  CheckCircle, Upload, AlertCircle, Star, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SPECIALIZATIONS = [
  'Trekking', 'Cultural Tours', 'Photography', 'Wildlife',
  'Mountaineering', 'Rafting', 'Cycling', 'Yoga & Wellness',
  'Food Tours', 'Historical Sites', 'City Tours', 'Adventure Sports',
];

const LANGUAGES = [
  'Nepali', 'English', 'Hindi', 'Chinese', 'Japanese',
  'French', 'German', 'Spanish', 'Italian', 'Korean', 'Arabic', 'Russian',
];

const DESTINATIONS = [
  'Kathmandu Valley', 'Pokhara', 'Annapurna Region', 'Everest Region',
  'Langtang', 'Mustang', 'Chitwan', 'Lumbini', 'Bardiya', 'Ilam',
  'Manaslu Circuit', 'Dolpo', 'Kanchenjunga', 'Rara Lake',
];

const STEPS = [
  { id: 1, label: 'Personal Info',    icon: User       },
  { id: 2, label: 'Professional',     icon: Briefcase  },
  { id: 3, label: 'Destinations',     icon: MapPin     },
  { id: 4, label: 'Documents',        icon: FileText   },
  { id: 5, label: 'Review & Submit',  icon: CheckCircle },
];

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 14px', border: '1.5px solid #d1fae5',
  borderRadius: 10, fontSize: 14, color: '#0f172a',
  fontFamily: 'inherit', outline: 'none', background: '#fff',
  transition: 'border 0.15s',
};
const onFocus = (e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.08)'; };
const onBlur  = (e) => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; };

function TagSelect({ options, selected, onToggle, color = '#15803d', bg = '#f0fdf4', border = '#d1fae5' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)} style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: '1.5px solid', fontFamily: 'inherit',
            borderColor: active ? color   : border,
            background:   active ? bg     : '#fff',
            color:         active ? color : '#374151',
            transition: 'all 0.12s',
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
      {children} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5f0e8', padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f0fdf4' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="#16a34a" />
        </div>
        <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#0a2818' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ApplyGuide() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Personal
    fullName:     `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email:        user?.email || '',
    phone:        user?.phone || '',
    dateOfBirth:  '',
    city:         '',
    country:      'Nepal',
    street:       '',
    // Emergency
    emergencyName:         '',
    emergencyPhone:        '',
    emergencyRelationship: '',
    // Professional
    yearsExperience:  '',
    specializations:  [],
    languages:        [],
    bio:              '',
    hourlyRate:       '',
    dailyRate:        '',
    // Destinations
    preferredDestinations: [],
    // Documents (URLs for now — in production use file upload)
    profilePhoto:   '',
    governmentId:   '',
    guideLicense:   '',
    cv:             '',
    introVideo:     '',
    certifications: [],
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const tog = (field, val) => setForm((p) => ({
    ...p,
    [field]: p[field].includes(val) ? p[field].filter((v) => v !== val) : [...p[field], val],
  }));

  // Step validation
  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.fullName.trim()) return setError('Full name is required.'), false;
      if (!form.email.trim())    return setError('Email is required.'), false;
      if (!form.phone.trim())    return setError('Phone number is required.'), false;
      if (!form.dateOfBirth)     return setError('Date of birth is required.'), false;
      // 18+ check
      const age = (Date.now() - new Date(form.dateOfBirth)) / (365.25 * 24 * 3600 * 1000);
      if (age < 18) return setError('You must be at least 18 years old to apply.'), false;
      if (!form.city.trim())     return setError('City is required.'), false;
    }
    if (step === 2) {
      if (!form.yearsExperience) return setError('Years of experience is required.'), false;
      if (form.specializations.length === 0) return setError('Select at least one specialization.'), false;
      if (form.languages.length === 0)       return setError('Select at least one language.'), false;
      if (!form.bio || form.bio.length < 80) return setError('Bio must be at least 80 characters.'), false;
    }
    if (step === 4) {
      if (!form.profilePhoto.trim()) return setError('Profile photo URL is required.'), false;
      if (!form.governmentId.trim()) return setError('Government ID is required for verification.'), false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => s + 1); };
  const prevStep = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/guide-applications', {
        fullName:    form.fullName,
        email:       form.email,
        phone:       form.phone,
        dateOfBirth: form.dateOfBirth,
        address: { city: form.city, country: form.country, street: form.street },
        emergencyContact: {
          name:         form.emergencyName,
          phone:        form.emergencyPhone,
          relationship: form.emergencyRelationship,
        },
        yearsExperience:      Number(form.yearsExperience),
        specializations:      form.specializations,
        languages:            form.languages,
        bio:                  form.bio,
        hourlyRate:           Number(form.hourlyRate) || 0,
        dailyRate:            Number(form.dailyRate)  || 0,
        preferredDestinations: form.preferredDestinations,
        documents: {
          profilePhoto:   form.profilePhoto,
          governmentId:   form.governmentId,
          guideLicense:   form.guideLicense,
          cv:             form.cv,
          introVideo:     form.introVideo,
          certifications: form.certifications.filter(Boolean),
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8faf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Roboto', sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #e5f0e8' }}>
          <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={36} color="#16a34a" />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 24, color: '#0a2818', marginBottom: 12 }}>Application Submitted!</h2>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            Thank you for applying to become a verified guide on Nepal Travel.
            Your application is now <strong style={{ color: '#0a2818' }}>under review</strong>.
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: 13, marginBottom: 8 }}>📋 What happens next?</div>
            {[
              'Our admin team will review your profile and documents.',
              'You will receive an acknowledgement email shortly.',
              'The review process typically takes 2–5 business days.',
              'If approved, you will receive login credentials by email.',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#166534', marginBottom: 6 }}>
                <span>•</span><span>{t}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/')}
            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 32px', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8faf8', fontFamily: "'Roboto', sans-serif" }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%)', padding: '48px 24px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            GUIDE APPLICATION PORTAL
          </div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
            Become a Verified Guide
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Join Nepal Travel's verified guide network. Share your expertise, earn income, and help travelers discover Nepal's best experiences.
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5f0e8', padding: '20px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#e5f0e8', zIndex: 0 }} />
          {STEPS.map(({ id, label, icon: Icon }) => {
            const done    = step > id;
            const current = step === id;
            return (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: done ? '#16a34a' : current ? '#0a2818' : '#fff',
                  border: `2px solid ${done || current ? '#16a34a' : '#d1fae5'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {done
                    ? <CheckCircle size={18} color="#fff" />
                    : <Icon size={16} color={current ? '#4ade80' : '#9ca3af'} />
                  }
                </div>
                <span style={{ fontSize: 11, fontWeight: done || current ? 700 : 500, color: done || current ? '#0a2818' : '#9ca3af', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 24px 60px' }}>

        {/* Error alert */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── STEP 1: Personal Information ── */}
        {step === 1 && (
          <>
            <SectionCard title="Personal Information" icon={User}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldLabel required>Full Name</FieldLabel>
                  <input value={form.fullName} onChange={set('fullName')} onFocus={onFocus} onBlur={onBlur} placeholder="As on government ID" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <input type="email" value={form.email} onChange={set('email')} onFocus={onFocus} onBlur={onBlur} placeholder="your@email.com" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel required>Phone Number</FieldLabel>
                  <input type="tel" value={form.phone} onChange={set('phone')} onFocus={onFocus} onBlur={onBlur} placeholder="+977 98XXXXXXXX" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel required>Date of Birth</FieldLabel>
                  <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} onFocus={onFocus} onBlur={onBlur}
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                    style={inputStyle} />
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Must be 18+ years old</div>
                </div>
                <div>
                  <FieldLabel required>City</FieldLabel>
                  <input value={form.city} onChange={set('city')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Kathmandu" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <input value={form.country} onChange={set('country')} onFocus={onFocus} onBlur={onBlur} placeholder="Nepal" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Street Address</FieldLabel>
                  <input value={form.street} onChange={set('street')} onFocus={onFocus} onBlur={onBlur} placeholder="Optional" style={inputStyle} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Emergency Contact" icon={Shield}>
              <div style={{ background: '#fffaeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 16 }}>
                ⚠️ Emergency contacts are used in case of incidents during guided tours. Strongly recommended.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <FieldLabel>Contact Name</FieldLabel>
                  <input value={form.emergencyName} onChange={set('emergencyName')} onFocus={onFocus} onBlur={onBlur} placeholder="Full name" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Contact Phone</FieldLabel>
                  <input type="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} onFocus={onFocus} onBlur={onBlur} placeholder="+977 98XXXXXXXX" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Relationship</FieldLabel>
                  <select value={form.emergencyRelationship} onChange={set('emergencyRelationship')} onFocus={onFocus} onBlur={onBlur} style={{ ...inputStyle, background: '#fff' }}>
                    <option value="">Select relationship</option>
                    {['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ── STEP 2: Professional Details ── */}
        {step === 2 && (
          <>
            <SectionCard title="Experience & Skills" icon={Briefcase}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <FieldLabel required>Years of Experience</FieldLabel>
                  <input type="number" min="0" max="50" value={form.yearsExperience} onChange={set('yearsExperience')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. 5" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Hourly Rate (NPR)</FieldLabel>
                  <input type="number" min="0" value={form.hourlyRate} onChange={set('hourlyRate')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. 1500" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Daily Rate (NPR)</FieldLabel>
                  <input type="number" min="0" value={form.dailyRate} onChange={set('dailyRate')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. 8000" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <FieldLabel required>Areas of Specialization</FieldLabel>
                <TagSelect options={SPECIALIZATIONS} selected={form.specializations} onToggle={(v) => tog('specializations', v)} />
              </div>

              <div>
                <FieldLabel required>Languages Spoken</FieldLabel>
                <TagSelect options={LANGUAGES} selected={form.languages} onToggle={(v) => tog('languages', v)} color="#0d9488" bg="#f0fdf9" border="#5eead4" />
              </div>
            </SectionCard>

            <SectionCard title="Bio & Description" icon={FileText}>
              <FieldLabel required>About You</FieldLabel>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, lineHeight: 1.5 }}>
                Write about your experience, personality, guiding style, and what makes you a great guide. Min 80 characters.
              </p>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                onFocus={onFocus}
                onBlur={onBlur}
                rows={6}
                maxLength={2000}
                placeholder="I am a passionate local guide with X years of experience in trekking the Himalayas. I speak fluent English and Nepali, and specialize in cultural tours and trekking expeditions…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                <span style={{ color: form.bio.length < 80 ? '#ef4444' : '#9ca3af' }}>
                  {form.bio.length < 80 ? `${80 - form.bio.length} more characters needed` : '✓ Minimum met'}
                </span>
                <span style={{ color: '#9ca3af' }}>{form.bio.length}/2000</span>
              </div>
            </SectionCard>
          </>
        )}

        {/* ── STEP 3: Preferred Destinations ── */}
        {step === 3 && (
          <SectionCard title="Preferred Destinations & Areas Covered" icon={MapPin}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              Select the regions and destinations you are most familiar with and can professionally guide tourists in. This helps match you with the right travelers.
            </p>
            <TagSelect
              options={DESTINATIONS}
              selected={form.preferredDestinations}
              onToggle={(v) => tog('preferredDestinations', v)}
              color="#7c3aed"
              bg="#f5f3ff"
              border="#c4b5fd"
            />
            {form.preferredDestinations.length > 0 && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 10, fontSize: 13, color: '#7c3aed' }}>
                <strong>{form.preferredDestinations.length}</strong> destination{form.preferredDestinations.length !== 1 ? 's' : ''} selected: {form.preferredDestinations.join(', ')}
              </div>
            )}
          </SectionCard>
        )}

        {/* ── STEP 4: Documents ── */}
        {step === 4 && (
          <>
            <div style={{ background: '#fffaeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#92400e', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Document Verification Required.</strong> Valid government ID and a clear profile photo are mandatory.
                All documents are reviewed only by our admin team and kept strictly confidential.
              </div>
            </div>

            <SectionCard title="Required Documents" icon={Camera}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldLabel required>Profile Photo URL</FieldLabel>
                  <input value={form.profilePhoto} onChange={set('profilePhoto')} onFocus={onFocus} onBlur={onBlur}
                    placeholder="https://… (direct image URL)" style={inputStyle} />
                  {form.profilePhoto && (
                    <img src={form.profilePhoto} alt="Preview" style={{ marginTop: 8, width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d1fae5' }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Clear, recent photo of yourself. No sunglasses.</div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldLabel required>Government ID URL</FieldLabel>
                  <input value={form.governmentId} onChange={set('governmentId')} onFocus={onFocus} onBlur={onBlur}
                    placeholder="Citizenship / Passport scan URL" style={inputStyle} />
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Citizenship certificate or valid passport. Must be clearly readable.</div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Optional Documents" icon={Upload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <FieldLabel>Guide License URL</FieldLabel>
                  <input value={form.guideLicense} onChange={set('guideLicense')} onFocus={onFocus} onBlur={onBlur}
                    placeholder="Official guide license (if any)" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>CV / Portfolio URL</FieldLabel>
                  <input value={form.cv} onChange={set('cv')} onFocus={onFocus} onBlur={onBlur}
                    placeholder="Link to CV or portfolio" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Intro Video URL</FieldLabel>
                  <input value={form.introVideo} onChange={set('introVideo')} onFocus={onFocus} onBlur={onBlur}
                    placeholder="YouTube / Vimeo link (optional)" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Certification 1 URL</FieldLabel>
                  <input
                    value={form.certifications[0] || ''}
                    onChange={(e) => setForm((p) => {
                      const c = [...p.certifications];
                      c[0] = e.target.value;
                      return { ...p, certifications: c };
                    })}
                    onFocus={onFocus} onBlur={onBlur}
                    placeholder="First Aid, Mountaineering cert…" style={inputStyle} />
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ── STEP 5: Review & Submit ── */}
        {step === 5 && (
          <div>
            <SectionCard title="Review Your Application" icon={CheckCircle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[
                  { label: 'Full Name',        val: form.fullName },
                  { label: 'Email',            val: form.email },
                  { label: 'Phone',            val: form.phone },
                  { label: 'Date of Birth',    val: form.dateOfBirth },
                  { label: 'City',             val: form.city || '—' },
                  { label: 'Country',          val: form.country },
                  { label: 'Experience',       val: `${form.yearsExperience} years` },
                  { label: 'Hourly Rate',      val: form.hourlyRate ? `NPR ${form.hourlyRate}` : '—' },
                  { label: 'Daily Rate',       val: form.dailyRate  ? `NPR ${form.dailyRate}`  : '—' },
                  { label: 'Languages',        val: form.languages.join(', ') || '—' },
                ].map(({ label, val }) => (
                  <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid #f0fdf4', display: 'flex', justifyContent: 'space-between', gridColumn: 'span 1' }}>
                    <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#0a2818', fontWeight: 700, textAlign: 'right', maxWidth: '55%' }}>{val || '—'}</span>
                  </div>
                ))}
              </div>

              {form.specializations.length > 0 && (
                <div style={{ padding: '12px 0', borderBottom: '1px solid #f0fdf4' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>Specializations</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.specializations.map((s) => <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #d1fae5', padding: '3px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                  </div>
                </div>
              )}

              {form.preferredDestinations.length > 0 && (
                <div style={{ padding: '12px 0', borderBottom: '1px solid #f0fdf4' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>Preferred Destinations</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{form.preferredDestinations.join(', ')}</div>
                </div>
              )}

              <div style={{ padding: '12px 0', borderBottom: '1px solid #f0fdf4' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>Documents</div>
                {[
                  { label: 'Profile Photo', val: form.profilePhoto,  required: true },
                  { label: 'Government ID', val: form.governmentId,  required: true },
                  { label: 'Guide License', val: form.guideLicense,  required: false },
                  { label: 'CV',            val: form.cv,            required: false },
                ].map(({ label, val, required }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#6b7280' }}>{label}{required && ' *'}</span>
                    <span style={{ color: val ? '#16a34a' : required ? '#ef4444' : '#9ca3af', fontWeight: 700 }}>
                      {val ? '✓ Uploaded' : required ? '❌ Missing' : '— Not provided'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Declaration */}
              <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 12, padding: '16px 18px', marginTop: 16, fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
                <strong>Declaration:</strong> By submitting this application, I confirm that all information provided is accurate and truthful.
                I understand that providing false information will result in permanent rejection from the Nepal Travel guide program.
                I consent to my documents being reviewed by the Nepal Travel admin team for verification purposes.
              </div>
            </SectionCard>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          {step > 1 ? (
            <button type="button" onClick={prevStep} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', background: '#f0fdf4', border: '1.5px solid #d1fae5',
              borderRadius: 12, color: '#15803d', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <ChevronLeft size={16} /> Previous
            </button>
          ) : <div />}

          {step < 5 ? (
            <button type="button" onClick={nextStep} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', background: '#16a34a', border: 'none',
              borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 32px', background: loading ? '#86efac' : '#16a34a', border: 'none',
              borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
              <CheckCircle size={18} />
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
