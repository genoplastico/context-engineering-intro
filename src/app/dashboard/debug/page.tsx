'use client';

import { useAuth } from '@/hooks/useAuth';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const { user, loading, error } = useAuth();
  const { currentOrganization, userRole, loading: orgLoading, userOrganizations } = useOrganizationContext();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Display Name:</strong> {user?.displayName || 'N/A'}</p>
              <p><strong>UID:</strong> {user?.uid || 'N/A'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Organization State */}
        <Card>
          <CardHeader>
            <CardTitle>Organization State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Org Loading:</strong> {orgLoading ? 'Yes' : 'No'}</p>
              <p><strong>Current Org:</strong> {currentOrganization?.name || 'None selected'}</p>
              <p><strong>User Role:</strong> {userRole || 'N/A'}</p>
              <p><strong>Total Orgs:</strong> {userOrganizations?.length || 0}</p>
              <p><strong>Org ID:</strong> {currentOrganization?.id || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Browser Info */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
              <p><strong>Local Storage Available:</strong> {typeof window !== 'undefined' && window.localStorage ? 'Yes' : 'No'}</p>
              <p><strong>Session Storage Available:</strong> {typeof window !== 'undefined' && window.sessionStorage ? 'Yes' : 'No'}</p>
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Firebase State */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Firebase Loaded:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
              <div className="mt-4">
                <button 
                  onClick={() => {
                    console.log('Current auth state:', user);
                    console.log('Current org state:', currentOrganization);
                    console.log('All organizations:', userOrganizations);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Log State to Console
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}