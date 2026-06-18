// Módulo Legal do E-Descarte
// Mapeia cada tipo de resíduo / situação de denúncia à legislação
// ambiental brasileira aplicável. Usado pela API para enriquecer
// as denúncias automaticamente e exibir o embasamento legal na tela.

const LEGISLACAO = {
  PNRS: {
    id: 'PNRS_12305_2010',
    titulo: 'Lei 12.305/2010 - Política Nacional de Resíduos Sólidos',
    resumo:
      'Institui a Política Nacional de Resíduos Sólidos e estabelece a ' +
      'responsabilidade compartilhada pelo ciclo de vida dos produtos, ' +
      'incluindo a logística reversa de eletroeletrônicos.',
    artigosRelevantes: ['Art. 3º, XII', 'Art. 30 a 36'],
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm',
  },
  DECRETO_LOGISTICA_REVERSA: {
    id: 'DECRETO_10240_2020',
    titulo: 'Decreto 10.240/2020 - Logística Reversa de Eletroeletrônicos',
    resumo:
      'Regulamenta o sistema de logística reversa de produtos ' +
      'eletroeletrônicos e seus componentes de uso doméstico, ' +
      'obrigando fabricantes e importadores a estruturar pontos de coleta.',
    artigosRelevantes: ['Art. 4º', 'Art. 7º', 'Art. 12'],
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/D10240.htm',
  },
  CRIMES_AMBIENTAIS: {
    id: 'LEI_9605_1998',
    titulo: 'Lei 9.605/1998 - Lei de Crimes Ambientais',
    resumo:
      'Dispõe sobre as sanções penais e administrativas derivadas de ' +
      'condutas lesivas ao meio ambiente, incluindo o descarte irregular ' +
      'de resíduos que possam causar poluição.',
    artigosRelevantes: ['Art. 54', 'Art. 56'],
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l9605.htm',
  },
  CONAMA_401: {
    id: 'CONAMA_401_2008',
    titulo: 'Resolução CONAMA 401/2008 - Pilhas e Baterias',
    resumo:
      'Estabelece os limites máximos de chumbo, cádmio e mercúrio para ' +
      'pilhas e baterias comercializadas no Brasil e os critérios para o ' +
      'gerenciamento ambientalmente adequado de seus resíduos.',
    artigosRelevantes: ['Art. 1º', 'Art. 4º', 'Art. 6º'],
    url: 'https://www.gov.br/conama/pt-br/resolucao-conama-no-401',
  },
  LGPD: {
    id: 'LGPD_13709_2018',
    titulo: 'Lei 13.709/2018 - Lei Geral de Proteção de Dados (LGPD)',
    resumo:
      'Aplica-se ao descarte de dispositivos que armazenam dados pessoais ' +
      '(celulares, computadores), exigindo cuidados na eliminação segura ' +
      'de informações antes do descarte.',
    artigosRelevantes: ['Art. 6º', 'Art. 46'],
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
  },
};

// Mapeia o tipo de resíduo informado na denúncia para os
// dispositivos legais aplicáveis (chaves de LEGISLACAO).
const MAPA_TIPO_RESIDUO = {
  celulares_tablets: ['PNRS', 'DECRETO_LOGISTICA_REVERSA', 'LGPD', 'CRIMES_AMBIENTAIS'],
  computadores: ['PNRS', 'DECRETO_LOGISTICA_REVERSA', 'LGPD', 'CRIMES_AMBIENTAIS'],
  baterias_pilhas: ['CONAMA_401', 'PNRS', 'CRIMES_AMBIENTAIS'],
  eletrodomesticos: ['PNRS', 'DECRETO_LOGISTICA_REVERSA', 'CRIMES_AMBIENTAIS'],
  outros: ['PNRS', 'CRIMES_AMBIENTAIS'],
};

/**
 * Retorna a lista de objetos de legislação aplicáveis a um tipo de resíduo.
 * @param {string} tipoResiduo - chave do tipo de resíduo (ex: 'baterias_pilhas')
 * @returns {Array<object>} lista de legislações relacionadas
 */
function obterLegislacaoPorTipo(tipoResiduo) {
  const chaves = MAPA_TIPO_RESIDUO[tipoResiduo] || MAPA_TIPO_RESIDUO.outros;
  return chaves.map((chave) => LEGISLACAO[chave]);
}

/**
 * Retorna apenas os IDs da legislação aplicável (para salvar no banco).
 */
function obterIdsLegislacaoPorTipo(tipoResiduo) {
  return obterLegislacaoPorTipo(tipoResiduo).map((lei) => lei.id);
}

/**
 * Retorna todas as legislações cadastradas (para tela de "Legislação" geral).
 */
function listarTodaLegislacao() {
  return Object.values(LEGISLACAO);
}

module.exports = {
  LEGISLACAO,
  MAPA_TIPO_RESIDUO,
  obterLegislacaoPorTipo,
  obterIdsLegislacaoPorTipo,
  listarTodaLegislacao,
};
