'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { Users, Settings as SettingsIcon, Zap, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { currentOrganization, userRole } = useOrganizationContext();

  if (!currentOrganization) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p>Loading organization settings...</p>
        </div>
      </div>
    );
  }

  const memberCount = Object.keys(currentOrganization.members).length;
  const { aiQuotaUsed, aiQuotaLimit, currency } = currentOrganization.settings;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your organization settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Organization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{currentOrganization.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Your Role</p>
              <Badge variant={userRole === 'FULL_ACCESS' ? 'default' : 'secondary'}>
                {userRole === 'FULL_ACCESS' ? 'Full Access' : 'Limited Access'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Currency</p>
              <p className="font-medium">{currency}</p>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Members</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold">{memberCount}</p>
            </div>
            <Link href="/dashboard/settings/members">
              <Button className="w-full">
                Manage Members
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* AI Quota */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Monthly Quota</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{aiQuotaUsed}</p>
                <span className="text-gray-500">/ {aiQuotaLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((aiQuotaUsed / aiQuotaLimit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Quota resets monthly. Contact support to increase limit.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/settings/members">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" disabled>
              <DollarSign className="h-4 w-4 mr-2" />
              Billing (Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Preferences (Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Zap className="h-4 w-4 mr-2" />
              Integrations (Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}