// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Alert, Platform } from 'react-native';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCy0r0_OQKfp7ImC_TNtT0rBYMVafrkCGg",
  authDomain: "glammatch-f2800.firebaseapp.com",
  projectId: "glammatch-f2800",
  storageBucket: "glammatch-f2800.appspot.com",
  messagingSenderId: "1001450618353",
  appId: "1:1001450618353:web:e1b68af0141b7d8c149850"
};

// 初始化 Firebase
let app;
let auth;
let firestore;

try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  
  console.log('Firebase initialized successfully!');
  
  // 在开发环境中使用模拟器（可选）
  if (__DEV__ && false) { // 设置为 true 启用模拟器
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      console.log('Firebase emulators connected');
    } catch (emulatorError) {
      console.error('Failed to connect to Firebase emulators:', emulatorError);
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // 在正式环境中显示用户友好的错误信息
  if (!__DEV__) {
    setTimeout(() => {
      Alert.alert(
        'Connection Error',
        'There was a problem connecting to the service. Please try again later.'
      );
    }, 1000);
  }
}

// 导出 Firebase 实例
export { app, auth, firestore };
