export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  organizations: string[];
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface InvitationData {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: 'FULL_ACCESS' | 'LIMITED_ACCESS';
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  usedBy?: string;
}

export interface CreateAccountData {
  email: string;
  password: string;
  displayName: string;
  invitationToken?: string;
}