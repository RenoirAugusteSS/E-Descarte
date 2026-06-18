import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Em desenvolvimento: 10.0.2.2 aponta para o localhost do PC no emulador Android
// Em produção: substitua pela URL real da API
const BASE_URL = process.env.API_URL || 'http://10.0.2.2:3000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('edescarte_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export default api;
