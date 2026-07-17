# 📋 Git Workflow - agentes-chat

## 🏗️ Estructura de Ramas

```
main                    # Production (protegida, merge desde staging)
├── staging-backend     # Backend staging (merge desde feature/bugfix)
├── staging-frontend    # Frontend staging (merge desde feature/bugfix)
└── staging-devops      # DevOps/Infra staging (merge desde feature/bugfix)
```

---

## 🔄 Setup Inicial (Primera Vez)

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/yourorg/agentes-chat.git
cd agentes-chat
```

### 2️⃣ Ver todas las ramas (locales y remotas)
```bash
git branch -a
```

**Output esperado:**
```
* main
  remotes/origin/main
  remotes/origin/staging-backend
  remotes/origin/staging-devops
  remotes/origin/staging-frontend
```

### 3️⃣ Crear y trackear las ramas de staging localmente

**Opción A: Manual (paso a paso)**
```bash
# Traer info de todas las ramas remotas
git fetch origin

# Crear rama local y conectarla a remota
git checkout -b staging-backend origin/staging-backend
git checkout -b staging-devops origin/staging-devops
git checkout -b staging-frontend origin/staging-frontend
```

**Opción B: Automática (recomendado)**
```bash
# Script que crea todas las ramas de staging
for branch in staging-backend staging-devops staging-frontend; do
  git checkout -b $branch origin/$branch
done
```

### 4️⃣ Verificar que las ramas están sincronizadas
```bash
git branch -a
```

**Output esperado:**
```
* main
  staging-backend
  staging-devops
  staging-frontend
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/staging-backend
  remotes/origin/staging-devops
  remotes/origin/staging-frontend
```

---

## 👤 Flujo de Trabajo por Rol

### 🔧 **Backend Developer**

**1. Sincronizar staging-backend**
```bash
git checkout staging-backend
git pull origin staging-backend
```

**2. Crear rama de feature (desde staging-backend)**
```bash
git checkout -b feature/auth-jwt
# o para bugfix:
git checkout -b bugfix/jwt-expiration
```

**3. Hacer cambios, commit, push**
```bash
# Hacer cambios en archivos...

git add .
git commit -m "feat(auth): add JWT token verification"
# Seguir Conventional Commits:
# feat(modulo): descripcion
# fix(modulo): descripcion
# docs(modulo): descripcion

git push origin feature/auth-jwt
```

**4. Crear Pull Request (PR) en GitHub**
- Base branch: `staging-backend`
- Compare branch: `feature/auth-jwt`
- Esperar code review y CI/CD

**5. Después del merge, actualizar local**
```bash
git checkout staging-backend
git pull origin staging-backend
git branch -d feature/auth-jwt  # Eliminar rama local
```

---

### 🎨 **Frontend Developer**

**Exactamente igual, pero con `staging-frontend`:**

```bash
# Sincronizar
git checkout staging-frontend
git pull origin staging-frontend

# Crear feature
git checkout -b feature/chat-ui

# Commits
git add .
git commit -m "feat(chat): add message list component"
git push origin feature/chat-ui

# PR: base = staging-frontend, compare = feature/chat-ui
```

---

### ⚙️ **DevOps / Infrastructure**

**Exactamente igual, pero con `staging-devops`:**

```bash
# Sincronizar
git checkout staging-devops
git pull origin staging-devops

# Crear feature
git checkout -b feature/docker-compose

# Commits
git add .
git commit -m "feat(infra): add docker-compose for local dev"
git push origin feature/docker-compose

# PR: base = staging-devops, compare = feature/docker-compose
```

---

## 📊 Cambiar Entre Ramas

### Ver en qué rama estoy
```bash
git branch
# Output: * main (asterisco = rama actual)
```

### Cambiar de rama
```bash
# Cambiar a staging-backend
git checkout staging-backend

# O más moderno (Git 2.23+):
git switch staging-backend
```

### Cambiar y crear rama simultáneamente
```bash
git checkout -b feature/nueva-feature
# O:
git switch -c feature/nueva-feature
```

---

## 🔄 Sincronizar Cambios Remotos

### Traer cambios de la rama remota (SIN mergear)
```bash
git fetch origin staging-backend
```

### Ver diferencias antes de actualizar
```bash
git fetch origin staging-backend
git diff staging-backend origin/staging-backend
```

### Actualizar rama local con remota
```bash
git pull origin staging-backend
# Equivalente a:
# git fetch origin staging-backend
# git merge origin/staging-backend
```

### Si hay conflictos
```bash
# Ver conflictos
git status

# Editar archivos manualmente (VS Code mostrará conflictos)
# Luego:
git add .
git commit -m "Resolver merge conflicts"
git push origin staging-backend
```

---

## 📋 Comandos Cheat Sheet

```bash
# Ver estado
git status
git log --oneline -10

