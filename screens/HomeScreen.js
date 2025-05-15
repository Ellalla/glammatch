// screens/HomeScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>❤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>✉</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
});
