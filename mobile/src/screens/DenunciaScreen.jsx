import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { denunciasService, legislacaoService } from '../services';
import { colors } from '../theme';

const TIPOS = [
  { valor: 'celulares_tablets', label: 'Celulares / Tablets' },
  { valor: 'computadores', label: 'Computadores / Notebooks' },
  { valor: 'baterias_pilhas', label: 'Baterias / Pilhas' },
  { valor: 'eletrodomesticos', label: 'Eletrodomésticos' },
  { valor: 'outros', label: 'Outros eletrônicos' },
];

const GRAVIDADES = [
  { valor: 'baixa', label: 'Baixa' },
  { valor: 'media', label: 'Média' },
  { valor: 'alta', label: 'Alta' },
];

export default function DenunciaScreen() {
  const [tipoResiduo, setTipoResiduo] = useState('celulares_tablets');
  const [gravidade, setGravidade] = useState('media');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [coords, setCoords] = useState(null);
  const [legislacao, setLegislacao] = useState([]);
  const [carregandoLei, setCarregandoLei] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [protocolo, setProtocolo] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function buscarLei() {
      setCarregandoLei(true);
      try {
        const leis = await legislacaoService.porTipoResiduo(tipoResiduo);
        if (ativo) setLegislacao(leis);
      } finally {
        if (ativo) setCarregandoLei(false);
      }
    }
    buscarLei();
    return () => { ativo = false; };
  }, [tipoResiduo]);

  async function usarGps() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Ative a localização para usar esta função.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    Alert.alert('GPS ativado', `Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`);
  }

  async function enviar() {
    if (!endereco || !cidade) {
      Alert.alert('Atenção', 'Endereço e cidade são obrigatórios.');
      return;
    }
    setEnviando(true);
    try {
      const resp = await denunciasService.criar({
        tipo_residuo: tipoResiduo,
        gravidade,
        endereco,
        cidade,
        descricao,
        anonimo,
        ...(coords && { latitude: coords.lat, longitude: coords.lng }),
      });
      setProtocolo(resp.denuncia.protocolo);
      Alert.alert('Denúncia registrada!', `Protocolo: ${resp.denuncia.protocolo}`);
      setEndereco(''); setCidade(''); setDescricao(''); setCoords(null);
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.erro || 'Falha ao enviar denúncia.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.titulo}>Registrar denúncia</Text>
      <Text style={styles.subtitulo}>Reporte descartes irregulares de eletrônicos.</Text>

      {protocolo && (
        <View style={styles.successBox}>
          <Text style={styles.successTxt}>✓ Enviado! Protocolo: {protocolo}</Text>
        </View>
      )}

      <Text style={styles.label}>Tipo de resíduo</Text>
      <View style={styles.selectorRow}>
        {TIPOS.map((t) => (
          <TouchableOpacity
            key={t.valor}
            style={[styles.chip, tipoResiduo === t.valor && styles.chipAtivo]}
            onPress={() => setTipoResiduo(t.valor)}
          >
            <Text style={[styles.chipTxt, tipoResiduo === t.valor && styles.chipTxtAtivo]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Gravidade</Text>
      <View style={styles.selectorRow}>
        {GRAVIDADES.map((g) => (
          <TouchableOpacity
            key={g.valor}
            style={[styles.chip, gravidade === g.valor && styles.chipAtivo]}
            onPress={() => setGravidade(g.valor)}
          >
            <Text style={[styles.chipTxt, gravidade === g.valor && styles.chipTxtAtivo]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Endereço do descarte</Text>
      <TextInput
        style={styles.input}
        placeholder="Rua, número, referência"
        value={endereco}
        onChangeText={setEndereco}
      />

      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Salvador"
        value={cidade}
        onChangeText={setCidade}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="Descreva a ocorrência..."
        value={descricao}
        onChangeText={setDescricao}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Manter anonimato</Text>
        <Switch value={anonimo} onValueChange={setAnonimo} trackColor={{ true: colors.verde }} />
      </View>

      <TouchableOpacity style={styles.btnGps} onPress={usarGps}>
        <Text style={styles.btnGpsTxt}>📍 Usar localização GPS</Text>
      </TouchableOpacity>
      {coords && (
        <Text style={styles.coordsTxt}>GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</Text>
      )}

      {/* MÓDULO LEGAL - exibido em tempo real */}
      <View style={styles.legalBox}>
        <Text style={styles.legalTitulo}>📜 Legislação aplicável</Text>
        {carregandoLei ? (
          <ActivityIndicator color={colors.ambar} />
        ) : (
          legislacao.map((lei) => (
            <View key={lei.id} style={styles.legalItem}>
              <Text style={styles.legalNome}>{lei.titulo}</Text>
              <Text style={styles.legalResumo}>{lei.resumo}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={[styles.btnEnviar, enviando && { opacity: 0.6 }]}
        onPress={enviar}
        disabled={enviando}
      >
        <Text style={styles.btnEnviarTxt}>{enviando ? 'Enviando...' : 'Enviar denúncia'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fundo },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 4, color: colors.textoPrincipal },
  subtitulo: { fontSize: 14, color: colors.textoSecundario, marginBottom: 20 },
  label: { fontSize: 13, color: colors.textoSecundario, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: colors.branco, borderWidth: 1, borderColor: colors.borda, borderRadius: 8, padding: 10, fontSize: 14 },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.borda, backgroundColor: colors.branco },
  chipAtivo: { backgroundColor: colors.verde, borderColor: colors.verde },
  chipTxt: { fontSize: 12, color: colors.textoSecundario },
  chipTxtAtivo: { color: colors.branco, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  btnGps: { marginTop: 12, padding: 10, backgroundColor: colors.verdeClaro, borderRadius: 8, alignItems: 'center' },
  btnGpsTxt: { color: colors.verde, fontWeight: '500' },
  coordsTxt: { fontSize: 12, color: colors.textoSecundario, marginTop: 4, textAlign: 'center' },
  legalBox: { marginTop: 20, backgroundColor: colors.ambarClaro, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#FAC775' },
  legalTitulo: { fontSize: 14, fontWeight: '600', color: colors.ambar, marginBottom: 10 },
  legalItem: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F0DDB7' },
  legalNome: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  legalResumo: { fontSize: 12, color: colors.textoSecundario, lineHeight: 18 },
  btnEnviar: { backgroundColor: colors.verde, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnEnviarTxt: { color: colors.branco, fontWeight: '600', fontSize: 15 },
  successBox: { backgroundColor: colors.verdeClaro, borderRadius: 8, padding: 12, marginBottom: 16 },
  successTxt: { color: colors.verde, fontWeight: '500' },
});
