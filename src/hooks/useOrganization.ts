'use client';

import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authService } from '@/lib/auth';
import { 
  Organization, 
  OrganizationMember, 
  OrganizationContext, 
  UserRole 
} from '@/types/organization';
import { useAuth } from './useAuth';

export const useOrganization = (organizationId?: string): OrganizationContext => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load organization data
  useEffect(() => {
    if (!user || !organizationId) {
      setLoading(false);
      return;
    }

    const loadOrganization = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get organization document
        const orgRef = doc(db, 'organizations', organizationId);
        const orgSnap = await getDoc(orgRef);

        if (!orgSnap.exists()) {
          throw new Error('Organization not found');
        }

        const orgData = { id: orgSnap.id, ...orgSnap.data() } as Organization;
        
        // Check if user is a member
        const role = orgData.members[user.uid];
        if (!role) {
          throw new Error('Access denied: You are not a member of this organization');
        }

        setOrganization(orgData);
        setUserRole(role);

        // Load organization members
        await loadMembers(organizationId);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organization');
        console.error('Error loading organization:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();

    // Set up real-time listener for organization changes
    const unsubscribe = onSnapshot(
      doc(db, 'organizations', organizationId),
      (doc) => {
        if (doc.exists()) {
          const orgData = { id: doc.id, ...doc.data() } as Organization;
          setOrganization(orgData);
          
          // Update user role
          if (user) {
            setUserRole(orgData.members[user.uid] || null);
          }
        }
      },
      (err) => {
        console.error('Error listening to organization changes:', err);
        setError('Connection error');
      }
    );

    return () => unsubscribe();
  }, [user, organizationId]);

  // Load organization members
  const loadMembers = async (orgId: string) => {
    try {
      if (!organization) return;

      const memberPromises = Object.keys(organization.members).map(async (userId) => {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          return {
            uid: userId,
            email: userData.email || '',
            displayName: userData.displayName || '',
            role: organization.members[userId],
            joinedAt: userData.createdAt,
          } as OrganizationMember;
        }
        return null;
      });

      const memberResults = await Promise.all(memberPromises);
      const validMembers = memberResults.filter((member): member is OrganizationMember => 
        member !== null
      );

      setMembers(validMembers);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  // Switch to different organization
  const switchOrganization = async (newOrgId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Validate user has access to new organization
      const orgRef = doc(db, 'organizations', newOrgId);
      const orgSnap = await getDoc(orgRef);

      if (!orgSnap.exists()) {
        throw new Error('Organization not found');
      }

      const orgData = orgSnap.data() as Organization;
      if (!orgData.members[user.uid]) {
        throw new Error('Access denied: You are not a member of this organization');
      }

      // Update current organization
      setOrganization({ id: newOrgId, ...orgData });
      setUserRole(orgData.members[user.uid]);
      
      await loadMembers(newOrgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Invite user to organization
  const inviteUser = async (email: string, role: UserRole): Promise<string> => {
    if (!user || !organization) {
      throw new Error('User not authenticated or organization not loaded');
    }

    if (userRole !== 'FULL_ACCESS') {
      throw new Error('Insufficient permissions to invite users');
    }

    try {
      const invitationToken = await authService.createInvitation(
        organization.id,
        organization.name,
        email,
        role,
        user.uid
      );

      return invitationToken;
    } catch (err) {
      console.error('Error creating invitation:', err);
      throw err;
    }
  };

  // Remove user from organization
  const removeUser = async (userId: string): Promise<void> => {
    if (!user || !organization) {
      throw new Error('User not authenticated or organization not loaded');
    }

    if (userRole !== 'FULL_ACCESS') {
      throw new Error('Insufficient permissions to remove users');
    }

    if (userId === user.uid) {
      throw new Error('Cannot remove yourself from the organization');
    }

    try {
      const orgRef = doc(db, 'organizations', organization.id);
      
      // Remove user from organization members
      const updatedMembers = { ...organization.members };
      delete updatedMembers[userId];

      await updateDoc(orgRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setMembers(prev => prev.filter(member => member.uid !== userId));
      setOrganization(prev => prev ? {
        ...prev,
        members: updatedMembers
      } : null);

    } catch (err) {
      console.error('Error removing user:', err);
      throw err;
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    if (!user || !organization) {
      throw new Error('User not authenticated or organization not loaded');
    }

    if (userRole !== 'FULL_ACCESS') {
      throw new Error('Insufficient permissions to update user roles');
    }

    if (userId === user.uid) {
      throw new Error('Cannot change your own role');
    }

    try {
      const orgRef = doc(db, 'organizations', organization.id);
      
      await updateDoc(orgRef, {
        [`members.${userId}`]: newRole,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setMembers(prev => prev.map(member => 
        member.uid === userId ? { ...member, role: newRole } : member
      ));
      
      setOrganization(prev => prev ? {
        ...prev,
        members: {
          ...prev.members,
          [userId]: newRole
        }
      } : null);

    } catch (err) {
      console.error('Error updating user role:', err);
      throw err;
    }
  };

  return {
    organization,
    members,
    userRole,
    loading,
    error,
    switchOrganization,
    inviteUser,
    removeUser,
    updateUserRole,
  };
};