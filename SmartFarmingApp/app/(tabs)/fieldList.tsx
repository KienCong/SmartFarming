import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import fieldService from '../../services/fieldService';
import groupService from '../../services/groupService';

// Đảm bảo đường dẫn này trỏ đúng vào nơi em lưu FieldModal.tsx
// Ví dụ nếu em lưu ở app/components/FieldModal.tsx thì dùng: '../../components/FieldModal'
import FieldModal from '../Fields/components/FieldModal';

export default function FieldListScreen() {
  const router = useRouter();
  const [fields, setFields] = useState<any[]>([]);
  const [groupNameById, setGroupNameById] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // States cho FieldModal (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  // States cho Clone Modal
  const [isCloneVisible, setIsCloneVisible] = useState(false);
  const [sourceFieldId, setSourceFieldId] = useState('');
  const [newFieldName, setNewFieldName] = useState('');

  // States cho Reset Crop Modal (Vụ mùa mới)
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [resetFieldId, setResetFieldId] = useState('');
  const [resetStartTime, setResetStartTime] = useState(new Date());
  const [showResetStartPicker, setShowResetStartPicker] = useState(false);

  useEffect(() => {
    checkUserRole();
    fetchFields();
  }, []);

  const checkUserRole = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.isAdmin === true);
        setUserId(user.id || user._id);
      }
    } catch (e) {
      console.log('Lỗi phân tích user', e);
    }
  };

  const fetchFields = async () => {
    setLoading(true);
    try {
      const [fRes, gRes] = await Promise.all([fieldService.get('/field'), groupService.get('')]);
      setFields(fRes.data || []);
      const map: any = {};
      (gRes.data || []).forEach((g: any) => { map[g.id] = g.name; });
      setGroupNameById(map);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu từ máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = { ...values, idUser: editingField?.idUser || userId };
      if (editingField) {
        await fieldService.put(`/field/updateField/${editingField.id}`, payload);
        Alert.alert("Thành công", "Đã cập nhật cánh đồng!");
      } else {
        await fieldService.post('/field/createField', payload);
        Alert.alert("Thành công", "Đã thêm cánh đồng mới!");
      }
      setIsModalOpen(false);
      fetchFields();
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Lỗi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Xóa", `Bạn có chắc chắn muốn xóa "${name}"?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => {
          try {
            await fieldService.delete(`/field/delete/${id}`);
            setFields(prev => prev.filter(i => i.id !== id));
          } catch (e) { Alert.alert("Lỗi", "Không thể xóa"); }
        }
      }
    ]);
  };

  const confirmClone = async () => {
    if (!newFieldName.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên mới");
    setLoading(true);
    try {
      await fieldService.post(`/field/clone/${sourceFieldId}`, { newName: newFieldName });
      Alert.alert("Thành công", "Đã nhân bản cánh đồng!");
      setIsCloneVisible(false);
      fetchFields();
    } catch (error: any) { Alert.alert("Lỗi", error.response?.data || "Lỗi nhân bản"); } 
    finally { setLoading(false); }
  };

  const confirmResetCrop = async () => {
    setLoading(true);
    try {
      await fieldService.post(`/field/resetCrop/${resetFieldId}`, {
        startTime: resetStartTime.toISOString(),
        endTime: null
      });
      Alert.alert('Thành công', 'Đã bắt đầu vụ mùa mới!');
      setIsResetVisible(false);
      fetchFields();
    } catch (e: any) { Alert.alert("Lỗi", e.response?.data || "Không thể làm mới cánh đồng"); }
    finally { setLoading(false); }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.fieldName}>{item.name}</Text>
          {item.irrigating ? <Text style={styles.tagBlinking}>Đang bơm</Text> : <Text style={styles.tagOff}>Tắt</Text>}
        </View>

        <View style={styles.tagRow}>
          {item.mode === 'OPERATION' 
            ? <View style={[styles.modeTag, {backgroundColor: '#fff2e8', borderColor: '#ffbb96'}]}><Text style={{color: '#fa541c', fontSize: 11}}>Thực thi</Text></View>
            : <View style={[styles.modeTag, {backgroundColor: '#f9f0ff', borderColor: '#d3adf7'}]}><Text style={{color: '#722ed1', fontSize: 11}}>Mô phỏng</Text></View>
          }
          <View style={[styles.modeTag, {backgroundColor: item.autoIrrigation ? '#f6ffed' : '#f5f5f5'}]}>
             <Text style={{color: item.autoIrrigation ? '#52c41a' : '#888', fontSize: 11}}>{item.autoIrrigation ? 'Tự động' : 'Thủ công'}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={styles.infoText}>Trạm: <Text style={styles.bold}>{groupNameById[item.groupId] || '—'}</Text></Text>
          <Text style={styles.infoText}>Bắt đầu: <Text style={styles.bold}>{item.startTime ? new Date(item.startTime).toLocaleDateString('vi-VN') : ''}</Text></Text>
        </View>

        <View style={styles.gridActions}>
          <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#e6f7ff', borderColor: '#91caff'}]} onPress={() => router.push({ pathname: '/Fields/detailField', params: { id: item.id, fieldName: item.name }})}>
             <AntDesign name="eye" size={14} color="#1890ff" />
             <Text style={[styles.actionText, {color: '#1890ff'}]}> Chi tiết</Text>
          </TouchableOpacity>
          
          {/* ĐÃ SỬA LỖI DẤU BACKTICK Ở ĐÂY */}
          <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#e6fffb', borderColor: '#87e8de'}]} onPress={() => router.push(`/fields/${item.id}/soil-sensor` as any)}>
             <MaterialCommunityIcons name="cloud-sync" size={14} color="#13c2c2" />
             <Text style={[styles.actionText, {color: '#13c2c2'}]}> Cảm biến</Text>
          </TouchableOpacity>
          
          {isAdmin && (
            <>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#f0f5ff', borderColor: '#adc6ff'}]} onPress={() => { setEditingField(item); setIsModalOpen(true); }}>
                 <AntDesign name="edit" size={14} color="#2f54eb" />
                 <Text style={[styles.actionText, {color: '#2f54eb'}]}> Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#fffbe6', borderColor: '#ffe58f'}]} onPress={() => { setSourceFieldId(item.id); setNewFieldName(`${item.name}_copy`); setIsCloneVisible(true); }}>
                 <AntDesign name="copy" size={14} color="#faad14" />
                 <Text style={[styles.actionText, {color: '#faad14'}]}> Clone</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#f6ffed', borderColor: '#b7eb8f'}]} onPress={() => { setResetFieldId(item.id); setResetStartTime(new Date()); setIsResetVisible(true); }}>
                 <AntDesign name="reload" size={14} color="#52c41a" />
                 <Text style={[styles.actionText, {color: '#52c41a'}]}> Mùa vụ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#fff1f0', borderColor: '#ffa39e'}]} onPress={() => handleDelete(item.id, item.name)}>
                 <AntDesign name="delete" size={14} color="#ff4d4f" />
                 <Text style={[styles.actionText, {color: '#ff4d4f'}]}> Xóa</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hệ thống Smart Farming</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.btnRefresh} onPress={fetchFields}>
            <MaterialCommunityIcons name="refresh" size={20} color="#333" />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={styles.btnAdd} onPress={() => { setEditingField(null); setIsModalOpen(true); }}>
              <AntDesign name="plus" size={18} color="#fff" />
              <Text style={styles.btnAddText}> Thêm</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#1890ff" style={{ marginTop: 50 }} /> : (
        <FlatList 
          data={fields} 
          keyExtractor={i => i?.id?.toString() || Math.random().toString()} // ĐÃ SỬA LỖI CRASH KHI ID RỖNG
          renderItem={renderItem} 
          contentContainerStyle={styles.list} 
        />
      )}

      {/* Tích hợp FieldModal */}
      <FieldModal visible={isModalOpen} onCancel={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} initialData={editingField} />

      {/* Modal Clone */}
      <Modal visible={isCloneVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.smallModal}>
             <Text style={styles.modalTitle}>Nhân bản cánh đồng</Text>
             <Text style={{marginBottom: 10}}>Tên cánh đồng mới:</Text>
             <TextInput style={styles.input} value={newFieldName} onChangeText={setNewFieldName} />
             <View style={styles.modalActions}>
               <TouchableOpacity onPress={() => setIsCloneVisible(false)}><Text style={{color: '#888', padding: 10}}>Hủy</Text></TouchableOpacity>
               <TouchableOpacity onPress={confirmClone} style={styles.btnConfirm}><Text style={{color:'#fff'}}>Nhân bản</Text></TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>

      {/* Modal Mùa vụ mới */}
      <Modal visible={isResetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.smallModal}>
             <Text style={styles.modalTitle}>Bắt đầu vụ mùa mới</Text>
             <Text style={{marginBottom: 10, fontSize: 13, color: '#666'}}>Lịch sử mô phỏng và tưới các vụ trước vẫn được giữ lại.</Text>
             <TouchableOpacity style={styles.input} onPress={() => setShowResetStartPicker(true)}>
               <Text>{resetStartTime.toLocaleDateString('vi-VN')}</Text>
             </TouchableOpacity>
             {showResetStartPicker && <DateTimePicker value={resetStartTime} mode="date" onChange={(e, d) => { setShowResetStartPicker(false); if(d) setResetStartTime(d); }} />}
             <View style={styles.modalActions}>
               <TouchableOpacity onPress={() => setIsResetVisible(false)}><Text style={{color: '#888', padding: 10}}>Hủy</Text></TouchableOpacity>
               <TouchableOpacity onPress={confirmResetCrop} style={[styles.btnConfirm, {backgroundColor: '#52c41a'}]}><Text style={{color:'#fff'}}>Tạo vụ mới</Text></TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1890ff' },
  btnRefresh: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6 },
  btnAdd: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1890ff', borderRadius: 6 },
  btnAddText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  list: { padding: 16 },
  
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fieldName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  tagBlinking: { backgroundColor: '#e6f7ff', color: '#1890ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold' },
  tagOff: { backgroundColor: '#f5f5f5', color: '#888', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modeTag: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  infoText: { color: '#666', fontSize: 13, marginBottom: 4 },
  bold: { fontWeight: 'bold', color: '#333' },

  gridActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderColor: '#f0f0f0', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '31%', paddingVertical: 8, borderRadius: 6, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  smallModal: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, backgroundColor: '#fafafa', marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnConfirm: { backgroundColor: '#1890ff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 6 }
});