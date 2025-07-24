'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrganizationProvider } from '@/components/providers/OrganizationProvider';
import { OrganizationSelector } from '@/components/organizations/OrganizationSelector';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  CheckSquare, 
  MapPin, 
  Settings, 
  LogOut,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Assets', href: '/dashboard/assets', icon: Package },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Spaces', href: '/dashboard/spaces', icon: MapPin },
  { name: 'Members', href: '/dashboard/settings/members', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Organization Selector */}
      <div className="p-4 border-b border-gray-200">
        <OrganizationSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            {user?.photoURL ? (
              <img
                className="h-8 w-8 rounded-full"
                src={user.photoURL}
                alt={user.displayName || 'User'}
              />
            ) : (
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-600">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OrganizationProvider>
        <div className="flex h-screen bg-gray-50">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </OrganizationProvider>
    </ProtectedRoute>
  );
}