import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { firebaseConfigValues } from './firebase-config';

console.log('🚀 Firebase loading with hardcoded config (temporary fix)');
console.log('🚀 Config values:', firebaseConfigValues);

const firebaseConfig = firebaseConfigValues;

// Validate Firebase configuration
function validateFirebaseConfig() {
  console.log('🔍 Validating hardcoded Firebase configuration...');
  
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing Firebase config fields:', missingFields);
    throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }
  
  console.log('✅ All Firebase configuration fields present!');
  console.log('✅ Firebase config validation passed');
}

// Initialize Firebase
let app;
try {
  console.log('🚀 Starting Firebase initialization...');
  validateFirebaseConfig();
  
  const existingApps = getApps();
  console.log('🔧 Existing Firebase apps:', existingApps.length);
  
  app = existingApps.length > 0 ? getApp() : initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully!');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize auth persistence promise
let authPersistencePromise: Promise<void> | null = null;

// Set auth persistence to local (survives browser sessions)
if (typeof window !== 'undefined') {
  authPersistencePromise = setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ Auth persistence set to browserLocalPersistence');
    })
    .catch((error) => {
      console.error('❌ Failed to set auth persistence:', error);
    });
}

// Export function to wait for auth persistence
export const waitForAuthPersistence = async (): Promise<void> => {
  if (authPersistencePromise) {
    await authPersistencePromise;
  }
};

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_FIREBASE_EMULATOR === 'true') {
  if (!auth._delegate._config?.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  
  if (!db._delegate._databaseId.projectId.includes('demo-')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  if (!storage._location.host.includes('localhost')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
}

export default app;