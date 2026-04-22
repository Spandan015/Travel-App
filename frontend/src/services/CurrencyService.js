import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const currencyService = {
  convert: (from, to, amount) =>
    axios.get(`${API}/currency/convert`, { params: { from, to, amount } })
      .then(r => r.data),

  getRates: (base = 'USD') =>
    axios.get(`${API}/currency/rates`, { params: { base } })
      .then(r => r.data),
};

export default currencyService;