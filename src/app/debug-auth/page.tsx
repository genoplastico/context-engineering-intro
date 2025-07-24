'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const { user, loading, error } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-20), `[${timestamp}] ${message}`]); // Keep last 20 logs
    };

    addLog(`Auth state - User: ${!!user}, Loading: ${loading}, Error: ${error}`);
  }, [user, loading, error]);

  const clearLogs = () => setLogs([]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auth Debug (No Protection)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Current Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> <span className={loading ? 'text-orange-600' : 'text-green-600'}>{loading ? 'Yes' : 'No'}</span></p>
              <p><strong>User:</strong> <span className={user ? 'text-green-600' : 'text-red-600'}>{user ? 'Authenticated' : 'Not authenticated'}</span></p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Display Name:</strong> {user?.displayName || 'N/A'}</p>
              <p><strong>UID:</strong> {user?.uid || 'N/A'}</p>
              <p><strong>Error:</strong> <span className={error ? 'text-red-600' : 'text-green-600'}>{error || 'None'}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Browser/Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Browser & Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>localStorage available:</strong> {typeof window !== 'undefined' && window.localStorage ? 'Yes' : 'No'}</p>
              <p><strong>sessionStorage available:</strong> {typeof window !== 'undefined' && window.sessionStorage ? 'Yes' : 'No'}</p>
              <p><strong>Navigator online:</strong> {typeof window !== 'undefined' ? (navigator.onLine ? 'Yes' : 'No') : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Logs */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Real-time Auth Logs</CardTitle>
            <button 
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              Clear
            </button>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <p>No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => window.location.href = '/auth'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Auth Page
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => {
                  console.log('Current auth state:', { user, loading, error });
                  console.log('localStorage keys:', typeof window !== 'undefined' ? Object.keys(localStorage) : 'N/A');
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Log to Console
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Reload Page
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}