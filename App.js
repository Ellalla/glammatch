import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

// 使用 styled 包装原生组件
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function App() {
  return (
    <StyledView style={{ flex: 1, backgroundColor: '#fff9f7' }}>
      <StatusBar style="dark" />
      
      {/* 主要内容容器 */}
      <StyledView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 64, paddingHorizontal: 24 }}>
        {/* 顶部空间 */}
        <StyledView style={{ flex: 1 }} />
        
        {/* 圆形图片 */}
        <StyledView style={{ width: 256, height: 256, borderRadius: 128, overflow: 'hidden', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
          <StyledImage
            source={require('./assets/hero-image.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </StyledView>
        
        {/* 标题文本 */}
        <StyledView style={{ alignItems: 'center', marginBottom: 32 }}>
          <StyledText style={{ fontSize: 36, fontWeight: 'bold', color: '#6B4C3B', marginBottom: 8 }}>
            Welcome to GlamMatch
          </StyledText>
          <StyledText style={{ fontSize: 18, color: '#666' }}>
            Find beauty artists near you
          </StyledText>
        </StyledView>
        
        {/* 底部按钮 */}
        <StyledTouchableOpacity 
          style={{ width: '100%', backgroundColor: '#6B4C3B', paddingVertical: 16, borderRadius: 9999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}
          onPress={() => console.log('Get Started pressed')}
        >
          <StyledText style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
            Get Started
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
}
