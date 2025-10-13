import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { MessageService } from '../services/MessageService';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { generateConversationId } from '../utils/chatUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DefaultAvatar from '../components/DefaultAvatar';

// 模拟数据
const MOCK_USERS = [
  {
    id: 'user1',
    displayName: '张美美',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastMessage: '你好，请问这个造型师还在吗？',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
    unreadCount: 2,
  },
  {
    id: 'user2',
    displayName: '李帅帅',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    lastMessage: '好的，我们约在明天下午2点',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    unreadCount: 0,
  },
  {
    id: 'user3',
    displayName: '王丽丽',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastMessage: '谢谢你的推荐！',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    unreadCount: 1,
  },
];

export default function MessagesScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentUserId = auth.currentUser?.uid;

  // 合并同一用户的多个会话
  const mergeConversationsByUser = (conversations) => {
    const userMap = new Map();
    
    conversations.forEach(conversation => {
      const userId = conversation.otherUserId;
      
      if (userMap.has(userId)) {
        // 如果已存在该用户的会话，保留最新的
        const existing = userMap.get(userId);
        if (conversation.timestamp > existing.timestamp) {
          userMap.set(userId, {
            ...conversation,
            // 合并未读计数
            unreadCount: existing.unreadCount + conversation.unreadCount
          });
        } else {
          // 保留现有的，但合并未读计数
          userMap.set(userId, {
            ...existing,
            unreadCount: existing.unreadCount + conversation.unreadCount
          });
        }
      } else {
        // 新用户，直接添加
        userMap.set(userId, conversation);
      }
    });
    
    return Array.from(userMap.values());
  };

  // 获取用户信息
  const getUserInfo = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return {
          id: userId,
          displayName: userDoc.data().displayName || userDoc.data().email || '用户',
          avatar: userDoc.data().avatar || null,
        };
      }
      return {
        id: userId,
        displayName: '用户',
        avatar: null,
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return {
        id: userId,
        displayName: '用户',
        avatar: null,
      };
    }
  };

  // 加载会话列表
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', currentUserId)
        // 暂时移除 orderBy 避免索引问题，在客户端排序
      );

      const querySnapshot = await getDocs(q);
      const conversationsData = [];

      for (const docSnapshot of querySnapshot.docs) {
        const conversationData = docSnapshot.data();
        const otherUserId = conversationData.participants.find(id => id !== currentUserId);
        
        if (otherUserId) {
          const userInfo = await getUserInfo(otherUserId);
          const unreadCount = conversationData.unreadCount?.[currentUserId] || 0;
          
          conversationsData.push({
            id: docSnapshot.id,
            otherUserId: otherUserId, // 保存另一个用户的ID
            ...userInfo,
            lastMessage: conversationData.lastMessage?.content || '暂无消息',
            timestamp: conversationData.lastMessage?.timestamp?.toDate() || conversationData.updatedAt?.toDate() || new Date(),
            unreadCount,
          });
        }
      }

      // 合并同一用户的多个会话
      const mergedConversations = mergeConversationsByUser(conversationsData);
      
      // 按更新时间排序（最新的在前）
      mergedConversations.sort((a, b) => b.timestamp - a.timestamp);
      setConversations(mergedConversations);
    } catch (error) {
      console.error('加载会话列表失败:', error);
      // 如果出错，使用模拟数据
      setConversations(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // 设置实时监听
  const setupConversationListener = useCallback(() => {
    if (!currentUserId) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId)
      // 暂时移除 orderBy 避免索引问题，在客户端排序
    );

    return onSnapshot(q, async (snapshot) => {
      const conversationsData = [];

      for (const docSnapshot of snapshot.docs) {
        const conversationData = docSnapshot.data();
        const otherUserId = conversationData.participants.find(id => id !== currentUserId);
        
        if (otherUserId) {
          const userInfo = await getUserInfo(otherUserId);
          const unreadCount = conversationData.unreadCount?.[currentUserId] || 0;
          
          conversationsData.push({
            id: docSnapshot.id,
            otherUserId: otherUserId, // 保存另一个用户的ID
            ...userInfo,
            lastMessage: conversationData.lastMessage?.content || '暂无消息',
            timestamp: conversationData.lastMessage?.timestamp?.toDate() || conversationData.updatedAt?.toDate() || new Date(),
            unreadCount,
          });
        }
      }

      // 合并同一用户的多个会话
      const mergedConversations = mergeConversationsByUser(conversationsData);
      
      // 按更新时间排序（最新的在前）
      mergedConversations.sort((a, b) => b.timestamp - a.timestamp);
      setConversations(mergedConversations);
      setLoading(false);
    }, (error) => {
      console.error('监听会话失败:', error);
      setLoading(false);
    });
  }, [currentUserId]);

  useEffect(() => {
    const unsubscribe = setupConversationListener();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setupConversationListener]);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  // 处理会话点击
  const handleConversationPress = (item) => {
    // 清除未读消息
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === item.id ? { ...conv, unreadCount: 0 } : conv
      )
    );

    navigation.navigate('Chat', {
      conversationId: generateConversationId(currentUserId, item.otherUserId), // 使用生成的会话ID
      otherUser: {
        id: item.otherUserId, // 使用另一个用户的ID
        displayName: item.displayName,
        avatar: item.avatar,
      },
    });
  };

  // 处理长按删除
  const handleLongPress = (item) => {
    Alert.alert(
      '删除会话',
      `确定要删除与${item.displayName}的会话吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setConversations(prevConversations =>
              prevConversations.filter(conv => conv.id !== item.id)
            );
          },
        },
      ]
    );
  };

  const renderConversation = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <DefaultAvatar size={50} name={item.displayName || 'U'} />
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{item.displayName}</Text>
            <Text style={styles.timestamp}>
              {item.timestamp.toLocaleTimeString()}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>消息</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4C3B" />
          <Text style={styles.loadingText}>加载消息中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>消息</Text>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>暂无消息</Text>
            <Text style={styles.emptySubtext}>开始与化妆师或客户聊天吧！</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B4C3B',
  },
  list: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5A5F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#ccc',
  },
}); 