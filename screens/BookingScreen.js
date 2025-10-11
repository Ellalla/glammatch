import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { auth } from '../firebaseConfig';
import { BookingService } from '../services/BookingService';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function BookingScreen({ navigation, route }) {
  return (
    <ScrollView style={styles.container}>
      {/* 管理日程按钮 - 暂时对所有用户显示 */}
      <TouchableOpacity
        style={styles.stylistManageButton}
        onPress={() => navigation.navigate('StylistSchedule')}
      >
        <Ionicons name="calendar-outline" size={24} color="#fff" />
        <Text style={styles.stylistManageButtonText}>管理我的日程</Text>
      </TouchableOpacity>

      {/* 现有的预约内容 */}
      <View style={styles.bookingContainer}>
        // ... existing code ...
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  stylistManageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B4C3B',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  stylistManageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // ... existing styles ...
}); 