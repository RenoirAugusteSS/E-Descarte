import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [aba, setAba] = useState('login');
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { entrar, cadastrar } = useAuth();
  const navigate = useNavigate();

  function campo(f, v) {
    setForm((p) => ({ ...p, [f]: v }));
  }

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (aba === 'login') {
        await entrar(form.email, form.senha);
      } else {
        await cadastrar(form.nome, form.email, form.senha);
      }
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao autenticar. Verifique os dados.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 40 }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32 }}>🌱</div>
          <h2 style={{ marginTop: 8 }}>E-Descarte</h2>
        </div>

        <div className="tabs">
          <button className={`tab ${aba === 'login' ? 'active' : ''}`} onClick={() => setAba('login')}>
            Entrar
          </button>
          <button className={`tab ${aba === 'cadastro' ? 'active' : ''}`} onClick={() => setAba('cadastro')}>
            Cadastrar
          </button>
        </div>

        {erro && <div className="error-box">{erro}</div>}

        <form onSubmit={enviar}>
          {aba === 'cadastro' && (
            <div className="form-group">
              <label>Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => campo('nome', e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => campo('email', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={(e) => campo('senha', e.target.value)}
              required
            />
          </div>
          <button className="primary" type="submit" style={{ width: '100%' }} disabled={enviando}>
            {enviando ? 'Aguarde...' : aba === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
