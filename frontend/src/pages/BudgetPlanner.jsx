import { useState, useEffect } from 'react';

// ─── Budget category data ───────────────────────────────────────────────
const CATEGORIES = {
  accommodation: {
    name: 'Accommodation', icon: '🏨',
    items: {
      'Budget Hotel / Guesthouse': { min: 1200, max: 2500, rec: 1800 },
      'Standard 3-star Hotel':     { min: 3000, max: 6000, rec: 4000 },
      'Luxury Resort (4–5 star)':  { min: 7000, max: 20000, rec: 10000 },
      'Mountain Teahouse':         { min: 400,  max: 1200,  rec: 700   },
    },
  },
  transport: {
    name: 'Transport', icon: '🚌',
    items: {
      'Domestic Flight (one way)':  { min: 4000, max: 8000,  rec: 5500  },
      'Tourist Bus (intercity)':    { min: 500,  max: 1500,  rec: 800   },
      'Private Car / Van':          { min: 2000, max: 5000,  rec: 3200  },
      'Mountain Flight (Everest)':  { min: 8000, max: 12000, rec: 10000 },
      'Local Taxi / Tuk-tuk':       { min: 150,  max: 600,   rec: 350   },
    },
  },
  food: {
    name: 'Food & Drinks', icon: '🍽️',
    items: {
      'Street Food / Dal Bhat':       { min: 200, max: 500,  rec: 350 },
      'Mid-range Restaurant':         { min: 600, max: 1400, rec: 900 },
      'Bottled Water (per day)':       { min: 60,  max: 150,  rec: 100 },
      'Coffee & Snacks':               { min: 150, max: 500,  rec: 300 },
    },
  },
  activities: {
    name: 'Activities', icon: '🎭',
    items: {
      'Temple / Durbar Square Entry': { min: 500,  max: 2000, rec: 1000 },
      'National Park Entry (ACAP etc.)': { min: 1500, max: 4000, rec: 2000 },
      'Guided Trek (per day)':        { min: 2000, max: 5000, rec: 3000 },
      'Paragliding (Pokhara)':        { min: 6000, max: 9000, rec: 7500 },
      'White Water Rafting':          { min: 2500, max: 5000, rec: 3500 },
    },
  },
  permits: {
    name: 'Permits & Fees', icon: '📋',
    items: {
      'TIMS Card':               { min: 1000, max: 2000, rec: 1000 },
      'Trekking Permit (ACAP)':  { min: 2000, max: 3000, rec: 2000 },
      'Sagarmatha NP Permit':    { min: 3000, max: 3000, rec: 3000 },
      'Nepal Tourist Visa':      { min: 4500, max: 9000, rec: 5000 },
      'Travel Insurance (trip)': { min: 1500, max: 4000, rec: 2500 },
    },
  },
  misc: {
    name: 'Miscellaneous', icon: '🛍️',
    items: {
      'Tips & Gratuities (total)': { min: 500,  max: 2500, rec: 1500 },
      'Shopping & Souvenirs':      { min: 1000, max: 8000, rec: 3000 },
      'SIM Card / Data':           { min: 300,  max: 800,  rec: 500  },
      'Emergency Fund':            { min: 2000, max: 10000,rec: 5000 },
    },
  },
};

const DESTINATION_BUDGETS = {
  kathmandu: { label: 'Kathmandu',        daily: 5300  },
  pokhara:   { label: 'Pokhara',          daily: 4600  },
  everest:   { label: 'Everest Region',   daily: 8500  },
  chitwan:   { label: 'Chitwan',          daily: 5500  },
  lumbini:   { label: 'Lumbini',          daily: 2600  },
  annapurna: { label: 'Annapurna Circuit',daily: 6500  },
};

const CAT_COLORS = {
  accommodation: '#16a34a',
  transport:     '#3b82f6',
  food:          '#f59e0b',
  activities:    '#8b5cf6',
  permits:       '#0891b2',
  misc:          '#64748b',
};

