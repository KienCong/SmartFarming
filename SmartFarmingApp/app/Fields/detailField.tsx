import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import fieldService from '../../services/fieldService'; // Sử dụng chung service với danh sách cánh đồng

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id, fieldName } = useLocalSearchParams(); // Đón nhận id và fieldName từ fieldList truyền sang

  const [loading, setLoading] = useState(true);
  const [fieldInfo, setFieldInfo] = useState({
    name: (fieldName as string) || 'Cánh đồng sắn',
    isAuto: false,
    mode: 'SIMULATION'
  });

  useEffect(() => {
    if (id) {
      fetchFieldDetails();
    }
  }, [id]);

  const fetchFieldDetails = async () => {
    setLoading(true);
    try {
      // Gọi chính xác đến API lấy chi tiết của 1 cánh đồng cụ thể
      const res = await fieldService.get(`/field/${id}`);
      if (res.data) {
        setFieldInfo({
          name: res.data.name || fieldName,
          isAuto: res.data.autoIrrigation ?? false,
          mode: res.data.mode || 'SIMULATION'
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết cánh đồng:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ để lấy cấu hình cánh đồng.");
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo danh sách các trang chức năng (Đồng bộ logic ẩn/hiện tab từ Web lên App)
  const menuItems = [
    {
      id: 'irrigation',
      title: 'Theo dõi tưới tiêu',
      desc: 'Biểu đồ diễn biến độ ẩm đất 30cm & 60cm',
      icon: 'water',
      color: '#13c2c2', // Màu xanh Teal giống bản Web
      bgColor: '#e6fffb',
      pathname: '/Fields/irrigation',
    },
    // Rẽ nhánh logic tab tự động/thủ công dựa vào thuộc tính isAuto của cánh đồng
    ...(fieldInfo.isAuto ? [
      {
        id: 'yield',
        title: 'Dự đoán sản lượng',
        desc: 'Mô phỏng tăng trưởng sinh khối cây sắn',
        icon: 'leaf',
        color: '#52c41a', // Màu xanh lá cây giống bản Web
        bgColor: '#f6ffed',
        pathname: '/Fields/simulation',
      }
    ] : [
      {
        id: 'manual',
        title: 'Cài đặt tưới tay',
        desc: 'Bảng điều khiển van bơm và hẹn giờ trạm',
        icon: 'valve',
        color: '#fa8c16', // Màu cam giống bản Web
        bgColor: '#fff7e6',
        pathname: '/Fields/manual',
      }
    ]),
    {
      id: 'history',
      title: 'Lịch sử tưới',
      desc: 'Thống kê lượng nước và thời gian theo vụ',
      icon: 'history',
      color: '#2f54eb', // Màu xanh Geekblue giống bản Web
      bgColor: '#f0f5ff',
      pathname: '/Fields/history',
    },
    {
      id: 'disease',
      title: 'Tình trạng bệnh',
      desc: 'Hệ thống chẩn đoán và cảnh báo dịch bệnh lá',
      icon: 'bug',
      color: '#f5222d', // Màu đỏ giống bản Web
      bgColor: '#fff1f0',
      pathname: '/Fields/disease',
    }
  ];

  return (
    <View style={styles.container}>
      {/* Khóa chặt tiêu đề thanh Header theo tên cánh đồng thực tế */}
      <Stack.Screen options={{ title: fieldInfo.name, headerBackTitle: 'Quay lại' }} />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải thông tin vận hành...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* PHẦN 1: THẺ TRẠNG THÁI (Đồng bộ giao diện Tag của Ant Design) */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Trạng thái hệ thống</Text>
            <View style={styles.tagRow}>
              {fieldInfo.mode === 'OPERATION' ? (
                <View style={[styles.tag, { backgroundColor: '#fff2e8', borderColor: '#ffbb96' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color="#fa541c" />
                  <Text style={[styles.tagText, { color: '#fa541c' }]}>Thực thi</Text>
                </View>
              ) : (
                <View style={[styles.tag, { backgroundColor: '#f9f0ff', borderColor: '#d3adf7' }]}>
                  <MaterialCommunityIcons name="flask-outline" size={14} color="#722ed1" />
                  <Text style={[styles.tagText, { color: '#722ed1' }]}>Mô phỏng</Text>
                </View>
              )}

              <View style={[styles.tag, { backgroundColor: fieldInfo.isAuto ? '#f6ffed' : '#e6f7ff', borderColor: fieldInfo.isAuto ? '#b7eb8f' : '#91caff' }]}>
                <Text style={[styles.tagText, { color: fieldInfo.isAuto ? '#52c41a' : '#1890ff' }]}>
                  Chế độ: {fieldInfo.isAuto ? 'Tự động' : 'Thủ công'}
                </Text>
              </View>
            </View>
          </View>

          {/* PHẦN 2: BẢNG MENU CHUYỂN TRANG */}
          <Text style={styles.sectionTitle}>Bảng chức năng chi tiết</Text>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              activeOpacity={0.7}
              onPress={() => {
                // Thực hiện chuyển trang và truyền chuẩn xác fieldId đi sang các file con
                router.push({
                  pathname: item.pathname as any,
                  params: { fieldId: id, fieldName: fieldInfo.name, fieldMode: fieldInfo.mode }
                });
              }}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
              </View>
              
              <View style={styles.menuInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>

              <AntDesign name="right" size={16} color="#bfbfbf" />
            </TouchableOpacity>
          ))}

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#8c8c8c', fontSize: 14 },
  scrollContent: { padding: 16 },
  
  statusCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#e8e8e8' },
  statusTitle: { fontSize: 14, color: '#8c8c8c', fontWeight: '500', marginBottom: 10 },
  tagRow: { flexDirection: 'row', gap: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  tagText: { fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#434343', marginBottom: 12, paddingLeft: 2 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  iconWrapper: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#262626', marginBottom: 2 },
  itemDesc: { fontSize: 12, color: '#8c8c8c' }
});