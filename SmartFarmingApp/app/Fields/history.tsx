import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import fieldService from '../../services/fieldService';

// Hàm định dạng tên mùa vụ giống hệt trên Web
const formatSeasonLabel = (s: any) => {
  const start = s.cropStartTime ? dayjs(s.cropStartTime).format('DD/MM') : '—';
  if (s.isCurrent) {
    const end = s.cropEndTime ? dayjs(s.cropEndTime).format('DD/MM') : 'Hiện tại';
    return `${start} - ${end}`;
  }
  const end = s.cropEndTime ? dayjs(s.cropEndTime).format('DD/MM/YYYY') : '—';
  return `${start} - ${end}`;
};

export default function HistoryScreen() {
  const { fieldId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  // 1. Tải danh sách Mùa vụ
  useEffect(() => {
    let cancelled = false;
    const loadSeasons = async () => {
      try {
        const res = await fieldService.get(`/field/${fieldId}/seasons`);
        if (cancelled) return;
        const list = res.data || [];
        setSeasons(list);
        
        // Tự động chọn mùa vụ hiện tại hoặc mùa vụ đầu tiên
        const current = list.find((s: any) => s.isCurrent) || list[0];
        if (current) {
          setSelectedCrop(current.cropStartTime);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách vụ:', err);
        Alert.alert('Lỗi', 'Không thể tải danh sách vụ mùa!');
      }
    };
    if (fieldId) loadSeasons();
    return () => { cancelled = true; };
  }, [fieldId]);

  // 2. Tải Lịch sử tưới khi đổi Mùa vụ
  useEffect(() => {
    if (!fieldId || !selectedCrop) return;
    let cancelled = false;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fieldService.get('/irrigation-history', { 
          params: { fieldId, cropStartTime: selectedCrop } 
        });
        if (cancelled) return;
        const data = response?.data || response;
        // Sắp xếp lịch sử mới nhất lên đầu
        const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => dayjs(b.time).unix() - dayjs(a.time).unix());
        setDataSource(sortedData);
      } catch (error) {
        console.error('Lỗi tải lịch sử:', error);
        if (!cancelled) Alert.alert('Lỗi', 'Không thể tải lịch sử tưới tiêu!');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchHistory();
    return () => { cancelled = true; };
  }, [fieldId, selectedCrop]);

  // Tính toán tổng số liệu thống kê
  const totalAmount = dataSource.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const totalDuration = dataSource.reduce((acc, r) => acc + (Number(r.duration) || 0), 0);

  // Khung render cho từng lần tưới (thay cho dòng trong Table)
  const renderHistoryItem = ({ item }: { item: any }) => {
    const isSystem = item.userName === 'admin';
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.timeWrapper}>
            <MaterialCommunityIcons name="calendar-clock" size={18} color="#595959" />
            <Text style={styles.timeText}>{dayjs(item.time).format('DD/MM/YYYY - HH:mm:ss')}</Text>
          </View>
          <View style={[styles.userTag, { backgroundColor: isSystem ? '#fffbe6' : '#e6f7ff', borderColor: isSystem ? '#ffe58f' : '#91caff' }]}>
            <Text style={[styles.userTagText, { color: isSystem ? '#d48806' : '#0958d9' }]}>
              {isSystem ? 'Hệ thống' : item.userName}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lượng nước</Text>
            <Text style={styles.statValue}>{item.amount ? item.amount.toFixed(2) : '0'} mm</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Thời gian bơm</Text>
            <Text style={styles.statValue}>{item.duration ? item.duration.toFixed(1) : '0'} phút</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Lịch sử tưới tiêu', headerBackTitle: 'Chi tiết' }} />

      {/* 1. THANH CUỘN CHỌN MÙA VỤ (Thay thế cho Select Dropdown) */}
      <View style={styles.seasonContainer}>
        <Text style={styles.sectionTitle}>Chọn mùa vụ:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonScroll}>
          {seasons.map((s, index) => {
            const isActive = selectedCrop === s.cropStartTime;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.seasonChip, isActive && styles.seasonChipActive]}
                onPress={() => setSelectedCrop(s.cropStartTime)}
              >
                <Text style={[styles.seasonChipText, isActive && styles.seasonChipTextActive]}>
                  {formatSeasonLabel(s)}
                </Text>
                {s.isCurrent && (
                  <View style={styles.currentDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. THỐNG KÊ TỔNG QUAN (3 Tags màu giống Web) */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryBox, { backgroundColor: '#e6f7ff', borderColor: '#91caff' }]}>
          <Text style={styles.summaryTitle}>Số lần tưới</Text>
          <Text style={[styles.summaryValue, { color: '#0958d9' }]}>{dataSource.length}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: '#e6fffb', borderColor: '#87e8de' }]}>
          <Text style={styles.summaryTitle}>Tổng nước</Text>
          <Text style={[styles.summaryValue, { color: '#08979c' }]}>{totalAmount.toFixed(2)} mm</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: '#f0f5ff', borderColor: '#adc6ff' }]}>
          <Text style={styles.summaryTitle}>Thời gian</Text>
          <Text style={[styles.summaryValue, { color: '#2f54eb' }]}>{totalDuration.toFixed(1)} ph</Text>
        </View>
      </View>

      {/* 3. DANH SÁCH LỊCH SỬ TƯỚI */}
      {loading ? (
        <ActivityIndicator size="large" color="#1890ff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={dataSource}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={60} color="#d9d9d9" />
              <Text style={styles.emptyText}>Không có dữ liệu lịch sử cho vụ này</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  
  // Styles Chọn mùa vụ
  seasonContainer: { backgroundColor: '#fff', paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#595959', paddingHorizontal: 16, marginBottom: 8 },
  seasonScroll: { paddingHorizontal: 16, gap: 10 },
  seasonChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d9d9d9' },
  seasonChipActive: { backgroundColor: '#e6f7ff', borderColor: '#1890ff' },
  seasonChipText: { fontSize: 14, color: '#595959', fontWeight: '500' },
  seasonChipTextActive: { color: '#1890ff', fontWeight: 'bold' },
  currentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#52c41a', marginLeft: 6 },

  // Styles Thống kê
  summaryContainer: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  summaryBox: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, marginHorizontal: 4, alignItems: 'center', backgroundColor: '#fff' },
  summaryTitle: { fontSize: 12, color: '#595959', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },

  // Styles List
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  historyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  timeWrapper: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 14, fontWeight: 'bold', color: '#262626', marginLeft: 6 },
  userTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  userTagText: { fontSize: 12, fontWeight: 'bold' },
  
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  verticalDivider: { width: 1, height: 30, backgroundColor: '#f0f0f0' },
  statLabel: { fontSize: 12, color: '#8c8c8c', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#434343' },

  // Styles Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#8c8c8c' }
});