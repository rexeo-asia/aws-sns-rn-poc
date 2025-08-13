const { Client } = require('pg');

let client;

const initializeDatabase = async () => {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  
  // Create tables if they don't exist
  await client.query(`
    CREATE TABLE IF NOT EXISTS devices (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) UNIQUE NOT NULL,
      push_token TEXT NOT NULL,
      platform VARCHAR(50) NOT NULL,
      device_name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      data JSONB,
      status VARCHAR(50) DEFAULT 'sent',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_device_id ON notifications(device_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
  `);

  console.log('Database tables created successfully');
};

const getClient = () => client;

module.exports = {
  initializeDatabase,
  getClient,
};