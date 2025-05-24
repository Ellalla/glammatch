import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { Message, Conversation, MESSAGE_TYPES, MESSAGE_STATUS } from '../models/Message';

export class MessageService {
  // 创建新会话
  static async createConversation(participants) {
    try {
      const conversationRef = collection(db, 'conversations');
      const conversationData = {
        participants,
        type: 'private',
        lastMessage: null,
        unreadCount: 0,
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(conversationRef, conversationData);
      return docRef.id;
    } catch (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
  }

  // 发送消息
  static async sendMessage(conversationId, senderId, receiverId, content, type = MESSAGE_TYPES.TEXT) {
    try {
      const messagesRef = collection(db, 'messages');
      const messageData = {
        conversationId,
        senderId,
        receiverId,
        content,
        type,
        status: MESSAGE_STATUS.SENT,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(messagesRef, messageData);
      
      // 更新会话的最后一条消息
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: messageData,
        updatedAt: serverTimestamp(),
        unreadCount: 1,
      });

      return docRef.id;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  // 获取会话列表
  static async getConversations(userId) {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }
  }

  // 获取会话消息
  static async getMessages(conversationId, limit = 20) {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取消息失败:', error);
      throw error;
    }
  }

  // 标记消息为已读
  static async markAsRead(conversationId, userId) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        unreadCount: 0
      });

      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('status', '!=', MESSAGE_STATUS.READ)
      );

      const querySnapshot = await getDocs(q);
      const batch = db.batch();

      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { status: MESSAGE_STATUS.READ });
      });

      await batch.commit();
    } catch (error) {
      console.error('标记消息已读失败:', error);
      throw error;
    }
  }

  // 监听新消息
  static subscribeToMessages(conversationId, callback) {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  }

  // 监听会话更新
  static subscribeToConversations(userId, callback) {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(conversations);
    });
  }
} 