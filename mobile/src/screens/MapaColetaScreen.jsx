import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { pontosColetaService } from '../services';
import { colors } from '../theme';

const REGIAO_PADRAO = {
  latitude: -12.9777,
  longitude: -38.5016,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const COR_TIPO = {
  oficial: colors.verde,
  ecoponto_municipal: colors.azul,
  parceiro: '#2E7D32',
};

export default function MapaColetaScreen() {
  const [pontos, setPontos] = useState([]);
  const [busca, setBusca] = useState('');
  const [regiao, setRegiao] = useState(REGIAO_PADRAO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegiao((r) => ({
          ...r,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
        await carregarPontos({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          raioKm: 10,
        });
      } else {
        await carregarPontos();
      }
    })();
  }, []);

  async function carregarPontos(params) {
    setCarregando(true);
    try {
      const dados = await pontosColetaService.listar(params);
      setPontos(dados);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function buscar() {
    carregarPontos({ cidade: busca });
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por cidade..."
          value={busca}
          onChangeText={setBusca}
        />
        <TouchableOpacity style={styles.btnBuscar} onPress={buscar}>
          <Text style={styles.btnBuscarTxt}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <MapView style={styles.mapa} region={regiao} showsUserLocation>
        {pontos.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            pinColor={COR_TIPO[p.tipo] || colors.verde}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutNome}>{p.nome}</Text>
                <Text style={styles.calloutInfo}>{p.endereco}</Text>
                <Text style={styles.calloutInfo}>{p.horario_funcionamento}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {carregando && (
        <ActivityIndicator style={styles.loader} color={colors.verde} size="large" />
      )}

      <FlatList
        style={styles.lista}
        data={pontos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <View style={[styles.badge, { backgroundColor: colors.verdeClaro }]}>
                <Text style={[styles.badgeTxt, { color: colors.verde }]}>
                  {item.tipo.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text style={styles.cardInfo}>{item.endereco}, {item.cidade}</Text>
            <Text style={styles.cardInfo}>Aceita: {(item.itens_aceitos || []).join(', ')}</Text>
            <Text style={styles.cardHorario}>{item.horario_funcionamento}</Text>
          </View>
        )}
        ListEmptyComponent={
          !carregando ? <Text style={styles.vazio}>Nenhum ponto encontrado.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fundo },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: colors.branco, borderBottomWidth: 1, borderColor: colors.borda },
  input: { flex: 1, borderWidth: 1, borderColor: colors.borda, borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: colors.branco },
  btnBuscar: { backgroundColor: colors.verde, padding: 10, borderRadius: 8, justifyContent: 'center' },
  btnBuscarTxt: { color: colors.branco, fontWeight: '500' },
  mapa: { height: 260 },
  loader: { position: 'absolute', top: '40%', alignSelf: 'center' },
  lista: { flex: 1 },
  card: { backgroundColor: colors.branco, margin: 10, marginBottom: 0, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.borda },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardNome: { fontSize: 14, fontWeight: '600', flex: 1 },
  cardInfo: { fontSize: 13, color: colors.textoSecundario, marginTop: 2 },
  cardHorario: { fontSize: 12, color: colors.textoSecundario, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeTxt: { fontSize: 11, fontWeight: '500' },
  callout: { width: 200, padding: 4 },
  calloutNome: { fontWeight: '600', marginBottom: 4 },
  calloutInfo: { fontSize: 12, color: colors.textoSecundario },
  vazio: { textAlign: 'center', padding: 24, color: colors.textoSecundario },
});
