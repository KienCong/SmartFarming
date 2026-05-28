import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';

// Import các UI Component từ Gluestack
import { Button, ButtonText } from '../../components/ui/button';
import { Text } from '../../components/ui/text';

// Import service gọi API
import api from '../../services/api';
import fieldService from '../../services/fieldService';

// Import component giao diện vẽ biểu đồ (Sửa lại đường dẫn cho chuẩn cấu trúc mới)
import YieldTab from './components/yield';

// --- HÀM XỬ LÝ NGÀY THÁNG TỪ JAVA BACKEND ---
const MONTH_MAP: any = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const parseJavaDateString = (s: string) => {
  if (!s) return null;
  const parts = s.split(' ');
  if (parts.length < 6) return null;
  const monthIndex = MONTH_MAP[parts[1]];
  const day = parseInt(parts[2], 10);
  const year = parseInt(parts[5], 10);
  if (monthIndex === undefined || isNaN(day) || isNaN(year)) return null;
  const d = new Date(year, monthIndex, day);
  return isNaN(d.getTime()) ? null : d;
};

const formatSeasonLabel = (s: any) => {
  const start = s.cropStartTime ? dayjs(s.cropStartTime).format('DD/MM/YYYY') : '—';
  if (s.isCurrent) {
    const end = s.cropEndTime ? dayjs(s.cropEndTime).format('DD/MM/YYYY') : 'hiện tại';
    return `${start} → ${end}`;
  }
  const end = s.cropEndTime ? dayjs(s.cropEndTime).format('DD/MM/YYYY') : '—';
  return `${start} → ${end}`;
};

