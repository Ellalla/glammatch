import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Switch
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultAvatar from '../components/DefaultAvatar';
import PortfolioGrid from '../components/PortfolioGrid';
import { colors, typography } from '../src/theme';
import { Button, Card } from '../src/components';


export default function ProfileScreen({ navigation, route }) {
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState('client');
  const [loading, setLoading] = useState(true);

  // 获取当前用户 UID
  const uid = auth.currentUser?.uid;

  // 从本地存储加载资料
  const loadLocalProfile = async () => {
    try {
      const localProfile = await AsyncStorage.getItem('userProfile');
      if (localProfile) {
        console.log('从本地存储加载资料成功');
        return JSON.parse(localProfile);
      }
    } catch (error) {
      console.error('从本地存储加载资料失败:', error);
    }
    return null;
  };

  // 获取用户资料
  const fetchProfile = useCallback(async () => {
    if (!uid) {
      console.log('No user ID found');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', uid);
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Profile data:', docSnap.data());
        const profileData = docSnap.data();
        setProfile(profileData);
        const role = profileData.role || 'client';
        console.log('Setting user role to:', role);
        setUserRole(role);
        // 保存到本地存储
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      } else {
        console.log('No profile found, creating basic profile');
        // 如果没有找到用户资料，创建一个基本资料
        const basicProfile = {
          email: auth.currentUser.email,
          displayName: '',
          bio: '',
          location: '',
          services: [],
          followers: 0,
          following: 0,
          posts: 0,
          rating: 0,
          reviews: [],
          isVerified: false,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };
        
        try {
          // 保存基础资料到 Firestore
          await setDoc(docRef, basicProfile);
          setProfile(basicProfile);
          setIsStylist(false);
          // 保存到本地存储
          await AsyncStorage.setItem('userProfile', JSON.stringify(basicProfile));
        } catch (error) {
          console.error('保存基础资料到 Firestore 失败:', error);
          // 如果 Firestore 保存失败，使用本地存储
          setProfile(basicProfile);
          setIsStylist(false);
          await AsyncStorage.setItem('userProfile', JSON.stringify(basicProfile));
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // 尝试从本地存储加载
      const localProfile = await loadLocalProfile();
      if (localProfile) {
        setProfile(localProfile);
        setUserRole(localProfile.role || 'client');
      } else {
        Alert.alert('错误', '加载用户资料失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // 监听路由参数变化
  useEffect(() => {
    if (route.params?.profile) {
      setProfile(route.params.profile);
    }
  }, [route.params]);

  // 初始加载和页面获得焦点时获取资料
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 监听页面焦点
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });

    return unsubscribe;
  }, [navigation, fetchProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 登出后，App.js 中的 onAuthStateChanged 会自动导航到登录页面
    } catch (error) {
      console.error('登出错误:', error);
      Alert.alert('错误', '登出失败，请重试');
    }
  };

  // 处理资料更新
  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      profile: profile,
    });
  };

  const handleAddBooking = () => {
    navigation.navigate('Bookings');
  };

  // 导航到升级为专业化妆师页面
  const handleBecomeProfessional = () => {
    navigation.navigate('BecomeProfessional');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6B4C3B" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>无法加载用户资料</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile', { profile: {
            email: auth.currentUser?.email,
            displayName: '',
            bio: '',
            location: '',
            services: [],
            followers: 0,
            following: 0,
            posts: 0,
            rating: 0,
            reviews: [],
            isVerified: false,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }})}
        >
          <Ionicons name="create-outline" size={24} color="#6B4C3B" />
          <Text style={styles.editButtonText}>编辑资料</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 顶部操作栏 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddBooking}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6B4C3B" />
            <Text style={styles.addButtonText}>预约</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={24} color="#6B4C3B" />
            <Text style={styles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>
        </View>

        {/* 头像 */}
        <TouchableOpacity 
          onPress={handleEditProfile}
        >
          {profile.avatar ? (
            <Image 
              source={{ uri: profile.avatar }} 
              style={styles.avatar}
              onError={(e) => {
                console.log('头像加载失败，使用默认头像');
              }}
            />
          ) : (
            <DefaultAvatar size={80} name={profile.displayName || 'U'} />
          )}
        </TouchableOpacity>

        {/* 昵称 & 邮箱 */}
        <Text style={styles.name}>{profile.displayName || '未设置昵称'}</Text>
        {!profile.displayName && (
          <Text style={styles.email}>{auth.currentUser?.email}</Text>
        )}

        {/* 简介 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>简介</Text>
          <Text style={styles.sectionContent}>
            {profile.bio || '暂无简介，快去编辑吧！'}
          </Text>
        </View>

        {/* 服务 */}
        {profile.services?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>我的服务</Text>
            {profile.services.map((svc, i) => (
              <Text key={i} style={styles.sectionContent}>• {svc}</Text>
            ))}
          </View>
        )}

        {/* 地址 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>地址</Text>
          <Text style={styles.sectionContent}>
            {profile.location || '未填写'}
          </Text>
        </View>

        {/* 作品集部分 - 仅专业化妆师显示 */}
        {userRole === 'professional' && (
          <View style={styles.section}>
            <View style={styles.portfolioHeader}>
              <Text style={styles.sectionTitle}>我的作品集</Text>
              <TouchableOpacity 
                style={styles.addPortfolioButton}
                onPress={() => navigation.navigate('PortfolioManager')}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={styles.addPortfolioText}>管理作品集</Text>
              </TouchableOpacity>
            </View>
            
            {profile.albums && profile.albums.length > 0 ? (
              <View style={styles.albumsContainer}>
                {profile.albums.map((album, index) => (
                  <TouchableOpacity 
                    key={album.id || index}
                    style={styles.albumItem}
                    onPress={() => navigation.navigate('AlbumView', { album })}
                  >
                    <View style={styles.albumCover}>
                      {album.coverImage ? (
                        <Image source={{ uri: album.coverImage }} style={styles.albumCoverImage} />
                      ) : (
                        <View style={styles.albumPlaceholder}>
                          <Ionicons name="images-outline" size={32} color={colors.gray[400]} />
                        </View>
                      )}
                      <View style={styles.albumOverlay}>
                        <Text style={styles.albumPhotoCount}>
                          {album.photos ? album.photos.length : 0}/10
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.albumTitle}>{album.name}</Text>
                    <Text style={styles.albumDescription}>
                      {album.description || '暂无描述'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyPortfolio}>
                <Ionicons name="images-outline" size={48} color={colors.gray[400]} />
                <Text style={styles.emptyPortfolioText}>暂无作品集</Text>
                <Text style={styles.emptyPortfolioSubtext}>
                  创建相册并上传您的作品照片
                </Text>
                <TouchableOpacity 
                  style={styles.createAlbumButton}
                  onPress={() => navigation.navigate('PortfolioManager')}
                >
                  <Text style={styles.createAlbumButtonText}>创建第一个相册</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 管理日程按钮 - 仅专业化妆师显示 */}
        {userRole === 'professional' && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('StylistSchedule')}
            >
              <Ionicons name="calendar-outline" size={24} color="#6B4C3B" />
              <Text style={styles.menuText}>管理我的日程</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        {/* 套餐管理按钮 - 仅专业化妆师显示 */}
        {userRole === 'professional' && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyPackage')}
            >
              <Ionicons name="gift-outline" size={24} color="#6B4C3B" />
              <Text style={styles.menuText}>管理我的套餐</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        {/* 主题测试按钮 */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ThemeTest')}
          >
            <Ionicons name="color-palette-outline" size={24} color="#6B4C3B" />
            <Text style={styles.menuText}>主题测试</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 身份设置 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>身份设置</Text>
          </View>
          
          <View style={styles.identityCard}>
            <View style={styles.identityInfo}>
              <Ionicons 
                name={userRole === 'professional' ? "cut-outline" : "person-outline"} 
                size={24} 
                color="#6B4C3B" 
              />
              <View style={styles.identityTextContainer}>
                <Text style={styles.identityTitle}>
                  {userRole === 'professional' ? '专业化妆师' : '普通用户'}
                </Text>
                <Text style={styles.identityDescription}>
                  {userRole === 'professional' 
                    ? '您可以管理服务套餐和日程安排' 
                    : '升级为专业化妆师以提供专业服务'}
                </Text>
              </View>
            </View>
            {userRole !== 'professional' && (
              <Button
                title="升级"
                onPress={handleBecomeProfessional}
                variant="primary"
                size="small"
              />
            )}
          </View>
        </View>

        {/* 其他设置项 */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#6B4C3B" />
            <Text style={styles.menuText}>账号设置</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#6B4C3B" />
            <Text style={styles.menuText}>通知设置</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#6B4C3B" />
            <Text style={styles.menuText}>帮助与反馈</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 登出按钮 */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    boxShadow: `0px 2px 4px ${colors.shadow.light}`,
    elevation: 3,
  },
  addButtonText: {
    color: colors.primary,
    ...typography.styles.label,
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    boxShadow: `0px 2px 4px ${colors.shadow.light}`,
    elevation: 3,
  },
  editButtonText: {
    color: colors.primary,
    ...typography.styles.label,
    marginLeft: 4,
  },
  errorText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#6B4C3B',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: '#666',
  },
  name: {
    ...typography.styles.h4,
    color: colors.primary,
    marginTop: 12,
    marginBottom: 16,
  },
  email: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 24,
  },
  section: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    boxShadow: `0px 2px 4px ${colors.shadow.light}`,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  identityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  identityTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  identityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  identityDescription: {
    fontSize: 12,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ff4d4f',
    borderRadius: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyPortfolio: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyPortfolioText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  emptyPortfolioSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPortfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addPortfolioText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  albumsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  albumItem: {
    width: '48%',
    marginBottom: 16,
  },
  albumCover: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray[100],
  },
  albumCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  albumPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  albumOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  albumPhotoCount: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  albumDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  createAlbumButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  createAlbumButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
