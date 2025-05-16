import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度不能少于6位');
      return;
    }
    
    setLoading(true);
    try {
      console.log('尝试登录...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('登录成功:', userCredential.user.email);
      // 登录成功后，App.js 中的 onAuthStateChanged 会自动导航到主应用
    } catch (error) {
      console.error('登录错误:', error);
      let errorMessage = '登录失败，请检查邮箱和密码';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = '邮箱或密码不正确';
          break;
        case 'auth/user-not-found':
          errorMessage = '该邮箱未注册';
          break;
        case 'auth/too-many-requests':
          errorMessage = '尝试次数过多，请稍后再试';
          break;
        case 'auth/invalid-email':
          errorMessage = '无效的邮箱格式';
          break;
        case 'auth/network-request-failed':
          errorMessage = '网络连接失败，请检查网络设置';
          break;
        default:
          errorMessage = `登录失败: ${error.message}`;
      }
      
      Alert.alert('登录失败', errorMessage);
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

        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>登录您的账号</Text>

        {/* 登录表单 */}
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
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>登录</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 分隔线 */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>或</Text>
          <View style={styles.divider} />
        </View>

        {/* 其他登录选项 */}
        <View style={styles.otherOptionsContainer}>
          <TouchableOpacity 
            style={styles.emailLinkButton}
            onPress={() => navigation.navigate('EmailLinkLogin')}
            disabled={loading}
          >
            <Text style={styles.emailLinkButtonText}>
              使用邮箱链接登录
            </Text>
          </TouchableOpacity>
        </View>

        {/* 底部选项 */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              没有账号？立即注册
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  otherOptionsContainer: {
    marginBottom: 24,
  },
  emailLinkButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6B4C3B',
    alignItems: 'center',
  },
  emailLinkButtonText: {
    color: '#6B4C3B',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    alignItems: 'center',
  },
  registerButton: {
    marginBottom: 16,
  },
  registerButtonText: {
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