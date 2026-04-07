import { useState, useEffect } from 'react';

const BUDGET_CATEGORIES = {
  accommodation: { name:'Accommodation', icon:'🏨', subcategories:{ 'Budget Hotel/Guesthouse':{min:1500,max:2500,recommended:2000}, 'Standard Hotel':{min:3000,max:6000,recommended:4500}, 'Luxury Hotel/Resort':{min:8000,max:20000,recommended:12000}, 'Mountain Teahouse':{min:500,max:1200,recommended:800} } },
  transportation: { name:'Transportation', icon:'🚌', subcategories:{ 'Domestic Flight':{min:4000,max:8000,recommended:5500}, 'Tourist Bus':{min:500,max:1500,recommended:800}, 'Private Car/Van':{min:2000,max:5000,recommended:3500}, 'Mountain Flight':{min:8000,max:12000,recommended:10000} } },
  food: { name:'Food & Drinks', icon:'🍽️', subcategories:{ 'Street Food/Local Eateries':{min:300,max:600,recommended:400}, 'Mid-range Restaurants':{min:600,max:1200,recommended:800}, 'Mineral Water/Beverages':{min:50,max:150,recommended:100} } },
  activities: { name:'Activities & Entrance Fees', icon:'🎭', subcategories:{ 'Temple/Monastery Entry':{min:500,max:1500,recommended:1000}, 'National Park Entry':{min:1500,max:4000,recommended:2500}, 'Cultural Shows/Dances':{min:500,max:1500,recommended:800}, 'Guided Tours':{min:2000,max:5000,recommended:3000} } },
  miscellaneous: { name:'Miscellaneous', icon:'📋', subcategories:{ 'Trekking Permits':{min:1000,max:3000,recommended:1500}, 'Travel Insurance':{min:500,max:2000,recommended:1000}, 'Visa Fee':{min:4000,max:8000,recommended:5000}, 'Tips & Gratuities':{min:500,max:2000,recommended:1000} } },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .bp-root{font-family:'Roboto',sans-serif;background:#f8faf8;min-height:100vh;padding-top:68px;}
  .bp-hero{background:linear-gradient(135deg,#0a2818 0%,#0d3320 40%,#1a4a2a 100%);padding:64px 24px 48px;text-align:center;position:relative;overflow:hidden;}
  .bp-hero-mountains{position:absolute;bottom:0;left:0;right:0;height:35%;clip-path:polygon(0% 100%,8% 65%,15% 72%,22% 50%,30% 65%,38% 35%,45% 52%,52% 22%,60% 48%,67% 38%,74% 58%,82% 28%,90% 50%,100% 38%,100% 100%);background:rgba(255,255,255,0.03);}
  .bp-hero-content{position:relative;z-index:2;max-width:640px;margin:0 auto;}
  .bp-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:6px 16px;font-size:12px;font-weight:500;color:rgba(255,255,255,0.85);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:20px;}
  .bp-badge span{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;}
  .bp-hero h1{font-family:'Roboto',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;color:#fff;margin:0 0 12px;line-height:1.1;letter-spacing:-0.02em;}
  .bp-hero h1 em{font-style:italic;color:#4ade80;}
  .bp-hero p{color:rgba(255,255,255,0.65);font-size:0.95rem;font-weight:300;}
  .bp-body{max-width:1000px;margin:0 auto;padding:36px 24px;}
  .bp-config-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:24px;}
  .bp-card{background:#fff;border-radius:20px;border:1px solid #e5f0e8;padding:28px;box-shadow:0 4px 24px rgba(22,163,74,0.08);margin-bottom:20px;}
  .bp-card-head{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
  .bp-card-icon{font-size:1.5rem;}
  .bp-card-title{font-family:'Roboto',serif;font-size:1.1rem;font-weight:700;color:#0a2818;}
  .bp-label{font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;display:block;}
  .bp-input,.bp-select{width:100%;padding:10px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:0.9rem;font-family:'Roboto',sans-serif;color:#0f172a;outline:none;background:#fff;transition:border 0.15s;}
  .bp-input:focus,.bp-select:focus{border-color:#16a34a;}
  .bp-sub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}
  .bp-sub-item{background:#f8faf8;border:1.5px solid #e5f0e8;border-radius:10px;padding:14px;}
  .bp-sub-label{font-size:0.78rem;font-weight:600;color:#374151;margin-bottom:6px;}
  .bp-sub-hint{font-size:0.72rem;color:#9ca3af;margin-top:4px;}
  .bp-custom-row{display:flex;gap:12px;align-items:center;margin-bottom:10px;}
  .bp-remove-btn{width:32px;height:32px;border-radius:50%;border:1.5px solid #fecaca;background:none;cursor:pointer;color:#dc2626;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;}
  .bp-remove-btn:hover{background:#fef2f2;}
  .bp-add-btn{background:none;border:1.5px dashed #d1fae5;border-radius:10px;padding:10px 20px;color:#16a34a;font-size:0.875rem;font-weight:600;cursor:pointer;font-family:'Roboto',sans-serif;width:100%;margin-top:8px;transition:all 0.15s;}
  .bp-add-btn:hover{background:#f0fdf4;border-style:solid;}
  .bp-calc-btn{width:100%;padding:15px;background:#16a34a;color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.2s;margin-top:8px;}
  .bp-calc-btn:hover{background:#15803d;transform:translateY(-1px);}
  .bp-results{background:linear-gradient(135deg,#0a2818,#1a4a2a);border-radius:20px;padding:32px;margin-bottom:20px;}
  .bp-results-title{font-family:'Roboto',serif;font-size:1.3rem;font-weight:700;color:#fff;margin-bottom:24px;}
  .bp-results-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;margin-bottom:24px;}
  .bp-res-item{background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center;}
  .bp-res-label{font-size:0.72rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
  .bp-res-val{font-family:'Roboto',serif;font-size:1.3rem;font-weight:700;color:#4ade80;}
  .bp-total-box{background:rgba(255,255,255,0.12);border-radius:14px;padding:20px;text-align:center;}
  .bp-total-label{font-size:0.9rem;color:rgba(255,255,255,0.65);margin-bottom:6px;}
  .bp-total-val{font-family:'Roboto',serif;font-size:2.2rem;font-weight:700;color:#fff;}
  .bp-status{display:inline-flex;align-items:center;gap:8px;border-radius:20px;padding:8px 16px;font-size:0.83rem;font-weight:600;margin-top:12px;}
  .bp-status.over{background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);}
  .bp-status.under{background:rgba(74,222,128,0.2);color:#4ade80;border:1px solid rgba(74,222,128,0.3);}
`;

const BudgetPlanner = () => {
  const [budget, setBudget] = useState({ totalBudget:'', duration:7, travelers:1, currency:'NPR' });
  const [expenses, setExpenses] = useState({});
  const [customExpenses, setCustomExpenses] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const init = {};
    Object.keys(BUDGET_CATEGORIES).forEach(cat => {
      init[cat] = {};
      Object.keys(BUDGET_CATEGORIES[cat].subcategories).forEach(sub => {
        init[cat][sub] = BUDGET_CATEGORIES[cat].subcategories[sub].recommended;
      });
    });
    setExpenses(init);
  }, []);

  const handleBudgetChange = (e) => { const { name, value } = e.target; setBudget(p => ({ ...p, [name]: value })); };
  const handleExpenseChange = (cat, sub, val) => setExpenses(p => ({ ...p, [cat]: { ...p[cat], [sub]: Number(val) || 0 } }));
  const addCustomExpense = () => setCustomExpenses(p => [...p, { name:'', amount:0 }]);
  const updateCustomExpense = (idx, field, val) => setCustomExpenses(p => p.map((e, i) => i === idx ? { ...e, [field]: field === 'amount' ? Number(val) || 0 : val } : e));
  const removeCustomExpense = (idx) => setCustomExpenses(p => p.filter((_, i) => i !== idx));

  const calcTotal = () => {
    let total = 0;
    Object.values(expenses).forEach(cat => Object.values(cat).forEach(amt => { total += amt * budget.duration * budget.travelers; }));
    customExpenses.forEach(e => { total += e.amount; });
    return total;
  };

  const calcBreakdown = () => {
    const breakdown = {};
    Object.keys(expenses).forEach(cat => {
      let catTotal = 0;
      Object.values(expenses[cat]).forEach(amt => { catTotal += amt * budget.duration * budget.travelers; });
      breakdown[cat] = catTotal;
    });
    return breakdown;
  };

  const totalExpenses = calcTotal();
  const totalBudget   = Number(budget.totalBudget) || 0;
  const remaining     = totalBudget - totalExpenses;

  return (
    <>
      <style>{STYLES}</style>
      <div className="bp-root">
        <section className="bp-hero">
          <div className="bp-hero-mountains" />
          <div className="bp-hero-content">
            <div className="bp-badge"><span />Budget Planner</div>
            <h1>Plan Your <em>Nepal Budget</em></h1>
            <p>Estimate and track all your travel costs with our comprehensive budget calculator</p>
          </div>
        </section>

        <div className="bp-body">
          {/* Trip config */}
          <div className="bp-card">
            <div className="bp-card-head"><span className="bp-card-icon">⚙️</span><span className="bp-card-title">Trip Details</span></div>
            <div className="bp-config-grid">
              {[
                { name:'totalBudget', label:'Total Budget (NPR)', type:'number', placeholder:'e.g. 50000' },
                { name:'duration',   label:'Duration (days)',    type:'number', placeholder:'7' },
                { name:'travelers',  label:'Number of Travelers', type:'number', placeholder:'1' },
              ].map(f => (
                <div key={f.name}>
                  <label className="bp-label">{f.label}</label>
                  <input className="bp-input" type={f.type} name={f.name} placeholder={f.placeholder}
                    value={budget[f.name]} onChange={handleBudgetChange} />
                </div>
              ))}
              <div>
                <label className="bp-label">Currency</label>
                <select className="bp-select" name="currency" value={budget.currency} onChange={handleBudgetChange}>
                  <option value="NPR">Nepalese Rupee (NPR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories */}
          {Object.entries(BUDGET_CATEGORIES).map(([catKey, cat]) => (
            <div key={catKey} className="bp-card">
              <div className="bp-card-head"><span className="bp-card-icon">{cat.icon}</span><span className="bp-card-title">{cat.name}</span></div>
              <div className="bp-sub-grid">
                {Object.entries(cat.subcategories).map(([subKey, subData]) => (
                  <div key={subKey} className="bp-sub-item">
                    <div className="bp-sub-label">{subKey}</div>
                    <input className="bp-input" type="number" value={expenses[catKey]?.[subKey] || 0}
                      onChange={e => handleExpenseChange(catKey, subKey, e.target.value)} />
                    <div className="bp-sub-hint">Suggested: Rs. {subData.recommended}/day</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Custom */}
          <div className="bp-card">
            <div className="bp-card-head"><span className="bp-card-icon">✏️</span><span className="bp-card-title">Custom Expenses</span></div>
            {customExpenses.map((exp, idx) => (
              <div key={idx} className="bp-custom-row">
                <input className="bp-input" type="text" placeholder="Expense name" value={exp.name}
                  onChange={e => updateCustomExpense(idx, 'name', e.target.value)} style={{ flex: 1 }} />
                <input className="bp-input" type="number" placeholder="Amount" value={exp.amount}
                  onChange={e => updateCustomExpense(idx, 'amount', e.target.value)} style={{ width: 120 }} />
                <button className="bp-remove-btn" onClick={() => removeCustomExpense(idx)}>✕</button>
              </div>
            ))}
            <button className="bp-add-btn" onClick={addCustomExpense}>+ Add Custom Expense</button>
          </div>

          <button className="bp-calc-btn" onClick={() => setShowResults(true)}>💰 Calculate My Budget</button>

          {showResults && (
            <div className="bp-results">
              <div className="bp-results-title">📊 Budget Breakdown</div>
              <div className="bp-results-grid">
                {Object.entries(calcBreakdown()).map(([catKey, amt]) => (
                  <div key={catKey} className="bp-res-item">
                    <div className="bp-res-label">{BUDGET_CATEGORIES[catKey].name}</div>
                    <div className="bp-res-val">NPR {amt.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="bp-total-box">
                <div className="bp-total-label">Total Estimated Expenses</div>
                <div className="bp-total-val">NPR {totalExpenses.toLocaleString()}</div>
                {totalBudget > 0 && (
                  <div className={`bp-status ${remaining < 0 ? 'over' : 'under'}`}>
                    {remaining < 0
                      ? `⚠️ Over budget by NPR ${Math.abs(remaining).toLocaleString()}`
                      : `✓ Under budget by NPR ${remaining.toLocaleString()}`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BudgetPlanner;
