import api from './api';

export const pontosColetaService = {
  listar: (params) => api.get('/pontos-coleta', { params }).then((r) => r.data),
};

export const denunciasService = {
  criar: (dados) => api.post('/denuncias', dados).then((r) => r.data),
  buscarPorProtocolo: (protocolo) =>
    api.get(`/denuncias/protocolo/${protocolo}`).then((r) => r.data),
  enviarFoto: async (protocolo, uri) => {
    const form = new FormData();
    form.append('foto', { uri, name: 'denuncia.jpg', type: 'image/jpeg' });
    return api
      .post(`/denuncias/${protocolo}/midia`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};

export const legislacaoService = {
  listarTudo: () => api.get('/legislacao').then((r) => r.data),
  porTipoResiduo: (tipo) => api.get(`/legislacao/tipo/${tipo}`).then((r) => r.data),
};

export const calculadoraService = {
  calcular: (itens) => api.post('/calculadora', itens).then((r) => r.data),
};

export const authService = {
  login: (email, senha) => api.post('/auth/login', { email, senha }).then((r) => r.data),
  registrar: (nome, email, senha) =>
    api.post('/auth/registro', { nome, email, senha }).then((r) => r.data),
  perfil: () => api.get('/auth/me').then((r) => r.data),
};
