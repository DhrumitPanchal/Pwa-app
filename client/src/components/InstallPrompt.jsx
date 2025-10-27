import { useState, useEffect } from 'react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    // Show manual instructions after 3 seconds if prompt didn't fire
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setShowManualInstructions(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <span className="text-3xl mr-3">✅</span>
          <div>
            <h2 className="text-xl font-semibold text-green-800">App Installed</h2>
            <p className="text-green-700">You're running the PWA in standalone mode!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
            <span className="text-2xl mr-2">📱</span>
            Install App
          </h2>
          
          {deferredPrompt ? (
            <>
              <p className="text-gray-600 mb-4">
                Install this app on your device for a better experience!
              </p>
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Install Now
              </button>
            </>
          ) : showManualInstructions ? (
            <div className="text-gray-600 space-y-2">
              <p className="mb-3">
                To install this app, use your browser's menu:
              </p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="font-semibold mb-2">Desktop (Chrome/Edge):</p>
                <p className="text-sm">
                  Click the <strong>⋮</strong> menu → <strong>Install PWA Push Notifications</strong>
                </p>
                <p className="text-sm mt-2">
                  Or look for the <strong>⊕</strong> icon in the address bar
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-2">
                <p className="font-semibold mb-2">Mobile (Android Chrome):</p>
                <p className="text-sm">
                  Tap <strong>⋮</strong> menu → <strong>Add to Home screen</strong>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Checking for install availability...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
