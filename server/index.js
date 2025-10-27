import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import webPush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());

// In-memory storage for subscriptions (use database in production)
let subscriptions = [];

// Configure web-push with VAPID keys
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:test@example.com';

if (!publicVapidKey || !privateVapidKey) {
  console.error('❌ VAPID keys not found! Generate them with:');
  console.error('   npx web-push generate-vapid-keys --json');
  process.exit(1);
}

webPush.setVapidDetails(
  vapidSubject,
  publicVapidKey,
  privateVapidKey
);

// Routes

// Get public VAPID key
app.get('/api/keys', (req, res) => {
  res.json({ publicKey: publicVapidKey });
});

// Subscribe endpoint
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  // Check if subscription already exists
  const exists = subscriptions.find(sub => sub.endpoint === subscription.endpoint);
  
  if (!exists) {
    subscriptions.push(subscription);
    console.log(`✅ New subscription added. Total: ${subscriptions.length}`);
  } else {
    console.log('ℹ️  Subscription already exists');
  }

  res.status(201).json({ message: 'Subscription saved', total: subscriptions.length });
});

// Unsubscribe endpoint
app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint required' });
  }

  const initialLength = subscriptions.length;
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  
  if (subscriptions.length < initialLength) {
    console.log(`✅ Subscription removed. Total: ${subscriptions.length}`);
    res.json({ message: 'Unsubscribed successfully', total: subscriptions.length });
  } else {
    res.status(404).json({ error: 'Subscription not found' });
  }
});

// Send test notification to all subscribers
app.post('/api/send-test', async (req, res) => {
  const { title = 'Test Notification', body = 'This is a test push notification!' } = req.body;

  if (subscriptions.length === 0) {
    return res.status(400).json({ 
      error: 'No subscriptions available',
      message: 'Subscribe to notifications first'
    });
  }

  const payload = JSON.stringify({
    title,
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: 'http://localhost:5173',
      timestamp: Date.now()
    }
  });

  const results = [];

  for (const subscription of subscriptions) {
    try {
      await webPush.sendNotification(subscription, payload);
      results.push({ 
        endpoint: subscription.endpoint.substring(0, 50) + '...', 
        status: 'success' 
      });
      console.log('✅ Notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending notification:', error.message);
      
      // Remove invalid subscriptions (410 Gone or 404 Not Found)
      if (error.statusCode === 410 || error.statusCode === 404) {
        subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
        console.log('🗑️  Removed invalid subscription');
      }
      
      results.push({ 
        endpoint: subscription.endpoint.substring(0, 50) + '...', 
        status: 'failed',
        error: error.message 
      });
    }
  }

  res.json({ 
    message: 'Notifications sent',
    results,
    totalSubscriptions: subscriptions.length
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    subscriptions: subscriptions.length,
    vapidConfigured: !!(publicVapidKey && privateVapidKey)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Subscriptions: ${subscriptions.length}`);
  console.log(`🔑 VAPID configured: ${!!(publicVapidKey && privateVapidKey)}`);
});
