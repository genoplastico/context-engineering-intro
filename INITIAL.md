## FEATURE:

# Sistema de Gestión de Mantenimiento de Activos

Sistema web desarrollado con Next.js y Firebase para la gestión integral de activos y mantenimiento. Permite a las organizaciones realizar un seguimiento detallado de sus activos, programar mantenimientos y gestionar tareas relacionadas.

el sistema contara con una api bien desarrollada para en un futuro, poder interactuar con esta aplicacion a traves de un servidor  mcp (model context protocol)

## 🚀 Tecnologías Principales

- **Frontend**: Next.js 
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Estado**: React Context + Custom Hooks
- **Imágenes**: Procesamiento client-side + Firebase Storage
- **Validación**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library

## ✨ Características Principales

### 🏢 Sistema Multi-Organización
- Aislamiento completo de datos por organización
- Roles y permisos específicos por organización
- Gestión de usuarios con invitaciones

### 📦 Gestión de Activos
- Registro y seguimiento de activos
- Categorización jerárquica
- Organización por espacios físicos
- Sistema de búsqueda y filtrado avanzado
- Gestión optimizada de imágenes

# Sistema de Visualización de Ubicaciones, Activos y Tareas

## Descripción General
Este sistema permite visualizar y gestionar la jerarquía de ubicaciones (spaces) junto con sus activos y tareas asociadas. Implementa un sistema de caché eficiente para el conteo de tareas y activos, y mantiene una visualización jerárquica clara.

## Componentes Principales

### 1. SpacesTable (`src/components/spaces/SpacesTable.tsx`)
Componente principal que muestra la tabla de ubicaciones.

#### Características Principales:
- Visualización jerárquica de ubicaciones
- Contadores de activos y tareas por ubicación
- Sistema de expansión/colapso de niveles
- Badges de estado para tareas
- Modo de vista dual (activos/tareas)
- Íconos interactivos para cambio rápido de vista:
  * Ícono de activos (Box) clickeable para cambiar a vista de activos
  * Ícono de tareas (Wrench) clickeable para cambiar a vista de tareas
  * Feedback visual con hover y tooltips

# Sistema de Invitaciones - AppMantenimiento

## Descripción General
El sistema de invitaciones permite a usuarios con acceso completo (FULL_ACCESS) invitar a nuevos miembros a su organización, asignándoles roles específicos y gestionando el proceso de registro.

## Flujo de Invitación

1. **Crear Invitación**
   - Usuario FULL_ACCESS accede a Configuración > Usuarios
   - Hace clic en "Invitar Usuario"
   - Ingresa email y selecciona rol
   - Sistema genera token único
   - Se crea registro en colección `userInvites`

2. **Compartir Invitación**
   - Se genera enlace: `/auth?mode=register&invite=[TOKEN]`
   - El enlace se puede copiar y compartir

3. **Proceso de Registro**
   - Usuario invitado accede al enlace
   - Sistema valida token y estado de invitación
   - Email se pre-llena y bloquea
   - Rol y organización se asignan automáticamente

### 🔧 Sistema de Mantenimiento
- Tareas puntuales y recurrentes
- Estados: Pendiente → En progreso → Completada/Cancelada
- Prioridades: Baja, Media, Alta, Urgente
- Sistema de asignación de tareas a usuarios
- Historial completo de intervenciones
- Sistema de checklist para tareas detalladas
- Registro de costos y notas de completado

### 🤖 Sugerencias Inteligentes
- Generación automática de sugerencias de mantenimiento con IA (Gemini)
- Basado en tipo de activo e historial de mantenimiento
- Conversión directa de sugerencias a tareas
- Sistema de cuotas mensual

### 📊 Funcionalidades Avanzadas
- Múltiples vistas: Grid (como tarjetas) o  Lista
- Exportación de datos de costos por ubicacion o activo a XLS
- exportacion de tareas de manteniminento puntuales o recurrentes a formato ics 
- Compartir tareas por WhatsApp
- Sistema de notificaciones
- Optimizaciones de rendimiento con React.memo


### Estructura de Firebase


organizations/
├── {organizationId}/
│   ├── assets/              # Activos de la organización
│   │   └── {assetId}/
│   │       └── tasks/       # Tareas específicas del activo
│   ├── categories/          # Categorías de activos
│   ├── spaces/             # Espacios físicos
│   ├── tasks/              # Tareas generales
│   ├── users/              # Usuarios de la organización
│   ├── settings/           # Configuraciones
│   └── suggestions/        # Sugerencias de IA

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Rutas protegidas del panel
│   ├── auth/             # Páginas de autenticación
│   └── api/              # API Routes
├── components/            # Componentes React
│   ├── assets/           # Componentes de gestión de activos
│   ├── tasks/            # Componentes del sistema de tareas
│   ├── suggestions/      # Sistema de sugerencias de IA
│   ├── settings/         # Componentes de configuración
│   └── ui/               # Componentes de UI reutilizables
├── hooks/                # Custom hooks para lógica de negocio
├── lib/                  # Utilidades y configuración
├── types/                # Definiciones de tipos TypeScript
└── utils/                # Funciones utilitarias
```

## 🚀 Funcionalidades Destacadas

### Sistema de Checklist
- Hasta 20 items por tarea
- Seguimiento de completado
- Historial de items marcados
- Integración con compartir por WhatsApp

### Optimizaciones de Rendimiento
- Memoización con React.memo en componentes críticos
- Sistema de caché para datos frecuentes
- Carga optimizada de imágenes
- Paginación y virtualización

### Sistema de Costos
- Registro de costos por tarea completada
- Historial de costos por activo
- Soporte para múltiples monedas
- Visualización de costos totales

# Funcionalidad de Costos en Modal de Activos

## Descripción General
La funcionalidad de costos en la aplicación proporciona un sistema robusto para el seguimiento y visualización de gastos asociados a las tareas de mantenimiento de activos. El sistema está diseñado para manejar múltiples monedas y mantener un historial detallado de todos los costos incurridos.


# Componente TaskDetailDialog

## Descripción General

El componente `TaskDetailDialog` es una parte fundamental del sistema de gestión de tareas de la aplicación. Este diálogo muestra información detallada sobre una tarea seleccionada, incluyendo sus propiedades básicas y el activo asociado a la misma. El componente utiliza un sistema de paneles redimensionables para permitir al usuario ajustar la visualización según sus preferencias.


### 1. TaskCostsSummary
- Muestra un resumen consolidado de costos por activo
- Características:
  - Agrupación automática por moneda
  - Cálculo de totales en tiempo real
  - Manejo de estados de carga y error
  - Animaciones suaves para transiciones
  - Feedback visual para estados de error
- Implementación:
  - Utiliza el hook `useTaskCosts` para gestión de datos
  - Renderizado optimizado con GPU
  - Diseño responsivo y adaptable

### 2. Sistema de Costos (useTaskCosts)
- Hook personalizado para gestión de costos
- Funcionalidades:
  - Cálculo de costos totales por moneda
  - Validación de montos y monedas
  - Manejo de errores y estados de carga
  - Actualización en tiempo real


## OTHER CONSIDERATIONS:

- Include a .env.example, README with instructions for setup 
- Include the project structure in the README.

