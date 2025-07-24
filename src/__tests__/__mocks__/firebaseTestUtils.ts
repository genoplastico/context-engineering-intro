// Firebase test utilities and mocks
import { Timestamp } from 'firebase/firestore';

// Mock Firebase app
export const mockFirebaseApp = {
  name: 'test-app',
  options: {
    projectId: 'test-project',
  },
};

// Mock Firestore instance
export const mockDb = {
  app: mockFirebaseApp,
};

// Mock Auth instance
export const mockAuth = {
  app: mockFirebaseApp,
  currentUser: null,
};

// Mock Storage instance
export const mockStorage = {
  app: mockFirebaseApp,
};

// Test data factories
export const createMockUser = (overrides: any = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  organizations: [],
  createdAt: new Date(),
  ...overrides,
});

export const createMockOrganization = (overrides: any = {}) => ({
  id: 'test-org-id',
  name: 'Test Organization',
  members: {
    'test-user-id': 'FULL_ACCESS',
  },
  settings: {
    aiQuotaUsed: 0,
    aiQuotaLimit: 100,
    currency: 'USD',
  },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

export const createMockAsset = (overrides: any = {}) => ({
  id: 'test-asset-id',
  organizationId: 'test-org-id',
  name: 'Test Asset',
  description: 'Test asset description',
  categoryId: 'test-category-id',
  spaceId: 'test-space-id',
  images: [],
  metadata: {},
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  createdBy: 'test-user-id',
  ...overrides,
});

export const createMockCategory = (overrides: any = {}) => ({
  id: 'test-category-id',
  organizationId: 'test-org-id',
  name: 'Test Category',
  description: 'Test category description',
  parentId: null,
  color: '#3B82F6',
  icon: '📦',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

export const createMockSpace = (overrides: any = {}) => ({
  id: 'test-space-id',
  organizationId: 'test-org-id',
  name: 'Test Space',
  description: 'Test space description',
  parentId: null,
  location: {
    address: '123 Test St',
    coordinates: { lat: 40.7128, lng: -74.0060 },
  },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

export const createMockTask = (overrides: any = {}) => ({
  id: 'test-task-id',
  organizationId: 'test-org-id',
  assetId: 'test-asset-id',
  title: 'Test Task',
  description: 'Test task description',
  status: 'PENDING',
  priority: 'MEDIUM',
  assignedTo: 'test-user-id',
  checklist: [],
  costs: [],
  recurring: null,
  dueDate: null,
  completedAt: null,
  completedBy: null,
  completionNotes: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  createdBy: 'test-user-id',
  ...overrides,
});

// Mock document references
export const createMockDocRef = (id: string) => ({
  id,
  path: `test-collection/${id}`,
  parent: {
    id: 'test-collection',
  },
});

// Mock document snapshots
export const createMockDocSnapshot = (data: any, exists = true) => ({
  id: data.id || 'test-doc-id',
  exists: jest.fn(() => exists),
  data: jest.fn(() => (exists ? data : undefined)),
  ref: createMockDocRef(data.id || 'test-doc-id'),
});

// Mock query snapshots
export const createMockQuerySnapshot = (docs: any[]) => ({
  docs: docs.map(doc => createMockDocSnapshot(doc)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: jest.fn((callback) => {
    docs.map(doc => createMockDocSnapshot(doc)).forEach(callback);
  }),
});

// Mock Firebase functions for consistent testing
export const setupFirebaseMocks = () => {
  // Mock Firebase app functions
  const mockInitializeApp = jest.fn(() => mockFirebaseApp);
  const mockGetApps = jest.fn(() => []);
  const mockGetApp = jest.fn(() => mockFirebaseApp);

  // Mock Firestore functions
  const mockGetFirestore = jest.fn(() => mockDb);
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGetDoc = jest.fn();
  const mockGetDocs = jest.fn();
  const mockSetDoc = jest.fn();
  const mockUpdateDoc = jest.fn();
  const mockDeleteDoc = jest.fn();
  const mockQuery = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();
  const mockOnSnapshot = jest.fn();
  const mockServerTimestamp = jest.fn(() => Timestamp.now());

  // Mock Auth functions
  const mockGetAuth = jest.fn(() => mockAuth);
  const mockSignInWithPopup = jest.fn();
  const mockSignInWithRedirect = jest.fn();
  const mockSignInWithEmailAndPassword = jest.fn();
  const mockCreateUserWithEmailAndPassword = jest.fn();
  const mockSignOut = jest.fn();
  const mockOnAuthStateChanged = jest.fn();
  const mockUpdateProfile = jest.fn();
  const mockGetRedirectResult = jest.fn();

  // Mock Storage functions
  const mockGetStorage = jest.fn(() => mockStorage);
  const mockRef = jest.fn();
  const mockUploadBytes = jest.fn();
  const mockGetDownloadURL = jest.fn();

  return {
    // App
    mockInitializeApp,
    mockGetApps,
    mockGetApp,
    
    // Firestore
    mockGetFirestore,
    mockCollection,
    mockDoc,
    mockGetDoc,
    mockGetDocs,
    mockSetDoc,
    mockUpdateDoc,
    mockDeleteDoc,
    mockQuery,
    mockWhere,
    mockOrderBy,
    mockLimit,
    mockOnSnapshot,
    mockServerTimestamp,
    
    // Auth
    mockGetAuth,
    mockSignInWithPopup,
    mockSignInWithRedirect,
    mockSignInWithEmailAndPassword,
    mockCreateUserWithEmailAndPassword,
    mockSignOut,
    mockOnAuthStateChanged,
    mockUpdateProfile,
    mockGetRedirectResult,
    
    // Storage
    mockGetStorage,
    mockRef,
    mockUploadBytes,
    mockGetDownloadURL,
  };
};

// Helper to reset all mocks
export const resetFirebaseMocks = (mocks: ReturnType<typeof setupFirebaseMocks>) => {
  Object.values(mocks).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
};