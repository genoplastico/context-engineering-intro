# Referencia de APIs, Servicios y Hooks

> **⚠️ IMPORTANTE**: Este archivo contiene ÚNICAMENTE los servicios, hooks y APIs que existen realmente en el proyecto. NO usar elementos que no estén documentados aquí.
>
> **🔄 MANTENIMIENTO**: Este archivo debe actualizarse INMEDIATAMENTE después de cualquier cambio en `src/hooks/`, `src/lib/` o APIs. Mantener sincronización total entre código y documentación.

## 🎣 Hooks Disponibles (`src/hooks/`)

### Hooks principales
```typescript
// useAuth.ts
export const useAuth: () => AuthState & {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  // ... otros métodos de auth
}

// useAssets.ts
export const useAssets: (
  filter?: AssetFilter,
  sortOptions?: AssetSortOptions
) => {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  createAsset: (data: AssetFormData) => Promise<Asset>;
  updateAsset: (id: string, data: Partial<AssetFormData>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  refetch: () => void;
}

// useTasks.ts
export const useTasks: (
  filter?: TaskFilter,
  sortOptions?: TaskSortOptions
) => {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string, notes?: string) => Promise<void>;
  refetch: () => void;
}

// useCategories.ts
export const useCategories: () => {
  categories: AssetCategory[];
  loading: boolean;
  error: string | null;
  createCategory: (data: Omit<AssetCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AssetCategory>;
  updateCategory: (id: string, data: Partial<AssetCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refetch: () => void;
}

// useSpaces.ts
export const useSpaces: () => {
  spaces: AssetSpace[];
  loading: boolean;
  error: string | null;
  createSpace: (data: Omit<AssetSpace, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSpace: (id: string, data: Partial<AssetSpace>) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  getSpaceTree: () => AssetSpace[];
  refetch: () => void;
}

// useOrganization.ts
export const useOrganization: (organizationId?: string) => OrganizationContext

// useSuggestions.ts
export const useSuggestions: (assetId?: string) => {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  generateSuggestions: (assetId: string) => Promise<void>;
  createTaskFromSuggestion: (suggestion: Suggestion) => Promise<Task>;
  dismissSuggestion: (id: string) => Promise<void>;
  refetch: () => void;
}
```

### Hook de contexto
```typescript
// src/components/providers/OrganizationProvider.tsx
export const useOrganizationContext: () => OrganizationProviderContext & {
  currentOrganization: Organization | null;
  userOrganizations: Organization[];
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}
```

## 🔧 Servicios Disponibles (`src/lib/`)

### AuthService (`src/lib/auth.ts`)
```typescript
class AuthService {
  // Métodos de autenticación
  signInWithEmailAndPassword(email: string, password: string): Promise<User>;
  createUserWithEmailAndPassword(email: string, password: string, displayName: string): Promise<User>;
  signOut(): Promise<void>;
  
  // Gestión de invitaciones
  createInvitation(organizationId: string, email: string, role: UserRole): Promise<string>;
  acceptInvitation(token: string): Promise<void>;
  
  // Estado de autenticación
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

// Instancia exportada
export const authService: AuthService;
```

### OrganizationDB (`src/lib/db.ts`)
```typescript
class OrganizationDB {
  constructor(organizationId: string, userId: string);
  
  // Generic CRUD operations
  create<T>(collectionName: string, docId: string, data: Omit<T, 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<void>;
  update(collectionName: string, docId: string, data: Partial<DocumentData>): Promise<void>;
  delete(collectionName: string, docId: string): Promise<void>;
  get<T>(collectionName: string, docId: string): Promise<T | null>;
  query<T>(collectionName: string, constraints?: QueryConstraint[]): Promise<T[]>;
  onSnapshot<T>(collectionName: string, constraints: QueryConstraint[], callback: (data: T[]) => void, onError?: (error: Error) => void): () => void;
}

// Collection paths
export const ORG_COLLECTIONS = {
  ASSETS: 'assets',
  CATEGORIES: 'categories', 
  SPACES: 'spaces',
  TASKS: 'tasks',
  SUGGESTIONS: 'suggestions',
  MEMBERS: 'members',
  SETTINGS: 'settings',
} as const;

// Typed helper functions
export const createAsset: (orgDB: OrganizationDB, assetId: string, assetData: Omit<Asset, 'id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
export const createTask: (orgDB: OrganizationDB, taskId: string, taskData: Omit<Task, 'id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
export const createCategory: (orgDB: OrganizationDB, categoryId: string, categoryData: Omit<AssetCategory, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
export const createSpace: (orgDB: OrganizationDB, spaceId: string, spaceData: Omit<AssetSpace, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;

// Security validation
export const validateOrganizationAccess: (userId: string, organizationId: string) => Promise<UserRole | null>;
```

