// routes/history.js
const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/historyController');
const auth = require('../middleware/auth');

router.get('/', auth, getHistory);

module.exports = router;
