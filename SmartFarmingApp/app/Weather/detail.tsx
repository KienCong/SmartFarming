import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// IMPORT THƯ VIỆN MỚI
import { LineChart } from 'react-native-gifted-charts';

import api from '../../services/api';

const getSensorColorRGB = (sensorId: string) => {
  switch (sensorId) {
    case 'temperature': return '207, 19, 34'; 
    case 'relativeHumidity': return '9, 109, 217'; 
    case 'rain': 
    case 'rainfall': return '63, 102, 0'; 
    case 'radiation': return '212, 136, 6'; 
    case 'wind': 
    case 'wind_speed': return '83, 29, 171'; 
    case 'humidity30': return '19, 194, 194'; 
    case 'humidity60': return '8, 151, 156'; 
    default: return '24, 144, 255';
  }
};

const getSensorUnit = (sensorId: string) => {
  switch (sensorId) {
    case 'temperature': return '°C'; 
    case 'relativeHumidity': 
    case 'humidity30': 
    case 'humidity60': 
    case 'soilHumidity': return '%'; 
    case 'rain': 
    case 'rainfall': return 'mm'; 
    case 'radiation': return 'W/m²'; 
    case 'wind': 
    case 'wind_speed': return 'm/s'; 
    default: return '';
  }
};

export default function WeatherDetailScreen() {
  const { sensorId, sensorName, groupId, fieldId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h'); 

  // ĐÃ THÊM LẠI KHAI BÁO SCREENWIDTH Ở ĐÂY
  const screenWidth = Dimensions.get("window").width;

  const mainColor = getSensorColorRGB(String(sensorId));
  const isSoilHumidity = sensorId === 'soilHumidity';
  const unit = getSensorUnit(String(sensorId));

  // Tách thành 2 mảng để vẽ 2 đường nếu là độ ẩm đất
  const [lineData, setLineData] = useState<any[]>([]);
  const [lineData2, setLineData2] = useState<any[]>([]);

  useEffect(() => {
    fetchHistoryData(timeRange);
  }, [timeRange, groupId, fieldId, sensorId]);

  const filterByTimeRange = (rawData: any[], range: string) => {
    if (!rawData || rawData.length === 0) return [];
    const latestTime = new Date(rawData[0].time).getTime();
    let rangeMs = 24 * 60 * 60 * 1000; 
    if (range === '7d') rangeMs = 7 * 24 * 60 * 60 * 1000;
    if (range === '30d') rangeMs = 30 * 24 * 60 * 60 * 1000;
    return rawData
      .filter((item: any) => latestTime - new Date(item.time).getTime() <= rangeMs)
      .reverse(); 
  };

  const fetchHistoryData = async (range: string) => {
    setLoading(true);
    try {
      const endpoint = fieldId ? '/sensor-values/history' : '/sensor-values/group-history';
      const baseParams = fieldId ? { fieldId } : { groupId };

      if (isSoilHumidity) {
        const [res30, res60] = await Promise.all([
          api.get(endpoint, { params: { ...baseParams, sensorId: 'humidity30' } }),
          api.get(endpoint, { params: { ...baseParams, sensorId: 'humidity60' } })
        ]);

        const data30 = filterByTimeRange(res30.data, range);
        const data60 = filterByTimeRange(res60.data, range);

        if (data30.length === 0 && data60.length === 0) {
          setLineData([]); setLineData2([]); return;
        }

        const maxPoints = 12;
        const targetData = data30.length >= data60.length ? data30 : data60;
        const step = Math.ceil(targetData.length / maxPoints);

        const arr1: any[] = [];
        const arr2: any[] = [];

        targetData.forEach((item: any, index: number) => {
          let labelText = '';
          if (index % step === 0 || index === targetData.length - 1) {
            const dateObj = new Date(item.time);
            labelText = range === '24h' 
              ? `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
              : `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
          }
          
          const match30 = data30.find((d: any) => d.time === item.time);
          const match60 = data60.find((d: any) => d.time === item.time);
          
          // Format mảng cho Gifted Charts
          arr1.push({ value: match30 ? Number(match30.value || 0) : 0, label: labelText });
          arr2.push({ value: match60 ? Number(match60.value || 0) : 0, label: labelText });
        });

        setLineData(arr1);
        setLineData2(arr2);

      } else {
        const response = await api.get(endpoint, { params: { ...baseParams, sensorId } });
        const filtered = filterByTimeRange(response.data, range);

        if (filtered.length === 0) {
          setLineData([]); setLineData2([]); return;
        }

        const maxPoints = 12;
        const step = Math.ceil(filtered.length / maxPoints);
        const arr1: any[] = [];

        filtered.forEach((item: any, index: number) => {
          let labelText = '';
          if (index % step === 0 || index === filtered.length - 1) {
            const dateObj = new Date(item.time);
            labelText = range === '24h' 
              ? `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
              : `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
          }
          arr1.push({ value: Number(item.value || 0), label: labelText });
        });

        setLineData(arr1);
        setLineData2([]);
      }

    } catch (error) {
      console.error('Lỗi tải dữ liệu lịch sử API:', error);
      setLineData([]); setLineData2([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: String(sensorName), headerBackTitle: 'Quay lại' }} />
      
      <View style={styles.filterRow}>
        {['24h', '7d', '30d'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.filterChip, timeRange === range && styles.filterChipActive]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.filterText, timeRange === range && styles.filterTextActive]}>
              {range === '24h' ? '24 giờ qua' : range === '7d' ? '7 ngày qua' : '30 ngày qua'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartCard}>
        <View style={styles.headerTitle}>
          <MaterialCommunityIcons name="chart-bell-curve" size={24} color={`rgb(${mainColor})`} />
          <Text style={styles.titleText}>Diễn biến {String(sensorName).toLowerCase()}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={`rgb(${mainColor})`} style={{ marginVertical: 50 }} />
        ) : lineData.length > 0 ? (
          <View>
            <View style={{ marginLeft: -10 }}>
                {/* THƯ VIỆN GIFTED CHARTS */}
                <LineChart
                  data={lineData}
                  data2={isSoilHumidity && lineData2.length > 0 ? lineData2 : undefined}
                  areaChart // Vẽ dạng Area đổ bóng cực đẹp giống Web
                  curved // Làm mềm đường
                  hideDataPoints // Ẩn chấm tròn
                  
                  // Đặt chiều rộng cho biểu đồ để kích hoạt vuốt ngang tự động
                  width={screenWidth - 60} 
                  
                  spacing={40} // Khoảng cách giữa các điểm
                  initialSpacing={20}
                  
                  // Đổi màu
                  color1={`rgb(${isSoilHumidity ? getSensorColorRGB('humidity30') : mainColor})`}
                  color2={isSoilHumidity ? `rgb(${getSensorColorRGB('humidity60')})` : undefined}
                  startFillColor1={`rgb(${isSoilHumidity ? getSensorColorRGB('humidity30') : mainColor})`}
                  startFillColor2={isSoilHumidity ? `rgb(${getSensorColorRGB('humidity60')})` : undefined}
                  startOpacity={0.3}
                  endOpacity={0.05}
                  
                  // Trục Y và Nhãn
                  yAxisLabelSuffix={unit ? ` ${unit}` : ''}
                  yAxisTextStyle={{ color: 'gray', fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: 'gray', fontSize: 10, textAlign: 'center', width: 60, marginLeft: -20 }}
                  
                  // Giao diện lưới
                  rulesType="dashed"
                  rulesColor="rgba(0,0,0,0.1)"
                  yAxisColor="transparent"
                  xAxisColor="lightgray"
                  height={220}
                />
            </View>
            
            {isSoilHumidity && (
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: `rgb(${getSensorColorRGB('humidity30')})` }]} />
                  <Text style={styles.legendText}>Độ ẩm 30cm</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: `rgb(${getSensorColorRGB('humidity60')})` }]} />
                  <Text style={styles.legendText}>Độ ẩm 60cm</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="database-remove-outline" size={40} color="#d9d9d9" />
            <Text style={styles.emptyText}>Không có dữ liệu lịch sử API</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  filterChip: { flex: 1, backgroundColor: '#fff', paddingVertical: 10, marginHorizontal: 4, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#d9d9d9' },
  filterChipActive: { backgroundColor: '#e6f4ff', borderColor: '#1890ff' },
  filterText: { fontSize: 13, color: '#595959', fontWeight: '500' },
  filterTextActive: { color: '#1890ff', fontWeight: 'bold' },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 3, marginBottom: 30 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  titleText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#262626' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { marginTop: 10, color: '#8c8c8c', fontSize: 14 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 13, color: '#434343', fontWeight: '500' }
});