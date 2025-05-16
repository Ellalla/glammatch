// screens/RegisterScreen.js
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }
    
    setLoading(true);
    try {
      // 创建用户账号
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 保存基础用户信息到 Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
        displayName: '',
        avatar: '',
        bio: '',
        location: '',
        services: [],
        followers: 0,
        following: 0,
        posts: 0,
        rating: 0,
        reviews: [],
        isVerified: false,
        lastActive: new Date(),
      });

      Alert.alert(
        '注册成功', 
        '账号创建成功！',
        [
          {
            text: '确定',
            onPress: () => {
              // 注册成功后，App.js 中的 onAuthStateChanged 会自动导航到主应用
            }
          }
        ]
      );
    } catch (error) {
      console.error('注册错误:', error);
      let errorMessage = '注册失败，请重试';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '该邮箱已被使用';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '无效的邮箱格式';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '密码强度不足，请使用至少6位密码';
      }
      
      Alert.alert('注册失败', errorMessage);
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

        <Text style={styles.title}>创建账号</Text>
        <Text style={styles.subtitle}>加入 GlamMatch 社区</Text>

        {/* 注册表单 */}
        <View style={styles.formContainer}>
          <TextInput
            placeholder="邮箱"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            placeholder="密码"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '注册中...' : '注册'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 底部选项 */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              已有账号？立即登录
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>返回首页</Text>
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomContainer: {
    alignItems: 'center',
  },
  loginButton: {
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#6B4C3B',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
