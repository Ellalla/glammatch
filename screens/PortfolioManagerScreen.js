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
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography } from '../src/theme';
import { Button, Card } from '../src/components';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PortfolioManagerScreen({ navigation }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const uid = auth.currentUser?.uid;

  // 获取相册数据
  const loadAlbums = async () => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setAlbums(userData.albums || []);
      }
    } catch (error) {
      console.error('获取相册失败:', error);
      Alert.alert('错误', '获取相册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  // 创建新相册
  const createAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert('提示', '请输入相册名称');
      return;
    }

    if (albums.length >= 10) {
      Alert.alert('提示', '最多只能创建10个相册');
      return;
    }

    setCreating(true);
    try {
      const newAlbum = {
        id: Date.now().toString(),
        name: newAlbumName.trim(),
        description: newAlbumDescription.trim(),
        photos: [],
        coverImage: null,
        createdAt: new Date().toISOString(),
      };

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        albums: arrayUnion(newAlbum)
      });

      setAlbums(prev => [...prev, newAlbum]);
      setNewAlbumName('');
      setNewAlbumDescription('');
      setShowCreateModal(false);
      
      Alert.alert('成功', '相册创建成功');
    } catch (error) {
      console.error('创建相册失败:', error);
      Alert.alert('错误', '创建相册失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  // 删除相册
  const deleteAlbum = (albumId) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个相册吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const albumToDelete = albums.find(album => album.id === albumId);
              if (albumToDelete) {
                const userRef = doc(db, 'users', uid);
                await updateDoc(userRef, {
                  albums: arrayRemove(albumToDelete)
                });
                
                setAlbums(prev => prev.filter(album => album.id !== albumId));
                Alert.alert('成功', '相册已删除');
              }
            } catch (error) {
              console.error('删除相册失败:', error);
              Alert.alert('错误', '删除相册失败，请重试');
            }
          }
        }
      ]
    );
  };

  // 渲染相册项目
  const renderAlbumItem = ({ item }) => (
    <Card variant="elevated" padding="medium" margin="small">
      <TouchableOpacity 
        style={styles.albumItem}
        onPress={() => navigation.navigate('AlbumEditScreen', { album: item })}
      >
        <View style={styles.albumCover}>
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={styles.albumCoverImage} />
          ) : (
            <View style={styles.albumPlaceholder}>
              <Ionicons name="images-outline" size={48} color={colors.gray[400]} />
            </View>
          )}
          <View style={styles.albumOverlay}>
            <Text style={styles.albumPhotoCount}>
              {item.photos ? item.photos.length : 0}/10
            </Text>
          </View>
        </View>
        
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{item.name}</Text>
          <Text style={styles.albumDescription}>
            {item.description || '暂无描述'}
          </Text>
          <Text style={styles.albumDate}>
            创建于 {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.albumActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AlbumEditScreen', { album: item })}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>编辑</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteAlbum(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>删除</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>作品集管理</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            已创建 {albums.length}/10 个相册
          </Text>
        </View>

        {albums.length > 0 ? (
          <FlatList
            data={albums}
            renderItem={renderAlbumItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color={colors.gray[400]} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>暂无相册</Text>
            <Text style={styles.emptySubtitle}>
              创建您的第一个相册来展示作品
            </Text>
          </View>
        )}

        {albums.length < 10 && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={colors.white} />
            <Text style={styles.createButtonText}>创建新相册</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 创建相册模态框 */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建新相册</Text>
            
            <TextInput
              style={styles.input}
              placeholder="相册名称"
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              maxLength={20}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="相册描述（可选）"
              value={newAlbumDescription}
              onChangeText={setNewAlbumDescription}
              multiline
              numberOfLines={3}
              maxLength={100}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createModalButton]}
                onPress={createAlbum}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.createModalButtonText}>创建</Text>
                )}
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
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: 12,
  },
  statsContainer: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsText: {
    ...typography.styles.body,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 80,
  },
  albumItem: {
    marginBottom: 16,
  },
  albumCover: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray[100],
    marginBottom: 12,
  },
  albumCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  albumPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  albumOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  albumPhotoCount: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  albumInfo: {
    marginBottom: 12,
  },
  albumTitle: {
    ...typography.styles.h5,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  albumDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  albumDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  albumActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: colors.status.error + '20',
  },
  deleteButtonText: {
    color: colors.status.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    ...typography.styles.h4,
    color: colors.text.secondary,
    marginTop: -50,
    marginBottom: 16,
  },
  emptySubtitle: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 34,
  },
  createButton: {
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
  createButtonText: {
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
    ...typography.styles.h4,
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
  createModalButton: {
    backgroundColor: colors.primary,
  },
  createModalButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});
