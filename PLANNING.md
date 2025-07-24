# Asset Management System - Project Planning & Architecture

## 🎯 Project Goals

Build a comprehensive web-based asset management system that enables organizations to:
- Track assets with hierarchical categorization and space-based organization
- Manage maintenance tasks with checklist support and cost tracking
- Collaborate effectively with role-based access control
- Generate intelligent maintenance suggestions using AI
- Export data in multiple formats (XLS, ICS)

## 🏗️ Architecture & Tech Stack

### Frontend Architecture
- **Framework**: Next.js 14 with App Router (SSR + Client Components)
- **UI System**: Tailwind CSS + shadcn/ui (copy-paste components)
- **State Management**: React Context + Custom Hooks
- **Form Handling**: React Hook Form + Zod validation
- **Authentication**: Firebase Auth with mobile device detection
- **Image Handling**: Firebase Storage with multi-image upload
- **Export System**: XLSX, ICS, and CSV file generation

### Backend Architecture
- **Database**: Firebase Firestore (multi-tenant with organization isolation)
- **Storage**: Firebase Storage (images, documents, receipts)
- **Authentication**: Firebase Auth (Google OAuth + Email/Password)
- **AI Integration**: Google Gemini API with quota management
- **Security**: Organization-based Firestore security rules
- **API Routes**: RESTful endpoints for AI suggestions and data export

### Key Architectural Decisions

1. **Multi-Tenant Data Isolation**: Each organization's data is completely isolated using Firestore security rules
2. **Mobile-First Auth**: Critical device detection to handle Firebase auth limitations on mobile
3. **Component Architecture**: shadcn/ui components copied into project for full customization
4. **Type Safety**: Comprehensive TypeScript types for all data models
5. **Real-time Updates**: Firestore onSnapshot for live data synchronization

## 📁 File Structure & Conventions

### Directory Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard routes
│   └── api/               # API routes (AI, export)
├── components/            # React components
│   ├── ui/                # shadcn/ui components (copy-paste)
│   │   └── whatsapp-share.tsx  # WhatsApp sharing components
│   ├── auth/              # Authentication components
│   ├── assets/            # Asset management components
│   ├── tasks/             # Task management components
│   ├── spaces/            # Space management components
│   ├── ai/                # AI suggestions components
│   ├── organizations/     # Organization components
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useAssets.ts       # Asset management hook
│   ├── useTasks.ts        # Task management hook
│   ├── useCategories.ts   # Category management hook
│   ├── useSpaces.ts       # Space management hook
│   ├── useSuggestions.ts  # AI suggestions hook
│   └── useOrganization.ts # Organization hook
├── lib/                   # Utilities and configuration
│   ├── firebase.ts        # Firebase configuration
│   ├── auth.ts            # Authentication service
│   ├── db.ts              # Database utilities
│   ├── ai.ts              # AI service integration
│   ├── export.ts          # Data export utilities
│   ├── whatsapp.ts        # WhatsApp sharing service
│   └── utils.ts           # General utilities
├── types/                 # TypeScript type definitions
│   ├── auth.ts            # Authentication types
│   ├── organization.ts    # Organization types
│   ├── asset.ts           # Asset and category types
│   └── task.ts            # Task and suggestion types
└── __tests__/             # Jest test files
```

### Naming Conventions

**Files & Components:**
- React components: PascalCase (`AuthForm.tsx`, `AssetCard.tsx`)
- Hooks: camelCase starting with 'use' (`useAuth.ts`, `useAssets.ts`)
- Utilities: camelCase (`formatDate`, `validateInput`)
- Types: PascalCase interfaces (`User`, `Organization`, `Asset`)

**Database Collections:**
- Root level: camelCase (`organizations`, `userInvites`)
- Organization sub-collections: camelCase (`assets`, `tasks`, `categories`)

**Environment Variables:**
- Public (client-side): `NEXT_PUBLIC_*`
- Private (server-side): `GEMINI_API_KEY`, `FIREBASE_ADMIN_*`

## 🔒 Security Patterns

### Authentication Flow
```typescript
// Mobile device detection for auth method selection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
if (isMobile) {
  await signInWithRedirect(auth, provider);
} else {
  await signInWithPopup(auth, provider);
}
```

### Multi-Tenant Database Access
```typescript
// Always validate organization access before operations
const validateOrganizationAccess = async (userId: string, orgId: string) => {
  const orgDoc = await getDoc(doc(db, 'organizations', orgId));
  return orgDoc.data()?.members[userId] || null;
};

// Use OrganizationDB class for all data operations
const orgDB = new OrganizationDB(organizationId, userId);
await orgDB.create('assets', assetId, assetData);
```

### Firestore Security Rules Pattern
```javascript
// Organization-based access control
match /organizations/{orgId}/{document=**} {
  allow read, write: if request.auth != null && 
    request.auth.uid in resource.data.members;
}
```

## 🧱 Code Organization Patterns

### Component Structure (Max 500 lines)
```typescript
// Component file structure
interface ComponentProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentProps> = ({ props }) => {
  // Hooks (auth, data, form)
  // Local state
  // Event handlers
  // Render JSX
};
```

### Custom Hooks Pattern
```typescript
// Custom hook structure
export const useDataHook = (params) => {
  const [state, setState] = useState(initialState);
  
  // Data fetching logic
  // Event handlers
  // Cleanup
  
  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    actions: { create, update, delete }
  };
};
```

### Error Handling Pattern
```typescript
// Consistent error handling
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

