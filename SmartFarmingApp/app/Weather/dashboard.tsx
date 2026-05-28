import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Cấu hình các cảm biến giống hệt trên bản Web
const SENSOR_CONFIG = [
  { id: 'temperature', name: 'Nhiệt độ môi trường', unit: '°C', icon: 'temperature-high', color: '#cf1322' },
  { id: 'relativeHumidity', name: 'Độ ẩm không khí', unit: '%', icon: 'water', color: '#096dd9' },
  { id: 'rain', name: 'Lượng mưa tích lũy', unit: 'mm', icon: 'cloud-rain', color: '#3f6600' },
  { id: 'radiation', name: 'Bức xạ mặt trời', unit: 'MJ/m²/h', icon: 'sun', color: '#d48806' },
  { id: 'wind', name: 'Tốc độ gió', unit: 'm/s', icon: 'wind', color: '#531dab' },
];

export default function WeatherDashboardScreen() {
  const router = useRouter();
  // Nhận thông tin nhóm từ Màn hình 1 truyền sang
  const { groupId, groupName } = useLocalSearchParams();

  const renderSensorItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Điều hướng sang Màn hình 3 (Biểu đồ)
        router.push({
          pathname: '/Weather/detail',
          params: { sensorId: item.id, sensorName: item.name, groupId }
        });
      }}
    >
      <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
        <FontAwesome5 name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.infoWrapper}>
        <Text style={styles.sensorName}>{item.name}</Text>
        <Text style={styles.sensorUnit}>Đơn vị đo: {item.unit}</Text>
      </View>
      <MaterialCommunityIcons name="chart-line" size={24} color="#1890ff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tùy chỉnh thanh tiêu đề (Header) của trang này */}
      <Stack.Screen options={{ title: `Trạm: ${groupName || 'Chưa rõ'}`, headerBackTitle: 'Quay lại' }} />
      
      <FlatList
        data={SENSOR_CONFIG}
        keyExtractor={(item) => item.id}
        renderItem={renderSensorItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  listContainer: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  iconWrapper: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoWrapper: { flex: 1 },
  sensorName: { fontSize: 16, fontWeight: 'bold', color: '#262626' },
  sensorUnit: { fontSize: 13, color: '#8c8c8c', marginTop: 4 },
});