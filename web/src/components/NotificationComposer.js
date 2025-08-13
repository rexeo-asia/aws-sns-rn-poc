import React, { useState, useEffect } from 'react';
import { Send, Smartphone, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function NotificationComposer() {
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    data: '{}',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await axios.get('/api/devices');
      const activeDevices = response.data.filter(d => d.is_active);
      setDevices(activeDevices);
    } catch (error) {
      console.error('Failed to load devices:', error);
      toast.error('Failed to load devices');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeviceSelection = (deviceId) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const selectAllDevices = () => {
    if (selectedDevices.length === devices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices.map(d => d.device_id));
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();

    if (selectedDevices.length === 0) {
      toast.error('Please select at least one device');
      return;
    }

    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Title and body are required');
      return;
    }

    try {
      setSending(true);
      
      let parsedData = {};
      if (formData.data.trim()) {
        try {
          parsedData = JSON.parse(formData.data);
        } catch (error) {
          toast.error('Invalid JSON data format');
          return;
        }
      }

      const response = await axios.post('/api/notifications/send', {
        deviceIds: selectedDevices,
        title: formData.title,
        body: formData.body,
        data: parsedData,
      });

      toast.success(
        `Notification sent successfully to ${response.data.totalSent} devices`
      );

      // Reset form
      setFormData({ title: '', body: '', data: '{}' });
      setSelectedDevices([]);
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Send Push Notification</h1>
        </div>

        <form onSubmit={sendNotification}>
          <div className="form-group">
            <label className="form-label">Select Devices</label>
            <div className="mb-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={selectAllDevices}
              >
                {selectedDevices.length === devices.length ? 'Deselect All' : 'Select All'}
                ({devices.length})
              </button>
            </div>
            
            {devices.length === 0 ? (
              <div className="empty-state">
                <Smartphone className="empty-state-icon" />
                <h3>No Active Devices</h3>
                <p>Register devices from the mobile app to send notifications</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {devices.map((device) => (
                  <div
                    key={device.device_id}
                    className={`device-card ${selectedDevices.includes(device.device_id) ? 'selected' : ''}`}
                    style={{
                      border: '2px solid',
                      borderColor: selectedDevices.includes(device.device_id) ? '#3b82f6' : '#e5e7eb',
                      borderRadius: '8px',
                      padding: '1rem',
                      cursor: 'pointer',
                      background: selectedDevices.includes(device.device_id) ? '#eff6ff' : 'white',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleDeviceSelection(device.device_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone size={20} color="#6b7280" />
                        <div>
                          <div style={{ fontWeight: '600' }}>{device.device_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                            {device.platform} • {new Date(device.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {selectedDevices.includes(device.device_id) && (
                        <Check size={20} color="#3b82f6" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">Notification Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter notification title"
              maxLength="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body" className="form-label">Notification Body</label>
            <textarea
              id="body"
              name="body"
              className="form-textarea"
              value={formData.body}
              onChange={handleInputChange}
              placeholder="Enter notification message"
              rows="4"
              maxLength="500"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="data" className="form-label">Custom Data (JSON)</label>
            <textarea
              id="data"
              name="data"
              className="form-textarea"
              value={formData.data}
              onChange={handleInputChange}
              placeholder='{"key": "value"}'
              rows="3"
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Optional: Additional data to include with the notification
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || selectedDevices.length === 0}
            style={{ width: '100%' }}
          >
            {sending ? (
              <>
                <RefreshCw size={16} className="spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send to {selectedDevices.length} Device{selectedDevices.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NotificationComposer;