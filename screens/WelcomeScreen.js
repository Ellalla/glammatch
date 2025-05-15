// screens/WelcomeScreen.js
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  // 检查用户是否已登录
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 用户已登录，可以导航到Home
        console.log('User already logged in:', user.email);
      }
    });
    
    return unsubscribe;
  }, []);
  
  // 直接登录演示账号
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, 'demo@example.com', 'password123');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Demo login error:', error);
      alert('无法登录演示账号。请尝试注册新账号。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.contentContainer}>
        <View style={styles.spacer} />
        
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/hero-image.png')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to GlamMatch</Text>
          <Text style={styles.subtitle}>Find beauty artists near you</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.buttonText}>注册账号</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              已有账号？登录
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.tertiaryButton]}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
              {loading ? '登录中...' : '直接体验（演示账号）'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
  },
  imageContainer: {
    width: 256,
    height: 256,
    borderRadius: 128,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6B4C3B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    backgroundColor: '#6B4C3B',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B4C3B',
  },
  secondaryButtonText: {
    color: '#6B4C3B',
  },
  tertiaryButton: {
    backgroundColor: '#f8f1ee',
    borderWidth: 0,
  },
  tertiaryButtonText: {
    color: '#6B4C3B',
    fontSize: 16,
  },
});
