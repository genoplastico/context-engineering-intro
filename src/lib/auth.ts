'use client';

import { 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, CreateAccountData } from '@/types/auth';

class AuthService {
  private authStateListeners: ((user: User | null) => void)[] = [];
  private currentUser: User | null = null;

  constructor() {
    // Only initialize auth state listener on client side
    if (typeof window !== 'undefined') {
      // Listen to auth state changes
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const user = await this.createUserFromFirebaseUser(firebaseUser);
          this.currentUser = user;
          this.notifyListeners(user);
        } else {
          this.currentUser = null;
          this.notifyListeners(null);
        }
      });
    }
  }

  async handleRedirectResult() {
    // Only handle redirects on client side
    if (typeof window === 'undefined') return;
    
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        // User signed in via redirect, create/update user document
        await this.createOrUpdateUserDocument(result.user);
      }
    } catch (error) {
      console.error('Error handling redirect result:', error);
    }
  }

  private async createUserFromFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || userData?.displayName || 'User',
      photoURL: firebaseUser.photoURL || userData?.photoURL,
      organizations: userData?.organizations || [],
      createdAt: userData?.createdAt || new Date(),
    };
  }

  private async createOrUpdateUserDocument(firebaseUser: FirebaseUser, additionalData?: any) {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || additionalData?.displayName || 'User',
        photoURL: firebaseUser.photoURL,
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData,
      });
    } else {
      // Update existing user document
      await updateDoc(userRef, {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userDoc.data().displayName,
        photoURL: firebaseUser.photoURL || userDoc.data().photoURL,
        updatedAt: new Date(),
        ...additionalData,
      });
    }
  }

  private notifyListeners(user: User | null) {
    this.authStateListeners.forEach(listener => listener(user));
  }

  addAuthStateListener(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Detect if user is on mobile device
  private isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    try {
      if (this.isMobileDevice()) {
        // Use redirect for mobile devices
        await signInWithRedirect(auth, provider);
        // The result will be handled by handleRedirectResult
        throw new Error('Redirect initiated'); // This will be caught and handled appropriately
      } else {
        // Use popup for desktop
        const result = await signInWithPopup(auth, provider);
        await this.createOrUpdateUserDocument(result.user);
        return await this.createUserFromFirebaseUser(result.user);
      }
    } catch (error: any) {
      if (error.message === 'Redirect initiated') {
        throw error; // Let the redirect happen
      }
      console.error('Error signing in with Google:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await this.createUserFromFirebaseUser(result.user);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  async createAccount(
    email: string, 
    password: string, 
    displayName: string,
    invitationToken?: string
  ): Promise<User> {
    try {
      // Create account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(result.user, { displayName });

      // Process invitation if provided
      let organizationData = {};
      if (invitationToken) {
        organizationData = await this.processInvitation(invitationToken, result.user.uid);
      }

      // Create user document with additional data
      await this.createOrUpdateUserDocument(result.user, {
        displayName,
        ...organizationData,
      });

      return await this.createUserFromFirebaseUser(result.user);
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  private async processInvitation(invitationToken: string, userId: string) {
    try {
      // Get invitation document
      const inviteRef = doc(db, 'userInvites', invitationToken);
      const inviteDoc = await getDoc(inviteRef);

      if (!inviteDoc.exists()) {
        throw new Error('Invalid invitation token');
      }

      const inviteData = inviteDoc.data();
      
      // Check if invitation is still valid
      if (inviteData.expiresAt.toDate() < new Date()) {
        throw new Error('Invitation has expired');
      }

      if (inviteData.used) {
        throw new Error('Invitation has already been used');
      }

      // Add user to organization
      const orgRef = doc(db, 'organizations', inviteData.organizationId);
      const orgDoc = await getDoc(orgRef);

      if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        const updatedMembers = {
          ...orgData.members,
          [userId]: inviteData.role,
        };

        await updateDoc(orgRef, {
          members: updatedMembers,
          updatedAt: new Date(),
        });

        // Mark invitation as used
        await updateDoc(inviteRef, {
          used: true,
          usedBy: userId,
          usedAt: new Date(),
        });

        return {
          organizations: [inviteData.organizationId],
        };
      }

      return {};
    } catch (error) {
      console.error('Error processing invitation:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  async getInvitationByToken(token: string) {
    try {
      const inviteRef = doc(db, 'userInvites', token);
      const inviteDoc = await getDoc(inviteRef);
      
      if (!inviteDoc.exists()) {
        return null;
      }

      const inviteData = inviteDoc.data();
      
      // Check if invitation is still valid
      if (inviteData.expiresAt.toDate() < new Date()) {
        return null;
      }

      if (inviteData.used) {
        return null;
      }

      return inviteData;
    } catch (error) {
      console.error('Error getting invitation:', error);
      return null;
    }
  }
}

export const authService = new AuthService();