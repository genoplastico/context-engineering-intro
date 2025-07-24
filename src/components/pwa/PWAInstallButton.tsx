'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { showInstallPrompt, isPWA, canInstallPWA } from '@/lib/pwa';

interface PWAInstallButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function PWAInstallButton({ 
  className = '', 
  variant = 'default',
  size = 'default'
}: PWAInstallButtonProps) {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true);
    
    // Check if we should show the install button
    const checkInstallability = () => {
      // Don't show if already running as PWA
      if (isPWA()) {
        return;
      }

      // Don't show if previously dismissed
      if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
        return;
      }

      // Show install banner after a delay if PWA install is available
      if (canInstallPWA()) {
        const timer = setTimeout(() => {
          setShowInstallBanner(true);
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
      }
    };

    checkInstallability();
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await showInstallPrompt();
      if (installed) {
        setShowInstallBanner(false);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Remember dismissal for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Don't render on server-side or if already PWA or dismissed
  if (!isClient || isPWA() || (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed'))) {
    return null;
  }

  // Inline button version
  if (!showInstallBanner) {
    return (
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        variant={variant}
        size={size}
        className={className}
      >
        <Download className="h-4 w-4 mr-2" />
        {isInstalling ? 'Installing...' : 'Install App'}
      </Button>
    );
  }

  // Banner version
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-transform duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img 
            src="/icon-192x192.svg" 
            alt="App Icon" 
            className="w-12 h-12 rounded-lg"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">
            Install Asset Manager
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Get the full app experience with offline access and quick launcher
          </p>
          
          <div className="flex space-x-2 mt-3">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              size="sm"
              className="flex-1"
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}