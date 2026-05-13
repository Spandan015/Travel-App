import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Static fallback rates (NPR base) ─────────────────────────────────
const STATIC = {
  NPR: { rate: 1,     symbol: 'Rs',  name: 'Nepalese Rupee',     flag: '🇳🇵' },
  USD: { rate: 133.5, symbol: '$',   name: 'US Dollar',          flag: '🇺🇸' },
  EUR: { rate: 145.2, symbol: '€',   name: 'Euro',               flag: '🇪🇺' },
  GBP: { rate: 168.8, symbol: '£',   name: 'British Pound',      flag: '🇬🇧' },
  AUD: { rate: 89.4,  symbol: 'A$',  name: 'Australian Dollar',  flag: '🇦🇺' },
  CAD: { rate: 98.7,  symbol: 'C$',  name: 'Canadian Dollar',    flag: '🇨🇦' },
  JPY: { rate: 0.91,  symbol: '¥',   name: 'Japanese Yen',       flag: '🇯🇵' },
  CNY: { rate: 18.8,  symbol: '¥',   name: 'Chinese Yuan',       flag: '🇨🇳' },
  INR: { rate: 1.6,   symbol: '₹',   name: 'Indian Rupee',       flag: '🇮🇳' },
  SGD: { rate: 99.2,  symbol: 'S$',  name: 'Singapore Dollar',   flag: '🇸🇬' },
  THB: { rate: 3.85,  symbol: '฿',   name: 'Thai Baht',          flag: '🇹🇭' },
  MYR: { rate: 28.9,  symbol: 'RM',  name: 'Malaysian Ringgit',  flag: '🇲🇾' },
  KRW: { rate: 0.099, symbol: '₩',   name: 'Korean Won',         flag: '🇰🇷' },
  CHF: { rate: 149.3, symbol: 'Fr',  name: 'Swiss Franc',        flag: '🇨🇭' },
  SAR: { rate: 35.6,  symbol: '﷼',  name: 'Saudi Riyal',        flag: '🇸🇦' },
  AED: { rate: 36.3,  symbol: 'د.إ', name: 'UAE Dirham',         flag: '🇦🇪' },
};

const POPULAR = [
  { from: 'USD', to: 'NPR', amount: 100 },
  { from: 'EUR', to: 'NPR', amount: 100 },
  { from: 'GBP', to: 'NPR', amount: 100 },
  { from: 'INR', to: 'NPR', amount: 1000 },
  { from: 'AUD', to: 'NPR', amount: 100 },
  { from: 'CNY', to: 'NPR', amount: 500 },
];

const TREKKING_COSTS = [
  { item: 'Tea house meal (dal bhat)',       nprMin: 250, nprMax: 500  },
  { item: 'Budget hotel (per night)',         nprMin: 500, nprMax: 1500 },
  { item: 'Guide (per day)',                 nprMin: 2500,nprMax: 4000 },
  { item: 'Porter (per day)',                nprMin: 1500,nprMax: 2500 },
  { item: 'Local bus (intercity)',           nprMin: 500, nprMax: 1200 },
  { item: 'SIM card + data',                 nprMin: 300, nprMax: 600  },
  { item: 'Bottled water (1L)',              nprMin: 40,  nprMax: 150  },
  { item: 'Paragliding (Pokhara)',           nprMin: 6500,nprMax: 8500 },
];

// ─── CSS ────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ce-root {
  font-family: 'Roboto', sans-serif;
  background: #f8faf8; min-height: 100vh;
  padding-top: 68px; color: #0f172a;
}

@keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes resultIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }

