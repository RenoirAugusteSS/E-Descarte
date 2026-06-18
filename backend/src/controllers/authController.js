const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/postgres');
const EventoLog = require('../models/EventoLog');
require('dotenv').config();

/**
 * POST /api/auth/registro
 * Cria um novo usuário (cidadão por padrão).
 */
async function registrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    const existente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, papel)
       VALUES ($1, $2, $3, 'cidadao')
       RETURNING id, nome, email, papel, criado_em`,
      [nome, email, senhaHash]
    );

    const usuario = resultado.rows[0];

    await EventoLog.create({
      tipo: 'usuario_cadastrado',
      referenciaId: String(usuario.id),
      detalhes: { email: usuario.email },
      ip: req.ip,
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, papel: usuario.papel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({ usuario, token });
  } catch (err) {
    console.error('[Auth] Erro no registro:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao registrar usuário.' });
  }
}

/**
 * POST /api/auth/login
 * Autentica o usuário e retorna um token JWT.
 */
async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const usuario = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, papel: usuario.papel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await EventoLog.create({
      tipo: 'usuario_login',
      referenciaId: String(usuario.id),
      detalhes: { email: usuario.email },
      ip: req.ip,
    });

    return res.json({
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
      token,
    });
  } catch (err) {
    console.error('[Auth] Erro no login:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao autenticar.' });
  }
}

/**
 * GET /api/auth/me
 * Retorna os dados do usuário autenticado (rota protegida).
 */
async function perfil(req, res) {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, papel, criado_em FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error('[Auth] Erro ao buscar perfil:', err.message);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

module.exports = { registrar, login, perfil };
