import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { MessageService } from '../services/MessageService';
import { doc, getDoc } from 'firebase/firestore';
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

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setConversations(MOCK_USERS);
      setLoading(false);
    }, 1000);
  }, []);

  const renderConversation = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.id,
          otherUser: {
            id: item.id,
            displayName: item.displayName,
            avatar: item.avatar,
          },
        })}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>暂无消息</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
}); 