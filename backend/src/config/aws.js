const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const sns = new AWS.SNS();

const createPlatformEndpoint = async (platformApplicationArn, token) => {
  try {
    const params = {
      PlatformApplicationArn: platformApplicationArn,
      Token: token,
    };

    const result = await sns.createPlatformEndpoint(params).promise();
    return result.EndpointArn;
  } catch (error) {
    console.error('Failed to create platform endpoint:', error);
    throw error;
  }
};

const publishToEndpoint = async (endpointArn, message, title) => {
  try {
    const payload = {
      default: message,
      GCM: JSON.stringify({
        notification: {
          title,
          body: message,
        },
        data: {
          title,
          body: message,
        },
      }),
      APNS: JSON.stringify({
        aps: {
          alert: {
            title,
            body: message,
          },
          sound: 'default',
        },
      }),
    };

    const params = {
      TargetArn: endpointArn,
      Message: JSON.stringify(payload),
      MessageStructure: 'json',
    };

    await sns.publish(params).promise();
  } catch (error) {
    console.error('Failed to publish to endpoint:', error);
    throw error;
  }
};

module.exports = {
  sns,
  createPlatformEndpoint,
  publishToEndpoint,
};