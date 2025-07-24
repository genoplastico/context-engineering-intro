name: "Asset Management System - Complete Implementation PRP"
description: |

# Asset Management System - Complete Implementation PRP

## Goal
Build a comprehensive web-based asset management system using Next.js 14 and Firebase that enables organizations to track assets, manage maintenance tasks, and collaborate effectively. The system must support multi-tenant architecture with complete data isolation, role-based permissions, and AI-powered maintenance suggestions.

## Why
- **Business Value**: Organizations need efficient asset tracking and maintenance scheduling to reduce downtime and costs
- **User Impact**: Maintenance teams can collaborate seamlessly with task assignment, progress tracking, and intelligent suggestions
- **Integration Needs**: Future MCP server integration for AI-powered interactions with the asset management data
- **Problems Solved**: Replaces manual spreadsheets and disconnected systems with a unified, intelligent platform

## What
A full-stack web application with the following user-visible behavior:

### Core Features
- **Multi-Organization System**: Complete tenant isolation with role-based access (FULL_ACCESS, LIMITED_ACCESS)
- **Asset Management**: Hierarchical categorization, space-based organization, image attachments
- **Task System**: Maintenance scheduling (recurring/one-time), checklist support, cost tracking
- **User Collaboration**: Task assignment, progress updates, WhatsApp sharing
- **AI Suggestions**: Gemini-powered maintenance recommendations with monthly quotas
- **Data Export**: Cost reports (XLS), maintenance schedules (ICS)
- **Responsive UI**: Grid/list views, optimized performance with React.memo

### Success Criteria
- [ ] Organizations can invite users and manage permissions securely
- [ ] Assets can be created, categorized, and organized by physical spaces
- [ ] Maintenance tasks can be scheduled, assigned, and tracked through completion
- [ ] AI generates relevant maintenance suggestions based on asset type and history
- [ ] Users can export cost data and maintenance schedules
- [ ] All functionality works on mobile and desktop browsers
- [ ] System passes security audit for multi-tenant data isolation
- [ ] Performance benchmarks: <2s page loads, <1s navigation between views

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window

- url: https://nextjs.org/docs/app/guides/testing/jest
  why: Next.js 14 App Router testing setup with Jest
  critical: Built-in Jest configuration saves setup time

- url: https://firebase.google.com/codelabs/firebase-nextjs
  why: Official Firebase + Next.js integration patterns
  section: Authentication, Firestore, and hosting setup

- url: https://medium.com/@gg.code.latam/updating-firebase-authentication-in-next-js-solving-mobile-authentication-issues-2024-2025-5a01342bcc13
  why: CRITICAL mobile authentication fix for Firebase
  critical: signInWithPopup fails on mobile - requires device detection

- url: https://ui.shadcn.com/docs/installation/manual
  why: shadcn/ui manual installation (copy-paste components, not library)
  section: Component setup and Tailwind configuration

- url: https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/
  why: React Hook Form + Zod validation patterns with TypeScript
  critical: zodResolver integration and error handling

- url: https://huzaifa-saleem.medium.com/building-a-multi-tenant-organization-platform-with-next-js-the-complete-guide-89e5e620aa00
  why: Multi-tenant organization architecture with Next.js
  section: Data isolation patterns and organization structure

- url: https://firebase.google.com/docs/projects/dev-workflows/general-best-practices
  why: Firebase project structure and security rules
  critical: Multi-tenancy considerations and data privacy

- url: https://testing-library.com/docs/react-testing-library/intro/
  why: React Testing Library philosophy and best practices
  critical: Test user behavior, not implementation details

- file: C:\Users\etche\OneDrive\Documents\claude-code\proyectos\mantenimiento-ia-2\CLAUDE.md
  why: Project conventions for Python-focused projects (adapt for TypeScript)
  critical: File size limits (500 lines), testing requirements, documentation standards

