# Asset Management System

A comprehensive web-based asset management system built with Next.js 14 and Firebase that enables organizations to track assets, manage maintenance tasks, and collaborate effectively with AI-powered maintenance suggestions.

## =� Features

### Multi-Organization System
- Complete tenant isolation with role-based access (FULL_ACCESS, LIMITED_ACCESS)
- Secure data separation between organizations
- Organization invitation system

### Asset Management
- Hierarchical categorization system
- Space-based organization of assets
- Image attachment support with Firebase Storage
- Advanced search and filtering

### Task Management
- Maintenance scheduling (recurring and one-time)
- Checklist support (up to 20 items per task)
- Cost tracking and reporting
- Task assignment and progress tracking
- WhatsApp sharing integration

### AI-Powered Features
- Gemini AI integration for maintenance suggestions
- Monthly quota system per organization
- Intelligent recommendations based on asset type and history

### Data Export
- Cost reports in Excel format (XLS)
- Maintenance schedules in calendar format (ICS)
- Organization-filtered data export

## =� Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Custom Hooks
- **Form Handling**: React Hook Form + Zod validation
- **AI Integration**: Google Gemini API
- **Testing**: Jest + React Testing Library
- **Authentication**: Firebase Auth with mobile device detection

## =� Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager
- Firebase project with Firestore, Storage, and Authentication enabled
- Google Gemini API key (optional, for AI features)

## =� Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd asset-management-system
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini AI Configuration (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com)

2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Google and Email/Password providers

3. **Setup Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Deploy the security rules:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage
```

4. **Configure Storage CORS** (for image uploads):
   - Follow Firebase Storage CORS setup guide
   - Allow your domain for image uploads

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## >� Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run with Firebase Emulators
```bash
# Start Firebase emulators
npm run firebase:emulators

# In another terminal, run tests
NEXT_PUBLIC_ENABLE_FIREBASE_EMULATOR=true npm test
```

## <� Project Structure

```
src/
   app/                    # Next.js 14 App Router
      layout.tsx         # Root layout with providers
      page.tsx           # Landing page
      auth/              # Authentication pages
      dashboard/         # Protected dashboard routes
   components/            # React components
      ui/                # shadcn/ui components (copy-paste)
      auth/              # Authentication components
      assets/            # Asset management components
      tasks/             # Task management components
      organizations/     # Organization components
      providers/         # Context providers
   hooks/                 # Custom React hooks
      useAuth.ts         # Authentication hook
      useOrganization.ts # Organization management
      useFirestore.ts    # Firestore data hooks
   lib/                   # Utilities and configuration
      firebase.ts        # Firebase initialization
      auth.ts            # Authentication utilities
      db.ts              # Firestore utilities
      ai.ts              # Gemini AI integration
      utils.ts           # General utilities
   types/                 # TypeScript type definitions
   __tests__/             # Jest test files
```

## =' Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks

# Testing
npm test                # Run tests
npm run test:watch      # Run tests in watch mode

# Analysis
npm run analyze         # Bundle analysis
```

## = Security Features

### Multi-Tenant Data Isolation
- Organization-based Firestore security rules
- Role-based access control (FULL_ACCESS vs LIMITED_ACCESS)
- Secure API endpoints with authentication validation

### Authentication
- Mobile device detection for optimal auth flows
- Google OAuth + Email/Password authentication
- Secure invitation system with expiring tokens

### Data Protection
- Firebase Storage CORS configuration
- Input validation with Zod schemas
- XSS protection with proper data sanitization

## =� Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Firebase Hosting
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## > Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## <� Troubleshooting

### Common Issues

**1. Firebase Authentication not working on mobile**
- The system includes mobile device detection to use `signInWithRedirect` on mobile devices
- Ensure Firebase Auth domain is properly configured

**2. Firestore permission errors**
- Check that security rules are deployed correctly
- Verify user is authenticated and belongs to the organization

**3. Image uploads failing**
- Verify Firebase Storage CORS configuration
- Check file size limits (10MB for images, 50MB for documents)

**4. TypeScript errors**
- Run `npm run type-check` to identify issues
- Ensure all imports use proper aliases (@/components, @/lib, etc.)

### Firebase Emulator Setup

For local development with Firebase emulators:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Start emulators
firebase emulators:start
```

## =� License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## =O Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Firebase](https://firebase.google.com/) for backend services
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Google Gemini](https://ai.google.dev/) for AI capabilities