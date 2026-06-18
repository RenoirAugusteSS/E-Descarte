const {
  listarTodaLegislacao,
  obterLegislacaoPorTipo,
  LEGISLACAO,
} = require('../config/legalContent');

/**
 * GET /api/legislacao
 * Lista toda a legislação ambiental cadastrada no sistema.
 */
function listarTudo(req, res) {
  return res.json(listarTodaLegislacao());
}

/**
 * GET /api/legislacao/tipo/:tipoResiduo
 * Retorna a legislação aplicável a um tipo específico de resíduo.
 * Usado pelo frontend para exibir o embasamento legal em tempo real
 * conforme o usuário seleciona o tipo de resíduo na tela de denúncia.
 */
function porTipoResiduo(req, res) {
  const legislacao = obterLegislacaoPorTipo(req.params.tipoResiduo);
  return res.json(legislacao);
}

/**
 * GET /api/legislacao/:id
 * Retorna o detalhe de uma lei específica pelo seu id (ex: PNRS_12305_2010).
 */
function buscarPorId(req, res) {
  const lei = Object.values(LEGISLACAO).find((l) => l.id === req.params.id);
  if (!lei) {
    return res.status(404).json({ erro: 'Legislação não encontrada.' });
  }
  return res.json(lei);
}

module.exports = { listarTudo, porTipoResiduo, buscarPorId };