/* ── HERO ── */
.ce-hero {
  background: linear-gradient(160deg, #071a0f 0%, #0a2818 50%, #1a4a2a 100%);
  padding: 72px 24px 52px; text-align: center; position: relative; overflow: hidden;
}
.ce-hero::before {
  content:''; position:absolute; inset:0;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.018' fill-rule='evenodd'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/svg%3E");
}
.ce-hero-sil {
  position:absolute; bottom:0; left:0; right:0; height:80px;
  clip-path:polygon(0%100%,6%70%,12%80%,19%52%,26%68%,33%36%,40%56%,47%20%,54%44%,61%16%,68%40%,75%28%,82%50%,90%22%,96%40%,100%55%,100%100%);
  background:rgba(7,26,15,0.5);
}
.ce-hero-inner { position:relative; z-index:2; max-width:660px; margin:0 auto; }
.ce-pill {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(255,255,255,0.08); backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,0.14); border-radius:100px;
  padding:7px 18px; font-size:11px; font-weight:700;
  color:rgba(255,255,255,0.8); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:1.5rem;
}
.ce-pill-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; animation:pulse 2s infinite; }
.ce-hero h1 {
  font-family:'Fraunces',serif; font-size:clamp(2.2rem,6vw,4rem);
  font-weight:300; color:#fff; line-height:1.1; letter-spacing:-0.02em; margin-bottom:1rem;
}
.ce-hero h1 em { font-style:italic; color:#4ade80; }
.ce-hero p { color:rgba(255,255,255,0.5); font-size:1rem; line-height:1.75; margin-bottom:0.5rem; }
.ce-live-badge {
  display:inline-flex; align-items:center; gap:6px;
  font-size:11px; color:rgba(255,255,255,0.35); margin-top:4px;
}
.ce-live-dot { width:5px; height:5px; border-radius:50%; background:#4ade80; animation:pulse 2s infinite; }

/* ── BODY ── */
.ce-body { max-width: 960px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }

/* ── CARD ── */
.ce-card {
  background: #fff; border-radius: 20px; border: 1px solid #e8f5ee;
  padding: 1.75rem; margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(22,163,74,0.06);
  animation: fadeUp 0.35s ease forwards;
}
.ce-card-title {
  font-family:'Fraunces',serif; font-size:1.1rem; font-weight:400;
  color:#0f172a; margin-bottom:1.5rem; display:flex; align-items:center; gap:8px;
}

/* ── CONVERTER ── */
.ce-converter {
  display: grid;
  grid-template-columns: 1fr 64px 1fr;
  align-items: end; gap: 20px;
}
@media(max-width:640px){ .ce-converter { grid-template-columns:1fr; } .ce-swap-col { display:flex; justify-content:center; margin:4px 0; } }
.ce-field-label { font-size:11px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#6b7280; margin-bottom:6px; display:block; }

.ce-select {
  width:100%; padding:11px 36px 11px 14px;
  border:1.5px solid #d1fae5; border-radius:10px;
  font-size:14px; font-family:'Roboto',sans-serif;
  color:#0f172a; outline:none; background:#fff;
  -webkit-appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 14px center;
  margin-bottom: 10px; cursor:pointer; transition:border 0.15s;
}
.ce-select:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.08); }

.ce-amount-wrap { position:relative; }
.ce-currency-symbol {
  position:absolute; left:14px; top:50%; transform:translateY(-50%);
  font-size:14px; font-weight:700; color:#16a34a;
}
.ce-amount-input {
  width:100%; padding:12px 14px 12px 38px;
  border:1.5px solid #d1fae5; border-radius:10px;
  font-size:1rem; font-weight:700;
  font-family:'Roboto',sans-serif; color:#0f172a;
  outline:none; transition:border 0.15s;
}
.ce-amount-input:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.08); }

.ce-result-box {
  width:100%; padding:12px 14px; min-height:48px;
  border:1.5px solid #d1fae5; border-radius:10px;
  background:#f0fdf4; display:flex; align-items:center;
  font-size:1rem; font-weight:700; color:#0f172a;
}
.ce-result-box.has-result { animation:resultIn 0.3s ease; }

