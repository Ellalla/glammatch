import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebaseConfig';
import { MESSAGE_TYPES } from '../models/Message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DefaultAvatar from '../components/DefaultAvatar';

// 模拟消息数据
const MOCK_MESSAGES = {
  user1: [
    {
      id: '1',
      senderId: 'user1',
      content: '你好，请问这个造型师还在吗？',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: MESSAGE_TYPES.TEXT,
    },
    {
      id: '2',
      senderId: 'currentUser',
      content: '您好，是的，造型师现在可以预约',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      type: MESSAGE_TYPES.TEXT,
    },
    {
      id: '3',
      senderId: 'user1',
      content: '太好了，我想预约明天下午',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      type: MESSAGE_TYPES.TEXT,
    },
  ],
  user2: [
    {
      id: '4',
      senderId: 'currentUser',
      content: '您好，我们已经确认了您的预约',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: MESSAGE_TYPES.TEXT,
    },
    {
      id: '5',
      senderId: 'user2',
      content: '好的，我们约在明天下午2点',
      timestamp: new Date(Date.now() - 1000 * 60 * 29),
      type: MESSAGE_TYPES.TEXT,
    },
  ],
  user3: [
    {
      id: '6',
      senderId: 'user3',
      content: '谢谢你的推荐！',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: MESSAGE_TYPES.TEXT,
    },
  ],
};

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const userId = 'currentUser'; // 模拟当前用户ID

  useEffect(() => {
    // 设置导航栏标题
    navigation.setOptions({
      title: otherUser.displayName || '聊天',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('UserProfile', { userId: otherUser.id })}
        >
          <Ionicons name="person-circle-outline" size={24} color="#6B4C3B" />
        </TouchableOpacity>
      ),
    });

    // 模拟加载消息
    setTimeout(() => {
      setMessages(MOCK_MESSAGES[conversationId] || []);
      setLoading(false);
    }, 1000);
  }, [conversationId, otherUser]);

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      // 模拟发送消息
      const newMessage = {
        id: Date.now().toString(),
        senderId: userId,
        content: inputText.trim(),
        timestamp: new Date(),
        type: MESSAGE_TYPES.TEXT,
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === userId;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {otherUser.avatar ? (
              <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
            ) : (
              <DefaultAvatar size={30} name={otherUser.displayName || 'U'} />
            )}
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : null
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : null
          ]}>
            {item.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B4C3B" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="输入消息..."
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={sending || !inputText.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#6B4C3B" />
            ) : (
              <Ionicons name="send" size={24} color="#6B4C3B" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: '#6B4C3B',
  },
  otherBubble: {
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  ownMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 