const express = require('express');
const { getClient } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = getClient();
    
    // Test database connection
    await client.query('SELECT 1');
    
    // Get basic stats
    const deviceCount = await client.query('SELECT COUNT(*) FROM devices WHERE is_active = true');
    const notificationCount = await client.query('SELECT COUNT(*) FROM notifications WHERE created_at > NOW() - INTERVAL \'24 hours\'');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        activeDevices: parseInt(deviceCount.rows[0].count),
        notificationsLast24h: parseInt(notificationCount.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

module.exports = router;