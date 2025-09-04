import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Bell, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Track visit count for smart install suggestions
    const currentVisits = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    const newVisitCount = currentVisits + 1;
    setVisitCount(newVisitCount);
    localStorage.setItem('pwa-visit-count', newVisitCount.toString());

    // Check if user has permanently dismissed the banner
    const permanentlyDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    const lastDismissed = localStorage.getItem('pwa-last-dismissed');
    const daysSinceLastDismiss = lastDismissed ? 
      Math.floor((Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)) : 999;

    // Show install suggestion based on visit count and time since last dismissal
    const shouldShowSuggestion = !permanentlyDismissed && 
      (newVisitCount >= 3 || daysSinceLastDismiss >= 7) && 
      daysSinceLastDismiss >= 1;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      if (shouldShowSuggestion) {
        // Show notification first, then banner after a delay
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
          setShowBanner(true);
        }, 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowBanner(false);
      setShowNotification(false);
      setIsInstalled(true);
      setInstallStatus('success');
      setDeferredPrompt(null);
      
      // Clear install-related localStorage
      localStorage.removeItem('pwa-install-dismissed');
      localStorage.removeItem('pwa-last-dismissed');
      
      // Show success notification
      setTimeout(() => {
        setInstallStatus('idle');
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show notification for returning users
    if (shouldShowSuggestion && deferredPrompt) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      setInstallStatus('installing');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallStatus('success');
        // Success will be handled by appinstalled event
      } else {
        setInstallStatus('idle');
        localStorage.setItem('pwa-last-dismissed', Date.now().toString());
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    } catch (error) {
      setInstallStatus('error');
      setTimeout(() => setInstallStatus('idle'), 3000);
    }
  };

  const handleNotNowClick = () => {
    setShowBanner(false);
    setShowNotification(false);
    localStorage.setItem('pwa-last-dismissed', Date.now().toString());
  };

  const handleNeverShowClick = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-last-dismissed', Date.now().toString());
    setShowBanner(false);
    setShowNotification(false);
  };

  const handleNotificationClick = () => {
    setShowNotification(false);
    setShowBanner(true);
  };

  return (
    <>
      {/* Install Success Notification */}
      {installStatus === 'success' && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right">
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold text-sm">App Installed Successfully!</p>
            <p className="text-xs text-green-100">You can now use the app offline</p>
          </div>
        </div>
      )}

      {/* Install Suggestion Notification */}
      {showNotification && !isInstalled && (
        <div 
          onClick={handleNotificationClick}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 animate-bounce"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                ஆப்பை நிறுவுங்கள்!
              </p>
              <p className="text-xs text-blue-100">
                {visitCount >= 5 ? 'You seem to love this app!' : 'Get faster access & offline play'}
              </p>
            </div>
            <X 
              className="w-4 h-4 ml-2 opacity-70 hover:opacity-100" 
              onClick={(e) => {
                e.stopPropagation();
                handleNotNowClick();
              }}
            />
          </div>
        </div>
      )}

      {/* Install Banner */}
      {showBanner && !isInstalled && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg animate-slide-down">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                  ஆப்பாக நிறுவுங்கள்
                </h3>
                <p className="text-xs text-blue-100">
                  {visitCount >= 5 ? 
                    'Install for the best experience!' : 
                    'Install this app for a better experience'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                disabled={installStatus === 'installing'}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {installStatus === 'installing' ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {installStatus === 'installing' ? 'Installing...' : 'Install'}
              </button>
              
              <div className="relative group">
                <button
                  onClick={handleNotNowClick}
                  className="text-blue-100 hover:text-white p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Dropdown menu for "Not Now" and "Never Show" */}
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-2 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={handleNotNowClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleNeverShowClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Never Show
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;