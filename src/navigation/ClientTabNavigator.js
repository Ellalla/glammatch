import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';
import { useNotifications } from '../contexts/NotificationContext';
import { BadgeIcon } from '../components';

// 导入客户端相关屏幕
import HomeScreen from '../../screens/HomeScreen';
import MapScreen from '../../screens/MapScreen';
import MessagesScreen from '../../screens/MessagesScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import CreatePostScreen from '../../screens/CreatePostScreen'; // 客户上传体验照
import ArtistPageScreen from '../../screens/ArtistPageScreen'; // 化妆师页面
import EditProfileScreen from '../../screens/EditProfileScreen';
import BookingsScreen from '../../screens/BookingsScreen';
import ChatScreen from '../../screens/ChatScreen';
import UserProfileScreen from '../../screens/UserProfileScreen';
import ThemeTestScreen from '../../screens/ThemeTestScreen';
import BecomeProfessionalScreen from '../../screens/BecomeProfessionalScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 客户端标签页导航器
function ClientTabs() {
  const { unreadMessages } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'CreatePost':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          // 为消息标签页添加徽章
          if (route.name === 'Messages' && unreadMessages > 0) {
            return (
              <BadgeIcon 
                name={iconName} 
                size={size} 
                color={color} 
                badgeCount={unreadMessages}
              />
            );
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.role.client,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.light,
          boxShadow: `0px -2px 4px ${colors.shadow.light}`,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: '首页',
          title: 'GlamMatch'
        }} 
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ 
          tabBarLabel: '附近',
          title: '附近化妆师'
        }} 
      />
      <Tab.Screen 
        name="CreatePost" 
        component={CreatePostScreen} 
        options={{ 
          tabBarLabel: '发布',
          title: '分享体验'
        }} 
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={{ 
          tabBarLabel: '消息',
          title: '消息'
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: '我的',
          title: '个人资料'
        }} 
      />
    </Tab.Navigator>
  );
}

/**
 * 客户端导航器
 * 为普通用户提供基础功能：首页、附近、消息、个人资料、发布体验照
 */
export default function ClientTabNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ClientTabs" 
        component={ClientTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ArtistPage" 
        component={ArtistPageScreen}
        options={{
          title: '化妆师详情',
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: '编辑资料',
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
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
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{
          title: '用户主页',
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.primary,
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
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="BecomeProfessional" 
        component={BecomeProfessionalScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
