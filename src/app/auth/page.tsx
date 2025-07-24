'use client';

import { useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'signin' | 'register' | null;
  const invitationToken = searchParams.get('invite');

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