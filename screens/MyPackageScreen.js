import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { auth } from '../firebaseConfig';
import { BookingService } from '../services/BookingService';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MyPackageScreen({ navigation }) {
  const [packages, setPackages] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'makeup', // makeup, hair, nail, etc.
  });

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const packagesData = await BookingService.getStylistPackages(userId);
      setPackages(packagesData);
    } catch (error) {
      console.error('加载套餐失败:', error);
      Alert.alert('错误', '加载套餐失败');
    }
  };

  const handleCreatePackage = async () => {
    try {
      if (!newPackage.name || !newPackage.price || !newPackage.duration) {
        Alert.alert('错误', '请填写所有必填字段');
        return;
      }

      await BookingService.createPackage(userId, {
        ...newPackage,
        price: parseFloat(newPackage.price),
        duration: parseInt(newPackage.duration),
      });
      
      setShowPackageModal(false);
      setNewPackage({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: 'makeup',
      });
      loadPackages();
      Alert.alert('成功', '套餐已创建');
    } catch (error) {
      Alert.alert('错误', '创建套餐失败');
    }
  };

  const renderPackage = ({ item }) => (
    <View style={styles.packageItem}>
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{item.name}</Text>
        <Text style={styles.packagePrice}>¥{item.price}</Text>
      </View>
      <Text style={styles.packageDescription}>{item.description}</Text>
      <Text style={styles.packageDuration}>时长: {item.duration}分钟</Text>
      <Text style={styles.packageCategory}>类别: {item.category}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的套餐</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowPackageModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6B4C3B" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={packages}
          renderItem={renderPackage}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* 创建套餐模态框 */}
      <Modal
        visible={showPackageModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建新套餐</Text>
            <TextInput
              style={styles.input}
              placeholder="套餐名称"
              value={newPackage.name}
              onChangeText={(text) => setNewPackage({...newPackage, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="价格"
              value={newPackage.price}
              onChangeText={(text) => setNewPackage({...newPackage, price: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="时长（分钟）"
              value={newPackage.duration}
              onChangeText={(text) => setNewPackage({...newPackage, duration: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="套餐描述"
              value={newPackage.description}
              onChangeText={(text) => setNewPackage({...newPackage, description: text})}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPackageModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreatePackage}
              >
                <Text style={styles.confirmButtonText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B4C3B',
  },
  addButton: {
    padding: 4,
  },
  packageItem: {
    backgroundColor: '#fff9f7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4C3B',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5A5F',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  packageDuration: {
    fontSize: 14,
    color: '#666',
  },
  packageCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B4C3B',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#6B4C3B',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 