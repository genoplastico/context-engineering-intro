'use client';

import { useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/lib/auth';

export const useAuth = (): AuthState & {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string, displayName: string, invitationToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
} => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.addAuthStateListener((user: User | null) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false,
      }));
    });

    // Initialize with current user
    const currentUser = authService.getCurrentUser();
    setState(prev => ({
      ...prev,
      user: currentUser,
      loading: false,
    }));

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signInWithGoogle();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signInWithEmail(email, password);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
      throw error;
    }
  };

  const createAccount = async (
    email: string,
    password: string,
    displayName: string,
    invitationToken?: string
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await authService.createAccount(email, password, displayName, invitationToken);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Account creation failed',
      }));
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signOut();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
      throw error;
    }
  };

  return {
    ...state,
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    signOut,
  };
};