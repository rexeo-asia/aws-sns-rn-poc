const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface DeviceRegistration {
  deviceId: string;
  pushToken: string;
  platform: string;
  deviceName: string;
}

interface NotificationPayload {
  deviceIds: string[];
  title: string;
  body: string;
  data?: any;
}

export class ApiService {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  static async registerDevice(deviceData: DeviceRegistration): Promise<void> {
    await this.makeRequest('/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  static async checkDeviceRegistration(deviceId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/devices/${deviceId}`);
      return response.isRegistered;
    } catch (error) {
      return false;
    }
  }

  static async unregisterDevice(deviceId: string): Promise<void> {
    await this.makeRequest(`/api/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  static async sendTestNotification(deviceId: string): Promise<void> {
    await this.makeRequest('/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
  }

  static async getAllDevices(): Promise<any[]> {
    return await this.makeRequest('/api/devices');
  }

  static async sendNotification(payload: NotificationPayload): Promise<void> {
    await this.makeRequest('/api/notifications/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}