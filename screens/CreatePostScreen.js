import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { colors, typography } from '../src/theme';
import { Button, Card, Input } from '../src/components';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CreatePostScreen({ navigation }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [description, setDescription] = useState('');
  const [taggedArtist, setTaggedArtist] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showArtistList, setShowArtistList] = useState(false);

  // 获取专业化妆师列表
  const loadArtists = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'professional'));
      const querySnapshot = await getDocs(q);
      
      const artistsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setArtists(artistsList);
    } catch (error) {
      console.error('获取化妆师列表失败:', error);
      Alert.alert('错误', '获取化妆师列表失败');
    }
  };

  // 选择图片
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能上传图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        maxImages: 5 - selectedImages.length, // 最多5张图片
      });

      if (!result.canceled) {
        setSelectedImages(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败');
    }
  };

  // 移除图片
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 上传图片到 Firebase Storage
  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `posts/${auth.currentUser.uid}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const imageRef = ref(storage, filename);
      
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  };

  // 发布帖子
  const handlePublish = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('提示', '请至少选择一张图片');
      return;
    }

    if (!description.trim()) {
      Alert.alert('提示', '请输入描述');
      return;
    }

    setLoading(true);
    try {
      // 上传所有图片
      const imageUrls = await Promise.all(
        selectedImages.map(image => uploadImage(image.uri))
      );

      // 创建帖子数据
      const postData = {
        userId: auth.currentUser.uid,
        images: imageUrls,
        description: description.trim(),
        taggedArtistId: taggedArtist?.id || null,
        taggedArtistName: taggedArtist?.displayName || null,
        visibility: 'public', // 公开可见
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 保存到 Firestore
      const postsRef = collection(db, 'posts');
      await addDoc(postsRef, postData);

      Alert.alert('成功', '帖子发布成功！', [
        {
          text: '确定',
          onPress: () => {
            // 重置表单
            setSelectedImages([]);
            setDescription('');
            setTaggedArtist(null);
            // 返回首页
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      console.error('发布帖子失败:', error);
      Alert.alert('错误', '发布帖子失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染图片网格
  const renderImageGrid = () => {
    const displayImages = [...selectedImages];
    
    // 如果图片少于5张，添加一个"添加图片"的占位符
    if (displayImages.length < 5) {
      displayImages.push({ uri: 'add', isPlaceholder: true });
    }

    return (
      <View style={styles.imageGrid}>
        {displayImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            {image.isPlaceholder ? (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={32} color={colors.gray[400]} />
                <Text style={styles.addImageText}>添加图片</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  // 渲染化妆师列表
  const renderArtistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() => {
        setTaggedArtist(item);
        setShowArtistList(false);
      }}
    >
      <Text style={styles.artistName}>{item.displayName || item.email}</Text>
      <Text style={styles.artistLocation}>{item.location || '未设置地址'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card variant="elevated" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>分享你的美妆体验</Text>
          
          {/* 图片选择区域 */}
          <View style={styles.section}>
            <Text style={styles.label}>选择图片 (最多5张)</Text>
            {renderImageGrid()}
          </View>

          {/* 描述输入 */}
          <View style={styles.section}>
            <Input
              label="描述你的体验"
              placeholder="分享你的美妆体验，让更多人看到..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>
          </View>

          {/* @化妆师选择 */}
          <View style={styles.section}>
            <Text style={styles.label}>@化妆师 (可选)</Text>
            <TouchableOpacity
              style={styles.artistSelector}
              onPress={() => {
                if (artists.length === 0) {
                  loadArtists();
                }
                setShowArtistList(!showArtistList);
              }}
            >
              <Text style={styles.artistSelectorText}>
                {taggedArtist ? `@${taggedArtist.displayName || taggedArtist.email}` : '选择化妆师'}
              </Text>
              <Ionicons 
                name={showArtistList ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.gray[500]} 
              />
            </TouchableOpacity>

            {showArtistList && (
              <Card variant="outlined" padding="small" margin="small">
                <FlatList
                  data={artists}
                  renderItem={renderArtistItem}
                  keyExtractor={item => item.id}
                  style={styles.artistList}
                  showsVerticalScrollIndicator={false}
                />
              </Card>
            )}

            {taggedArtist && (
              <TouchableOpacity
                style={styles.removeTagButton}
                onPress={() => setTaggedArtist(null)}
              >
                <Ionicons name="close-circle" size={16} color={colors.status.error} />
                <Text style={styles.removeTagText}>移除标签</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 发布按钮 */}
          <Button
            title="发布"
            onPress={handlePublish}
            loading={loading}
            disabled={loading || selectedImages.length === 0 || !description.trim()}
            style={styles.publishButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.styles.h3,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    ...typography.styles.label,
    marginBottom: 8,
    color: colors.text.primary,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageContainer: {
    width: '33.33%',
    padding: 4,
  },
  addImageButton: {
    aspectRatio: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    ...typography.styles.caption,
    color: colors.gray[500],
    marginTop: 4,
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  characterCount: {
    ...typography.styles.caption,
    textAlign: 'right',
    color: colors.gray[500],
    marginTop: 4,
  },
  artistSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  artistSelectorText: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 1,
  },
  artistList: {
    maxHeight: 200,
  },
  artistItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  artistName: {
    ...typography.styles.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  artistLocation: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  removeTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  removeTagText: {
    ...typography.styles.caption,
    color: colors.status.error,
    marginLeft: 4,
  },
  publishButton: {
    marginTop: 20,
  },
});
