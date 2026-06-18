import api from './api';

export async function listarLegislacao() {
  const { data } = await api.get('/legislacao');
  return data;
}

export async function legislacaoPorTipoResiduo(tipoResiduo) {
  const { data } = await api.get(`/legislacao/tipo/${tipoResiduo}`);
  return data;
}

export async function calcularImpacto(itens) {
  const { data } = await api.post('/calculadora', itens);
  return data;
}
