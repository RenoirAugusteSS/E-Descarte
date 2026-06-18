const mongoose = require('mongoose');

// Coleção de mídia (fotos) associadas a denúncias (MongoDB)
const midiaDenunciaSchema = new mongoose.Schema({
  protocoloDenuncia: { type: String, required: true, index: true },
  nomeArquivo: { type: String, required: true },
  caminhoArquivo: { type: String, required: true },
  tipoArquivo: { type: String, default: 'image/jpeg' },
  tamanhoBytes: { type: Number },
  enviadoEm: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MidiaDenuncia', midiaDenunciaSchema);
