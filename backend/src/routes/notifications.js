const express = require('express');
const { body, validationResult } = require('express-validator');
const { getClient } = require('../config/database');
const { publishToEndpoint } = require('../config/aws');
const admin = require('firebase-admin');
const router = express.Router();

// Send notification to multiple devices
router.post('/send', [
  body('deviceIds').isArray().withMessage('Device IDs must be an array'),
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceIds, title, body, data = {} } = req.body;
    const client = getClient();

    // Get device tokens
    const deviceQuery = await client.query(`
      SELECT device_id, push_token, platform 
      FROM devices 
      WHERE device_id = ANY($1) AND is_active = true
    `, [deviceIds]);

    const devices = deviceQuery.rows;
    if (devices.length === 0) {
      return res.status(404).json({ error: 'No active devices found' });
    }

    const results = [];
    
    for (const device of devices) {
      try {
        // Send via Firebase Cloud Messaging
        const message = {
          token: device.push_token,
          notification: {
            title,
            body,
          },
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        };

        await admin.messaging().send(message);

        // Log notification in database
        await client.query(`
          INSERT INTO notifications (device_id, title, body, data, status)
          VALUES ($1, $2, $3, $4, 'sent')
        `, [device.device_id, title, body, JSON.stringify(data)]);

        results.push({
          deviceId: device.device_id,
          status: 'sent',
        });
      } catch (error) {
        console.error(`Failed to send to device ${device.device_id}:`, error);
        results.push({
          deviceId: device.device_id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results,
      totalSent: results.filter(r => r.status === 'sent').length,
      totalFailed: results.filter(r => r.status === 'failed').length,
    });
  } catch (error) {
    console.error('Failed to send notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Send test notification
router.post('/test', [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId } = req.body;
    
    // Use the send endpoint with test data
    req.body = {
      deviceIds: [deviceId],
      title: 'Test Notification',
      body: `Test notification sent at ${new Date().toLocaleTimeString()}`,
      data: { type: 'test' },
    };

    // Forward to send endpoint
    return router.handle(req, res);
  } catch (error) {
    console.error('Failed to send test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Get notification history
router.get('/history', async (req, res) => {
  try {
    const client = getClient();
    const result = await client.query(`
      SELECT 
        n.*,
        d.device_name,
        d.platform
      FROM notifications n
      JOIN devices d ON n.device_id = d.device_id
      ORDER BY n.created_at DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to get notification history:', error);
    res.status(500).json({ error: 'Failed to retrieve notification history' });
  }
});

module.exports = router;