### AIService (`src/lib/ai.ts`)
```typescript
class AIService {
  // Generación de sugerencias
  generateSuggestions(assetId: string, assetData: Asset): Promise<Suggestion[]>;
  
  // Gestión de cuota
  checkQuota(organizationId: string): Promise<boolean>;
  updateQuotaUsage(organizationId: string): Promise<void>;
  
  // Validación de contexto
  validateContext(asset: Asset): boolean;
}

// Instancia exportada
export const aiService: AIService;
```

### WhatsAppService (`src/lib/whatsapp.ts`)
```typescript
class WhatsAppService {
  // Compartir contenido
  shareAsset(asset: Asset): string; // Retorna URL de WhatsApp
  shareTask(task: Task): string;
  shareReport(data: any): string;
  
  // Formateo de mensajes
  formatAssetMessage(asset: Asset): string;
  formatTaskMessage(task: Task): string;
  formatReportMessage(data: any): string;
}

// Instancia exportada
export const whatsappService: WhatsAppService;
```

## 🔥 Firebase Configuration (`src/lib/firebase.ts`)

### Configuración disponible
```typescript
// Firebase app instance
export const app: FirebaseApp;

// Firestore
export const db: Firestore;

// Authentication
export const auth: Auth;

// Storage
export const storage: FirebaseStorage;

// Funciones de utilidad
export const initializeFirebase: () => Promise<void>;
export const validateFirebaseConfig: () => boolean;
```

## 📱 PWA Services (`src/lib/pwa.ts`)

### Servicios PWA
```typescript
// Service Worker
export const registerServiceWorker: () => Promise<void>;

// Utilidades PWA
export const isPWA: () => boolean;
export const canInstallPWA: () => boolean;
export const installPWA: () => Promise<void>;
```

## 🌐 API Endpoints (Next.js API Routes)

### Rutas API disponibles
```typescript
// /api/suggestions
POST /api/suggestions
// Body: { assetId: string }
// Response: { suggestions: Suggestion[] }

// /api/export
GET /api/export/excel?type=assets|tasks|costs&org=orgId
GET /api/export/csv?type=assets|tasks&org=orgId
GET /api/export/ics?org=orgId
// Response: File download

// /api/upload
POST /api/upload
// Body: FormData with files
// Response: { urls: string[] }
```

## 🔍 Utilidades Disponibles (`src/lib/utils.ts`)

### Funciones de utilidad
```typescript
// Formateo
export const formatCurrency: (amount: number, currency: string) => string;
export const formatDate: (date: Date | Timestamp) => string;
export const formatRelativeTime: (date: Date | Timestamp) => string;

// Validación
export const validateEmail: (email: string) => boolean;
export const validatePassword: (password: string) => boolean;

// Conversión
export const timestampToDate: (timestamp: Timestamp) => Date;
export const dateToTimestamp: (date: Date) => Timestamp;

// CSS
export const cn: (...classes: string[]) => string; // clsx + tailwind-merge
```

## 📊 Export Services (`src/lib/export.ts`)

### Servicios de exportación
```typescript
// Excel export
export const exportToExcel: (data: any[], type: 'assets' | 'tasks' | 'costs') => Promise<Blob>;

// CSV export
export const exportToCSV: (data: any[], type: 'assets' | 'tasks') => Promise<Blob>;

// ICS export (calendario)
export const exportToICS: (tasks: Task[]) => Promise<Blob>;
```

## ⚠️ Servicios que NO existen
- `NotificationService` (no implementado)
- `EmailService` (no implementado)
- `ReportService` (usar export utilities)
- `CacheService` (no implementado)
- `LoggingService` (no implementado)

## 📦 Imports correctos

### Hooks
```typescript
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useSpaces } from '@/hooks/useSpaces';
import { useOrganization } from '@/hooks/useOrganization';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
```

### Servicios
```typescript
import { authService } from '@/lib/auth';
import { OrganizationDB } from '@/lib/db';
import { aiService } from '@/lib/ai';
import { whatsappService } from '@/lib/whatsapp';
```

### Firebase
```typescript
import { db, auth, storage } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
```

### Utilidades
```typescript
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { exportToExcel, exportToCSV, exportToICS } from '@/lib/export';
```

## 🎯 Notas importantes
- Todos los hooks retornan objetos con `loading`, `error` y datos
- Los servicios son clases instanciadas y exportadas como singletons
- OrganizationDB requiere organizationId en el constructor
- Todos los métodos async retornan Promises
- Los hooks se suscriben automáticamente a cambios en tiempo real
- Usar `refetch()` en hooks para forzar actualización manual
