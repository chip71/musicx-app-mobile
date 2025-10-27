import axios from 'axios';
import { Platform } from 'react-native';

// ✅ Automatically use the correct base URL depending on platform
const MOBILE_API_URL = 'http://192.168.137.1:9999'; // 👈 Use your PC IPv4 for mobile
const WEB_API_URL = 'http://localhost:9999';        // 👈 Use localhost for web browser testing

const API_URL = Platform.OS === 'web' ? WEB_API_URL : MOBILE_API_URL;

// ✅ Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// ✅ Define all your API functions
export const Api = {
  fetchAlbums: async () => {
    try {
      const response = await apiClient.get('/api/albums');
      return response.data;
    } catch (error) {
      console.error('ApiService: Failed to fetch albums', error);
      throw error;
    }
  },

  fetchArtists: async () => {
    try {
      const response = await apiClient.get('/api/artists');
      return response.data;
    } catch (error) {
      console.error('ApiService: Failed to fetch artists', error);
      throw error;
    }
  },
};
