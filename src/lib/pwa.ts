'use client';

// PWA utility functions
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('New service worker available');
              // Optionally show update notification to user
              showUpdateNotification();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Check if app is running as PWA
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // @ts-expect-error - navigator.standalone is iOS specific
    navigator.standalone === true
  );
};

// Check if device is mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Check if PWA install prompt is available
export const canInstallPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if beforeinstallprompt event is supported
  return 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window;
};

// Show update notification (can be customized)
const showUpdateNotification = (): void => {
  if (typeof window !== 'undefined') {
    // Simple notification - in a real app, you might use a toast library
    if (confirm('A new version is available. Would you like to update?')) {
      window.location.reload();
    }
  }
};

// PWA install prompt handling
let deferredPrompt: any = null;

export const setupPWAInstall = (): void => {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button or notification
    console.log('PWA install prompt available');
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
};

export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }
  
  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      return true;
    } else {
      console.log('User dismissed the install prompt');
      return false;
    }
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  } finally {
    deferredPrompt = null;
  }
};

// Initialize PWA features
export const initializePWA = (): void => {
  if (typeof window === 'undefined') return;
  
  // Register service worker
  registerServiceWorker();
  
  // Setup install prompt handling
  setupPWAInstall();
  
  // Add PWA-specific styles
  if (isPWA()) {
    document.body.classList.add('pwa-mode');
  }
  
  if (isMobile()) {
    document.body.classList.add('mobile-device');
  }
};