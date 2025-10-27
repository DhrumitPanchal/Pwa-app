import { useState, useEffect } from 'react';
import InstallPrompt from './components/InstallPrompt';
import PushDemo from './components/PushDemo';

function App() {
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    // Get service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service Worker ready:', registration);
        setSwRegistration(registration);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PWA Push Notifications
          </h1>
          <p className="text-gray-600">
            Progressive Web App with Web Push API Demo
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          <InstallPrompt />
          <PushDemo swRegistration={swRegistration} />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ℹ️ Information
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Works on desktop Chrome/Edge and Android Chrome</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>localhost is treated as secure context (no HTTPS needed)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Install the app for full PWA experience</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>iOS Safari does not support Web Push API</span>
              </li>
            </ul>
          </div>
        </div>

        <footer className="text-center mt-12 text-gray-600 text-sm">
          <p>Built with React, Vite, TailwindCSS & Web Push API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
