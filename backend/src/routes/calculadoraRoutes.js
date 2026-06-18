const express = require('express');
const router = express.Router();
const { calcular } = require('../controllers/calculadoraController');

router.post('/', calcular);

module.exports = router;
