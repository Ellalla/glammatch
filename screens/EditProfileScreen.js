import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen({ route, navigation }) {
  const { profile, onProfileUpdated } = route.params;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    location: profile.location || '',
    services: profile.services || [],
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: profile.updatedAt || new Date().toISOString(),
    lastActive: new Date().toISOString()
  });

  // 请求相册权限
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能上传头像');
      }
    })();
  }, []);

  // 验证表单数据
  const validateForm = () => {
    if (!formData.displayName.trim()) {
      Alert.alert('错误', '昵称不能为空');
      return false;
    }
    if (formData.displayName.length > 20) {
      Alert.alert('错误', '昵称不能超过20个字符');
      return false;
    }
    if (formData.bio.length > 200) {
      Alert.alert('错误', '简介不能超过200个字符');
      return false;
    }
    return true;
  };

  const handleImagePick = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能上传头像');
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setUploading(true);
        console.log('开始上传图片...');
        
        try {
          // 获取 Storage 实例
          const storage = getStorage();
          console.log('Storage 实例创建成功');
          
          // 创建存储引用
          const imageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
          console.log('存储引用创建成功:', imageRef.fullPath);
          
          // 将图片转换为 Blob
          console.log('开始获取图片数据...');
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();
          console.log('图片数据获取成功，大小:', blob.size);
          
          // 上传图片（添加重试逻辑）
          console.log('开始上传到 Firebase Storage...');
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              const uploadResult = await uploadBytes(imageRef, blob, {
                contentType: 'image/jpeg',
                customMetadata: {
                  uploadedBy: auth.currentUser.uid,
                  uploadedAt: new Date().toISOString()
                }
              });
              console.log('上传成功:', uploadResult);
              break;
            } catch (uploadError) {
              retryCount++;
              console.error(`上传失败 (尝试 ${retryCount}/${maxRetries}):`, uploadError);
              
              if (retryCount === maxRetries) {
                throw uploadError;
              }
              
              // 等待一段时间后重试
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
          
          // 获取下载链接
          console.log('获取下载链接...');
          const downloadURL = await getDownloadURL(imageRef);
          console.log('下载链接获取成功:', downloadURL);
          
          // 更新用户资料
          console.log('更新用户资料...');
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, {
            avatar: downloadURL,
            updatedAt: new Date().toISOString()
          });
          console.log('用户资料更新成功');
          
          Alert.alert('成功', '头像更新成功');
        } catch (uploadError) {
          console.error('上传过程发生错误:', uploadError);
          console.error('错误详情:', {
            code: uploadError.code,
            message: uploadError.message,
            stack: uploadError.stack
          });
          
          let errorMessage = '上传头像失败';
          if (uploadError.code === 'storage/unauthorized') {
            errorMessage = '没有权限上传文件，请确保已登录';
          } else if (uploadError.code === 'storage/canceled') {
            errorMessage = '上传已取消';
          } else if (uploadError.code === 'storage/retry-limit-exceeded') {
            errorMessage = '上传失败，请检查网络连接后重试';
          }
          
          Alert.alert('错误', errorMessage);
        }
      }
    } catch (error) {
      console.error('选择图片错误:', error);
      Alert.alert('错误', '选择图片失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('开始保存资料...');
      console.log('当前表单数据:', formData);

      // 准备更新的数据
      const updateData = {
        ...formData,
        services: formData.services.filter(service => service.trim() !== ''),
        updatedAt: new Date().toISOString(),
        createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      console.log('准备更新的数据:', updateData);

      // 尝试更新 Firestore
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, updateData);
        console.log('Firestore 更新成功');

        // 获取更新后的用户资料
        const updatedDoc = await getDoc(userRef);
        const updatedProfile = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        };

        // 保存到本地存储
        try {
          await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          console.log('本地存储更新成功');
        } catch (storageError) {
          console.error('本地存储更新失败:', storageError);
        }

        // 使用 goBack 而不是 navigate
        navigation.goBack();
      } catch (firestoreError) {
        console.error('Firestore 更新失败:', firestoreError);
        
        // 如果 Firestore 更新失败，尝试保存到本地存储
        try {
          const localProfile = {
            ...formData,
            id: auth.currentUser.uid,
            updatedAt: new Date().toISOString(),
            createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : new Date().toISOString(),
            lastActive: new Date().toISOString()
          };
          
          await AsyncStorage.setItem('userProfile', JSON.stringify(localProfile));
          console.log('已保存到本地存储');
          
          // 使用 goBack 而不是 navigate
          navigation.goBack();
        } catch (storageError) {
          console.error('本地存储也失败:', storageError);
          Alert.alert('保存失败', '无法保存更改，请稍后重试');
        }
      }
    } catch (error) {
      console.error('保存过程发生错误:', error);
      Alert.alert('保存失败', '保存过程中发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 头像上传 */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleImagePick}
          disabled={uploading}
        >
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {formData.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          {uploading ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* 编辑表单 */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>昵称</Text>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
              placeholder="请输入昵称"
              maxLength={20}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>简介</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              placeholder="介绍一下自己吧"
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>地址</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="请输入地址"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>服务项目</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.services.join('\n')}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                services: text.split('\n').filter(s => s.trim())
              }))}
              placeholder="每行输入一个服务项目"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: '#666',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6B4C3B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6B4C3B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 