import axios from 'axios';
import { Platform } from 'react-native';

// ✅ Luôn dùng Render (bỏ qua local)
const API_URL = 'https://musicx-mobile-backend.onrender.com';

console.log('🔗 Using API:', API_URL);

// ✅ Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// ✅ API functions
export const Api = {
  fetchAlbums: async () => {
    try {
      const res = await apiClient.get('/api/albums');
      return res.data;
    } catch (err) {
      console.error('❌ ApiService: Failed to fetch albums', err.message);
      throw err;
    }
  },

  fetchArtists: async () => {
    try {
      const res = await apiClient.get('/api/artists');
      return res.data;
    } catch (err) {
      console.error('❌ ApiService: Failed to fetch artists', err.message);
      throw err;
    }
  },
};
