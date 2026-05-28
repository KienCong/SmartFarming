import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const groupService = axios.create({
  // Sử dụng IP server thật thay vì localhost
 // baseURL: 'http://192.168.0.110:8081/mongo/field-group', 
 //baseURL: 'http://10.11.63.106:8081/mongo/field-group',
  baseURL: 'http://112.137.129.218:8081/mongo/field-group',
  headers: {
    'Content-Type': 'application/json',
  }
});

groupService.interceptors.request.use(async (config) => {
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

export default groupService;