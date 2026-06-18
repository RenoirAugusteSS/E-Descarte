import { useState, useEffect } from 'react';
import { criarDenuncia, enviarFotoDenuncia } from '../services/denunciasService';
import { legislacaoPorTipoResiduo } from '../services/legislacaoService';
import LegislacaoAplicavel from '../components/LegislacaoAplicavel';

const TIPOS_RESIDUO = [
  { valor: 'celulares_tablets', label: 'Celulares / Tablets' },
  { valor: 'computadores', label: 'Computadores / Notebooks' },
  { valor: 'baterias_pilhas', label: 'Baterias / Pilhas' },
  { valor: 'eletrodomesticos', label: 'Eletrodomésticos' },
  { valor: 'outros', label: 'Outros eletrônicos' },
];

const GRAVIDADES = [
  { valor: 'baixa', label: 'Baixa - poucos itens' },
  { valor: 'media', label: 'Média - acúmulo recente' },
  { valor: 'alta', label: 'Alta - descarte contínuo' },
];

const ESTADO_INICIAL = {
  tipo_residuo: 'celulares_tablets',
  gravidade: 'media',
  endereco: '',
  cidade: '',
  cep: '',
  descricao: '',
  anonimo: false,
  contato_email: '',
  contato_telefone: '',
};

export default function Denuncia() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [legislacao, setLegislacao] = useState([]);
  const [carregandoLegislacao, setCarregandoLegislacao] = useState(false);
  const [foto, setFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  // Atualiza a legislação aplicável sempre que o tipo de resíduo mudar
  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregandoLegislacao(true);
      try {
        const dados = await legislacaoPorTipoResiduo(form.tipo_residuo);
        if (!cancelado) setLegislacao(dados);
      } catch (err) {
        console.error('Erro ao buscar legislação:', err);
      } finally {
        if (!cancelado) setCarregandoLegislacao(false);
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [form.tipo_residuo]);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function usarGps() {
    if (!navigator.geolocation) {
      setErro('Geolocalização não suportada neste navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
      },
      () => setErro('Não foi possível obter sua localização.')
    );
  }

  async function enviar(e) {
    e.preventDefault();
    setErro(null);

    if (!form.endereco || !form.cidade) {
      setErro('Endereço e cidade são obrigatórios.');
      return;
    }

    setEnviando(true);
    try {
      const resposta = await criarDenuncia(form);
      setResultado(resposta);

      if (foto) {
        await enviarFotoDenuncia(resposta.denuncia.protocolo, foto);
      }

      setForm(ESTADO_INICIAL);
      setFoto(null);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container">
      <h1>Registrar denúncia</h1>
      <p className="subtitle">
        Registre o descarte irregular de eletrônicos. Você pode manter o anonimato.
      </p>

      {erro && <div className="error-box">{erro}</div>}

      {resultado && (
        <div className="success-box">
          ✓ Denúncia registrada com sucesso! Protocolo: <strong>{resultado.denuncia.protocolo}</strong>.
          Em até 48h a equipe responsável fará a verificação do local.
        </div>
      )}

      <form onSubmit={enviar}>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo de resíduo</label>
            <select
              value={form.tipo_residuo}
              onChange={(e) => atualizarCampo('tipo_residuo', e.target.value)}
            >
              {TIPOS_RESIDUO.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Gravidade estimada</label>
            <select
              value={form.gravidade}
              onChange={(e) => atualizarCampo('gravidade', e.target.value)}
            >
              {GRAVIDADES.map((g) => (
                <option key={g.valor} value={g.valor}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Endereço do descarte</label>
          <input
            type="text"
            placeholder="Ex: Rua das Flores, 200, próximo ao mercado"
            value={form.endereco}
            onChange={(e) => atualizarCampo('endereco', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cidade</label>
            <input
              type="text"
              placeholder="Salvador"
              value={form.cidade}
              onChange={(e) => atualizarCampo('cidade', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>CEP (opcional)</label>
            <input
              type="text"
              placeholder="40000-000"
              value={form.cep}
              onChange={(e) => atualizarCampo('cep', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Descrição da ocorrência</label>
          <textarea
            rows={3}
            placeholder="Descreva o que foi observado, quantos itens aproximadamente e há quanto tempo está no local..."
            value={form.descricao}
            onChange={(e) => atualizarCampo('descricao', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Foto do local (opcional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contato por e-mail (opcional)</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.contato_email}
              onChange={(e) => atualizarCampo('contato_email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Contato por telefone/SMS (opcional)</label>
            <input
              type="tel"
              placeholder="+55 71 99999-9999"
              value={form.contato_telefone}
              onChange={(e) => atualizarCampo('contato_telefone', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="anonimo"
            style={{ width: 'auto' }}
            checked={form.anonimo}
            onChange={(e) => atualizarCampo('anonimo', e.target.checked)}
          />
          <label htmlFor="anonimo" style={{ margin: 0 }}>
            Manter anonimato (seus dados não serão associados a esta denúncia)
          </label>
        </div>

        {/* MÓDULO LEGAL - exibido em tempo real conforme o tipo de resíduo */}
        <LegislacaoAplicavel legislacao={legislacao} carregando={carregandoLegislacao} />

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="primary" type="submit" disabled={enviando} style={{ flex: 1 }}>
            {enviando ? 'Enviando...' : 'Enviar denúncia'}
          </button>
          <button type="button" className="secondary" onClick={usarGps}>
            Usar GPS
          </button>
        </div>
      </form>
    </div>
  );
}
