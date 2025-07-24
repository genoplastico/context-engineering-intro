# Actualizar Documentación de Referencias

Actualiza los archivos de referencia en `docs/` para mantenerlos sincronizados con el código actual del proyecto.

## Proceso de Actualización

### 1. **Analizar Código Actual**
- Revisar `src/types/` para identificar todos los tipos, interfaces y enums
- Revisar `src/components/` para identificar todos los componentes disponibles
- Revisar `src/hooks/` y `src/lib/` para identificar hooks, servicios y APIs

### 2. **Actualizar TYPES_REFERENCE.md**
- Verificar que todos los tipos en `src/types/` estén documentados
- Agregar nuevos tipos/interfaces que no estén listados
- Eliminar tipos que ya no existan
- Actualizar signatures y propiedades modificadas

### 3. **Actualizar COMPONENTS_REFERENCE.md**
- Verificar que todos los componentes en `src/components/` estén documentados
- Agregar nuevos componentes que no estén listados
- Eliminar componentes que ya no existan
- Actualizar props y patrones de uso

### 4. **Actualizar API_REFERENCE.md**
- Verificar que todos los hooks en `src/hooks/` estén documentados
- Verificar que todos los servicios en `src/lib/` estén documentados
- Agregar nuevos elementos que no estén listados
- Eliminar elementos que ya no existan
- Actualizar signatures y métodos

### 5. **Actualizar PLANNING.md**
- Revisar si hay cambios arquitectónicos que deban documentarse
- Actualizar patrones de diseño si se agregaron nuevos
- Documentar nuevas decisiones técnicas importantes
- Actualizar diagramas o estructuras si es necesario

### 6. **Actualizar TASK.md**
- Marcar como completadas las tareas relacionadas con los cambios
- Agregar nuevas tareas descubiertas durante la actualización
- Documentar cualquier deuda técnica identificada
- Actualizar el estado del proyecto

### 7. **Verificación Final**
- Confirmar que no hay elementos documentados que no existan en el código
- Confirmar que no hay elementos en el código que no estén documentados
- Verificar que todos los imports de ejemplo sean correctos
- Verificar que todas las rutas de archivos sean correctas
- Confirmar que PLANNING.md y TASK.md reflejan el estado actual

## ⚠️ Reglas Importantes

- **NO inventar elementos**: Solo documentar lo que existe realmente en el código
- **Mantener formato consistente**: Seguir la estructura existente de los archivos
- **Verificar imports**: Asegurar que todos los ejemplos de import sean válidos
- **Actualizar fechas**: No es necesario, pero mantener coherencia

## ✅ Resultado Esperado

Al finalizar, todos los archivos de documentación deben estar **100% sincronizados** con el código actual:
- `docs/TYPES_REFERENCE.md`
- `docs/COMPONENTS_REFERENCE.md` 
- `docs/API_REFERENCE.md`
- `PLANNING.md`
- `TASK.md`

## 🎯 Cuándo Usar Este Comando

- Después de agregar nuevos componentes, tipos o servicios
- Después de modificar interfaces o props existentes
- Después de eliminar elementos del código
- Como verificación periódica de sincronización
- Antes de crear PRPs para nuevas funcionalidades
