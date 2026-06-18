const pool = require('../config/postgres');
const { calcularDistanciaKm, geocodificarEndereco } = require('../config/googleMaps');
const EventoLog = require('../models/EventoLog');

/**
 * GET /api/pontos-coleta
 * Lista pontos de coleta, com filtros opcionais por cidade e proximidade.
 * Query params: cidade, lat, lng, raioKm
 */
async function listar(req, res) {
  const { cidade, lat, lng, raioKm } = req.query;

  try {
    let query = 'SELECT * FROM pontos_coleta WHERE ativo = TRUE';
    const params = [];

    if (cidade) {
      params.push(`%${cidade}%`);
      query += ` AND cidade ILIKE $${params.length}`;
    }

    const resultado = await pool.query(query, params);
    let pontos = resultado.rows;

    // Filtro por proximidade (raio em km), calculado em memória com Haversine
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const raio = raioKm ? parseFloat(raioKm) : 10;

      pontos = pontos
        .map((p) => ({
          ...p,
          distancia_km: Number(
            calcularDistanciaKm(latNum, lngNum, p.latitude, p.longitude).toFixed(2)
          ),
        }))
        .filter((p) => p.distancia_km <= raio)
        .sort((a, b) => a.distancia_km - b.distancia_km);
    }

    return res.json(pontos);
  } catch (err) {
    console.error('[PontosColeta] Erro ao listar:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar pontos de coleta.' });
  }
}

/**
 * GET /api/pontos-coleta/:id
 */
async function buscarPorId(req, res) {
  try {
    const resultado = await pool.query('SELECT * FROM pontos_coleta WHERE id = $1', [
      req.params.id,
    ]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Ponto de coleta não encontrado.' });
    }

    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error('[PontosColeta] Erro ao buscar:', err.message);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

/**
 * POST /api/pontos-coleta
 * Cria um novo ponto de coleta (rota restrita a gestor/admin).
 * Se latitude/longitude não forem enviadas, tenta geocodificar pelo endereço.
 */
async function criar(req, res) {
  let { nome, endereco, cidade, latitude, longitude, tipo, itens_aceitos, horario_funcionamento } =
    req.body;

  if (!nome || !endereco || !cidade || !tipo) {
    return res.status(400).json({ erro: 'Nome, endereço, cidade e tipo são obrigatórios.' });
  }

  try {
    if (!latitude || !longitude) {
      const coords = await geocodificarEndereco(`${endereco}, ${cidade}`);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    const resultado = await pool.query(
      `INSERT INTO pontos_coleta
        (nome, endereco, cidade, latitude, longitude, tipo, itens_aceitos, horario_funcionamento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nome,
        endereco,
        cidade,
        latitude || null,
        longitude || null,
        tipo,
        itens_aceitos || [],
        horario_funcionamento || null,
      ]
    );

    const ponto = resultado.rows[0];

    await EventoLog.create({
      tipo: 'ponto_coleta_criado',
      referenciaId: String(ponto.id),
      detalhes: { nome: ponto.nome, cidade: ponto.cidade },
      ip: req.ip,
    });

    return res.status(201).json(ponto);
  } catch (err) {
    console.error('[PontosColeta] Erro ao criar:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao criar ponto de coleta.' });
  }
}

module.exports = { listar, buscarPorId, criar };