// ─── CSS ────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.bpp-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f8faf8; min-height: 100vh;
  padding-top: 68px; color: #0f172a;
}

@keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes barGrow { from{width:0} to{width:var(--w)} }

/* ── HERO ── */
.bpp-hero {
  background: linear-gradient(160deg, #071a0f 0%, #0a2818 45%, #1a4a2a 100%);
  padding: 72px 24px 52px; text-align: center; position: relative; overflow: hidden;
}
.bpp-hero::before {
  content:''; position:absolute; inset:0;
  background:url('https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=40') center/cover;
  opacity:0.05;
}
.bpp-hero-sil {
  position:absolute; bottom:0; left:0; right:0; height:90px;
  clip-path:polygon(0%100%,5%72%,11%82%,17%55%,24%70%,31%38%,38%58%,44%24%,50%42%,56%15%,62%38%,68%28%,74%48%,81%20%,88%44%,94%32%,100%50%,100%100%);
  background:rgba(7,26,15,0.6);
}
.bpp-hero-inner { position:relative; z-index:2; max-width:680px; margin:0 auto; }
.bpp-pill {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(255,255,255,0.08); backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,0.14); border-radius:100px;
  padding:7px 18px; font-size:11px; font-weight:700;
  color:rgba(255,255,255,0.8); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:1.5rem;
}
.bpp-pill-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; }
.bpp-hero h1 {
  font-family:'Fraunces',serif; font-size:clamp(2.2rem,6vw,4rem);
  font-weight:300; color:#fff; line-height:1.1; letter-spacing:-0.02em; margin-bottom:1rem;
}
.bpp-hero h1 em { font-style:italic; color:#4ade80; }
.bpp-hero p { color:rgba(255,255,255,0.55); font-size:1rem; line-height:1.75; }

/* ── BODY ── */
.bpp-body { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }

/* ── TWO-COLUMN LAYOUT ── */
.bpp-layout {
  display: grid; grid-template-columns: 1fr 360px; gap: 1.75rem; align-items: start;
}
@media(max-width:900px){ .bpp-layout { grid-template-columns: 1fr; } }

/* ── CARD ── */
.bpp-card {
  background: #fff; border-radius: 20px; border: 1px solid #e8f5ee;
  padding: 1.75rem; margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(22,163,74,0.06);
  animation: fadeUp 0.35s ease forwards;
}
.bpp-card-title {
  font-family:'Fraunces',serif; font-size:1.1rem; font-weight:400;
  color:#0f172a; margin-bottom:1.25rem; display:flex; align-items:center; gap:8px;
}

/* ── LABELS & INPUTS ── */
.bpp-label { font-size:11px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#6b7280; margin-bottom:6px; display:block; }
.bpp-input, .bpp-select {
  width:100%; padding:10px 14px; border:1.5px solid #d1fae5;
  border-radius:10px; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif;
  color:#0f172a; outline:none; background:#fff; transition:border 0.15s;
}
.bpp-input:focus, .bpp-select:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.08); }

/* ── CONFIG GRID ── */
.bpp-config-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; }

