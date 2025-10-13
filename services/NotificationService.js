import { auth, db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export class NotificationService {
  // 获取用户的总未读消息数
  static async getTotalUnreadCount(userId) {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );

      const querySnapshot = await getDocs(q);
      let totalUnread = 0;

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userUnreadCount = data.unreadCount?.[userId] || 0;
        totalUnread += userUnreadCount;
      });

      return totalUnread;
    } catch (error) {
      console.error('获取未读消息数失败:', error);
      return 0;
    }
  }

  // 获取用户的未读@提醒数
  static async getUnreadMentionsCount(userId) {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('taggedArtistId', '==', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.length;
    } catch (error) {
      console.error('获取未读@提醒数失败:', error);
      return 0;
    }
  }

  // 监听未读消息数变化
  static subscribeToUnreadCount(userId, callback) {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const userUnreadCount = data.unreadCount?.[userId] || 0;
        totalUnread += userUnreadCount;
      });
      callback(totalUnread);
    }, (error) => {
      console.error('监听未读消息数失败:', error);
      callback(0);
    });
  }

  // 监听未读@提醒数变化
  static subscribeToUnreadMentions(userId, callback) {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('taggedArtistId', '==', userId),
      where('isRead', '==', false)
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.length);
    }, (error) => {
      console.error('监听未读@提醒数失败:', error);
      callback(0);
    });
  }

  // 标记@提醒为已读
  static async markMentionAsRead(postId) {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('标记@提醒已读失败:', error);
    }
  }

  // 清除所有未读@提醒
  static async markAllMentionsAsRead(userId) {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('taggedArtistId', '==', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = db.batch();

      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: serverTimestamp()
        });
      });

      if (querySnapshot.docs.length > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error('标记所有@提醒已读失败:', error);
    }
  }

  // 获取通知摘要
  static async getNotificationSummary(userId) {
    try {
      const [unreadMessages, unreadMentions] = await Promise.all([
        this.getTotalUnreadCount(userId),
        this.getUnreadMentionsCount(userId)
      ]);

      return {
        unreadMessages,
        unreadMentions,
        total: unreadMessages + unreadMentions
      };
    } catch (error) {
      console.error('获取通知摘要失败:', error);
      return {
        unreadMessages: 0,
        unreadMentions: 0,
        total: 0
      };
    }
  }
}
