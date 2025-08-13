# Push Notification System

A complete push notification system with React Native mobile app, web dashboard, and Express backend using Firebase, AWS SNS, and Docker containerization.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │◄──►│  Express API    │◄──►│   Web Dashboard │
│  (React Native) │    │   + AWS SNS     │    │     (React)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│    Firebase     │    │   PostgreSQL    │
│   Messaging     │    │   Database      │
└─────────────────┘    └─────────────────┘
```

## Features

### Mobile App
- Push notification reception with Firebase Cloud Messaging
- Device registration and token management
- Notification history and management
- Clean tab-based navigation
- Settings for notification preferences

### Web Dashboard
- Admin interface for sending push notifications
- Device management and registration overview
- Notification history and analytics
- Real-time device status monitoring

### Backend API
- AWS SNS integration for notification delivery
- Device registration and token management
- RESTful API with proper error handling
- PostgreSQL database for persistent storage

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Firebase project with FCM enabled
- AWS account with SNS access
- Expo CLI (for mobile development)

## Environment Setup

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Cloud Messaging
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Get your Firebase configuration object

### 2. AWS Configuration

1. Create an AWS account and set up SNS
2. Create an IAM user with SNS permissions
3. Get your AWS Access Key ID and Secret Access Key

### 3. Environment Variables

Create the following environment files:

#### `.env.mobile` (Mobile App)
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_API_URL=http://localhost:3001
```

#### `.env.backend` (Backend)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@postgres:5432/pushnotify
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

#### `.env.web` (Web Dashboard)
```
REACT_APP_API_URL=http://localhost:3001
```

## Quick Start with Docker

1. Clone the repository
2. Copy environment files and fill in your credentials
3. Run the entire system:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Express backend on port 3001
- Web dashboard on port 3000
- Mobile app development server on port 8081

## Manual Setup (Development)

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Web Dashboard Setup
```bash
cd web
npm install
npm start
```

### Mobile App Setup
```bash
npm install
npm run dev
```

## API Documentation

### Device Registration
```
POST /api/devices/register
Body: {
  "deviceId": "unique_device_id",
  "pushToken": "firebase_token",
  "platform": "ios|android",
  "deviceName": "User's Device"
}
```

### Send Notification
```
POST /api/notifications/send
Body: {
  "deviceIds": ["device_id_1", "device_id_2"],
  "title": "Notification Title",
  "body": "Notification message",
  "data": { "custom": "data" }
}
```

### Get Devices
```
GET /api/devices
Response: [
  {
    "id": "device_id",
    "deviceName": "Device Name",
    "platform": "ios",
    "lastSeen": "2025-01-11T10:00:00Z",
    "isActive": true
  }
]
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile App Tests
```bash
npm test
```

### Web Dashboard Tests
```bash
cd web
npm test
```

## Deployment

### Mobile App
1. Build for production:
   ```bash
   expo build:android
   expo build:ios
   ```

2. Submit to app stores:
   ```bash
   expo submit:android
   expo submit:ios
   ```

### Backend & Web
1. Build Docker images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Deploy to your preferred cloud provider

## System Flows

See the PlantUML diagrams in the `/docs` directory:
- `registration-flow.puml` - Device registration process
- `notification-flow.puml` - Push notification delivery flow
- `system-architecture.puml` - Overall system architecture

## Troubleshooting

### Common Issues

1. **Push notifications not received**
   - Verify Firebase configuration
   - Check device token registration
   - Ensure AWS SNS permissions are correct

2. **Docker build fails**
   - Ensure all environment files are present
   - Check Docker daemon is running
   - Verify port availability

3. **Mobile app not connecting to backend**
   - Check API URL in mobile environment
   - Verify backend is running on correct port
   - Check network connectivity

### Debug Commands

```bash
# Check container logs
docker-compose logs backend
docker-compose logs web
docker-compose logs postgres

# Test API endpoints
curl -X GET http://localhost:3001/api/health
curl -X GET http://localhost:3001/api/devices

# Database access
docker-compose exec postgres psql -U user -d pushnotify
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

Private - All rights reserved