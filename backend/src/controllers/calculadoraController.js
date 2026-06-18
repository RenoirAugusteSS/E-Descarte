// Coeficientes de impacto ambiental por tipo de item (valores de
// referência baseados em estudos da ABRELPE/EPA para fins educacionais).
const COEFICIENTES = {
  celular: { soloM2: 0.1, metaisG: 60, aguaL: 500, co2Kg: 0.5 },
  notebook: { soloM2: 2, metaisG: 1800, aguaL: 2000, co2Kg: 4 },
  bateria: { soloM2: 1, metaisG: 8, aguaL: 200, co2Kg: 0.1 },
  tv_monitor: { soloM2: 3, metaisG: 4000, aguaL: 1500, co2Kg: 6 },
};

/**
 * POST /api/calculadora
 * Body: { celular: number, notebook: number, bateria: number, tv_monitor: number }
 * Retorna o impacto ambiental positivo estimado do descarte correto.
 */
function calcular(req, res) {
  const itens = req.body || {};

  let soloM2 = 0;
  let metaisG = 0;
  let aguaL = 0;
  let co2Kg = 0;

  for (const [item, coef] of Object.entries(COEFICIENTES)) {
    const quantidade = Number(itens[item]) || 0;
    if (quantidade < 0) {
      return res.status(400).json({ erro: `Quantidade inválida para o item "${item}".` });
    }
    soloM2 += quantidade * coef.soloM2;
    metaisG += quantidade * coef.metaisG;
    aguaL += quantidade * coef.aguaL;
    co2Kg += quantidade * coef.co2Kg;
  }

  return res.json({
    solo_m2: Number(soloM2.toFixed(2)),
    metais_g: Number(metaisG.toFixed(2)),
    agua_l: Number(aguaL.toFixed(2)),
    co2_kg: Number(co2Kg.toFixed(2)),
    coeficientes_utilizados: COEFICIENTES,
  });
}

module.exports = { calcular };
