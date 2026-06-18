const express = require('express');
const router = express.Router();
const { registrar, login, perfil } = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

router.post('/registro', registrar);
router.post('/login', login);
router.get('/me', autenticar, perfil);

module.exports = router;
