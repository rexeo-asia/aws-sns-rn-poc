const request = require('supertest');
const express = require('express');
const deviceRoutes = require('../routes/devices');

// Mock database
jest.mock('../config/database', () => ({
  getClient: () => ({
    query: jest.fn(),
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/devices', deviceRoutes);

describe('Device Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/devices/register', () => {
    it('should register a new device successfully', async () => {
      const mockClient = require('../config/database').getClient();
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Insert new

      const deviceData = {
        deviceId: 'test-device-123',
        pushToken: 'expo-token-123',
        platform: 'ios',
        deviceName: 'Test iPhone',
      };

      const response = await request(app)
        .post('/api/devices/register')
        .send(deviceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.deviceId).toBe(deviceData.deviceId);
    });

    it('should update existing device', async () => {
      const mockClient = require('../config/database').getClient();
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Device exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Update

      const deviceData = {
        deviceId: 'existing-device-123',
        pushToken: 'new-expo-token-123',
        platform: 'android',
        deviceName: 'Updated Android',
      };

      const response = await request(app)
        .post('/api/devices/register')
        .send(deviceData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/devices/register')
        .send({})
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/devices/:deviceId', () => {
    it('should check device registration status', async () => {
      const mockClient = require('../config/database').getClient();
      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 1, is_active: true }],
      });

      const response = await request(app)
        .get('/api/devices/test-device-123')
        .expect(200);

      expect(response.body.isRegistered).toBe(true);
      expect(response.body.isActive).toBe(true);
    });

    it('should return false for non-existent device', async () => {
      const mockClient = require('../config/database').getClient();
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/devices/non-existent-device')
        .expect(200);

      expect(response.body.isRegistered).toBe(false);
      expect(response.body.isActive).toBe(false);
    });
  });
});