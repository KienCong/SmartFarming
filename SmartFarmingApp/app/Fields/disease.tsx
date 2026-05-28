import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DiseaseScreen() {
  const diseaseData = [
    { name: 'Bệnh khảm lá (Mosaic)', status: 'Nguy cơ thấp', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f', desc: 'Không phát hiện dấu hiệu khảm lá trên diện rộng.' },
    { name: 'Bệnh xoăn lá', status: 'Cảnh báo', color: '#fa8c16', bgColor: '#fff7e6', borderColor: '#ffd591', desc: 'Phát hiện một số khu vực có hiện tượng xoăn lá, cần kiểm tra rệp sáp.' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Chẩn đoán Dịch bệnh' }} />
      
      {diseaseData.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={[styles.tag, { backgroundColor: item.bgColor, borderColor: item.borderColor }]}>
              <Text style={[styles.tagText, { color: item.color }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#262626', flex: 1 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#595959', lineHeight: 20 }
});