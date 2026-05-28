import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Xóa thông tin user đã lưu trong máy điện thoại
              await AsyncStorage.removeItem('user'); 
              
              // 2. Điều hướng ép buộc quay về màn hình login gốc (app/index.tsx)
              router.replace('/'); 
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất vào lúc này. Vui lòng thử lại!');
            }
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1890ff', // Màu xanh dương Ant Design
        tabBarInactiveTintColor: '#8c8c8c',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#1890ff',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* 1. TAB CÁNH ĐỒNG */}
      <Tabs.Screen
        name="fieldList"
        options={{
          title: 'Cánh đồng',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="sprout" size={size} color={color} />
          ),
          headerTitle: 'Quản lý cánh đồng',
        }}
      />

      {/* 2. TAB NHÓM CÁNH ĐỒNG */}
      <Tabs.Screen
        name="FieldGroupList"
        options={{
          title: 'Nhóm',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shape-outline" size={size} color={color} />
          ),
          headerTitle: 'Nhóm cánh đồng',
        }}
      />

      {/* 3. TAB THỜI TIẾT */}
      <Tabs.Screen
        name="WeatherGroupList"
        options={{
          title: 'Thời tiết',
          tabBarIcon: ({ color, size }) => (
            <Feather name="cloud-rain" size={size} color={color} />
          ),
          headerTitle: 'Dự báo & Thời tiết',
        }}
      />
      {/* 4. TAB NGƯỜI DÙNG / CÁ NHÂN */}
      <Tabs.Screen
        name="User"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
          headerTitle: 'Tài khoản của tôi',
          // Thêm nút Đăng xuất (Logout) vào góc trên bên phải thanh Header
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <AntDesign name="logout" size={20} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
       {/* 4. TAB NGƯỜI DÙNG / CÁ NHÂN */}
      <Tabs.Screen
        name="UserList" 
        options={{
          title: 'DS người dùng ',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
          headerTitle: 'Danh sách người dùng',
        }}
      />
    </Tabs>
  );
}