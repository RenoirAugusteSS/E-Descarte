import api from './api';

export async function registrar(nome, email, senha) {
  const { data } = await api.post('/auth/registro', { nome, email, senha });
  localStorage.setItem('edescarte_token', data.token);
  return data.usuario;
}

export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  localStorage.setItem('edescarte_token', data.token);
  return data.usuario;
}

export function logout() {
  localStorage.removeItem('edescarte_token');
}

export async function buscarPerfil() {
  const { data } = await api.get('/auth/me');
  return data;
}

export function estaAutenticado() {
  return !!localStorage.getItem('edescarte_token');
}
