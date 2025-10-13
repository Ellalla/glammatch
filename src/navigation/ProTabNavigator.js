import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';
import { useNotifications } from '../contexts/NotificationContext';
import { BadgeIcon } from '../components';

// 导入专业化妆师相关屏幕
import HomeScreen from '../../screens/HomeScreen';
import BookingsScreen from '../../screens/BookingsScreen';
import StylistScheduleScreen from '../../screens/StylistScheduleScreen';
import MyPackageScreen from '../../screens/MyPackageScreen';
import MessagesScreen from '../../screens/MessagesScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import ArtistPageScreen from '../../screens/ArtistPageScreen'; // 专业化妆师的作品集页面
import MentionsScreen from '../../screens/MentionsScreen'; // 被@提醒页面
import EditProfileScreen from '../../screens/EditProfileScreen';
import ChatScreen from '../../screens/ChatScreen';
import UserProfileScreen from '../../screens/UserProfileScreen';
import ThemeTestScreen from '../../screens/ThemeTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 专业化妆师标签页导航器
function ProTabs() {
  const { unreadMessages, unreadMentions } = useNotifications();

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
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Schedule':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Packages':
              iconName = focused ? 'gift' : 'gift-outline';
              break;
            case 'Mentions':
              iconName = focused ? 'notifications' : 'notifications-outline';
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

          // 为消息和提醒标签页添加徽章
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

          if (route.name === 'Mentions' && unreadMentions > 0) {
            return (
              <BadgeIcon 
                name={iconName} 
                size={size} 
                color={color} 
                badgeCount={unreadMentions}
              />
            );
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.role.professional,
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
          title: 'GlamMatch Pro'
        }} 
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen} 
        options={{ 
          tabBarLabel: '预约',
          title: '预约管理'
        }} 
      />
      <Tab.Screen 
        name="Schedule" 
        component={StylistScheduleScreen} 
        options={{ 
          tabBarLabel: '日程',
          title: '日程管理'
        }} 
      />
      <Tab.Screen 
        name="Packages" 
        component={MyPackageScreen} 
        options={{ 
          tabBarLabel: '套餐',
          title: '套餐管理'
        }} 
      />
      <Tab.Screen 
        name="Mentions" 
        component={MentionsScreen} 
        options={{ 
          tabBarLabel: '提醒',
          title: '被@提醒'
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
 * 专业化妆师导航器
 * 为专业化妆师提供专业功能：首页、预约管理、日程管理、套餐管理、消息、个人资料
 */
export default function ProTabNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProTabs" 
        component={ProTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ArtistPage" 
        component={ArtistPageScreen}
        options={{
          title: '我的作品集',
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
    </Stack.Navigator>
  );
}
