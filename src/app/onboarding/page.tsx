'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { nanoid } from 'nanoid';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const organizationId = nanoid();
      
      // Create organization document
      const organizationData = {
        id: organizationId,
        name: organizationName.trim(),
        members: {
          [user.uid]: 'FULL_ACCESS' as const
        },
        settings: {
          aiQuotaUsed: 0,
          aiQuotaLimit: 100,
          currency: 'USD'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid
      };

      await setDoc(doc(db, 'organizations', organizationId), organizationData);

      console.log('✅ Organization created successfully:', organizationId);
      
      // Redirect to dashboard with the new organization
      router.push(`/dashboard?org=${organizationId}`);
      
    } catch (err) {
      console.error('Error creating organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we verify your authentication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Asset Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's create your first organization to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={createOrganization}>
          <div>
            <label htmlFor="organization-name" className="sr-only">
              Organization Name
            </label>
            <input
              id="organization-name"
              name="organizationName"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your organization name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !organizationName.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Organization...' : 'Create Organization'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              This will create your first organization where you can manage assets, tasks, and team members.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}