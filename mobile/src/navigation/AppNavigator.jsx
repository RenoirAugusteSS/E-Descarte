import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MapaColetaScreen from '../screens/MapaColetaScreen';
import DenunciaScreen from '../screens/DenunciaScreen';
import CalculadoraScreen from '../screens/CalculadoraScreen';
import LegislacaoScreen from '../screens/LegislacaoScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONES = {
  Mapa: '🗺️',
  Denúncia: '⚠️',
  Calculadora: '🌱',
  Legislação: '📜',
};

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONES[route.name]}</Text>,
          tabBarActiveTintColor: colors.verde,
          tabBarInactiveTintColor: colors.textoSecundario,
          headerStyle: { backgroundColor: colors.branco },
          headerTitleStyle: { color: colors.verde, fontWeight: '600' },
          headerTitle: `🌱 E-Descarte`,
        })}
      >
        <Tab.Screen name="Mapa" component={MapaColetaScreen} />
        <Tab.Screen name="Denúncia" component={DenunciaScreen} />
        <Tab.Screen name="Calculadora" component={CalculadoraScreen} />
        <Tab.Screen name="Legislação" component={LegislacaoScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