/* ── CATEGORY ACCORDION ── */
.bpp-cat-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 0; cursor:pointer; user-select:none;
  border-bottom:1px solid #f1f5f9;
}
.bpp-cat-head:first-of-type { padding-top: 0; }
.bpp-cat-left { display:flex; align-items:center; gap:10px; }
.bpp-cat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
.bpp-cat-name { font-size:14px; font-weight:700; color:#0f172a; }
.bpp-cat-total { font-size:13px; font-weight:800; color:#0f172a; }
.bpp-cat-chevron { font-size:12px; color:#94a3b8; transition:transform 0.2s; }
.bpp-cat-chevron.open { transform:rotate(180deg); }
.bpp-cat-items { padding:12px 0 4px; display:flex; flex-direction:column; gap:10px; }
.bpp-item-row { display:grid; grid-template-columns:1fr auto; align-items:center; gap:12px; }
.bpp-item-label { font-size:13px; color:#374151; font-weight:500; }
.bpp-item-hint { font-size:10px; color:#94a3b8; margin-top:1px; }
.bpp-item-input {
  width:120px; padding:8px 12px; border:1.5px solid #d1fae5; border-radius:8px;
  font-size:13px; font-weight:700; color:#0f172a;
  font-family:'Plus Jakarta Sans',sans-serif; outline:none; text-align:right;
  transition:border 0.15s;
}
.bpp-item-input:focus { border-color:#16a34a; }

/* ── CUSTOM EXPENSES ── */
.bpp-custom-row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.bpp-custom-name {
  flex:1; padding:9px 12px; border:1.5px solid #d1fae5; border-radius:8px;
  font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; outline:none;
  color:#0f172a; transition:border 0.15s;
}
.bpp-custom-name:focus { border-color:#16a34a; }
.bpp-custom-amt {
  width:110px; padding:9px 12px; border:1.5px solid #d1fae5; border-radius:8px;
  font-size:13px; font-weight:700; color:#0f172a; text-align:right;
  font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border 0.15s;
}
.bpp-custom-amt:focus { border-color:#16a34a; }
.bpp-del-btn {
  width:30px; height:30px; border-radius:50%; border:1.5px solid #fecaca;
  background:none; cursor:pointer; color:#f87171; font-size:12px;
  display:flex; align-items:center; justify-content:center; transition:all 0.15s;
}
.bpp-del-btn:hover { background:#fef2f2; border-color:#dc2626; }
.bpp-add-custom {
  width:100%; padding:10px; border:1.5px dashed #d1fae5; border-radius:10px;
  background:none; color:#16a34a; font-size:13px; font-weight:700;
  cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; margin-top:4px;
  transition:all 0.15s;
}
.bpp-add-custom:hover { background:#f0fdf4; border-style:solid; }

/* ── SIDEBAR: SUMMARY ── */
.bpp-sidebar { position: sticky; top: 88px; }

.bpp-total-card {
  background: linear-gradient(135deg, #071a0f, #0a2818);
  border-radius: 20px; padding: 1.75rem;
  margin-bottom: 1.5rem; color: #fff;
}
.bpp-total-header { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:0.5rem; }
.bpp-total-val {
  font-family:'Fraunces',serif; font-size:2.4rem; font-weight:600; color:#fff;
  line-height:1; margin-bottom:1.25rem;
}
.bpp-status-badge {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 14px; border-radius:100px; font-size:12px; font-weight:700; margin-bottom:1.25rem;
}
.bpp-status-badge.under { background:rgba(74,222,128,0.15); color:#4ade80; border:1px solid rgba(74,222,128,0.25); }
.bpp-status-badge.over  { background:rgba(239,68,68,0.15);  color:#fca5a5; border:1px solid rgba(239,68,68,0.25); }
.bpp-budget-track { height:8px; background:rgba(255,255,255,0.08); border-radius:100px; overflow:hidden; margin-top:8px; }
.bpp-budget-fill  { height:100%; border-radius:100px; transition:width 0.6s cubic-bezier(0.22,1,0.36,1); }
.bpp-track-labels { display:flex; justify-content:space-between; margin-top:6px; }
.bpp-track-label  { font-size:10px; color:rgba(255,255,255,0.35); }

/* ── PIE / BAR BREAKDOWN ── */
.bpp-breakdown { display:flex; flex-direction:column; gap:10px; margin-top:1rem; }
.bpp-breakdown-row { display:flex; align-items:center; gap:10px; }
.bpp-breakdown-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.bpp-breakdown-label { font-size:12px; color:rgba(255,255,255,0.6); flex:1; }
.bpp-breakdown-val { font-size:12px; font-weight:700; color:#fff; }
.bpp-breakdown-bar-track { height:4px; background:rgba(255,255,255,0.08); border-radius:100px; overflow:hidden; margin-top:4px; flex:1; }
.bpp-breakdown-bar { height:100%; border-radius:100px; }

/* ── Per-day card ── */
.bpp-per-day-card {
  background:#fff; border:1px solid #e8f5ee; border-radius:16px; padding:1.25rem;
  margin-bottom:1.25rem; box-shadow:0 2px 8px rgba(22,163,74,0.05);
}
.bpp-per-day-title { font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:0.75rem; }
.bpp-per-day-val { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:600; color:#0f172a; }
.bpp-per-day-compare { font-size:12px; color:#94a3b8; margin-top:4px; }

/* ── COPY BUDGET BTN ── */
.bpp-copy-btn {
  width:100%; padding:13px; background:#16a34a; color:#fff; border:none;
  border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.2s; letter-spacing:0.01em;
}
.bpp-copy-btn:hover { background:#15803d; transform:translateY(-1px); }
.bpp-copy-btn.copied { background:#0a2818; }

/* ── RESPONSIVE ── */
@media(max-width:640px){
  .bpp-config-grid { grid-template-columns:1fr 1fr; }
  .bpp-item-row { grid-template-columns:1fr; }
  .bpp-item-input { width:100%; text-align:left; }
}
`;

// ─── Component ───────────────────────────────────────────────────────────
export default function BudgetPlanner() {
  const [totalBudget, setTotalBudget]   = useState('');
  const [destination, setDestination]   = useState('kathmandu');
  const [days, setDays]                 = useState(7);
  const [travelers, setTravelers]       = useState(1);
  const [expenses, setExpenses]         = useState({});
  const [custom, setCustom]             = useState([]);
  const [openCats, setOpenCats]         = useState({ accommodation: true, transport: false, food: false, activities: false, permits: false, misc: false });
  const [copied, setCopied]             = useState(false);

  // Initialize expenses with recommended values
  useEffect(() => {
    const init = {};
    Object.keys(CATEGORIES).forEach(catKey => {
      init[catKey] = {};
      Object.entries(CATEGORIES[catKey].items).forEach(([item, data]) => {
        init[catKey][item] = data.rec;
      });
    });
    setExpenses(init);
  }, []);

  // Auto-fill from destination
  useEffect(() => {
    const dest = DESTINATION_BUDGETS[destination];
    if (!dest) return;
    // Rough split: 35% hotel, 20% food, 20% transport, 15% activities, 10% misc
    const dailyTotal = dest.daily;
    setExpenses(prev => ({
      ...prev,
      accommodation: Object.fromEntries(
        Object.entries(CATEGORIES.accommodation.items).map(([k, v]) => [k, v.rec])
      ),
    }));
  }, [destination]);

  // ── Computed totals ──────────────────────────────────────────────────
  const catTotals = {};
  let grandTotal = 0;
  Object.keys(CATEGORIES).forEach(catKey => {
    let sum = 0;
    if (expenses[catKey]) {
      Object.values(expenses[catKey]).forEach(v => { sum += Number(v) || 0; });
    }
    // Multiply by days & travelers for per-day categories
    const multiplied = ['accommodation','food'].includes(catKey)
      ? sum * days * (catKey === 'food' ? travelers : 1)
      : sum;
    catTotals[catKey] = multiplied;
    grandTotal += multiplied;
  });
  custom.forEach(c => { grandTotal += Number(c.amount) || 0; });

  const budget    = parseFloat(totalBudget) || 0;
  const remaining = budget - grandTotal;
  const pct       = budget > 0 ? Math.min((grandTotal / budget) * 100, 100) : 0;
  const perDay    = days > 0 ? Math.round(grandTotal / days) : 0;
  const barColor  = remaining < 0 ? '#ef4444' : remaining < budget * 0.1 ? '#f59e0b' : '#4ade80';

  const handleExpense = (catKey, item, val) => {
    setExpenses(prev => ({
      ...prev,
      [catKey]: { ...prev[catKey], [item]: Number(val) || 0 },
    }));
  };

  const addCustom = () => setCustom(prev => [...prev, { name: '', amount: '' }]);
  const updateCustom = (i, field, val) => setCustom(prev => prev.map((c, ci) => ci === i ? { ...c, [field]: val } : c));
  const removeCustom = (i) => setCustom(prev => prev.filter((_, ci) => ci !== i));

  const handleCopy = () => {
    const lines = [
      `Nepal Trip Budget — ${DESTINATION_BUDGETS[destination]?.label}`,
      `${days} days × ${travelers} traveler(s)`,
      '─────────────────────',
      ...Object.entries(catTotals).map(([k, v]) => `${CATEGORIES[k].name}: NPR ${v.toLocaleString()}`),
      ...custom.map(c => `${c.name || 'Custom'}: NPR ${Number(c.amount).toLocaleString()}`),
      '─────────────────────',
      `TOTAL: NPR ${grandTotal.toLocaleString()}`,
      budget > 0 ? `Budget: NPR ${budget.toLocaleString()} | Remaining: NPR ${remaining.toLocaleString()}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="bpp-root">

        {/* ── HERO ── */}
        <section className="bpp-hero">
          <div className="bpp-hero-sil" />
          <div className="bpp-hero-inner">
            <div className="bpp-pill"><span className="bpp-pill-dot" /> Budget Planner</div>
            <h1>Plan your Nepal<br /><em>trip budget</em></h1>
            <p>Estimate every expense — accommodation, food, permits, activities —<br />and see exactly how far your budget goes.</p>
          </div>
        </section>

        <div className="bpp-body">
          <div className="bpp-layout">

            {/* ── LEFT COLUMN ── */}
            <div>

              {/* Trip config */}
              <div className="bpp-card">
                <div className="bpp-card-title">⚙️ Trip Configuration</div>
                <div className="bpp-config-grid">
                  <div>
                    <label className="bpp-label">Destination</label>
                    <select className="bpp-select" value={destination} onChange={e => setDestination(e.target.value)}>
                      {Object.entries(DESTINATION_BUDGETS).map(([key, d]) => (
                        <option key={key} value={key}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="bpp-label">Total Budget (NPR)</label>
                    <input
                      type="number" className="bpp-input"
                      placeholder="e.g. 75000"
                      value={totalBudget} onChange={e => setTotalBudget(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="bpp-label">Duration (days)</label>
                    <select className="bpp-select" value={days} onChange={e => setDays(Number(e.target.value))}>
                      {[1,2,3,4,5,6,7,8,10,12,14,21].map(n => (
                        <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="bpp-label">Travelers</label>
                    <select className="bpp-select" value={travelers} onChange={e => setTravelers(Number(e.target.value))}>
                      {[1,2,3,4,5,6,8,10].map(n => (
                        <option key={n} value={n}>{n} person{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Expense categories */}
              {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                <div key={catKey} className="bpp-card">
                  <div
                    className="bpp-cat-head"
                    onClick={() => setOpenCats(p => ({ ...p, [catKey]: !p[catKey] }))}
                  >
                    <div className="bpp-cat-left">
                      <div
                        className="bpp-cat-icon"
                        style={{ background: `${CAT_COLORS[catKey]}18` }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <div className="bpp-cat-name">{cat.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                          {['accommodation','food'].includes(catKey)
                            ? `× ${days} days${catKey === 'food' ? ` × ${travelers} pax` : ''}`
                            : 'one-time costs'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="bpp-cat-total">NPR {catTotals[catKey].toLocaleString()}</span>
                      <span className={`bpp-cat-chevron${openCats[catKey] ? ' open' : ''}`}>▾</span>
                    </div>
                  </div>

                  {openCats[catKey] && (
                    <div className="bpp-cat-items">
                      {Object.entries(cat.items).map(([item, data]) => (
                        <div key={item} className="bpp-item-row">
                          <div>
                            <div className="bpp-item-label">{item}</div>
                            <div className="bpp-item-hint">
                              Suggested: NPR {data.rec.toLocaleString()} &nbsp;(Range: {data.min.toLocaleString()}–{data.max.toLocaleString()})
                            </div>
                          </div>
                          <input
                            type="number"
                            className="bpp-item-input"
                            value={expenses[catKey]?.[item] ?? data.rec}
                            onChange={e => handleExpense(catKey, item, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Custom expenses */}
              <div className="bpp-card">
                <div className="bpp-card-title">✏️ Custom Expenses</div>
                {custom.map((c, i) => (
                  <div key={i} className="bpp-custom-row">
                    <input
                      className="bpp-custom-name"
                      placeholder="Expense name"
                      value={c.name}
                      onChange={e => updateCustom(i, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      className="bpp-custom-amt"
                      placeholder="Amount"
                      value={c.amount}
                      onChange={e => updateCustom(i, 'amount', e.target.value)}
                    />
                    <button className="bpp-del-btn" onClick={() => removeCustom(i)}>✕</button>
                  </div>
                ))}
                <button className="bpp-add-custom" onClick={addCustom}>+ Add Custom Expense</button>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="bpp-sidebar">

              {/* Total card */}
              <div className="bpp-total-card">
                <div className="bpp-total-header">Estimated Total</div>
                <div className="bpp-total-val">NPR {grandTotal.toLocaleString()}</div>

                {budget > 0 && (
                  <>
                    <div className={`bpp-status-badge ${remaining < 0 ? 'over' : 'under'}`}>
                      {remaining < 0
                        ? `⚠️ Over by NPR ${Math.abs(remaining).toLocaleString()}`
                        : `✓ NPR ${remaining.toLocaleString()} remaining`
                      }
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                      Budget: NPR {budget.toLocaleString()}
                    </div>
                    <div className="bpp-budget-track">
                      <div
                        className="bpp-budget-fill"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                    </div>
                    <div className="bpp-track-labels">
                      <span className="bpp-track-label">0</span>
                      <span className="bpp-track-label" style={{ color: barColor }}>{pct.toFixed(0)}% used</span>
                      <span className="bpp-track-label">NPR {budget.toLocaleString()}</span>
                    </div>
                  </>
                )}

                {/* Category breakdown bars */}
                <div className="bpp-breakdown">
                  {Object.entries(catTotals).map(([catKey, val]) => {
                    const pctOfTotal = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
                    return (
                      <div key={catKey}>
                        <div className="bpp-breakdown-row">
                          <div className="bpp-breakdown-dot" style={{ background: CAT_COLORS[catKey] }} />
                          <span className="bpp-breakdown-label">{CATEGORIES[catKey].name}</span>
                          <span className="bpp-breakdown-val">NPR {val.toLocaleString()}</span>
                        </div>
                        <div className="bpp-breakdown-bar-track">
                          <div
                            className="bpp-breakdown-bar"
                            style={{ width: `${pctOfTotal}%`, background: CAT_COLORS[catKey] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per day card */}
              <div className="bpp-per-day-card">
                <div className="bpp-per-day-title">📅 Per day (average)</div>
                <div className="bpp-per-day-val">NPR {perDay.toLocaleString()}</div>
                <div className="bpp-per-day-compare">
                  {DESTINATION_BUDGETS[destination]
                    ? `Typical for ${DESTINATION_BUDGETS[destination].label}: NPR ${DESTINATION_BUDGETS[destination].daily.toLocaleString()}/day`
                    : ''}
                </div>
              </div>

              {/* Copy summary */}
              <button
                className={`bpp-copy-btn${copied ? ' copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied to clipboard!' : '📋 Copy Budget Summary'}
              </button>

              {/* Tip card */}
              <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 16, padding: '1.25rem', marginTop: '1.25rem' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  💡 Nepal Budget Tips
                </div>
                {[
                  'Carry small-denomination NPR notes in trekking areas.',
                  'ATMs available in Kathmandu & Pokhara — limited on trails.',
                  'Bargaining is normal in local markets — aim for ~30% off.',
                  'Budget extra 15–20% as emergency buffer.',
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0, fontSize: 13 }}>•</span>
                    <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.55 }}>{tip}</span>
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
