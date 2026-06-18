import { useState } from 'react';
import { calcularImpacto } from '../services/legislacaoService';

const ITENS = [
  { key: 'celular', label: 'Celular / Smartphone', desc: 'Evita até 60g de metais pesados no solo', icon: '📱' },
  { key: 'notebook', label: 'Notebook / Computador', desc: 'Evita até 1,8kg de metais pesados', icon: '💻' },
  { key: 'bateria', label: 'Bateria / Pilha', desc: 'Uma pilha contamina 1m² de solo', icon: '🔋' },
  { key: 'tv_monitor', label: 'TV / Monitor', desc: 'Até 4kg de chumbo por unidade', icon: '📺' },
];

export default function Calculadora() {
  const [qtds, setQtds] = useState({ celular: 0, notebook: 0, bateria: 0, tv_monitor: 0 });
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function ajustar(key, delta) {
    setQtds((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
    setResultado(null);
  }

  async function calcular() {
    const totalItens = Object.values(qtds).reduce((a, b) => a + b, 0);
    if (totalItens === 0) return;
    setCarregando(true);
    try {
      const dados = await calcularImpacto(qtds);
      setResultado(dados);
    } catch (err) {
      console.error('Erro na calculadora:', err);
    } finally {
      setCarregando(false);
    }
  }

  const MAX = { solo: 30, metais: 50000, agua: 50000, co2: 200 };

  return (
    <div className="container">
      <h1>Calculadora de impacto ambiental</h1>
      <p className="subtitle">
        Veja o impacto positivo do descarte correto dos seus eletrônicos.
      </p>

      <div className="card">
        {ITENS.map((item) => (
          <div className="calc-item" key={item.key}>
            <span style={{ fontSize: 24, width: 32 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--texto-secundario)' }}>{item.desc}</div>
            </div>
            <div className="calc-count">
              <button onClick={() => ajustar(item.key, -1)}>−</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 500 }}>
                {qtds[item.key]}
              </span>
              <button onClick={() => ajustar(item.key, 1)}>+</button>
            </div>
          </div>
        ))}

        <button
          className="primary"
          onClick={calcular}
          disabled={carregando || Object.values(qtds).every((v) => v === 0)}
          style={{ width: '100%', marginTop: 16 }}
        >
          {carregando ? 'Calculando...' : 'Calcular impacto'}
        </button>
      </div>

      {resultado && (
        <div className="card">
          <h2>Resultado — impacto do seu descarte correto</h2>
          <div className="impact-grid">
            <div>
              <div style={{ fontSize: 12, color: 'var(--texto-secundario)' }}>Solo protegido</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--verde-principal)' }}>
                {resultado.solo_m2} m²
              </div>
              <div className="impact-bar">
                <div
                  className="impact-fill"
                  style={{ width: `${Math.min(100, (resultado.solo_m2 / MAX.solo) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--texto-secundario)' }}>Metais evitados</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--verde-principal)' }}>
                {resultado.metais_g >= 1000
                  ? `${(resultado.metais_g / 1000).toFixed(1)} kg`
                  : `${resultado.metais_g} g`}
              </div>
              <div className="impact-bar">
                <div
                  className="impact-fill"
                  style={{ width: `${Math.min(100, (resultado.metais_g / MAX.metais) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--texto-secundario)' }}>Água preservada</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--verde-principal)' }}>
                {resultado.agua_l >= 1000
                  ? `${(resultado.agua_l / 1000).toFixed(1)} kL`
                  : `${resultado.agua_l} L`}
              </div>
              <div className="impact-bar">
                <div
                  className="impact-fill"
                  style={{ width: `${Math.min(100, (resultado.agua_l / MAX.agua) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--texto-secundario)' }}>CO₂ evitado</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--verde-principal)' }}>
                {resultado.co2_kg} kg
              </div>
              <div className="impact-bar">
                <div
                  className="impact-fill"
                  style={{ width: `${Math.min(100, (resultado.co2_kg / MAX.co2) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--texto-secundario)' }}>
            * Valores estimados com base em dados da ABRELPE e EPA para fins educacionais.
          </p>
        </div>
      )}
    </div>
  );
}