- file: C:\Users\etche\OneDrive\Documents\claude-code\proyectos\mantenimiento-ia-2\use-cases\mcp-server\CLAUDE.md
  why: TypeScript development standards and testing patterns
  critical: Type safety, error handling, and development workflow patterns
```

### Current Codebase Tree
```bash
# Current state - mostly unrelated MCP server code
├── CLAUDE.md                    # Project conventions (adapt for TypeScript)
├── INITIAL.md                   # Feature specification
├── PRPs/                        # PRP templates and examples
├── use-cases/mcp-server/        # Existing TypeScript patterns (reference only)
└── README.md                    # Project documentation
```

### Desired Codebase Tree
```bash
# Target Next.js + Firebase application structure
├── .env.local                   # Firebase configuration
├── .env.example                 # Environment template
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind + shadcn/ui setup
├── package.json                 # Dependencies
├── jest.config.js               # Jest configuration
├── README.md                    # Setup instructions
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Landing page
│   │   ├── auth/                # Authentication pages
│   │   │   ├── page.tsx         # Login/register with invite support
│   │   │   └── actions.ts       # Server actions for auth
│   │   ├── dashboard/           # Protected routes
│   │   │   ├── layout.tsx       # Dashboard layout with org context
│   │   │   ├── page.tsx         # Dashboard overview
│   │   │   ├── assets/          # Asset management
│   │   │   ├── tasks/           # Task management
│   │   │   ├── spaces/          # Space/location management
│   │   │   └── settings/        # Organization settings
│   │   └── api/                 # API routes
│   │       ├── suggestions/     # AI suggestions endpoint
│   │       └── export/          # Data export endpoints
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components (copy-paste)
│   │   ├── assets/              # Asset-specific components
│   │   ├── tasks/               # Task-specific components
│   │   ├── spaces/              # Space-specific components
│   │   ├── auth/                # Authentication components
│   │   └── providers/           # Context providers
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useOrganization.ts   # Organization context hook
│   │   └── useFirestore.ts      # Firestore data hooks
│   ├── lib/                     # Utilities and configuration
│   │   ├── firebase.ts          # Firebase initialization
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── db.ts                # Firestore utilities
│   │   ├── ai.ts                # Gemini AI integration
│   │   ├── export.ts            # Data export utilities
│   │   └── utils.ts             # General utilities
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.ts              # Authentication types
│   │   ├── organization.ts      # Organization types
│   │   ├── asset.ts             # Asset types
│   │   └── task.ts              # Task types
│   └── __tests__/               # Jest test files
│       ├── components/          # Component tests
│       ├── hooks/               # Hook tests
│       ├── lib/                 # Utility tests
│       └── __mocks__/           # Firebase mocks
├── public/                      # Static assets
└── docs/                        # Project documentation
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Firebase mobile authentication issue (December 2024)
// signInWithPopup fails on mobile browsers not using Firebase Hosting
// Solution: Device detection with conditional auth flows
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
  // Use signInWithRedirect for mobile
  await signInWithRedirect(auth, provider);
} else {
  // Use signInWithPopup for desktop
  await signInWithPopup(auth, provider);
}

// CRITICAL: Next.js 14 App Router - components are Server Components by default
// Must use 'use client' directive for browser-specific code
'use client';
import { useState, useEffect } from 'react';

// CRITICAL: Firebase Firestore initialization error in tests
// Firebase instances persist between tests, causing "already started" errors
// Solution: Proper test setup with cleanup

// CRITICAL: shadcn/ui is NOT a component library
// It's a collection of copy-paste components built on Radix UI + Tailwind
// Use: npx shadcn-ui@latest add button (copies component to your project)

// CRITICAL: Multi-tenant Firebase security rules
// Default rules block all access after grace period
// Must implement organization-based security rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /organizations/{orgId}/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
  }
}

// CRITICAL: React Hook Form + Zod requires @hookform/resolvers
import { zodResolver } from '@hookform/resolvers/zod';
const form = useForm({
  resolver: zodResolver(schema) // This is required for Zod integration
});

