const express = require('express');
const router = express.Router();
const { getAll, getById, create, updateStatus } = require('../controllers/bookingController');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id/status', updateStatus);

module.exports = router;