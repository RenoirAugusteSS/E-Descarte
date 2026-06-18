const mongoose = require('mongoose');

// Coleção de logs/eventos do sistema (MongoDB)
const eventoLogSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: [
      'denuncia_criada',
      'denuncia_atualizada',
      'usuario_cadastrado',
      'usuario_login',
      'ponto_coleta_criado',
      'notificacao_enviada',
      'erro_sistema',
    ],
  },
  referenciaId: { type: String }, // id relacionado (ex: protocolo da denúncia)
  detalhes: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  criadoEm: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EventoLog', eventoLogSchema);
