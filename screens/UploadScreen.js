import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UploadScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);

  const selectImage = () => {
    // 模拟选择图片，实际项目中应使用expo-image-picker
    setImageUri('https://via.placeholder.com/400x400');
    Alert.alert('提示', '已选择示例图片。在实际项目中，你可以使用expo-image-picker来选择真实图片。');
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('错误', '请先选择一张图片');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('错误', '请添加作品描述');
      return;
    }

    setUploading(true);
    try {
      // 模拟上传过程
      setTimeout(() => {
        Alert.alert('成功', '作品已上传！', [
          { text: '确定', onPress: () => {
            // 上传成功后重置表单
            setImageUri(null);
            setCaption('');
            setLocation('');
            navigation.navigate('Home');
          }}
        ]);
        setUploading(false);
      }, 1500);

      // 在实际项目中，你应该这样做:
      // 1. 上传图片到Firebase存储
      // 2. 获取图片URL
      // 3. 将帖子信息保存到Firestore
      /*
      const user = auth.currentUser;
      if (!user) throw new Error('用户未登录');
      
      // 创建帖子记录
      await addDoc(collection(firestore, 'posts'), {
        userId: user.uid,
        username: user.displayName || '匿名用户',
        userAvatar: user.photoURL || null,
        imageUrl: '上传后的图片URL',
        caption,
        location,
        createdAt: serverTimestamp(),
        likes: 0
      });
      */
    } catch (error) {
      console.error('上传失败:', error);
      Alert.alert('错误', '上传失败，请重试');
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>发布作品</Text>
      </View>

      <View style={styles.imageSection}>
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.changeButton} 
              onPress={selectImage}
            >
              <Text style={styles.changeButtonText}>更换图片</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={selectImage}
          >
            <Text style={styles.uploadButtonText}>点击选择图片</Text>
            <Text style={styles.uploadSubtext}>支持JPG、PNG格式</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>作品描述</Text>
        <TextInput
          style={styles.input}
          placeholder="描述一下你的作品..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={200}
        />

        <Text style={styles.label}>地点</Text>
        <TextInput
          style={styles.input}
          placeholder="添加地点（可选）"
          value={location}
          onChangeText={setLocation}
        />

        <TouchableOpacity 
          style={[styles.submitButton, (!imageUri || uploading) && styles.disabledButton]}
          onPress={handleUpload}
          disabled={!imageUri || uploading}
        >
          <Text style={styles.submitButtonText}>
            {uploading ? '上传中...' : '发布作品'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  imageSection: {
    padding: 16,
    alignItems: 'center',
  },
  uploadButton: {
    width: '100%',
    height: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#999',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  changeButton: {
    marginTop: 12,
    padding: 8,
  },
  changeButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
  },
  formSection: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 48,
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ffb6b9',
    opacity: 0.7,
  },
});
