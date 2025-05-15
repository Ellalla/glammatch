import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

export default function LoginScreen() {
  const [userType, setUserType] = useState(null); // 'artist' 或 'client'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: 实现登录逻辑
    console.log('Login attempt:', { userType, email, password });
  };

  return (
    <StyledView className="flex-1 bg-[#fff9f7]">
      {/* 顶部 Logo */}
      <StyledView className="items-center mt-16 mb-8">
        <Image
          source={require('../assets/logo.png')}
          className="w-32 h-32"
          resizeMode="contain"
        />
      </StyledView>

      {/* 用户类型选择 */}
      <StyledView className="px-6 mb-8">
        <StyledText className="text-2xl font-bold text-[#6B4C3B] mb-4 text-center">
          选择您的身份
        </StyledText>
        <StyledView className="flex-row justify-center space-x-4">
          <StyledTouchableOpacity
            className={`px-6 py-3 rounded-full ${
              userType === 'artist' ? 'bg-[#6B4C3B]' : 'bg-gray-200'
            }`}
            onPress={() => setUserType('artist')}
          >
            <StyledText
              className={`text-lg font-semibold ${
                userType === 'artist' ? 'text-white' : 'text-gray-600'
              }`}
            >
              彩妆师
            </StyledText>
          </StyledTouchableOpacity>
          <StyledTouchableOpacity
            className={`px-6 py-3 rounded-full ${
              userType === 'client' ? 'bg-[#6B4C3B]' : 'bg-gray-200'
            }`}
            onPress={() => setUserType('client')}
          >
            <StyledText
              className={`text-lg font-semibold ${
                userType === 'client' ? 'text-white' : 'text-gray-600'
              }`}
            >
              客户
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>

      {/* 登录表单 */}
      {userType && (
        <StyledView className="px-6">
          <StyledText className="text-xl font-bold text-[#6B4C3B] mb-6 text-center">
            {userType === 'artist' ? '彩妆师登录' : '客户登录'}
          </StyledText>
          
          <StyledView className="space-y-4">
            <StyledTextInput
              className="bg-white px-4 py-3 rounded-lg border border-gray-200"
              placeholder="电子邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <StyledTextInput
              className="bg-white px-4 py-3 rounded-lg border border-gray-200"
              placeholder="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <StyledTouchableOpacity
              className="bg-[#6B4C3B] py-3 rounded-lg mt-6"
              onPress={handleLogin}
            >
              <StyledText className="text-white text-center text-lg font-semibold">
                登录
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity className="mt-4">
              <StyledText className="text-[#6B4C3B] text-center">
                忘记密码？
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>

          <StyledView className="flex-row justify-center mt-6">
            <StyledText className="text-gray-600">还没有账号？</StyledText>
            <StyledTouchableOpacity>
              <StyledText className="text-[#6B4C3B] font-semibold ml-1">
                立即注册
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      )}
    </StyledView>
  );
} 