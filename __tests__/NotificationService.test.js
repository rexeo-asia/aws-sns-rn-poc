import { NotificationService } from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

// Mock Expo Device
jest.mock('expo-device', () => ({
  isDevice: true,
  osName: 'iOS',
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('should request permissions and return token for new device', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ 
        data: 'ExponentPushToken[test-token-123]' 
      });
      AsyncStorage.getItem.mockResolvedValue(null); // No existing device ID

      const token = await NotificationService.requestPermissions();

      expect(token).toBe('ExponentPushToken[test-token-123]');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@push_token', 'ExponentPushToken[test-token-123]');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@device_id', expect.stringContaining('ios-iOS-'));
    });

    it('should return null when permissions are denied', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const token = await NotificationService.requestPermissions();

      expect(token).toBeNull();
    });

    it('should use existing device ID when available', async () => {
      const existingDeviceId = 'existing-device-123';
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ 
        data: 'ExponentPushToken[test-token-123]' 
      });
      AsyncStorage.getItem.mockResolvedValue(existingDeviceId);

      await NotificationService.requestPermissions();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@push_token', 'ExponentPushToken[test-token-123]');
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('@device_id', expect.any(String));
    });
  });

  describe('getDeviceId', () => {
    it('should return existing device ID', async () => {
      const existingId = 'existing-device-123';
      AsyncStorage.getItem.mockResolvedValue(existingId);

      const deviceId = await NotificationService.getDeviceId();

      expect(deviceId).toBe(existingId);
    });

    it('should generate new device ID when none exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const deviceId = await NotificationService.getDeviceId();

      expect(deviceId).toMatch(/^ios-iOS-\d+$/);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@device_id', deviceId);
    });
  });

  describe('notification storage', () => {
    it('should store notifications correctly', async () => {
      const existingNotifications = [
        { id: '1', title: 'Old Notification', body: 'Old body' }
      ];
      const newNotification = { id: '2', title: 'New Notification', body: 'New body' };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingNotifications));

      await NotificationService.storeNotification(newNotification);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@notifications',
        JSON.stringify([newNotification, ...existingNotifications])
      );
    });

    it('should limit stored notifications to 100', async () => {
      const manyNotifications = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        title: `Notification ${i}`,
        body: `Body ${i}`
      }));
      const newNotification = { id: '100', title: 'New', body: 'New body' };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(manyNotifications));

      await NotificationService.storeNotification(newNotification);

      const storedCall = AsyncStorage.setItem.mock.calls.find(call => call[0] === '@notifications');
      const storedNotifications = JSON.parse(storedCall[1]);
      
      expect(storedNotifications).toHaveLength(100);
      expect(storedNotifications[0]).toEqual(newNotification);
    });
  });

  describe('areNotificationsEnabled', () => {
    it('should return true when permissions are granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const enabled = await NotificationService.areNotificationsEnabled();

      expect(enabled).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const enabled = await NotificationService.areNotificationsEnabled();

      expect(enabled).toBe(false);
    });
  });
});