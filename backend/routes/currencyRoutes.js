const express = require('express');
const router  = express.Router();
const { convertCurrency, getAllRates } = require('../controllers/currencyController');

router.get('/convert', convertCurrency);   // GET /api/currency/convert?from=USD&to=NPR&amount=100
router.get('/rates',   getAllRates);        // GET /api/currency/rates?base=USD

module.exports = router;