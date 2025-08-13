-- Initialize database schema for push notification system

-- Create devices table
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

-- Create notifications table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_device_id ON notifications(device_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Insert sample data for development
INSERT INTO devices (device_id, push_token, platform, device_name) 
VALUES 
  ('sample-ios-device', 'sample-expo-token-ios', 'ios', 'Sample iPhone')
ON CONFLICT (device_id) DO NOTHING;

INSERT INTO devices (device_id, push_token, platform, device_name) 
VALUES 
  ('sample-android-device', 'sample-expo-token-android', 'android', 'Sample Android')
ON CONFLICT (device_id) DO NOTHING;