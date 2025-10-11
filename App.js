import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailLinkLoginScreen from './screens/EmailLinkLoginScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import BookingsScreen from './screens/BookingsScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';
import StylistScheduleScreen from './screens/StylistScheduleScreen';
import MyPackageScreen from './screens/MyPackageScreen';
import ThemeTestScreen from './screens/ThemeTestScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ArtistPageScreen from './screens/ArtistPageScreen';

// 导入基于角色的导航器
import ClientTabNavigator from './src/navigation/ClientTabNavigator';
import ProTabNavigator from './src/navigation/ProTabNavigator';

import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 身份验证栈
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailLinkLogin" component={EmailLinkLoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// 主应用导航栏
function MainTabs() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        options={{ headerShown: false }}
      >
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = 'home-outline';
                else if (route.name === 'Upload') iconName = 'add-circle-outline';
                else if (route.name === 'Map') iconName = 'map-outline';
                else if (route.name === 'Messages') iconName = 'chatbubbles-outline';
                else if (route.name === 'Profile') iconName = 'person-outline';
                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#FF5A5F',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                height: 60,
                paddingBottom: 10,
                paddingTop: 5,
                boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff'
              },
              tabBarLabelStyle: {
                fontSize: 12
              },
              style: {
                pointerEvents: 'auto'
              }
            })}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ tabBarLabel: '首页' }}
            />
            <Tab.Screen 
              name="Upload" 
              component={UploadScreen} 
              options={{ tabBarLabel: '发布' }}
            />
            <Tab.Screen 
              name="Map" 
              component={MapScreen} 
              options={{ tabBarLabel: '附近' }}
            />
            <Tab.Screen 
              name="Messages" 
              component={MessagesScreen} 
              options={{ tabBarLabel: '消息' }}
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ tabBarLabel: '我的' }}
            />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: '编辑资料',
          headerStyle: {
            backgroundColor: '#fff9f7',
          },
          headerTintColor: '#6B4C3B',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitle: '返回',
        }}
      />
      <Stack.Screen 
        name="StylistSchedule" 
        component={StylistScheduleScreen}
        options={{
          title: '日程管理',
          headerStyle: {
            backgroundColor: '#fff9f7',
          },
          headerTintColor: '#6B4C3B',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitle: '返回',
        }}
      />
      <Stack.Screen 
        name="MyPackage" 
        component={MyPackageScreen}
        options={{
          title: '我的套餐',
          headerStyle: {
            backgroundColor: '#fff9f7',
          },
          headerTintColor: '#6B4C3B',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitle: '返回',
        }}
      />
      <Stack.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          headerStyle: {
            backgroundColor: '#fff9f7',
          },
          headerTintColor: '#6B4C3B',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="ThemeTest" 
        component={ThemeTestScreen}
        options={{
          title: '主题测试',
          headerStyle: {
            backgroundColor: '#fff9f7',
          },
          headerTintColor: '#6B4C3B',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // 获取用户角色
  const fetchUserRole = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.role || 'client'; // 默认为客户端
      }
      return 'client'; // 如果用户文档不存在，默认为客户端
    } catch (error) {
      console.error('获取用户角色失败:', error);
      return 'client'; // 出错时默认为客户端
    }
  };

  // 监听用户身份验证状态
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 获取用户角色
        const role = await fetchUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  // 显示加载状态
  if (initializing) {
    return null;
  }

  // 根据用户角色渲染不同的导航器
  const renderMainNavigator = () => {
    if (!user) return <AuthStack />;
    
    // 调试信息
    console.log('Current user role:', userRole);
    console.log('Rendering navigator for role:', userRole === 'professional' ? 'Professional' : 'Client');
    
    if (userRole === 'professional') {
      return <ProTabNavigator />;
    } else {
      return <ClientTabNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {renderMainNavigator()}
    </NavigationContainer>
  );
}
