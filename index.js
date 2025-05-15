import { registerRootComponent } from 'expo';
import App from './App';
import { LogBox } from 'react-native';
import './firebaseConfig'; // 确保Firebase初始化

// 调试用 - 忽略特定的警告
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Require cycle:',
  'Setting a timer',
]);

// 全局错误处理
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // 忽略某些React Native内部错误
    if (args[0] && args[0].includes && 
       (args[0].includes('RCTBridge required dispatch_sync') || 
        args[0].includes('Expected color'))) {
      return;
    }
    originalConsoleError(...args);
  };
}

console.log('Starting GlamMatch app...');

registerRootComponent(App);
