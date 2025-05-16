import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 获取当前用户 UID
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
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
          setProfile(docSnap.data());
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
            createdAt: new Date(),
            lastActive: new Date(),
          };
          
          // 保存基础资料到 Firestore
          await setDoc(docRef, basicProfile);
          setProfile(basicProfile);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        Alert.alert('错误', '加载用户资料失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 登出后，App.js 中的 onAuthStateChanged 会自动导航到登录页面
    } catch (error) {
      console.error('登出错误:', error);
      Alert.alert('错误', '登出失败，请重试');
    }
  };

  const handleEditProfile = () => {
    if (!profile) {
      Alert.alert('错误', '无法加载用户资料');
      return;
    }
    console.log('Navigating to EditProfile with profile:', profile);
    navigation.navigate('EditProfile', { 
      profile: {
        ...profile,
        email: auth.currentUser?.email,
      }
    });
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
            createdAt: new Date(),
            lastActive: new Date(),
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
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={24} color="#6B4C3B" />
            <Text style={styles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>
        </View>

        {/* 头像 */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditProfile', { profile, focusAvatar: true })}
        >
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {profile.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 昵称 & 邮箱 */}
        <Text style={styles.name}>{profile.displayName || '未设置昵称'}</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>

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
    backgroundColor: '#fff9f7',
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff9f7',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
    paddingTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#6B4C3B',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '500',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4C3B',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  logoutButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ff4d4f',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
