import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
  ScrollView
} from 'react-native';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function EmailLinkLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    if (!email) {
      Alert.alert('错误', '请输入邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const actionCodeSettings = {
        url: 'https://glammatch.page.link/login', // 你的应用链接
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // 保存邮箱到本地存储，以便后续验证
      window.localStorage.setItem('emailForSignIn', email);
      
      Alert.alert(
        '邮件已发送',
        '请查收您的邮箱，点击邮件中的链接完成登录',
        [
          {
            text: '确定',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('发送邮件错误:', error);
      let errorMessage = '发送邮件失败，请重试';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = '无效的邮箱地址';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = '该账号已被禁用';
      }
      
      Alert.alert('发送失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>邮箱链接登录</Text>
        <Text style={styles.subtitle}>我们将向您的邮箱发送登录链接</Text>

        {/* 邮箱输入 */}
        <View style={styles.formContainer}>
          <TextInput
            placeholder="请输入邮箱地址"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSendLink}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '发送中...' : '发送登录链接'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 底部选项 */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>返回登录页面</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B4C3B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#6B4C3B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomContainer: {
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
