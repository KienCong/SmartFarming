import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const fieldService = axios.create({
  // Chú ý: Đuôi là /mongo thay vì /api
 // baseURL: 'http://112.137.129.218:8081/mongo', 
 //  baseURL: 'http://192.168.0.110:8081/mongo',  
 baseURL: 'http://10.11.63.106:8081/mongo',
  headers: {
    'Content-Type': 'application/json',
  }
});

fieldService.interceptors.request.use(async (config) => {
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

export default fieldService;