import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Bell, Smartphone, Activity, TrendingUp, Send } from 'lucide-react-native';
import { NotificationService } from '@/services/NotificationService';
import { ApiService } from '@/services/ApiService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [stats, setStats] = useState({
    isRegistered: false,
    notificationsEnabled: false,
    totalNotifications: 0,
    unreadCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [deviceId, notificationsEnabled, storedNotifications] = await Promise.all([
        NotificationService.getDeviceId(),
        NotificationService.areNotificationsEnabled(),
        NotificationService.getStoredNotifications(),
      ]);

      const isRegistered = await ApiService.checkDeviceRegistration(deviceId);
      const unreadCount = storedNotifications.filter(n => !n.isRead).length;

      setStats({
        isRegistered,
        notificationsEnabled,
        totalNotifications: storedNotifications.length,
        unreadCount,
      });
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const token = await NotificationService.requestPermissions();
      if (token) {
        const deviceId = await NotificationService.getDeviceId();
        await ApiService.registerDevice({
          deviceId,
          pushToken: token,
          platform: 'ios', // This would be dynamic in a real app
          deviceName: 'My Device',
        });
        loadHomeData();
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={32} color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.title}>Push Notifications</Text>
        </View>

        {!stats.isRegistered && (
          <View style={styles.setupCard}>
            <View style={styles.setupIcon}>
              <Bell size={32} color="#3B82F6" />
            </View>
            <Text style={styles.setupTitle}>Enable Push Notifications</Text>
            <Text style={styles.setupDescription}>
              Get notified instantly when important updates are available
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={requestNotificationPermissions}
              activeOpacity={0.8}
            >
              <Text style={styles.setupButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsGrid}>
          <StatCard
            icon={Bell}
            title="Total Notifications"
            value={stats.totalNotifications}
            color="#3B82F6"
          />
          <StatCard
            icon={Activity}
            title="Unread"
            value={stats.unreadCount}
            subtitle={stats.unreadCount > 0 ? 'New messages' : 'All caught up'}
            color="#10B981"
          />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Device Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { 
                backgroundColor: stats.isRegistered ? '#10B981' : '#EF4444' 
              }]} />
              <Text style={styles.statusLabel}>Registration</Text>
              <Text style={[styles.statusValue, {
                color: stats.isRegistered ? '#10B981' : '#EF4444'
              }]}>
                {stats.isRegistered ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { 
                backgroundColor: stats.notificationsEnabled ? '#10B981' : '#EF4444' 
              }]} />
              <Text style={styles.statusLabel}>Permissions</Text>
              <Text style={[styles.statusValue, {
                color: stats.notificationsEnabled ? '#10B981' : '#EF4444'
              }]}>
                {stats.notificationsEnabled ? 'Granted' : 'Denied'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Send size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
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
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  setupCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  setupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  setupDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    gap: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 32,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusGrid: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});