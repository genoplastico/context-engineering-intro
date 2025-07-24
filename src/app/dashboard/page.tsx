'use client';

import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckSquare, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentOrganization, userRole, loading } = useOrganizationContext();

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4 sm:w-1/2 lg:w-1/4 mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 text-center py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          No Organization Selected
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Please select an organization to view the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
            {currentOrganization.name} Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Welcome back! Here's what's happening with your assets and tasks.
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
            {userRole?.toLowerCase().replace('_', ' ')} access
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer active:scale-95 transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Assets in your organization
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer active:scale-95 transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Pending and in-progress tasks
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer active:scale-95 transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {Object.keys(currentOrganization.members).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active organization members
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer active:scale-95 transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Quota</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {currentOrganization.settings.aiQuotaUsed} / {currentOrganization.settings.aiQuotaLimit}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly AI suggestions used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">Recent Assets</CardTitle>
              <CardDescription className="text-sm">
                Latest assets added to your organization
              </CardDescription>
            </div>
            <Link href="/assets">
              <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-gray-100 active:scale-95 transform transition-transform">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500 text-sm">
              No assets yet. Start by adding your first asset!
            </div>
            <div className="mt-4">
              <Link href="/assets">
                <Button className="w-full sm:w-auto active:scale-95 transform transition-transform" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">Upcoming Tasks</CardTitle>
              <CardDescription className="text-sm">
                Tasks that need attention soon
              </CardDescription>
            </div>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-gray-100 active:scale-95 transform transition-transform">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500 text-sm">
              No upcoming tasks. Create your first maintenance task!
            </div>
            <div className="mt-4">
              <Link href="/tasks">
                <Button className="w-full sm:w-auto active:scale-95 transform transition-transform" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 safe-area-inset-bottom">
        <div className="flex justify-center space-x-4">
          <Link href="/assets">
            <Button size="sm" className="flex-1 active:scale-95 transform transition-transform">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </Link>
          <Link href="/tasks">
            <Button size="sm" variant="outline" className="flex-1 active:scale-95 transform transition-transform">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom padding for mobile bottom bar */}
      <div className="sm:hidden h-20"></div>
    </div>
  );
}