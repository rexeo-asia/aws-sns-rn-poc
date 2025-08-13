import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DEVICE_ID: '@device_id',
  PUSH_TOKEN: '@push_token',
  NOTIFICATIONS: '@notifications',
  NOTIFICATION_SETTINGS: '@notification_settings',
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static listeners: Array<(notification: any) => void> = [];

  static async requestPermissions(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        Alert.alert('Error', 'Push notifications only work on physical devices');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Push notification permissions are required');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      });

      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token.data);
      
      // Generate or retrieve device ID
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `${Platform.OS}-${Device.osName}-${Date.now()}`;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }

      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  static async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `${Platform.OS}-${Device.osName}-${Date.now()}`;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return `${Platform.OS}-${Date.now()}`;
    }
  }

  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  static async disableNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify({ enabled: false }));
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    }
  }

  static onNotificationReceived(callback: (notification: any) => void) {
    this.listeners.push(callback);

    // Listen for notifications received while app is running
    const subscription = Notifications.addNotificationReceivedListener(callback);

    // Listen for notification responses (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        callback(response.notification);
      }
    );

    return () => {
      subscription.remove();
      responseSubscription.remove();
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  static async storeNotification(notification: any): Promise<void> {
    try {
      const existing = await this.getStoredNotifications();
      const updated = [notification, ...existing.slice(0, 99)]; // Keep last 100
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  static async getStoredNotifications(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updated = notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  static async deleteNotification(id: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updated = notifications.filter(notif => notif.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  static async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  static async clearDeviceData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DEVICE_ID,
        STORAGE_KEYS.PUSH_TOKEN,
        STORAGE_KEYS.NOTIFICATION_SETTINGS,
      ]);
    } catch (error) {
      console.error('Failed to clear device data:', error);
    }
  }
}