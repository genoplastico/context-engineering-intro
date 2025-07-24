'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Organization, UserRole } from '@/types/organization';

interface OrganizationProviderContext {
  currentOrganization: Organization | null;
  userOrganizations: Organization[];
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationProviderContext | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  console.log('🏢 OrganizationProvider render:', {
    mounted,
    hasUser: !!user,
    userEmail: user?.email,
    currentOrgId: currentOrganization?.id,
    userOrgsCount: userOrganizations.length,
    loading,
    error
  });

  // Load user's organizations
  const loadUserOrganizations = async (userId: string): Promise<Organization[]> => {
    try {
      const orgsRef = collection(db, 'organizations');
      const q = query(orgsRef, where(`members.${userId}`, 'in', ['FULL_ACCESS', 'LIMITED_ACCESS']));
      const querySnapshot = await getDocs(q);
      
      const organizations: Organization[] = [];
      querySnapshot.forEach((doc) => {
        organizations.push({ id: doc.id, ...doc.data() } as Organization);
      });

      return organizations;
    } catch (err) {
      console.error('Error loading user organizations:', err);
      throw err;
    }
  };

  // Initialize organizations and set current organization
  useEffect(() => {
    console.log('🏢 OrganizationProvider useEffect triggered:', { mounted, hasUser: !!user, userId: user?.uid });
    
    // Don't run until component is mounted to avoid hydration issues
    if (!mounted) return;
    
    const initializeOrganizations = async () => {
      if (!user) {
        console.log('🏢 No user found, clearing organization state');
        setCurrentOrganization(null);
        setUserOrganizations([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('🏢 Loading organizations for user:', user.uid);
        setLoading(true);
        setError(null);

        // Load all user organizations
        const organizations = await loadUserOrganizations(user.uid);
        console.log('🏢 Loaded organizations:', organizations.length, organizations.map(o => ({ id: o.id, name: o.name })));
        setUserOrganizations(organizations);

        if (organizations.length === 0) {
          // User has no organizations - redirect to onboarding
          router.push('/onboarding');
          setLoading(false);
          return;
        }

        // Try to get organization from URL parameter (only on initial load)
        const orgIdFromUrl = searchParams.get('org');
        let targetOrg: Organization | null = null;

        if (orgIdFromUrl) {
          targetOrg = organizations.find(org => org.id === orgIdFromUrl) || null;
        }

        // If no valid org from URL, use the first available organization
        if (!targetOrg) {
          targetOrg = organizations[0];
          console.log('🏢 No org from URL, using first available:', targetOrg?.name);
        } else {
          console.log('🏢 Using organization from URL:', targetOrg.name);
        }

        // Only set organization if it's different from current to avoid unnecessary updates
        if (!currentOrganization || currentOrganization.id !== targetOrg.id) {
          console.log('🏢 Setting current organization:', targetOrg.name, targetOrg.id);
          setCurrentOrganization(targetOrg);
          setUserRole(targetOrg.members[user.uid] || null);

          // Update URL to reflect current organization (but don't create a loop)
          if (!orgIdFromUrl || orgIdFromUrl !== targetOrg.id) {
            console.log('🏢 Updating URL with org:', targetOrg.id);
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('org', targetOrg.id);
            router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
        console.error('Error initializing organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeOrganizations();
  }, [user?.uid, router, mounted]); // Removed searchParams to prevent loops

  // Separate effect to handle URL organization parameter changes  
  useEffect(() => {
    if (!mounted || !user || userOrganizations.length === 0 || loading) return;

    const orgIdFromUrl = searchParams.get('org');
    if (!orgIdFromUrl || !currentOrganization) return;

    // Only switch if URL org is different from current org
    if (currentOrganization.id !== orgIdFromUrl) {
      const targetOrg = userOrganizations.find(org => org.id === orgIdFromUrl);
      if (targetOrg) {
        console.log('🏢 URL org change detected, switching to:', targetOrg.name);
        setCurrentOrganization(targetOrg);
        setUserRole(targetOrg.members[user.uid] || null);
      }
    }
  }, [searchParams, currentOrganization?.id, userOrganizations.length, user?.uid, mounted, loading]);

  // Switch to different organization
  const switchOrganization = async (organizationId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Find organization in user's list
      const targetOrg = userOrganizations.find(org => org.id === organizationId);
      
      if (!targetOrg) {
        // Organization not in user's list, try to load it
        const orgDoc = await doc(db, 'organizations', organizationId);
        // This will be handled by the security rules
        throw new Error('Organization not found or access denied');
      }

      // Check user has access
      const role = targetOrg.members[user.uid];
      if (!role) {
        throw new Error('Access denied: You are not a member of this organization');
      }

      setCurrentOrganization(targetOrg);
      setUserRole(role);

      // Update URL without triggering re-renders
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('org', organizationId);
      router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh organizations (useful after accepting invitations)
  const refreshOrganizations = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const organizations = await loadUserOrganizations(user.uid);
      setUserOrganizations(organizations);

      // Update current organization if it still exists
      if (currentOrganization) {
        const updatedCurrentOrg = organizations.find(org => org.id === currentOrganization.id);
        if (updatedCurrentOrg) {
          setCurrentOrganization(updatedCurrentOrg);
          setUserRole(updatedCurrentOrg.members[user.uid] || null);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh organizations');
      console.error('Error refreshing organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: OrganizationProviderContext = {
    currentOrganization,
    userOrganizations,
    userRole,
    loading,
    error,
    switchOrganization,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook to use organization context
export const useOrganizationContext = (): OrganizationProviderContext => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
};