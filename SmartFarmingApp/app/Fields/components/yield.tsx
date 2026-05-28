import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Import Gluestack UI components (NativeWind)
import { Card } from '../../../components/ui/card';
import { Text } from '../../../components/ui/text';

const screenWidth = Dimensions.get("window").width;

export default function YieldTab({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <View className="flex-1 p-12 items-center justify-center mt-10">
        <MaterialCommunityIcons name="chart-box-outline" size={50} color="#d9d9d9" />
        <Text className="text-gray-500 mt-4 font-medium text-sm">Chưa có dữ liệu mô phỏng</Text>
      </View>
    );
  }

  const prepareChartData = (dataKey: string) => {
    // 1. Lọc bỏ các dữ liệu lỗi (đề phòng)
    const validData = data.filter(item => item && item.time);
    
    if (validData.length === 0) return { labels: ['—'], datasets: [{ data: [0] }] };

    const step = Math.ceil(validData.length / 6) || 1; 
    const labels: string[] = [];
    const values: number[] = [];

    validData.forEach((item, idx) => {
      // LUÔN LUÔN đưa giá trị vào mảng để vẽ đường liên tục
      values.push(item[dataKey] || 0);
      
      // XỬ LÝ NHÃN HIỂN THỊ
      if (idx === validData.length - 1) {
        // MẸO: Điểm cuối cùng thêm 4 dấu cách tàng hình để đẩy chữ sang trái
        labels.push(item.time + "        ");
      } else if (idx % step === 0) {
        labels.push(item.time);
      } else {
        labels.push('');
      }
    });
    
    return { 
      labels, 
      datasets: [{ data: values }] 
    };
  };

  const renderAreaChart = (title: string, dataKey: string, hexColor: string, unit: string) => {
    const chartData = prepareChartData(dataKey);
    
    return (
      <Card className="mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <View className="flex-row justify-between items-end mb-3">
          <Text className="font-bold text-gray-800 text-sm">{title}</Text>
          <Text className="text-xs text-gray-400 font-medium">({unit})</Text>
        </View>
        
        {/* CUỘN NGANG GIỮ NGUYÊN */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={screenWidth - 32} // WIDTH GIỮ NGUYÊN
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 1,
              color: (opacity = 1) => hexColor,
              labelColor: () => `#666`,
              propsForDots: { r: "0" },
              fillShadowGradient: hexColor,
              fillShadowGradientOpacity: 0.35,
              propsForBackgroundLines: { strokeDasharray: "4", stroke: "#f0f0f0" }
            }}
            fromZero={true} 
            withInnerLines={false} 
            withVerticalLines={false}
            style={{ marginLeft: -16, marginVertical: 8 }} // STYLE GIỮ NGUYÊN
          />
        </ScrollView>
      </Card>
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50/50" 
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {renderAreaChart("Lượng tưới (Irrigation)", "irrigation", "#3b82f6", "mm")}
      {renderAreaChart("Sản lượng (Yield)", "yield", "#8b5cf6", "kg")}
      {renderAreaChart("Diện tích lá (Leaf Area)", "leafArea", "#10b981", "m²")}
      {renderAreaChart("Carbon linh động (Labile Carbon)", "labileCarbon", "#f59e0b", "g")}
    </ScrollView>
  );
}