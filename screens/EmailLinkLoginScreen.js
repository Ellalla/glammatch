import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { auth } from '../firebaseConfig';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmailLinkLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const actionCodeSettings = {
    url: 'https://glammatch.firebaseapp.com/finishSignUp', // ✅ 使用 Hosting 域名
    handleCodeInApp: true,
  };

  const handleSendLink = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      await AsyncStorage.setItem('emailForSignIn', email);
      Alert.alert('邮件已发送', '请查收邮箱并点击登录链接');
    } catch (error) {
      console.error('发送链接失败:', error);
      Alert.alert('错误', '无法发送链接，请检查邮箱地址');
    }
  };

  const checkLink = async () => {
    const url = await Linking.getInitialURL();
    if (url && isSignInWithEmailLink(auth, url)) {
      const email = await AsyncStorage.getItem('emailForSignIn');
      if (email) {
        try {
          await signInWithEmailLink(auth, email, url);
          Alert.alert('登录成功');
          navigation.navigate('Home'); // 登录后跳转
        } catch (error) {
          console.error('登录失败:', error);
          Alert.alert('错误', '登录失败，请重试');
        }
      }
    }
  };

  useEffect(() => {
    checkLink();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>邮箱登录</Text>
      <TextInput
        placeholder="请输入邮箱"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendLink}>
        <Text style={styles.buttonText}>发送登录链接</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff9f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#6B4C3B',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#6B4C3B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