# Crear y cambiar rama
git checkout -b feature/nueva
git switch -c feature/nueva

# Cambiar rama
git checkout staging-backend
git switch staging-backend

# Ver todas las ramas
git branch -a

# Sincronizar
git fetch origin
git pull origin staging-backend

# Hacer commit
git add .
git commit -m "feat(modulo): descripcion"

# Subir cambios
git push origin feature/mi-feature

# Actualizar rama actual con cambios remotos
git pull

# Eliminar rama local (después de merge)
git branch -d feature/mi-feature

# Eliminar rama local forzadamente
git branch -D feature/mi-feature

# Eliminar rama remota
git push origin --delete feature/mi-feature
```

---

## 🚫 Protecciones de Rama (Setup en GitHub)

Para que Sprint 1 sea seguro, asegurar que en GitHub están configuradas:

**En cada rama (main, staging-backend, staging-frontend, staging-devops):**

1. **Require pull request reviews before merging**
   - ✅ Require at least 1 approval

2. **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - ✅ Enable GitHub Actions (tests deben pasar)

3. **Require code to pass status checks**
   - ✅ Todos los tests de CI/CD

4. **Dismiss stale pull request approvals when new commits are pushed**
   - ✅ Checkear

5. **Restrict who can push to matching branches**
   - ⚠️ Opcional: permitir solo maintainers

---

## 🎯 Flujo Diario Típico (Backend Dev)

```bash
# Mañana: Sincronizar cambios del equipo
git checkout staging-backend
git pull origin staging-backend

# Empezar nueva feature
git checkout -b feature/add-socket-events

# Trabajar...
# (editar archivos, npm run dev, etc)

# Commit cada "unidad de trabajo"
git add src/modules/chat/socket.ts
git commit -m "feat(chat): add send:message socket event"

git add src/modules/chat/socket.ts
git commit -m "feat(chat): add join:chat socket event"

# Subir al final del día (o cuando esté lista)
git push origin feature/add-socket-events

# En GitHub: crear PR, esperar review

# Cuando está aprobado, GitHub merge (o tú clickeas)

# Al día siguiente: actualizar local
git checkout staging-backend
git pull origin staging-backend
git branch -d feature/add-socket-events
```

---

## 🐛 Troubleshooting

### Error: "Your branch is ahead of 'origin/staging-backend' by X commits"

Significa que hiciste commits locales pero no los subiste:
```bash
git push origin staging-backend
```

### Error: "fatal: refusing to merge unrelated histories"

Significa que intentas mergear ramas sin historial común. Solución:
```bash
git pull origin staging-backend --allow-unrelated-histories
```

### Error: "The branch is X commits behind"

Rama local está desactualizada:
```bash
git pull origin staging-backend
```

### Error: conflicto en merge

```bash
# 1. Ver conflictos
git status

# 2. Editar archivos (VS Code muestra <<<<<<, ======, >>>>>> )
# 3. Resolver manualmente

# 4. Marcar como resuelto
git add archivo-conflictivo.ts

# 5. Continuar merge
git commit -m "Resolver conflictos de merge"
git push origin nombre-rama
```

### Limpiar ramas locales que no existen en remoto

```bash
git fetch origin --prune
git branch -vv | grep gone | awk '{print $1}' | xargs git branch -d
```

---

## 📌 Convenciones de Commit (Conventional Commits)

**Formato:**
```
<tipo>(<alcance>): <descripción corta>

<descripción más larga si es necesario>

Fixes #123
```

**Tipos:**
- `feat:` Nueva funcionalidad
- `fix:` Arreglo de bug
- `docs:` Cambios a documentación
- `style:` Cambios de formato (no código)
- `refactor:` Refactorización sin cambio funcional
- `perf:` Mejora de performance
- `test:` Agregar/actualizar tests
- `chore:` Cambios en build, deps, etc

**Ejemplos:**
```
feat(auth): add JWT token verification
fix(chat): prevent duplicate messages on reconnect
docs(readme): update setup instructions
test(socket): add tests for join:chat event
refactor(db): split schema into multiple files
```

---

## 📚 Referencias

- Git Basics: https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository
- Conventional Commits: https://www.conventionalcommits.org/
- GitHub Flow: https://guides.github.com/introduction/flow/
- Resolving Conflicts: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts

---

## ✅ Checklist de Setup

- [ ] He clonado el repositorio
- [ ] He creado las ramas locales (staging-backend, staging-frontend, staging-devops)
- [ ] Puedo cambiar entre ramas sin errores
- [ ] `git branch -a` muestra todas las ramas
- [ ] Entiendo el flujo: staging → feature/bugfix → PR → merge
- [ ] He leído las convenciones de commit
- [ ] Mi equipo tiene acceso push a las ramas staging-*
