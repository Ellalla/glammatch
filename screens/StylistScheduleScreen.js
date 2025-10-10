import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { auth } from '../firebaseConfig';
import { BookingService } from '../services/BookingService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';

// 添加加拿大法定假日列表
const CANADIAN_HOLIDAYS = {
  '2024-01-01': { name: '元旦', type: 'holiday' },
  '2024-02-19': { name: '家庭日', type: 'holiday' },
  '2024-03-29': { name: '耶稣受难日', type: 'holiday' },
  '2024-03-31': { name: '复活节', type: 'holiday' },
  '2024-05-20': { name: '维多利亚日', type: 'holiday' },
  '2024-07-01': { name: '加拿大日', type: 'holiday' },
  '2024-08-05': { name: '公民日', type: 'holiday' },
  '2024-09-02': { name: '劳动节', type: 'holiday' },
  '2024-10-14': { name: '感恩节', type: 'holiday' },
  '2024-11-11': { name: '国殇纪念日', type: 'holiday' },
  '2024-12-25': { name: '圣诞节', type: 'holiday' },
  '2024-12-26': { name: '节礼日', type: 'holiday' },
};

export default function StylistScheduleScreen({ navigation }) {
  const [vacations, setVacations] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showWorkHoursModal, setShowWorkHoursModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [workHours, setWorkHours] = useState({
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '18:00' },
    saturday: { enabled: true, start: '09:00', end: '18:00' },
    sunday: { enabled: false, start: '09:00', end: '18:00' },
  });

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vacationsData, blockedSlotsData, workHoursData] = await Promise.all([
        BookingService.getVacations(userId),
        BookingService.getBlockedTimeSlots(userId),
        BookingService.getWorkHours(userId),
      ]);
      setVacations(vacationsData);
      setBlockedSlots(blockedSlotsData);
      if (workHoursData) {
        setWorkHours(workHoursData);
      }
      updateMarkedDates(vacationsData, blockedSlotsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      Alert.alert('错误', '加载数据失败');
    }
  };

  const updateMarkedDates = (vacations, blocked) => {
    const marked = {};
    
    // 标记休假日期
    vacations.forEach(vacation => {
      const start = new Date(vacation.startDate.toDate());
      const end = new Date(vacation.endDate.toDate());
      let current = new Date(start);
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        marked[dateStr] = {
          marked: true,
          dotColor: '#FF5A5F',
          text: '休假'
        };
        current.setDate(current.getDate() + 1);
      }
    });

    // 标记不可用时间段
    blocked.forEach(slot => {
      const date = new Date(slot.date.toDate());
      const dateStr = date.toISOString().split('T')[0];
      
      // 检查是否是法定假日
      const isHoliday = CANADIAN_HOLIDAYS[dateStr];
      
      if (marked[dateStr]) {
        marked[dateStr].dots = [
          { color: '#FF5A5F', text: '休假' },
          { color: isHoliday ? '#FF0000' : '#6B4C3B', text: isHoliday ? '法定假日' : '不可用' }
        ];
      } else {
        marked[dateStr] = {
          marked: true,
          dotColor: isHoliday ? '#FF0000' : '#6B4C3B',
          text: isHoliday ? '法定假日' : '不可用'
        };
      }
    });

    // 添加法定假日标记
    Object.entries(CANADIAN_HOLIDAYS).forEach(([date, holiday]) => {
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: '#FF0000',
          text: holiday.name
        };
      }
    });

    setMarkedDates(marked);
  };

  const handleSetVacation = async () => {
    try {
      await BookingService.setVacation(userId, startDate, endDate, reason);
      setShowVacationModal(false);
      loadData();
      Alert.alert('成功', '休假时间已设置');
    } catch (error) {
      Alert.alert('错误', '设置休假失败');
    }
  };

  const handleBlockTime = async () => {
    try {
      // 验证时间格式
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        Alert.alert('错误', '请输入正确的时间格式 (HH:mm)');
        return;
      }

      // 验证时间范围
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      if (startMinutes >= endMinutes) {
        Alert.alert('错误', '结束时间必须晚于开始时间');
        return;
      }

      // 确保 stylistId 存在
      if (!userId) {
        Alert.alert('错误', '用户未登录');
        return;
      }

      // 先关闭模态框
      setShowBlockModal(false);

      // 调用服务保存数据
      await BookingService.blockTimeSlots(
        userId,
        selectedDate,
        startTime,
        endTime,
        reason || '时间段不可用'
      );

      // 重置状态
      setStartTime('09:00');
      setEndTime('18:00');
      setReason('');
      
      // 重新加载数据
      await loadData();
      
      Alert.alert('成功', '时间段已设置为不可用');
    } catch (error) {
      console.error('设置不可用时间段失败:', error);
      Alert.alert('错误', '设置不可用时间段失败，请重试');
    }
  };

  const handleSaveWorkHours = async () => {
    try {
      // 验证所有时间格式
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      for (const [day, hours] of Object.entries(workHours)) {
        if (hours.enabled) {
          if (!timeRegex.test(hours.start) || !timeRegex.test(hours.end)) {
            Alert.alert('错误', `请为${{
              monday: '周一',
              tuesday: '周二',
              wednesday: '周三',
              thursday: '周四',
              friday: '周五',
              saturday: '周六',
              sunday: '周日'
            }[day]}输入正确的时间格式 (HH:mm)`);
            return;
          }

          // 验证时间范围
          const [startHour, startMinute] = hours.start.split(':').map(Number);
          const [endHour, endMinute] = hours.end.split(':').map(Number);
          
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
          
          if (startMinutes >= endMinutes) {
            Alert.alert('错误', `请为${{
              monday: '周一',
              tuesday: '周二',
              wednesday: '周三',
              thursday: '周四',
              friday: '周五',
              saturday: '周六',
              sunday: '周日'
            }[day]}设置正确的开始和结束时间`);
            return;
          }
        }
      }

      // 确保 stylistId 存在
      if (!userId) {
        Alert.alert('错误', '用户未登录');
        return;
      }

      // 先关闭模态框
      setShowWorkHoursModal(false);

      // 调用服务保存数据
      await BookingService.setWorkHours(userId, workHours);
      
      // 重新加载数据
      await loadData();
      
      Alert.alert('成功', '工作时间已更新');
    } catch (error) {
      console.error('更新工作时间失败:', error);
      Alert.alert('错误', '更新工作时间失败，请重试');
    }
  };

  const renderWorkHoursModal = () => (
    <Modal
      visible={showWorkHoursModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>设置工作时间</Text>
          <ScrollView style={styles.workHoursScroll}>
            {Object.entries(workHours).map(([day, hours]) => (
              <View key={day} style={styles.workHoursRow}>
                <View style={styles.workHoursHeader}>
                  <Text style={styles.dayText}>
                    {{
                      monday: '周一',
                      tuesday: '周二',
                      wednesday: '周三',
                      thursday: '周四',
                      friday: '周五',
                      saturday: '周六',
                      sunday: '周日'
                    }[day]}
                  </Text>
                  <Switch
                    value={hours.enabled}
                    onValueChange={(value) => 
                      setWorkHours({
                        ...workHours,
                        [day]: { ...hours, enabled: value }
                      })
                    }
                    trackColor={{ false: '#ddd', true: '#6B4C3B' }}
                    thumbColor={hours.enabled ? '#fff' : '#f4f3f4'}
                  />
                </View>
                {hours.enabled && (
                  <View style={styles.timeInputs}>
                    <View style={styles.timeInputContainer}>
                      <Text style={styles.timeLabel}>开始时间</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={hours.start}
                        onChangeText={(text) => {
                          const formatted = text.replace(/[^0-9:]/g, '');
                          if (formatted.length <= 5) {
                            setWorkHours({
                              ...workHours,
                              [day]: { ...hours, start: formatted }
                            });
                          }
                        }}
                        placeholder="09:00"
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                    <Text style={styles.timeSeparator}>至</Text>
                    <View style={styles.timeInputContainer}>
                      <Text style={styles.timeLabel}>结束时间</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={hours.end}
                        onChangeText={(text) => {
                          const formatted = text.replace(/[^0-9:]/g, '');
                          if (formatted.length <= 5) {
                            setWorkHours({
                              ...workHours,
                              [day]: { ...hours, end: formatted }
                            });
                          }
                        }}
                        placeholder="18:00"
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowWorkHoursModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSaveWorkHours}
            >
              <Text style={styles.confirmButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Calendar
          onDayPress={(day) => {
            setSelectedDate(new Date(day.timestamp));
            setShowBlockModal(true);
          }}
          markedDates={{
            ...markedDates,
            ...Object.keys(CANADIAN_HOLIDAYS).reduce((acc, date) => ({
              ...acc,
              [date]: {
                ...markedDates[date],
                dots: [
                  ...(markedDates[date]?.dots || []),
                  { color: '#FF0000', text: CANADIAN_HOLIDAYS[date].name }
                ],
                // 添加自定义样式
                customStyles: {
                  container: {
                    backgroundColor: 'transparent',
                  },
                  text: {
                    color: '#FF0000',
                    fontWeight: 'bold',
                  },
                  // 添加假期名称
                  holidayName: {
                    color: '#FF0000',
                    fontSize: 10,
                    marginTop: 2,
                  }
                }
              }
            }), {})
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#6B4C3B',
            selectedDayBackgroundColor: '#6B4C3B',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#FF5A5F',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#6B4C3B',
            selectedDotColor: '#ffffff',
            arrowColor: '#6B4C3B',
            monthTextColor: '#6B4C3B',
            indicatorColor: '#6B4C3B',
            // 添加假日样式
            'stylesheet.calendar.header': {
              dayTextAtIndex0: {
                color: '#FF0000'
              },
              dayTextAtIndex6: {
                color: '#FF0000'
              }
            },
            // 自定义日期单元格样式
            'stylesheet.calendar.main': {
              dayContainer: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 50,
              },
              day: {
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              },
              dayText: {
                fontSize: 16,
                textAlign: 'center',
              },
              holidayName: {
                fontSize: 10,
                color: '#FF0000',
                textAlign: 'center',
                marginTop: 2,
              }
            }
          }}
          markingType="multi-dot"
          // 自定义日期渲染
          renderDay={(day, state) => {
            const dateStr = day.dateString;
            const isHoliday = CANADIAN_HOLIDAYS[dateStr];
            
            return (
              <View style={styles.dayContainer}>
                <Text style={[
                  styles.dayText,
                  state === 'disabled' && styles.disabledText,
                  isHoliday && styles.holidayText
                ]}>
                  {day.day}
                </Text>
                {isHoliday && (
                  <Text style={styles.holidayName}>
                    {CANADIAN_HOLIDAYS[dateStr].name}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>工作时间设置</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowWorkHoursModal(true)}
          >
            <Ionicons name="time-outline" size={24} color="#6B4C3B" />
          </TouchableOpacity>
        </View>
        {Object.entries(workHours).map(([day, hours]) => (
          <View key={day} style={styles.workHoursItem}>
            <Text style={styles.dayText}>
              {{
                monday: '周一',
                tuesday: '周二',
                wednesday: '周三',
                thursday: '周四',
                friday: '周五',
                saturday: '周六',
                sunday: '周日'
              }[day]}
            </Text>
            {hours.enabled ? (
              <Text style={styles.timeText}>
                {hours.start} - {hours.end}
              </Text>
            ) : (
              <Text style={styles.closedText}>休息</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>休假记录</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowVacationModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6B4C3B" />
          </TouchableOpacity>
        </View>
        {vacations.map((vacation, index) => (
          <View key={index} style={styles.vacationItem}>
            <Text style={styles.vacationDate}>
              {new Date(vacation.startDate.toDate()).toLocaleDateString()} - 
              {new Date(vacation.endDate.toDate()).toLocaleDateString()}
            </Text>
            <Text style={styles.vacationReason}>{vacation.reason}</Text>
          </View>
        ))}
      </View>

      {/* 休假设置模态框 */}
      <Modal
        visible={showVacationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>设置休假时间</Text>
            <TextInput
              style={styles.input}
              placeholder="休假原因"
              value={reason}
              onChangeText={setReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowVacationModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSetVacation}
              >
                <Text style={styles.confirmButtonText}>确认</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 设置不可用时间模态框 */}
      <Modal
        visible={showBlockModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>设置不可用时间</Text>
            <Text style={styles.selectedDate}>
              {selectedDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </Text>
            <View style={styles.timeInputs}>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>开始时间</Text>
                <TextInput
                  style={styles.timeInput}
                  value={startTime}
                  onChangeText={(text) => {
                    // 只允许输入数字和冒号
                    const formatted = text.replace(/[^0-9:]/g, '');
                    setStartTime(formatted);
                  }}
                  placeholder="09:00"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <Text style={styles.timeSeparator}>至</Text>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>结束时间</Text>
                <TextInput
                  style={styles.timeInput}
                  value={endTime}
                  onChangeText={(text) => {
                    // 只允许输入数字和冒号
                    const formatted = text.replace(/[^0-9:]/g, '');
                    setEndTime(formatted);
                  }}
                  placeholder="18:00"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>原因（选填）</Text>
              <TextInput
                style={[styles.input, styles.reasonInput]}
                placeholder="请输入原因"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowBlockModal(false);
                  setStartTime('09:00');
                  setEndTime('18:00');
                  setReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleBlockTime}
              >
                <Text style={styles.confirmButtonText}>确认</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {renderWorkHoursModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f7',
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B4C3B',
  },
  addButton: {
    padding: 4,
  },
  workHoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workHoursRow: {
    marginBottom: 16,
  },
  workHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  closedText: {
    fontSize: 14,
    color: '#999',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  timeSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  selectedDate: {
    fontSize: 16,
    color: '#6B4C3B',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  vacationItem: {
    backgroundColor: '#fff9f7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  vacationDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4C3B',
    marginBottom: 8,
  },
  vacationReason: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B4C3B',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#6B4C3B',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reasonContainer: {
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reasonInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  workHoursScroll: {
    maxHeight: 400,
  },
  workHoursRow: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  timeSeparator: {
    marginHorizontal: 12,
    color: '#666',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  // 添加假日相关样式
  holidayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 4,
  },
  holidayText: {
    color: '#FF0000',
    fontSize: 12,
    marginLeft: 4,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    paddingVertical: 4,
  },
  dayText: {
    fontSize: 16,
    textAlign: 'center',
  },
  holidayText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  holidayName: {
    fontSize: 10,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 2,
  },
  disabledText: {
    color: '#d9e1e8',
  },
}); 