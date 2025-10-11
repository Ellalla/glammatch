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
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userRole, setUserRole] = useState('client'); // 默认选择客户端
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('错误', '请填写所有必填信息');
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
      console.log('开始注册...');
      // 创建用户账号
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('用户创建成功:', user.email);

      // 保存基础用户信息到 Firestore
      const userData = {
        email: user.email,
        displayName: displayName,
        role: userRole, // 设置用户角色
        createdAt: new Date().toISOString(),
        avatar: '',
        bio: '',
        location: '',
        services: userRole === 'professional' ? [] : undefined, // 专业化妆师才有服务列表
        followers: 0,
        following: 0,
        posts: 0,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        lastActive: new Date().toISOString(),
      };

      console.log('正在保存用户资料...');
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('用户资料保存成功');

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
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '该邮箱已被使用';
          break;
        case 'auth/invalid-email':
          errorMessage = '无效的邮箱格式';
          break;
        case 'auth/weak-password':
          errorMessage = '密码强度不足，请使用至少6位密码';
          break;
        case 'auth/network-request-failed':
          errorMessage = '网络连接失败，请检查网络设置';
          break;
        default:
          errorMessage = `注册失败: ${error.message}`;
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

          <TextInput
            placeholder="姓名"
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
            editable={!loading}
          />

          {/* 角色选择 */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>选择您的身份：</Text>
            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  userRole === 'client' && styles.roleOptionSelected
                ]}
                onPress={() => setUserRole('client')}
                disabled={loading}
              >
                <Text style={[
                  styles.roleOptionText,
                  userRole === 'client' && styles.roleOptionTextSelected
                ]}>
                  普通用户
                </Text>
                <Text style={styles.roleOptionDesc}>
                  寻找化妆师，分享体验
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  userRole === 'professional' && styles.roleOptionSelected
                ]}
                onPress={() => setUserRole('professional')}
                disabled={loading}
              >
                <Text style={[
                  styles.roleOptionText,
                  userRole === 'professional' && styles.roleOptionTextSelected
                ]}>
                  专业化妆师
                </Text>
                <Text style={styles.roleOptionDesc}>
                  提供服务，管理预约
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>注册</Text>
            )}
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
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4C3B',
    marginBottom: 12,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: '#6B4C3B',
    backgroundColor: '#6B4C3B10',
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  roleOptionTextSelected: {
    color: '#6B4C3B',
  },
  roleOptionDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
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
