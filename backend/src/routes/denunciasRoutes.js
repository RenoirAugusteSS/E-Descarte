const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const {
  criar,
  listar,
  buscarPorProtocolo,
  atualizarStatus,
  enviarMidia,
} = require('../controllers/denunciasController');
const { autenticar, autenticarOpcional, autorizar } = require('../middleware/auth');

// Configuração do Multer para upload de fotos das denúncias
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const sufixo = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${sufixo}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas arquivos de imagem são permitidos.'));
  },
});

// Criar denúncia - aceita usuário autenticado ou anônimo
router.post('/', autenticarOpcional, criar);

// Consulta pública por protocolo (já traz a legislação aplicável)
router.get('/protocolo/:protocolo', buscarPorProtocolo);

// Upload de foto da denúncia
router.post('/:protocolo/midia', upload.single('foto'), enviarMidia);

// Listagem completa - restrita a gestores/admin
router.get('/', autenticar, autorizar('gestor', 'admin'), listar);

// Atualização de status - restrita a gestores/admin
router.patch('/:id/status', autenticar, autorizar('gestor', 'admin'), atualizarStatus);

module.exports = router;
