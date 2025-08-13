import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to load devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      await axios.delete(`/api/devices/${deviceId}`);
      toast.success('Device deleted successfully');
      loadDevices();
    } catch (error) {
      console.error('Failed to delete device:', error);
      toast.error('Failed to delete device');
    }
  };

  const sendTestNotification = async (deviceId, deviceName) => {
    try {
      await axios.post('/api/notifications/send', {
        deviceIds: [deviceId],
        title: 'Test from Dashboard',
        body: `Test notification sent to ${deviceName}`,
        data: { type: 'dashboard_test' },
      });
      
      toast.success(`Test notification sent to ${deviceName}`);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <RefreshCw size={32} />
          <p>Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h1 className="card-title">Device Management</h1>
        <button className="btn btn-primary" onClick={loadDevices}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="empty-state">
          <Smartphone className="empty-state-icon" />
          <h3>No Devices Registered</h3>
          <p>Devices will appear here once they register for push notifications</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.device_id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Smartphone size={20} color="#6b7280" />
                      <div>
                        <div className="font-weight: 600">{device.device_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {device.device_id.substring(0, 16)}...
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
                      background: device.platform === 'ios' ? '#eff6ff' : '#f0fdf4',
                      color: device.platform === 'ios' ? '#3b82f6' : '#10b981',
                    }}>
                      {device.platform}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {device.is_active ? (
                        <>
                          <Wifi size={16} color="#10b981" />
                          <span className="status-active">Active</span>
                        </>
                      ) : (
                        <>
                          <WifiOff size={16} color="#ef4444" />
                          <span className="status-inactive">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td>{new Date(device.created_at).toLocaleDateString()}</td>
                  <td>{new Date(device.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-success"
                        style={{ padding: '0.5rem' }}
                        onClick={() => sendTestNotification(device.device_id, device.device_name)}
                        disabled={!device.is_active}
                      >
                        <Bell size={14} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.5rem' }}
                        onClick={() => deleteDevice(device.device_id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DeviceList;