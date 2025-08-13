const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getClient } = require('../config/database');
const router = express.Router();

// Get all devices
router.get('/', async (req, res) => {
  try {
    const client = getClient();
    const result = await client.query(`
      SELECT 
        device_id,
        device_name,
        platform,
        is_active,
        created_at,
        updated_at
      FROM devices 
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to get devices:', error);
    res.status(500).json({ error: 'Failed to retrieve devices' });
  }
});

// Register device
router.post('/register', [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('pushToken').notEmpty().withMessage('Push token is required'),
  body('platform').isIn(['ios', 'android']).withMessage('Platform must be ios or android'),
  body('deviceName').notEmpty().withMessage('Device name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId, pushToken, platform, deviceName } = req.body;
    const client = getClient();

    // Check if device already exists
    const existing = await client.query(
      'SELECT id FROM devices WHERE device_id = $1',
      [deviceId]
    );

    if (existing.rows.length > 0) {
      // Update existing device
      await client.query(`
        UPDATE devices 
        SET push_token = $1, device_name = $2, is_active = true, updated_at = NOW()
        WHERE device_id = $3
      `, [pushToken, deviceName, deviceId]);
    } else {
      // Insert new device
      await client.query(`
        INSERT INTO devices (device_id, push_token, platform, device_name)
        VALUES ($1, $2, $3, $4)
      `, [deviceId, pushToken, platform, deviceName]);
    }

    res.json({ 
      success: true, 
      message: 'Device registered successfully',
      deviceId 
    });
  } catch (error) {
    console.error('Failed to register device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Check device registration
router.get('/:deviceId', [
  param('deviceId').notEmpty().withMessage('Device ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId } = req.params;
    const client = getClient();

    const result = await client.query(
      'SELECT id, is_active FROM devices WHERE device_id = $1',
      [deviceId]
    );

    res.json({
      isRegistered: result.rows.length > 0,
      isActive: result.rows.length > 0 ? result.rows[0].is_active : false,
    });
  } catch (error) {
    console.error('Failed to check device registration:', error);
    res.status(500).json({ error: 'Failed to check device registration' });
  }
});

// Unregister device
router.delete('/:deviceId', [
  param('deviceId').notEmpty().withMessage('Device ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId } = req.params;
    const client = getClient();

    await client.query(
      'UPDATE devices SET is_active = false WHERE device_id = $1',
      [deviceId]
    );

    res.json({ 
      success: true, 
      message: 'Device unregistered successfully' 
    });
  } catch (error) {
    console.error('Failed to unregister device:', error);
    res.status(500).json({ error: 'Failed to unregister device' });
  }
});

module.exports = router;