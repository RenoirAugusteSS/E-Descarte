const express = require('express');
const router = express.Router();
const { listarTudo, porTipoResiduo, buscarPorId } = require('../controllers/legislacaoController');

// Todas as rotas do módulo legal são públicas - transparência é
// um dos objetivos do Observatório Digital Ambiental.
router.get('/', listarTudo);
router.get('/tipo/:tipoResiduo', porTipoResiduo);
router.get('/:id', buscarPorId);

module.exports = router;