## 🎨 UI/UX Patterns

### shadcn/ui Integration
- Copy components to `src/components/ui/`
- Use `cn()` utility for className merging
- Maintain design system consistency with CSS variables

### Form Handling Pattern
```typescript
// React Hook Form + Zod pattern
const schema = z.object({
  field: z.string().min(1, 'Required'),
});

const form = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = async (data) => {
  // Handle form submission
};
```

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Touch-friendly interactions on mobile
- Optimized authentication flow for mobile devices

## 🔧 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/asset-management
git commit -m "feat: add asset CRUD operations"

# Bug fixes
git checkout -b fix/mobile-auth-issue
git commit -m "fix: mobile authentication redirect"
```

### Testing Strategy
- Unit tests for all hooks and utilities
- Component tests with React Testing Library
- Integration tests with Firebase emulators
- Mobile testing with device emulation

### Performance Considerations
- React.memo for expensive components
- Image optimization with Next.js Image component
- Bundle analysis for code splitting opportunities
- Firestore query optimization with indexes

## 📊 Data Models

### Core Entities
```typescript
// Organization (root entity)
Organization {
  id: string;
  name: string;
  members: Record<string, 'FULL_ACCESS' | 'LIMITED_ACCESS'>;
  settings: { aiQuotaUsed: number; aiQuotaLimit: number; currency: string };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Asset (organization-scoped)
Asset {
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

// AssetCategory (hierarchical)
AssetCategory {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  parentId?: string; // For hierarchy
  color?: string;
  icon?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// AssetSpace (hierarchical)
AssetSpace {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  parentId?: string; // For hierarchy
  location?: {
    address?: string;
    coordinates?: { lat: number; lng: number; };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Task (organization-scoped)
Task {
  id: string;
  organizationId: string;
  assetId?: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  checklist: ChecklistItem[]; // Max 20 items
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

// ChecklistItem
ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
}

// TaskCost
TaskCost {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  receipt?: string; // Firebase Storage URL
  addedAt: Timestamp;
  addedBy: string;
}

// AI Suggestion
Suggestion {
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

## 🚀 Deployment Architecture

### Environment Configuration
- Development: Local with Firebase emulators
- Staging: Vercel preview with Firebase dev project  
- Production: Vercel production with Firebase prod project

### CI/CD Pipeline
```bash
# Build validation
npm run type-check
npm run lint
npm run test
npm run build
```

## 🎯 Success Metrics

### Technical Metrics
- TypeScript strict mode with zero `any` types
- 90%+ test coverage for critical paths
- <2s page load times
- <1s navigation between views
- Mobile authentication success rate >95%

### Feature Completeness
- ✅ Multi-tenant data isolation verified
- ✅ Role-based permissions enforced
- ✅ Complete asset management with categories and spaces
- ✅ Task management with checklists and cost tracking
- ✅ AI suggestions with quota management (100 requests/month)
- ✅ Data export functionality (Excel, Calendar, CSV)
- ✅ Mobile-responsive design with device detection
- ✅ Image upload and management system
- ✅ Recurring task scheduling
- ✅ Real-time data synchronization

## 📈 Implementation Status

### Completed Features (13/14 tasks)
- ✅ **Core Foundation**: Next.js 14 + Firebase + TypeScript setup
- ✅ **Authentication**: Multi-tenant auth with mobile device detection
- ✅ **Asset Management**: Complete CRUD with categories, spaces, and images
- ✅ **Task Management**: Checklists, costs, recurring tasks, and status tracking
- ✅ **AI Integration**: Gemini API with intelligent maintenance suggestions
- ✅ **Data Export**: Excel, Calendar (ICS), and CSV export functionality
- ✅ **UI System**: shadcn/ui components with responsive design
- ✅ **Organization Management**: Multi-tenant with role-based access
- ✅ **Real-time Updates**: Live data synchronization with Firestore
- ✅ **Documentation**: Comprehensive setup and architecture docs
- ✅ **Testing Suite**: Jest + React Testing Library with Firebase emulators
- ✅ **Performance Optimization**: React.memo, lazy loading, bundle splitting
- ✅ **WhatsApp Integration**: Rich message sharing with deep links and QR codes

### Remaining Tasks (1/14 tasks)
- 🔵 **PWA Features**: Offline support and mobile optimizations

### Current System Capabilities
The asset management system is **production-ready** with all core features implemented:
- Complete multi-tenant architecture with data isolation
- Full asset lifecycle management with image support
- Advanced task management with checklist workflows
- AI-powered maintenance suggestions with quota controls
- Comprehensive data export in multiple formats
- Mobile-optimized authentication and responsive UI

This planning document should be updated whenever architectural decisions change or new patterns are established.