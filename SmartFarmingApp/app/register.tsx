import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

// Định nghĩa mã màu xanh chuẩn theo phong cách hiện đại (Modern Blue)
const PRIMARY_BLUE = '#1890ff';
const INPUT_BG = '#f3f4f6';     // Nền xám nhạt cho ô nhập liệu
const TEXT_LABEL = '#6b7280';   // Màu xám cho nhãn (Label)

export default function RegisterScreen() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      // Gọi API Đăng ký
      await api.post('api/auth/register', {
        username: username,
        email: email,
        password: password
      });
      
      Alert.alert('Thành công', 'Đăng ký tài khoản Smart Farming thành công!');
      router.push('/'); // Quay lại trang Login
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* LOGO SECTION */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo-uet.png')} // Lưu ý: Chỉnh lại số lượng dấu ../ nếu file này nằm ở thư mục khác với Login
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>

          {/* Tiêu đề chuyển sang màu xanh */}
          <Text style={styles.title}>Đăng Ký</Text>

          <View style={styles.form}>
            {/* Nhóm Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên người dùng:</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholder="Nhập tên tài khoản..."
              />
            </View>

            {/* Nhóm Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="example@gmail.com"
              />
            </View>

            {/* Nhóm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu:</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                placeholder="••••••••"
              />
            </View>

            {/* Nhóm Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận Mật khẩu:</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                placeholder="••••••••"
              />
            </View>

            {/* Nút bấm Sign up màu xanh */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>

          {/* Phần Footer với các link màu xanh */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Các điều khoản dịch vụ với link màu xanh */}
          <Text style={styles.termsText}>
            By creating or logging into an account you are agreeing with our {'\n'}
            <Text style={styles.termsLink}>Terms and Conditions</Text> and <Text style={styles.termsLink}>Privacy Statement</Text>
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 60, // Đẩy xuống một chút cho thoáng phần trên
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  // Style cho Logo giống bên Login
  logoContainer: {
    width: 80, 
    height: 80,
    backgroundColor: '#fff', 
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center', // Căn giữa logo
    marginBottom: 15,
    borderRadius: 40, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  logoImage: {
    width: '200%', 
    height: '200%',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: PRIMARY_BLUE, // Tiêu đề màu xanh
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_LABEL,
    marginBottom: 8,
  },
  input: {
    backgroundColor: INPUT_BG,
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  registerButton: {
    backgroundColor: PRIMARY_BLUE, // Nút bấm màu xanh
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 35,
  },
  footerText: {
    color: TEXT_LABEL,
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    color: PRIMARY_BLUE, // Link Login màu xanh
    fontSize: 15,
    fontWeight: 'bold',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: TEXT_LABEL,
    lineHeight: 20,
  },
  termsLink: {
    color: PRIMARY_BLUE, // Link điều khoản màu xanh
    fontWeight: '600',
  }
});