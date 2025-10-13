import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography } from '../src/theme';
import { Card, Avatar, Button } from '../src/components';
import { generateConversationId } from '../utils/chatUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const currentUserId = auth.currentUser?.uid;
  const isOwnProfile = userId === currentUserId;

  const POSTS_PER_PAGE = 10;

  // 获取用户信息
  const loadUser = useCallback(async () => {
    try {
      console.log('开始获取用户信息，userId:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('用户数据获取成功:', userData);
        setUser({
          id: userId,
          ...userData,
        });
      } else {
        console.log('用户不存在，userId:', userId);
        Alert.alert('错误', '用户不存在');
        navigation.goBack();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      Alert.alert('错误', '获取用户信息失败');
    }
  }, [userId, navigation]);

  // 获取用户的帖子
  const loadPosts = useCallback(async (isLoadMore = false) => {
    if (postsLoading) return;

    setPostsLoading(true);
    try {
      console.log('开始获取用户帖子，userId:', userId);
      const postsRef = collection(db, 'posts');
      let q = query(
        postsRef,
        where('userId', '==', userId),
        limit(POSTS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        q = query(
          postsRef,
          where('userId', '==', userId),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      console.log('获取到帖子数量:', postsData.length);

      // 客户端排序（按创建时间降序）
      postsData.sort((a, b) => b.createdAt - a.createdAt);

      if (isLoadMore) {
        setPosts(prev => [...prev, ...postsData]);
      } else {
        setPosts(postsData);
      }

      // 更新分页状态
      if (querySnapshot.docs.length < POSTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(true);
      }
    } catch (error) {
      console.error('获取用户帖子失败:', error);
    } finally {
      setPostsLoading(false);
    }
  }, [userId, lastDoc]);

  // 加载数据
  const loadData = useCallback(async () => {
    console.log('开始加载数据，userId:', userId);
    setLoading(true);
    try {
      await loadUser();
      await loadPosts();
      console.log('数据加载完成');
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUser, loadPosts, userId]);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // 加载更多帖子
  const loadMorePosts = useCallback(() => {
    if (hasMore && !postsLoading) {
      loadPosts(true);
    }
  }, [hasMore, postsLoading, loadPosts]);

  // 页面焦点监听
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // 开始聊天
  const startChat = () => {
    if (!currentUserId || !userId) return;
    
    navigation.navigate('Chat', {
      conversationId: generateConversationId(currentUserId, userId),
      otherUser: {
        id: userId,
        displayName: user?.displayName || user?.email || '用户',
        avatar: user?.avatar || null
      }
    });
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = (now - postTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 48) {
      return '昨天';
    } else {
      return postTime.toLocaleDateString('zh-CN');
    }
  };

  // 渲染帖子
  const renderPost = ({ item }) => (
    <Card variant="elevated" padding="medium" margin="small">
      <View style={styles.postHeader}>
        <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
      </View>
      
      {item.description && (
        <Text style={styles.postDescription}>{item.description}</Text>
      )}
      
      {item.images && item.images.length > 0 && (
        <View style={styles.postImages}>
          {item.images.slice(0, 3).map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.postImage} />
          ))}
          {item.images.length > 3 && (
            <View style={styles.moreImagesOverlay}>
              <Text style={styles.moreImagesText}>+{item.images.length - 3}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={16} color={colors.gray[500]} />
          <Text style={styles.statText}>{item.likes || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.gray[500]} />
          <Text style={styles.statText}>{item.comments || 0}</Text>
        </View>
        {item.taggedArtistId && (
          <View style={styles.statItem}>
            <Ionicons name="at" size={16} color={colors.primary} />
            <Text style={styles.taggedText}>@{item.taggedArtistName || '化妆师'}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  // 渲染加载更多
  const renderFooter = () => {
    if (!hasMore && posts.length > 0) {
      return (
        <View style={styles.endOfList}>
          <Text style={styles.endOfListText}>没有更多帖子了</Text>
        </View>
      );
    }
    if (!postsLoading) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.errorText}>用户不存在</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* 用户信息头部 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <View style={styles.userHeader}>
            <Avatar 
              source={user.avatar ? { uri: user.avatar } : null}
              name={user.displayName || user.email}
              size="xl"
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.displayName || user.email}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.location && (
                <Text style={styles.userLocation}>{user.location}</Text>
              )}
              {user.bio && (
                <Text style={styles.userBio}>{user.bio}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>帖子</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.rating || 0}</Text>
              <Text style={styles.statLabel}>评分</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.role === 'professional' ? '专业' : '普通'}</Text>
              <Text style={styles.statLabel}>类型</Text>
            </View>
          </View>
          
          {/* 聊天按钮 */}
          {!isOwnProfile && (
            <View style={styles.chatSection}>
              <Button
                title="开始聊天"
                onPress={startChat}
                variant="primary"
                size="medium"
                icon="chatbubble"
                style={styles.chatButton}
              />
            </View>
          )}
        </Card>

        {/* 帖子列表 */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>发布的帖子</Text>
          {posts.length > 0 ? (
            posts.map((post) => (
              <View key={post.id}>
                {renderPost({ item: post })}
              </View>
            ))
          ) : (
            <Card variant="outlined" padding="large" margin="medium">
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={48} color={colors.gray[400]} />
                <Text style={styles.emptyText}>暂无帖子</Text>
                <Text style={styles.emptySubtext}>
                  {isOwnProfile ? '你还没有发布任何帖子' : '该用户还没有发布任何帖子'}
                </Text>
              </View>
            </Card>
          )}
          
          {renderFooter()}
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.styles.h5,
    color: colors.text.secondary,
    marginTop: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  userEmail: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: 4,
  },
  userLocation: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  userBio: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginTop: 8,
    lineHeight: 20,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.styles.h5,
    color: colors.text.primary,
    fontWeight: '600',
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  chatSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  chatButton: {
    width: '100%',
  },
  postsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    ...typography.styles.h5,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTime: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  postDescription: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: 12,
    lineHeight: 20,
  },
  postImages: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  moreImagesOverlay: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[800] + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    ...typography.styles.label,
    color: colors.white,
    fontWeight: '600',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  taggedText: {
    ...typography.styles.caption,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...typography.styles.h5,
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endOfList: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endOfListText: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
});
