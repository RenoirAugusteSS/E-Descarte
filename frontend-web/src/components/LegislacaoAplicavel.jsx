/**
 * Componente do Módulo Legal.
 * Recebe a lista de legislações aplicáveis (vindas da API com base no
 * tipo de resíduo selecionado) e exibe um resumo de cada uma, com link
 * para o texto completo da lei.
 */
export default function LegislacaoAplicavel({ legislacao, carregando }) {
  if (carregando) {
    return (
      <div className="legal-box">
        <h4>📜 Legislação aplicável</h4>
        <p style={{ fontSize: 13, color: 'var(--texto-secundario)' }}>Carregando...</p>
      </div>
    );
  }

  if (!legislacao || legislacao.length === 0) {
    return null;
  }

  return (
    <div className="legal-box">
      <h4>📜 Legislação aplicável a este tipo de resíduo</h4>
      {legislacao.map((lei) => (
        <div key={lei.id} className="legal-item">
          <strong>{lei.titulo}</strong>
          <div className="resumo">{lei.resumo}</div>
          {lei.artigosRelevantes && lei.artigosRelevantes.length > 0 && (
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--texto-secundario)' }}>
              Artigos relevantes: {lei.artigosRelevantes.join(', ')}
            </div>
          )}
          <a href={lei.url} target="_blank" rel="noreferrer">
            Ler texto completo →
          </a>
        </div>
      ))}
    </div>
  );
}
