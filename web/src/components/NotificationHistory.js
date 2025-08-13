import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, Clock, Smartphone } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function NotificationHistory() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/history');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <RefreshCw size={32} />
          <p>Loading notification history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h1 className="card-title">Notification History</h1>
        <button className="btn btn-primary" onClick={loadNotifications}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell className="empty-state-icon" />
          <h3>No Notifications Sent</h3>
          <p>Notification history will appear here once you start sending notifications</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Notification</th>
                <th>Device</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => {
                const { date, time } = formatDate(notification.created_at);
                return (
                  <tr key={notification.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {notification.title}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {notification.body}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} color="#6b7280" />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            {notification.device_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {notification.device_id.substring(0, 12)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        textTransform: 'capitalize',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: notification.platform === 'ios' ? '#eff6ff' : '#f0fdf4',
                        color: notification.platform === 'ios' ? '#3b82f6' : '#10b981',
                      }}>
                        {notification.platform}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: getStatusColor(notification.status),
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}>
                        {notification.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Clock size={14} color="#6b7280" />
                        <div style={{ fontSize: '0.875rem' }}>
                          <div>{date}</div>
                          <div style={{ color: '#6b7280' }}>{time}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default NotificationHistory;