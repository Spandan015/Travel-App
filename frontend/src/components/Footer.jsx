import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');

        .ft-root {
          background: #0D1B2E;
          font-family: 'Roboto', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Decorative top border */
        .ft-topbar {
          height: 3px;
          background: linear-gradient(90deg, #1B4F8A 0%, #38B2AC 50%, #1B4F8A 100%);
        }

        /* Subtle background texture */
        .ft-root::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(27,79,138,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .ft-root::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(56,178,172,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .ft-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 24px 0;
          position: relative;
          z-index: 1;
        }

        /* Main grid */
        .ft-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        @media(max-width:1024px){ .ft-grid { grid-template-columns: 1fr 1fr; gap:36px; } }
        @media(max-width:600px) { .ft-grid { grid-template-columns: 1fr; gap:28px; } }

        /* Brand column */
        .ft-brand-logo {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none; margin-bottom: 18px;
        }
        .ft-brand-mark {
          width: 42px; height: 42px; border-radius: 11px;
          background: linear-gradient(135deg, #1B4F8A, #38B2AC);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 16px rgba(27,79,138,0.4);
          flex-shrink: 0;
        }
        .ft-brand-name {
          font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.2px;
          line-height: 1.2;
        }
        .ft-brand-sub {
          font-size: 10px; color: rgba(255,255,255,0.4);
          text-transform: uppercase; letter-spacing: 0.1em; margin-top: 1px;
        }
        .ft-brand-desc {
          font-size: 13.5px; color: rgba(255,255,255,0.45);
          line-height: 1.75; margin-bottom: 22px; font-weight: 400;
          max-width: 280px;
        }

        /* Social icons */
        .ft-socials { display: flex; gap: 8px; }
        .ft-social {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; font-size: 15px;
          transition: all 0.2s; color: rgba(255,255,255,0.5);
        }
        .ft-social:hover {
          background: rgba(56,178,172,0.2);
          border-color: rgba(56,178,172,0.4);
          color: #81E6D9;
          transform: translateY(-2px);
        }

        /* Nav columns */
        .ft-col-title {
          font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.9);
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .ft-col-title::after {
          content: '';
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .ft-links { display: flex; flex-direction: column; gap: 1px; }
        .ft-link {
          font-size: 13.5px; color: rgba(255,255,255,0.45);
          text-decoration: none; padding: 5px 0;
          font-weight: 400; transition: color 0.15s;
          display: flex; align-items: center; gap: 7px;
        }
        .ft-link:hover { color: rgba(255,255,255,0.9); }
        .ft-link-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(56,178,172,0.5); flex-shrink: 0;
          transition: background 0.15s;
        }
        .ft-link:hover .ft-link-dot { background: #38B2AC; }

        /* Nepal badge */
        .ft-nepal-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 30px; padding: 6px 14px;
          font-size: 12px; color: rgba(255,255,255,0.6);
          font-weight: 500; margin-bottom: 14px;
        }

        /* Bottom bar */
        .ft-bottom {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          max-width: 1280px; margin: 0 auto;
          position: relative; z-index: 1;
        }
        .ft-copy {
          font-size: 12.5px; color: rgba(255,255,255,0.3); font-weight: 400;
        }
        .ft-bottom-links {
          display: flex; align-items: center; gap: 20px;
        }
        .ft-bottom-link {
          font-size: 12px; color: rgba(255,255,255,0.3);
          text-decoration: none; transition: color 0.15s;
        }
        .ft-bottom-link:hover { color: rgba(255,255,255,0.7); }
        .ft-bottom-sep {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
        }
      `}</style>

      <footer className="ft-root">
        <div className="ft-topbar" />

        <div className="ft-inner">
          <div className="ft-grid">

            {/* ── Brand column ── */}
            <div>
              <Link to="/" className="ft-brand-logo">
                <div className="ft-brand-mark">🏔</div>
                <div>
                  <div className="ft-brand-name">My Travel Buddy</div>
                  <div className="ft-brand-sub">Explore Nepal</div>
                </div>
              </Link>
              <div className="ft-nepal-badge">
                🇳🇵 Nepal's #1 Travel Platform
              </div>
              <p className="ft-brand-desc">
                Discover Nepal's majestic beauty with authentic local experiences, certified guides, and unforgettable Himalayan adventures.
              </p>
              <div className="ft-socials">
                <a href="#" className="ft-social" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="#" className="ft-social" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="ft-social" aria-label="Twitter">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="#" className="ft-social" aria-label="YouTube">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0D1B2E"/></svg>
                </a>
              </div>
            </div>

            {/* ── Explore column ── */}
            <div>
              <div className="ft-col-title">Explore</div>
              <div className="ft-links">
                {[
                  { label:'Browse Hotels',      to:'/browse-hotels'       },
                  { label:'Travel Packages',    to:'/browse-packages'     },
                  { label:'Local Guides',       to:'/browse-guides'       },
                  { label:'Destinations',       to:'/browse-destinations' },
                  { label:'Travel Blog',        to:'/blog'                },
                ].map(l => (
                  <Link key={l.to} to={l.to} className="ft-link">
                    <span className="ft-link-dot" />{l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Tools column ── */}
            <div>
              <div className="ft-col-title">Tools</div>
              <div className="ft-links">
                {[
                  { label:'Budget Planner',     to:'/budget-planner'     },
                  { label:'Itinerary Planner',  to:'/itinerary-planner'  },
                  { label:'Currency Converter', to:'/currency-exchanger' },
                  { label:'Explore Map',        to:'/browse-destinations'},
                ].map(l => (
                  <Link key={l.to} to={l.to} className="ft-link">
                    <span className="ft-link-dot" />{l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Company column ── */}
            <div>
              <div className="ft-col-title">Company</div>
              <div className="ft-links">
                {[
                  { label:'About Us',           to:'/about'          },
                  { label:'Contact',            to:'/contact'        },
                  { label:'Help & Support',     to:'/contact'        },
                  { label:'Become a Guide',     to:'/apply-guide'    },
                  { label:'Admin Portal',       to:'/admin/login'    },
                ].map(l => (
                  <Link key={l.label} to={l.to} className="ft-link">
                    <span className="ft-link-dot" />{l.label}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <div className="ft-copy">
            © {year} My Travel Buddy. All rights reserved.
          </div>
          <div className="ft-bottom-links">
            <a href="#" className="ft-bottom-link">Privacy Policy</a>
            <div className="ft-bottom-sep" />
            <a href="#" className="ft-bottom-link">Terms of Service</a>
            <div className="ft-bottom-sep" />
            <a href="#" className="ft-bottom-link">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
