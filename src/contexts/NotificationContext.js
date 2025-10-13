import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import { NotificationService } from '../../services/NotificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadMentions, setUnreadMentions] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentUserId = auth.currentUser?.uid;

  // 标记@提醒为已读
  const markMentionAsRead = useCallback(async (postId) => {
    try {
      await NotificationService.markMentionAsRead(postId);
    } catch (error) {
      console.error('标记@提醒已读失败:', error);
    }
  }, []);

  // 清除所有未读@提醒
  const markAllMentionsAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllMentionsAsRead(currentUserId);
    } catch (error) {
      console.error('清除所有@提醒失败:', error);
    }
  }, [currentUserId]);

  // 获取通知摘要
  const getNotificationSummary = useCallback(async () => {
    if (!currentUserId) return { unreadMessages: 0, unreadMentions: 0, total: 0 };
    
    try {
      return await NotificationService.getNotificationSummary(currentUserId);
    } catch (error) {
      console.error('获取通知摘要失败:', error);
      return { unreadMessages: 0, unreadMentions: 0, total: 0 };
    }
  }, [currentUserId]);

  // 初始化监听器
  useEffect(() => {
    let unsubscribers = [];

    if (currentUserId) {
      // 监听未读消息数
      const unsubscribeMessages = NotificationService.subscribeToUnreadCount(
        currentUserId,
        (count) => {
          setUnreadMessages(count);
          setLoading(false);
        }
      );

      // 监听未读@提醒数
      const unsubscribeMentions = NotificationService.subscribeToUnreadMentions(
        currentUserId,
        (count) => {
          setUnreadMentions(count);
        }
      );

      unsubscribers = [unsubscribeMessages, unsubscribeMentions];
    } else {
      setUnreadMessages(0);
      setUnreadMentions(0);
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [currentUserId]);

  // 用户登出时清理
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUnreadMessages(0);
        setUnreadMentions(0);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    unreadMessages,
    unreadMentions,
    totalUnread: unreadMessages + unreadMentions,
    loading,
    markMentionAsRead,
    markAllMentionsAsRead,
    getNotificationSummary,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
