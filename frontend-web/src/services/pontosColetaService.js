import api from './api';

export async function listarPontosColeta({ cidade, lat, lng, raioKm } = {}) {
  const params = {};
  if (cidade) params.cidade = cidade;
  if (lat && lng) {
    params.lat = lat;
    params.lng = lng;
    params.raioKm = raioKm || 10;
  }
  const { data } = await api.get('/pontos-coleta', { params });
  return data;
}

export async function buscarPontoColeta(id) {
  const { data } = await api.get(`/pontos-coleta/${id}`);
  return data;
}
