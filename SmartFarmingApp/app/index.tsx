import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

// Màu sắc chủ đạo (Ant Design colors)
const PRIMARY_BLUE = '#1890ff';
const BORDER_COLOR = '#d9d9d9';
const TEXT_SECONDARY = '#666';
const BG_COLOR = '#f0f2f5';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên tài khoản và mật khẩu!');
      return;
    }

    try {
      // Gọi API POST /auth/login
      const res = await api.post('/api/auth/login', {
        username: username,
        password: password
      });
      
      const data = res.data;

      // Lưu thông tin user/token vào AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(data));
      
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      
      // Chuyển hướng đến thư mục (tabs) - Nơi chứa danh sách cánh đồng
      router.replace('/(tabs)/fieldList');

    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* HEADER SECTION (Logo + Titles) */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* THAY THẾ ICON BẰNG ẢNH LOGO PNG */}
              <Image 
                source={require('../assets/images/logo-uet.png')}
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Smart Farming</Text>
            <Text style={styles.subtitle}>Hệ thống theo dõi và quản lý nông nghiệp</Text>
          </View>

          {/* FORM SECTION */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <FontAwesome name="user-o" size={20} color="#bfbfbf" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tên tài khoản"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#bfbfbf"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="#bfbfbf" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor="#bfbfbf"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={18} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            {/* Remember Me Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.8}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <AntDesign name="check" size={14} color="white" />}
                </View>
                <Text style={styles.optionsText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER LINKS */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLinkText}>Đăng ký ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}>
              <Text style={styles.footerLinkText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer: {
    width: 70,
    height: 70,
    // Xóa màu nền xanh cũ để logo PNG hiển thị đẹp hơn (đặc biệt nếu ảnh có nền trong suốt)
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoImage: {
    width: '200%', // Kích thước ảnh bằng với container
    height: '200%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  eyeIcon: {
    padding: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  optionsText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  loginButton: {
    backgroundColor: PRIMARY_BLUE,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 10,
  },
  footerLinkText: {
    color: PRIMARY_BLUE,
    fontSize: 14,
    fontWeight: '500',
  },
});