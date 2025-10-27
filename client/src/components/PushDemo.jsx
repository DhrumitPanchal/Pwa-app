import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushDemo({ swRegistration }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [vapidKey, setVapidKey] = useState(VAPID_PUBLIC_KEY);

  useEffect(() => {
    if (!vapidKey && swRegistration) {
      fetch(`${API_URL}/api/keys`)
        .then(res => res.json())
        .then(data => setVapidKey(data.publicKey))
        .catch(err => console.error('Error fetching VAPID key:', err));
    }

    if (swRegistration) {
      swRegistration.pushManager.getSubscription()
        .then(sub => {
          setSubscription(sub);
          if (sub) console.log('Existing subscription found:', sub);
        })
        .catch(err => console.error('Error getting subscription:', err));
    }
  }, [swRegistration, vapidKey]);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setMessage('✅ Permission granted! You can now subscribe.');
      } else if (result === 'denied') {
        setMessage('❌ Permission denied. Enable notifications in browser settings.');
      } else {
        setMessage('⚠️ Permission dismissed.');
      }
    } catch (error) {
      setMessage('❌ Error requesting permission: ' + error.message);
    }
  };

  const subscribe = async () => {
    if (!swRegistration) {
      setMessage('❌ Service Worker not ready');
      return;
    }
    if (!vapidKey) {
      setMessage('❌ VAPID key not available. Check your .env file.');
      return;
    }
    if (permission !== 'granted') {
      setMessage('⚠️ Please grant notification permission first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const sub = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      setSubscription(sub);

      const response = await fetch(`${API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Subscribed! Total subscribers: ${data.total}`);
      } else {
        throw new Error('Failed to save subscription on server');
      }
    } catch (error) {
      setMessage('❌ Subscription failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) {
      setMessage('⚠️ No active subscription');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await subscription.unsubscribe();
      await fetch(`${API_URL}/api/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      setSubscription(null);
      setMessage('✅ Unsubscribed successfully');
    } catch (error) {
      setMessage('❌ Unsubscribe failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test push notification from your PWA!'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message}. Check your notifications!`);
      } else {
        setMessage(`❌ ${data.error || 'Failed to send notification'}`);
      }
    } catch (error) {
      setMessage('❌ Error sending notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionBadge = () => {
    const badges = {
      granted: { text: 'Granted', color: 'bg-green-100 text-green-800' },
      denied: { text: 'Denied', color: 'bg-red-100 text-red-800' },
      default: { text: 'Not Asked', color: 'bg-yellow-100 text-yellow-800' }
    };
    const badge = badges[permission];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span className="text-2xl mr-2">🔔</span>
        Push Notifications
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
          <span className="font-medium text-gray-700">Permission Status:</span>
          {getPermissionBadge()}
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
          <span className="font-medium text-gray-700">Subscription Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            subscription ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {subscription ? 'Subscribed' : 'Not Subscribed'}
          </span>
        </div>

        {message && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
            {message}
          </div>
        )}

        <div className="space-y-3">
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Request Permission
            </button>
          )}

          {permission === 'granted' && !subscription && (
            <button
              onClick={subscribe}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Subscribing...' : 'Subscribe to Notifications'}
            </button>
          )}

          {subscription && (
            <>
              <button
                onClick={sendTestNotification}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Sending...' : 'Send Test Notification'}
              </button>
              <button
                onClick={unsubscribe}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PushDemo;
