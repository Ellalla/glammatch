import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function BookingsScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // 获取可用的时间段
  const fetchAvailableSlots = async (date) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      
      const booked = querySnapshot.docs.map(doc => doc.data().timeSlot);
      setBookedSlots(booked);

      // 生成可用时间段（示例：9:00-17:00，每小时一个时间段）
      const allSlots = Array.from({ length: 9 }, (_, i) => {
        const hour = i + 9;
        return `${hour}:00`;
      });

      const available = allSlots.filter(slot => !booked.includes(slot));
      setAvailableSlots(available);
    } catch (error) {
      console.error('获取可用时间段失败:', error);
      Alert.alert('错误', '获取可用时间段失败，请重试');
    }
  };

  // 处理日期选择
  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
    fetchAvailableSlots(date.dateString);
  };

  // 处理时间段选择
  const handleTimeSlotSelect = async (timeSlot) => {
    if (!auth.currentUser) {
      Alert.alert('提示', '请先登录');
      return;
    }

    try {
      const bookingData = {
        userId: auth.currentUser.uid,
        date: selectedDate,
        timeSlot: timeSlot,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const bookingsRef = collection(db, 'bookings');
      await addDoc(bookingsRef, bookingData);

      Alert.alert('成功', '预约成功！', [
        {
          text: '确定',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('预约失败:', error);
      Alert.alert('错误', '预约失败，请重试');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#6B4C3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>预约服务</Text>
      </View>

      <ScrollView style={styles.container}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#6B4C3B' }
          }}
          theme={{
            todayTextColor: '#6B4C3B',
            selectedDayBackgroundColor: '#6B4C3B',
            arrowColor: '#6B4C3B',
          }}
        />

        {selectedDate && (
          <View style={styles.timeSlotsContainer}>
            <Text style={styles.sectionTitle}>可选时间段</Text>
            <View style={styles.timeSlotsGrid}>
              {availableSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.timeSlot}
                  onPress={() => handleTimeSlotSelect(slot)}
                >
                  <Text style={styles.timeSlotText}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B4C3B',
  },
  container: {
    flex: 1,
  },
  timeSlotsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  timeSlot: {
    width: '30%',
    margin: '1.66%',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeSlotText: {
    fontSize: 16,
    color: '#6B4C3B',
    fontWeight: '500',
  },
}); 