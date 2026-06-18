import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { calculadoraService } from '../services';
import { colors } from '../theme';

const ITENS = [
  { key: 'celular', label: 'Celular', icon: '📱' },
  { key: 'notebook', label: 'Notebook', icon: '💻' },
  { key: 'bateria', label: 'Bateria/Pilha', icon: '🔋' },
  { key: 'tv_monitor', label: 'TV/Monitor', icon: '📺' },
];

export default function CalculadoraScreen() {
  const [qtds, setQtds] = useState({ celular: 0, notebook: 0, bateria: 0, tv_monitor: 0 });
  const [resultado, setResultado] = useState(null);
  const [calculando, setCalculando] = useState(false);

  function adj(key, d) {
    setQtds((p) => ({ ...p, [key]: Math.max(0, p[key] + d) }));
    setResultado(null);
  }

  async function calcular() {
    setCalculando(true);
    try {
      const r = await calculadoraService.calcular(qtds);
      setResultado(r);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.titulo}>Calculadora de impacto</Text>
      <Text style={styles.subtitulo}>Veja o impacto positivo do seu descarte correto.</Text>

      <View style={styles.card}>
        {ITENS.map((item) => (
          <View key={item.key} style={styles.itemRow}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <View style={styles.counter}>
              <TouchableOpacity style={styles.btn} onPress={() => adj(item.key, -1)}>
                <Text style={styles.btnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={styles.count}>{qtds[item.key]}</Text>
              <TouchableOpacity style={styles.btn} onPress={() => adj(item.key, 1)}>
                <Text style={styles.btnTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btnCalc, calculando && { opacity: 0.6 }]}
          onPress={calcular}
          disabled={calculando || Object.values(qtds).every((v) => v === 0)}
        >
          {calculando ? (
            <ActivityIndicator color={colors.branco} />
          ) : (
            <Text style={styles.btnCalcTxt}>Calcular impacto</Text>
          )}
        </TouchableOpacity>
      </View>

      {resultado && (
        <View style={styles.resultado}>
          <Text style={styles.resultTitulo}>Impacto estimado do seu descarte correto</Text>
          {[
            { label: 'Solo protegido', valor: `${resultado.solo_m2} m²` },
            { label: 'Metais evitados', valor: resultado.metais_g >= 1000 ? `${(resultado.metais_g / 1000).toFixed(1)} kg` : `${resultado.metais_g} g` },
            { label: 'Água preservada', valor: resultado.agua_l >= 1000 ? `${(resultado.agua_l / 1000).toFixed(1)} kL` : `${resultado.agua_l} L` },
            { label: 'CO₂ evitado', valor: `${resultado.co2_kg} kg` },
          ].map((r) => (
            <View key={r.label} style={styles.resultRow}>
              <Text style={styles.resultLabel}>{r.label}</Text>
              <Text style={styles.resultValor}>{r.valor}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fundo },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: colors.textoSecundario, marginBottom: 16 },
  card: { backgroundColor: colors.branco, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.borda },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.borda },
  icon: { fontSize: 22, width: 36 },
  itemLabel: { flex: 1, fontSize: 14 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.borda, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontSize: 18, lineHeight: 22 },
  count: { fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  btnCalc: { backgroundColor: colors.verde, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnCalcTxt: { color: colors.branco, fontWeight: '600', fontSize: 15 },
  resultado: { marginTop: 16, backgroundColor: colors.branco, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.borda },
  resultTitulo: { fontWeight: '600', marginBottom: 12, fontSize: 14 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.borda },
  resultLabel: { color: colors.textoSecundario, fontSize: 14 },
  resultValor: { fontWeight: '600', fontSize: 18, color: colors.verde },
});
