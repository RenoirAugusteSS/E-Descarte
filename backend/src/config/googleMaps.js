require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

/**
 * Converte um endereço em coordenadas (latitude/longitude) usando a
 * Geocoding API do Google Maps.
 * @param {string} endereco - endereço completo (rua, cidade, CEP)
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocodificarEndereco(endereco) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('[GoogleMaps] GOOGLE_MAPS_API_KEY não configurada - geocoding desativado.');
    return null;
  }

  try {
    const url = `${GEOCODING_URL}?address=${encodeURIComponent(endereco)}&key=${GOOGLE_MAPS_API_KEY}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados.status !== 'OK' || !dados.results.length) {
      console.warn(`[GoogleMaps] Endereço não encontrado: ${endereco}`);
      return null;
    }

    const { lat, lng } = dados.results[0].geometry.location;
    return { lat, lng };
  } catch (err) {
    console.error('[GoogleMaps] Erro no geocoding:', err.message);
    return null;
  }
}

/**
 * Calcula a distância aproximada (em km) entre dois pontos
 * usando a fórmula de Haversine - não depende de API externa.
 */
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { geocodificarEndereco, calcularDistanciaKm };
