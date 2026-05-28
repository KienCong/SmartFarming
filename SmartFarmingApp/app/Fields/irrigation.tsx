import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function IrrigationScreen() {
  const { fieldId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Theo dõi tưới tiêu' }} />
      <View style={styles.placeholderCard}>
        <MaterialCommunityIcons name="chart-bell-curve" size={48} color="#1890ff" />
        <Text style={styles.title}>Biểu đồ Độ ẩm đất</Text>
        <Text style={styles.subtitle}>ID Cánh đồng: {fieldId}</Text>
        <Text style={styles.desc}>(Sẽ ghép API lịch sử độ ẩm đất vào đây)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  placeholderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 30, alignItems: 'center', elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#8c8c8c', marginTop: 8 },
  desc: { fontSize: 13, color: '#d9d9d9', marginTop: 16 }
});