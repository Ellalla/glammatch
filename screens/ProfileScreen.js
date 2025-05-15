import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  FlatList,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('posts'); // 'posts' 或 'saved'

  // 模拟用户数据
  const mockUser = {
    name: '张小美',
    username: '@xiaobeauty',
    avatar: 'https://via.placeholder.com/100',
    bio: '专业美妆师 | 时尚达人 | 接受私人定制妆容',
    followers: 128,
    following: 245,
    posts: 36,
  };

  // 模拟用户作品
  const mockPosts = [
    { id: '1', image: 'https://via.placeholder.com/150', likes: 24 },
    { id: '2', image: 'https://via.placeholder.com/150', likes: 18 },
    { id: '3', image: 'https://via.placeholder.com/150', likes: 32 },
    { id: '4', image: 'https://via.placeholder.com/150', likes: 15 },
    { id: '5', image: 'https://via.placeholder.com/150', likes: 29 },
    { id: '6', image: 'https://via.placeholder.com/150', likes: 21 },
  ];

  // 检查用户登录状态
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // 用户已登录
        setUser(currentUser);
      } else {
        // 用户未登录
        setUser(null);
      }
    });
    
    return unsubscribe;
  }, []);

  // 处理用户登出
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 登出成功后，App.js 中的 onAuthStateChanged 会自动导航到登录页面
    } catch (error) {
      console.error('登出错误:', error);
      Alert.alert('错误', '登出失败，请重试');
    }
  };

  // 渲染单个作品缩略图
  const renderPostItem = ({ item }) => (
    <TouchableOpacity style={styles.postItem}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.likesContainer}>
        <Text style={styles.likesText}>♥ {item.likes}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: mockUser.avatar }} 
            style={styles.avatar} 
          />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.posts}</Text>
              <Text style={styles.statLabel}>作品</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.followers}</Text>
              <Text style={styles.statLabel}>粉丝</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.following}</Text>
              <Text style={styles.statLabel}>关注</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.name}>{mockUser.name}</Text>
        <Text style={styles.username}>{mockUser.username}</Text>
        <Text style={styles.bio}>{mockUser.bio}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>登出</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, tab === 'posts' && styles.activeTab]}
          onPress={() => setTab('posts')}
        >
          <Text style={[styles.tabText, tab === 'posts' && styles.activeTabText]}>
            我的作品
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, tab === 'saved' && styles.activeTab]}
          onPress={() => setTab('saved')}
        >
          <Text style={[styles.tabText, tab === 'saved' && styles.activeTabText]}>
            收藏
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.postsContainer}>
        <FlatList
          data={mockPosts}
          renderItem={renderPostItem}
          keyExtractor={item => item.id}
          numColumns={3}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    marginTop: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 24,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF5A5F',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF5A5F',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF5A5F',
  },
  postsContainer: {
    padding: 2,
  },
  postItem: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 2,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  likesContainer: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  likesText: {
    color: '#fff',
    fontSize: 12,
  },
});
