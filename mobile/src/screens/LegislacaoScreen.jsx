import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { legislacaoService } from '../services';
import { colors } from '../theme';

export default function LegislacaoScreen() {
  const [leis, setLeis] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    legislacaoService.listarTudo()
      .then(setLeis)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.verde} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.titulo}>Legislação ambiental</Text>
      <Text style={styles.subtitulo}>Base legal que fundamenta o E-Descarte.</Text>

      {leis.map((lei) => (
        <View key={lei.id} style={styles.card}>
          <Text style={styles.cardTitulo}>{lei.titulo}</Text>
          <Text style={styles.cardResumo}>{lei.resumo}</Text>
          {lei.artigosRelevantes?.length > 0 && (
            <Text style={styles.artigos}>
              Artigos: {lei.artigosRelevantes.join(' · ')}
            </Text>
          )}
          <TouchableOpacity onPress={() => Linking.openURL(lei.url)}>
            <Text style={styles.link}>Ler texto completo →</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fundo },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: colors.textoSecundario, marginBottom: 16 },
  card: { backgroundColor: colors.branco, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borda },
  cardTitulo: { fontWeight: '700', fontSize: 14, marginBottom: 8 },
  cardResumo: { fontSize: 13, color: colors.textoSecundario, lineHeight: 20, marginBottom: 8 },
  artigos: { fontSize: 12, color: colors.textoSecundario, marginBottom: 8 },
  link: { color: colors.azul, fontSize: 13, fontWeight: '500' },
});
