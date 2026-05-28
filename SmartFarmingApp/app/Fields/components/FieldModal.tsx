import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import groupService from '../../../services/groupService';

export default function FieldModal({ visible, onCancel, onSubmit, initialData }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // States form
  const [mode, setMode] = useState('SIMULATION');
  const [name, setName] = useState('');
  const [acreage, setAcreage] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('Chọn nhóm...');
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Thông số canh tác
  const [fieldCapacity, setFieldCapacity] = useState('60');
  const [distanceBetweenRow, setDistanceBetweenRow] = useState('');
  const [distanceBetweenHole, setDistanceBetweenHole] = useState('');
  const [numberOfHoles, setNumberOfHoles] = useState('');
  const [dripRate, setDripRate] = useState('');
  const [fertilizationLevel, setFertilizationLevel] = useState('');
  const [autoIrrigation, setAutoIrrigation] = useState(false);
  
  const [valveId, setValveId] = useState<number | null>(null);
  const [showValveSelect, setShowValveSelect] = useState(false);

  useEffect(() => {
    if (!visible) return;
    fetchGroups();
    if (initialData) {
      setMode(initialData.mode || 'SIMULATION');
      setName(initialData.name || '');
      setAcreage(initialData.acreage?.toString() || '');
      setGroupId(initialData.groupId || '');
      setStartTime(initialData.startTime ? new Date(initialData.startTime) : new Date());
      setEndTime(initialData.endTime ? new Date(initialData.endTime) : null);
      
      setFieldCapacity(initialData.fieldCapacity?.toString() || '60');
      setDistanceBetweenRow(initialData.distanceBetweenRow?.toString() || '');
      setDistanceBetweenHole(initialData.distanceBetweenHole?.toString() || '');
      setNumberOfHoles(initialData.numberOfHoles?.toString() || '');
      setDripRate(initialData.dripRate?.toString() || '');
      setFertilizationLevel(initialData.fertilizationLevel?.toString() || '');
      setAutoIrrigation(initialData.autoIrrigation || false);
      setValveId(initialData.valveId || null);
    } else {
      resetForm();
    }
  }, [visible, initialData]);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await groupService.get('');
      setGroups(res.data || []);
      if (initialData?.groupId) {
        const g = res.data.find((x: any) => x.id === initialData.groupId);
        if (g) setGroupName(g.name);
      }
    } catch (e) {
      console.log('Lỗi lấy nhóm', e);
    } finally {
      setLoadingGroups(false);
    }
  };

  const resetForm = () => {
    setMode('SIMULATION'); setName(''); setAcreage(''); setGroupId(''); setGroupName('Chọn nhóm...');
    setStartTime(new Date()); setEndTime(null);
    setFieldCapacity('60'); setDistanceBetweenRow(''); setDistanceBetweenHole('');
    setNumberOfHoles(''); setDripRate(''); setFertilizationLevel('');
    setAutoIrrigation(false); setValveId(null);
  };

  const handleSave = () => {
    const payload = {
      mode, name,
      acreage: Number(acreage) || 0,
      groupId: groupId || null,
      startTime: startTime.toISOString(),
      endTime: endTime ? endTime.toISOString() : null,
      fieldCapacity: Number(fieldCapacity) || 0,
      distanceBetweenRow: Number(distanceBetweenRow) || 0,
      distanceBetweenHole: Number(distanceBetweenHole) || 0,
      numberOfHoles: Number(numberOfHoles) || 0,
      dripRate: Number(dripRate) || 0,
      fertilizationLevel: Number(fertilizationLevel) || 0,
      autoIrrigation,
      valveId
    };
    onSubmit(payload);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{initialData ? 'Sửa Cánh Đồng' : 'Thêm Cánh Đồng'}</Text>
            <TouchableOpacity onPress={onCancel}><AntDesign name="close" size={24} color="#888" /></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '80%' }}>
            {/* Chế độ (Thực thi / Mô phỏng) */}
            <View style={styles.rowToggle}>
               <TouchableOpacity style={[styles.btnToggle, mode === 'SIMULATION' && styles.btnToggleActiveSim]} onPress={() => setMode('SIMULATION')}>
                 <Text style={mode === 'SIMULATION' ? {color: '#fff', fontWeight: 'bold'} : {}}>Mô phỏng</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.btnToggle, mode === 'OPERATION' && styles.btnToggleActiveOp]} onPress={() => setMode('OPERATION')}>
                 <Text style={mode === 'OPERATION' ? {color: '#fff', fontWeight: 'bold'} : {}}>Thực thi</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.formGroup}><Text style={styles.label}>Tên cánh đồng</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ví dụ: Cánh đồng A1" />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, {flex: 1, marginRight: 5}]}><Text style={styles.label}>Diện tích (m²)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={acreage} onChangeText={setAcreage} />
              </View>
              <View style={[styles.formGroup, {flex: 1, marginLeft: 5}]}><Text style={styles.label}>Nhóm trạm</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowGroupSelect(!showGroupSelect)}>
                  <Text numberOfLines={1} style={{ flex: 1, color: groupId ? '#000' : '#888' }}>{groupName}</Text>
                  <AntDesign name="down" size={12} color="#888" />
                </TouchableOpacity>
              </View>
            </View>
            
            {showGroupSelect && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropItem} onPress={() => { setGroupId(''); setGroupName('Bỏ trống'); setShowGroupSelect(false); }}>
                  <Text style={{color: 'red'}}>Bỏ trống</Text>
                </TouchableOpacity>
                {groups.map(g => (
                  <TouchableOpacity key={g.id} style={styles.dropItem} onPress={() => { setGroupId(g.id); setGroupName(g.name); setShowGroupSelect(false); }}>
                    <Text>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.formGroup, {flex: 1, marginRight: 5}]}><Text style={styles.label}>Ngày bắt đầu</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
                  <Text>{startTime.toLocaleDateString('vi-VN')}</Text>
                </TouchableOpacity>
                {showStartPicker && <DateTimePicker value={startTime} mode="date" onChange={(e, d) => { setShowStartPicker(false); if(d) setStartTime(d); }} />}
              </View>
              <View style={[styles.formGroup, {flex: 1, marginLeft: 5}]}><Text style={styles.label}>Ngày kết thúc</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
                  <Text>{endTime ? endTime.toLocaleDateString('vi-VN') : 'Đang chạy...'}</Text>
                </TouchableOpacity>
                {showEndPicker && <DateTimePicker value={endTime || new Date()} mode="date" onChange={(e, d) => { setShowEndPicker(false); if(d) setEndTime(d); }} />}
              </View>
            </View>

            {/* Thông số canh tác */}
            <Text style={styles.sectionTitle}>--- Thông số canh tác ---</Text>
            <View style={[styles.row, { alignItems: 'flex-end' }]}>
              <View style={[styles.formGroup, {flex: 1, marginRight: 5}]}>
                {/* Dùng numberOfLines và adjustsFontSizeToFit để chữ tự động co lại cho vừa 1 dòng */}
                <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>Field Capacity (%)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={fieldCapacity} onChangeText={setFieldCapacity} />
              </View>
              <View style={[styles.formGroup, {flex: 1, marginHorizontal: 5}]}>
                <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>KC Hàng (m)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={distanceBetweenRow} onChangeText={setDistanceBetweenRow} />
              </View>
              <View style={[styles.formGroup, {flex: 1, marginLeft: 5}]}>
                <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>KC Lỗ (m)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={distanceBetweenHole} onChangeText={setDistanceBetweenHole} />
              </View>
            </View>
        
            
            <View style={styles.row}>
              <View style={[styles.formGroup, {flex: 1, marginRight: 5}]}><Text style={styles.label}>Tổng số lỗ</Text><TextInput style={styles.input} keyboardType="numeric" value={numberOfHoles} onChangeText={setNumberOfHoles} /></View>
              <View style={[styles.formGroup, {flex: 1, marginHorizontal: 5}]}><Text style={styles.label}>Nhỏ giọt (L/h)</Text><TextInput style={styles.input} keyboardType="numeric" value={dripRate} onChangeText={setDripRate} /></View>
              <View style={[styles.formGroup, {flex: 1, marginLeft: 5}]}><Text style={styles.label}>Phân bón</Text><TextInput style={styles.input} keyboardType="numeric" value={fertilizationLevel} onChangeText={setFertilizationLevel} /></View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Tự động tưới tiêu</Text>
              <Switch value={autoIrrigation} onValueChange={setAutoIrrigation} />
            </View>

            <View style={styles.formGroup}><Text style={styles.label}>Van bơm gán cho cánh đồng (1-4)</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowValveSelect(!showValveSelect)}>
                  <Text>{valveId ? `Van ${valveId}` : 'Chọn van bơm...'}</Text>
                </TouchableOpacity>
                {showValveSelect && (
                  <View style={styles.dropdown}>
                    {[1,2,3,4].map(v => (
                      <TouchableOpacity key={v} style={styles.dropItem} onPress={() => { setValveId(v); setShowValveSelect(false); }}>
                        <Text>Van {v} (Pump{v})</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
            </View>
            
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Lưu Cánh Đồng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', borderRadius: 12, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold' },
  rowToggle: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4, marginBottom: 15 },
  btnToggle: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
  btnToggleActiveSim: { backgroundColor: '#722ed1' },
  btnToggleActiveOp: { backgroundColor: '#fa541c' },
  formGroup: { marginBottom: 12, zIndex: 1 },
  label: { fontSize: 12, color: '#666', marginBottom: 4, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, backgroundColor: '#fafafa' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  selector: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, backgroundColor: '#fafafa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdown: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', borderRadius: 6, marginTop: 4 },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dateBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, backgroundColor: '#fafafa' },
  sectionTitle: { textAlign: 'center', color: '#999', marginVertical: 10, fontSize: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  btnSave: { backgroundColor: '#1890ff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 20 }
});