export default function SimulationDashboardScreen() {
  const { fieldId, fieldName } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Khi mở trang, load danh sách vụ mùa
  useEffect(() => {
    if (fieldId) loadSeasons();
  }, [fieldId]);

  // Khi đổi vụ mùa, fetch biểu đồ tương ứng
  useEffect(() => {
    if (fieldId && selectedCrop !== null) fetchChartData(selectedCrop);
  }, [fieldId, selectedCrop]);

  const loadSeasons = async (preserveSelection = false) => {
    try {
      const res = await fieldService.get(`/field/${fieldId}/seasons`);
      const list = res.data || [];
      setSeasons(list);
      if (!preserveSelection) {
        const current = list.find((s: any) => s.isCurrent) || list[0];
        setSelectedCrop(current?.cropStartTime || null);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách vụ mùa!');
    }
  };

  const handleSimulate = async () => {
    if (!fieldId) return;
    setSimulating(true);
    try {
      const res = await api.get('/simulation/run', { params: { fieldId } });
      Alert.alert('Thành công', res.data?.message || 'Mô phỏng hoàn tất!');
      
      await loadSeasons(true);
      if (selectedCrop) await fetchChartData(selectedCrop);
    } catch (err: any) {
      const serverMsg = (typeof err.response?.data === 'string' && err.response.data) || 'Lỗi không xác định';
      Alert.alert('Lỗi', `Không thể chạy mô phỏng: ${serverMsg}`);
    } finally {
      setSimulating(false);
    }
  };

  // --- HÀM TẢI DỮ LIỆU ĐƯỢC ĐỒNG BỘ 100% VỚI BẢN WEB (GỌI 2 API VÀ GHÉP MẢNG) ---
  const fetchChartData = async (cropStartTime: string) => {
    setLoading(true);
    try {
      const params: any = { fieldId };
      if (cropStartTime) params.cropStartTime = cropStartTime;

      const [simRes, historyRes] = await Promise.all([
        api.get('/simulation/chart', { params }),
        fieldService.get('/irrigation-history', { params }),
      ]);

      const { day, yield: yields, leafArea, labels } = simRes.data || {};
      const historyRows = Array.isArray(historyRes.data) ? historyRes.data : [];
      
      // 1. Gom nhóm sự kiện tưới tiêu theo ngày
      const irrigationByDay = new Map();
      historyRows.forEach((h: any) => {
        const key = dayjs(h.time).format('YYYY-MM-DD');
        irrigationByDay.set(key, (irrigationByDay.get(key) || 0) + (Number(h.amount) || 0));
      });

      // 2. Gom nhóm dữ liệu mô phỏng theo ngày
      const simByDay = new Map();
      (day || []).forEach((d: string, index: number) => {
        const dateObj = parseJavaDateString(d);
        if (dateObj) simByDay.set(dayjs(dateObj).format('YYYY-MM-DD'), { raw: d, index });
      });

      // 3. Quét toàn bộ trục thời gian và gộp mảng
      const allKeys = [...Array.from(simByDay.keys()), ...Array.from(irrigationByDay.keys())];
      const formattedData: any[] = [];
      
      if (allKeys.length > 0) {
        allKeys.sort();
        const firstDay = dayjs(allKeys[0]);
        const lastDay = dayjs(allKeys[allKeys.length - 1]);
        let irrigationCumulative = 0;
        
        for (let d = firstDay; !d.isAfter(lastDay, 'day'); d = d.add(1, 'day')) {
          const key = d.format('YYYY-MM-DD');
          const sim = simByDay.get(key);
          irrigationCumulative += irrigationByDay.get(key) || 0;
          
          formattedData.push({
            time: d.format('DD/MM'), 
            yield: sim ? (yields?.[sim.index] ?? 0) : 0,
            leafArea: sim ? (leafArea?.[sim.index] ?? 0) : 0,
            labileCarbon: sim ? (labels?.[sim.index] ?? 0) : 0,
            irrigation: Number(irrigationCumulative.toFixed(2)),
          });
        }
      }
      
      setChartData(formattedData);
    } catch (error) {
      console.log('Lỗi tải biểu đồ:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu mô phỏng sinh trưởng');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentSelected = seasons.some((s) => s.isCurrent && s.cropStartTime === selectedCrop);

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Kết quả mô phỏng' }} />

      {/* HEADER: CHỌN MÙA VỤ & CHẠY MÔ PHỎNG */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-1">{fieldName || `Cánh đồng ${fieldId}`}</Text>
        <Text className="text-sm text-gray-500 mb-3">Chọn mùa vụ để xem kết quả:</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 8 }}>
          {seasons.map((s, idx) => {
            const isActive = selectedCrop === s.cropStartTime;
            return (
              <TouchableOpacity 
                key={idx} 
                className={`py-2 px-3 rounded-lg border flex-row items-center gap-2 ${isActive ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200'}`}
                onPress={() => setSelectedCrop(s.cropStartTime)}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {formatSeasonLabel(s)}
                </Text>
                {s.isCurrent && (
                  <View className="bg-green-500 px-1.5 py-0.5 rounded">
                     <Text className="text-[10px] text-white font-bold">Đang chạy</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="flex-row gap-2">
           <Button 
             className={`flex-1 flex-row gap-2 rounded-lg ${isCurrentSelected ? 'bg-blue-600' : 'bg-gray-300'}`}
             onPress={handleSimulate}
             disabled={!isCurrentSelected || simulating}
           >
            {simulating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="play-circle-outline" size={18} color="#fff" />
            )}
              <ButtonText className="text-white font-bold text-xs">{isCurrentSelected ? 'Chạy mô phỏng vụ này' : 'Chỉ mô phỏng vụ hiện tại'}</ButtonText>
           </Button>

           <Button variant="outline" className="px-3 border-gray-300 rounded-lg" onPress={() => fetchChartData(selectedCrop as string)}>
             <MaterialCommunityIcons name="refresh" size={16} color="#4b5563" />
           </Button>
        </View>
      </View>

      {/* BODY: GỌI COMPONENT GIAO DIỆN VÀ TRUYỀN DỮ LIỆU */}
      <View className="flex-1">
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" className="mt-12" />
        ) : (
          <YieldTab data={chartData} />
        )}
      </View>
    </View>
  );
}