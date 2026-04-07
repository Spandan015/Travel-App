import { useState, useEffect } from 'react';

const EXCHANGE_RATES = {
  USD: { rate: 133.5, symbol: '$',  name: 'US Dollar' },
  EUR: { rate: 145.2, symbol: '€',  name: 'Euro' },
  GBP: { rate: 168.8, symbol: '£',  name: 'British Pound' },
  AUD: { rate: 89.4,  symbol: 'A$', name: 'Australian Dollar' },
  CAD: { rate: 98.7,  symbol: 'C$', name: 'Canadian Dollar' },
  JPY: { rate: 0.91,  symbol: '¥',  name: 'Japanese Yen' },
  CNY: { rate: 18.8,  symbol: '¥',  name: 'Chinese Yuan' },
  INR: { rate: 1.6,   symbol: '₹',  name: 'Indian Rupee' },
  SGD: { rate: 99.2,  symbol: 'S$', name: 'Singapore Dollar' },
  THB: { rate: 3.85,  symbol: '฿',  name: 'Thai Baht' },
  MYR: { rate: 28.9,  symbol: 'RM', name: 'Malaysian Ringgit' },
  KRW: { rate: 0.099, symbol: '₩',  name: 'Korean Won' },
  NPR: { rate: 1,     symbol: 'Rs', name: 'Nepalese Rupee' },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .ce-root{font-family:'Roboto',sans-serif;background:#f8faf8;min-height:100vh;padding-top:68px;}

  .ce-hero{background:linear-gradient(135deg,#0a2818 0%,#0d3320 40%,#1a4a2a 100%);padding:64px 24px 48px;text-align:center;position:relative;overflow:hidden;}
  .ce-hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
  .ce-hero-content{position:relative;z-index:2;max-width:600px;margin:0 auto;}
  .ce-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:6px 16px;font-size:12px;font-weight:500;color:rgba(255,255,255,0.85);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:20px;}
  .ce-badge span{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;}
  .ce-hero h1{font-family:'Roboto',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;color:#fff;margin:0 0 12px;line-height:1.1;letter-spacing:-0.02em;}
  .ce-hero h1 em{font-style:italic;color:#4ade80;}
  .ce-hero p{color:rgba(255,255,255,0.65);font-size:0.95rem;margin:0 0 8px;font-weight:300;}
  .ce-updated{font-size:0.78rem;color:rgba(255,255,255,0.4);}

  .ce-body{max-width:860px;margin:0 auto;padding:36px 24px;}

  .ce-card{background:#fff;border-radius:20px;border:1px solid #e5f0e8;padding:36px;box-shadow:0 4px 24px rgba(22,163,74,0.08);margin-bottom:24px;}
  .ce-card-title{font-family:'Roboto',serif;font-size:1.2rem;font-weight:700;color:#0a2818;margin-bottom:24px;}

  .ce-exchanger{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:20px;}
  @media(max-width:640px){.ce-exchanger{grid-template-columns:1fr;}.ce-swap-wrap{display:flex;justify-content:center;margin:4px 0;}}
  .ce-field-label{font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;display:block;}
  .ce-select{width:100%;padding:11px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:0.9rem;font-family:'Roboto',sans-serif;color:#0f172a;outline:none;background:#fff;cursor:pointer;transition:border 0.15s;margin-bottom:10px;}
  .ce-select:focus{border-color:#16a34a;}
  .ce-input{width:100%;padding:11px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:1rem;font-family:'Roboto',sans-serif;color:#0f172a;outline:none;transition:border 0.15s;}
  .ce-input:focus{border-color:#16a34a;}
  .ce-result-box{width:100%;padding:11px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:1rem;font-weight:600;color:#0a2818;background:#f0fdf4;min-height:46px;display:flex;align-items:center;}
  .ce-swap-wrap{display:flex;justify-content:center;align-items:flex-end;padding-bottom:10px;}
  .ce-swap-btn{width:44px;height:44px;border-radius:50%;background:#16a34a;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;transition:all 0.2s;box-shadow:0 4px 12px rgba(22,163,74,0.3);}
  .ce-swap-btn:hover{background:#15803d;transform:scale(1.1);}

  .ce-result{margin-top:20px;background:#f0fdf4;border:1px solid #d1fae5;border-radius:14px;padding:20px 24px;text-align:center;}
  .ce-result-main{font-family:'Roboto',serif;font-size:1.6rem;font-weight:700;color:#0a2818;}
  .ce-result-rate{font-size:0.83rem;color:#6b7280;margin-top:6px;}

  .ce-popular-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;}
  .ce-pop-card{background:#f0fdf4;border:1px solid #d1fae5;border-radius:14px;padding:16px;text-align:center;cursor:pointer;transition:all 0.2s;}
  .ce-pop-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(22,163,74,0.12);}
  .ce-pop-from{font-size:0.85rem;font-weight:600;color:#374151;margin-bottom:4px;}
  .ce-pop-to{font-family:'Roboto',serif;font-size:1.3rem;font-weight:700;color:#16a34a;margin:4px 0;}
  .ce-pop-rate{font-size:0.72rem;color:#9ca3af;}

  .ce-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  @media(max-width:600px){.ce-info-grid{grid-template-columns:1fr;}}
  .ce-info-title{font-size:0.9rem;font-weight:700;color:#0a2818;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
  .ce-info-list{list-style:none;display:flex;flex-direction:column;gap:8px;}
  .ce-info-list li{font-size:0.83rem;color:#6b7280;display:flex;align-items:flex-start;gap:8px;}
  .ce-info-list li::before{content:'•';color:#16a34a;font-weight:700;flex-shrink:0;}
  .ce-tip-grid{display:flex;flex-direction:column;gap:8px;}
  .ce-tip{display:flex;align-items:flex-start;gap:10px;background:#f8faf8;border-radius:10px;padding:10px 12px;}
  .ce-tip-icon{font-size:1rem;flex-shrink:0;}
  .ce-tip-text{font-size:0.83rem;color:#374151;line-height:1.5;}
`;

const CurrencyExchanger = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency,   setToCurrency]   = useState('NPR');
  const [amount,       setAmount]       = useState('');
  const [result,       setResult]       = useState('');
  const [lastUpdated,  setLastUpdated]  = useState(new Date());

  const calculateExchange = () => {
    if (!amount || isNaN(amount)) { setResult(''); return; }
    const fromRate  = EXCHANGE_RATES[fromCurrency].rate;
    const toRate    = EXCHANGE_RATES[toCurrency].rate;
    const converted = (parseFloat(amount) * toRate) / fromRate;
    setResult(converted.toFixed(2));
  };

  useEffect(() => { calculateExchange(); }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setAmount(result);
  };

  const popularConversions = [
    { from: 'USD', to: 'NPR', amount: 100 },
    { from: 'EUR', to: 'NPR', amount: 100 },
    { from: 'GBP', to: 'NPR', amount: 100 },
    { from: 'INR', to: 'NPR', amount: 1000 },
    { from: 'CNY', to: 'NPR', amount: 500 },
    { from: 'AUD', to: 'NPR', amount: 100 },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ce-root">
        <section className="ce-hero">
          <div className="ce-hero-content">
            <div className="ce-badge"><span />Currency Exchange</div>
            <h1>Nepal <em>Currency</em> Exchange</h1>
            <p>Convert your currency to Nepalese Rupees for your Nepal trip</p>
            <div className="ce-updated">Last updated: {lastUpdated.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
          </div>
        </section>

        <div className="ce-body">
          <div className="ce-card">
            <div className="ce-card-title">💱 Currency Converter</div>
            <div className="ce-exchanger">
              <div>
                <span className="ce-field-label">From Currency</span>
                <select className="ce-select" value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
                  {Object.entries(EXCHANGE_RATES).map(([code, data]) => (
                    <option key={code} value={code}>{data.symbol} {code} - {data.name}</option>
                  ))}
                </select>
                <input className="ce-input" type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>

              <div className="ce-swap-wrap">
                <button className="ce-swap-btn" onClick={swapCurrencies} title="Swap currencies">⇄</button>
              </div>

              <div>
                <span className="ce-field-label">To Currency</span>
                <select className="ce-select" value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
                  {Object.entries(EXCHANGE_RATES).map(([code, data]) => (
                    <option key={code} value={code}>{data.symbol} {code} - {data.name}</option>
                  ))}
                </select>
                <div className="ce-result-box">
                  {result ? `${EXCHANGE_RATES[toCurrency].symbol} ${result}` : 'Converted amount'}
                </div>
              </div>
            </div>

            {result && (
              <div className="ce-result">
                <div className="ce-result-main">
                  {EXCHANGE_RATES[fromCurrency].symbol}{amount} {fromCurrency} = {EXCHANGE_RATES[toCurrency].symbol}{result} {toCurrency}
                </div>
                <div className="ce-result-rate">
                  Exchange rate: 1 {fromCurrency} = {(EXCHANGE_RATES[toCurrency].rate / EXCHANGE_RATES[fromCurrency].rate).toFixed(4)} {toCurrency}
                </div>
              </div>
            )}
          </div>

          <div className="ce-card">
            <div className="ce-card-title">🌟 Popular Conversions</div>
            <div className="ce-popular-grid">
              {popularConversions.map((c, idx) => {
                const fromRate  = EXCHANGE_RATES[c.from].rate;
                const toRate    = EXCHANGE_RATES[c.to].rate;
                const converted = (c.amount * toRate / fromRate).toFixed(0);
                return (
                  <div key={idx} className="ce-pop-card" onClick={() => { setFromCurrency(c.from); setToCurrency(c.to); setAmount(String(c.amount)); }}>
                    <div className="ce-pop-from">{EXCHANGE_RATES[c.from].symbol}{c.amount} {c.from}</div>
                    <div className="ce-pop-to">Rs {converted}</div>
                    <div className="ce-pop-rate">1 {c.from} = {(toRate / fromRate).toFixed(2)} {c.to}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ce-card">
            <div className="ce-card-title">🇳🇵 Nepal Currency Information</div>
            <div className="ce-info-grid">
              <div>
                <div className="ce-info-title">💵 About Nepalese Rupee (NPR)</div>
                <ul className="ce-info-list">
                  <li>1 NPR = 100 Paisa</li>
                  <li>Banknotes: 5, 10, 20, 50, 100, 500, 1000 NPR</li>
                  <li>Coins: 1, 2, 5, 10 NPR and paisa denominations</li>
                  <li>Symbol: ₨ or Rs.</li>
                  <li>Pegged to Indian Rupee at 1.6 ratio</li>
                </ul>
              </div>
              <div>
                <div className="ce-info-title">💡 Travel Money Tips</div>
                <div className="ce-tip-grid">
                  {[
                    { icon: '🏦', text: 'Exchange at official banks or authorized money changers for best rates' },
                    { icon: '💳', text: 'ATMs in Kathmandu and Pokhara accept major international cards' },
                    { icon: '⚠️', text: 'Carry small denominations for trekking areas where change is limited' },
                    { icon: '📋', text: 'Keep exchange receipts — required to re-exchange NPR on departure' },
                  ].map((tip, i) => (
                    <div key={i} className="ce-tip">
                      <span className="ce-tip-icon">{tip.icon}</span>
                      <span className="ce-tip-text">{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrencyExchanger;
