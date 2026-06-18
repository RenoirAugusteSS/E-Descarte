import api from './api';

export async function criarDenuncia(dados) {
  const { data } = await api.post('/denuncias', dados);
  return data; // { denuncia, legislacao_aplicavel }
}

export async function buscarDenunciaPorProtocolo(protocolo) {
  const { data } = await api.get(`/denuncias/protocolo/${protocolo}`);
  return data;
}

export async function enviarFotoDenuncia(protocolo, arquivo) {
  const formData = new FormData();
  formData.append('foto', arquivo);
  const { data } = await api.post(`/denuncias/${protocolo}/midia`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
