const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware que valida o token JWT enviado no header Authorization.
// Formato esperado: "Authorization: Bearer <token>"
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, email, papel }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Middleware opcional: não bloqueia a requisição, mas popula req.usuario
// se um token válido for enviado. Usado em rotas de denúncia anônima,
// onde o usuário pode (mas não precisa) estar logado.
function autenticarOpcional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      req.usuario = null;
    }
  } else {
    req.usuario = null;
  }
  next();
}

// Middleware de autorização por papel (ex: apenas 'gestor' ou 'admin')
function autorizar(...papeisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !papeisPermitidos.includes(req.usuario.papel)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para este recurso.' });
    }
    next();
  };
}

module.exports = { autenticar, autenticarOpcional, autorizar };
