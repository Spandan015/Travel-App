const axios = require('axios');

// Fallback static rates if API is unavailable (NPR base)
const FALLBACK_RATES_TO_NPR = {
  USD: 133.5, EUR: 145.2, GBP: 168.8, AUD: 89.4, CAD: 98.7,
  JPY: 0.91,  CNY: 18.8,  INR: 1.6,   SGD: 99.2, THB: 3.85,
  MYR: 28.9,  KRW: 0.099, NPR: 1,     CHF: 149.3, SAR: 35.6,
};

// GET /api/currency/convert?from=USD&to=NPR&amount=100
const convertCurrency = async (req, res) => {
  try {
    const { from = 'USD', to = 'NPR', amount = 1 } = req.query;
    const fromCur = from.toUpperCase();
    const toCur   = to.toUpperCase();
    const amt     = parseFloat(amount);

    if (isNaN(amt) || amt < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    let rate;

    // Try live rates from ExchangeRate-API if key is configured
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    if (apiKey) {
      try {
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCur}/${toCur}`;
        const response = await axios.get(url, { timeout: 4000 });
        rate = response.data.conversion_rate;
      } catch (apiErr) {
        console.warn('Live rates unavailable, using fallback:', apiErr.message);
      }
    }

    // Fallback: use our static rates (both relative to NPR)
    if (!rate) {
      const fromRate = FALLBACK_RATES_TO_NPR[fromCur];
      const toRate   = FALLBACK_RATES_TO_NPR[toCur];
      if (!fromRate || !toRate) {
        return res.status(400).json({ message: `Unsupported currency: ${!fromRate ? fromCur : toCur}` });
      }
      // fromCur → NPR → toCur
      rate = toRate / fromRate;
    }

    const converted = (amt * rate).toFixed(4);

    return res.json({
      from: fromCur,
      to: toCur,
      amount: amt,
      rate,
      result: parseFloat(converted),
      source: apiKey ? 'live' : 'fallback',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('convertCurrency error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/currency/rates?base=USD — all rates relative to base
const getAllRates = async (req, res) => {
  try {
    const base = (req.query.base || 'USD').toUpperCase();
    const baseRate = FALLBACK_RATES_TO_NPR[base];
    if (!baseRate) return res.status(400).json({ message: `Unsupported base: ${base}` });

    const rates = {};
    Object.entries(FALLBACK_RATES_TO_NPR).forEach(([code, rateToNPR]) => {
      rates[code] = parseFloat((rateToNPR / baseRate).toFixed(4));
    });

    return res.json({ base, rates, timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { convertCurrency, getAllRates };