require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./app');
const connectMongo = require('./config/mongo');

const PORT = process.env.PORT || 3000;

// Garante que a pasta de uploads exista
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

(async () => {
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`[E-Descarte API] Servidor rodando em http://localhost:${PORT}`);
  });
})();
