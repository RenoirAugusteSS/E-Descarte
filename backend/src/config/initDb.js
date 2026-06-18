const pool = require('./postgres');

// Script de inicialização do banco PostgreSQL.
// Executar com: npm run db:init
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  papel VARCHAR(30) DEFAULT 'cidadao', -- cidadao, gestor, admin
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pontos_coleta (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- oficial, ecoponto_municipal, parceiro
  itens_aceitos TEXT[] NOT NULL DEFAULT '{}',
  horario_funcionamento VARCHAR(150),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS denuncias (
  id SERIAL PRIMARY KEY,
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  anonimo BOOLEAN DEFAULT FALSE,
  tipo_residuo VARCHAR(50) NOT NULL, -- celulares_tablets, computadores, baterias_pilhas, eletrodomesticos, outros
  gravidade VARCHAR(20) NOT NULL DEFAULT 'media', -- baixa, media, alta
  endereco VARCHAR(255) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  cep VARCHAR(10),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  descricao TEXT,
  status VARCHAR(30) DEFAULT 'pendente', -- pendente, em_analise, resolvida, arquivada
  legislacao_relacionada TEXT[] DEFAULT '{}',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias(status);
CREATE INDEX IF NOT EXISTS idx_denuncias_tipo ON denuncias(tipo_residuo);
CREATE INDEX IF NOT EXISTS idx_pontos_cidade ON pontos_coleta(cidade);
`;

const seedSQL = `
INSERT INTO pontos_coleta (nome, endereco, cidade, latitude, longitude, tipo, itens_aceitos, horario_funcionamento)
VALUES
  ('Ecoponto Central', 'Av. Principal, 100', 'Salvador', -12.9777, -38.5016, 'oficial', ARRAY['celulares','tablets','computadores','pilhas'], 'Seg-Sex 8h-18h'),
  ('Loja TechRecicla', 'Rua Central, 250', 'Salvador', -12.9711, -38.5108, 'parceiro', ARRAY['celulares','tablets','baterias'], 'Seg-Sab 9h-20h'),
  ('Prefeitura - Sede', 'Praça Municipal, 1', 'Salvador', -12.9650, -38.4980, 'ecoponto_municipal', ARRAY['celulares','computadores','baterias','eletrodomesticos'], 'Ter e Qui 8h-16h')
ON CONFLICT DO NOTHING;
`;

(async () => {
  try {
    await pool.query(createTablesSQL);
    console.log('[DB Init] Tabelas criadas/verificadas com sucesso.');
    await pool.query(seedSQL);
    console.log('[DB Init] Dados iniciais (seed) inseridos.');
    process.exit(0);
  } catch (err) {
    console.error('[DB Init] Erro:', err.message);
    process.exit(1);
  }
})();
