# Referencia de Tipos y Interfaces

> **⚠️ IMPORTANTE**: Este archivo contiene ÚNICAMENTE los tipos, interfaces y enums que existen realmente en el proyecto. NO usar tipos que no estén documentados aquí.
>
> **🔄 MANTENIMIENTO**: Este archivo debe actualizarse INMEDIATAMENTE después de cualquier cambio en `src/types/`. Mantener sincronización total entre código y documentación.

## 📁 Ubicación de tipos
Todos los tipos están definidos en: `src/types/`

## 🏗️ Asset Types (`src/types/asset.ts`)

### Interfaces principales
```typescript
interface Asset {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  categoryId: string;
  spaceId: string;
  images: string[]; // Firebase Storage URLs
  metadata: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface AssetCategory {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  parentId?: string; // Para categorías jerárquicas
  color?: string;
  icon?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  children?: AssetCategory[]; // Para estructura de árbol
}

interface AssetSpace {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  parentId?: string; // Para espacios jerárquicos
  location?: {
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  children?: AssetSpace[]; // Para estructura de árbol
}
```

### Interfaces de utilidad
```typescript
interface AssetFilter {
  categoryIds?: string[];
  spaceIds?: string[];
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

interface AssetSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

interface AssetFormData {
  name: string;
  description?: string;
  categoryId: string;
  spaceId: string;
  images: File[];
  metadata: Record<string, any>;
}
```

## 🔐 Auth Types (`src/types/auth.ts`)

### Interfaces principales
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  organizations: string[];
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

### Interfaces de formularios
```typescript
interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials extends SignInCredentials {
  displayName: string;
  confirmPassword: string;
}

interface CreateAccountData {
  email: string;
  password: string;
  displayName: string;
  invitationToken?: string;
}
```

### Interfaces de invitaciones
```typescript
interface InvitationData {
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
```

## 🏢 Organization Types (`src/types/organization.ts`)

### Types y enums
```typescript
type UserRole = 'FULL_ACCESS' | 'LIMITED_ACCESS';
```

### Interfaces principales
```typescript
interface Organization {
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

interface OrganizationMember {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  joinedAt: Timestamp;
  invitedBy?: string;
}

interface OrganizationInvitation {
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
```

### Context interface
```typescript
interface OrganizationProviderContext {
  currentOrganization: Organization | null;
  userOrganizations: Organization[];
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}
```

## ✅ Task Types (`src/types/task.ts`)

### Types y enums
```typescript
type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
```

### Interfaces principales
```typescript
interface Task {
  id: string;
  organizationId: string;
  assetId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  checklist: ChecklistItem[];
  costs: TaskCost[];
  recurring?: RecurringConfig;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  completedBy?: string;
  completionNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
}

interface TaskCost {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  receipt?: string; // Firebase Storage URL
  addedAt: Timestamp;
  addedBy: string;
}

interface RecurringConfig {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number; // Cada N días/semanas/meses/años
  endDate?: Timestamp;
  maxOccurrences?: number;
  nextDueDate: Timestamp;
}
```

### Interfaces de formularios y filtros
```typescript
interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo?: string;
  assetId?: string;
  dueDate?: Date;
  checklist: string[];
  recurring?: {
    frequency: RecurringConfig['frequency'];
    interval: number;
    endDate?: Date;
    maxOccurrences?: number;
  };
}

interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  assetIds?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
  search?: string;
}

interface TaskSortOptions {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'status';
  direction: 'asc' | 'desc';
}
```

### AI Suggestions
```typescript
interface Suggestion {
  id: string;
  organizationId: string;
  assetId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedCost?: number;
  aiGenerated: true;
  createdAt: Timestamp;
}
```

## 📦 Imports comunes de Firebase
```typescript
import { Timestamp, QueryConstraint, DocumentData } from 'firebase/firestore';

// Tipos de utilidad Firebase
type FirestoreTimestamp = Timestamp;
type FirestoreDocumentData = DocumentData;
```

## ⚠️ Notas importantes
- Todos los tipos usan `Timestamp` de Firebase para fechas
- Los IDs son siempre `string`
- Las URLs de imágenes y archivos son `string` (Firebase Storage URLs)
- Los roles de usuario son limitados a `'FULL_ACCESS' | 'LIMITED_ACCESS'`
- Los campos opcionales están marcados con `?`
