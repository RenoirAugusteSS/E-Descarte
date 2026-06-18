const pool = require('../config/postgres');
const EventoLog = require('../models/EventoLog');
const MidiaDenuncia = require('../models/MidiaDenuncia');
const { obterLegislacaoPorTipo, obterIdsLegislacaoPorTipo } = require('../config/legalContent');
const { geocodificarEndereco } = require('../config/googleMaps');
const { enviarEmailConfirmacaoDenuncia, enviarSmsAlerta } = require('../config/notifications');

const TIPOS_VALIDOS = [
  'celulares_tablets',
  'computadores',
  'baterias_pilhas',
  'eletrodomesticos',
  'outros',
];
const GRAVIDADES_VALIDAS = ['baixa', 'media', 'alta'];

/**
 * Gera um protocolo único no formato ED-AAAA-XXXXXX
 */
function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const codigo = Math.floor(100000 + Math.random() * 900000);
  return `ED-${ano}-${codigo}`;
}

/**
 * POST /api/denuncias
 * Cria uma nova denúncia. Pode ser feita anonimamente (sem token) ou
 * autenticada (token opcional - ver middleware autenticarOpcional).
 * O módulo legal é consultado automaticamente com base no tipo_residuo
 * e a legislação aplicável é salva junto da denúncia e devolvida na resposta.
 */
async function criar(req, res) {
  const {
    tipo_residuo,
    gravidade,
    endereco,
    cidade,
    cep,
    latitude,
    longitude,
    descricao,
    anonimo,
    contato_email,
    contato_telefone,
  } = req.body;

  if (!tipo_residuo || !endereco || !cidade) {
    return res.status(400).json({ erro: 'Tipo de resíduo, endereço e cidade são obrigatórios.' });
  }

  if (!TIPOS_VALIDOS.includes(tipo_residuo)) {
    return res.status(400).json({
      erro: `Tipo de resíduo inválido. Valores aceitos: ${TIPOS_VALIDOS.join(', ')}`,
    });
  }

  const gravidadeFinal = GRAVIDADES_VALIDAS.includes(gravidade) ? gravidade : 'media';

  try {
    // Geocodifica o endereço caso coordenadas não tenham sido enviadas
    let lat = latitude || null;
    let lng = longitude || null;
    if (!lat || !lng) {
      const coords = await geocodificarEndereco(`${endereco}, ${cidade}`);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    // ---- MÓDULO LEGAL: identifica a legislação aplicável ----
    const idsLegislacao = obterIdsLegislacaoPorTipo(tipo_residuo);
    const legislacaoCompleta = obterLegislacaoPorTipo(tipo_residuo);

    const protocolo = gerarProtocolo();
    const usuarioId = req.usuario && !anonimo ? req.usuario.id : null;

    const resultado = await pool.query(
      `INSERT INTO denuncias
        (protocolo, usuario_id, anonimo, tipo_residuo, gravidade, endereco, cidade, cep,
         latitude, longitude, descricao, status, legislacao_relacionada)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pendente',$12)
       RETURNING *`,
      [
        protocolo,
        usuarioId,
        !!anonimo,
        tipo_residuo,
        gravidadeFinal,
        endereco,
        cidade,
        cep || null,
        lat,
        lng,
        descricao || null,
        idsLegislacao,
      ]
    );

    const denuncia = resultado.rows[0];

    await EventoLog.create({
      tipo: 'denuncia_criada',
      referenciaId: protocolo,
      detalhes: { tipo_residuo, gravidade: gravidadeFinal, cidade },
      ip: req.ip,
    });

    // Notificações (e-mail/SMS) - não bloqueiam a resposta em caso de falha
    if (contato_email) {
      enviarEmailConfirmacaoDenuncia(contato_email, denuncia).catch(() => {});
    }
    if (contato_telefone) {
      enviarSmsAlerta(
        contato_telefone,
        `E-Descarte: denuncia ${protocolo} registrada. Acompanhe pelo app.`
      ).catch(() => {});
    }

    return res.status(201).json({
      denuncia,
      legislacao_aplicavel: legislacaoCompleta,
    });
  } catch (err) {
    console.error('[Denuncias] Erro ao criar:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao registrar denúncia.' });
  }
}

/**
 * GET /api/denuncias
 * Lista denúncias com filtros opcionais (status, cidade, tipo_residuo).
 * Rota protegida - apenas usuários autenticados (gestores) visualizam
 * a lista completa; cidadãos comuns usam /api/denuncias/protocolo/:protocolo
 */
async function listar(req, res) {
  const { status, cidade, tipo_residuo } = req.query;

  try {
    let query = 'SELECT * FROM denuncias WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (cidade) {
      params.push(`%${cidade}%`);
      query += ` AND cidade ILIKE $${params.length}`;
    }
    if (tipo_residuo) {
      params.push(tipo_residuo);
      query += ` AND tipo_residuo = $${params.length}`;
    }

    query += ' ORDER BY criado_em DESC';

    const resultado = await pool.query(query, params);
    return res.json(resultado.rows);
  } catch (err) {
    console.error('[Denuncias] Erro ao listar:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar denúncias.' });
  }
}

/**
 * GET /api/denuncias/protocolo/:protocolo
 * Consulta pública de uma denúncia pelo protocolo (sem autenticação),
 * já incluindo a legislação aplicável detalhada.
 */
async function buscarPorProtocolo(req, res) {
  try {
    const resultado = await pool.query('SELECT * FROM denuncias WHERE protocolo = $1', [
      req.params.protocolo,
    ]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }

    const denuncia = resultado.rows[0];
    const legislacao = obterLegislacaoPorTipo(denuncia.tipo_residuo);

    return res.json({ denuncia, legislacao_aplicavel: legislacao });
  } catch (err) {
    console.error('[Denuncias] Erro ao buscar por protocolo:', err.message);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

/**
 * PATCH /api/denuncias/:id/status
 * Atualiza o status de uma denúncia (rota restrita a gestor/admin).
 */
async function atualizarStatus(req, res) {
  const { status } = req.body;
  const STATUS_VALIDOS = ['pendente', 'em_analise', 'resolvida', 'arquivada'];

  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Valores aceitos: ${STATUS_VALIDOS.join(', ')}` });
  }

  try {
    const resultado = await pool.query(
      `UPDATE denuncias SET status = $1, atualizado_em = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }

    const denuncia = resultado.rows[0];

    await EventoLog.create({
      tipo: 'denuncia_atualizada',
      referenciaId: denuncia.protocolo,
      detalhes: { novo_status: status, atualizado_por: req.usuario.id },
      ip: req.ip,
    });

    return res.json(denuncia);
  } catch (err) {
    console.error('[Denuncias] Erro ao atualizar status:', err.message);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

/**
 * POST /api/denuncias/:protocolo/midia
 * Faz upload de uma foto associada à denúncia (multipart/form-data, campo "foto").
 * O arquivo é processado pelo middleware multer (ver routes/denunciaRoutes.js)
 * e seus metadados são salvos no MongoDB.
 */
async function enviarMidia(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado (campo esperado: foto).' });
  }

  try {
    const midia = await MidiaDenuncia.create({
      protocoloDenuncia: req.params.protocolo,
      nomeArquivo: req.file.originalname,
      caminhoArquivo: req.file.path,
      tipoArquivo: req.file.mimetype,
      tamanhoBytes: req.file.size,
    });

    return res.status(201).json(midia);
  } catch (err) {
    console.error('[Denuncias] Erro ao salvar midia:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao salvar arquivo.' });
  }
}

module.exports = { criar, listar, buscarPorProtocolo, atualizarStatus, enviarMidia };
