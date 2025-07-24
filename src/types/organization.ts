import { Timestamp } from 'firebase/firestore';

export type UserRole = 'FULL_ACCESS' | 'LIMITED_ACCESS';

export interface Organization {
  id: string;
  name: string;
  members: Record<string, UserRole>;
  settings: {
    aiQuotaUsed: number;
    aiQuotaLimit: number;
    currency: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrganizationMember {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  joinedAt: Timestamp;
  invitedBy?: string;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: UserRole;
  token: string;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
  usedAt?: Timestamp;
  usedBy?: string;
}

export interface OrganizationContext {
  organization: Organization | null;
  members: OrganizationMember[];
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  inviteUser: (email: string, role: UserRole) => Promise<string>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
}