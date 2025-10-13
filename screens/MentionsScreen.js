import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { colors, typography } from '../src/theme';
import { Button, Card, Avatar } from '../src/components';
import { useNotifications } from '../src/contexts/NotificationContext';
import { generateConversationId } from '../utils/chatUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MentionsScreen({ navigation }) {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { markMentionAsRead } = useNotifications();
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const POSTS_PER_PAGE = 10;

  // 获取被@的帖子
  const loadMentions = async (isLoadMore = false) => {
    if (loadMoreLoading && isLoadMore) return;
    
    if (isLoadMore) {
      setLoadMoreLoading(true);
    } else {
      setLoading(true);
    }
    
    try {
      const currentUserId = auth.currentUser?.uid;
      const postsRef = collection(db, 'posts');
      
      let q = query(
        postsRef,
        where('taggedArtistId', '==', currentUserId),
        limit(POSTS_PER_PAGE)
      );
      
      // 如果是加载更多，从上次的文档开始
      if (isLoadMore && lastDoc) {
        q = query(
          postsRef,
          where('taggedArtistId', '==', currentUserId),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      }
      
      console.log('正在查询被@的帖子，用户ID:', currentUserId);
      const querySnapshot = await getDocs(q);
      const mentionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('查询到的被@帖子:', mentionsData);
      
      // 客户端排序（按创建时间降序）
      mentionsData.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return timeB - timeA;
      });
      
      if (isLoadMore) {
        setMentions(prev => [...prev, ...mentionsData]);
      } else {
        setMentions(mentionsData);
      }
      
      // 更新分页状态
      if (querySnapshot.docs.length < POSTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(true);
      }
      
      console.log(`被@帖子加载完成: ${mentionsData.length} 个帖子`);
    } catch (error) {
      console.error('获取被@帖子失败:', error);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    await loadMentions(false);
    setRefreshing(false);
  };

  // 加载更多
  const loadMore = () => {
    if (hasMore && !loadMoreLoading) {
      loadMentions(true);
    }
  };

  useEffect(() => {
    loadMentions(false);
  }, []);

  // 渲染被@帖子项目
  const renderMentionItem = ({ item }) => (
    <Card variant="elevated" padding="medium" margin="small">
      <View style={styles.mentionHeader}>
        <Avatar 
          name={item.userEmail || '用户'} 
          size="small" 
        />
        <View style={styles.mentionUserInfo}>
          <Text style={styles.mentionUserName}>{item.userEmail || '匿名用户'}</Text>
          <Text style={styles.mentionDate}>
            {new Date(item.createdAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.mentionBadge}>
          <Ionicons name="at" size={16} color={colors.primary} />
          <Text style={styles.mentionText}>@了您</Text>
        </View>
      </View>
      
      <Text style={styles.mentionDescription}>{item.description}</Text>
      
      {item.images && item.images.length > 0 && (
        <View style={styles.mentionImages}>
          {item.images.slice(0, 3).map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.mentionImage} />
          ))}
          {item.images.length > 3 && (
            <View style={styles.moreImagesOverlay}>
              <Text style={styles.moreImagesText}>+{item.images.length - 3}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.mentionActions}>
        <View style={styles.mentionStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{item.likes || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{item.comments || 0}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.replyButton}
          onPress={() => {
            // 标记@提醒为已读
            markMentionAsRead(item.id);
            // 导航到聊天界面
            navigation.navigate('Chat', {
              conversationId: generateConversationId(auth.currentUser?.uid, item.userId),
              otherUser: {
                id: item.userId,
                displayName: item.userEmail || '用户',
                avatar: null
              }
            });
          }}
        >
          <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
          <Text style={styles.replyText}>回复</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // 渲染加载更多
  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        {loadMoreLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
            <Text style={styles.loadMoreText}>加载更多</Text>
          </TouchableOpacity>
        )}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>被@提醒</Text>
        <Text style={styles.headerSubtitle}>
          客户在分享体验时@您的帖子
        </Text>
      </View>
      
      {mentions.length > 0 ? (
        <FlatList
          data={mentions}
          renderItem={renderMentionItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>暂无被@提醒</Text>
          <Text style={styles.emptySubtitle}>
            当客户在分享体验时@您，提醒会显示在这里
          </Text>
          <Button
            title="刷新"
            onPress={onRefresh}
            variant="outline"
            size="medium"
            style={styles.refreshButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: 4,
  },
  listContainer: {
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
  mentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mentionUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mentionUserName: {
    ...typography.styles.label,
    color: colors.text.primary,
    fontWeight: '600',
  },
  mentionDate: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  mentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mentionText: {
    ...typography.styles.caption,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  mentionDescription: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: 12,
    lineHeight: 20,
  },
  mentionImages: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  mentionImage: {
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
  mentionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  mentionStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  replyText: {
    ...typography.styles.caption,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loadMoreText: {
    ...typography.styles.label,
    color: colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...typography.styles.h4,
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 32,
  },
});
