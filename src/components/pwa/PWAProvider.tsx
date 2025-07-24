'use client';

import { useEffect } from 'react';
import { initializePWA } from '@/lib/pwa';
import PWAInstallButton from './PWAInstallButton';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PWA features on client side
    initializePWA();
  }, []);

  return (
    <>
      {children}
      <PWAInstallButton />
    </>
  );
}