// CRITICAL: Firebase Storage requires specific CORS configuration
// Set up CORS for image uploads from web domain

// CRITICAL: AI integration rate limiting
// Gemini API has usage quotas - implement monthly limits per organization
```

## Implementation Blueprint

### Data Models and Structure

Create type-safe data models for multi-tenant architecture:

```typescript
// Core organization structure
interface Organization {
  id: string;
  name: string;
  members: Record<string, 'FULL_ACCESS' | 'LIMITED_ACCESS'>;
  settings: {
    aiQuotaUsed: number;
    aiQuotaLimit: number;
    currency: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Asset management
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
}

// Task management with checklist support
interface Task {
  id: string;
  organizationId: string;
  assetId?: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  checklist: ChecklistItem[];
  costs: TaskCost[];
  recurring?: RecurringConfig;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
}

// AI suggestion structure
interface Suggestion {
  id: string;
  organizationId: string;
  assetId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedCost?: number;
  aiGenerated: true;
  createdAt: Timestamp;
}
```

### List of Tasks to Complete (in order)

```yaml
Task 1: Project Setup and Configuration
CREATE package.json:
  - Next.js 14 with App Router
  - Firebase SDK v10+
  - Tailwind CSS + shadcn/ui dependencies
  - React Hook Form + Zod
  - Jest + React Testing Library
  - TypeScript configuration

CREATE configuration files:
  - next.config.js (image domains for Firebase Storage)
  - tailwind.config.ts (shadcn/ui integration)
  - jest.config.js (Next.js built-in configuration)
  - .env.example (Firebase config template)

Task 2: Firebase Setup and Multi-tenant Security
CREATE src/lib/firebase.ts:
  - Initialize Firebase app with config
  - Setup Firestore with multi-tenant rules
  - Configure Firebase Storage with CORS
  - Authentication configuration

CREATE Firestore security rules:
  - Organization-based data isolation
  - Role-based read/write permissions
  - Asset and task access control

Task 3: Authentication System with Mobile Support
CREATE src/lib/auth.ts:
  - Device detection for mobile auth fix
  - signInWithPopup (desktop) vs signInWithRedirect (mobile)
  - User profile management
  - Organization invitation system

CREATE src/components/auth/:
  - Login/register forms with Zod validation
  - Invitation flow handling
  - Mobile-optimized authentication UI

Task 4: Multi-tenant Organization Management
CREATE src/hooks/useOrganization.ts:
  - Organization context and state management
  - Member management with role permissions
  - Organization switching for users

CREATE src/components/providers/OrganizationProvider.tsx:
  - React Context for organization state
  - Data isolation enforcement
  - Role-based component rendering

Task 5: Core UI System with shadcn/ui
SETUP shadcn/ui components:
  - Run: npx shadcn-ui@latest init
  - Add core components: button, form, dialog, table, card
  - Configure Tailwind with custom design tokens
  - Create base layout components

CREATE src/components/ui/:
  - Copy shadcn/ui components as needed
  - Customize for brand/design requirements
  - Ensure accessibility compliance

Task 6: Asset Management System
CREATE src/components/assets/:
  - Asset creation forms with image upload
  - Asset grid and list views with React.memo optimization
  - Hierarchical category system
  - Space-based organization

CREATE src/hooks/useAssets.ts:
  - Firestore asset CRUD operations
  - Real-time asset updates
  - Image upload to Firebase Storage
  - Asset search and filtering

Task 7: Task Management with Checklist Support
CREATE src/components/tasks/:
  - Task creation/editing forms
  - Checklist item management (max 20 items)
  - Task assignment and status tracking
  - Cost tracking per task

CREATE src/hooks/useTasks.ts:
  - Task CRUD with organization isolation
  - Recurring task scheduling
  - Task status transitions
  - Cost calculation and reporting

Task 8: AI-Powered Suggestions System
CREATE src/lib/ai.ts:
  - Gemini API integration
  - Prompt engineering for maintenance suggestions
  - Usage quota tracking per organization
  - Error handling for API failures

CREATE src/api/suggestions/route.ts:
  - Next.js API route for AI suggestions
  - Asset context analysis
  - Suggestion generation and storage
  - Rate limiting implementation

Task 9: Data Export Functionality
CREATE src/lib/export.ts:
  - XLS export for cost data
  - ICS export for maintenance schedules
  - Data aggregation and formatting
  - File generation utilities

CREATE src/api/export/route.ts:
  - Export endpoint with organization filtering
  - File generation and download
  - Export history tracking

Task 10: WhatsApp Integration
CREATE src/lib/whatsapp.ts:
  - WhatsApp sharing URL generation
  - Task detail formatting for sharing
  - Deep link handling for mobile

Task 11: Comprehensive Testing Suite
CREATE src/__tests__/:
  - Component testing with React Testing Library
  - Hook testing with proper Firebase mocks
  - Integration testing for auth flows
  - E2E testing for critical user journeys

SETUP Firebase testing environment:
  - Firestore emulator configuration
  - Auth emulator setup
  - Test data factories
  - Cleanup between tests

Task 12: Performance Optimization
IMPLEMENT performance enhancements:
  - React.memo for expensive components
  - Image optimization with Next.js Image
  - Firestore query optimization
  - Bundle analysis and code splitting

Task 13: Mobile Responsiveness and PWA
ENHANCE mobile experience:
  - Responsive design with Tailwind
  - Touch-friendly interactions
  - PWA configuration for offline support
  - Mobile-specific authentication flow

Task 14: Documentation and Deployment
CREATE documentation:
  - README with setup instructions
  - API documentation
  - User guide with screenshots
  - Deployment guide

SETUP deployment pipeline:
  - Environment configuration
  - Build optimization
  - Firebase Hosting or Vercel deployment
  - CI/CD pipeline setup
```

### Integration Points

```yaml
FIREBASE CONFIGURATION:
  - environment: ".env.local with all Firebase config variables"
  - authentication: "Firebase Auth with organization-based user management"
  - database: "Firestore with multi-tenant security rules"
  - storage: "Firebase Storage for asset images with CORS setup"
  - security: "Organization-based data isolation in all queries"

NEXT.JS APP ROUTER:
  - routing: "app/ directory with nested layouts for dashboard"
  - middleware: "Organization access control and authentication"
  - api: "Route handlers for AI suggestions and data export"
  - server-actions: "Form submissions and data mutations"

STYLING SYSTEM:
  - tailwind: "Utility-first CSS with custom design tokens"
  - components: "shadcn/ui copy-paste components with Radix primitives"
  - responsive: "Mobile-first design with proper breakpoints"
  - theming: "CSS custom properties for organization branding"

STATE MANAGEMENT:
  - context: "React Context for organization and auth state"
  - hooks: "Custom hooks for data fetching and mutations"
  - forms: "React Hook Form with Zod validation"
  - caching: "React Query or SWR for server state management"

TESTING STRATEGY:
  - unit: "Jest + React Testing Library for components and hooks"
  - integration: "Firebase emulator for database testing"
  - e2e: "Playwright or Cypress for critical user flows"
  - mocking: "Firebase SDK mocks for isolated testing"
```

## Validation Loop

### Level 1: Project Setup & Configuration
```bash
# Verify project structure and dependencies
npm install                           # Install all dependencies
npm run build                         # Ensure TypeScript compiles
npm run type-check                    # Run TypeScript type checking

# Expected: No errors, clean build output
# If errors: Check package.json dependencies and tsconfig.json
```

### Level 2: Firebase Integration & Security
```bash
# Test Firebase connection and security rules
npm run dev                           # Start development server
# Visit /api/test-firebase              # Create test endpoint

# Verify Firestore security rules:
# 1. Authenticated users can read/write their organization data
# 2. Users cannot access other organizations' data
# 3. Proper role-based permissions are enforced

# Expected: Firebase connection established, security rules active
# If failing: Check Firebase config, security rules syntax
```

### Level 3: Authentication Flow Testing
```bash
# Test authentication on both desktop and mobile
# Desktop: signInWithPopup should work
# Mobile: signInWithRedirect should work

# Test organization invitation flow:
# 1. Create invitation with FULL_ACCESS user
# 2. Accept invitation creates user with correct role
# 3. User can only access assigned organization

# Expected: Authentication works on all devices, invitations functional
# If failing: Check mobile detection logic, invitation token validation
```

### Level 4: Core Functionality Testing
```bash
# Run comprehensive test suite
npm test                              # Run all Jest tests
npm run test:watch                    # Watch mode for development

# Test asset management:
# 1. Create asset with image upload
# 2. Categorize and organize by spaces
# 3. Search and filter functionality

# Test task management:
# 1. Create task with checklist
# 2. Assign to user and track progress
# 3. Record costs and completion

# Expected: All tests pass, core features functional
# If failing: Check Firebase emulator setup, test data factories
```

### Level 5: AI Integration & Export Testing
```bash
# Test AI suggestions
# POST /api/suggestions with asset data
# Verify quota tracking and rate limiting

# Test data export
# GET /api/export/costs?format=xlsx
# GET /api/export/tasks?format=ics

# Expected: AI generates relevant suggestions, exports work correctly
# If failing: Check Gemini API key, export library configuration
```

### Level 6: Performance & Mobile Testing
```bash
# Performance testing
npm run build                         # Production build
npm run analyze                       # Bundle analyzer (if configured)

# Mobile testing with Chrome DevTools device emulation
# Test authentication flow on mobile
# Test responsive design at various breakpoints
# Test touch interactions and PWA features

# Expected: <2s page loads, <1s navigation, mobile-friendly
# If failing: Optimize images, implement code splitting, review responsive CSS
```

## Final Validation Checklist
- [ ] All tests pass: `npm test`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Firebase security rules prevent cross-organization access
- [ ] Authentication works on both desktop and mobile
- [ ] Asset management: create, categorize, upload images
- [ ] Task management: create, assign, track, complete with costs
- [ ] AI suggestions generate and respect quotas
- [ ] Data export (XLS, ICS) functions correctly
- [ ] WhatsApp sharing generates proper links
- [ ] Mobile responsive design works across devices
- [ ] Performance metrics meet requirements (<2s load, <1s navigation)
- [ ] Multi-tenant data isolation verified
- [ ] Role-based permissions enforced
- [ ] Error handling graceful with user-friendly messages

## Anti-Patterns to Avoid
- ❌ Don't use Firebase multi-tenancy in a single project (use organization-based isolation)
- ❌ Don't skip mobile authentication device detection (critical bug)
- ❌ Don't install shadcn/ui as a package (it's copy-paste components)
- ❌ Don't forget 'use client' directive for browser-specific React code
- ❌ Don't ignore Firebase Storage CORS configuration
- ❌ Don't implement AI suggestions without quota limits
- ❌ Don't skip React.memo optimization for expensive components
- ❌ Don't ignore mobile-first responsive design
- ❌ Don't commit Firebase config to repository
- ❌ Don't skip comprehensive testing for multi-tenant security

---

## Confidence Score: 8/10

This PRP provides comprehensive context for implementing a production-ready asset management system. The score is 8/10 because:

**Strengths:**
- Complete technology stack coverage with recent best practices
- Critical mobile authentication fix included
- Multi-tenant architecture properly designed
- Comprehensive testing strategy
- Performance optimization considerations
- Real-world gotchas and solutions included

**Areas for caution:**
- Complex multi-tenant Firebase setup requires careful implementation
- AI integration with quota management needs precise error handling
- Mobile authentication flow requires thorough testing across devices

The PRP includes sufficient context, validation gates, and step-by-step implementation guide for successful one-pass implementation by an AI agent with access to web search and the referenced documentation.