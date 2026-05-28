import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Import service API (tương tự detail.tsx)
import api from '../../services/fieldService';

// Bảng ánh xạ trạng thái sang màu sắc (giống Web)
const STATUS_META: any = {
  PENDING:   { color: '#1890ff', label: 'Chờ gửi', icon: 'clock-outline' },
  SENT:      { color: '#13c2c2', label: 'Đã gửi edge', icon: 'send' },
  RUNNING:   { color: '#faad14', label: 'Đang tưới', icon: 'water' },
  DONE:      { color: '#52c41a', label: 'Hoàn tất', icon: 'check-circle' },
  CANCELLED: { color: '#8c8c8c', label: 'Đã hủy', icon: 'cancel' },
  FAILED:    { color: '#ff4d4f', label: 'Thất bại', icon: 'alert-circle' },
  NO_ACK:    { color: '#fa541c', label: 'Không phản hồi', icon: 'wifi-off' },
};

export default function ManualIrrigationScreen() {
  const { fieldId, fieldName, fieldMode } = useLocalSearchParams();
  const isSimulation = fieldMode === 'SIMULATION';

  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 5 * 60000)); // Mặc định +5 phút
  const [durationMinutes, setDurationMinutes] = useState('10');
  
  // DateTime Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Tạm fix userName hoặc lấy từ AsyncStorage nếu có
  const userName = "manual_mobile"; 

  const loadSchedules = useCallback(async () => {
    if (!fieldId) return;
    setLoading(true);
    try {
      const res = await api.get('/irrigation-schedule', { params: { fieldId } });
      setSchedules(res.data || []);
    } catch (err) {
      Alert.alert('Lỗi', 'Không tải được danh sách lịch tưới');
    } finally {
      setLoading(false);
    }
  }, [fieldId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const submitSchedule = async (when: Date) => {
    const duration = parseInt(durationMinutes, 10);
    if (!duration || duration <= 0) {
      return Alert.alert('Lỗi nhập liệu', 'Vui lòng nhập thời gian tưới hợp lệ (phút)!');
    }
    setSubmitting(true);
    try {
      await api.post('/irrigation-schedule', {
        fieldId,
        scheduledTime: when.toISOString(),
        durationSeconds: duration * 60,
        userName,
      });
      Alert.alert('Thành công', 'Đã lưu lệnh tưới');
      loadSchedules();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message;
      Alert.alert('Thất bại', 'Không thể tạo lịch: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleConfirm = () => {
    Alert.alert(
      'Xác nhận đặt lịch tưới?',
      `Cánh đồng: ${fieldName || fieldId}\nThời điểm: ${dayjs(scheduledAt).format('DD/MM/YYYY HH:mm')}\nThời lượng: ${durationMinutes} phút`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đặt lịch', onPress: () => submitSchedule(scheduledAt) }
      ]
    );
  };

  const handleInstantConfirm = () => {
    Alert.alert(
      'Tưới ngay lập tức?',
      `Cánh đồng: ${fieldName || fieldId}\nThời lượng: ${durationMinutes} phút\n\nLệnh sẽ được gửi xuống thiết bị Edge để thực thi ngay.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Kích hoạt bơm', style: 'destructive', onPress: () => submitSchedule(new Date()) }
      ]
    );
  };

  const cancelSchedule = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy lịch này?', [
      { text: 'Không', style: 'cancel' },
      { text: 'Hủy lịch', style: 'destructive', onPress: async () => {
          try {
            await api.put(`/irrigation-schedule/${id}/cancel`);
            Alert.alert('Thành công', 'Đã hủy lịch');
            loadSchedules();
          } catch (err: any) {
            Alert.alert('Lỗi', 'Hủy lịch thất bại');
          }
      }}
    ]);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSchedules} />}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: 'Điều khiển Tưới Bơm' }} />

      {/* CẢNH BÁO NẾU ĐANG LÀ CHẾ ĐỘ MÔ PHỎNG GIỐNG WEB */}
      {isSimulation && (
        <View style={styles.alertBox}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#faad14" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.alertTitle}>Chế độ Mô phỏng</Text>
            <Text style={styles.alertDesc}>Lệnh tưới sẽ được lưu và thay đổi trạng thái nhưng không gửi xuống trạm bơm thật.</Text>
          </View>
        </View>
      )}

      {/* BẢNG ĐIỀU KHIỂN TẠO LỊCH MỚI */}
      <View style={styles.card}>
        <View style={styles.headerTitle}>
          <FontAwesome5 name="clock" size={20} color="#1890ff" />
          <Text style={styles.title}>Cài đặt thông số tưới</Text>
        </View>

        <Text style={styles.label}>Thời gian tưới (phút):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          placeholder="Ví dụ: 10"
        />

        <Text style={styles.label}>Thời điểm kích hoạt:</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <MaterialCommunityIcons name="calendar" size={18} color="#666" />
            <Text style={styles.dateText}>{dayjs(scheduledAt).format('DD/MM/YYYY')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#666" />
            <Text style={styles.dateText}>{dayjs(scheduledAt).format('HH:mm')}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledAt}
            mode="date"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                const newDate = new Date(scheduledAt);
                newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                setScheduledAt(newDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={scheduledAt}
            mode="time"
            onChange={(event, date) => {
              setShowTimePicker(false);
              if (date) {
                const newDate = new Date(scheduledAt);
                newDate.setHours(date.getHours(), date.getMinutes());
                setScheduledAt(newDate);
              }
            }}
          />
        )}

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#1890ff' }]} 
            onPress={handleScheduleConfirm}
            disabled={submitting}
          >
            <MaterialCommunityIcons name="calendar-clock" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Đặt lịch</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#fa8c16' }]} 
            onPress={handleInstantConfirm}
            disabled={submitting}
          >
            <MaterialCommunityIcons name="flash" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Tưới ngay</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DANH SÁCH LỊCH TƯỚI HIỆN TẠI */}
      <View style={[styles.card, { marginTop: 16, marginBottom: 40 }]}>
        <View style={[styles.headerTitle, { justifyContent: 'space-between', marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="format-list-bulleted" size={22} color="#52c41a" />
            <Text style={styles.title}>Danh sách lịch tưới</Text>
          </View>
          <TouchableOpacity onPress={loadSchedules} style={{ padding: 4 }}>
            <MaterialCommunityIcons name="refresh" size={22} color="#1890ff" />
          </TouchableOpacity>
        </View>

        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={40} color="#d9d9d9" />
            <Text style={styles.emptyText}>Chưa có lịch tưới nào</Text>
          </View>
        ) : (
          schedules.map((row) => {
            const statusMeta = STATUS_META[row.status] || { color: '#8c8c8c', label: row.status, icon: 'circle-outline' };
            const isPending = row.status === 'PENDING';

            return (
              <View key={row.id} style={styles.scheduleItem}>
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleTime}>{dayjs(row.scheduledTime).format('DD/MM/YYYY HH:mm')}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusMeta.color + '20' }]}>
                    <MaterialCommunityIcons name={statusMeta.icon} size={14} color={statusMeta.color} />
                    <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                  </View>
                </View>

                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleDetail}>Thời lượng: <Text style={{ fontWeight: 'bold' }}>{Math.round(row.durationSeconds / 60)} phút</Text></Text>
                  <Text style={styles.scheduleDetail}>Lượng: {row.amount ? Number(row.amount).toFixed(2) + ' mm' : '—'}</Text>
                </View>
                <Text style={styles.scheduleDetail}>Tạo bởi: {row.userName}</Text>

                {isPending && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelSchedule(row.id)}>
                    <Text style={styles.cancelBtnText}>Hủy lịch</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  alertBox: { flexDirection: 'row', backgroundColor: '#fffbe6', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffe58f', marginBottom: 16 },
  alertTitle: { fontWeight: 'bold', color: '#d46b08', fontSize: 14 },
  alertDesc: { color: '#d46b08', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#262626' },
  label: { fontSize: 13, color: '#595959', marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#d9d9d9', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#d9d9d9', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' },
  dateText: { fontSize: 15, fontWeight: 'bold', color: '#434343' },
  buttonGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8, gap: 8 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: '#bfbfbf', marginTop: 10 },
  scheduleItem: { padding: 14, borderRadius: 8, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 12 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  scheduleTime: { fontSize: 15, fontWeight: 'bold', color: '#1f1f1f' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  scheduleDetail: { fontSize: 13, color: '#595959', marginBottom: 4 },
  cancelBtn: { marginTop: 10, alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, borderWidth: 1, borderColor: '#ff4d4f' },
  cancelBtnText: { color: '#ff4d4f', fontSize: 12, fontWeight: 'bold' }
});