import { useState, useEffect } from 'react';
import { listarLegislacao } from '../services/legislacaoService';

export default function Legislacao() {
  const [leis, setLeis] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarLegislacao()
      .then(setLeis)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="container">
      <h1>Legislação ambiental</h1>
      <p className="subtitle">
        Base legal que fundamenta o E-Descarte e a gestão de resíduos eletrônicos no Brasil.
      </p>

      {carregando && <p>Carregando legislação...</p>}

      {leis.map((lei) => (
        <div className="card" key={lei.id}>
          <h2 style={{ marginBottom: 6 }}>{lei.titulo}</h2>
          <p style={{ fontSize: 14, margin: '0 0 10px', lineHeight: 1.6 }}>{lei.resumo}</p>
          {lei.artigosRelevantes?.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: '0 0 10px' }}>
              <strong>Artigos relevantes:</strong> {lei.artigosRelevantes.join(' · ')}
            </p>
          )}
          <a
            href={lei.url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: 'var(--azul)', fontWeight: 500 }}
          >
            Ler texto completo no Planalto →
          </a>
        </div>
      ))}
    </div>
  );
}
