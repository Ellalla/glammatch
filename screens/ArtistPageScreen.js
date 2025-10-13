import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, doc, getDoc, limit, startAfter } from 'firebase/firestore';
import { colors, typography } from '../src/theme';
import { Button, Card, Avatar } from '../src/components';
import { generateConversationId } from '../utils/chatUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ArtistPageScreen({ navigation, route }) {
  const { artistId } = route.params || {};
  const [artist, setArtist] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [clientShares, setClientShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' or 'shares'
  
  // 分页相关状态
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [portfolioLastDoc, setPortfolioLastDoc] = useState(null);
  const [sharesLastDoc, setSharesLastDoc] = useState(null);
  const [portfolioHasMore, setPortfolioHasMore] = useState(true);
  const [sharesHasMore, setSharesHasMore] = useState(true);
  
  const POSTS_PER_PAGE = 10; // 每页加载的帖子数量

  // 获取化妆师信息
  const loadArtist = async () => {
    try {
      const targetArtistId = artistId || auth.currentUser?.uid;
      const artistRef = doc(db, 'users', targetArtistId);
      const artistSnap = await getDoc(artistRef);
      
      if (artistSnap.exists()) {
        setArtist({ id: artistSnap.id, ...artistSnap.data() });
      }
    } catch (error) {
      console.error('获取化妆师信息失败:', error);
    }
  };

  // 获取作品集（支持分页）
  const loadPortfolio = async (isLoadMore = false) => {
    if (portfolioLoading) return;
    
    setPortfolioLoading(true);
    try {
      const targetArtistId = artistId || auth.currentUser?.uid;
      const portfolioRef = collection(db, 'portfolio');
      
      // 简化查询，避免需要复合索引
      let q = query(
        portfolioRef,
        where('artistId', '==', targetArtistId),
        limit(POSTS_PER_PAGE)
      );
      
      // 如果是加载更多，从上次的文档开始
      if (isLoadMore && portfolioLastDoc) {
        q = query(
          portfolioRef,
          where('artistId', '==', targetArtistId),
          startAfter(portfolioLastDoc),
          limit(POSTS_PER_PAGE)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const portfolioData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 客户端排序（按创建时间降序）
      portfolioData.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return timeB - timeA;
      });
      
      if (isLoadMore) {
        setPortfolio(prev => [...prev, ...portfolioData]);
      } else {
        setPortfolio(portfolioData);
      }
      
      // 更新分页状态
      if (querySnapshot.docs.length < POSTS_PER_PAGE) {
        setPortfolioHasMore(false);
      } else {
        setPortfolioLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setPortfolioHasMore(true);
      }
      
      console.log(`作品集加载完成: ${portfolioData.length} 个项目`);
    } catch (error) {
      console.error('获取作品集失败:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  // 获取客户分享（支持分页）
  const loadClientShares = async (isLoadMore = false) => {
    if (sharesLoading) return;
    
    setSharesLoading(true);
    try {
      const targetArtistId = artistId || auth.currentUser?.uid;
      const postsRef = collection(db, 'posts');
      
      // 简化查询，避免需要复合索引
      let q = query(
        postsRef,
        where('taggedArtistId', '==', targetArtistId),
        limit(POSTS_PER_PAGE)
      );
      
      // 如果是加载更多，从上次的文档开始
      if (isLoadMore && sharesLastDoc) {
        q = query(
          postsRef,
          where('taggedArtistId', '==', targetArtistId),
          startAfter(sharesLastDoc),
          limit(POSTS_PER_PAGE)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const sharesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 客户端排序（按创建时间降序）
      sharesData.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return timeB - timeA;
      });
      
      if (isLoadMore) {
        setClientShares(prev => [...prev, ...sharesData]);
      } else {
        setClientShares(sharesData);
      }
      
      // 更新分页状态
      if (querySnapshot.docs.length < POSTS_PER_PAGE) {
        setSharesHasMore(false);
      } else {
        setSharesLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setSharesHasMore(true);
      }
      
      console.log(`客户分享加载完成: ${sharesData.length} 个帖子`);
    } catch (error) {
      console.error('获取客户分享失败:', error);
    } finally {
      setSharesLoading(false);
    }
  };

  // 加载所有数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 重置分页状态
      setPortfolioLastDoc(null);
      setSharesLastDoc(null);
      setPortfolioHasMore(true);
      setSharesHasMore(true);
      
      await Promise.all([
        loadArtist(),
        loadPortfolio(false), // 初始加载
        loadClientShares(false) // 初始加载
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载更多作品集
  const loadMorePortfolio = () => {
    if (portfolioHasMore && !portfolioLoading) {
      loadPortfolio(true);
    }
  };

  // 加载更多客户分享
  const loadMoreShares = () => {
    if (sharesHasMore && !sharesLoading) {
      loadClientShares(true);
    }
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [artistId]);

  // 渲染作品集项目
  const renderPortfolioItem = ({ item }) => (
    <Card variant="elevated" padding="none" margin="small">
      <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
      <View style={styles.portfolioInfo}>
        <Text style={styles.portfolioTitle}>{item.title}</Text>
        <Text style={styles.portfolioDescription}>{item.description}</Text>
        <Text style={styles.portfolioDate}>
          {new Date(item.createdAt?.toDate()).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  // 渲染作品集加载更多
  const renderPortfolioFooter = () => {
    if (!portfolioHasMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        {portfolioLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMorePortfolio}>
            <Text style={styles.loadMoreText}>加载更多作品</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // 渲染客户分享项目
  const renderClientShareItem = ({ item }) => (
    <Card variant="elevated" padding="medium" margin="small">
      <View style={styles.shareHeader}>
        <Avatar 
          name={item.userEmail || '用户'} 
          size="small" 
        />
        <View style={styles.shareUserInfo}>
          <Text style={styles.shareUserName}>{item.userEmail || '匿名用户'}</Text>
          <Text style={styles.shareDate}>
            {new Date(item.createdAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.taggedBadge}>
          <Ionicons name="at" size={16} color={colors.primary} />
          <Text style={styles.taggedText}>@{artist?.displayName}</Text>
        </View>
      </View>
      
      <Text style={styles.shareDescription}>{item.description}</Text>
      
      {item.images && item.images.length > 0 && (
        <View style={styles.shareImages}>
          {item.images.slice(0, 3).map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.shareImage} />
          ))}
          {item.images.length > 3 && (
            <View style={styles.moreImagesOverlay}>
              <Text style={styles.moreImagesText}>+{item.images.length - 3}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.shareStats}>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={16} color={colors.gray[500]} />
          <Text style={styles.statText}>{item.likes || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.gray[500]} />
          <Text style={styles.statText}>{item.comments || 0}</Text>
        </View>
      </View>
    </Card>
  );

  // 渲染客户分享加载更多
  const renderSharesFooter = () => {
    if (!sharesHasMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        {sharesLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreShares}>
            <Text style={styles.loadMoreText}>加载更多分享</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>未找到化妆师信息</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 化妆师信息头部 */}
        <Card variant="elevated" padding="medium" margin="medium">
          <View style={styles.artistHeader}>
            <Avatar 
              source={artist.avatar ? { uri: artist.avatar } : null}
              name={artist.displayName || artist.email}
              size="xl"
            />
            <View style={styles.artistInfo}>
              <Text style={styles.artistName}>{artist.displayName || artist.email}</Text>
              <Text style={styles.artistLocation}>{artist.location || '未设置地址'}</Text>
              <Text style={styles.artistBio}>{artist.bio || '暂无简介'}</Text>
            </View>
          </View>
          
          <View style={styles.artistStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{portfolio.length}</Text>
              <Text style={styles.statLabel}>作品</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{clientShares.length}</Text>
              <Text style={styles.statLabel}>客户分享</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{artist.rating || 0}</Text>
              <Text style={styles.statLabel}>评分</Text>
            </View>
          </View>
          
          {/* 联系化妆师按钮 */}
          {artistId && artistId !== auth.currentUser?.uid && (
            <View style={styles.contactSection}>
              <Button
                title="联系化妆师"
                onPress={() => navigation.navigate('Chat', { 
                  conversationId: generateConversationId(auth.currentUser?.uid, artistId),
                  otherUser: {
                    id: artistId,
                    displayName: artist?.displayName || artist?.email || '化妆师',
                    avatar: artist?.avatar || null
                  }
                })}
                variant="primary"
                size="medium"
                icon="chatbubble"
                style={styles.contactButton}
              />
            </View>
          )}
        </Card>

        {/* 标签页切换 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
              作品集
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shares' && styles.activeTab]}
            onPress={() => setActiveTab('shares')}
          >
            <Text style={[styles.tabText, activeTab === 'shares' && styles.activeTabText]}>
              客户分享
            </Text>
          </TouchableOpacity>
        </View>

        {/* 内容区域 */}
        {activeTab === 'portfolio' ? (
          <View style={styles.contentContainer}>
            {portfolio.length > 0 ? (
              <FlatList
                data={portfolio}
                renderItem={renderPortfolioItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={renderPortfolioFooter}
              />
            ) : (
              <Card variant="outlined" padding="large" margin="medium">
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={48} color={colors.gray[400]} />
                  <Text style={styles.emptyText}>暂无作品</Text>
                  <Text style={styles.emptySubtext}>还没有上传任何作品</Text>
                </View>
              </Card>
            )}
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {clientShares.length > 0 ? (
              <FlatList
                data={clientShares}
                renderItem={renderClientShareItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={renderSharesFooter}
              />
            ) : (
              <Card variant="outlined" padding="large" margin="medium">
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color={colors.gray[400]} />
                  <Text style={styles.emptyText}>暂无客户分享</Text>
                  <Text style={styles.emptySubtext}>还没有客户分享体验</Text>
                </View>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.styles.body,
    color: colors.status.error,
  },
  artistHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  artistInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  artistName: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  artistLocation: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  artistBio: {
    ...typography.styles.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  artistStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.styles.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.styles.label,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  portfolioImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  portfolioInfo: {
    padding: 16,
  },
  portfolioTitle: {
    ...typography.styles.h5,
    color: colors.text.primary,
    marginBottom: 8,
  },
  portfolioDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  portfolioDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shareUserName: {
    ...typography.styles.label,
    color: colors.text.primary,
    fontWeight: '600',
  },
  shareDate: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  taggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taggedText: {
    ...typography.styles.caption,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  shareDescription: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: 12,
    lineHeight: 20,
  },
  shareImages: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  shareImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  moreImagesOverlay: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[800] + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    ...typography.styles.label,
    color: colors.white,
    fontWeight: '600',
  },
  shareStats: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...typography.styles.h5,
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loadMoreText: {
    ...typography.styles.label,
    color: colors.white,
    fontWeight: '600',
  },
  contactSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  contactButton: {
    width: '100%',
  },
});
