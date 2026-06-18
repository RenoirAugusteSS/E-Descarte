const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexões PostgreSQL - dados estruturados:
// usuários, pontos de coleta, denúncias, status
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('[PostgreSQL] Nova conexão estabelecida');
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Erro inesperado no pool:', err);
});

module.exports = pool;
