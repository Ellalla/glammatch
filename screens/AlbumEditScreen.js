import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography } from '../src/theme';
import { Button, Card } from '../src/components';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3列布局

export default function AlbumEditScreen({ navigation, route }) {
  const { album: initialAlbum } = route.params;
  const [album, setAlbum] = useState(initialAlbum);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingName, setEditingName] = useState(album.name);
  const [editingDescription, setEditingDescription] = useState(album.description || '');

  const uid = auth.currentUser?.uid;

  // 选择照片
  const pickImage = async () => {
    if (album.photos && album.photos.length >= 10) {
      Alert.alert('提示', '每个相册最多只能上传10张照片');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('权限不足', '需要相册权限来上传照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      maxImages: 10 - (album.photos ? album.photos.length : 0),
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadImages(result.assets);
    }
  };

  // 上传照片
  const uploadImages = async (assets) => {
    setLoading(true);
    try {
      const newPhotos = assets.map(asset => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        uploadedAt: new Date().toISOString(),
      }));

      const updatedAlbum = {
        ...album,
        photos: [...(album.photos || []), ...newPhotos],
        coverImage: album.coverImage || newPhotos[0].uri, // 如果没有封面图，使用第一张照片
      };

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedAlbums = userData.albums.map(a => 
          a.id === album.id ? updatedAlbum : a
        );
        
        await updateDoc(userRef, { albums: updatedAlbums });
        setAlbum(updatedAlbum);
        Alert.alert('成功', `成功上传 ${newPhotos.length} 张照片`);
      }
    } catch (error) {
      console.error('上传照片失败:', error);
      Alert.alert('错误', '上传照片失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除照片
  const deletePhoto = (photoId) => {
    Alert.alert(
      '确认删除',
      '确定要删除这张照片吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPhotos = album.photos.filter(photo => photo.id !== photoId);
              const updatedAlbum = {
                ...album,
                photos: updatedPhotos,
                coverImage: updatedPhotos.length > 0 ? updatedPhotos[0].uri : null,
              };

              const userRef = doc(db, 'users', uid);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                const userData = userSnap.data();
                const updatedAlbums = userData.albums.map(a => 
                  a.id === album.id ? updatedAlbum : a
                );
                
                await updateDoc(userRef, { albums: updatedAlbums });
                setAlbum(updatedAlbum);
                Alert.alert('成功', '照片已删除');
              }
            } catch (error) {
              console.error('删除照片失败:', error);
              Alert.alert('错误', '删除照片失败，请重试');
            }
          }
        }
      ]
    );
  };

  // 设置封面图
  const setCoverImage = async (photoUri) => {
    try {
      const updatedAlbum = {
        ...album,
        coverImage: photoUri,
      };

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedAlbums = userData.albums.map(a => 
          a.id === album.id ? updatedAlbum : a
        );
        
        await updateDoc(userRef, { albums: updatedAlbums });
        setAlbum(updatedAlbum);
        Alert.alert('成功', '封面图已更新');
      }
    } catch (error) {
      console.error('设置封面图失败:', error);
      Alert.alert('错误', '设置封面图失败，请重试');
    }
  };

  // 更新相册信息
  const updateAlbumInfo = async () => {
    if (!editingName.trim()) {
      Alert.alert('提示', '请输入相册名称');
      return;
    }

    try {
      const updatedAlbum = {
        ...album,
        name: editingName.trim(),
        description: editingDescription.trim(),
      };

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedAlbums = userData.albums.map(a => 
          a.id === album.id ? updatedAlbum : a
        );
        
        await updateDoc(userRef, { albums: updatedAlbums });
        setAlbum(updatedAlbum);
        setShowEditModal(false);
        Alert.alert('成功', '相册信息已更新');
      }
    } catch (error) {
      console.error('更新相册信息失败:', error);
      Alert.alert('错误', '更新相册信息失败，请重试');
    }
  };

  // 渲染照片项目
  const renderPhotoItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => {
        // 点击照片时显示操作选项
        Alert.alert(
          '照片操作',
          '选择要执行的操作',
          [
            { text: '取消', style: 'cancel' },
            { text: '设为封面', onPress: () => setCoverImage(item.uri) },
            { text: '删除', style: 'destructive', onPress: () => deletePhoto(item.id) }
          ]
        );
      }}
    >
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
      {album.coverImage === item.uri && (
        <View style={styles.coverBadge}>
          <Ionicons name="star" size={12} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{album.name}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.albumInfo}>
          <Text style={styles.albumDescription}>
            {album.description || '暂无描述'}
          </Text>
          <Text style={styles.photoCount}>
            {album.photos ? album.photos.length : 0}/10 张照片
          </Text>
        </View>

        {album.photos && album.photos.length > 0 ? (
          <FlatList
            data={album.photos}
            renderItem={renderPhotoItem}
            keyExtractor={item => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.photosContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>暂无照片</Text>
            <Text style={styles.emptySubtitle}>
              点击下方按钮上传照片
            </Text>
          </View>
        )}

        {(!album.photos || album.photos.length < 10) && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={pickImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="add" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>
                  添加照片 ({album.photos ? album.photos.length : 0}/10)
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 编辑相册信息模态框 */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑相册信息</Text>
            
            <TextInput
              style={styles.input}
              placeholder="相册名称"
              value={editingName}
              onChangeText={setEditingName}
              maxLength={20}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="相册描述（可选）"
              value={editingDescription}
              onChangeText={setEditingDescription}
              multiline
              numberOfLines={3}
              maxLength={100}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateAlbumInfo}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.styles.h5,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  albumInfo: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  albumDescription: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: 8,
  },
  photoCount: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  photosContainer: {
    paddingBottom: 80,
  },
  photoItem: {
    width: imageSize,
    height: imageSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    padding: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...typography.styles.h5,
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 24,
    boxShadow: `0px 4px 8px ${colors.shadow.medium}`,
    elevation: 6,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.styles.h5,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: colors.gray[200],
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});
