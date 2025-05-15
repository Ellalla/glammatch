import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 模拟附近的美妆师数据
  const nearbyArtists = [
    {
      id: '1',
      name: '小婷化妆造型',
      avatar: 'https://via.placeholder.com/60',
      distance: '0.5km',
      rating: 4.8,
      services: ['新娘妆', '日常妆容', '晚宴妆'],
      price: '¥380起'
    },
    {
      id: '2',
      name: 'Tina美妆工作室',
      avatar: 'https://via.placeholder.com/60',
      distance: '1.2km',
      rating: 4.9,
      services: ['写真妆容', '活动妆容'],
      price: '¥450起'
    },
    {
      id: '3',
      name: '美丽坊化妆',
      avatar: 'https://via.placeholder.com/60',
      distance: '1.8km',
      rating: 4.6,
      services: ['日常妆容', '职场妆容'],
      price: '¥280起'
    },
    {
      id: '4',
      name: 'Glam专业造型',
      avatar: 'https://via.placeholder.com/60',
      distance: '2.1km',
      rating: 4.7,
      services: ['婚礼妆容', '舞台妆容', '写真妆容'],
      price: '¥520起'
    },
  ];

  const renderArtistItem = ({ item }) => (
    <TouchableOpacity style={styles.artistCard}>
      <Image source={{ uri: item.avatar }} style={styles.artistAvatar} />
      
      <View style={styles.artistInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.artistName}>{item.name}</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {item.rating}</Text>
        </View>
        
        <Text style={styles.services}>
          {item.services.join(' · ')}
        </Text>
        
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>附近美妆师</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索化妆师或服务..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>筛选</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>地图将在这里显示</Text>
        <Text style={styles.mapSubtext}>
          在实际开发中，这里应该使用react-native-maps或Expo的MapView组件
        </Text>
      </View>
      
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>附近的美妆师</Text>
        <FlatList
          data={nearbyArtists}
          renderItem={renderArtistItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  artistCard: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  artistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  artistInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 4,
  },
  rating: {
    color: '#FF5A5F',
    fontWeight: '500',
  },
  services: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#FF5A5F',
    fontWeight: '500',
  },
});
