import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { MESSAGE_TYPES, MESSAGE_STATUS } from '../models/Message';
import { MessageService } from '../services/MessageService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DefaultAvatar from '../components/DefaultAvatar';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

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
  const [recording, setRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const currentUserId = auth.currentUser?.uid;

  // 设置实时消息监听
  const setupMessageListener = useCallback(() => {
    if (!conversationId || !currentUserId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      console.log('收到消息更新，文档数量:', snapshot.docs.length);
      const newMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('消息数据:', {
          id: doc.id,
          senderId: data.senderId,
          content: data.content,
          timestamp: data.timestamp,
          status: data.status
        });
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
      
      console.log('设置消息列表，消息数量:', newMessages.length);
      
      // 合并临时消息和真实消息，避免重复
      setMessages(prev => {
        const tempMessages = prev.filter(msg => msg.isTemporary);
        const realMessages = newMessages;
        
        // 移除重复的临时消息（如果真实消息已到达）
        const filteredTempMessages = tempMessages.filter(tempMsg => 
          !realMessages.some(realMsg => 
            realMsg.senderId === tempMsg.senderId && 
            realMsg.content === tempMsg.content &&
            Math.abs(realMsg.timestamp.getTime() - tempMsg.timestamp.getTime()) < 5000
          )
        );
        
        const combinedMessages = [...filteredTempMessages, ...realMessages];
        
        // 按时间排序
        combinedMessages.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log('合并后的消息数量:', combinedMessages.length);
        return combinedMessages;
      });
      
      setLoading(false);
      
      // 自动滚动到底部
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, (error) => {
      console.error('监听消息失败:', error);
      setLoading(false);
      // 如果是因为会话不存在而失败，显示空消息列表
      if (error.code === 'failed-precondition') {
        console.log('会话不存在，显示空消息列表');
        setMessages([]);
      }
    });
  }, [conversationId, currentUserId]);

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

    // 设置消息监听
    setupMessageListener();

    // 标记消息为已读（延迟执行，确保会话已创建）
    if (conversationId && currentUserId) {
      setTimeout(() => {
        MessageService.markAsRead(conversationId, currentUserId).catch(console.error);
      }, 1000);
    }

    // 清理函数
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, otherUser, currentUserId, setupMessageListener]);

  const sendMessage = async () => {
    if (!inputText.trim() || sending || !currentUserId) return;

    try {
      setSending(true);
      const content = inputText.trim();
      setInputText(''); // 立即清空输入框

      console.log('开始发送消息:', {
        conversationId,
        currentUserId,
        otherUserId: otherUser.id,
        content
      });

      // 乐观更新：立即显示消息
      const tempMessage = {
        id: `temp_${Date.now()}`,
        senderId: currentUserId,
        receiverId: otherUser.id,
        content,
        type: MESSAGE_TYPES.TEXT,
        status: MESSAGE_STATUS.SENT,
        timestamp: new Date(),
        conversationId,
        isTemporary: true
      };

      setMessages(prev => [...prev, tempMessage]);

      // 发送消息到 Firestore
      const messageId = await MessageService.sendMessage(
        conversationId,
        currentUserId,
        otherUser.id,
        content,
        MESSAGE_TYPES.TEXT
      );

      console.log('消息发送成功，ID:', messageId);

      // 不立即移除临时消息，让监听器自动处理重复消息

      // 更新会话的最后消息时间
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        updatedAt: serverTimestamp(),
      });

      console.log('会话更新时间成功');

    } catch (error) {
      console.error('发送消息失败:', error);
      Alert.alert('发送失败', '消息发送失败，请重试');
      setInputText(content); // 恢复输入内容
      
      // 移除临时消息
      setMessages(prev => prev.filter(msg => !msg.isTemporary));
    } finally {
      setSending(false);
    }
  };

  const startRecording = () => {
    setRecording(true);
    // 这里应该开始录音
    // 模拟录音
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };

  const stopRecording = () => {
    setRecording(false);
    // 这里应该停止录音并发送
    // 模拟发送语音消息
    const newMessage = {
      id: Date.now().toString(),
      senderId: userId,
      content: '语音消息',
      timestamp: new Date(),
      type: MESSAGE_TYPES.VOICE,
      duration: 3, // 语音时长（秒）
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const deleteMessage = (messageId) => {
    Alert.alert(
      '删除消息',
      '确定要删除这条消息吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setMessages(prevMessages =>
              prevMessages.filter(msg => msg.id !== messageId)
            );
          },
        },
      ]
    );
  };

  // 格式化时间显示
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return '昨天 ' + messageTime.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageTime.toLocaleDateString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // 获取消息状态图标
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case MESSAGE_STATUS.SENT:
        return 'checkmark';
      case MESSAGE_STATUS.DELIVERED:
        return 'checkmark-done';
      case MESSAGE_STATUS.READ:
        return 'checkmark-done';
      default:
        return 'time';
    }
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === currentUserId;

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}
        onLongPress={() => deleteMessage(item.id)}
        delayLongPress={500}
      >
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
          {item.type === MESSAGE_TYPES.VOICE ? (
            <View style={styles.voiceMessage}>
              <Ionicons
                name={isOwnMessage ? "play" : "play-outline"}
                size={24}
                color={isOwnMessage ? "#fff" : "#6B4C3B"}
              />
              <Text style={[
                styles.voiceDuration,
                isOwnMessage ? styles.ownMessageText : null
              ]}>
                {item.duration}秒
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : null
            ]}>
              {item.content}
            </Text>
          )}
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : null
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            {isOwnMessage && (
              <Ionicons
                name={getMessageStatusIcon(item.status)}
                size={12}
                color={item.status === MESSAGE_STATUS.READ ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
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
          <TouchableOpacity
            style={[styles.voiceButton, recording && styles.voiceButtonRecording]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Ionicons
              name={recording ? "mic" : "mic-outline"}
              size={24}
              color={recording ? "#FF5A5F" : "#6B4C3B"}
            />
          </TouchableOpacity>
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
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusIcon: {
    marginLeft: 4,
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
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceButtonRecording: {
    backgroundColor: '#FFE5E5',
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  voiceDuration: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
}); 