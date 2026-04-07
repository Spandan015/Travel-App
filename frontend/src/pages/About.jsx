import { Link } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  .ab-root { font-family: 'Roboto', sans-serif; background: #f8faf8; padding-top: 68px; }

  /* ── HERO ── */
  .ab-hero {
    position: relative; min-height: 90vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    overflow: hidden; padding: 80px 24px 120px; text-align: center;
  }
  .ab-hero-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #0a2818 0%, #0d3320 35%, #1a4a2a 65%, #0a1a10 100%);
  }
  .ab-hero-bg::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .ab-hero-mountains {
    position: absolute; bottom: 0; left: 0; right: 0; height: 42%;
    clip-path: polygon(0% 100%,8% 60%,15% 70%,22% 45%,30% 62%,38% 30%,45% 50%,52% 20%,60% 45%,67% 35%,74% 55%,82% 25%,90% 48%,100% 35%,100% 100%);
    background: rgba(255,255,255,0.03);
  }
  .ab-hero-overlay {
    position: absolute; bottom: 0; left: 0; right: 0; height: 160px;
    background: linear-gradient(to top, #f8faf8, transparent);
  }
  .ab-hero-content {
    position: relative; z-index: 2; max-width: 720px; margin: 0 auto;
    animation: abFade 0.9s ease both;
  }
  @keyframes abFade { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }

  .ab-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.15); border-radius: 100px;
    color: rgba(255,255,255,0.85); padding: 6px 18px;
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; margin-bottom: 24px;
  }
  .ab-eyebrow span { width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block; }

  .ab-hero h1 {
    font-family: 'Roboto', sans-serif;
    font-size: clamp(2.6rem, 6vw, 4.4rem); font-weight: 700;
    color: white; margin: 0 0 20px; line-height: 1.1; letter-spacing: -0.02em;
  }
  .ab-hero h1 em { font-style: italic; color: #4ade80; }
  .ab-hero p {
    color: rgba(255,255,255,0.65); font-size: 1.05rem;
    margin: 0 auto 44px; font-weight: 300; max-width: 520px; line-height: 1.75;
  }
  .ab-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .ab-btn-primary {
    background: #16a34a; color: white; padding: 13px 30px; border-radius: 10px;
    font-weight: 700; font-size: 0.9rem; text-decoration: none;
    font-family: 'Roboto', sans-serif; transition: all 0.2s;
  }
  .ab-btn-primary:hover { background: #15803d; transform: translateY(-2px); }
  .ab-btn-secondary {
    background: rgba(255,255,255,0.1); color: white; padding: 13px 30px; border-radius: 10px;
    font-weight: 600; font-size: 0.9rem; text-decoration: none;
    border: 1px solid rgba(255,255,255,0.25); font-family: 'Roboto', sans-serif;
    transition: all 0.2s; backdrop-filter: blur(8px);
  }
  .ab-btn-secondary:hover { background: rgba(255,255,255,0.18); transform: translateY(-2px); }

  /* ── STATS ── */
  .ab-stats {
    background: #0f172a;
    display: grid; grid-template-columns: repeat(4,1fr);
  }
  @media(max-width:640px) { .ab-stats { grid-template-columns: repeat(2,1fr); } }
  .ab-stat {
    padding: 32px 24px; text-align: center;
    border-right: 1px solid rgba(255,255,255,0.07);
  }
  .ab-stat:last-child { border-right: none; }
  .ab-stat-num {
    font-family: 'Roboto', sans-serif; font-size: 2.4rem; font-weight: 700;
    color: white; display: block; line-height: 1;
  }
  .ab-stat-num span { color: #4ade80; }
  .ab-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.45); margin-top: 6px; }

  /* ── SECTIONS ── */
  .ab-section { padding: 88px 24px; }
  .ab-section-inner { max-width: 1180px; margin: 0 auto; }
  .ab-section-header { text-align: center; margin-bottom: 56px; }
  .ab-section-eyebrow {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; color: #16a34a; margin-bottom: 12px; display: block;
  }
  .ab-section-title {
    font-family: 'Roboto', sans-serif;
    font-size: clamp(1.8rem,4vw,2.6rem); font-weight: 700;
    color: #0f172a; margin: 0; line-height: 1.2;
  }
  .ab-section-sub {
    color: #64748b; font-size: 0.95rem; margin-top: 12px;
    font-weight: 300; max-width: 500px; margin-left: auto; margin-right: auto;
  }

  /* ── MISSION ── */
  .ab-mission { background: white; }
  .ab-mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  @media(max-width:840px) { .ab-mission-grid { grid-template-columns: 1fr; gap: 40px; } }
  .ab-mission-text h2 {
    font-family: 'Roboto', sans-serif; font-size: clamp(1.8rem,4vw,2.4rem);
    font-weight: 700; color: #0f172a; margin: 0 0 20px; line-height: 1.2;
  }
  .ab-mission-text p { color: #64748b; line-height: 1.8; font-size: 0.95rem; font-weight: 300; margin-bottom: 16px; }
  .ab-mission-card {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 20px; padding: 36px; border: 1px solid #bbf7d0;
  }
  .ab-mission-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
  .ab-mission-card-icon { font-size: 2.5rem; }
  .ab-mission-card-title {
    font-family: 'Roboto', sans-serif; font-size: 1.2rem;
    font-weight: 700; color: #0f172a; margin: 0;
  }
  .ab-mission-card-sub { font-size: 0.78rem; color: #64748b; margin: 3px 0 0; }
  .ab-impact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .ab-impact-item {
    background: white; border-radius: 14px; padding: 20px;
    text-align: center; border: 1px solid #bbf7d0;
  }
  .ab-impact-num {
    font-family: 'Roboto', sans-serif; font-size: 1.8rem;
    font-weight: 700; color: #16a34a; display: block;
  }
  .ab-impact-label { font-size: 0.75rem; color: #64748b; margin-top: 4px; }

  /* ── VALUES ── */
  .ab-values { background: #f8faf8; }
  .ab-values-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
  @media(max-width:840px) { .ab-values-grid { grid-template-columns: 1fr; } }
  .ab-value-card {
    background: white; border-radius: 20px; padding: 36px 28px;
    border: 1px solid #e5f0e8; transition: all 0.3s; position: relative; overflow: hidden;
  }
  .ab-value-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #16a34a, #4ade80);
  }
  .ab-value-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(22,163,74,0.12); }
  .ab-value-icon { font-size: 2.4rem; margin-bottom: 18px; display: block; }
  .ab-value-title {
    font-family: 'Roboto', sans-serif; font-size: 1.1rem;
    font-weight: 700; color: #0f172a; margin: 0 0 12px;
  }
  .ab-value-desc { font-size: 0.875rem; color: #64748b; line-height: 1.7; font-weight: 300; margin: 0; }

  /* ── WHY NEPAL ── */
  .ab-why { background: #0f172a; }
  .ab-why .ab-section-eyebrow { color: #4ade80; }
  .ab-why .ab-section-title { color: white; }
  .ab-why .ab-section-sub { color: rgba(255,255,255,0.5); }
  .ab-why-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  @media(max-width:900px) { .ab-why-grid { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:480px) { .ab-why-grid { grid-template-columns: 1fr; } }
  .ab-why-card {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px; padding: 28px 22px; text-align: center; transition: all 0.3s;
  }
  .ab-why-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(74,222,128,0.3); transform: translateY(-4px); }
  .ab-why-icon-wrap {
    width: 60px; height: 60px; border-radius: 16px;
    background: rgba(22,163,74,0.2); display: flex; align-items: center;
    justify-content: center; font-size: 1.6rem; margin: 0 auto 16px;
  }
  .ab-why-title {
    font-family: 'Roboto', sans-serif; font-size: 0.95rem;
    font-weight: 700; color: white; margin: 0 0 8px;
  }
  .ab-why-desc { font-size: 0.78rem; color: rgba(255,255,255,0.5); line-height: 1.65; font-weight: 300; margin: 0; }

  /* ── STORY ── */
  .ab-story { background: white; }
  .ab-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  @media(max-width:840px) { .ab-story-grid { grid-template-columns: 1fr; gap: 40px; } }
  .ab-story-img-wrap { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 4/3; }
  .ab-story-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .ab-story-img-badge {
    position: absolute; bottom: 20px; left: 20px;
    background: rgba(10,40,24,0.88); backdrop-filter: blur(8px);
    color: white; padding: 12px 18px; border-radius: 12px;
    font-size: 0.83rem; font-weight: 500;
    border: 1px solid rgba(74,222,128,0.2);
  }
  .ab-story-img-badge strong {
    display: block; font-family: 'Roboto', sans-serif;
    font-size: 1rem; font-weight: 700; margin-bottom: 2px; color: #4ade80;
  }
  .ab-story-text h2 {
    font-family: 'Roboto', sans-serif; font-size: clamp(1.6rem,3.5vw,2.2rem);
    font-weight: 700; color: #0f172a; margin: 0 0 20px;
  }
  .ab-story-text p { color: #64748b; line-height: 1.8; font-size: 0.95rem; font-weight: 300; margin-bottom: 14px; }
  .ab-story-features { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
  .ab-story-feature { display: flex; align-items: flex-start; gap: 12px; }
  .ab-story-feature-icon {
    width: 32px; height: 32px; border-radius: 8px; background: #f0fdf4;
    border: 1px solid #bbf7d0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; flex-shrink: 0; margin-top: 1px;
  }
  .ab-story-feature-text { font-size: 0.875rem; color: #0f172a; font-weight: 600; line-height: 1.5; }
  .ab-story-feature-sub { font-size: 0.78rem; color: #64748b; font-weight: 300; }

  /* ── CTA ── */
  .ab-cta {
    position: relative; padding: 100px 24px; text-align: center; overflow: hidden;
    background: linear-gradient(135deg, #0a2818 0%, #1a4a2a 100%);
  }
  .ab-cta::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
  }
  .ab-cta-inner { position: relative; z-index: 1; max-width: 580px; margin: 0 auto; }
  .ab-cta h2 {
    font-family: 'Roboto', sans-serif; font-size: clamp(2rem,5vw,3.2rem);
    color: white; margin: 0 0 16px; font-weight: 700; line-height: 1.2;
  }
  .ab-cta h2 em { font-style: italic; color: #4ade80; }
  .ab-cta p { color: rgba(255,255,255,0.65); font-size: 1rem; margin: 0 auto 40px; font-weight: 300; line-height: 1.7; }
  .ab-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .ab-cta-a {
    background: #16a34a; color: white; padding: 14px 32px; border-radius: 10px;
    font-weight: 700; font-size: 0.9rem; text-decoration: none;
    font-family: 'Roboto', sans-serif; transition: all 0.2s;
  }
  .ab-cta-a:hover { background: #15803d; transform: translateY(-2px); }
  .ab-cta-b {
    background: rgba(255,255,255,0.1); color: white; padding: 14px 32px; border-radius: 10px;
    font-weight: 600; font-size: 0.9rem; text-decoration: none;
    border: 1px solid rgba(255,255,255,0.25); font-family: 'Roboto', sans-serif;
    transition: all 0.2s; backdrop-filter: blur(8px);
  }
  .ab-cta-b:hover { background: rgba(255,255,255,0.18); transform: translateY(-2px); }
`;

const STATS = [
  { num: '200', suffix: '+', label: 'Local Guides' },
  { num: '25',  suffix: '+', label: 'Destinations' },
  { num: '15k', suffix: '+', label: 'Happy Travelers' },
  { num: '4.9', suffix: '/5', label: 'Average Rating' },
];

const VALUES = [
  {
    icon: '🙏',
    title: 'Cultural Respect',
    desc: "We promote responsible tourism that honours Nepal's rich cultural heritage, sacred sites, and living traditions. Our guides educate travelers on local customs with genuine care.",
  },
  {
    icon: '🏔️',
    title: 'Sustainable Adventure',
    desc: "Protecting Nepal's pristine Himalayan environment through eco-conscious practices. We champion Leave No Trace principles and support active conservation across every journey.",
  },
  {
    icon: '🤝',
    title: 'Community First',
    desc: 'Empowering local communities through fair wages, local partnerships, and tourism revenue that flows back to the people who call Nepal home.',
  },
];

const WHY = [
  { icon: '🏔️', title: "8 of the World's Highest Peaks", desc: 'Including Everest — the ultimate trekking pilgrimage for adventurers worldwide.' },
  { icon: '🏛️', title: '7 UNESCO Heritage Sites', desc: 'Ancient temples, palaces, and cultural treasures spanning 2,000+ years of history.' },
  { icon: '🐘', title: 'Extraordinary Wildlife', desc: "Bengal tigers, one-horned rhinos, snow leopards — Nepal's biodiversity is extraordinary." },
  { icon: '☸️', title: 'Spiritual Heritage', desc: 'Birthplace of the Buddha, Nepal holds profound spiritual significance across traditions.' },
];

const About = () => (
  <>
    <style>{STYLES}</style>
    <div className="ab-root">

      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero-bg" />
        <div className="ab-hero-mountains" />
        <div className="ab-hero-overlay" />
        <div className="ab-hero-content">
          <div className="ab-eyebrow"><span />About My Travel Buddy</div>
          <h1>Exploring Nepal's<br /><em>Soul</em>, Together</h1>
          <p>We connect curious travelers with passionate local guides for authentic, responsible, and unforgettable Himalayan adventures.</p>
          <div className="ab-hero-btns">
            <Link to="/register" className="ab-btn-primary">Start Your Journey</Link>
            <Link to="/apply-guide" className="ab-btn-secondary">Become a Guide</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="ab-stats">
        {STATS.map(s => (
          <div key={s.label} className="ab-stat">
            <span className="ab-stat-num">{s.num}<span>{s.suffix}</span></span>
            <div className="ab-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* MISSION */}
      <section className="ab-section ab-mission">
        <div className="ab-section-inner">
          <div className="ab-mission-grid">
            <div className="ab-mission-text">
              <h2>Our Mission in<br />the Himalayas</h2>
              <p>My Travel Buddy was built to showcase the breathtaking beauty and rich cultural heritage of Nepal — the Land of the Himalayas. We believe the best way to experience Nepal's majestic peaks, ancient temples, and vibrant culture is through the eyes of passionate local guides.</p>
              <p>Founded in 2024, our platform connects adventurous travelers with experienced Nepali guides who share authentic stories, hidden gems, and meaningful connections that go beyond typical tourist experiences.</p>
              <p>Whether you're trekking to Everest Base Camp, wandering ancient Kathmandu, or watching wildlife in Chitwan — our verified guides ensure safe, culturally respectful, and unforgettable journeys.</p>
            </div>
            <div className="ab-mission-card">
              <div className="ab-mission-card-header">
                <span className="ab-mission-card-icon">🇳🇵</span>
                <div>
                  <h3 className="ab-mission-card-title">Nepal's Impact</h3>
                  <p className="ab-mission-card-sub">Numbers that matter to us</p>
                </div>
              </div>
              <div className="ab-impact-grid">
                {[
                  { num: '200+', label: 'Local Guides' },
                  { num: '25+',  label: 'Destinations' },
                  { num: '15k+', label: 'Happy Travelers' },
                  { num: '4.9★', label: 'Average Rating' },
                ].map(item => (
                  <div key={item.label} className="ab-impact-item">
                    <span className="ab-impact-num">{item.num}</span>
                    <div className="ab-impact-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="ab-section ab-values">
        <div className="ab-section-inner">
          <div className="ab-section-header">
            <span className="ab-section-eyebrow">What We Stand For</span>
            <h2 className="ab-section-title">Our Nepali Values</h2>
            <p className="ab-section-sub">The principles that guide every journey we help create</p>
          </div>
          <div className="ab-values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="ab-value-card">
                <span className="ab-value-icon">{v.icon}</span>
                <h3 className="ab-value-title">{v.title}</h3>
                <p className="ab-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY NEPAL */}
      <section className="ab-section ab-why">
        <div className="ab-section-inner">
          <div className="ab-section-header">
            <span className="ab-section-eyebrow">Why Nepal</span>
            <h2 className="ab-section-title">A Country Like No Other</h2>
            <p className="ab-section-sub">Eight superlatives. One destination.</p>
          </div>
          <div className="ab-why-grid">
            {WHY.map(w => (
              <div key={w.title} className="ab-why-card">
                <div className="ab-why-icon-wrap">{w.icon}</div>
                <h3 className="ab-why-title">{w.title}</h3>
                <p className="ab-why-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="ab-section ab-story">
        <div className="ab-section-inner">
          <div className="ab-story-grid">
            <div className="ab-story-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800&q=80"
                alt="Local guide in Nepal"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'; }}
              />
              <div className="ab-story-img-badge">
                <strong>Est. 2024</strong>
                Kathmandu, Nepal 🇳🇵
              </div>
            </div>
            <div className="ab-story-text">
              <h2>Built by Nepalis,<br />for the World</h2>
              <p>My Travel Buddy was born out of a simple belief: the best Nepal experiences come from people who truly love Nepal. Our founding team — all Nepali travel professionals — saw too many tourists missing the real magic because they were following generic itineraries.</p>
              <p>So we built a platform that puts local knowledge first, makes verified guides easy to find, and ensures every booking supports the communities that make Nepal so special.</p>
              <div className="ab-story-features">
                {[
                  { icon: '✅', title: 'Verified Guides',    sub: 'Background-checked & NTB certified' },
                  { icon: '🔒', title: 'Secure Bookings',   sub: 'Bank-level encrypted transactions' },
                  { icon: '💬', title: '24/7 Support',      sub: 'Real humans, round the clock' },
                  { icon: '♻️', title: 'Eco Commitment',    sub: 'Registered sustainable tourism partners' },
                ].map(f => (
                  <div key={f.title} className="ab-story-feature">
                    <div className="ab-story-feature-icon">{f.icon}</div>
                    <div>
                      <div className="ab-story-feature-text">{f.title}</div>
                      <div className="ab-story-feature-sub">{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ab-cta">
        <div className="ab-cta-inner">
          <h2>Experience Nepal<br /><em>Like Never Before</em></h2>
          <p>Whether you're a first-time visitor or a seasoned trekker — discover Nepal's magic with our expert local guides.</p>
          <div className="ab-cta-btns">
            <Link to="/register" className="ab-cta-a">Start Your Nepal Journey</Link>
            <Link to="/apply-guide" className="ab-cta-b">Become a Local Guide</Link>
          </div>
        </div>
      </section>

    </div>
  </>
);

export default About;
