const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const pontosColetaRoutes = require('./routes/pontosColetaRoutes');
const denunciasRoutes = require('./routes/denunciasRoutes');
const legislacaoRoutes = require('./routes/legislacaoRoutes');
const calculadoraRoutes = require('./routes/calculadoraRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de health-check
app.get('/', (req, res) => {
  res.json({
    projeto: 'E-Descarte - EcoTech Observatorio Digital de Direito Ambiental',
    status: 'online',
    endpoints: [
      '/api/auth',
      '/api/pontos-coleta',
      '/api/denuncias',
      '/api/legislacao',
      '/api/calculadora',
    ],
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/pontos-coleta', pontosColetaRoutes);
app.use('/api/denuncias', denunciasRoutes);
app.use('/api/legislacao', legislacaoRoutes);
app.use('/api/calculadora', calculadoraRoutes);

// Tratamento de erros não capturados (ex: erro do multer)
app.use((err, req, res, next) => {
  console.error('[Erro não tratado]:', err.message);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = app;
