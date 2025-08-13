import React, { useState, useEffect } from 'react';
import { Smartphone, Bell, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Dashboard() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    notificationsToday: 0,
    notificationsLast24h: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [devicesResponse, healthResponse, historyResponse] = await Promise.all([
        axios.get('/api/devices'),
        axios.get('/api/health'),
        axios.get('/api/notifications/history'),
      ]);

      const devices = devicesResponse.data;
      const health = healthResponse.data;
      const notifications = historyResponse.data;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      setStats({
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.is_active).length,
        notificationsToday: notifications.filter(n => 
          new Date(n.created_at) >= today
        ).length,
        notificationsLast24h: health.stats?.notificationsLast24h || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const devicesResponse = await axios.get('/api/devices');
      const activeDevices = devicesResponse.data.filter(d => d.is_active);
      
      if (activeDevices.length === 0) {
        toast.error('No active devices found');
        return;
      }

      const deviceIds = activeDevices.map(d => d.device_id);
      
      await axios.post('/api/notifications/send', {
        deviceIds,
        title: 'Test Notification',
        body: `Dashboard test at ${new Date().toLocaleTimeString()}`,
        data: { type: 'dashboard_test' },
      });

      toast.success(`Test notification sent to ${deviceIds.length} devices`);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Activity size={32} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Push Notification Dashboard</h1>
          <button className="btn btn-primary" onClick={sendTestNotification}>
            <Bell size={16} />
            Send Test to All Devices
          </button>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <Smartphone size={24} />
            </div>
            <div className="stat-value">{stats.totalDevices}</div>
            <div className="stat-label">Total Devices</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}>
              <Activity size={24} />
            </div>
            <div className="stat-value">{stats.activeDevices}</div>
            <div className="stat-label">Active Devices</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <Bell size={24} />
            </div>
            <div className="stat-value">{stats.notificationsToday}</div>
            <div className="stat-label">Notifications Today</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">{stats.notificationsLast24h}</div>
            <div className="stat-label">Last 24 Hours</div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="flex gap-4 mt-4">
            <a href="/devices" className="btn btn-secondary">
              <Smartphone size={16} />
              Manage Devices
            </a>
            <a href="/send" className="btn btn-primary">
              <Bell size={16} />
              Send Notification
            </a>
            <a href="/history" className="btn btn-secondary">
              <Activity size={16} />
              View History
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;