import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  Query,
  CollectionReference,
  DocumentReference,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Organization, UserRole } from '@/types/organization';
import { Asset, AssetCategory, AssetSpace } from '@/types/asset';
import { Task, Suggestion } from '@/types/task';

// Base paths for multi-tenant collections
export const COLLECTIONS = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  USER_INVITES: 'userInvites',
} as const;

// Organization-scoped collection paths
export const getOrgCollection = (orgId: string, collectionName: string) => 
  `organizations/${orgId}/${collectionName}`;

export const ORG_COLLECTIONS = {
  ASSETS: 'assets',
  CATEGORIES: 'categories', 
  SPACES: 'spaces',
  TASKS: 'tasks',
  SUGGESTIONS: 'suggestions',
  MEMBERS: 'members',
  SETTINGS: 'settings',
} as const;

// Security helpers - ensure user has access to organization
export const validateOrganizationAccess = async (
  userId: string, 
  organizationId: string
): Promise<UserRole | null> => {
  try {
    const orgRef = doc(db, COLLECTIONS.ORGANIZATIONS, organizationId);
    const orgDoc = await getDoc(orgRef);
    
    if (!orgDoc.exists()) {
      return null;
    }
    
    const orgData = orgDoc.data() as Organization;
    const userRole = orgData.members[userId];
    
    return userRole || null;
  } catch (error) {
    console.error('Error validating organization access:', error);
    return null;
  }
};

// Generic CRUD operations with organization context
export class OrganizationDB {
  constructor(private organizationId: string, private userId: string) {}

  // Get organization-scoped collection reference
  private getCollection<T = DocumentData>(collectionName: string): CollectionReference<T> {
    return collection(db, getOrgCollection(this.organizationId, collectionName)) as CollectionReference<T>;
  }

  // Get organization-scoped document reference
  private getDoc<T = DocumentData>(collectionName: string, docId: string): DocumentReference<T> {
    return doc(db, getOrgCollection(this.organizationId, collectionName), docId) as DocumentReference<T>;
  }

  // Create document with organization context
  async create<T extends { organizationId: string; createdBy: string; createdAt: any; updatedAt: any }>(
    collectionName: string,
    docId: string,
    data: Omit<T, 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const docRef = this.getDoc(collectionName, docId);
    const now = serverTimestamp();
    
    // Filter out undefined values as Firebase doesn't support them
    const cleanedData: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanedData[key] = value;
      } else {
        // For fields that should be null instead of undefined (like parentId)
        cleanedData[key] = null;
      }
    }
    
    await setDoc(docRef, {
      ...cleanedData,
      organizationId: this.organizationId,
      createdBy: this.userId,
      createdAt: now,
      updatedAt: now,
    } as T);
  }

  // Update document
  async update(
    collectionName: string,
    docId: string,
    data: Partial<DocumentData>
  ): Promise<void> {
    const docRef = this.getDoc(collectionName, docId);
    
    // Filter out undefined values as Firebase doesn't support them
    const cleanedData: Partial<DocumentData> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanedData[key] = value;
      } else {
        // For fields that should be null instead of undefined (like parentId)
        cleanedData[key] = null;
      }
    }
    
    await updateDoc(docRef, {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    });
  }

  // Delete document
  async delete(collectionName: string, docId: string): Promise<void> {
    const docRef = this.getDoc(collectionName, docId);
    await deleteDoc(docRef);
  }

  // Get single document
  async get<T = DocumentData>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = this.getDoc<T>(collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    
    return null;
  }

  // Query documents
  async query<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const collectionPath = getOrgCollection(this.organizationId, collectionName);
    console.log('🔍 OrganizationDB query:', { 
      collectionPath, 
      organizationId: this.organizationId, 
      userId: this.userId,
      constraintsCount: constraints.length 
    });
    
    const collectionRef = this.getCollection<T>(collectionName);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    
    console.log('🔍 Query result:', {
      docsCount: snapshot.docs.length,
      docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    });
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  // Real-time subscription
  onSnapshot<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[],
    callback: (data: T[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const collectionRef = this.getCollection<T>(collectionName);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        callback(data);
      },
      onError
    );
  }
}

// Typed database operations
export const createAsset = async (
  orgDB: OrganizationDB,
  assetId: string,
  assetData: Omit<Asset, 'id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  await orgDB.create<Asset>(ORG_COLLECTIONS.ASSETS, assetId, assetData);
};

export const createTask = async (
  orgDB: OrganizationDB,
  taskId: string,
  taskData: Omit<Task, 'id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  await orgDB.create<Task>(ORG_COLLECTIONS.TASKS, taskId, taskData);
};

export const createCategory = async (
  orgDB: OrganizationDB,
  categoryId: string,
  categoryData: Omit<AssetCategory, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  await orgDB.create<AssetCategory>(ORG_COLLECTIONS.CATEGORIES, categoryId, categoryData);
};

export const createSpace = async (
  orgDB: OrganizationDB,
  spaceId: string,
  spaceData: Omit<AssetSpace, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  await orgDB.create<AssetSpace>(ORG_COLLECTIONS.SPACES, spaceId, spaceData);
};

// Utility functions
export const createTimestamp = (): Timestamp => Timestamp.now();
export const timestampToDate = (timestamp: Timestamp): Date => timestamp.toDate();
export const dateToTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date);