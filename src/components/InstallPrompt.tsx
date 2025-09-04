import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const InstallPrompt = ({ onInstall, onDismiss, className = '' }: InstallPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user hasn't dismissed recently
      const lastDismissed = localStorage.getItem('install-prompt-dismissed');
      const daysSinceLastDismiss = lastDismissed ? 
        Math.floor((Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)) : 999;
      
      if (daysSinceLastDismiss >= 3) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        onInstall?.();
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
    onDismiss?.();
  };

  if (!showPrompt) return null;

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5" />
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              ஆப்பை நிறுவுங்கள்
            </p>
            <p className="text-xs text-blue-100">
              Install for better experience
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-blue-100 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;