.ce-swap-col { display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:10px; }
.ce-swap-btn {
  width:48px; height:48px; border-radius:50%;
  background:#16a34a; color:#fff; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:1.2rem; transition:all 0.2s;
  box-shadow:0 4px 16px rgba(22,163,74,0.3);
}
.ce-swap-btn:hover { background:#15803d; transform:scale(1.1) rotate(180deg); }

/* ── BIG RESULT CARD ── */
.ce-result-highlight {
  background:linear-gradient(135deg,#071a0f,#0a2818);
  border-radius:16px; padding:20px 24px; margin-top:1.5rem;
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;
}
.ce-result-main {
  font-family:'Fraunces',serif; font-size:1.8rem; font-weight:600; color:#fff; line-height:1.1;
}
.ce-result-rate { font-size:12px; color:rgba(255,255,255,0.45); margin-top:4px; }
.ce-result-tag {
  background:rgba(74,222,128,0.12); color:#4ade80;
  border:1px solid rgba(74,222,128,0.2); border-radius:100px;
  padding:6px 14px; font-size:12px; font-weight:700; white-space:nowrap;
}

/* ── POPULAR CONVERSIONS ── */
.ce-pop-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;
}
.ce-pop-card {
  background:#f8faf8; border:1.5px solid #e8f5ee; border-radius:14px;
  padding:14px; text-align:center; cursor:pointer; transition:all 0.2s;
}
.ce-pop-card:hover { border-color:#bbf7d0; transform:translateY(-3px); box-shadow:0 8px 24px rgba(22,163,74,0.1); }
.ce-pop-from { font-size:12px; font-weight:600; color:#64748b; margin-bottom:4px; }
.ce-pop-to {
  font-family:'Fraunces',serif; font-size:1.3rem; font-weight:600; color:#0f172a; margin:2px 0;
}
.ce-pop-rate { font-size:10px; color:#94a3b8; }
.ce-pop-flags { font-size:1rem; margin-bottom:4px; }

/* ── TREKKING COST TABLE ── */
.ce-trek-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 0; border-bottom:1px solid #f1f5f9; gap:1rem; flex-wrap:wrap;
}
.ce-trek-row:last-child { border-bottom:none; padding-bottom:0; }
.ce-trek-item { font-size:13px; color:#374151; font-weight:500; flex:1; }
.ce-trek-nprrange { font-size:12px; color:#94a3b8; }
.ce-trek-converted { font-size:14px; font-weight:800; color:#16a34a; min-width:80px; text-align:right; }

/* ── INFO GRID ── */
.ce-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
@media(max-width:600px){ .ce-info-grid{grid-template-columns:1fr;} }
.ce-info-title { font-size:14px; font-weight:700; color:#0f172a; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.ce-info-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
.ce-info-list li { font-size:13px; color:#64748b; display:flex; align-items:flex-start; gap:8px; }
.ce-info-list li::before { content:'•'; color:#16a34a; font-weight:700; flex-shrink:0; }
.ce-tip-item { display:flex; align-items:flex-start; gap:10px; background:#f8faf8; border-radius:10px; padding:10px 12px; margin-bottom:8px; }
.ce-tip-icon { font-size:1rem; flex-shrink:0; }
.ce-tip-text { font-size:12px; color:#374151; line-height:1.6; }

/* ── LOADING ── */
.ce-spinner { width:16px; height:16px; border:2px solid #d1fae5; border-top-color:#16a34a; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }

@media(max-width:480px){
  .ce-pop-grid { grid-template-columns:repeat(2,1fr); }
  .ce-result-highlight { flex-direction:column; align-items:flex-start; }
}
`;

// ─── Component ────────────────────────────────────────────────────────
export default function CurrencyExchanger() {
  const [from,       setFrom]       = useState('USD');
  const [to,         setTo]         = useState('NPR');
  const [amount,     setAmount]     = useState('100');
  const [result,     setResult]     = useState(null);
  const [rate,       setRate]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [source,     setSource]     = useState('fallback');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Convert using backend (which uses live API or fallback)
  const convert = useCallback(async (fromCur, toCur, amt) => {
    if (!amt || isNaN(amt) || Number(amt) <= 0) { setResult(null); setRate(null); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/currency/convert`, { params: { from: fromCur, to: toCur, amount: amt }, timeout: 5000 });
      setResult(res.data.result);
      setRate(res.data.rate);
      setSource(res.data.source || 'fallback');
      setLastUpdate(new Date());
    } catch {
      // Use client-side static fallback
      const fromRate = STATIC[fromCur]?.rate || 1;
      const toRate   = STATIC[toCur]?.rate   || 1;
      const r = toRate / fromRate;
      setRate(r);
      setResult(parseFloat((Number(amt) * r).toFixed(4)));
      setSource('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => convert(from, to, amount), 300);
    return () => clearTimeout(timer);
  }, [from, to, amount, convert]);

  const swap = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
    setAmount(result ? String(result) : amount);
  };

  // Convert NPR amount to selected currency for trekking table
  const nprToSelected = (nprAmt) => {
    if (!rate || from === 'NPR' || to === 'NPR') {
      // Find rate from NPR to "to" currency
      const toRate   = STATIC[to]?.rate   || 1;
      const fromRate = STATIC['NPR']?.rate || 1;
      const r = fromRate / toRate;
      return (nprAmt * r).toFixed(2);
    }
    // Approximate: convert NPR → from
    const nprToFrom = (STATIC['NPR']?.rate || 1) / (STATIC[from]?.rate || 1);
    return (nprAmt * nprToFrom).toFixed(2);
  };

  const displayCurrency = from === 'NPR' ? to : from;
  const currencySymbol  = STATIC[displayCurrency]?.symbol || displayCurrency;

  return (
    <>
      <style>{STYLES}</style>
      <div className="ce-root">

        {/* ── HERO ── */}
        <section className="ce-hero">
          <div className="ce-hero-sil" />
          <div className="ce-hero-inner">
            <div className="ce-pill"><span className="ce-pill-dot" /> Currency Exchanger</div>
            <h1>Nepal <em>currency</em><br />converter</h1>
            <p>Instantly convert between NPR and 16+ currencies.<br />Live rates powered by ExchangeRate API.</p>
            <div className="ce-live-badge">
              <span className="ce-live-dot" />
              {source === 'live' ? 'Live rates' : 'Reference rates'} · Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </section>

        <div className="ce-body">

          {/* ── MAIN CONVERTER ── */}
          <div className="ce-card">
            <div className="ce-card-title">💱 Currency Converter</div>

            <div className="ce-converter">
              {/* FROM */}
              <div>
                <label className="ce-field-label">From</label>
                <select className="ce-select" value={from} onChange={e => setFrom(e.target.value)}>
                  {Object.entries(STATIC).map(([code, d]) => (
                    <option key={code} value={code}>{d.flag} {code} — {d.name}</option>
                  ))}
                </select>
                <div className="ce-amount-wrap">
                  <span className="ce-currency-symbol">{STATIC[from]?.symbol}</span>
                  <input
                    type="number" className="ce-amount-input"
                    placeholder="0.00" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* SWAP */}
              <div className="ce-swap-col">
                <button className="ce-swap-btn" onClick={swap} title="Swap currencies">⇄</button>
              </div>

              {/* TO */}
              <div>
                <label className="ce-field-label">To</label>
                <select className="ce-select" value={to} onChange={e => setTo(e.target.value)}>
                  {Object.entries(STATIC).map(([code, d]) => (
                    <option key={code} value={code}>{d.flag} {code} — {d.name}</option>
                  ))}
                </select>
                <div className="ce-result-box" style={{ gap: 8 }}>
                  {loading
                    ? <span className="ce-spinner" />
                    : result !== null
                      ? <>{STATIC[to]?.symbol} {Number(result).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</>
                      : <span style={{ color: '#94a3b8', fontWeight: 400 }}>Enter an amount</span>
                  }
                </div>
              </div>
            </div>

            {/* Big result */}
            {result !== null && amount && (
              <div className="ce-result-highlight">
                <div>
                  <div className="ce-result-main">
                    {STATIC[from]?.symbol}{Number(amount).toLocaleString()} {from} = {STATIC[to]?.symbol}{Number(result).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}
                  </div>
                  {rate && (
                    <div className="ce-result-rate">
                      1 {from} = {rate.toFixed(4)} {to} · 1 {to} = {(1 / rate).toFixed(4)} {from}
                    </div>
                  )}
                </div>
                <div className="ce-result-tag">
                  {source === 'live' ? '📡 Live Rate' : source === 'offline' ? '📋 Reference Rate' : '📊 Est. Rate'}
                </div>
              </div>
            )}
          </div>

          {/* ── POPULAR CONVERSIONS ── */}
          <div className="ce-card">
            <div className="ce-card-title">⭐ Popular Conversions to NPR</div>
            <div className="ce-pop-grid">
              {POPULAR.map((p, i) => {
                const fromRate = STATIC[p.from]?.rate || 1;
                const toRate   = STATIC[p.to]?.rate   || 1;
                const converted = ((p.amount * toRate) / fromRate).toFixed(0);
                return (
                  <div
                    key={i} className="ce-pop-card"
                    onClick={() => { setFrom(p.from); setTo(p.to); setAmount(String(p.amount)); }}
                  >
                    <div className="ce-pop-flags">{STATIC[p.from]?.flag} → {STATIC[p.to]?.flag}</div>
                    <div className="ce-pop-from">{STATIC[p.from]?.symbol}{p.amount.toLocaleString()} {p.from}</div>
                    <div className="ce-pop-to">Rs {Number(converted).toLocaleString()}</div>
                    <div className="ce-pop-rate">1 {p.from} ≈ {((toRate / fromRate)).toFixed(1)} NPR</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TREKKING COST GUIDE ── */}
          <div className="ce-card">
            <div className="ce-card-title">🏔️ Nepal Trekking Cost Reference</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: '1rem' }}>
              Approximate costs in NPR — with equivalent in {displayCurrency} ({currencySymbol}) based on current rate
            </div>
            {TREKKING_COSTS.map((item, i) => (
              <div key={i} className="ce-trek-row">
                <div className="ce-trek-item">{item.item}</div>
                <div className="ce-trek-nprrange">
                  Rs {item.nprMin.toLocaleString()} – {item.nprMax.toLocaleString()}
                </div>
                <div className="ce-trek-converted">
                  ≈ {currencySymbol}{nprToSelected(item.nprMin)}–{nprToSelected(item.nprMax)}
                </div>
              </div>
            ))}
          </div>

          {/* ── INFO ── */}
          <div className="ce-card">
            <div className="ce-card-title">🇳🇵 Nepal Currency Information</div>
            <div className="ce-info-grid">
              <div>
                <div className="ce-info-title">💵 About Nepalese Rupee (NPR)</div>
                <ul className="ce-info-list">
                  <li>1 NPR = 100 Paisa (100 sub-units)</li>
                  <li>Banknotes: 5, 10, 20, 50, 100, 500, 1000 NPR</li>
                  <li>Pegged to Indian Rupee at fixed 1.6 ratio</li>
                  <li>Symbol: ₨ or Rs — ISO code: NPR</li>
                  <li>Issued by Nepal Rastra Bank (central bank)</li>
                </ul>
              </div>
              <div>
                <div className="ce-info-title">💡 Money Tips for Nepal</div>
                {[
                  { icon: '🏦', text: 'Best rates at authorized banks — avoid airport exchangers.' },
                  { icon: '💳', text: 'ATMs widely available in Kathmandu & Pokhara. Limited on trekking trails.' },
                  { icon: '⚠️', text: 'Carry small NPR denominations — change is scarce on high-altitude routes.' },
                  { icon: '📋', text: 'Keep exchange receipts to re-convert NPR when departing Nepal.' },
                ].map((t, i) => (
                  <div key={i} className="ce-tip-item">
                    <span className="ce-tip-icon">{t.icon}</span>
                    <span className="ce-tip-text">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
