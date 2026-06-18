import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { listarPontosColeta } from '../services/pontosColetaService';

const CENTRO_PADRAO = { lat: -12.9777, lng: -38.5016 }; // Salvador, BA

const CORES_TIPO = {
  oficial: '#1D9E75',
  ecoponto_municipal: '#378ADD',
  parceiro: '#0F6E56',
};

export default function MapaColeta() {
  const [pontos, setPontos] = useState([]);
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const carregarPontos = useCallback(async (cidade) => {
    setCarregando(true);
    try {
      const dados = await listarPontosColeta(cidade ? { cidade } : {});
      setPontos(dados);
    } catch (err) {
      console.error('Erro ao carregar pontos de coleta:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPontos();
  }, [carregarPontos]);

  function buscar(e) {
    e.preventDefault();
    carregarPontos(busca);
  }

  return (
    <div className="container">
      <h1>Mapa de pontos de coleta</h1>
      <p className="subtitle">
        Encontre o ponto de coleta mais próximo para descartar seus eletrônicos corretamente.
      </p>

      <form onSubmit={buscar} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por cidade (ex: Salvador)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button className="primary" type="submit">
          Buscar
        </button>
      </form>

      <div className="map-container">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={
              pontos.length > 0
                ? { lat: pontos[0].latitude, lng: pontos[0].longitude }
                : CENTRO_PADRAO
            }
            zoom={12}
          >
            {pontos.map((ponto) => (
              <Marker
                key={ponto.id}
                position={{ lat: ponto.latitude, lng: ponto.longitude }}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE,
                  scale: 8,
                  fillColor: CORES_TIPO[ponto.tipo] || '#1D9E75',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#fff',
                }}
                onClick={() => setSelecionado(ponto)}
              />
            ))}

            {selecionado && (
              <InfoWindow
                position={{ lat: selecionado.latitude, lng: selecionado.longitude }}
                onCloseClick={() => setSelecionado(null)}
              >
                <div style={{ fontSize: 13 }}>
                  <strong>{selecionado.nome}</strong>
                  <p style={{ margin: '4px 0' }}>{selecionado.endereco}</p>
                  <p style={{ margin: '4px 0' }}>{selecionado.horario_funcionamento}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--fundo)',
              color: 'var(--texto-secundario)',
              fontSize: 13,
            }}
          >
            {import.meta.env.VITE_GOOGLE_MAPS_API_KEY
              ? 'Carregando mapa...'
              : 'Configure VITE_GOOGLE_MAPS_API_KEY no .env para exibir o mapa interativo.'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: 'var(--texto-secundario)' }}>
        <span><span style={{ color: CORES_TIPO.oficial }}>●</span> Ponto oficial</span>
        <span><span style={{ color: CORES_TIPO.ecoponto_municipal }}>●</span> Ecoponto municipal</span>
        <span><span style={{ color: CORES_TIPO.parceiro }}>●</span> Parceiro</span>
      </div>

      <h2 style={{ marginTop: 28 }}>Pontos encontrados ({pontos.length})</h2>
      {carregando && <p>Carregando...</p>}
      {!carregando && pontos.length === 0 && <p>Nenhum ponto de coleta encontrado.</p>}

      {pontos.map((ponto) => (
        <div className="card" key={ponto.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <strong>{ponto.nome}</strong>
              <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-secundario)' }}>
                {ponto.endereco}, {ponto.cidade}
              </p>
              <p style={{ margin: '4px 0', fontSize: 13 }}>
                Aceita: {(ponto.itens_aceitos || []).join(', ')}
              </p>
              <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--texto-secundario)' }}>
                {ponto.horario_funcionamento}
              </p>
            </div>
            <span
              className={`badge ${
                ponto.tipo === 'oficial'
                  ? 'badge-verde'
                  : ponto.tipo === 'ecoponto_municipal'
                  ? 'badge-azul'
                  : 'badge-verde'
              }`}
            >
              {ponto.tipo.replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
