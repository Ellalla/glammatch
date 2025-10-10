import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';

export class BookingService {
  // 获取化妆师的所有套餐
  static async getStylistPackages(stylistId) {
    try {
      const packagesRef = collection(db, 'packages');
      const q = query(
        packagesRef,
        where('stylistId', '==', stylistId),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取套餐失败:', error);
      throw error;
    }
  }

  // 获取化妆师的可用时间
  static async getAvailableSlots(stylistId, date) {
    try {
      const slotsRef = collection(db, 'timeSlots');
      const q = query(
        slotsRef,
        where('stylistId', '==', stylistId),
        where('date', '==', date),
        where('isAvailable', '==', true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取可用时间失败:', error);
      throw error;
    }
  }

  // 设置休假时间
  static async setVacation(stylistId, startDate, endDate, reason) {
    try {
      const vacationRef = collection(db, 'vacations');
      await addDoc(vacationRef, {
        stylistId,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        reason,
        createdAt: serverTimestamp(),
      });

      // 更新这段时间内的所有预约状态
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('stylistId', '==', stylistId),
        where('date', '>=', Timestamp.fromDate(new Date(startDate))),
        where('date', '<=', Timestamp.fromDate(new Date(endDate)))
      );

      const querySnapshot = await getDocs(q);
      const batch = db.batch();

      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'cancelled',
          cancellationReason: '化妆师休假',
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('设置休假失败:', error);
      throw error;
    }
  }

  // 设置不可用时间段
  static async blockTimeSlots(stylistId, date, startTime, endTime, reason) {
    try {
      const blockedSlotsRef = collection(db, 'blockedSlots');
      await addDoc(blockedSlotsRef, {
        stylistId,
        date: Timestamp.fromDate(new Date(date)),
        startTime,
        endTime,
        reason,
        createdAt: serverTimestamp(),
      });

      // 更新这段时间内的所有预约状态
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('stylistId', '==', stylistId),
        where('date', '==', Timestamp.fromDate(new Date(date))),
        where('startTime', '>=', startTime),
        where('endTime', '<=', endTime)
      );

      const querySnapshot = await getDocs(q);
      const batch = db.batch();

      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'cancelled',
          cancellationReason: reason || '时间段不可用',
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('设置不可用时间段失败:', error);
      throw error;
    }
  }

  // 创建新套餐
  static async createPackage(stylistId, packageData) {
    try {
      const packagesRef = collection(db, 'packages');
      await addDoc(packagesRef, {
        stylistId,
        ...packageData,
        isActive: true,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('创建套餐失败:', error);
      throw error;
    }
  }

  // 更新套餐
  static async updatePackage(packageId, packageData) {
    try {
      const packageRef = doc(db, 'packages', packageId);
      await updateDoc(packageRef, {
        ...packageData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('更新套餐失败:', error);
      throw error;
    }
  }

  // 获取化妆师的休假记录
  static async getVacations(stylistId) {
    try {
      const vacationRef = collection(db, 'vacations');
      const q = query(
        vacationRef,
        where('stylistId', '==', stylistId),
        orderBy('startDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取休假记录失败:', error);
      throw error;
    }
  }

  // 获取化妆师的不可用时间段
  static async getBlockedSlots(stylistId, date) {
    try {
      const blockedSlotsRef = collection(db, 'blockedSlots');
      const q = query(
        blockedSlotsRef,
        where('stylistId', '==', stylistId),
        where('date', '==', Timestamp.fromDate(new Date(date)))
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取不可用时间段失败:', error);
      throw error;
    }
  }

  // 获取化妆师的收入统计
  static async getStylistEarnings(stylistId, startDate, endDate) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('stylistId', '==', stylistId),
        where('status', '==', 'completed'),
        where('date', '>=', Timestamp.fromDate(new Date(startDate))),
        where('date', '<=', Timestamp.fromDate(new Date(endDate)))
      );

      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => doc.data());
      
      // 计算总收入
      const totalEarnings = bookings.reduce((sum, booking) => sum + booking.price, 0);
      
      // 按套餐统计
      const packageStats = bookings.reduce((stats, booking) => {
        const packageId = booking.packageId;
        if (!stats[packageId]) {
          stats[packageId] = {
            count: 0,
            earnings: 0,
          };
        }
        stats[packageId].count++;
        stats[packageId].earnings += booking.price;
        return stats;
      }, {});

      return {
        totalEarnings,
        packageStats,
        bookingCount: bookings.length,
      };
    } catch (error) {
      console.error('获取收入统计失败:', error);
      throw error;
    }
  }

  // 获取化妆师的工作时间
  static async getWorkHours(stylistId) {
    try {
      const docRef = doc(db, 'stylists', stylistId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().workHours;
      }
      return null;
    } catch (error) {
      console.error('获取工作时间失败:', error);
      throw error;
    }
  }

  // 设置化妆师的工作时间
  static async setWorkHours(stylistId, workHours) {
    try {
      const docRef = doc(db, 'stylists', stylistId);
      await updateDoc(docRef, {
        workHours: workHours,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('设置工作时间失败:', error);
      throw error;
    }
  }

  // 检查时间段是否可用
  static async isTimeSlotAvailable(stylistId, date, startTime, endTime) {
    try {
      // 获取化妆师的工作时间
      const workHours = await this.getWorkHours(stylistId);
      if (!workHours) return false;

      // 获取日期是星期几
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const daySchedule = workHours[dayOfWeek];

      // 检查是否在工作时间内
      if (!daySchedule.enabled) return false;

      // 将时间转换为分钟数进行比较
      const convertToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const slotStart = convertToMinutes(startTime);
      const slotEnd = convertToMinutes(endTime);
      const workStart = convertToMinutes(daySchedule.start);
      const workEnd = convertToMinutes(daySchedule.end);

      // 检查时间段是否在工作时间内
      if (slotStart < workStart || slotEnd > workEnd) {
        return false;
      }

      // 检查是否有其他预约
      const bookings = await this.getBookingsByDate(stylistId, date);
      for (const booking of bookings) {
        const bookingStart = convertToMinutes(booking.startTime);
        const bookingEnd = convertToMinutes(booking.endTime);
        
        // 检查时间段是否重叠
        if (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('检查时间段可用性失败:', error);
      throw error;
    }
  }

  // 获取指定日期的所有预约
  static async getBookingsByDate(stylistId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'bookings'),
        where('stylistId', '==', stylistId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取预约失败:', error);
      throw error;
    }
  }
} 