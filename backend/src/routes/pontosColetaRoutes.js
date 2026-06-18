const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar } = require('../controllers/pontosColetaController');
const { autenticar, autorizar } = require('../middleware/auth');

// Rotas públicas - qualquer cidadão pode visualizar o mapa de pontos de coleta
router.get('/', listar);
router.get('/:id', buscarPorId);

// Rota restrita - apenas gestores/admin podem cadastrar novos pontos
router.post('/', autenticar, autorizar('gestor', 'admin'), criar);

module.exports = router;
