'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrganizationProvider } from '@/components/providers/OrganizationProvider';
import { OrganizationSelector } from '@/components/organizations/OrganizationSelector';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  Package, 
  CheckSquare, 
  MapPin, 
  Settings, 
  LogOut,
  Users,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Assets', href: '/dashboard/assets', icon: Package },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Spaces', href: '/dashboard/spaces', icon: MapPin },
  { name: 'Members', href: '/dashboard/settings/members', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

// Add debug link only in development
// Note: In Next.js client components, we need to check this differently
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  navigation.push({ name: 'Debug', href: '/dashboard/debug', icon: Settings });
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full bg-white">
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
              onClick={handleNavClick}
              className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors touch-manipulation ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
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
          className="w-full active:scale-95 transform transition-transform"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function DashboardSidebar() {
  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
      <SidebarContent />
    </div>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 active:scale-95 transform transition-transform"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MobileHeader() {
  const { user } = useAuth();
  
  return (
    <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <MobileNav />
        <h1 className="text-lg font-semibold text-gray-900">Asset Manager</h1>
      </div>
      <div className="flex items-center">
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
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <OrganizationProvider>
        <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
          <MobileHeader />
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-0 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </OrganizationProvider>
    </ProtectedRoute>
  );
}