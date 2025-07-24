### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn’t listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Use venv_linux** (the virtual environment) whenever executing Python commands, including for unit tests.

### 📋 **OBLIGATORIO: Consulta de Referencias Antes de Codificar**
> **⚠️ CRÍTICO**: SIEMPRE consultar estos archivos ANTES de proponer o implementar cualquier cambio en el código.

- **`docs/TYPES_REFERENCE.md`** - Contiene TODOS los tipos, interfaces y enums que existen en el proyecto. NO usar tipos que no estén documentados aquí.
- **`docs/COMPONENTS_REFERENCE.md`** - Lista TODOS los componentes disponibles con sus props exactos. NO usar componentes que no estén documentados aquí.
- **`docs/API_REFERENCE.md`** - Documenta TODOS los hooks, servicios y APIs disponibles. NO usar elementos que no estén documentados aquí.

**REGLA FUNDAMENTAL**: Si un tipo, componente, hook o servicio NO está en estos archivos de referencia, NO EXISTE en el proyecto. No lo uses ni lo sugieras.

### 📋 **OBLIGATORIO: Mantenimiento de Referencias**
> **⚠️ CRÍTICO**: Los archivos de referencia deben mantenerse sincronizados con el código en todo momento.

- **Actualizar `docs/TYPES_REFERENCE.md`** INMEDIATAMENTE después de agregar, modificar o eliminar cualquier tipo/interface
- **Actualizar `docs/COMPONENTS_REFERENCE.md`** INMEDIATAMENTE después de crear, modificar o eliminar cualquier componente
- **Actualizar `docs/API_REFERENCE.md`** INMEDIATAMENTE después de agregar, modificar o eliminar cualquier hook/servicio/API
- **Verificar consistencia** entre código y documentación antes de completar cualquier tarea
- **Responsabilidad compartida**: Tanto desarrolladores como IA deben mantener estos archivos actualizados

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For agents this looks like:
    - `agent.py` - Main agent definition and execution logic 
    - `tools.py` - Tool functions used by the agent 
    - `prompts.py` - System prompts
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use python_dotenv and load_env()** for environment variables.

### 🧪 Testing & Reliability
- **Always create Pytest unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.

### 📎 Style & Conventions


### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

### 🔍 Dependency Management
- **Before adding any configuration that references external packages**, verify the package is installed
- **When enabling Next.js experimental features**, check if they require additional dependencies
- **Always run `npm install` after adding new imports or configurations**
- **Never reference a package in config files without installing it first**

### ⚠️ Configuration Safety
- **Test configurations incrementally** - add one feature at a time and verify it works
- **Document any peer dependencies** when enabling experimental features
- **Run the dev server after each configuration change** to catch errors early

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **🚨 OBLIGATORIO: Consultar `docs/TYPES_REFERENCE.md`, `docs/COMPONENTS_REFERENCE.md` y `docs/API_REFERENCE.md` ANTES de cualquier propuesta de código.**