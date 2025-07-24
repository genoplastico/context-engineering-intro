'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
// import { EnvDebug } from '@/components/debug/EnvDebug'; // Removed to prevent hydration errors
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const mode = searchParams.get('mode') as 'signin' | 'register' | null;
  const invitationToken = searchParams.get('invite');

  useEffect(() => {
    // If user is already authenticated and not loading, redirect to dashboard
    if (!loading && user) {
      console.log('🔐 User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only show auth form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <AuthForm 
            mode={mode || 'signin'}
            invitationToken={invitationToken || undefined}
          />
        </div>
      </div>
    );
  }

  // Return null while redirecting
  return null;
}