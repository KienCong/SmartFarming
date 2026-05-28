import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
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
        name="index"
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
        name="groups" 
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
        name="weather" 
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
        name="users" 
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
          headerTitle: 'Tài khoản của tôi',
        }}
      />
    </Tabs>
  );
}