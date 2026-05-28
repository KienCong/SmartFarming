import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  // Trỏ chính xác vào IP và Port server của em
  // baseURL: 'http://192.168.0.110:8081', local wifi home
  baseURL: 'http://112.137.129.218:8081', 
 //baseURL: 'http://10.11.63.106:8081',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(async (config) => {
  try {
    const userString = await AsyncStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.accessToken) {
        config.headers['Authorization'] = `Bearer ${user.accessToken}`;
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy token:", error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;