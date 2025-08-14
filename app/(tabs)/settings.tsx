import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  Settings as SettingsIcon,
  Bell,
  Smartphone,
  Trash2,
  Shield,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { NotificationService } from '@/services/NotificationService';
import { ApiService } from '@/services/ApiService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notificationsEnabled: false,
    deviceRegistered: false,
    deviceId: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [notificationsEnabled, deviceId] = await Promise.all([
        NotificationService.areNotificationsEnabled(),
        NotificationService.getDeviceId(),
      ]);

      const deviceRegistered = await ApiService.checkDeviceRegistration(deviceId);

      setSettings({
        notificationsEnabled,
        deviceRegistered,
        deviceId,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (enabled) => {
    try {
      if (enabled) {
        const token = await NotificationService.requestPermissions();
        if (token) {
          await ApiService.registerDevice({
            deviceId: settings.deviceId,
            pushToken: token,
            platform: 'ios', // This would be dynamic in a real app
            deviceName: 'My Device',
          });
        }
      } else {
        await NotificationService.disableNotifications();
        await ApiService.unregisterDevice(settings.deviceId);
      }
      loadSettings();
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  };

  const clearNotificationHistory = () => {
    Alert.alert(
      'Clear Notification History',
      'This will permanently delete all stored notifications. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.clearAllNotifications();
              Alert.alert('Success', 'Notification history cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notification history');
            }
          },
        },
      ]
    );
  };

  const resetDevice = () => {
    Alert.alert(
      'Reset Device',
      'This will unregister your device and clear all local data. You will need to re-enable notifications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.unregisterDevice(settings.deviceId);
              await NotificationService.clearDeviceData();
              await NotificationService.clearAllNotifications();
              loadSettings();
              Alert.alert('Success', 'Device reset successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset device');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, subtitle, rightElement, onPress, showChevron = false }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Icon size={20} color="#6B7280" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && <ChevronRight size={16} color="#D1D5DB" />}
      </View>
    </TouchableOpacity>
  );

  const StatusBadge = ({ active, label }) => (
    <View style={[styles.statusBadge, { backgroundColor: active ? '#DCFCE7' : '#FEF2F2' }]}>
      <View style={[styles.statusDot, { backgroundColor: active ? '#10B981' : '#EF4444' }]} />
      <Text style={[styles.statusText, { color: active ? '#059669' : '#DC2626' }]}>
        {label}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <SettingsIcon size={32} color="#3B82F6" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={Bell}
              title="Push Notifications"
              subtitle={settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
              rightElement={
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                  thumbColor={settings.notificationsEnabled ? '#3B82F6' : '#F3F4F6'}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={Smartphone}
              title="Device Registration"
              subtitle={`ID: ${settings.deviceId.substring(0, 16)}...`}
              rightElement={
                <StatusBadge
                  active={settings.deviceRegistered}
                  label={settings.deviceRegistered ? 'Active' : 'Inactive'}
                />
              }
            />
            <View style={styles.separator} />
            <SettingItem
              icon={Shield}
              title="Notification Status"
              subtitle="Current permission status"
              rightElement={
                <StatusBadge
                  active={settings.notificationsEnabled}
                  label={settings.notificationsEnabled ? 'Granted' : 'Denied'}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={Trash2}
              title="Clear Notification History"
              subtitle="Remove all stored notifications"
              onPress={clearNotificationHistory}
              showChevron
            />
            <View style={styles.separator} />
            <SettingItem
              icon={Smartphone}
              title="Reset Device"
              subtitle="Unregister and clear all data"
              onPress={resetDevice}
              showChevron
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon={Info}
              title="App Version"
              subtitle="1.0.0"
            />
            <View style={styles.separator} />
            <SettingItem
              icon={Bell}
              title="Push Notification System"
              subtitle="Built with Expo and Firebase"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 64,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 56,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});