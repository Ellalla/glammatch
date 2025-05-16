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
import { doc, updateDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function EditProfileScreen({ route, navigation }) {
  const { profile, focusAvatar } = route.params;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    location: profile.location || '',
    services: profile.services || [],
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

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setUploading(true);
        const storage = getStorage();
        const imageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        
        // 将图片转换为 Blob
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        
        // 上传图片
        await uploadBytes(imageRef, blob);
        
        // 获取下载链接
        const downloadURL = await getDownloadURL(imageRef);
        
        // 更新用户资料
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          avatar: downloadURL
        });
        
        Alert.alert('成功', '头像更新成功');
      }
    } catch (error) {
      console.error('上传头像错误:', error);
      Alert.alert('错误', '上传头像失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      Alert.alert('错误', '昵称不能为空');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        services: formData.services,
        updatedAt: new Date(),
      });

      Alert.alert('成功', '资料更新成功', [
        {
          text: '确定',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('更新资料错误:', error);
      Alert.alert('错误', '更新资料失败，请重试');
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