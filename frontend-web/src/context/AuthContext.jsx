import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      if (authService.estaAutenticado()) {
        try {
          const perfil = await authService.buscarPerfil();
          setUsuario(perfil);
        } catch {
          authService.logout();
        }
      }
      setCarregando(false);
    }
    carregarPerfil();
  }, []);

  async function entrar(email, senha) {
    const u = await authService.login(email, senha);
    setUsuario(u);
    return u;
  }

  async function cadastrar(nome, email, senha) {
    const u = await authService.registrar(nome, email, senha);
    setUsuario(u);
    return u;
  }

  function sair() {
    authService.logout();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
