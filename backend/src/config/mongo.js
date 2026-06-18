const mongoose = require('mongoose');
require('dotenv').config();

// Conexão MongoDB - usado para fotos de denúncias,
// logs de atividade e eventos do sistema
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[MongoDB] Conectado com sucesso');
  } catch (err) {
    console.error('[MongoDB] Erro na conexão:', err.message);
    process.exit(1);
  }
}

module.exports = connectMongo;
