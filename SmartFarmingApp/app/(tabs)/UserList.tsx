import { AntDesign, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../services/api'; // Đường dẫn gọi API (Cổng 8081, route /api)

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // 1. Lấy dữ liệu khi mở tab
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Lưu ý: Nếu trên web em dùng /api/auth/list mà baseURL của api.js đã có /api rồi 
      // thì ở đây chỉ cần gọi /auth/list là đủ.
      const response = await api.get('/api/auth/list'); 
      const data = response.data;
      setAllUsers(data || []);
      setUsers(data || []);
    } catch (error: any) {
      console.error('Lỗi khi tải user:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải danh sách người dùng!';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm tìm kiếm (Search)
  const handleSearch = (text: string) => {
    setSearchText(text);
    const filteredData = allUsers.filter((user) => {
      const name = user.username || ""; 
      return name.toLowerCase().includes(text.toLowerCase());
    });
    setUsers(filteredData);
  };

  // 3. Khung hiển thị cho từng User (Thay thế cho Table row)
  const renderUserCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.avatarCircle}>
        <AntDesign name="user" size={24} color="#1890ff" />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.username} numberOfLines={1}>
          {item.username || 'Chưa cập nhật'}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {item.email || 'Chưa có email'}
        </Text>
      </View>

      <View style={[styles.roleTag, item.admin ? styles.roleAdmin : styles.roleViewer]}>
        <Text style={[styles.roleText, item.admin ? styles.roleTextAdmin : styles.roleTextViewer]}>
          {item.admin ? 'ADMIN' : 'VIEWER'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Khung tìm kiếm */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#8c8c8c" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#8c8c8c"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Feather name="x-circle" size={16} color="#bfbfbf" />
          </TouchableOpacity>
        )}
      </View>

      {/* Hiển thị vòng xoay nếu đang load dữ liệu */}
      {loading ? (
        <ActivityIndicator size="large" color="#1890ff" style={{ marginTop: 20 }} />
      ) : (
        /* Danh sách người dùng */
        <FlatList
          data={users}
          keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
          renderItem={renderUserCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AntDesign name="inbox" size={48} color="#d9d9d9" />
              <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// 4. Style giống hệt Ant Design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2, // Đổ bóng Android
    shadowColor: '#000', // Đổ bóng iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8c8c8c',
  },
  roleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  roleAdmin: {
    backgroundColor: '#fffbe6',
    borderColor: '#ffe58f',
  },
  roleViewer: {
    backgroundColor: '#e6f4ff',
    borderColor: '#91caff',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleTextAdmin: {
    color: '#d48806', // Màu vàng Gold
  },
  roleTextViewer: {
    color: '#0958d9', // Màu xanh Blue
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#8c8c8c',
    fontSize: 16,
  }
});