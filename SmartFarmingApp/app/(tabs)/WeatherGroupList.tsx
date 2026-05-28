import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import các service gọi API
// Lưu ý: Đảm bảo đường dẫn import này khớp với cấu trúc thư mục của em
import fieldService from '../../services/fieldService';
import groupService from '../../services/groupService';

export default function WeatherGroupListScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [fieldCountByGroup, setFieldCountByGroup] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Tải song song danh sách nhóm và danh sách cánh đồng
      const [gRes, fRes] = await Promise.all([
        groupService.get(''), // Lưu ý: Chỉnh lại endpoint cho khớp BE 
        fieldService.get('/field'),
      ]);

      setGroups(gRes.data || []);

      // Đếm số lượng cánh đồng thuộc về từng nhóm
      const counts: any = {};
      (fRes.data || []).forEach((f: any) => {
        if (!f.groupId) return;
        counts[f.groupId] = (counts[f.groupId] || 0) + 1;
      });
      setFieldCountByGroup(counts);
    } catch (error) {
      console.error('Lỗi tải danh sách nhóm:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhóm cánh đồng.');
    } finally {
      setLoading(false);
    }
  };

  // Giao diện cho từng thẻ Nhóm cánh đồng
  const renderGroupItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Điều hướng sang File 2 (Dashboard) và truyền tham số groupId, groupName
        router.push({
          pathname: '/Weather/dashboard',
          params: { groupId: item.id, groupName: item.name }
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color="#1890ff" />
      </View>
      
      <View style={styles.infoWrapper}>
        <Text style={styles.groupName}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{fieldCountByGroup[item.id] || 0} cánh đồng</Text>
          </View>
        </View>
      </View>
      
      <AntDesign name="right" size={20} color="#bfbfbf" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Phần mô tả tương đương <Text type="secondary"> trên Web */}
      <View style={styles.headerInfo}>
        <Text style={styles.headerText}>
          Mỗi nhóm sở hữu một trạm thời tiết dùng chung cho mọi cánh đồng trong nhóm (nhiệt độ, độ ẩm không khí, mưa, bức xạ, gió).
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1890ff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGroupItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="weather-cloudy-alert" size={50} color="#d9d9d9" />
              <Text style={styles.emptyText}>Chưa có nhóm cánh đồng nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  headerInfo: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 14,
    color: '#8c8c8c',
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#e6f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoWrapper: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#262626',
  },
  tag: {
    backgroundColor: '#f0f5ff',
    borderColor: '#adc6ff',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start', // Đảm bảo tag vừa vặn với nội dung text
  },
  tagText: {
    fontSize: 12,
    color: '#2f54eb',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#8c8c8c',
    fontSize: 16,
  }
});