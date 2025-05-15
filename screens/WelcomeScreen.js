// screens/WelcomeScreen.js
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation(); // ✅ 放到函数内部

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.contentContainer}>
        <View style={styles.spacer} />
        
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/hero-image.png')} // ✅ 注意路径！放到 screens 目录后，路径变了
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to GlamMatch</Text>
          <Text style={styles.subtitle}>Find beauty artists near you</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
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
  button: {
    width: '100%',
    backgroundColor: '#6B4C3B',
    paddingVertical: 16,
    borderRadius: 9999,
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
});
