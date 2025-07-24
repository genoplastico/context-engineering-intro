'use client';

import { useEffect, useState } from 'react';

export const EnvDebug = () => {
  const [mounted, setMounted] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchServerEnv = async () => {
    try {
      const response = await fetch('/api/debug-env');
      const data = await response.json();
      setServerData(data);
      console.log('🔥 SERVER ENV DATA:', data);
    } catch (error) {
      console.error('Error fetching server env:', error);
    }
  };

  if (!mounted) {
    return null; // Return null to avoid hydration mismatch
  }

  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '11px',
      maxWidth: '400px',
      zIndex: 9999,
      fontFamily: 'monospace',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h3>🔍 ENV DEBUG</h3>
      
      <button 
        onClick={fetchServerEnv}
        style={{ 
          background: '#007acc', 
          color: 'white', 
          border: 'none', 
          padding: '5px 10px', 
          marginBottom: '10px',
          cursor: 'pointer'
        }}
      >
        🔥 Check Server Env
      </button>

      <div style={{ marginBottom: '15px' }}>
        <strong>CLIENT SIDE:</strong>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '3px' }}>
            <strong>{key}:</strong> {value ? '✅ FOUND' : '❌ MISSING'}
          </div>
        ))}
      </div>

      {serverData && (
        <div style={{ marginBottom: '15px' }}>
          <strong>SERVER SIDE:</strong>
          <div>Total keys: {serverData.serverSide.totalEnvKeys}</div>
          <div>NEXT_PUBLIC_ keys: {serverData.serverSide.nextPublicKeys.length}</div>
          {Object.entries(serverData.serverSide.firebaseKeys).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '3px' }}>
              <strong>{key}:</strong> {value ? '✅ FOUND' : '❌ MISSING'}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: '10px' }}>
        <strong>All NEXT_PUBLIC_FIREBASE_ keys (client):</strong>
        <div>{Object.keys(process.env as any).filter(k => k.startsWith('NEXT_PUBLIC_FIREBASE')).join(', ') || 'None found'}</div>
      </div>
    </div>
  );
};