# Referencia de Componentes Disponibles

> **⚠️ IMPORTANTE**: Este archivo contiene ÚNICAMENTE los componentes que existen realmente en el proyecto. NO usar componentes que no estén documentados aquí.
>
> **🔄 MANTENIMIENTO**: Este archivo debe actualizarse INMEDIATAMENTE después de cualquier cambio en `src/components/`. Mantener sincronización total entre código y documentación.

## 📁 Estructura de componentes
Todos los componentes están en: `src/components/`

## 🎨 UI Components (`src/components/ui/`)

### Componentes básicos disponibles
```typescript
// src/components/ui/badge.tsx
Badge

// src/components/ui/button.tsx
Button

// src/components/ui/card.tsx
Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

// src/components/ui/dialog.tsx
Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger

// src/components/ui/input.tsx
Input

// src/components/ui/label.tsx
Label

// src/components/ui/select.tsx
Select, SelectContent, SelectItem, SelectTrigger, SelectValue

// src/components/ui/sheet.tsx
Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger

// src/components/ui/textarea.tsx
Textarea

// src/components/ui/whatsapp-share.tsx
WhatsAppShare, WhatsAppQuickShare
```

## 🏗️ Asset Components (`src/components/assets/`)

### Componentes principales
```typescript
// AssetCard.tsx
export const AssetCard: React.FC<AssetCardProps>
// Props: asset, onEdit?, onDelete?, onClick?

// AssetDetailView.tsx
export const AssetDetailView: React.FC<AssetDetailViewProps>
// Props: asset, onEdit?, onDelete?, onClose?

// AssetForm.tsx
export const AssetForm: React.FC<AssetFormProps>
export const AssetFormDialog: React.FC<AssetFormDialogProps>
// Props para AssetForm: asset?, onSubmit, onCancel
// Props para AssetFormDialog: open, onOpenChange, asset?, onSubmit

// AssetList.tsx
export const AssetList: React.FC
// Sin props, usa hooks internos

// CategoryManager.tsx
export const CategoryManager: React.FC
// Sin props, maneja categorías completas
```

## ✅ Task Components (`src/components/tasks/`)

### Componentes principales
```typescript
// TaskCard.tsx
export const TaskCard: React.FC<TaskCardProps>
// Props: task, onEdit?, onDelete?, onClick?

// TaskDetailView.tsx
export const TaskDetailView: React.FC<TaskDetailViewProps>
// Props: task, onEdit?, onDelete?, onClose?

// TaskForm.tsx
export const TaskForm: React.FC<TaskFormProps>
export const TaskFormDialog: React.FC<TaskFormDialogProps>
// Props para TaskForm: task?, onSubmit, onCancel
// Props para TaskFormDialog: open, onOpenChange, task?, onSubmit

// TaskList.tsx
export const TaskList: React.FC
// Sin props, usa hooks internos
```

## 🏢 Organization Components (`src/components/organizations/`)

### Componentes principales
```typescript
// OrganizationSelector.tsx
export const OrganizationSelector: React.FC<OrganizationSelectorProps>
// Props: organizations, currentOrganization, onSelect
```

## 🔐 Auth Components (`src/components/auth/`)

### Componentes principales
```typescript
// AuthForm.tsx
export const AuthForm: React.FC<AuthFormProps>
// Props: mode: 'signin' | 'signup', onSuccess?, invitationToken?

// ProtectedRoute.tsx
export const ProtectedRoute: React.FC<ProtectedRouteProps>
// Props: children, fallback?: React.ReactNode
```

## 📍 Space Components (`src/components/spaces/`)

### Componentes principales
```typescript
// SpaceManager.tsx
export const SpaceManager: React.FC
// Sin props, maneja espacios completos con árbol jerárquico

// Componentes internos:
// - SpaceForm: formulario para crear/editar espacios
// - SpaceTreeItem: elemento del árbol de espacios
```

## 🤖 AI Components (`src/components/ai/`)

### Componentes principales
```typescript
// SuggestionCard.tsx
export const SuggestionCard: React.FC<SuggestionCardProps>
// Props: suggestion, onCreateTask?, onDismiss?

// SuggestionsList.tsx
export const SuggestionsList: React.FC<SuggestionsListProps>
// Props: assetId
```

## 🔧 Provider Components (`src/components/providers/`)

### Providers disponibles
```typescript
// OrganizationProvider.tsx
export const OrganizationProvider: React.FC<OrganizationProviderProps>
export const useOrganizationContext: () => OrganizationProviderContext
// Props: children
// Incluye manejo de mounted state para evitar errores de hidratación SSR
```

## 📱 PWA Components (`src/components/pwa/`)

### Componentes PWA
```typescript
// PWAProvider.tsx
export default function PWAProvider({ children }: { children: React.ReactNode })
// Inicializa service worker y configuración PWA

// PWAInstallButton.tsx
export default function PWAInstallButton({ 
  className?, 
  variant?, 
  size? 
}: PWAInstallButtonProps)
// Botón para instalar la PWA con detección automática de disponibilidad

// Mobile Navigation (integrado en layout)
// Hamburger menu para navegación móvil responsiva
```

## 🐛 Debug Components (`src/components/debug/`)

### Componentes de debug
```typescript
// EnvDebug.tsx
export const EnvDebug: React.FC
// Sin props, muestra variables de entorno
```

## 📋 Patrones de Props comunes

### Props típicos para Cards
```typescript
interface CardProps {
  item: Asset | Task | Organization; // El objeto principal
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}
```

### Props típicos para Forms
```typescript
interface FormProps {
  item?: Asset | Task; // Opcional para edición
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Asset | Task;
  onSubmit: (data: FormData) => void;
}
```

### Props típicos para DetailViews
```typescript
interface DetailViewProps {
  item: Asset | Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}
```

## ⚠️ Componentes que NO existen
- `Sidebar` (usar Sheet en su lugar)
- `Modal` (usar Dialog en su lugar)
- `Dropdown` (usar Select en su lugar)
- `Toast` / `Notification` (no implementado)
- `Table` (no implementado)
- `Tabs` (no implementado)
- `Accordion` (no implementado)

## 📦 Imports correctos

### UI Components
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
```

### Feature Components
```typescript
import { AssetCard } from '@/components/assets/AssetCard';
import { AssetForm, AssetFormDialog } from '@/components/assets/AssetForm';
import { AssetList } from '@/components/assets/AssetList';
import { CategoryManager } from '@/components/assets/CategoryManager';

import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm, TaskFormDialog } from '@/components/tasks/TaskForm';
import { TaskList } from '@/components/tasks/TaskList';

import { AuthForm } from '@/components/auth/AuthForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import { OrganizationSelector } from '@/components/organizations/OrganizationSelector';
import { OrganizationProvider, useOrganizationContext } from '@/components/providers/OrganizationProvider';
```

## 🎯 Notas importantes
- Todos los componentes usan TypeScript con props tipadas
- Los componentes de lista (AssetList, TaskList) no reciben props, usan hooks internos
- Los componentes de formulario tienen variantes Dialog para modales
- Los componentes Card siguen el patrón de props opcional (onEdit, onDelete, onClick)
- Usar `memo()` para componentes que renderizan listas o se actualizan frecuentemente
