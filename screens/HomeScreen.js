// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0));

  // 检查用户登录状态
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // 处理登出
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMoreMenu(false);
    } catch (error) {
      console.error('登出错误:', error);
      Alert.alert('错误', '登出失败，请重试');
    }
  };

  // 显示更多菜单
  const toggleMoreMenu = () => {
    const toValue = showMoreMenu ? 0 : 1;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
    setShowMoreMenu(!showMoreMenu);
  };

  // 处理菜单项点击
  const handleMenuItemPress = (action) => {
    setShowMoreMenu(false);
    switch (action) {
      case 'logout':
        handleLogout();
        break;
      case 'privacy':
        Alert.alert('隐私条例', '隐私条例内容将在这里显示');
        break;
      case 'about':
        Alert.alert('关于 GlamMatch', 'GlamMatch 是一个连接美妆师和客户的平台...');
        break;
    }
  };

  // 模拟下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const mockPosts = [
    {
      id: '1',
      username: 'MakeupByAnna',
      avatar: 'https://via.placeholder.com/60',
      image: 'https://via.placeholder.com/400',
      caption: '新娘妆容～完美的一天需要完美的妆容✨ #新娘妆 #婚礼',
      likes: 128,
      comments: 24,
      time: '2小时前',
      location: '上海',
    },
    {
      id: '2',
      username: 'GlamByMina',
      avatar: 'https://via.placeholder.com/60',
      image: 'https://via.placeholder.com/400',
      caption: '舞台妆挑战🔥特别感谢@舞台灯光团队 提供的绝佳灯光！ #舞台妆 #演出',
      likes: 85,
      comments: 12,
      time: '5小时前',
      location: '北京',
    },
    {
      id: '3',
      username: 'BeautyQueen',
      avatar: 'https://via.placeholder.com/60',
      image: 'https://via.placeholder.com/400',
      caption: '日常裸妆教程分享💄简单几步打造自然妆容',
      likes: 217,
      comments: 45,
      time: '昨天',
      location: '广州',
    },
  ];

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      {/* 用户信息栏 */}
      <View style={styles.userHeader}>
        <TouchableOpacity style={styles.userInfo}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            {item.location && (
              <Text style={styles.location}>{item.location}</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* 帖子图片 */}
      <Image source={{ uri: item.image }} style={styles.postImage} />

      {/* 操作按钮栏 */}
      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>♥</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      {/* 点赞信息 */}
      <Text style={styles.likes}>{item.likes} 人点赞</Text>

      {/* 标题和评论 */}
      <View style={styles.captionContainer}>
        <Text style={styles.captionUsername}>{item.username}</Text>
        <Text style={styles.caption}>{item.caption}</Text>
      </View>

      {/* 查看评论 */}
      {item.comments > 0 && (
        <TouchableOpacity>
          <Text style={styles.viewComments}>
            查看全部 {item.comments} 条评论
          </Text>
        </TouchableOpacity>
      )}

      {/* 时间戳 */}
      <Text style={styles.timestamp}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>GlamMatch</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleMoreMenu}
          >
            <Text style={styles.headerIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 更多菜单 */}
      <Modal
        visible={showMoreMenu}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                transform: [{
                  translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }],
                opacity: menuAnimation
              }
            ]}
          >
            {user ? (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('logout')}
              >
                <Text style={styles.menuItemText}>登出</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMoreMenu(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.menuItemText}>登录</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('privacy')}
            >
              <Text style={styles.menuItemText}>隐私条例</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('about')}
            >
              <Text style={styles.menuItemText}>关于 GlamMatch</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索美妆师和作品..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 帖子列表 */}
      <FlatList
        data={mockPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF5A5F']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerIcon: {
    fontSize: 22,
    color: '#333',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  postContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 22,
    color: '#333',
  },
  likes: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 12,
    marginBottom: 6,
  },
  captionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  captionUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 6,
  },
  caption: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  viewComments: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
});
